import { beforeEach, describe, expect, it, vi } from "vitest";
import { State } from "@figliolia/galena";

import { ReactivePaginated } from "../ReactivePaginated";
import { Reactive } from "../Reactive";
import { Cache } from "../Cache";
import { Base } from "../Base";

const cache = new Cache();

describe("Flow", () => {
  beforeEach(() => {
    cache.reset();
  });

  it("Initialization", () => {
    const cache = new Cache({
      data: true,
      paginated: [1, 2, 3, 4],
    });
    new ReactivePaginated({
      getCache: () => cache,
      key: ["paginated"],
      operation: (value: number) => value,
      getPage: args => (args[0] ?? 1) - 1,
    });
    expect(cache.get("paginated")).toEqual([1, 2, 3, 4]);
    [0, 1, 2, 3].forEach(value => {
      expect(cache.get(Base.toKey(["paginated", value]))).toEqual(value + 1);
    });
  });

  it("Reactives", async () => {
    const globalSub = vi.fn();
    const localSub = vi.fn();
    const query = new Reactive({
      expiresIn: 1000 * 60 * 5,
      getCache: () => cache,
      key: ["test"],
      operation: (data: boolean = true) => {
        return new Promise<{ data: boolean }>(resolve => {
          resolve({ data });
        });
      },
      defaultValue: undefined,
    });
    expect(cache.get("test")).toEqual(undefined);
    expect(cache.getEntry("test")).toBeInstanceOf(State);
    const unsubscribeGlobal = cache.subscribe(globalSub);
    const unsubscribeLocal = cache.subscribeTo("test", localSub);
    const result = query.execute(true);
    expect(result).toBeInstanceOf(Promise);
    expect(await result).toEqual({ data: true });
    expect(globalSub).toHaveBeenCalledWith({ test: { data: true } });
    expect(localSub).toHaveBeenCalledWith({ data: true });
    unsubscribeLocal();
    unsubscribeGlobal();
  });

  it("Reactive Paginateds", async () => {
    const globalSub = vi.fn();
    const localSub = vi.fn();
    const query = new ReactivePaginated({
      expiresIn: 1000 * 60 * 5,
      getCache: () => cache,
      key: ["test"],
      operation: (page: number = 0) => {
        return new Promise<{ isEven: boolean }>(resolve => {
          resolve({ isEven: page % 2 === 0 ? true : false });
        });
      },
      getPage: args => args[0] ?? 0,
    });
    expect(cache.get("test")).toEqual([]);
    expect(cache.getEntry("test")).toBeInstanceOf(State);
    const unsubscribeGlobal = cache.subscribe(globalSub);
    const unsubscribeLocal = cache.subscribeTo("test", localSub);
    const result = query.execute();
    expect(result).toBeInstanceOf(Promise);
    expect(await result).toEqual({ isEven: true });
    expect(globalSub).toHaveBeenCalledWith({
      test: [
        {
          isEven: true,
        },
      ],
      "test.0": {
        isEven: true,
      },
    });
    expect(localSub).toHaveBeenCalledWith([{ isEven: true }]);
    await query.execute(1);
    expect(globalSub).toHaveBeenCalledWith({
      test: [
        {
          isEven: true,
        },
        {
          isEven: false,
        },
      ],
      "test.0": {
        isEven: true,
      },
      "test.1": {
        isEven: false,
      },
    });
    expect(localSub).toHaveBeenCalledWith([
      { isEven: true },
      { isEven: false },
    ]);
    unsubscribeLocal();
    unsubscribeGlobal();
  });
});
