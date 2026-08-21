import { useEffect, useMemo } from "react";
import type {
  UnknownCacheAbstract,
  IInfiniteExecuteOptions,
  InfiniteConduit,
} from "@figliolia/conduit";

import { useConduitStatus, useConduitValue } from "../use-common";

import { useConduitExecution } from "./useConduitExecution";
import { useCacheEntry } from "./useCacheEntry";

export const useInfiniteConduit = <
  T extends InfiniteConduit<any, UnknownCacheAbstract>,
>(
  conduit: T,
  options: IInfiniteExecuteOptions<T["options"]["operation"]>,
) => {
  const { args, expires, cachePolicy } = options;
  const cacheEntry = useCacheEntry(conduit, args);
  const value = useConduitValue(cacheEntry);
  const status = useConduitStatus(cacheEntry);
  const fetch = useConduitExecution(conduit, args);

  useEffect(() => {
    void conduit.execute({ args, cachePolicy, expires });
  }, [conduit, cachePolicy, expires, args]);

  return useMemo(() => ({ value, status, fetch }), [value, status, fetch]);
};
