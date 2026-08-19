import { useCallback, useSyncExternalStore } from "react";
import type { Conduit, UnknownCacheAbstract } from "@figliolia/conduit";

import { useCacheEntry } from "./useCacheEntry";

export const useConduitStatus = <
  T extends Conduit<any, any, UnknownCacheAbstract>,
>(
  conduit: T,
  args: Parameters<T["options"]["operation"]>,
) => {
  const cacheEntry = useCacheEntry(conduit, args);

  const getState = useCallback(() => cacheEntry.getValue(), [cacheEntry]);

  const subscribe = useCallback(
    (onChange: () => void) => cacheEntry.subscribeToValue(onChange),
    [cacheEntry],
  );
  return useSyncExternalStore(subscribe, getState, getState);
};
