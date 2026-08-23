import {
  useCallback,
  useEffect,
  useImperativeHandle,
  type ReactNode,
  type RefObject,
} from "react";
import { useClassNames } from "@figliolia/classnames";

import { useListboxControls, type IControlConfig } from "./useListboxControls";
import {
  Option,
  type IOption,
  type ListBoxEventCallback,
  type ListBoxItemRenderer,
} from "./Option";

import "./styles.scss";

export const Listbox = <T extends IOption>({
  id,
  ref,
  items,
  className,
  onItemClick,
  renderItem,
  focusable = true,
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

  const withFocus = useCallback(
    (cb: () => void) => {
      if (!focusable) {
        return;
      }
      return cb();
    },
    [focusable],
  );

  const onFocus = useCallback(() => {
    withFocus(() => {
      controls.keyStack.setActive(true);
      window.addEventListener("keydown", controls.onKeyDown);
      window.addEventListener("keyup", controls.onKeyDown);
    });
  }, [controls.onKeyDown, controls.onKeyUp, controls.keyStack, withFocus]);

  const onBlur = useCallback(() => {
    withFocus(() => {
      controls.keyStack.setActive(false);
      window.removeEventListener("keydown", controls.onKeyDown);
      window.removeEventListener("keyup", controls.onKeyDown);
    });
  }, [controls.onKeyDown, controls.onKeyUp, controls.keyStack, withFocus]);

  useImperativeHandle(ref, () => controls);

  const onClick = useCallback(
    (id: string, index: number) => {
      controls.onItemClick(id, index);
      onItemClick?.(id, index);
    },
    [controls.onItemClick],
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
      tabIndex={focusable ? 0 : -1}
      aria-multiselectable={multiple}
      aria-activedescendant={controls.activeDescendant}>
      {items.length ? (
        items.map((item, index) => (
          <Option
            key={`${index}-${items.length}-${typeof item === "string" ? item : item.value}`}
            item={item}
            index={index}
            onClick={onClick}
            renderItem={renderItem}
            onHover={controls.onItemHover}
            isItemFocused={controls.isItemFocused}
            isItemSelected={controls.isItemSelected}
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
  focusable?: boolean;
  onItemClick: ListBoxEventCallback;
  renderItem?: ListBoxItemRenderer<T>;
  renderEmptyState?: () => ReactNode;
  ref?: RefObject<ReturnType<typeof useListboxControls> | null>;
}

export * from "./Option";
export * from "./useListboxControls";
export * from "./useSelection";
