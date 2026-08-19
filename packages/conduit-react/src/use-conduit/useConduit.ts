import { useMemo } from "react";
import type {
  UnknownCacheAbstract,
  Conduit,
  IExecuteOptions,
} from "@figliolia/conduit";

import { useConduitValue } from "./useConduitValue";
import { useConduitStatus } from "./useConduitStatus";
import { useConduitExecution } from "./useConduitExecution";

export const useConduit = <T extends Conduit<any, any, UnknownCacheAbstract>>(
  conduit: T,
  options: IExecuteOptions<Parameters<T["options"]["operation"]>>,
) => {
  const value = useConduitValue(conduit, options.args);
  const status = useConduitStatus(conduit, options.args);
  const fetch = useConduitExecution(conduit, options.args);

  void conduit.execute(options);

  return useMemo(() => ({ value, status, fetch }), [value, status, fetch]);
};
