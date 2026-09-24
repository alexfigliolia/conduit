import { Fragment, useCallback, useRef } from "react";
import { useClassNames } from "@figliolia/classnames";

import type { ListBoxUIProps } from "./types";
import { Option, type IOption } from "./Option";
import { EmptyState } from "./EmptyState";
import { useListBoxContext } from "./Context";

export const ListboxUI = <T extends IOption>({
  items,
  // @ts-expect-error bug
  label,
  className,
  onItemClick,
  renderItem,
  containerID,
  keyExtractor,
  multiple = false,
  independent = true,
  renderEmptyState,
}: ListBoxUIProps<T>) => {
  const listbox = useRef<HTMLUListElement>(null);
  const { controls, state } = useListBoxContext<T>();
  const classes = useClassNames("listbox", className, {
    active: state.isActive,
  });

  const onOptionClick = useCallback((id: string, index: number) => {
    onItemClick?.(id, index);
  }, []);

  const key = useCallback(
    (item: T, index: number) => {
      if (keyExtractor) {
        return keyExtractor(item, index);
      }
      if (typeof item === "string" || typeof item === "number") {
        return `${index}-${item}`;
      }
      return `${index}-${item.value}`;
    },
    [keyExtractor],
  );

  return (
    <Fragment>
      {independent && label}
      <ul
        ref={listbox}
        role="listbox"
        id={containerID}
        className={classes}
        onKeyUp={controls.onKeyUp}
        onKeyDown={controls.onKeyDown}
        tabIndex={independent ? 0 : -1}
        aria-multiselectable={multiple}
        aria-activedescendant={state.activeDescendant}>
        {items.length ? (
          items.map((item, index) => (
            <Option
              item={item}
              index={index}
              onClick={onOptionClick}
              renderItem={renderItem}
              key={key(item, index)}
            />
          ))
        ) : (
          <EmptyState renderEmptyState={renderEmptyState} />
        )}
      </ul>
    </Fragment>
  );
};
