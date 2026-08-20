import { useCallback } from "react";
import type {
  BaseConduit,
  IOperationOptions,
  UnknownCacheAbstract,
} from "@figliolia/conduit";

export const useConduitExecution = <
  T extends BaseConduit<any, any, UnknownCacheAbstract>,
>(
  conduit: T,
  args: Parameters<T["options"]["operation"]>,
) => {
  return useCallback(
    (options: IOperationOptions = {}) =>
      conduit.execute({ ...options, args }) as ReturnType<T["execute"]>,
    [conduit, args],
  );
};
