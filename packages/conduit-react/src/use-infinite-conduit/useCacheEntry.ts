import { useMemo } from "react";
import type {
  UnknownCacheAbstract,
  InfiniteConduit,
  IInfiniteOperationOptions,
} from "@figliolia/conduit";

export const useCacheEntry = <
  T extends InfiniteConduit<any, UnknownCacheAbstract>,
>(
  conduit: T,
  args: IInfiniteOperationOptions<T["options"]["operation"]>,
) => {
  return useMemo(() => conduit.getCacheEntry(args), [conduit, args]);
};
