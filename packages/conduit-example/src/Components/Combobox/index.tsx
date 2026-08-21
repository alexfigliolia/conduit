import {
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  type ChangeEventHandler,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from "react";
import {
  Listbox,
  type IOption,
  type ISelectionConfig,
  type ListBoxControls,
  type ListBoxItemRenderer,
  type ListBoxKeyboardEventHandler,
} from "@ui/Components/Listbox";
import { useClassNames } from "@figliolia/classnames";

import { useComboboxControls } from "./useComboboxControls";

import "./styles.scss";

const DEFAULT_INITIAL_SELECTED: number[] = [];
const DEFAULT_RENDER_INPUT = (props: ComboboxInputProps) => (
  <input {...props} />
);

export const Combobox = <T extends IOption>({
  ref,
  items,
  inputValue,
  className,
  placeholder,
  onInputChange,
  renderItem,
  onChange,
  renderEmptyState,
  multiple = false,
  renderInput = DEFAULT_RENDER_INPUT,
  initialSelected = DEFAULT_INITIAL_SELECTED,
}: Props<T>) => {
  const listBoxId = useId();

  const listboxControls = useRef<ListBoxControls>(null);
  const classes = useClassNames("combobox", className);

  const {
    onKeyDown,
    onKeyUp,
    onSearchBoxChange,
    onInputClick,
    close,
    input,
    isOpen,
    setIsOpen,
    isInteractedWith,
  } = useComboboxControls({ items, onInputChange });

  const inputProps = useMemo(
    () =>
      ({
        ref: input,
        type: "text",
        value: inputValue,
        onChange: onSearchBoxChange,
        onKeyUp,
        onKeyDown,
        placeholder,
        role: "combobox",
        autoComplete: "off",
        onClick: onInputClick,
        "aria-expanded": isOpen,
        "aria-haspopup": "listbox",
        "aria-controls": listBoxId,
        "aria-autocomplete": "list",
      }) as const,
    [
      inputValue,
      isOpen,
      onInputChange,
      placeholder,
      listBoxId,
      onKeyDown,
      onKeyUp,
      onInputClick,
    ],
  );

  const onItemClick = useCallback(() => {
    input.current?.focus?.();
  }, []);

  const inputNode = useMemo(
    () => renderInput(inputProps),
    [renderInput, inputProps],
  );

  const listboxClasses = useClassNames({ open: isOpen });

  const onClickOutside = useEffectEvent((e: MouseEvent) => {
    const node = document.getElementById(listBoxId);
    if (node !== e.target && !node?.contains?.(e.target as HTMLElement)) {
      setIsOpen(false);
    }
  });

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", onClickOutside);
    } else {
      document.removeEventListener("click", onClickOutside);
    }
    return () => {
      document.removeEventListener("click", onClickOutside);
    };
  }, [isOpen]);

  useImperativeHandle(
    ref,
    () => ({
      isOpen,
      listBoxId,
      input,
      setIsOpen,
      isInteractedWith,
      listboxControls,
    }),
    [isOpen],
  );

  return (
    <div className={classes}>
      {inputNode}
      <Listbox
        className={listboxClasses}
        id={listBoxId}
        items={items}
        onEscape={close}
        multiple={multiple}
        ref={listboxControls}
        onItemClick={onItemClick}
        initialSelected={initialSelected}
        onChange={onChange}
        renderItem={renderItem}
        renderEmptyState={renderEmptyState}
      />
    </div>
  );
};

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
