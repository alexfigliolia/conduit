import { useMemo } from "react";
import type {
  UnknownCacheAbstract,
  IInfiniteExecuteOptions,
  InfiniteConduit,
} from "@figliolia/conduit";

import type { IUseOptions } from "../use-common";
import {
  useConduitResolver,
  useConduitStatus,
  useConduitValue,
} from "../use-common";

import { useConduitRefetch } from "./useConduitRefetch";
import { useCacheEntry } from "./useCacheEntry";

export const useInfiniteConduit = <
  T extends InfiniteConduit<any, UnknownCacheAbstract>,
>(
  conduit: T,
  options: IUseOptions<IInfiniteExecuteOptions<T["options"]["operation"]>>,
) => {
  useConduitResolver(conduit, options);
  const cacheEntry = useCacheEntry(conduit, options.args);
  const value = useConduitValue(cacheEntry);
  const status = useConduitStatus(cacheEntry);
  const refetch = useConduitRefetch(conduit, options.args);

  return useMemo(() => ({ value, status, refetch }), [value, status, refetch]);
};
