import type { ChangeEventHandler, ReactNode, RefObject } from "react";

import type {
  IOption,
  ListBoxItemRenderer,
  ListBoxKeyboardEventHandler,
  ListBoxProviderProps,
} from "../Listbox";

import type { ComboboxControls } from "./ComboboxControls";

export interface Props<T extends IOption> extends Omit<
  ListBoxProviderProps<T>,
  "containerID" | "ref"
> {
  inputValue: string;
  className?: string;
  placeholder?: string;
  onInputChange: (text: string) => void;
  renderInput?: (props: ComboboxInputProps) => ReactNode;
  renderItem?: ListBoxItemRenderer<T>;
  renderEmptyState?: () => ReactNode;
  ref?: RefObject<ComboboxRef<T> | null>;
  renderListBox?: (children: ReactNode, isOpen: boolean) => ReactNode;
}

export interface ComboboxInputProps {
  type: string;
  value: string;
  ref: RefObject<HTMLInputElement | null>;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onKeyUp: ListBoxKeyboardEventHandler;
  onKeyDown: ListBoxKeyboardEventHandler;
  placeholder: string | undefined;
  role: string;
  "aria-expanded": boolean;
  "aria-haspopup": "listbox";
  "aria-controls": string;
  "aria-autocomplete": "list";
}

export interface ComboboxRef<T extends IOption> {
  isOpen: boolean;
  listBoxId: string;
  controls: ComboboxControls<T>;
}
