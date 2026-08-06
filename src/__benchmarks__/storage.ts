import { run, bench, group, summary, barplot } from "mitata";

import { Cache } from "../Cache/Cache";
import { SERIALIZABLE_TEST_TYPES } from "../__fixtures__/types";
import { StringifyCache } from "../__fixtures__/StringifyCache";
import { OptimizedStringifyCache } from "../__fixtures__/OptimizedStringifyCache";

const graphCache = new Cache();
const stringifyCacheWithFlatStorage = new StringifyCache();
const optimizedStringifyCacheWithFlatStorage = new OptimizedStringifyCache();

group("Storage Comparison - Insertion", () => {
  barplot(() => {
    summary(() => {
      bench("Flat Storage with JSON.stringify", function* () {
        stringifyCacheWithFlatStorage.reset();
        yield () => {
          SERIALIZABLE_TEST_TYPES.forEach(type => {
            stringifyCacheWithFlatStorage.set(type, type);
          });
        };
      });
      bench("Flat Storage with optimized Stringify", function* () {
        optimizedStringifyCacheWithFlatStorage.reset();
        yield () => {
          SERIALIZABLE_TEST_TYPES.forEach(type => {
            optimizedStringifyCacheWithFlatStorage.set(type, type);
          });
        };
      });
      bench("Tree Storage", function* () {
        graphCache.reset();
        yield () => {
          SERIALIZABLE_TEST_TYPES.forEach(type => {
            graphCache.set(type, type);
          });
        };
      });
    });
  });
});

group("Storage Comparison - Retrieval", () => {
  barplot(() => {
    summary(() => {
      bench("Flat Storage with JSON.stringify", function* () {
        stringifyCacheWithFlatStorage.reset();
        SERIALIZABLE_TEST_TYPES.forEach(type => {
          stringifyCacheWithFlatStorage.set(type, type);
        });
        yield () => {
          SERIALIZABLE_TEST_TYPES.forEach(type => {
            stringifyCacheWithFlatStorage.get(type);
          });
        };
      });
      bench("Flat Storage with optimized Stringify", function* () {
        optimizedStringifyCacheWithFlatStorage.reset();
        SERIALIZABLE_TEST_TYPES.forEach(type => {
          optimizedStringifyCacheWithFlatStorage.set(type, type);
        });
        yield () => {
          SERIALIZABLE_TEST_TYPES.forEach(type => {
            optimizedStringifyCacheWithFlatStorage.get(type);
          });
        };
      });
      bench("Tree Storage", function* () {
        graphCache.reset();
        SERIALIZABLE_TEST_TYPES.forEach(type => {
          graphCache.set(type, type);
        });
        yield () => {
          SERIALIZABLE_TEST_TYPES.forEach(type => {
            graphCache.get(type);
          });
        };
      });
    });
  });
});

group("Cache Building", () => {
  barplot(() => {
    summary(() => {
      bench("Flat Storage with JSON.stringify", function* () {
        stringifyCacheWithFlatStorage.reset();
        SERIALIZABLE_TEST_TYPES.forEach(type => {
          stringifyCacheWithFlatStorage.set(type, type);
        });
        const payload = JSON.stringify(
          stringifyCacheWithFlatStorage.serialize(),
        );
        yield () => {
          new StringifyCache(JSON.parse(payload));
        };
      });
      bench("Flat Storage with optimized Stringify", function* () {
        optimizedStringifyCacheWithFlatStorage.reset();
        SERIALIZABLE_TEST_TYPES.forEach(type => {
          optimizedStringifyCacheWithFlatStorage.set(type, type);
        });
        const payload = JSON.stringify(
          optimizedStringifyCacheWithFlatStorage.serialize(),
        );
        yield () => {
          new OptimizedStringifyCache(JSON.parse(payload));
        };
      });
      bench("Tree Storage", function* () {
        graphCache.reset();
        SERIALIZABLE_TEST_TYPES.forEach(type => {
          graphCache.set(type, type);
        });
        const payload = JSON.stringify(graphCache.serialize());
        yield () => {
          new Cache(JSON.parse(payload));
        };
      });
    });
  });
});

void run();
