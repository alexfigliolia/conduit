import {
  useCallback,
  useEffect,
  useImperativeHandle,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useClassNames } from "@figliolia/classnames";

import { useListboxControls, type IControlConfig } from "./useListboxControls";
import {
  Option,
  type IOption,
  type ListBoxItemRenderer,
  type OnListboxItemClick,
} from "./Option";

import "./styles.scss";

export const Listbox = <T extends IOption>({
  id,
  ref,
  items,
  className,
  focusable,
  onItemClick,
  renderItem,
  multiple = false,
  renderEmptyState = () => "There are no items to show",
  ...rest
}: Props<T>) => {
  const classes = useClassNames("listbox", className);
  const controls = useListboxControls({
    id,
    items,
    multiple,
    ...rest,
  });

  const onFocus = useCallback(() => {
    window.addEventListener("keydown", controls.onKeyDown);
    window.addEventListener("keyup", controls.onKeyDown);
  }, [controls.onKeyDown, controls.onKeyUp]);

  const onBlur = useCallback(() => {
    window.removeEventListener("keydown", controls.onKeyDown);
    window.removeEventListener("keyup", controls.onKeyDown);
  }, [controls.onKeyDown, controls.onKeyUp]);

  useImperativeHandle(ref, () => controls);

  const onOptionClicked = useCallback(
    (e: MouseEvent<HTMLLIElement>) => {
      controls.onItemClick(e);
      onItemClick?.(e);
    },
    [controls.onItemClick, onItemClick],
  );

  useEffect(() => {
    return () => onBlur();
  }, [onBlur]);

  return (
    <ul
      id={id}
      role="listbox"
      onBlur={onBlur}
      onFocus={onFocus}
      className={classes}
      tabIndex={focusable ? 0 : undefined}
      aria-multiselectable={multiple}
      aria-activedescendant={controls.activeDescendant}>
      {items.length ? (
        items.map((item, index) => (
          <Option
            key={`${index}-${items.length}-${typeof item === "string" ? item : item.value}`}
            item={item}
            index={index}
            {...controls}
            renderItem={renderItem}
            onItemClick={onOptionClicked}
          />
        ))
      ) : (
        <li className="empty-state">{renderEmptyState()}</li>
      )}
    </ul>
  );
};

export interface Props<T extends IOption> extends IControlConfig<T> {
  className?: string;
  ref?: RefObject<ReturnType<typeof useListboxControls> | null>;
  focusable?: boolean;
  items: T[];
  onItemClick?: OnListboxItemClick;
  renderItem?: ListBoxItemRenderer<T>;
  renderEmptyState?: () => ReactNode;
}

export * from "./Option";
export * from "./useListboxControls";
export * from "./useSelection";
