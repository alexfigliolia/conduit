import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  InfiniteConduitPage,
  Conduit,
  InfiniteConduit,
  InfiniteConduitValue,
} from "../Conduits";
import { Cache, CacheEntry, ConduitStatus } from "../Cache";
import { INFINITE_TEST_ARGS, TEST_TYPES } from "../__fixtures__/types";
import {
  createNonSpreadArgsConduit,
  createSyncConduit,
} from "../__fixtures__/Conduits";

const cache = new Cache();

const CONDUITS = [
  ...TEST_TYPES.flatMap((p, i) => [
    new Conduit({
      cache,
      key: [`c${i}`],
      defaultValue: p,
      operation: (..._args: typeof TEST_TYPES) => p,
    }),
  ]),
  ...TEST_TYPES.flatMap(
    (p, i) =>
      new Conduit({
        cache,
        defaultValue: p,
        key: [`c${TEST_TYPES.length + i}`],
        operation: async (..._args: typeof TEST_TYPES) => p,
      }),
  ),
];

const INFINITE_CONDUITS = TEST_TYPES.map(
  (type, i) =>
    new InfiniteConduit({
      cache,
      key: [`ic${i}`],
      paginationArgs: ["cursor"],
      operation: async (_: typeof INFINITE_TEST_ARGS) => type,
    }),
);

