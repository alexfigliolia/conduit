import { beforeEach, describe, expect, it } from "vitest";

import { ConduitNetworkResult } from "../Conduits/NetworkConduit";
import { InfiniteConduitValue } from "../Conduits";
import { Cache } from "../Cache";
import {
  syncAndAsyncInfiniteNetworkConduits,
  throwingSyncAndAsyncInfiniteNetworkConduits,
} from "../__fixtures__/Conduits";

const cache = new Cache();

const data = Array.from({ length: 10 }, (_, i) => ({
  search: "query",
  paging: { cursor: i.toString().repeat(10), pageSize: 10 },
}));

describe("Infinite Network Conduits", () => {
  beforeEach(() => {
    cache.reset();
  });

  syncAndAsyncInfiniteNetworkConduits(cache).forEach(conduit => {
    it(`It wraps infinite operations in a ConduitNetworkResult - ${conduit.options.key[0]}`, async () => {
      await Promise.all(
        data.map(args => Promise.resolve(conduit.execute({ args }))),
      );
      const rootCacheEntry = conduit.getCacheEntry(data[0]!).getValue();
      expect(rootCacheEntry).toBeInstanceOf(InfiniteConduitValue);
      let pointer = -1;
      for (const args of data) {
        expect(conduit.readPageCache(args)).toBeInstanceOf(
          ConduitNetworkResult,
        );
        expect(conduit.readPageCache(args)?.data).toEqual(args);
        expect(conduit.readCache(args)[++pointer]?.data).toEqual(args);
      }
    });
  });

  throwingSyncAndAsyncInfiniteNetworkConduits(cache).forEach(conduit => {
    it(`It wraps caught errors in a ConduitNetworkResult - ${conduit.options.key[0]}`, async () => {
      await Promise.all(
        data.map(args => Promise.resolve(conduit.execute({ args }))),
      );
      const rootCacheEntry = conduit.getCacheEntry(data[0]!).getValue();
      expect(rootCacheEntry).toBeInstanceOf(InfiniteConduitValue);
      let pointer = -1;
      for (const args of data) {
        expect(conduit.readPageCache(args)).toBeInstanceOf(
          ConduitNetworkResult,
        );
        expect(conduit.readPageCache(args)?.data).toEqual(null);
        expect(conduit.readCache(args)[++pointer]?.data).toEqual(null);
      }
    });
  });
});
