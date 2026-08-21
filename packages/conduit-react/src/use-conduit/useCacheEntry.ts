import { useMemo } from "react";
import type {
  UnknownCacheAbstract,
  Conduit,
  CacheEntry,
  ConduitValueType,
} from "@figliolia/conduit";

export const useCacheEntry = <
  T extends Conduit<any, any, UnknownCacheAbstract>,
>(
  conduit: T,
  args: Parameters<T["options"]["operation"]>,
) => {
  return useMemo(
    () =>
      conduit.getCacheEntry(...args) as CacheEntry<
        ConduitValueType<T>,
        unknown
      >,
    [conduit, args],
  );
};
