import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CachePolicy } from "../types";
import { ConduitStatus } from "../types";
import { Conduit } from "../Conduit";
import { CacheEntry } from "../CacheEntry";
import { Cache } from "../Cache";
import {
  createAsyncConduit,
  createSyncConduit,
} from "../__fixtures__/Conduits";

const cache = new Cache();

describe("Conduits", () => {
  beforeEach(async () => {
    cache.reset();
  });

  describe("Conduit Status", () => {
    it("Conduit Status is reactive", async () => {
      const args = [1, 2, 3, 4];
      [createAsyncConduit(cache), createSyncConduit(cache)].forEach(
        async conduit => {
          const onStatus = vi.fn();
          const off = conduit
            .getCache()
            ?.subscribeToStatus?.([conduit.options.key, args], [], onStatus);
          await conduit.execute({ args });
          expect(onStatus).toHaveBeenCalledWith(ConduitStatus.IN_FLIGHT);
          expect(onStatus).toHaveBeenCalledWith(ConduitStatus.IDOL);
          off?.();
        },
      );
    });

    it("Conduit Status does not change during cache lookups", () => {
      const args = [1, 2, 3, 4];

      (["cache-only", "read-cache-with-respect-to-expiry"] as const).forEach(
        cachePolicy => {
          [createAsyncConduit(cache), createSyncConduit(cache)].forEach(
            async conduit => {
              const onStatus = vi.fn();
              const off = conduit
                .getCache()
                ?.subscribeToStatus?.(
                  [conduit.options.key, args],
                  [],
                  onStatus,
                );
              // prepopulate the cache
              cache.set([conduit.options.key, args], args);
              await conduit.execute({
                args,
                cachePolicy,
              });
              expect(conduit.options.operation).not.toHaveBeenCalled();
              expect(onStatus).not.toHaveBeenCalled();
              off?.();
            },
          );
        },
      );
    });
  });

  describe("Cache Policies", () => {
    it("No Cache", () => {
      const args = [1, 2, 3, 4];
      [createAsyncConduit(cache), createSyncConduit(cache)].forEach(
        async conduit => {
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
        },
      );
    });

    it("Cache Only - Prepopulated", () => {
      const args = [1, 2, 3, 4];
      [createAsyncConduit(cache), createSyncConduit(cache)].forEach(
        async conduit => {
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
        },
      );
    });

    it("Cache Only - Unpopulated", () => {
      const args = [1, 2, 3, 4];
      [createAsyncConduit(cache), createSyncConduit(cache)].forEach(
        async conduit => {
          // execute with the cache-only
          await conduit.execute({ args: args, cachePolicy: "cache-only" });
          // assert that the execution only routes to the cache
          expect(conduit.options.operation).toHaveBeenCalledTimes(0);
          // assert that cached value remains
          expect(
            cache.get([conduit.options.key, args])?.State?.getState?.(),
          ).toEqual(undefined);
        },
      );
    });

    it("Cache With Respect to Expiry - Unexpired", () => {
      const args = [1, 2, 3, 4];
      [createAsyncConduit(cache), createSyncConduit(cache)].forEach(
        async conduit => {
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
        },
      );
    });

    it("Cache With Respect to Expiry - Expired", () => {
      const args = [1, 2, 3, 4];
      [createAsyncConduit(cache), createSyncConduit(cache)].forEach(
        async conduit => {
          // prepoluate the cache
          cache.set([conduit.options.key, args], args);
          const now = Date.now();
          // Get a reference to the cache node
          const cacheNode = cache.get([conduit.options.key, args]);
          expect(cacheNode).toBeInstanceOf(CacheEntry);
          // Update the cache value to something that will not match the result of the execution
          cacheNode?.write?.([1, 2, 3]);
          expect(cacheNode?.State?.getState?.()).toEqual([1, 2, 3]);
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
          expect(cacheNode!.State?.getState?.()).toEqual(args);
        },
      );
    });

    it("Cache With Respect to Expiry - Uninitialized", () => {
      const args = [1, 2, 3, 4];
      [createAsyncConduit(cache), createSyncConduit(cache)].forEach(
        async conduit => {
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
          expect(
            cache.get([conduit.options.key, args])?.State?.getState?.(),
          ).toEqual(args);
        },
      );
    });
  });

  describe("No Cache In Conduit Scope", () => {
    const configs: CachePolicy[] = [
      "read-cache-with-respect-to-expiry",
      "cache-only",
    ];
    configs.forEach(cachePolicy => {
      it(`It switches to the "no-cache" policy - ${cachePolicy}`, () => {
        const spy = vi.spyOn(console, "warn");
        const result = [1, 2, 3, 4];
        const conduit = new Conduit({
          key: "test",
          cachePolicy,
          operation: vi.fn().mockImplementation(() => result),
          defaultValue: [],
        });
        expect(spy).toHaveBeenCalledTimes(1);
        expect(conduit.options.cachePolicy).toEqual("no-cache");
        conduit.execute({
          args: [],
          cachePolicy,
        });
        expect(spy).toHaveBeenCalledTimes(2);
        expect(conduit.options.operation).toHaveBeenCalled();
      });
    });
  });
});
