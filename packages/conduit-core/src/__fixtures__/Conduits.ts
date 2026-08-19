import { vi } from "vitest";

import type {
  IOperation,
  CacheGetter,
  IConduit,
} from "../Conduits/BaseConduit";
import {
  NetworkConduit,
  Conduit,
  InfiniteConduit,
  InfiniteNetworkConduit,
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
  return [createAsyncConduit(options), createSyncConduit(options)] as const;
};

export const createAsyncNetworkConduit = (cache: Cache) => {
  return new NetworkConduit({
    cache,
    key: ["async"],
    operation: async (...args: number[]) => {
      return args;
    },
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

export const syncAndAsyncNetworkConduits = (cache: Cache) =>
  [createSyncNetworkConduit(cache), createAsyncNetworkConduit(cache)] as const;

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
    operation: vi.fn<(...args: number[]) => never>().mockImplementation(() => {
      throw new Error("Thrown Error");
    }),
  });
};

export const throwingSyncAndAsyncNetworkConduits = (cache: Cache) =>
  [
    createThrowingSyncNetworkConduit(cache),
    createThrowingAsyncNetworkConduit(cache),
  ] as const;

export const createAsyncInfiniteConduit = (cache: Cache) => {
  return new InfiniteConduit({
    cache,
    key: ["async"],
    operation: async (options: {
      search?: string;
      paging: { cursor?: string; pageSize: number };
    }) => {
      return options;
    },
    pagingArgPaths: ["paging"],
  });
};

export const createSyncInfiniteConduit = (cache: Cache) => {
  return new InfiniteConduit({
    cache,
    key: ["sync"],
    operation: (options: {
      search?: string;
      paging: { cursor?: string; pageSize: number };
    }) => {
      return options;
    },
    pagingArgPaths: ["paging.cursor", "paging.pageSize"],
  });
};

export const syncAndAsyncInfiniteConduits = (cache: Cache) =>
  [
    createSyncInfiniteConduit(cache),
    createAsyncInfiniteConduit(cache),
  ] as const;

export const createAsyncInfiniteNetworkConduit = (cache: Cache) => {
  return new InfiniteNetworkConduit({
    cache,
    key: ["async"],
    operation: async (options: {
      search?: string;
      paging: { cursor?: string; pageSize: number };
    }) => {
      return options;
    },
    pagingArgPaths: ["paging"],
  });
};

export const createSyncInfiniteNetworkConduit = (cache: Cache) => {
  return new InfiniteNetworkConduit({
    cache,
    key: ["sync"],
    operation: (options: {
      search?: string;
      paging: { cursor?: string; pageSize: number };
    }) => {
      return options;
    },
    pagingArgPaths: ["paging.cursor", "paging.pageSize"],
  });
};

export const syncAndAsyncInfiniteNetworkConduits = (cache: Cache) =>
  [
    createSyncInfiniteNetworkConduit(cache),
    createAsyncInfiniteNetworkConduit(cache),
  ] as const;

export const createThrowingSyncInfiniteNetworkConduit = (cache: Cache) => {
  return new InfiniteNetworkConduit({
    cache,
    key: ["sync"],
    operation: vi
      .fn<
        (data: {
          search?: string;
          paging: { cursor?: string; pageSize: number };
        }) => never
      >()
      .mockImplementation(
        (_: {
          search?: string;
          paging: { cursor?: string; pageSize: number };
        }) => {
          throw new Error("Thrown Error");
        },
      ),
    pagingArgPaths: ["paging.cursor", "paging.pageSize"],
  });
};

export const createThrowingAsyncInfiniteNetworkConduit = (cache: Cache) => {
  return new InfiniteNetworkConduit({
    cache,
    key: ["async"],
    operation: vi
      .fn<
        (data: {
          search?: string;
          paging: { cursor?: string; pageSize: number };
        }) => never
      >()
      .mockImplementation(
        (_: {
          search?: string;
          paging: { cursor?: string; pageSize: number };
        }) => {
          throw new Error("Thrown Error");
        },
      ),
    pagingArgPaths: ["paging"],
  });
};

export const throwingSyncAndAsyncInfiniteNetworkConduits = (cache: Cache) =>
  [
    createThrowingSyncInfiniteNetworkConduit(cache),
    createThrowingAsyncInfiniteNetworkConduit(cache),
  ] as const;

type PartialConduitOptions<
  O extends IOperation = (...args: number[]) => number[],
  D = undefined,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> = Omit<Partial<IConduit<O, D, C>>, "cache"> & {
  cache: CacheGetter<C>;
};