describe("Cache", () => {
  describe("Cache Building", () => {
    beforeEach(async () => {
      cache.reset();
      await Promise.all(CONDUITS.map(c => c.execute({ args: TEST_TYPES })));
      await Promise.all(
        INFINITE_CONDUITS.flatMap(c =>
          Array.from({ length: 10 }, (_, i) =>
            c.execute({
              args: {
                ...INFINITE_TEST_ARGS,
                cursor: `${INFINITE_TEST_ARGS.cursor}-${i}`,
              },
            }),
          ),
        ),
      );
    });

    it("Cache Building - Cold", () => {
      [...TEST_TYPES, ...TEST_TYPES].forEach((type, i) => {
        const node = cache.get([`c${i}`], TEST_TYPES);
        expect(node?.lastRead).toEqual(0);
        expect(node?.getValue()).toEqual(type);
        expect(node).toBeInstanceOf(CacheEntry);
      });
      INFINITE_CONDUITS.forEach((conduit, i) => {
        const node = cache.get<InfiniteConduitValue<any, any>>(
          [`ic${i}`],
          [conduit.getInfiniteOptions(INFINITE_TEST_ARGS)],
        );
        expect(node?.lastRead).not.toEqual(0);
        expect(node?.getValue()).toBeInstanceOf(InfiniteConduitValue);
        expect(node?.getValue().value).toHaveLength(10);
        expect(node).toBeInstanceOf(CacheEntry);
      });
      INFINITE_CONDUITS.forEach((_, i) => {
        Array.from({ length: 10 }, (_, i) => i).forEach(j => {
          const node = cache.get<InfiniteConduitPage<any, any>>(
            [`ic${i}`],
            [
              {
                ...INFINITE_TEST_ARGS,
                cursor: `${INFINITE_TEST_ARGS.cursor}-${j}`,
              },
            ],
          );
          expect(node?.lastRead).toEqual(0);
          const page = node?.getValue();
          expect(page).toBeInstanceOf(InfiniteConduitPage);
          expect(page?.infiniteCacheID).toEqual(i.toString());
          expect(page?.index).toEqual(j);
          expect(page?.value).toEqual(TEST_TYPES[i]);
          expect(node).toBeInstanceOf(CacheEntry);
        });
      });
    });

    it("Cache Building - Warm", async () => {
      expect(new Cache({ data: cache.serialize() }).serialize()).toEqual(
        cache.serialize(),
      );
      // simulate initializing the cache from server state
      // and compare it to state that's never been serialized
      const warmedCache = new Cache({
        data: JSON.parse(JSON.stringify(cache.serialize())),
      });
      [...TEST_TYPES, ...TEST_TYPES].forEach((type, i) => {
        const coldNode = cache.get([`c${i}`], TEST_TYPES);
        const warmNode = warmedCache.get([`c${i}`], TEST_TYPES);
        expect(coldNode?.updatedAt).toEqual(warmNode?.updatedAt);
        expect(coldNode?.getValue?.()).toEqual(type);
        expect(coldNode?.getValue?.()).toEqual(warmNode?.getValue());
      });
      INFINITE_CONDUITS.forEach((conduit, i) => {
        const coldNode = cache.get<InfiniteConduitValue<any, any>>(
          [`ic${i}`],
          [conduit.getInfiniteOptions(INFINITE_TEST_ARGS)],
        );
        const warmNode = warmedCache.get<InfiniteConduitValue<any, any>>(
          [`ic${i}`],
          [conduit.getInfiniteOptions(INFINITE_TEST_ARGS)],
        );
        expect(coldNode?.updatedAt).toEqual(warmNode?.updatedAt);
        expect(coldNode?.getValue?.()).toEqual(warmNode?.getValue());
      });
      INFINITE_CONDUITS.forEach((_, i) => {
        Array.from({ length: 10 }, (_, i) => i).forEach(j => {
          const coldNode = cache.get<InfiniteConduitPage<any, any>>(
            [`ic${i}`],
            [
              {
                ...INFINITE_TEST_ARGS,
                cursor: `${INFINITE_TEST_ARGS.cursor}-${j}`,
              },
            ],
          );
          const warmNode = cache.get<InfiniteConduitPage<any, any>>(
            [`ic${i}`],
            [
              {
                ...INFINITE_TEST_ARGS,
                cursor: `${INFINITE_TEST_ARGS.cursor}-${j}`,
              },
            ],
          );
          expect(coldNode?.updatedAt).toEqual(warmNode?.updatedAt);
          expect(coldNode?.getValue?.()).toEqual(warmNode?.getValue());
        });
      });
    });
  });

  describe("Sets", () => {
    const testKey = ["set-test"];
    const testArgs = [{ testSet: { args: true } }];
    const testValue = [1, 2, 3];
    beforeEach(() => {
      cache.reset();
    });

    [testValue, () => testValue].forEach(value => {
      it(`Creates new cache entries - with a ${typeof value === "function" ? "lazy-init setter function" : "specified value"}`, () => {
        const entry = cache.set(testKey, testArgs, value);
        expect(entry.lastRead).toEqual(0);
        expect(entry.updatedAt).not.toEqual(0);
        expect(entry).toBeInstanceOf(CacheEntry);
        expect(entry.getValue()).toEqual(testValue);
        expect(entry.getStatus()).toEqual(ConduitStatus.UNINITIALIZED);
        expect(cache.get(testKey, testArgs)).toEqual(entry);
      });
    });

    it("Overrides existing values of pre-existing cache entries", () => {
      const entry = cache.set(testKey, testArgs, testValue);
      expect(entry.getValue()).toEqual(testValue);
      const entry2 = cache.set(testKey, testArgs, 1);
      expect(entry.getValue()).toEqual(1);
      expect(entry.lastRead).not.toEqual(0);
      expect(entry.updatedAt).not.toEqual(0);
      expect(Object.is(entry, entry2)).toEqual(true);
    });
  });

  describe("Evictions", () => {
    const testKey = ["set-test"];
    const testArgs = [{ testSet: { args: true } }];
    const testValue = [1, 2, 3];
    beforeEach(() => {
      cache.reset();
    });

    it("Evicting cache entries removes the entry from the graph", async () => {
      const { created } = cache.storage.maybeIndex(
        testKey,
        testArgs,
        testValue,
      );
      expect(created).toEqual(true);
      await cache.evict(testKey, testArgs);
      const { created: again } = cache.storage.maybeIndex(
        testKey,
        testArgs,
        testValue,
      );
      expect(again).toEqual(true);
    });

    it("Evicting cache entries removes all subscriptions from a node", async () => {
      const node = cache.set(testKey, testArgs, testValue);
      node.subscribeToValue(() => {});
      node.subscribeToStatus(() => {});
      node.subscribe(() => {});
      expect(node["subscriptions"].size).toEqual(4);
      await cache.evict(testKey, testArgs);
      expect(node["subscriptions"].size).toEqual(0);
    });
  });

  describe("Race Conditions", () => {
    beforeEach(async () => {
      cache.reset();
      await Promise.all(CONDUITS.map(c => c.execute({ args: TEST_TYPES })));
    });

    it.skip("Errors on Non-Serializeable Values", () => {
      const conduit = new Conduit({
        cache,
        defaultValue: new Set(),
        key: ["non-json-serializeable"],
        operation: (_: Function) => true,
      });
      // TODO - come back to me
      expect(() => {
        conduit.execute({ args: [function () {}] });
      }).toThrow();
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
      expect(args).toBe(node.getValue());
      node.setValue([]);
      expect(onChange).toHaveBeenCalledWith(args);
      expect(onChange).toHaveBeenCalledWith([]);
      node.setValue([1, 2, 3]);
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
        args.map((_, i) =>
          Promise.resolve(conduit.evict(...args.slice(0, i + 1))),
        ),
      );
      expect(cache.serialize()).toEqual({
        data: {},
        lastPageID: "-1",
        lastInfiniteID: "-1",
      });
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
