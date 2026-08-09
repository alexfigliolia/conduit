import { describe, expect, it } from "vitest";

import { NodePathGenerator } from "../Cache/TriePaths";

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
      },
    ];
    const path: any[] = [];
    NodePathGenerator.toPath(["test-key"], testObject, p => {
      return !!path.push(p);
    });
    expect(path).toEqual([
      "test-key",
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
      "___CONDUIT___:Date",
      ISO,
      "key",
      "value",
      "map",
      "___CONDUIT___:Map{}",
      "___CONDUIT___:[]",
      "hello",
      "goodbye",
      "___CONDUIT___:[]",
      "___CONDUIT___:Map{}",
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
      "___CONDUIT___:RegExp",
      "/test-pattern(\\d{4})/",
      "set",
      "___CONDUIT___:Set{}",
      "___CONDUIT___:[]",
      "hello",
      "goodbye",
      "___CONDUIT___:[]",
      "___CONDUIT___:Set{}",
      "___CONDUIT___:{}",
    ]);
  });
});
