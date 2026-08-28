import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { IOption } from "@ui/Components/Listbox";
import { useController } from "@figliolia/react-hooks";

import { ComboboxControls } from "./Context";

export const useComboboxControls = <T extends IOption>(items: T[]) => {
  const controls = useController(new ComboboxControls<T>(items.length));
  controls.configure(items.length);
  const isOpen = useSyncExternalStore(controls.subscribe, controls.getState);

  useEffect(() => {
    if (items.length && controls.openOnListChange && !controls.getState()) {
      controls.openOnListChange.set(false);
      controls.set(true);
    }
  }, [controls, items.length]);

  return useMemo(() => ({ isOpen, controls }), [isOpen, controls]);
};
