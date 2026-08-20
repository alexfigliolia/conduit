import { useCallback, useSyncExternalStore } from "react";
import type { CacheEntry } from "@figliolia/conduit";

export const useConduitValue = <T extends CacheEntry<any, any>>(
  cacheEntry: T,
) => {
  const getState = useCallback(() => {
    return cacheEntry.getValue();
  }, [cacheEntry]);

  const subscribe = useCallback(
    (onChange: () => void) => cacheEntry.subscribeToValue(onChange),
    [cacheEntry],
  );
  return useSyncExternalStore(subscribe, getState, getState) as ReturnType<
    T["getValue"]
  >;
};
