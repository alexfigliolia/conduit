import {
  useCallback,
  useId,
  useImperativeHandle,
  useMemo,
  type ReactNode,
} from "react";
import { Listbox, type IOption } from "@ui/Components/Listbox";
import { useClickOutside } from "@figliolia/react-hooks";
import { useClassNames } from "@figliolia/classnames";

import { useComboboxControls } from "./useComboboxControls";
import type { ComboboxInputProps, Props } from "./types";

import "./styles.scss";

const DEFAULT_INITIAL_SELECTED: number[] = [];
const DEFAULT_RENDER_INPUT = (props: ComboboxInputProps) => (
  <input {...props} />
);

const DEFAULT_LISTBOX_RENDERER = (children: ReactNode) => children;

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
  renderListBox = DEFAULT_LISTBOX_RENDERER,
  initialSelected = DEFAULT_INITIAL_SELECTED,
}: Props<T>) => {
  const listBoxId = useId();
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
    listboxControls,
  } = useComboboxControls({ items, onInputChange });

  const container = useClickOutside<HTMLDivElement, false>({
    open: isOpen,
    callback: close,
  });

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
        autoCorrect: "off",
        autoCapitalize: "off",
        spellCheck: "false",
        onClick: onInputClick,
        "aria-expanded": isOpen,
        "aria-haspopup": "listbox",
        "aria-controls": listBoxId,
        "aria-autocomplete": "list",
      }) as const,
    [
      input,
      inputValue,
      isOpen,
      onInputChange,
      placeholder,
      listBoxId,
      onKeyDown,
      onKeyUp,
      onInputClick,
      onSearchBoxChange,
    ],
  );

  const onItemClick = useCallback(() => {
    input.current?.focus?.();
  }, []);

  const inputNode = useMemo(
    () => renderInput(inputProps),
    [renderInput, inputProps],
  );

  const containerClass = useClassNames({ open: isOpen });

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
    <div className={classes} ref={container}>
      {inputNode}
      {renderListBox(
        <Listbox
          id={listBoxId}
          items={items}
          onEscape={close}
          focusable={false}
          multiple={multiple}
          onChange={onChange}
          ref={listboxControls}
          renderItem={renderItem}
          onItemClick={onItemClick}
          className={containerClass}
          initialSelected={initialSelected}
          renderEmptyState={renderEmptyState}
        />,
        isOpen,
      )}
    </div>
  );
};
