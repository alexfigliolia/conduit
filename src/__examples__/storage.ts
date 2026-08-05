import { Conduit } from "../Conduit";
import { Cache } from "../Cache";
import { NON_PRIMITIVES } from "../__fixtures__/types";

import { Logger } from "./Logger";

const cache = new Cache();

const CONDUITS = NON_PRIMITIVES.map(
  (p, i) =>
    new Conduit({
      cache,
      key: [`c${i}`],
      operation: (..._args: typeof NON_PRIMITIVES) => p,
    }),
);

Logger.info("Building the cache using all JSON serializeable primitives");
Logger.info("Assembling the graph");

// oxlint-disable-next-line typescript/await-thenable
void Promise.all(CONDUITS.map(m => m.execute({ args: NON_PRIMITIVES }))).then(
  () => {
    console.log(JSON.stringify(cache.serialize(), null, 2));
    Logger.info("Done! Above is the internal structure of the cache storage");
  },
);
