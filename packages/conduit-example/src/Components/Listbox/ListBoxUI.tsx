import { useCallback, useRef } from "react";
import { useClassNames } from "@figliolia/classnames";

import type { ListBoxUIProps } from "./types";
import { Option, type IOption } from "./Option";
import { EmptyState } from "./EmptyState";
import { useListBoxContext } from "./Context";

export const ListboxUI = <T extends IOption>({
  items,
  className,
  onItemClick,
  renderItem,
  containerID,
  focusable = true,
  multiple = false,
  renderEmptyState,
}: ListBoxUIProps<T>) => {
  const listbox = useRef<HTMLUListElement>(null);
  const { controls, state } = useListBoxContext<T>();
  const classes = useClassNames("listbox", className, {
    active: state.isActive,
  });

  const onOptionClick = useCallback((id: string, index: number) => {
    listbox.current?.focus?.();
    onItemClick?.(id, index);
  }, []);

  return (
    <ul
      ref={listbox}
      role="listbox"
      id={containerID}
      className={classes}
      onKeyUp={controls.onKeyUp}
      onKeyDown={controls.onKeyDown}
      tabIndex={focusable ? 0 : -1}
      aria-multiselectable={multiple}
      aria-activedescendant={state.activeDescendant}>
      {items.length ? (
        items.map((item, index) => (
          <Option
            item={item}
            index={index}
            onClick={onOptionClick}
            renderItem={renderItem}
            key={`${index}-${items.length}-${typeof item === "string" ? item : item.value}`}
          />
        ))
      ) : (
        <EmptyState renderEmptyState={renderEmptyState} />
      )}
    </ul>
  );
};
