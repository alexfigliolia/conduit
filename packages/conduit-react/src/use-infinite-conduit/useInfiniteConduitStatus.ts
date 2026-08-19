import { useCallback, useSyncExternalStore } from "react";
import type {
  IInfiniteOperationOptions,
  InfiniteConduit,
  UnknownCacheAbstract,
} from "@figliolia/conduit";

import { useCacheEntry } from "../use-conduit";

export const useInfiniteConduitStatus = <
  T extends InfiniteConduit<any, UnknownCacheAbstract>,
>(
  conduit: T,
  args: IInfiniteOperationOptions<T["options"]["operation"]>,
) => {
  const cacheEntry = useCacheEntry(conduit, [args] as Parameters<
    T["options"]["operation"]
  >);

  const getState = useCallback(() => cacheEntry.getStatus(), [cacheEntry]);

  const subscribe = useCallback(
    (onChange: () => void) => cacheEntry.subscribeToStatus(onChange),
    [cacheEntry],
  );

  return useSyncExternalStore(subscribe, getState, getState);
};
