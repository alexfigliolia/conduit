import { useMemo } from "react";
import type { UnknownCacheAbstract, BaseConduit } from "@figliolia/conduit";

export const useCacheEntry = <
  T extends BaseConduit<any, any, UnknownCacheAbstract>,
>(
  conduit: T,
  args: Parameters<T["options"]["operation"]>,
) => {
  return useMemo(() => conduit.getCacheEntry(args), [conduit, args]);
};
