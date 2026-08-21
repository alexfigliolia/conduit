import { useMemo } from "react";
import type {
  UnknownCacheAbstract,
  InfiniteConduit,
  IInfiniteOperationOptions,
  CacheEntry,
  InfiniteConduitValue,
  ConduitValueType,
} from "@figliolia/conduit";

export const useCacheEntry = <
  T extends InfiniteConduit<any, UnknownCacheAbstract>,
>(
  conduit: T,
  args: IInfiniteOperationOptions<T["options"]["operation"]>,
) => {
  return useMemo(
    () =>
      conduit.getCacheEntry(args) as CacheEntry<
        InfiniteConduitValue<ConduitValueType<T>>,
        unknown
      >,
    [conduit, args],
  );
};
