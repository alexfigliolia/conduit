import { beforeEach, describe, expect, it, vi } from "vitest";

import { Conduit } from "../Conduits";
import { Cache, CacheEntry } from "../Cache";
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
        defaultValue: structuredClone(p),
        operation: (..._args: typeof TEST_TYPES) => p,
      }),
  ),
  ...TEST_TYPES.map(
    (p, i) =>
      new Conduit({
        cache,
        defaultValue: structuredClone(p),
        key: [`c${TEST_TYPES.length + i}`],
        operation: (..._args: typeof TEST_TYPES) => Promise.resolve(p),
      }),
  ),
];

describe("Cache", () => {
  describe("Cache Building", () => {
    beforeEach(async () => {
      cache.reset();
      await Promise.all(CONDUITS.map(c => c.execute({ args: TEST_TYPES })));
    });

    it("Cache Building - Cold", () => {
      [...TEST_TYPES, ...TEST_TYPES].forEach((type, i) => {
        const node = cache.get([`c${i}`], TEST_TYPES);
        expect(node?.lastRead).toEqual(0);
        expect(node?.readValue()).toEqual(type);
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
      [...TEST_TYPES, ...TEST_TYPES].forEach((type, i) => {
        const coldNode = cache.get([`c${i}`], TEST_TYPES);
        const warmNode = warmedCache.get([`c${i}`], TEST_TYPES);
        expect(coldNode?.readValue?.()).toEqual(type);
        expect(warmNode?.readValue?.()).toEqual(type);
        expect(coldNode?.updatedAt).toEqual(warmNode?.updatedAt);
      });
    });
  });

  describe("Race Conditions", () => {
    beforeEach(async () => {
      cache.reset();
      await Promise.all(CONDUITS.map(c => c.execute({ args: TEST_TYPES })));
    });

    it("Errors on Non-Serializeable Values", () => {
      const conduit = new Conduit({
        cache,
        defaultValue: new Set(),
        key: ["non-json-serializeable"],
        operation: (_: RegExp | Function) => true,
      });
      expect(() => {
        conduit.execute({ args: [new RegExp("adsfasdf")] });
      }).toThrow();
      // TODO - come back to me
      // expect(() => {
      //   conduit.execute({ args: [function () {}] });
      // }).toThrow();
    });

    it("Collisions with intermediary cache node edges", async () => {
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
        defaultValue: [],
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
      const node = conduit.getCacheEntry(
        ...argsToTriggerIntermediaryNodeLookup,
      );
      expect(node).toBeInstanceOf(CacheEntry);
      // Set the node's state to undefined - implying it's never been written to
      await node.evict();
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
      const conduit = createSyncConduit({ cache });
      expect(cache.get(conduit.options.key, args)).not.toBeDefined();
      const onChange = vi.fn();
      const off = conduit.subscribeToValue({ args, onChange });
      expect(conduit.readCache(...args)).toEqual(undefined);
      const result = conduit.execute({ args });
      expect(result).toEqual(args);
      expect(conduit.readCache(...args)).toEqual(result);
      expect(onChange).toHaveBeenCalledWith(result);
      off();
    });

    it("Subscriptions fire on value changes", () => {
      const args = [1, 2, 3, 4, 5, 6];
      const conduit = createNonSpreadArgsConduit(cache);
      const onChange = vi.fn();
      const off = conduit.subscribeToValue({ args: [args], onChange });
      conduit.execute({ args: [args] });
      const node = conduit.getCacheEntry(args);
      expect(args).toBe(node.readValue());
      node.writeValue([]);
      expect(onChange).toHaveBeenCalledWith(args);
      expect(onChange).toHaveBeenCalledWith([]);
      node.writeValue([1, 2, 3]);
      expect(onChange).toHaveBeenCalledWith([1, 2, 3]);
      off();
    });
  });

  describe("Tree Trimming", () => {
    const args = [1, 2, 3, 4];
    const conduit = new Conduit({
      key: ["c"],
      cache,
      defaultValue: 1,
      operation: (..._: number[]) => 1,
    });

    beforeEach(async () => {
      cache.reset();
      args.forEach((_, i) => conduit.execute({ args: args.slice(0, i + 1) }));
    });

    it("Cache should tree trim asynchronously", async () => {
      await Promise.all(
        args.map((_, i) => conduit.evict(...args.slice(0, i + 1))),
      );
      expect(cache.serialize()).toEqual({});
    });

    it("Cache should not tree trim if there are cache entries beneath an evicted node", async () => {
      await conduit.evict(...args.slice(0, 1 + 1));
      args.slice(2).forEach((_, i) => {
        expect(conduit.readCache(...args.slice(0, i + 3))).toEqual(
          conduit.options.defaultValue,
        );
      });
    });
  });
});
