import { useMemo, useRef } from "react";
import type {
  UnknownCacheAbstract,
  InfiniteConduit,
  IInfiniteOperationOptions,
  CacheEntry,
  InfiniteConduitValue,
  IValueType,
} from "@figliolia/conduit";
/* oxlint-disable react/refs */

export const useCacheEntry = <
  T extends InfiniteConduit<any, UnknownCacheAbstract>,
>(
  conduit: T,
  args: IInfiniteOperationOptions<T["options"]["operation"]>,
  skip: boolean,
) => {
  type InfiniteCacheEntry = CacheEntry<
    InfiniteConduitValue<
      IValueType<T["options"]["operation"]>,
      UnknownCacheAbstract
    >,
    unknown
  >;
  const prevEntry = useRef<InfiniteCacheEntry | undefined>(undefined);
  return useMemo(() => {
    if (prevEntry.current && skip) {
      return prevEntry.current;
    }
    prevEntry.current = conduit.getCacheEntry(args) as InfiniteCacheEntry;
    return prevEntry.current;
  }, [conduit, args, skip]);
};
