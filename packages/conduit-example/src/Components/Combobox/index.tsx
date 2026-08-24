import {
  useCallback,
  useId,
  useImperativeHandle,
  useMemo,
  type ChangeEvent,
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

  const { controls, isOpen } = useComboboxControls<T>(items);

  const container = useClickOutside<HTMLDivElement, false>({
    open: isOpen,
    callback: controls.close,
  });

  const onSearch = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onInputChange(controls.onSearchBoxChange(e));
    },
    [onInputChange, controls],
  );

  const inputProps = useMemo(
    () =>
      ({
        ref: controls.input,
        type: "text",
        value: inputValue,
        onChange: onSearch,
        onKeyUp: controls.onKeyUp,
        onKeyDown: controls.onKeyDown,
        placeholder,
        role: "combobox",
        autoComplete: "off",
        autoCorrect: "off",
        autoCapitalize: "off",
        spellCheck: "false",
        onClick: controls.onInputClick,
        "aria-expanded": isOpen,
        "aria-haspopup": "listbox",
        "aria-controls": listBoxId,
        "aria-autocomplete": "list",
      }) as const,
    [inputValue, isOpen, onSearch, placeholder, listBoxId, controls],
  );

  const onItemClick = useCallback(() => {
    controls.input.current?.focus?.();
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
      controls,
    }),
    [isOpen, controls, listBoxId],
  );

  return (
    <div className={classes} ref={container}>
      {inputNode}
      {renderListBox(
        <Listbox<T>
          items={items}
          focusable={false}
          multiple={multiple}
          onChange={onChange}
          ref={controls.listbox}
          containerID={listBoxId}
          renderItem={renderItem}
          onEscape={controls.close}
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

export * from "./types";
