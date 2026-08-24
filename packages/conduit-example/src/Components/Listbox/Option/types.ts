import type { ReactNode } from "react";

export interface OptionProps<T extends IOption> {
  item: T;
  index: number;
  renderItem?: ListBoxItemRenderer<T>;
  onClick?: ListBoxEventCallback;
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

export const LIST_BOX_OPTION_CLASS = "listbox-option";
