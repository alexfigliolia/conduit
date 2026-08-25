import type { IOption } from "@ui/Components/Listbox";

import type { ComboboxControls } from "./ComboboxControls";

export interface IComboboxContext<T extends IOption> {
  isOpen: boolean;
  listBoxId: string;
  controls: ComboboxControls<T>;
}
