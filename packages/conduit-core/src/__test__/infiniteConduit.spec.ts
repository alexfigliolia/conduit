import { beforeEach, describe, expect, it, vi } from "vitest";

import { InfiniteConduit, InfiniteConduitValue } from "../Conduits";
import { Cache, ConduitStatus } from "../Cache";
import {
  createAsyncInfiniteConduit,
  createSyncInfiniteConduit,
  syncAndAsyncInfiniteConduits,
} from "../__fixtures__/Conduits";

const cache = new Cache();

const data = Array.from({ length: 10 }, (_, i) => ({
  search: "query",
  paging: { cursor: i.toString().repeat(10), pageSize: 10 },
}));

describe("Infinite Conduits", () => {
  beforeEach(() => {
    cache.reset();
  });

  syncAndAsyncInfiniteConduits(cache).forEach(conduit => {
    it(`It paginates conduit operations - ${conduit.options.key[0]}`, async () => {
      data.forEach(args => {
        // All combinations of arguments should point to the same
        // paginated cache entry
        expect(conduit.readCache(args)).toEqual([]);
      });
      let pointer = 0;
      for (const args of data) {
        const result = await conduit.execute({ args });
        expect(result).toEqual(args);
        expect(conduit.readCache(args)).toEqual(data.slice(0, ++pointer));
        expect(conduit.readPageCache(args)).toEqual(args);
      }
      pointer = 0;
      for (const pageArgs of data) {
        const nextPageData = {
          ...pageArgs,
          paging: { ...pageArgs.paging, pageSize: 20 },
        };
        // Writing new data to each page should update the Infinite Conduit's data
        conduit.writeCache(pageArgs, nextPageData);
        expect(conduit.readCache(pageArgs)[pointer++]).toEqual(nextPageData);
      }
    });
  });

  it("InfiniteConduit status is in-flight as long a child page is in flight", async () => {
    const args = data[0]!;
    const conduit = createAsyncInfiniteConduit(cache);
    expect(conduit.getStatus(args)).toEqual(ConduitStatus.UNINITIALIZED);
    const result = conduit.execute({ args });
    expect(conduit.getStatus(args)).toEqual(ConduitStatus.IN_FLIGHT);
    await result;
    expect(conduit.getStatus(args)).toEqual(ConduitStatus.IDOL);
  });

  it("An InfiniteConduit's cache entry should be accessible via argumements with all pagingArgPaths omitted", () => {
    const args = data[0]!;
    const conduit1 = createAsyncInfiniteConduit(cache);
    const pagingArgs1 = conduit1.getInfiniteOptions(args);
    expect(pagingArgs1).toEqual({ search: "query" });
    const conduit2 = createSyncInfiniteConduit(cache);
    const pagingArgs2 = conduit2.getInfiniteOptions(args);
    expect(pagingArgs2).toEqual({ search: "query", paging: {} });
  });

  it("An InfiniteConduit should throw when pagingArgPaths do not point to an argument value", () => {
    const conduit = new InfiniteConduit({
      cache,
      key: ["test"],
      operation: (_: { options: { pageSize: number; cursor?: string } }) => {},
      // @ts-expect-error intentional
      pagingArgPaths: ["options.cursor.fake.path"],
    });
    expect(() => {
      conduit.readCache({ options: { cursor: "123123", pageSize: 10 } });
    }).toThrow();
    expect(() => {
      conduit.getStatus({ options: { cursor: "123123", pageSize: 10 } });
    }).toThrow();
    expect(() => {
      void conduit.execute({
        args: { options: { cursor: "123123", pageSize: 10 } },
      });
    }).toThrow();
    expect(() => {
      conduit.subscribeToValue(
        { options: { cursor: "123123", pageSize: 10 } },
        () => {},
      );
    }).toThrow();
    expect(() => {
      conduit.subscribeToStatus(
        { options: { cursor: "123123", pageSize: 10 } },
        () => {},
      );
    }).toThrow();
  });

  it("An InfiniteConduit should throw when pagingArgPaths do not point to an argument value", () => {
    expect(() => {
      new InfiniteConduit({
        cache,
        key: ["test"],
        operation: (_: {
          options: { pageSize: number; cursor?: string };
        }) => {},
        pagingArgPaths: [],
      });
    }).toThrow();
  });

  syncAndAsyncInfiniteConduits(cache).forEach(conduit => {
    it(`An InfiniteConduit's value holds references to all child page's cache entries - ${conduit.options.key[0]}`, async () => {
      await Promise.all(
        data.map(args => Promise.resolve(conduit.execute({ args }))),
      );
      const conduitValue = conduit.getCacheEntry(data[0]!).getValue();
      expect(conduitValue).toBeInstanceOf(InfiniteConduitValue);
      for (const [index, cacheEntry] of conduitValue["pageCacheEntries"]) {
        expect(conduitValue.getValue()[index]).toEqual(cacheEntry.getValue());
        expect(conduitValue["caches"].has(cacheEntry)).toEqual(true);
      }
      expect(conduitValue["pageSubscribers"].size).toEqual(10);
    });
  });

  syncAndAsyncInfiniteConduits(cache).forEach(conduit => {
    it(`Destroying an Infinite Conduit's value releases all page subsscribers and cache references - ${conduit.options.key[0]}`, async () => {
      const unsubscribeTest = vi.fn();
      const cacheWriterTest = vi.fn();
      await Promise.all(
        data.map(args => Promise.resolve(conduit.execute({ args }))),
      );
      const conduitValue = conduit.getCacheEntry(data[0]!).getValue();
      const originalWriter = conduitValue.cacheWriter;
      conduitValue.cacheWriter = () => {
        originalWriter?.();
        cacheWriterTest();
      };
      conduitValue["pageSubscribers"].set(1000000000, unsubscribeTest);
      const cacheReferences = Array.from(
        conduitValue["pageCacheEntries"].values(),
      );
      conduitValue.destroy();
      expect(
        cacheReferences.every(ref => conduitValue["caches"].has(ref)),
      ).toEqual(false);
      expect(conduitValue["pageCacheEntries"].size).toEqual(0);
      expect(conduitValue["pageSubscribers"].size).toEqual(0);
      expect(unsubscribeTest).toHaveBeenCalled();
      expect(cacheWriterTest).toHaveBeenCalled();
      expect(conduitValue["cacheWriter"]).toBeUndefined();
    });
  });
});
