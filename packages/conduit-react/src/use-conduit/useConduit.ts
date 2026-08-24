import { useMemo } from "react";
import type {
  UnknownCacheAbstract,
  Conduit,
  IExecuteOptions,
} from "@figliolia/conduit";

import type { IUseOptions } from "../use-common";
import {
  useConduitResolver,
  useConduitStatus,
  useConduitValue,
  useResolvedValue,
} from "../use-common";

import { useConduitRefetch } from "./useConduitRefetch";
import { useCacheEntry } from "./useCacheEntry";

export const useConduit = <T extends Conduit<any, any, UnknownCacheAbstract>>(
  conduit: T,
  options: IUseOptions<IExecuteOptions<Parameters<T["options"]["operation"]>>>,
) => {
  useConduitResolver(conduit, options);
  const cacheEntry = useCacheEntry(conduit, options.args);
  const state = useConduitValue(cacheEntry);
  const status = useConduitStatus(cacheEntry);
  const refetch = useConduitRefetch(conduit, options.args);
  const value = useResolvedValue(state, status);

  return useMemo(() => ({ value, status, refetch }), [value, status, refetch]);
};
