import type { MouseEvent, ReactNode } from "react";

export interface ListboxEvents {
  focusItem: ListBoxEventCallback;
  unfocusItem: ListBoxEventCallback;
  onItemClick: OnListboxItemClick;
}

export interface Props<T extends IOption> extends ListboxEvents {
  item: T;
  index: number;
  isItemFocused: ListBoxOptionQuery;
  isItemSelected: ListBoxOptionQuery;
  renderItem?: ListBoxItemRenderer<T>;
}

export type ListBoxOptionQuery = (id: string) => boolean;

export type IListBoxOption = { value: string };

export type IOption = string | IListBoxOption;

export type ListBoxEventCallback = (id: string, index: number) => void;

export type ListBoxItemRenderer<T extends IOption> = (
  item: ListBoxItem<T>,
) => ReactNode;

export interface ListBoxItem<T extends IOption> {
  item: T;
  id: string;
  index: number;
  focused: boolean;
  selected: boolean;
}

export type OnListboxItemClick = (e: MouseEvent<HTMLLIElement>) => void;

export const LIST_BOX_OPTION_CLASS = "list-box-option";
