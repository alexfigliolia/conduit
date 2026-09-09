import { beforeEach, describe, expect, it } from "vitest";

import {
  InfiniteConduit,
  InfiniteConduitPage,
  InfiniteConduitValue,
} from "../Conduits";
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
        conduit.writeCache({ args: pageArgs, value: nextPageData });
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

  it("An InfiniteConduit's cache entry should be accessible via argumements with all paginationArgs omitted", () => {
    const args = data[0]!;
    const conduit1 = createAsyncInfiniteConduit(cache);
    const pagingArgs1 = conduit1.getInfiniteOptions(args);
    expect(pagingArgs1).toEqual({ search: "query" });
    const conduit2 = createSyncInfiniteConduit(cache);
    const pagingArgs2 = conduit2.getInfiniteOptions(args);
    expect(pagingArgs2).toEqual({ search: "query", paging: {} });
  });

  it("An InfiniteConduit should throw when paginationArgs do not point to an argument value", () => {
    const conduit = new InfiniteConduit({
      cache,
      key: ["test"],
      operation: (_: { options: { pageSize: number; cursor?: string } }) => {},
      // @ts-expect-error intentional
      paginationArgs: ["options.cursor.fake.path"],
    });
    expect(() => {
      conduit.readCache({ options: { cursor: "123123", pageSize: 10 } });
    }).toThrow();
    expect(() => {
      conduit.getStatus({ options: { cursor: "123123", pageSize: 10 } });
    }).toThrow();
    expect(() => {
      conduit.execute({
        args: { options: { cursor: "123123", pageSize: 10 } },
      });
    }).toThrow();
    expect(() => {
      conduit.subscribeToValue({
        args: { options: { cursor: "123123", pageSize: 10 } },
        onChange: () => {},
      });
    }).toThrow();
    expect(() => {
      conduit.subscribeToStatus({
        args: { options: { cursor: "123123", pageSize: 10 } },
        onChange: () => {},
      });
    }).toThrow();
  });

  it("An InfiniteConduit should throw when paginationArgs do not point to an argument value", () => {
    expect(() => {
      new InfiniteConduit({
        cache,
        key: ["test"],
        operation: (_: {
          options: { pageSize: number; cursor?: string };
        }) => {},
        paginationArgs: [],
      });
    }).toThrow();
  });

  syncAndAsyncInfiniteConduits(cache).forEach(conduit => {
    it(`An InfiniteConduit's value holds references to all child pages - ${conduit.options.key[0]}`, async () => {
      await Promise.all(
        data.map(args => Promise.resolve(conduit.execute({ args }))),
      );
      const conduitValue = conduit.getCacheEntry(data[0]!).getValue();
      const infiniteEntry = conduit.getCacheEntry(data[0]!);
      expect(conduitValue).toBeInstanceOf(InfiniteConduitValue);
      expect(conduitValue.value.length).toEqual(10);
      data.map((args, i) => {
        expect(conduitValue.value[i]?.value).toEqual(
          conduit.readPageCache(args),
        );
        const page = cache
          .get(conduit.options.key, [args])
          ?.State.getState() as InfiniteConduitPage<
          (typeof data)[number],
          typeof cache
        >;
        expect(page).toBeInstanceOf(InfiniteConduitPage);
        expect(page.infiniteCacheID).toEqual(
          infiniteEntry.getValue().infiniteCacheID,
        );
      });
    });
  });
});
