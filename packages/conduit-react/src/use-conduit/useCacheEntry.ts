import { useMemo, useRef } from "react";
import type {
  UnknownCacheAbstract,
  Conduit,
  ConduitValueType,
  CacheEntry,
} from "@figliolia/conduit";
/* oxlint-disable react/refs */

export const useCacheEntry = <
  T extends Conduit<any, any, UnknownCacheAbstract>,
>(
  conduit: T,
  args: Parameters<T["options"]["operation"]>,
  skip: boolean,
) => {
  type CacheNode = CacheEntry<ConduitValueType<T>, unknown>;
  const prevEntry = useRef<CacheNode | undefined>(undefined);
  return useMemo(() => {
    if (prevEntry.current && skip) {
      return prevEntry.current;
    }
    prevEntry.current = conduit.getCacheEntry(...args) as CacheNode;
    return prevEntry.current;
  }, [conduit, args, skip]);
};
