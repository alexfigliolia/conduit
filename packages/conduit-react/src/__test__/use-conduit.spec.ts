import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { Cache, Conduit, ConduitStatus } from "@figliolia/conduit";

import { useConduit } from "../use-conduit";

const cache = new Cache();

describe("Use Conduit", () => {
  beforeEach(() => {
    cache.reset();
  });

  const args1 = [1, 2, 3];
  const args2 = [4, 5, 6];

  it("It returns a the conduit's value, status, and fetcher as reactive values - sync", async () => {
    const conduit = new Conduit({
      cache,
      key: ["test"],
      operation: vi.fn().mockImplementation((...args: number[]) => args),
    });

    const { result, rerender } = renderHook((args: number[] = args1) =>
      useConduit(conduit, { args }),
    );
    expect(result.current.value).toEqual(args1);
    expect(result.current.status).toEqual(ConduitStatus.IDOL);
    act(() => {
      expect(result.current.refetch()).toEqual(args1);
    });
    expect(conduit.options.operation).toHaveBeenCalledTimes(2);
    rerender(args2);
    expect(result.current.value).toEqual(args2);
  });

  it("It returns a the conduit's value, status, and fetcher as reactive values - async", async () => {
    const conduit = new Conduit({
      cache,
      key: ["test"],
      operation: vi.fn().mockImplementation(async (...args: number[]) => args),
    });
    const { result, rerender } = renderHook((args: number[] = args1) =>
      useConduit(conduit, { args }),
    );
    expect(result.current.value).toEqual(undefined);
    expect(result.current.status).toEqual(ConduitStatus.IN_FLIGHT);
    await act(() => Promise.resolve());
    expect(result.current.value).toEqual(args1);
    expect(result.current.status).toEqual(ConduitStatus.IDOL);
    rerender(args2);
    await act(() => Promise.resolve());
    expect(conduit.options.operation).toHaveBeenCalledTimes(2);
  });

  it("It skips operations when the designated skip option is true", async () => {
    const conduit = new Conduit({
      cache,
      key: ["test"],
      operation: vi.fn().mockImplementation(async (...args: number[]) => args),
    });
    const { result, rerender } = renderHook((args: number[] = args1) =>
      useConduit(conduit, { args, skipWhen: args[0] === 4 }),
    );
    expect(result.current.value).toEqual(undefined);
    expect(result.current.status).toEqual(ConduitStatus.IN_FLIGHT);
    await act(() => Promise.resolve());
    expect(result.current.value).toEqual(args1);
    expect(result.current.status).toEqual(ConduitStatus.IDOL);
    rerender(args2);
    await act(() => Promise.resolve());
    expect(result.current.value).toEqual(args1);
    expect(conduit.options.operation).toHaveBeenCalledTimes(1);
    await act(() => result.current.refetch);
    expect(result.current.value).toEqual(args1);
    expect(conduit.options.operation).toHaveBeenCalledTimes(1);
  });
});
