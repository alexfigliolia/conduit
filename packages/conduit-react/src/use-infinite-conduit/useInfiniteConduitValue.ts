import { useCallback, useSyncExternalStore } from "react";
import type {
  IInfiniteOperationOptions,
  InfiniteConduit,
  UnknownCacheAbstract,
} from "@figliolia/conduit";

import { useCacheEntry } from "../use-conduit/useCacheEntry";

export const useInfiniteConduitValue = <
  T extends InfiniteConduit<any, UnknownCacheAbstract>,
>(
  conduit: T,
  args: IInfiniteOperationOptions<T["options"]["operation"]>,
) => {
  const cacheEntry = useCacheEntry(conduit, [args] as Parameters<
    T["options"]["operation"]
  >);
  const getState = useCallback(() => cacheEntry.getValue(), [cacheEntry]);

  const subscribe = useCallback(
    (onChange: () => void) => cacheEntry.subscribeToValue(onChange),
    [cacheEntry],
  );
  return useSyncExternalStore(subscribe, getState, getState) as ReturnType<
    T["readCache"]
  >;
};
