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
  focusItem,
  onItemClick,
  unfocusItem,
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

  const onFocusItem = useCallback(() => {
    focusItem(id, index);
  }, [id, index, focusItem]);

  const onUnfocusItem = useCallback(() => {
    unfocusItem(id, index);
  }, [id, index, unfocusItem]);

  return (
    <li
      id={id}
      role="option"
      aria-selected={selected}
      data-focused={focused}
      onClick={onItemClick}
      onMouseEnter={onFocusItem}
      onMouseLeave={onUnfocusItem}
      className={LIST_BOX_OPTION_CLASS}>
      {renderedNode}
    </li>
  );
};

export * from "./types";
