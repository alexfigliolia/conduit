import { Cache } from "../Cache/Cache";

import {
  type CachePolicy,
  type ConduitValue,
  type IConduit,
  type IConduitWithPolicy,
  type IExecuteOptions,
  type IOperation,
  type MaybeCacheEntry,
  type IValueType,
  ConduitStatus,
} from "./types";
import type { ConduitCacheSubscriber, ConduitCacheWrite } from "./types";

export class Conduit<O extends IOperation, D = IValueType<O>> {
  public readonly options: IConduitWithPolicy<O, D>;
  public static readonly DEFAULT_LIFE_TIME = 1000 * 60 * 5;
  constructor(options: IConduit<O, D>) {
    const cache = this.getCache(options);
    if (!cache) {
      if (!options.cachePolicy) {
        options.cachePolicy = "no-cache";
      } else if (options.cachePolicy !== "no-cache") {
        throw this.cachePolicyError(options.cachePolicy);
      }
    }
    options.cachePolicy =
      options.cachePolicy ?? "read-cache-with-respect-to-expiry";
    this.options = Object.freeze(options as IConduitWithPolicy<O, D>);
  }

  public getCache(options: IConduit<O, D> = this.options) {
    if (typeof options.cache === "function") {
      return options.cache();
    }
    if (options.cache instanceof Cache) {
      return options.cache;
    }
  }

  public prepare(options: Omit<IExecuteOptions<O>, "args"> = {}) {
    return (...args: Parameters<O>) => this.execute({ ...options, args });
  }

  public execute({ args, expires, cachePolicy }: IExecuteOptions<O>) {
    const cache = this.getCache();
    if (!cache && cachePolicy && cachePolicy !== "no-cache") {
      throw this.cachePolicyError(cachePolicy);
    }
    const cacheEntry = cache?.createEntryIfNotExists?.<ConduitValue<O, D>>(
      this.options.key,
      args,
      this.options.defaultValue,
    );
    switch (cachePolicy) {
      case "cache-only":
        if (!cacheEntry) {
          throw this.cachePolicyError("cache-only");
        }
        return cacheEntry.readValue();
      case "no-cache":
        return this.executeAndCache(cacheEntry, ...args);
      case "read-cache-with-respect-to-expiry":
      default:
        return this.runCacheFirst(
          cacheEntry,
          expires ?? this.options.expires ?? Conduit.DEFAULT_LIFE_TIME,
          ...args,
        );
    }
  }

  public subscribeToValue({
    args,
    onChange,
  }: ConduitCacheSubscriber<O, ConduitValue<O, D>>) {
    return this.getCacheEntryStrict(...args).subscribeToValue(onChange);
  }

  public subscribeToStatus({
    args,
    onChange,
  }: ConduitCacheSubscriber<O, ConduitStatus>) {
    return this.getCacheEntryStrict(...args).subscribeToStatus(onChange);
  }

  public getStatus(...args: Parameters<O>) {
    return this.getCacheEntryStrict(...args).getStatus();
  }

  public write({ args, value }: ConduitCacheWrite<O, D>) {
    return this.getCacheEntryStrict(...args).writeValue(value);
  }

  public read(...args: Parameters<O>) {
    return this.getCacheEntryStrict(...args).readValue();
  }

  public evict(...args: Parameters<O>) {
    return this.getCacheEntryStrict(...args).evict();
  }

  public getCacheEntry(...args: Parameters<O>) {
    return this.getCacheEntryStrict(...args);
  }

  private executeAndCache(
    cacheEntry: MaybeCacheEntry<O, D>,
    ...args: Parameters<O>
  ) {
    cacheEntry?.setStatus?.(ConduitStatus.IN_FLIGHT);
    const result = this.options.operation(...args);
    if (result instanceof Promise) {
      void result.then(v => this.onExecutionResult(cacheEntry, v));
    } else {
      this.onExecutionResult(cacheEntry, result);
    }
    return result as ReturnType<O>;
  }

  private runCacheFirst(
    cacheEntry: MaybeCacheEntry<O, D>,
    expiry: number,
    ...args: Parameters<O>
  ) {
    if (!cacheEntry) {
      throw this.cachePolicyError("read-cache-with-respect-to-expiry");
    }
    if (Date.now() - cacheEntry.updatedAt >= expiry) {
      return this.executeAndCache(cacheEntry, ...args);
    }
    // TODO - maybe a cache refresh on an interval in the background
    return cacheEntry.readValue();
  }

  private getCacheEntryStrict(...args: Parameters<O>) {
    const cache = this.getCache();
    if (!cache) {
      throw new Error(
        "Attempted to write to the cache without specifying the Conduit's 'cache' option",
        { cause: this },
      );
    }
    return cache.createEntryIfNotExists<ConduitValue<O, D>>(
      this.options.key,
      args,
      this.options.defaultValue,
    );
  }

  private onExecutionResult(
    cacheEntry: MaybeCacheEntry<O, D>,
    value: IValueType<O>,
  ) {
    cacheEntry?.writeValue?.(value);
    cacheEntry?.setStatus?.(ConduitStatus.IDOL);
  }

  private cachePolicyError(policy: CachePolicy) {
    return new Error(
      `Cache Policy Error: Use of "${policy}" policy without specifying the 'cache' option`,
      { cause: this },
    );
  }
}
