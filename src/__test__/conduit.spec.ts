import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Setter } from "@figliolia/galena";

import { Conduit } from "../Conduits/Conduit";
import { ConduitStatus } from "../Conduits";
import { CacheEntry } from "../Cache/CacheEntry";
import { Cache } from "../Cache/Cache";
import {
  createAsyncConduit,
  createSyncConduit,
  syncAndAsyncConduits,
} from "../__fixtures__/Conduits";

const cache = new Cache();

describe("Conduits", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setTimerTickMode("nextTimerAsync");
    cache.reset();
  });

  describe("Conduit Status", () => {
    it("Conduit Status is reactive", async () => {
      const args = [1, 2, 3, 4];
      syncAndAsyncConduits({ cache }).forEach(async ([conduit]) => {
        const onStatus = vi.fn();
        const off = conduit
          .getCache()
          ?.subscribeToStatus?.([conduit.options.key, args], [], onStatus);
        await conduit.execute({ args });
        expect(onStatus).toHaveBeenCalledWith(ConduitStatus.IN_FLIGHT);
        expect(onStatus).toHaveBeenCalledWith(ConduitStatus.IDOL);
        off?.();
      });
    });

    syncAndAsyncConduits({ cache }).forEach(([conduit, type]) => {
      (["cache-only", "read-cache-with-respect-to-expiry"] as const).forEach(
        cachePolicy => {
          it(`Conduit Status does not change during cache lookups - ${cachePolicy} policy with ${type} executor`, async () => {
            const args = [1, 2, 3, 4];
            const onStatus = vi.fn();
            const off = conduit
              .getCache()
              ?.subscribeToStatus?.([conduit.options.key, args], [], onStatus);
            // prepopulate the cache
            cache.set([conduit.options.key, args], args);
            await conduit.execute({
              args,
              cachePolicy,
            });
            expect(conduit.options.operation).not.toHaveBeenCalled();
            expect(onStatus).not.toHaveBeenCalled();
            off?.();
          });
        },
      );
    });
  });

  describe("Cache Policies", () => {
    syncAndAsyncConduits({ cache }).forEach(async ([conduit, type]) => {
      it(`No Cache - ${type}`, async () => {
        const args = [1, 2, 3, 4];
        // prepoluate the cache
        cache.set([conduit.options.key, args], [0]);
        // execute with the no cache option
        await conduit.execute({ args, cachePolicy: "no-cache" });
        // assert that the execution bypasses the cache
        expect(conduit.options.operation).toHaveBeenCalledTimes(1);
        // assert that results then populate the cache entry
        expect(
          cache.get([conduit.options.key, args])?.State?.getState?.(),
        ).toEqual(args);
      });
    });

    syncAndAsyncConduits({ cache }).forEach(([conduit, type]) => {
      it(`Cache Only - Prepopulated with ${type} executor`, async () => {
        const args = [1, 2, 3, 4];
        // prepoluate the cache
        cache.set([conduit.options.key, args], args);
        // execute with the cache-only
        await conduit.execute({ args: args, cachePolicy: "cache-only" });
        // assert that the execution only routes to the cache
        expect(conduit.options.operation).toHaveBeenCalledTimes(0);
        // assert that cached value remains
        expect(
          cache.get([conduit.options.key, args])?.State?.getState?.(),
        ).toEqual(args);
      });
    });

    syncAndAsyncConduits({ cache }).forEach(([conduit, type]) => {
      it(`Cache Only - Unpopulated with ${type} executor`, async () => {
        const args = [1, 2, 3, 4];
        // execute with the cache-only
        await conduit.execute({ args: args, cachePolicy: "cache-only" });
        // assert that the execution only routes to the cache
        expect(conduit.options.operation).toHaveBeenCalledTimes(0);
        // assert that cached value remains
        expect(
          cache.get([conduit.options.key, args])?.State?.getState?.(),
        ).toEqual(undefined);
      });
    });

    syncAndAsyncConduits().forEach(([conduit, type]) => {
      it(`Cache Only conduits should throw when a cache is not specified - ${type}`, () => {
        const args = [1, 2, 3, 4];
        // execute with the cache-only
        expect(() => {
          void conduit.execute({ args: args, cachePolicy: "cache-only" });
        }).toThrow();
        // // assert that the execution only routes to the cache
        // expect(conduit.options.operation).toHaveBeenCalledTimes(0);
        // // assert that cached value remains
        // expect(
        //   cache.get([conduit.options.key, args])?.State?.getState?.(),
        // ).toEqual(undefined);
      });
    });

    syncAndAsyncConduits({ cache }).forEach(([conduit, type]) => {
      it(`Cache With Respect to Expiry - Unexpired with ${type} executor`, async () => {
        const args = [1, 2, 3, 4];
        // prepoluate the cache
        cache.set([conduit.options.key, args], args);
        // execute with "read-cache-with-respect-to-expiry"
        await conduit.execute({
          args: args,
          cachePolicy: "read-cache-with-respect-to-expiry",
        });
        // assert that the execution only routes to the cache
        expect(conduit.options.operation).toHaveBeenCalledTimes(0);
        // assert that cached value remains
        expect(
          cache.get([conduit.options.key, args])?.State?.getState?.(),
        ).toEqual(args);
      });
    });

    syncAndAsyncConduits({ cache }).forEach(([conduit, type]) => {
      it(`Cache With Respect to Expiry - Expired with ${type} executor`, async () => {
        const args = [1, 2, 3, 4];
        // prepoluate the cache
        cache.set([conduit.options.key, args], args);
        const now = Date.now();
        // Get a reference to the cache node
        const cacheNode = cache.get([conduit.options.key, args]);
        expect(cacheNode).toBeInstanceOf(CacheEntry);
        // Update the cache value to something that will not match the result of the execution
        cacheNode?.writeValue?.([1, 2, 3]);
        expect(cacheNode?.readValue()).toEqual([1, 2, 3]);
        // expire the cache entry
        cacheNode!.updatedAt = now - Conduit.DEFAULT_LIFE_TIME - 1;
        // execute with "read-cache-with-respect-to-expiry"
        await conduit.execute({
          args: args,
          cachePolicy: "read-cache-with-respect-to-expiry",
        });
        // assert that the execution bypasses the cache
        expect(conduit.options.operation).toHaveBeenCalledTimes(1);
        // assert that cached value is updated
        expect(cacheNode!.readValue()).toEqual(args);
      });
    });

    syncAndAsyncConduits({ cache }).forEach(([conduit, type]) => {
      it(`Cache With Respect to Expiry - Uninitialized with ${type} executor`, async () => {
        const args = [1, 2, 3, 4];
        // Assert the cache is empty
        expect(cache.get([conduit.options.key, args])).not.toBeDefined();
        // execute with "read-cache-with-respect-to-expiry"
        await conduit.execute({
          args: args,
          cachePolicy: "read-cache-with-respect-to-expiry",
        });
        // assert that the execution bypasses the cache
        expect(conduit.options.operation).toHaveBeenCalledTimes(1);
        // assert that cached value is updated
        expect(cache.get([conduit.options.key, args])?.readValue?.()).toEqual(
          args,
        );
      });
    });
  });

  describe("No Cache In Conduit Scope", () => {
    syncAndAsyncConduits().forEach(([conduit, type]) => {
      it(`It switches to the 'no-cache' policy when no cachePolicy is specified - ${type}`, () => {
        expect(conduit.options.cachePolicy).toEqual("no-cache");
        (["read-cache-with-respect-to-expiry", "cache-only"] as const).forEach(
          cachePolicy => {
            expect(() => {
              void conduit.execute({
                args: [],
                cachePolicy,
              });
            }).toThrow();
          },
        );
      });
    });

    syncAndAsyncConduits().forEach(([conduit, type]) => {
      it(`Conduits throw when execute is called with a cache policy other than no-cache - ${type}`, () => {
        (["read-cache-with-respect-to-expiry", "cache-only"] as const).forEach(
          cachePolicy => {
            expect(() => {
              void conduit.execute({
                args: [],
                cachePolicy,
              });
            }).toThrow();
            expect(conduit.options.operation).not.toHaveBeenCalled();
          },
        );
      });
    });

    (
      [
        [createSyncConduit, "sync"],
        [createAsyncConduit, "async"],
      ] as const
    ).forEach(([conduitCreator, type]) => {
      it(`Conduits throw when spawning with an explicit cache policy other than no-cache - ${type}`, () => {
        (["read-cache-with-respect-to-expiry", "cache-only"] as const).forEach(
          cachePolicy => {
            expect(() => {
              conduitCreator({ cachePolicy });
            }).toThrow();
          },
        );
      });
    });
  });

  describe("Cache Writes", () => {
    syncAndAsyncConduits({ cache }).forEach(([conduit, type]) => {
      const args = [1, 2, 3, 4];
      const writer: Setter<any> =
        type === "async"
          ? async (prev: unknown) => [prev, ...args]
          : (prev: unknown) => [prev, ...args];
      it(`Conduits can directly populate the cache - ${type} with function setter`, async () => {
        conduit.write({
          args,
          value: writer,
        });
        if (type === "async") {
          await Promise.resolve();
        }
        expect(cache.get([conduit.options.key, args])?.readValue()).toEqual([
          undefined,
          ...args,
        ]);
      });
    });

    syncAndAsyncConduits({ cache }).forEach(([conduit, type]) => {
      const args = [1, 2, 3, 4];
      it(`Conduits can directly populate the cache - ${type} with value setter`, async () => {
        conduit.write({
          args,
          value: [1, 2, 3, 4],
        });
        expect(cache.get([conduit.options.key, args])?.readValue()).toEqual([
          ...args,
        ]);
      });
    });

    syncAndAsyncConduits().forEach(([conduit, type]) => {
      it(`Conduits should throw when attempting to write to an unspecified cache - ${type}`, () => {
        const args = [1, 2, 3, 4];
        expect(() => {
          expect(conduit.write({ args, value: args })).toEqual(undefined);
        }).toThrow();
      });
    });
  });

  describe("Cache Reads", () => {
    syncAndAsyncConduits({ cache }).forEach(([conduit, type]) => {
      it(`Conduits can write to their cache - ${type}`, () => {
        const args = [1, 2, 3, 4];
        expect(conduit.read(...args)).toEqual(undefined);
        expect(conduit.write({ args, value: args })).toEqual(undefined);
        expect(conduit.read(...args)).toEqual(args);
      });
    });

    syncAndAsyncConduits({}).forEach(([conduit, type]) => {
      it(`Conduits should throw when attempting to read to an unspecified cache - ${type}`, () => {
        const args = [1, 2, 3, 4];
        expect(() => {
          expect(conduit.read(...args)).toEqual(undefined);
        }).toThrow();
      });
    });
  });
});
