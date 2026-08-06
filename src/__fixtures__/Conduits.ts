import { vi } from "vitest";

import { Conduit } from "../Conduits/Conduit";
import type { Cache } from "../Cache/Cache";

export const createSyncConduit = (cache?: Cache, key = "sync") => {
  return new Conduit({
    cache,
    key,
    defaultValue: undefined,
    operation: vi
      .fn<(...args: number[]) => number[]>()
      .mockImplementation((...args: number[]) => args),
  });
};

export const createAsyncConduit = (cache?: Cache, key = "async") => {
  return new Conduit({
    cache,
    key,
    defaultValue: undefined,
    operation: vi
      .fn<(...args: number[]) => Promise<number[]>>()
      .mockImplementation((...args: number[]) => {
        return new Promise<number[]>(resolve => {
          setTimeout(() => {
            resolve(args);
          }, 1000);
        });
      }),
  });
};

export const createNonSpreadArgsConduit = (cache?: Cache, key = "sync") => {
  return new Conduit({
    cache,
    key,
    defaultValue: undefined,
    operation: vi
      .fn<(args: number[]) => number[]>()
      .mockImplementation((args: number[]) => args),
  });
};
