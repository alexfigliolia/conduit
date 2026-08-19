import { useCallback } from "react";
import type {
  IInfiniteOperationOptions,
  InfiniteConduit,
  IOperationOptions,
  UnknownCacheAbstract,
} from "@figliolia/conduit";

export const useConduitExecution = <
  T extends InfiniteConduit<any, UnknownCacheAbstract>,
>(
  conduit: T,
  args: IInfiniteOperationOptions<T["options"]["operation"]>,
) => {
  return useCallback(
    (options: IOperationOptions = {}) =>
      conduit.execute({ ...options, args }) as ReturnType<T["execute"]>,
    [conduit, args],
  );
};
