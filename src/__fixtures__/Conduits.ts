import { vi } from "vitest";

import { Conduit } from "../Conduits/Conduit";
import type { IConduit } from "../Conduits";
import { Cache } from "../Cache/Cache";
import type { CacheAbstract } from "../Cache";

export const createSyncConduit = <
  O extends (...args: any[]) => any = (...args: number[]) => number[],
  D = undefined,
  C extends CacheAbstract<any, any> = CacheAbstract<any, any>,
>({
  cache,
  operation,
  key = ["sync"],
  ...rest
}: Partial<IConduit<O, D, C>> = {}) => {
  return new Conduit({
    cache: cache && cache instanceof Cache ? () => cache : cache,
    key,
    defaultValue: undefined,
    operation:
      operation ??
      vi
        .fn<(...args: number[]) => number[]>()
        .mockImplementation((...args: number[]) => args),
    ...rest,
  });
};

export const createAsyncConduit = <
  O extends (...args: any[]) => any = (...args: number[]) => Promise<number[]>,
  D = undefined,
  C extends CacheAbstract<any, any> = CacheAbstract<any, any>,
>({
  cache,
  operation,
  key = ["async"],
  ...rest
}: Partial<IConduit<O, D, C>> = {}) => {
  return new Conduit({
    cache,
    key,
    defaultValue: undefined,
    operation:
      operation ??
      vi
        .fn<(...args: number[]) => Promise<number[]>>()
        .mockImplementation((...args: number[]) => {
          return new Promise<number[]>(resolve => {
            setTimeout(() => {
              resolve(args);
            }, 1000);
          });
        }),
    ...rest,
  });
};

export const createNonSpreadArgsConduit = <
  C extends CacheAbstract<any, any> = CacheAbstract<any, any>,
>(
  cache?: C,
  key = ["sync"],
) => {
  return new Conduit({
    cache,
    key,
    defaultValue: undefined,
    operation: vi
      .fn<(args: number[]) => number[]>()
      .mockImplementation((args: number[]) => args),
  });
};

export const syncAndAsyncConduits = <
  O extends (...args: any[]) => any = (...args: number[]) => number[],
  C extends CacheAbstract<any, any> = CacheAbstract<any, any>,
>(
  options: Pick<
    Partial<IConduit<O, undefined, C>>,
    "cache" | "cachePolicy"
  > = {},
) => {
  return [
    [createAsyncConduit(options), "async"],
    [createSyncConduit(options), "sync"],
  ] as const;
};
