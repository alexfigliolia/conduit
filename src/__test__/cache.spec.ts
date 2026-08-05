import { beforeEach, describe, expect, it, vi } from "vitest";

import { TypeChecker } from "../TypeChecker";
import { Graph } from "../Graph";
import { Conduit } from "../Conduit";
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
        expect(node?.lastRead).not.toEqual(0);
        expect(node?.updatedAt).not.toEqual(0);
      });
    });

    it("Cache Building - Warm", async () => {
      expect(new Cache(cache.serialize()).serialize()).toEqual(
        cache.serialize(),
      );
      expect(recursiveEquality(cache, new Cache(cache.serialize()))).toEqual(
        true,
      );
      // simulate initializing the cache from server state
      // and compare it to state that's never been serialized
      const warmedCache = new Cache(
        JSON.parse(JSON.stringify(cache.serialize())),
      );
      TEST_TYPES.forEach((type, i) => {
        const coldNode = cache.get([`c${i}`, TEST_TYPES]);
        const warmNode = warmedCache.get([`c${i}`, TEST_TYPES]);
        expect(coldNode?.State?.getState?.()).toEqual(type);
        expect(warmNode?.State?.getState?.()).toEqual(type);
        expect(coldNode?.nodes).toEqual(warmNode?.nodes);
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
      expect(node).toBeInstanceOf(Graph);
      // Set the node's state to undefined - implying it's never been written to
      node!.State = undefined;
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
      const off = cache.subscribe(cacheKey, [1], onChange);
      expect(conduit.getCachedNode(cacheKey)?.State?.getState?.()).toEqual([1]);
      const result = conduit.execute({ args });
      expect(result).toEqual(args);
      expect(conduit.getCachedNode(cacheKey)?.State?.getState?.()).toEqual(
        result,
      );
      expect(onChange).toHaveBeenCalledWith(result);
      off();
    });

    it("Subscriptions only fire on identity value changes", () => {
      const args = [1, 2, 3, 4, 5, 6];
      const conduit = createNonSpreadArgsConduit(cache);
      const cacheKey = [conduit.options.key, args];
      const onChange = vi.fn();
      const off = cache.subscribe(cacheKey, [1], onChange);
      conduit.execute({ args: [args] });
      conduit.prepare()(args);
      const node = conduit.getCachedNode(cacheKey);
      expect(node).toBeDefined();
      expect(args).toBe(node?.State?.getState?.());
      node!.setValue(args);
      expect(onChange).toHaveBeenCalledExactlyOnceWith(args);
      node!.setValue([...args]);
      expect(onChange).toHaveBeenCalledTimes(2);
      off();
    });
  });
});

function recursiveEquality(obj1: any, obj2: any, ...meta: any) {
  if (
    TypeChecker.isObjectType(obj1) !== TypeChecker.isObjectType(obj2) ||
    Array.isArray(obj1) !== Array.isArray(obj2)
  ) {
    console.log("failure on object/array types");
    console.log(obj1, obj2, meta);
    return false;
  }
  if (Array.isArray(obj1)) {
    if (obj1.length !== obj2.length) {
      console.log("failure on array length");
      console.log(obj1, obj2, meta);
      return false;
    }
    const { length } = obj1;
    for (let i = 0; i < length; i++) {
      if (!recursiveEquality(obj1[i], obj2[i], obj1, obj2)) {
        return false;
      }
    }
    return true;
  }
  if (TypeChecker.isObjectType(obj1)) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      console.log("failure on key length");
      console.log(obj1, obj2, meta);
      return false;
    }
    for (const key in obj1) {
      if (!recursiveEquality(obj1[key], obj2[key], obj1, obj2)) {
        return false;
      }
    }
    return true;
  }
  if (typeof obj1 !== typeof obj2) {
    console.log("failure on mismatched types");
    console.log(obj1, obj2);
    return false;
  }
  if (typeof obj1 === "function") {
    if (obj1.toString() !== obj2.toString()) {
      console.log("failure on function signature");
      console.log(obj1, obj2);
      return false;
    }
    return true;
  }
  if (obj1 !== obj2) {
    console.log("failure on primitive types");
    console.log(obj1, obj2, meta);
    return false;
  }
  return true;
}
