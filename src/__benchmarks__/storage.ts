import { run, bench, group, lineplot, summary } from "mitata";

import { Cache } from "../Cache";
import { TEST_TYPES } from "../__fixtures__/types";
import { StringifyCache } from "../__fixtures__/StringifyCache";
import { OptimizedStringifyCache } from "../__fixtures__/OptimizedStringifyCache";

const graphCache = new Cache();
const stringifyCacheWithFlatStorage = new StringifyCache();
const optimizedStringifyCacheWithFlatStorage = new OptimizedStringifyCache();

group("Storage Comparison - Insertion", () => {
  lineplot(() => {
    summary(() => {
      bench("Flat Storage with JSON.stringify", () => {
        TEST_TYPES.forEach(type => {
          stringifyCacheWithFlatStorage.set(type, type);
        });
        return stringifyCacheWithFlatStorage.get(
          TEST_TYPES[TEST_TYPES.length - 1],
        );
      });
      bench("Flat Storage with optimized Stringify", () => {
        TEST_TYPES.forEach(type => {
          optimizedStringifyCacheWithFlatStorage.set(type, type);
        });
        return optimizedStringifyCacheWithFlatStorage.get(
          TEST_TYPES[TEST_TYPES.length - 1],
        );
      });
      bench("Tree Storage", () => {
        TEST_TYPES.forEach(type => {
          graphCache.set(type, type);
        });
        return graphCache.get(TEST_TYPES[TEST_TYPES.length - 1]);
      });
    });
  });
});

group("Storage Comparison - Retrieval", () => {
  lineplot(() => {
    summary(() => {
      bench("Flat Storage with JSON.stringify", () => {
        TEST_TYPES.forEach(type => {
          stringifyCacheWithFlatStorage.get(type);
        });
        return stringifyCacheWithFlatStorage.get(
          TEST_TYPES[TEST_TYPES.length - 1],
        );
      });
      bench("Flat Storage with optimized Stringify", () => {
        TEST_TYPES.forEach(type => {
          optimizedStringifyCacheWithFlatStorage.get(type);
        });
        return optimizedStringifyCacheWithFlatStorage.get(
          TEST_TYPES[TEST_TYPES.length - 1],
        );
      });
      bench("Tree Storage", () => {
        TEST_TYPES.forEach(type => {
          graphCache.get(type);
        });
        return graphCache.get(TEST_TYPES[TEST_TYPES.length - 1]);
      });
    });
  });
});

void run();
