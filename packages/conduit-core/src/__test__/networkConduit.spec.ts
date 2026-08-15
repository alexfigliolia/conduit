import { beforeEach, describe, expect, it } from "vitest";

import { ConduitNetworkResult } from "../Conduits";
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
    it(`Operations are wrapped in ConduitNetworkResults - ${conduit.options.key.join("")}`, async () => {
      const args = [1, 2, 3, 4];
      expect(conduit.readCache(...args)).toEqual(
        ConduitNetworkResult.fromResponse(null),
      );
      const result = await conduit.execute({ args });
      expect(result).toEqual(ConduitNetworkResult.fromResponse(args));
    });
  });

  throwingSyncAndAsyncNetworkConduits(cache).forEach(conduit => {
    it(`Thrown errors are caught and wrapped in ConduitNetworkResults  - ${conduit.options.key.join("")}`, async () => {
      expect(conduit.readCache()).toEqual(
        ConduitNetworkResult.fromResponse(null),
      );
      const result = await conduit.execute({ args: [] });
      expect(result).toEqual(
        ConduitNetworkResult.fromError(new Error("Thrown Error")),
      );
    });
  });
});
