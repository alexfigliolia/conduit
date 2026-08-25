import { Fragment } from "react/jsx-runtime";
import { useId } from "react";

import { ScreenReaderOnly } from "../ScreenReaderOnly";
import type { IOption } from "../Listbox";

import type { ComboboxInputProps } from "./types";

export const Input = <T extends IOption>(props: ComboboxInputProps<T>) => {
  const inputID = useId();
  return (
    <Fragment>
      <ScreenReaderOnly htmlFor={inputID} Tag="label">
        {props.placeholder ?? "Type to search for options"}
      </ScreenReaderOnly>
      <input id={inputID} {...props} />
    </Fragment>
  );
};
