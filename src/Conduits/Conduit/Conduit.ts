import {
  type CacheEntry,
  type UnknownCacheAbstract,
  CacheAbstract,
  ConduitStatus,
} from "../../Cache";

import {
  type CachePolicy,
  type ConduitValue,
  type IConduit,
  type IConduitWithPolicy,
  type IExecuteOptions,
  type IOperation,
  type IValueType,
  type ConduitCacheSubscriber,
  type ConduitCacheWrite,
  type EvictReturnType,
  type MaybeCacheEntry,
} from "./types";

export class Conduit<
  O extends IOperation,
  D = IValueType<O>,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> {
  public readonly options: IConduitWithPolicy<O, D, C>;
  public static DEFAULT_LIFE_TIME = 1000 * 60 * 5;
  constructor(options: IConduit<O, D, C>) {
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
    this.options = Object.freeze(options as IConduitWithPolicy<O, D, C>);
  }

  public getCache(options: IConduit<O, D, C> = this.options) {
    if (typeof options.cache === "function") {
      return options.cache();
    }
    if (options.cache instanceof CacheAbstract) {
      return options.cache;
    }
  }

  public prepare(options: Omit<IExecuteOptions<O>, "args"> = {}) {
    return (...args: Parameters<O>) => this.execute({ ...options, args });
  }

  public execute({
    args,
    expires = this.options.expires,
    cachePolicy = this.options.cachePolicy,
  }: IExecuteOptions<O>) {
    const cache = this.getCache();
    if (!cache && cachePolicy && cachePolicy !== "no-cache") {
      throw this.cachePolicyError(cachePolicy);
    }
    const cacheEntry = cache?.createEntryIfNotExists?.(
      this.options.key,
      args,
      this.options.defaultValue,
    ) as MaybeCacheEntry<O, D>;
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
    return this.getCacheEntry(...args).subscribeToValue(onChange);
  }

  public subscribeToStatus({
    args,
    onChange,
  }: ConduitCacheSubscriber<O, ConduitStatus>) {
    return this.getCacheEntry(...args).subscribeToStatus(onChange);
  }

  public getStatus(...args: Parameters<O>) {
    return this.getCacheEntry(...args).getStatus();
  }

  public writeCache({ args, value }: ConduitCacheWrite<O, D>) {
    return this.getCacheEntry(...args).writeValue(value);
  }

  public readCache(...args: Parameters<O>) {
    return this.getCacheEntry(...args).readValue();
  }

  public evict(...args: Parameters<O>) {
    return this.getCacheEntry(...args).evict();
  }

  public getCacheEntry(...args: Parameters<O>) {
    const cache = this.getCache();
    if (!cache) {
      throw new Error(
        "Attempted to interact with a cache entry without specifying the Conduit's 'cache' option",
        { cause: this },
      );
    }
    return cache.createEntryIfNotExists(
      this.options.key,
      args,
      this.options.defaultValue,
    ) as CacheEntry<ConduitValue<O, D>, EvictReturnType<C>>;
  }

  protected executeAndCache(
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

  protected runCacheFirst(
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
    return cacheEntry.readValue() as ConduitValue<O, D>;
  }

  protected onExecutionResult(
    cacheEntry: MaybeCacheEntry<O, D>,
    value: IValueType<O>,
  ) {
    cacheEntry?.writeValue?.(value);
    cacheEntry?.setStatus?.(ConduitStatus.IDOL);
  }

  protected cachePolicyError(policy: CachePolicy) {
    return new Error(
      `Cache Policy Error: Use of "${policy}" policy without specifying the 'cache' option`,
      { cause: this },
    );
  }
}
