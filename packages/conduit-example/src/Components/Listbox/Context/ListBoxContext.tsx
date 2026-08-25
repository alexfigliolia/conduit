import {
  createContext,
  use,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useMemo,
  useSyncExternalStore,
  type PropsWithChildren,
} from "react";
import { useController } from "@figliolia/react-hooks";

import type { IOption } from "../Option";

import type { ListBoxContextValue, ListBoxProviderProps } from "./types";
import { ListBoxKeyboardControls } from "./ListBoxKeyboardControls";

const DEFAULT_STATE = new ListBoxKeyboardControls({
  containerID: "-1",
  items: [],
});

export const ListBoxContext = createContext<ListBoxContextValue<any>>({
  controls: DEFAULT_STATE,
  state: DEFAULT_STATE.getState(),
});

export const ListBoxProvider = <T extends IOption>({
  ref,
  children,
  onChange,
  initialSelected = [],
  ...options
}: PropsWithChildren<ListBoxProviderProps<T>>) => {
  const controls = useController(new ListBoxKeyboardControls(options));
  controls.configure(options);

  useImperativeHandle(ref, () => controls, [controls]);

  const state = useSyncExternalStore(controls.subscribe, controls.getState);

  const contextValue = useMemo(() => ({ controls, state }), [controls, state]);

  const emitInitialItems = useEffectEvent(() => {
    const items = controls.enableInitiallySelectedOptions(initialSelected);
    if (items.length) {
      onChange?.(items);
    }
  });

  const emitSelectedItems = useEffectEvent(() => {
    onChange?.(controls.emitSelectedOptions());
  });

  useEffect(() => {
    emitInitialItems();
  }, []);

  useEffect(() => {
    emitSelectedItems();
  }, [state.selectedItems]);

  useEffect(() => {
    return () => {
      controls.destroy(options.multiple);
    };
  }, [options.multiple, controls]);

  return (
    <ListBoxContext.Provider value={contextValue}>
      {children}
    </ListBoxContext.Provider>
  );
};

export const useListBoxContext = <T extends IOption>() => {
  return use(ListBoxContext) as ListBoxContextValue<T>;
};
