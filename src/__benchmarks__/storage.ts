import { run, bench, group, lineplot, summary } from "mitata";

import { Cache } from "../Cache";
import { TEST_TYPES } from "../__fixtures__/types";
import { StringifyCache } from "../__fixtures__/StringifyCache";

const stringCache = new StringifyCache();
const graphCache = new Cache();

group("Storage Comparison - Insertion", () => {
  lineplot(() => {
    summary(() => {
      bench("Plain Object", () => {
        TEST_TYPES.forEach(type => {
          stringCache.set(type, type);
        });
        return stringCache.get(TEST_TYPES[TEST_TYPES.length - 1]);
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
      bench("Plain Object", () => {
        TEST_TYPES.forEach(type => {
          stringCache.get(type);
        });
        return stringCache.get(TEST_TYPES[TEST_TYPES.length - 1]);
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
