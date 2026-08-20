import {
  useCallback,
  useEffect,
  useImperativeHandle,
  type MouseEvent,
  type RefObject,
} from "react";
import { useClassNames } from "@figliolia/classnames";

import { useListboxControls, type IControlConfig } from "./useListboxControls";
import { Option, type IOption, type OnListboxItemClick } from "./Option";

import "./styles.scss";

export const Listbox = <T extends IOption>({
  id,
  ref,
  items,
  onChange,
  onEscape,
  className,
  focusable,
  onItemClick,
  multiple = false,
  initialSelected = [],
}: Props<T>) => {
  const classes = useClassNames("list-box", className);
  const controls = useListboxControls({
    id,
    items,
    onChange,
    multiple,
    onEscape,
    initialSelected,
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
      {items.map((item, index) => (
        <Option
          key={typeof item === "string" ? item : item.value}
          item={item}
          index={index}
          {...controls}
          onItemClick={onOptionClicked}
        />
      ))}
    </ul>
  );
};

export interface Props<T extends IOption> extends IControlConfig<T> {
  className?: string;
  ref?: RefObject<ReturnType<typeof useListboxControls> | null>;
  focusable?: boolean;
  items: T[];
  onItemClick?: OnListboxItemClick;
}

export * from "./Option";
export * from "./useListboxControls";
