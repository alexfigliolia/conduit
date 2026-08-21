import { useCallback } from "react";
import type {
  IInfiniteOperationOptions,
  InfiniteConduit,
  IOperationOptions,
  UnknownCacheAbstract,
} from "@figliolia/conduit";

export const useConduitRefetch = <
  T extends InfiniteConduit<any, UnknownCacheAbstract>,
>(
  conduit: T,
  args: IInfiniteOperationOptions<T["options"]["operation"]>,
) => {
  return useCallback(
    ({ cachePolicy = "no-cache", expires }: IOperationOptions = {}) =>
      conduit.execute({ cachePolicy, expires, args }) as ReturnType<
        T["execute"]
      >,
    [conduit, args],
  );
};
