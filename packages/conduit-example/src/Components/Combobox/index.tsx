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
import {
  comboboxInputProps,
  type ComboboxInputProps,
  type Props,
} from "./types";
import { Input } from "./Input";
import { ComboboxContext } from "./Context";

import "./styles.scss";

const DEFAULT_INITIAL_SELECTED: number[] = [];
const DEFAULT_RENDER_INPUT = <T extends IOption>(
  props: ComboboxInputProps<T>,
) => <Input {...props} />;

const DEFAULT_LISTBOX_RENDERER = (listbox: ReactNode) => listbox;

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
      comboboxInputProps({
        inputValue,
        isOpen,
        onSearch,
        placeholder,
        listBoxId,
        controls,
      }),
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

  const contextValue = useMemo(
    () => ({ controls, isOpen, listBoxId }),
    [controls, isOpen, listBoxId],
  );

  useImperativeHandle(ref, () => contextValue, [contextValue]);

  return (
    <ComboboxContext.Provider value={contextValue}>
      <div className={classes} ref={container}>
        {inputNode}
        {renderListBox(
          <Listbox<T>
            items={items}
            independent={false}
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
    </ComboboxContext.Provider>
  );
};

export * from "./types";
export * from "./Context";
