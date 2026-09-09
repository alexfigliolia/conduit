import { describe, expect, it } from "vitest";

import { Serializer } from "../Cache/Serialization";

const now = new Date();
const ISO = now.toISOString();

describe("Node Path Generation", () => {
  it("It generates primitive paths from any javascript value", () => {
    const testObject = [
      {
        1: true,
        2: false,
        3: { 4: 5, 6: { 7: true } },
        key: "value",
        nesting: { deeper: { deeper: { deeper: {} } } },
        map: new Map([["hello", "goodbye"]]),
        set: new Set([["hello", "goodbye"]]),
        regexp: /test-pattern(\d{4})/,
        date: now,
        bigInt: BigInt(123123123123),
        undefined: undefined,
      },
    ];
    const path: any[] = [];
    Serializer.toPath(["test-key"], testObject, p => {
      return !!path.push(p);
    });
    expect(path).toEqual([
      "test-key",
      "___CONDUIT___:Key",
      "___CONDUIT___:{}",
      "1",
      true,
      "2",
      false,
      "3",
      "___CONDUIT___:{}",
      "4",
      5,
      "6",
      "___CONDUIT___:{}",
      "7",
      true,
      "___CONDUIT___:{}",
      "___CONDUIT___:{}",
      "bigInt",
      123123123123n,
      "date",
      "___CONDUIT___:date",
      ISO,
      "key",
      "value",
      "map",
      "___CONDUIT___:map",
      "___CONDUIT___:[]",
      "hello",
      "goodbye",
      "___CONDUIT___:[]",
      "___CONDUIT___:map",
      "nesting",
      "___CONDUIT___:{}",
      "deeper",
      "___CONDUIT___:{}",
      "deeper",
      "___CONDUIT___:{}",
      "deeper",
      "___CONDUIT___:{}",
      "___CONDUIT___:{}",
      "___CONDUIT___:{}",
      "___CONDUIT___:{}",
      "___CONDUIT___:{}",
      "regexp",
      "___CONDUIT___:regexp",
      "/test-pattern(\\d{4})/",
      "set",
      "___CONDUIT___:set",
      "___CONDUIT___:[]",
      "hello",
      "goodbye",
      "___CONDUIT___:[]",
      "___CONDUIT___:set",
      "undefined",
      "___CONDUIT___:undefined",
      "undefined",
      "___CONDUIT___:{}",
    ]);
  });
});
