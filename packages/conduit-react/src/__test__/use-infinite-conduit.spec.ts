import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { Cache, ConduitStatus, InfiniteConduit } from "@figliolia/conduit";

import { useInfiniteConduit } from "../use-infinite-conduit";

const cache = new Cache();

describe("Use Infinite Conduit", () => {
  beforeEach(() => {
    cache.reset();
  });

  const args1 = {
    search: "search query",
    paging: { cursor: "1", pageSize: 10 },
  };
  const args2 = {
    search: "search query",
    paging: { cursor: "2", pageSize: 10 },
  };

  it("It returns a the conduit's value, status, and fetcher as reactive values - sync", () => {
    const conduit = new InfiniteConduit({
      cache,
      key: ["sync"],
      operation: vi
        .fn()
        .mockImplementation(
          (options: {
            search?: string;
            paging: { cursor?: string; pageSize: number };
          }) => {
            return options;
          },
        ),
      paginationArgs: ["paging.cursor", "paging.pageSize"],
    });
    const { result, rerender } = renderHook((args = args1) =>
      useInfiniteConduit(conduit, { args }),
    );
    expect(result.current.value).toEqual([args1]);
    expect(result.current.status).toEqual(ConduitStatus.IDOL);
    rerender(args2);
    expect(result.current.value).toEqual([args1, args2]);
    expect(conduit.options.operation).toHaveBeenCalledTimes(2);
    expect(result.current.refetch()).toEqual(args2);
    expect(conduit.options.operation).toHaveBeenCalledTimes(3);
  });

  it("It returns a the conduit's value, status, and fetcher as reactive values - async", async () => {
    const conduit = new InfiniteConduit({
      cache,
      key: ["async"],
      operation: vi
        .fn()
        .mockImplementation(
          async (options: {
            search?: string;
            paging: { cursor?: string; pageSize: number };
          }) => {
            return options;
          },
        ),
      paginationArgs: ["paging.cursor", "paging.pageSize"],
    });
    const { result, rerender } = renderHook((args = args1) =>
      useInfiniteConduit(conduit, { args }),
    );
    expect(result.current.value).toEqual([]);
    expect(result.current.status).toEqual(ConduitStatus.IN_FLIGHT);
    await act(() => Promise.resolve());
    expect(result.current.value).toEqual([args1]);
    expect(result.current.status).toEqual(ConduitStatus.IDOL);
    rerender(args2);
    await act(() => Promise.resolve());
    expect(result.current.value).toEqual([args1, args2]);
    expect(conduit.options.operation).toHaveBeenCalledTimes(2);
    expect(await result.current.refetch()).toEqual(args2);
    expect(conduit.options.operation).toHaveBeenCalledTimes(3);
  });

  it("Skips operations when the designated skipWhen parameter returns true", async () => {
    const conduit = new InfiniteConduit({
      cache,
      key: ["async"],
      operation: vi
        .fn()
        .mockImplementation(
          async (options: {
            search?: string;
            paging: { cursor?: string; pageSize: number };
          }) => {
            return options;
          },
        ),
      paginationArgs: ["paging.cursor", "paging.pageSize"],
    });
    const { result, rerender } = renderHook((args: typeof args1 = args1) =>
      useInfiniteConduit(conduit, {
        args,
        skipWhen: args.paging.cursor === "2",
      }),
    );
    expect(result.current.value).toEqual([]);
    expect(result.current.status).toEqual(ConduitStatus.IN_FLIGHT);
    await act(() => Promise.resolve());
    expect(result.current.value).toEqual([args1]);
    expect(result.current.status).toEqual(ConduitStatus.IDOL);
    rerender(args2);
    await act(() => Promise.resolve());
    expect(result.current.value).toEqual([args1]);
    expect(conduit.options.operation).toHaveBeenCalledTimes(1);
    // force a refetch on skip arguments
    expect(await result.current.refetch()).toEqual(args2);
    expect(conduit.options.operation).toHaveBeenCalledTimes(2);
    expect(result.current.value).toEqual([args1, args2]);
  });
});
