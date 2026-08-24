import { useCallback, useId, useMemo } from "react";

import { useListBoxContext } from "../Context";

import {
  LIST_BOX_OPTION_CLASS,
  type IOption,
  type ListBoxItem,
  type OptionProps,
} from "./types";

import "./styles.scss";

export const Option = <T extends IOption>({
  item,
  index,
  onClick,
  renderItem = ({ item }: ListBoxItem<T>) =>
    typeof item === "string" ? item : item.value,
}: OptionProps<T>) => {
  const id = useId();
  const { controls, state } = useListBoxContext<T>();

  const focused = useMemo(
    () => state.focusedItems.has(id),
    [id, state.focusedItems],
  );
  const selected = useMemo(
    () => state.selectedItems.has(id),
    [id, state.selectedItems],
  );

  const itemState = useMemo(
    () => ({ id, item, index, focused, selected }),
    [id, item, index, focused, selected],
  );

  const renderedNode = useMemo(
    () => renderItem(itemState),
    [renderItem, itemState],
  );

  const onItemClick = useCallback(() => {
    controls.onItemClick(id, index);
    onClick?.(id, index);
  }, [id, index, onClick, controls]);

  const onItemHover = useCallback(() => {
    controls.onItemHover(id, index);
  }, [id, index, controls]);

  return (
    <li
      id={id}
      role="option"
      tabIndex={-1}
      onClick={onItemClick}
      aria-posinset={index}
      data-focused={focused}
      aria-selected={selected}
      onMouseEnter={onItemHover}
      className={LIST_BOX_OPTION_CLASS}>
      {renderedNode}
    </li>
  );
};

export * from "./types";
