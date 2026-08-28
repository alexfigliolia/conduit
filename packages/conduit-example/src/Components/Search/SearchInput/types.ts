import type { ComboboxInputProps } from "@ui/Components/Combobox";

export interface LocationOption {
  value: string;
  display_name: string;
  lat: number;
  lon: number;
}

export interface Props extends ComboboxInputProps<LocationOption> {
  focusInput: () => void;
}
