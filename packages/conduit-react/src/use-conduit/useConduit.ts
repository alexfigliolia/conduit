import { useMemo } from "react";
import type {
  UnknownCacheAbstract,
  Conduit,
  IExecuteOptions,
} from "@figliolia/conduit";

import { useConduitStatus, useConduitValue } from "../use-common";

import { useConduitExecution } from "./useConduitExecution";
import { useCacheEntry } from "./useCacheEntry";

export const useConduit = <T extends Conduit<any, any, UnknownCacheAbstract>>(
  conduit: T,
  options: IExecuteOptions<Parameters<T["options"]["operation"]>>,
) => {
  const cacheEntry = useCacheEntry(conduit, options.args);
  const value = useConduitValue(cacheEntry);
  const status = useConduitStatus(cacheEntry);
  const fetch = useConduitExecution(conduit, options.args);

  void conduit.execute(options);

  return useMemo(() => ({ value, status, fetch }), [value, status, fetch]);
};
