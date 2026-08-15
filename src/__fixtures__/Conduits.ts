import { vi } from "vitest";

import {
  NetworkConduit,
  type IConduit,
  type IOperation,
  type CacheGetter,
  Conduit,
} from "../Conduits";
import { Cache, type UnknownCacheAbstract } from "../Cache";

export const createSyncConduit = <
  O extends IOperation = (...args: number[]) => number[],
  D = undefined,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
>({
  cache,
  operation,
  key = ["sync"],
  defaultValue,
  ...rest
}: PartialConduitOptions<O, D, C>) => {
  return new Conduit({
    cache: cache instanceof Cache ? () => cache : cache,
    key,
    defaultValue,
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
  defaultValue,
  key = ["async"],
  ...rest
}: PartialConduitOptions<O, D, C>) => {
  return new Conduit({
    cache,
    key,
    defaultValue,
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
  cache: C,
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
  options: PartialConduitOptions<O, undefined, C>,
) => {
  return [
    [createAsyncConduit(options), "async"],
    [createSyncConduit(options), "sync"],
  ] as const;
};

export const createAsyncNetworkConduit = (cache: Cache) => {
  return new NetworkConduit({
    cache,
    key: ["async"],
    operation: vi
      .fn<(...args: number[]) => Promise<number[]>>()
      .mockImplementation(async (...args: number[]) => {
        return args;
      }),
  });
};

export const createSyncNetworkConduit = (cache: Cache) => {
  return new NetworkConduit({
    cache,
    key: ["sync"],
    operation: vi
      .fn<(...args: number[]) => number[]>()
      .mockImplementation((...args: number[]) => {
        return args;
      }),
  });
};

export const createThrowingSyncNetworkConduit = (cache: Cache) => {
  return new NetworkConduit({
    cache,
    key: ["sync"],
    operation: vi.fn<() => never>().mockImplementation(() => {
      throw new Error("Thrown Error");
    }),
  });
};

export const createThrowingAsyncNetworkConduit = (cache: Cache) => {
  return new NetworkConduit({
    cache,
    key: ["async"],
    operation: vi.fn<() => never>().mockImplementation(() => {
      throw new Error("Thrown Error");
    }),
  });
};

export const syncAndAsyncNetworkConduits = (cache: Cache) =>
  [createSyncNetworkConduit(cache), createAsyncNetworkConduit(cache)] as const;

export const throwingSyncAndAsyncNetworkConduits = (cache: Cache) =>
  [
    createThrowingSyncNetworkConduit(cache),
    createThrowingAsyncNetworkConduit(cache),
  ] as const;

type PartialConduitOptions<
  O extends IOperation = (...args: number[]) => number[],
  D = undefined,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> = Omit<Partial<IConduit<O, D, C>>, "cache"> & {
  cache: CacheGetter<C>;
};
