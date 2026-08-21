import { useCallback } from "react";
import type {
  BaseConduit,
  IOperationOptions,
  UnknownCacheAbstract,
} from "@figliolia/conduit";

export const useConduitRefetch = <
  T extends BaseConduit<any, any, UnknownCacheAbstract>,
>(
  conduit: T,
  args: Parameters<T["options"]["operation"]>,
) => {
  return useCallback(
    ({ cachePolicy = "no-cache", expires }: IOperationOptions = {}) =>
      conduit.execute({ cachePolicy, expires, args }) as ReturnType<
        T["execute"]
      >,
    [conduit, args],
  );
};
