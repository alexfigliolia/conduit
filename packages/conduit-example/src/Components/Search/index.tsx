import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type SubmitEvent,
} from "react";
import type { Propless } from "@ui/Types";
import { Location } from "@ui/State";
import { GeocodingConduit } from "@ui/Conduits";
import { type ListBoxItem } from "@ui/Components/Listbox";
import {
  Combobox,
  type ComboboxInputProps,
  type ComboboxRef,
} from "@ui/Components/Combobox";
import { useDebouncer } from "@figliolia/react-hooks";
import { useConduit } from "@figliolia/conduit-react";
import { ConduitStatus } from "@figliolia/conduit";
import { useClassNames } from "@figliolia/classnames";

import type { LocationOption } from "./SearchInput/types";
import { SearchInput } from "./SearchInput";
import { Container } from "./Container";

import "./styles.scss";

export const Search = memo(function Search(_: Propless) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredLoading = useDebouncer(setLoading, 1000);
  const deferredSearch = useDebouncer(setSearchQuery, 300);
  const combobox = useRef<ComboboxRef<(typeof options)[number]>>(null);

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

  const onSelectionChange = useCallback((items: typeof options) => {
    if (items[0]) {
      setQuery(items[0].display_name);
      return Location.set({
        latitude: items[0].lat,
        longitude: items[0].lon,
      });
    }
  }, []);

  const { value, status } = useConduit(GeocodingConduit, {
    args: [searchQuery],
    skipWhen: !searchQuery.length,
  });

  const options = useMemo(
    () =>
      (value.data ?? []).map(item => ({ ...item, value: item.display_name })),
    [value],
  );

  const renderItem = useCallback(
    ({ item }: ListBoxItem<LocationOption>) => item.display_name,
    [],
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

  return (
    <Fragment>
      <form className="search" onSubmit={onSubmit} autoComplete="off">
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
            onChange={onSelectionChange}
            onInputChange={onInputChange}
          />
        </search>
      </form>
    </Fragment>
  );
});
