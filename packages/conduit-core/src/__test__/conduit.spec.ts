import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Setter } from "@figliolia/galena";

import { Conduit } from "../Conduits";
import { Cache, CacheEntry, ConduitStatus } from "../Cache";
import {
  createAsyncConduit,
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
    const args = [1, 2, 3, 4];
    syncAndAsyncConduits({ cache }).forEach(async conduit => {
      it(`Conduit Status is reactive - ${conduit.options.key[0]}`, async () => {
        const onChange = vi.fn();
        const off = conduit.subscribeToStatus({ args, onChange });
        await conduit.execute({ args });
        expect(onChange).toHaveBeenCalledWith(ConduitStatus.IN_FLIGHT);
        expect(onChange).toHaveBeenCalledWith(ConduitStatus.IDOL);
        off();
      });
    });

    syncAndAsyncConduits({ cache }).forEach(conduit => {
      (["cache-only", "read-cache-with-respect-to-expiry"] as const).forEach(
        cachePolicy => {
          it(`Conduit Status does not change during cache lookups - ${cachePolicy} policy with ${conduit.options.key[0]} executor`, async () => {
            const args = [1, 2, 3, 4];
            const onChange = vi.fn();
            const off = conduit.subscribeToStatus({ args, onChange });
            // prepopulate the cache
            cache.set(conduit.options.key, args, args);
            await conduit.execute({
              args,
              cachePolicy,
            });
            expect(conduit.options.operation).not.toHaveBeenCalled();
            expect(onChange).not.toHaveBeenCalled();
            off();
          });
        },
      );
    });

    it("The 'in flight' status is used to denote pending promises", async () => {
      const args = [1, 2, 3];
      const conduit = createAsyncConduit({ cache });
      expect(conduit.getStatus(...args)).toEqual(ConduitStatus.UNINITIALIZED);
      const promise = conduit.execute({ args });
      expect(conduit.options.operation).toHaveBeenCalled();
      expect(conduit.getStatus(...args)).toEqual(ConduitStatus.IN_FLIGHT);
      await promise;
      expect(conduit.getStatus(...args)).toEqual(ConduitStatus.IDOL);
    });
  });

  describe("Cache Policies", () => {
    syncAndAsyncConduits({ cache }).forEach(async conduit => {
      it(`No Cache - ${conduit.options.key[0]}`, async () => {
        const args = [1, 2, 3, 4];
        // prepoluate the cache
        cache.set(conduit.options.key, args, [0]);
        // execute with the no cache option
        await conduit.execute({ args, cachePolicy: "no-cache" });
        // assert that the execution bypasses the cache
        expect(conduit.options.operation).toHaveBeenCalledTimes(1);
        // assert that results then populate the cache entry
        expect(
          cache.get(conduit.options.key, args)?.State?.getState?.(),
        ).toEqual(args);
      });
    });

    syncAndAsyncConduits({ cache }).forEach(conduit => {
      it(`Cache Only - Prepopulated with ${conduit.options.key[0]} executor`, async () => {
        const args = [1, 2, 3, 4];
        // prepoluate the cache
        cache.set(conduit.options.key, args, args);
        // execute with the cache-only
        await conduit.execute({ args: args, cachePolicy: "cache-only" });
        // assert that the execution only routes to the cache
        expect(conduit.options.operation).toHaveBeenCalledTimes(0);
        // assert that cached value remains
        expect(
          cache.get(conduit.options.key, args)?.State?.getState?.(),
        ).toEqual(args);
      });
    });

    syncAndAsyncConduits({ cache }).forEach(conduit => {
      it(`Cache Only - Unpopulated with ${conduit.options.key[0]} executor`, async () => {
        const args = [1, 2, 3, 4];
        // execute with the cache-only
        await conduit.execute({ args: args, cachePolicy: "cache-only" });
        // assert that the execution only routes to the cache
        expect(conduit.options.operation).toHaveBeenCalledTimes(0);
        // assert that cached value remains
        expect(
          cache.get(conduit.options.key, args)?.State?.getState?.(),
        ).toEqual(undefined);
      });
    });

    syncAndAsyncConduits({ cache }).forEach(conduit => {
      it(`Cache With Respect to Expiry - Unexpired with ${conduit.options.key[0]} executor`, async () => {
        const args = [1, 2, 3, 4];
        // prepoluate the cache
        cache.set(conduit.options.key, args, args);
        // execute with "read-cache-with-respect-to-expiry"
        await conduit.execute({
          args: args,
          cachePolicy: "read-cache-with-respect-to-expiry",
        });
        // assert that the execution only routes to the cache
        expect(conduit.options.operation).toHaveBeenCalledTimes(0);
        // assert that cached value remains
        expect(
          cache.get(conduit.options.key, args)?.State?.getState?.(),
        ).toEqual(args);
      });
    });

    syncAndAsyncConduits({ cache }).forEach(conduit => {
      it(`Cache With Respect to Expiry - Expired with ${conduit.options.key[0]} executor`, async () => {
        const args = [1, 2, 3, 4];
        // prepoluate the cache
        cache.set(conduit.options.key, args, args);
        const now = Date.now();
        // Get a reference to the cache node
        const cacheNode = cache.get(conduit.options.key, args);
        expect(cacheNode).toBeInstanceOf(CacheEntry);
        // Update the cache value to something that will not match the result of the execution
        cacheNode?.setValue?.([1, 2, 3]);
        expect(cacheNode?.getValue()).toEqual([1, 2, 3]);
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
        expect(cacheNode!.getValue()).toEqual(args);
      });
    });

    syncAndAsyncConduits({ cache }).forEach(conduit => {
      it(`Cache With Respect to Expiry - Uninitialized with ${conduit.options.key[0]} executor`, async () => {
        const args = [1, 2, 3, 4];
        // Assert the cache is empty
        expect(cache.get(conduit.options.key, args)).not.toBeDefined();
        // execute with "read-cache-with-respect-to-expiry"
        await conduit.execute({
          args: args,
          cachePolicy: "read-cache-with-respect-to-expiry",
        });
        // assert that the execution bypasses the cache
        expect(conduit.options.operation).toHaveBeenCalledTimes(1);
        // assert that cached value is updated
        expect(cache.get(conduit.options.key, args)?.getValue?.()).toEqual(
          args,
        );
      });
    });
  });

  describe("Cache Writes", () => {
    syncAndAsyncConduits({ cache }).forEach(conduit => {
      const args = [1, 2, 3, 4];
      const writer: Setter<any> =
        conduit.options.key[0] === "async"
          ? async (prev: unknown) => [prev, ...args]
          : (prev: unknown) => [prev, ...args];
      it(`Conduits can directly populate the cache - ${conduit.options.key[0]} with function setter`, async () => {
        conduit.writeCache({
          args,
          value: writer,
        });
        if (conduit.options.key[0] === "async") {
          await Promise.resolve();
        }
        expect(cache.get(conduit.options.key, args)?.getValue()).toEqual([
          undefined,
          ...args,
        ]);
      });
    });

    syncAndAsyncConduits({ cache }).forEach(conduit => {
      const args = [1, 2, 3, 4];
      it(`Conduits can directly populate the cache - ${conduit.options.key[0]} with value setter`, async () => {
        conduit.writeCache({
          args,
          value: [1, 2, 3, 4],
        });
        expect(cache.get(conduit.options.key, args)?.getValue()).toEqual([
          ...args,
        ]);
      });
    });

    syncAndAsyncConduits({ cache }).forEach(conduit => {
      it(`Conduits can evict their cache entries - ${conduit.options.key[0]}`, async () => {
        const args = [1, 2, 3, 4];
        conduit.writeCache({ args, value: args });
        expect(conduit.readCache(...args)).toEqual(args);
        await conduit.evict(...args);
        expect(conduit.readCache(...args)).toEqual(
          conduit.options.defaultValue,
        );
      });
    });
  });

  describe("Cache Reads", () => {
    syncAndAsyncConduits({ cache }).forEach(conduit => {
      it(`Conduits can read from their cache - ${conduit.options.key[0]}`, () => {
        const args = [1, 2, 3, 4];
        expect(conduit.readCache(...args)).toEqual(undefined);
        conduit.writeCache({ args, value: args });
        expect(conduit.readCache(...args)).toEqual(args);
      });
    });
  });
});
