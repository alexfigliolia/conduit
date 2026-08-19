import { useMemo } from "react";
import type {
  UnknownCacheAbstract,
  IInfiniteExecuteOptions,
  InfiniteConduit,
} from "@figliolia/conduit";

import { useInfiniteConduitValue } from "./useInfiniteConduitValue";
import { useInfiniteConduitStatus } from "./useInfiniteConduitStatus";
import { useConduitExecution } from "./useInfiniteConduitExecution";

export const useInfiniteConduit = <
  T extends InfiniteConduit<any, UnknownCacheAbstract>,
>(
  conduit: T,
  options: IInfiniteExecuteOptions<T["options"]["operation"]>,
) => {
  void conduit.execute(options);
  const value = useInfiniteConduitValue(conduit, options.args);
  const status = useInfiniteConduitStatus(conduit, options.args);
  const fetch = useConduitExecution(conduit, options.args);
  return useMemo(() => ({ value, status, fetch }), [value, status, fetch]);
};
