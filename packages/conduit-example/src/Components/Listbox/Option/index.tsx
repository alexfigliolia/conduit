import { useCallback, useId, useMemo } from "react";

import {
  LIST_BOX_OPTION_CLASS,
  type IOption,
  type ListBoxItem,
  type Props,
} from "./types";

import "./styles.scss";

export const Option = <T extends IOption>({
  item,
  index,
  onHover,
  onClick,
  isItemFocused,
  isItemSelected,
  renderItem = ({ item }: ListBoxItem<T>) =>
    typeof item === "string" ? item : item.value,
}: Props<T>) => {
  const id = useId();

  const focused = useMemo(() => isItemFocused(id), [id, isItemFocused]);
  const selected = useMemo(() => isItemSelected(id), [id, isItemSelected]);

  const itemState = useMemo(
    () => ({ id, item, index, focused, selected }),
    [id, item, index, focused, selected],
  );

  const renderedNode = useMemo(
    () => renderItem(itemState),
    [renderItem, itemState],
  );

  const onItemHover = useCallback(() => {
    onHover(id, index);
  }, [id, index, onHover]);

  const onItemClick = useCallback(() => {
    onClick(id, index);
  }, [id, index, onClick]);

  return (
    <li
      id={id}
      role="option"
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
