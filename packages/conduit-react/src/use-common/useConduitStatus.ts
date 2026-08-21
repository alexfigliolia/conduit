import { useCallback, useSyncExternalStore } from "react";
import type { CacheEntry } from "@figliolia/conduit";

export const useConduitStatus = <T extends CacheEntry<any, any>>(
  cacheEntry: T,
) => {
  const getState = useCallback(() => {
    return cacheEntry.getStatus();
  }, [cacheEntry]);

  const subscribe = useCallback(
    (onChange: () => void) => cacheEntry.subscribeToStatus(onChange),
    [cacheEntry],
  );
  return useSyncExternalStore(subscribe, getState, getState);
};
