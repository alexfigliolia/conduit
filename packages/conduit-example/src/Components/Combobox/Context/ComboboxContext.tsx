import { createContext, use } from "react";
import type { IOption } from "@ui/Components/Listbox";

import type { IComboboxContext } from "./types";
import { ComboboxControls } from "./ComboboxControls";

export const ComboboxContext = createContext<IComboboxContext<any>>({
  isOpen: false,
  listBoxId: "",
  controls: new ComboboxControls(0),
});

export const useCombobox = <T extends IOption>() => {
  return use(ComboboxContext) as IComboboxContext<T>;
};
