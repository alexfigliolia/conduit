import { beforeEach, describe, expect, it } from "vitest";

import { Conduit } from "../Conduit";
import { Cache } from "../Cache";
import { TEST_TYPES } from "../__fixtures__/types";

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
  beforeEach(async () => {
    cache.reset();
    // oxlint-disable-next-line typescript/await-thenable
    await Promise.all(CONDUITS.map(c => c.execute({ args: TEST_TYPES })));
  });

  it("Cache Building - Cold", () => {
    TEST_TYPES.forEach((type, i) => {
      const node = cache.get([`c${i}`, TEST_TYPES]);
      expect(node?.value).toEqual(type);
      expect(node?.lastRead).not.toEqual(0);
      expect(node?.updatedAt).not.toEqual(0);
      expect(node?.updatedAt).toBeLessThan(node?.lastRead ?? -1);
    });
  });

  it("Cache Building - Warm", async () => {
    expect(new Cache(cache.serialize())).toEqual(cache);
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

  it("Errors on Non-Serializeable Values", () => {
    const warmedCache = new Cache(
      JSON.parse(JSON.stringify(cache.serialize())),
    );
    TEST_TYPES.forEach((_, i) => {
      const coldNode = cache.get([`c${i}`, TEST_TYPES]);
      const warmNode = warmedCache.get([`c${i}`, TEST_TYPES]);
      expect(coldNode?.value).toEqual(warmNode?.value);
      expect(coldNode?.nodes).toEqual(warmNode?.nodes);
      expect(coldNode?.updatedAt).toEqual(warmNode?.updatedAt);
    });
  });
});
