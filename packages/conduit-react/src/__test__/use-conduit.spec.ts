import { beforeEach } from "node:test";

import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { Cache, ConduitStatus } from "@figliolia/conduit";

import { useConduit } from "../use-conduit";
import {
  createAsyncConduit,
  createSyncConduit,
} from "../../../conduit-core/src/__fixtures__/Conduits";

const cache = new Cache();

describe("Use Conduit", () => {
  beforeEach(() => {
    cache.reset();
  });

  it("It returns a the conduit's value, status, and fetcher as reactive values - sync", () => {
    // @ts-expect-error using bundled conduit dependencies
    const conduit = createSyncConduit({ cache });
    const args = [1, 2, 3];
    // @ts-expect-error using bundled conduit dependencies
    const { result } = renderHook(() => useConduit(conduit, { args }));
    expect(result.current.value).toEqual(args);
    expect(result.current.status).toEqual(ConduitStatus.IDOL);
    act(() => {
      expect(result.current.refetch()).toEqual(args);
    });
    expect(conduit.options.operation).toHaveBeenCalledTimes(2);
  });

  it("It returns a the conduit's value, status, and fetcher as reactive values - async", async () => {
    vi.useFakeTimers();
    vi.setTimerTickMode("manual");
    // @ts-expect-error  using bundled conduit dependencies
    const conduit = createAsyncConduit({ cache });
    const args = [1, 2, 3];
    const { result } = renderHook(() =>
      // @ts-expect-error using bundled conduit dependencies
      useConduit(conduit, { args }),
    );
    expect(result.current.value).toEqual(undefined);
    expect(result.current.status).toEqual(ConduitStatus.IN_FLIGHT);
    await act(() => vi.advanceTimersByTime(1100));
    expect(result.current.value).toEqual([1, 2, 3]);
    expect(result.current.status).toEqual(ConduitStatus.IDOL);
    act(() => conduit.writeCache({ args, value: [1, 2, 3, 4] }));
    expect(result.current.value).toEqual([1, 2, 3, 4]);
  });
});
