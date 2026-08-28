import { memo, useId } from "react";
import { SearchIcon } from "@ui/UIIcons/SearchIcon";
import { ScreenReaderOnly } from "@ui/Components/ScreenReaderOnly";
import { Loader } from "@ui/Components/Loader";
import { GlassContainer } from "@ui/Components/GlassContainer";

import type { Props } from "./types";

import "./styles.scss";

export const SearchInput = memo(({ focusInput, ...inputProps }: Props) => {
  const inputID = useId();
  return (
    <GlassContainer Tag="div" className="searchbox">
      <button onClick={focusInput} onFocus={focusInput}>
        <SearchIcon />
      </button>
      <ScreenReaderOnly Tag="label" htmlFor={inputID}>
        Search for a location to view the weather forecast
      </ScreenReaderOnly>
      <input id={inputID} name="search" {...inputProps} />
      <Loader />
    </GlassContainer>
  );
});
