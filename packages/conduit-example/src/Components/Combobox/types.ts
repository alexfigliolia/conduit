import type { ChangeEventHandler, ReactNode, RefObject } from "react";

import type {
  IOption,
  ListBoxItemRenderer,
  ListBoxProviderProps,
} from "../Listbox";

import type { ComboboxControls } from "./Context";

export interface Props<T extends IOption> extends Omit<
  ListBoxProviderProps<T>,
  "containerID" | "ref"
> {
  inputValue: string;
  className?: string;
  placeholder?: string;
  onInputChange: (text: string) => void;
  renderInput?: (props: ComboboxInputProps<T>) => ReactNode;
  renderItem?: ListBoxItemRenderer<T>;
  renderEmptyState?: () => ReactNode;
  ref?: RefObject<ComboboxRef<T> | null>;
  renderListBox?: (children: ReactNode, isOpen: boolean) => ReactNode;
}

export type ComboboxInputProps<T extends IOption> = ReturnType<
  typeof comboboxInputProps<T>
>;

export interface ComboboxRef<T extends IOption> {
  isOpen: boolean;
  listBoxId: string;
  controls: ComboboxControls<T>;
}

export const COMBO_BOX_STATIC_PROPS = {
  type: "text",
  role: "combobox",
  autoComplete: "off",
  autoCorrect: "off",
  autoCapitalize: "off",
  spellCheck: false,
  "aria-haspopup": "listbox",
  "aria-autocomplete": "list",
} as const;

export interface IComboboxInputProps<T extends IOption> {
  inputValue: string;
  isOpen: boolean;
  placeholder?: string;
  onSearch: ChangeEventHandler<HTMLInputElement>;
  listBoxId: string;
  controls: ComboboxControls<T>;
}

export function comboboxInputProps<T extends IOption>({
  controls,
  inputValue,
  onSearch,
  placeholder,
  isOpen,
  listBoxId,
}: IComboboxInputProps<T>) {
  return {
    ...COMBO_BOX_STATIC_PROPS,
    ref: controls.input,
    value: inputValue,
    onChange: onSearch,
    onKeyUp: controls.onKeyUp,
    onKeyDown: controls.onKeyDown,
    placeholder,
    onClick: controls.onInputClick,
    "aria-expanded": isOpen,
    "aria-controls": listBoxId,
  } as const;
}
