import { vi } from "vitest";

import { Conduit } from "../Conduits/Conduit";
import type { IConduit, IOperation } from "../Conduits";
import { Cache, type UnknownCacheAbstract } from "../Cache";

export const createSyncConduit = <
  O extends IOperation = (...args: number[]) => number[],
  D = undefined,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
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
  O extends IOperation = (...args: number[]) => Promise<number[]>,
  D = undefined,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
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
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
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
  O extends IOperation = (...args: number[]) => number[],
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
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
