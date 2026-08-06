import { beforeEach, describe, expect, it, vi } from "vitest";

import { Conduit } from "../Conduit";
import { CacheEntry } from "../CacheEntry";
import { Cache } from "../Cache";
import { TEST_TYPES } from "../__fixtures__/types";
import {
  createNonSpreadArgsConduit,
  createSyncConduit,
} from "../__fixtures__/Conduits";

const cache = new Cache();

const CONDUITS = [
  ...TEST_TYPES.map(
    (p, i) =>
      new Conduit({
        cache,
        key: [`c${i}`],
        operation: (..._args: typeof TEST_TYPES) => p,
      }),
  ),
  ...TEST_TYPES.map(
    (p, i) =>
      new Conduit({
        cache,
        key: [`c${TEST_TYPES.length + i}`],
        operation: (..._args: typeof TEST_TYPES) => Promise.resolve(p),
      }),
  ),
];

describe("Cache", () => {
  describe("Cache Building", () => {
    beforeEach(async () => {
      cache.reset();
      // oxlint-disable-next-line typescript/await-thenable
      await Promise.all(CONDUITS.map(c => c.execute({ args: TEST_TYPES })));
    });

    it("Cache Building - Cold", () => {
      TEST_TYPES.forEach((type, i) => {
        const node = cache.get([`c${i}`, TEST_TYPES]);
        expect(node?.State?.getState?.()).toEqual(type);
        expect(node?.lastRead).toEqual(0);
      });
    });

    it("Cache Building - Warm", async () => {
      expect(new Cache(cache.serialize()).serialize()).toEqual(
        cache.serialize(),
      );
      // simulate initializing the cache from server state
      // and compare it to state that's never been serialized
      const warmedCache = new Cache(
        JSON.parse(JSON.stringify(cache.serialize())),
      );
      TEST_TYPES.forEach((type, i) => {
        const coldNode = cache.get([`c${i}`, TEST_TYPES]);
        const warmNode = warmedCache.get([`c${i}`, TEST_TYPES]);
        expect(coldNode?.read?.()).toEqual(type);
        expect(warmNode?.read?.()).toEqual(type);
        expect(coldNode?.updatedAt).toEqual(warmNode?.updatedAt);
      });
    });
  });

  describe("Race Conditions", () => {
    beforeEach(async () => {
      cache.reset();
      // oxlint-disable-next-line typescript/await-thenable
      await Promise.all(CONDUITS.map(c => c.execute({ args: TEST_TYPES })));
    });

    it("Errors on Non-Serializeable Values", () => {
      const conduit = new Conduit({
        cache,
        key: ["non-json-serializeable"],
        operation: (_: Map<string, string>) => new Set(),
      });
      expect(() => {
        conduit.execute({ args: [new Map()] });
      }).toThrow();
    });

    it("Collisions with intermediary cache node edges", () => {
      const operation = vi
        .fn()
        .mockImplementation(
          (...args: typeof argsToTriggerIntermediaryNodeLookup) => args,
        );
      const argsToTriggerIntermediaryNodeLookup = [...TEST_TYPES];
      argsToTriggerIntermediaryNodeLookup.pop();
      const conduit = new Conduit({
        cache,
        operation,
        // force a lookup to an inactive, but intermediary Trie node along the path of an existent cache entry
        key: [`c${TEST_TYPES.length + TEST_TYPES.length - 2}`],
      });
      conduit.execute({
        args: argsToTriggerIntermediaryNodeLookup,
        cachePolicy: "read-cache-with-respect-to-expiry",
      });
      // assert a cache miss and a trigger to the operation
      expect(operation).toHaveBeenCalledWith(
        ...argsToTriggerIntermediaryNodeLookup,
      );
      conduit.execute({
        args: argsToTriggerIntermediaryNodeLookup,
        cachePolicy: "read-cache-with-respect-to-expiry",
      });
      // Assert a cache hit on a second execution
      expect(operation).toHaveBeenCalledTimes(1);
      const node = cache.get([
        `c${TEST_TYPES.length + TEST_TYPES.length - 2}`,
        argsToTriggerIntermediaryNodeLookup,
      ]);
      expect(node).toBeInstanceOf(CacheEntry);
      // Set the node's state to undefined - implying it's never been written to
      cache.evict([
        `c${TEST_TYPES.length + TEST_TYPES.length - 2}`,
        argsToTriggerIntermediaryNodeLookup,
      ]);
      conduit.execute({
        args: argsToTriggerIntermediaryNodeLookup,
        cachePolicy: "read-cache-with-respect-to-expiry",
      });
      // Assert this causes a cache miss
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe("Cache Reactivity", () => {
    beforeEach(() => {
      cache.reset();
    });

    it("Subscriptions can initialize cache entries", () => {
      const args = [1, 2, 3, 4, 5, 6];
      const conduit = createSyncConduit(cache);
      const cacheKey = [conduit.options.key, args];
      expect(conduit.getCachedNode(cacheKey)).not.toBeDefined();
      const onChange = vi.fn();
      const off = cache.subscribeToValue(cacheKey, [1], onChange);
      expect(conduit.getCachedNode(cacheKey)?.State?.getState?.()).toEqual([1]);
      const result = conduit.execute({ args });
      expect(result).toEqual(args);
      expect(conduit.getCachedNode(cacheKey)?.State?.getState?.()).toEqual(
        result,
      );
      expect(onChange).toHaveBeenCalledWith(result);
      off();
    });

    it("Subscriptions fire on value changes", () => {
      const args = [1, 2, 3, 4, 5, 6];
      const conduit = createNonSpreadArgsConduit(cache);
      const cacheKey = [conduit.options.key, args];
      const onChange = vi.fn();
      const off = cache.subscribeToValue(cacheKey, [1], onChange);
      conduit.execute({ args: [args] });
      const node = conduit.getCachedNode<number[]>(cacheKey);
      expect(node).toBeDefined();
      expect(args).toBe(node?.State?.getState?.());
      node!.write([]);
      expect(onChange).toHaveBeenCalledWith(args);
      expect(onChange).toHaveBeenCalledWith([]);
      node!.write([1, 2, 3]);
      expect(onChange).toHaveBeenCalledWith([1, 2, 3]);
      off();
    });
  });
});
