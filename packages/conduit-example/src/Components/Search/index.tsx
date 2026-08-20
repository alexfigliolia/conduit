import {
  Fragment,
  memo,
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type SubmitEvent,
} from "react";
import type { Propless } from "@ui/Types";
import { useSearchQuery } from "@ui/State";
import { SearchIcon } from "@ui/Icons/SearchIcon";
import { GeocodingConduit } from "@ui/Conduits";
import { useConduit } from "@figliolia/conduit-react";

import { Combobox, type ComboboxInputProps } from "../Combobox";

import "./styles.scss";

export const Search = memo(function Search(_: Propless) {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const searchQuery = useSearchQuery();

  const onClick = useCallback(() => {
    input.current?.focus?.();
  }, []);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const onSubmit = useCallback((e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
  }, []);

  const { value } = useConduit(GeocodingConduit, { args: [searchQuery] });
  console.log(value);

  const renderInput = useCallback((props: ComboboxInputProps) => {
    return (
      <Fragment>
        <button onClick={onClick}>
          <SearchIcon />
        </button>
        <input ref={input} name="search" {...props} />
      </Fragment>
    );
  }, []);

  return (
    <form className="search" onSubmit={onSubmit} autoComplete="off">
      <search>
        <Combobox
          items={[
            "Apple",
            "Banana",
            "Blueberry",
            "Cherry",
            "Grape",
            "Mango",
            "Orange",
            "Strawberry",
          ]}
          placeholder="Search"
          onInputChange={onChange}
          inputValue={query}
          renderInput={renderInput}
        />
      </search>
    </form>
  );
});
