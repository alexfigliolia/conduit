import {
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
import { SearchIcon } from "@ui/Icons/SearchIcon";
import { GeocodingConduit } from "@ui/Conduits";
import { Loader } from "@ui/Components/Loader";
import { type ListBoxItem } from "@ui/Components/Listbox";
import {
  Combobox,
  type ComboboxControls,
  type ComboboxInputProps,
} from "@ui/Components/Combobox";
import { useDebouncer } from "@figliolia/react-hooks";
import { useConduit } from "@figliolia/conduit-react";
import { ConduitStatus } from "@figliolia/conduit";
import { classnames, useClassNames } from "@figliolia/classnames";

import { GlassContainer } from "../GlassContainer";

import "./styles.scss";

export const Search = memo(function Search(_: Propless) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const controls = useRef<ComboboxControls>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredLoading = useDebouncer(setLoading, 1000);
  const deferredSearch = useDebouncer(setSearchQuery, 300);

  const onClick = useCallback(() => {
    controls.current?.input?.current?.focus?.();
  }, []);

  const onInputChange = useCallback(
    (text: string) => {
      setQuery(text);
      deferredSearch.execute(text);
    },
    [deferredSearch.execute],
  );

  const onSubmit = useCallback((e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
  }, []);

  const onSelectionChange = useCallback((items: typeof options) => {
    if (items[0]) {
      setQuery(items[0].display_name);
      return Location.set({ latitude: items[0].lat, longitude: items[0].lon });
    }
    Location.set(undefined);
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
    ({ item }: ListBoxItem<(typeof options)[number]>) => item.display_name,
    [],
  );

  useEffect(() => {
    if (status === ConduitStatus.IN_FLIGHT) {
      setLoading(true);
    } else if (status === ConduitStatus.IDOL) {
      deferredLoading.execute(false);
    }
  }, [status, options]);

  useEffect(() => {
    controls.current?.listboxControls?.current?.resetFocus?.();
  }, [searchQuery]);

  const classes = useClassNames({ loading });

  const glassWrapper = useCallback(
    (children: ReactNode, isOpen: boolean) => (
      <GlassContainer
        Tag="div"
        className={classnames("dropdown", { open: isOpen })}>
        {children}
      </GlassContainer>
    ),
    [],
  );

  const renderInput = useCallback((props: ComboboxInputProps) => {
    return (
      <GlassContainer Tag="div" className="searchbox">
        <button onClick={onClick}>
          <SearchIcon />
        </button>
        <input name="search" {...props} />
        <Loader />
      </GlassContainer>
    );
  }, []);

  return (
    <form className="search" onSubmit={onSubmit} autoComplete="off">
      <search>
        <Combobox
          ref={controls}
          items={options}
          placeholder="Search"
          className={classes}
          onInputChange={onInputChange}
          inputValue={query}
          renderInput={renderInput}
          renderItem={renderItem}
          renderListBox={glassWrapper}
          onChange={onSelectionChange}
        />
      </search>
    </form>
  );
});
