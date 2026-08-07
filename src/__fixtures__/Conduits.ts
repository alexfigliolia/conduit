import { vi } from "vitest";

import { Conduit } from "../Conduits/Conduit";
import type { IConduit } from "../Conduits";
import { Cache } from "../Cache/Cache";

export const createSyncConduit = <
  O extends (...args: any[]) => any = (...args: number[]) => number[],
>({
  cache,
  operation,
  key = ["sync"],
  ...rest
}: Partial<IConduit<O, undefined>> = {}) => {
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
>({
  cache,
  operation,
  key = ["async"],
  ...rest
}: Partial<IConduit<O, undefined>> = {}) => {
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

export const createNonSpreadArgsConduit = (cache?: Cache, key = ["sync"]) => {
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
>(
  options: Pick<Partial<IConduit<O, undefined>>, "cache" | "cachePolicy"> = {},
) => {
  return [
    [createAsyncConduit(options), "async"],
    [createSyncConduit(options), "sync"],
  ] as const;
};
