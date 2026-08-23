import type {
  ChangeEventHandler,
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
} from "react";

import type {
  IOption,
  ISelectionConfig,
  ListBoxControls,
  ListBoxItemRenderer,
  ListBoxKeyboardEventHandler,
} from "../Listbox";

export interface Props<T extends IOption> extends Omit<
  ISelectionConfig<T>,
  "id"
> {
  inputValue: string;
  className?: string;
  placeholder?: string;
  onInputChange: (text: string) => void;
  renderInput?: (props: ComboboxInputProps) => ReactNode;
  renderItem?: ListBoxItemRenderer<T>;
  renderEmptyState?: () => ReactNode;
  ref?: RefObject<ComboboxControls | null>;
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

export interface ComboboxControls {
  isOpen: boolean;
  listBoxId: string;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  input: RefObject<HTMLInputElement | null>;
  isInteractedWith: RefObject<boolean>;
  listboxControls: RefObject<ListBoxControls | null>;
}
