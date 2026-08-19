import { beforeEach, describe, expect, it } from "vitest";

import { ConduitNetworkResult } from "../Conduits/NetworkConduit";
import { Cache } from "../Cache";
import {
  syncAndAsyncNetworkConduits,
  throwingSyncAndAsyncNetworkConduits,
} from "../__fixtures__/Conduits";

const cache = new Cache();

describe("Network Conduits", () => {
  beforeEach(() => {
    cache.reset();
  });

  syncAndAsyncNetworkConduits(cache).forEach(conduit => {
    it(`It wraps operations in a ConduitNetworkResult - ${conduit.options.key[0]}`, async () => {
      const args = [1, 2, 3];
      expect(conduit.readCache(...args)).toEqual(
        ConduitNetworkResult.from(null),
      );
      const result = await conduit.execute({ args });
      expect(result).toEqual(ConduitNetworkResult.from(args));
      expect(conduit.readCache(...args)).toEqual(
        ConduitNetworkResult.from(args),
      );
    });
  });

  throwingSyncAndAsyncNetworkConduits(cache).forEach(conduit => {
    it(`It wraps caught errors in a ConduitNetworkResult - ${conduit.options.key[0]}`, async () => {
      expect(conduit.readCache()).toEqual(ConduitNetworkResult.from(null));
      const result = await conduit.execute({ args: [] });
      expect(result).toEqual(
        ConduitNetworkResult.fromError(new Error("Thrown Error")),
      );
      expect(conduit.readCache()).toEqual(
        ConduitNetworkResult.fromError(new Error("Thrown Error")),
      );
    });
  });
});
