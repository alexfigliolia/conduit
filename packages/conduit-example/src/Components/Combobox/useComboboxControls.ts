import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import type {
  IOption,
  ListBoxControls,
  ListBoxKeyboardEvent,
} from "@ui/Components/Listbox";

export const useComboboxControls = <T extends IOption>({
  items,
  onInputChange,
}: IComboboxControls<T>) => {
  const openOnListChange = useRef(false);
  const isInteractedWith = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const listboxControls = useRef<ListBoxControls>(null);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onInputClick = useCallback(() => {
    if (
      isInteractedWith.current ||
      (openOnListChange.current && !!items.length)
    ) {
      setIsOpen(true);
    }
  }, [items.length]);

  const onSearchBoxChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      if (!isInteractedWith.current && value.length) {
        isInteractedWith.current = true;
      }
      if (!items.length) {
        openOnListChange.current = true;
      }
      if (
        (isInteractedWith.current || openOnListChange.current) &&
        !!items.length
      ) {
        setIsOpen(true);
      }
      onInputChange(value);
    },
    [items.length, onInputChange],
  );

  const onKeyUp = useCallback((e: ListBoxKeyboardEvent) => {
    listboxControls.current?.onKeyUp?.(e);
  }, []);

  const onKeyDown = useCallback((e: ListBoxKeyboardEvent) => {
    listboxControls.current?.onKeyDown?.(e);
    if (e.key === "ArrowDown" && isInteractedWith.current) {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (items.length && openOnListChange.current && !isOpen) {
      openOnListChange.current = false;
      setIsOpen(true);
    }
  }, [isOpen, items.length]);

  return useMemo(
    () => ({
      onKeyDown,
      onKeyUp,
      onSearchBoxChange,
      onInputClick,
      close,
      input,
      isOpen,
      setIsOpen,
      isInteractedWith,
    }),
    [
      onKeyDown,
      onKeyUp,
      onSearchBoxChange,
      onInputClick,
      close,
      input,
      isOpen,
      setIsOpen,
    ],
  );
};

interface IComboboxControls<T extends IOption> {
  items: T[];
  onInputChange: (text: string) => void;
}
