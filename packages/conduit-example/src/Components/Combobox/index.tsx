import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ChangeEventHandler,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Listbox,
  type IListBoxOption,
  type IOption,
  type ListBoxControls,
  type ListBoxKeyboardEvent,
  type ListBoxKeyboardEventHandler,
} from "@ui/Components/Listbox";
import { useClassNames } from "@figliolia/classnames";

import "./styles.scss";

const DEFAULT_INITIAL_SELECTED: number[] = [];
const DEFAULT_RENDER_INPUT = (props: ComboboxInputProps) => (
  <input {...props} />
);

export const Combobox = <T extends IOption>({
  items,
  inputValue,
  className,
  placeholder,
  onInputChange,
  multiple = false,
  initialSelected = DEFAULT_INITIAL_SELECTED,
  renderInput = DEFAULT_RENDER_INPUT,
}: Props<T>) => {
  const listBoxId = useId();
  const isInteractedWith = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const listboxControls = useRef<ListBoxControls>(null);
  const classes = useClassNames("combobox", className);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onSearchBoxChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      isInteractedWith.current = !!e.target.value.length;
      if (isInteractedWith.current) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
      onInputChange(e);
    },
    [onInputChange],
  );

  const onKeyUp = useCallback((e: ListBoxKeyboardEvent) => {
    listboxControls.current?.onKeyUp?.(e);
  }, []);

  const onKeyDown = useCallback((e: ListBoxKeyboardEvent) => {
    listboxControls.current?.onKeyDown?.(e);
  }, []);

  const inputProps = useMemo(
    () =>
      ({
        ref: input,
        type: "search",
        value: inputValue,
        onChange: onSearchBoxChange,
        onKeyUp,
        onKeyDown,
        placeholder,
        role: "combobox",
        autoComplete: "off",
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
    ],
  );

  const onItemClick = useCallback(() => {
    input.current?.focus?.();
  }, []);

  const inputNode = useMemo(
    () => renderInput(inputProps),
    [renderInput, inputProps],
  );

  const onChange = useCallback((items: T[]) => {
    if (input.current) {
      if (typeof items[0] === "string") {
        input.current.value = (items as string[]).join(", ");
      } else {
        input.current.value = (items as IListBoxOption[])
          .map(item => item.value)
          .join(", ");
      }
    }
  }, []);

  return (
    <div className={classes}>
      {inputNode}
      <Listbox
        id={listBoxId}
        items={items}
        onEscape={close}
        multiple={multiple}
        ref={listboxControls}
        onItemClick={onItemClick}
        initialSelected={initialSelected}
        onChange={onChange}
      />
    </div>
  );
};

export interface Props<T extends IOption> {
  items: T[];
  multiple?: boolean;
  inputValue: string;
  className?: string;
  placeholder?: string;
  initialSelected?: number[];
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  renderInput?: (props: ComboboxInputProps) => ReactNode;
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
