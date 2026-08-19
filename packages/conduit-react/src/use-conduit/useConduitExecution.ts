import { useCallback } from "react";
import type {
  Conduit,
  IOperationOptions,
  UnknownCacheAbstract,
} from "@figliolia/conduit";

export const useConduitExecution = <
  T extends Conduit<any, any, UnknownCacheAbstract>,
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
