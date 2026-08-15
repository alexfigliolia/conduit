import { Conduit } from "../Conduits/Conduit";
import { Cache } from "../Cache";
import { TEST_TYPES } from "../__fixtures__/types";

import { Logger } from "./Logger";

const cache = new Cache();

Logger.info("Building the cache using all JSON serializeable primitives");
Logger.info("Assembling the graph");

TEST_TYPES.map((p, i) => {
  return new Conduit({
    cache,
    key: [`c${i}`],
    operation: (_: typeof p) => p,
    defaultValue: structuredClone(p),
  }).execute({ args: [p] });
});

console.log(JSON.stringify(cache.serialize(), null, 2));
Logger.info("Done! Above is the internal structure of the cache storage");
