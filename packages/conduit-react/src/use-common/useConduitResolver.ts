import { useEffect } from "react";
import type {
  BaseConduit,
  IExecuteOptions,
  UnknownCacheAbstract,
} from "@figliolia/conduit";

import { useSkipWhen } from "./useSkipWhen";
import type { IUseOptions } from "./types";

export const useConduitResolver = <
  T extends BaseConduit<any, any, UnknownCacheAbstract>,
  O extends IExecuteOptions<any>,
>(
  conduit: T,
  { args, cachePolicy, expires, skipWhen }: IUseOptions<O>,
) => {
  const skip = useSkipWhen(skipWhen);
  useEffect(() => {
    if (!skip) {
      void conduit.execute({ args, cachePolicy, expires });
    }
  }, [conduit, expires, cachePolicy, skip, args]);
};
