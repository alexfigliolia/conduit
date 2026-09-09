import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type SubmitEvent,
} from "react";
import { type IOption, type ListBoxItem } from "@ui/Components/Listbox";
import {
  Combobox,
  type ComboboxInputProps,
  type ComboboxRef,
} from "@ui/Components/Combobox";
import { useDebouncer } from "@figliolia/react-hooks";
import { ConduitStatus } from "@figliolia/conduit";
import { useClassNames } from "@figliolia/classnames";

import type { LocationOption } from "./SearchInput/types";
import { SearchInput } from "./SearchInput";
import { Container } from "./Container";

import "./styles.scss";

function SearchComponent<T extends IOption>({
  status,
  options,
  className,
  renderEmptyState,
  onSelectionChange,
  onSearchQueryChange,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredLoading = useDebouncer(setLoading, 1000);
  const combobox = useRef<ComboboxRef<T>>(null);

  const onQueryChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      onSearchQueryChange(value);
    },
    [onSearchQueryChange],
  );

  const deferredSearch = useDebouncer(onQueryChange, 300);

  const focusInput = useCallback(() => {
    combobox.current?.controls?.focusInput?.();
  }, []);

  const onSubmit = useCallback((e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
  }, []);

  const onInputChange = useCallback(
    (text: string) => {
      setQuery(text);
      deferredSearch.execute(text);
    },
    [deferredSearch.execute],
  );

  const format = useCallback((item: T) => {
    return typeof item === "string" ? item : item.value;
  }, []);

  const onSelection = useCallback(
    (items: typeof options) => {
      if (items[0]) {
        setQuery(format(items[0]));
        onSelectionChange(items[0]);
      }
    },
    [onSelectionChange, format],
  );

  const renderItem = useCallback(
    ({ item }: ListBoxItem<T>) => format(item),
    [format],
  );

  const classes = useClassNames({ loading });

  const glassWrapper = useCallback(
    (children: ReactNode, isOpen: boolean) => (
      <Container children={children} isOpen={isOpen} />
    ),
    [],
  );

  const renderInput = useCallback(
    (props: ComboboxInputProps<LocationOption>) => (
      <SearchInput {...props} focusInput={focusInput} />
    ),
    [focusInput],
  );

  useEffect(() => {
    if (status === ConduitStatus.IN_FLIGHT) {
      setLoading(true);
    } else if (status === ConduitStatus.IDOL) {
      deferredLoading.execute(false);
    }
  }, [status, options]);

  useEffect(() => {
    combobox.current?.controls?.listbox?.current?.resetFocus?.();
  }, [searchQuery]);

  const formClasses = useClassNames("search", className);

  return (
    <Fragment>
      <form className={formClasses} onSubmit={onSubmit} autoComplete="off">
        <search>
          <Combobox
            ref={combobox}
            items={options}
            placeholder="Search"
            className={classes}
            inputValue={query}
            renderInput={renderInput}
            renderItem={renderItem}
            renderListBox={glassWrapper}
            onChange={onSelection}
            onInputChange={onInputChange}
            renderEmptyState={renderEmptyState}
          />
        </search>
      </form>
    </Fragment>
  );
}

export const Search = memo(SearchComponent) as typeof SearchComponent;

export interface Props<T extends IOption> {
  options: T[];
  className?: string;
  status: ConduitStatus;
  renderEmptyState?: () => ReactNode;
  onSelectionChange: (item: T) => void;
  onSearchQueryChange: (value: string) => void;
}
