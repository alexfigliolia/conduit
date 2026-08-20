import { useMemo } from "react";
import type { UnknownCacheAbstract, Conduit } from "@figliolia/conduit";

export const useCacheEntry = <
  T extends Conduit<any, any, UnknownCacheAbstract>,
>(
  conduit: T,
  args: Parameters<T["options"]["operation"]>,
) => {
  return useMemo(() => conduit.getCacheEntry(args), [conduit, args]);
};
