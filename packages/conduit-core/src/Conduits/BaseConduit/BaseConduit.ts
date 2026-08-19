import {
  type UnknownCacheAbstract,
  ConduitStatus,
  type CacheEntry,
} from "../../Cache";

import type {
  IOperation,
  IValueType, // walk away. If you can afford to move somewhere far from metropolotan areas
  IConduitWithPolicy,
  IConduit,
  ConduitValue,
  EvictReturnType,
  IExecutionOptionsWithCacheEntry,
} from "./types";

export abstract class BaseConduit<
  O extends IOperation,
  D = IValueType<O>,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> {
  public readonly options: IConduitWithPolicy<O, D, C>;
  public static readonly DEFAULT_LIFE_TIME = 1000 * 60 * 5;
  constructor(options: IConduit<O, D, C>) {
    options.cachePolicy =
      options.cachePolicy ?? "read-cache-with-respect-to-expiry";
    this.options = Object.freeze(options as IConduitWithPolicy<O, D, C>);
  }

  public abstract execute(options: any): unknown;
  public abstract subscribeToValue(...args: any[]): () => void;
  public abstract subscribeToStatus(...args: any[]): () => void;
  public abstract getStatus(...args: any[]): ConduitStatus;
  public abstract writeCache(...args: any[]): void;
  public abstract readCache(...args: any[]): any;
  public abstract evict(...args: any[]): any;
  public abstract getCacheEntry(...args: any[]): CacheEntry<any, any>;

  public getCache(options: IConduit<O, D, C> = this.options) {
    if (typeof options.cache === "function") {
      return options.cache();
    }
    return options.cache;
  }

  protected static getCacheEntry<C extends UnknownCacheAbstract, T>(
    cache: C,
    key: any[],
    args: any[],
    defaultValue: T,
  ) {
    if (!cache) {
      throw new Error(
        "Attempted to interact with a cache entry without specifying the Conduit's 'cache' option",
        { cause: this },
      );
    }
    return cache.createEntryIfNotExists(key, args, defaultValue) as CacheEntry<
      T,
      EvictReturnType<C>
    >;
  }

  protected runWithCachePolicy<
    T extends IExecutionOptionsWithCacheEntry<any, ConduitValue<O, D>>,
  >({
    args,
    cacheEntry,
    cachePolicy = this.options.cachePolicy,
    expires = this.options.expires ?? BaseConduit.DEFAULT_LIFE_TIME,
  }: T) {
    switch (cachePolicy) {
      case "cache-only":
        return cacheEntry.getValue() as ConduitValue<O, D>;
      case "no-cache":
        return this.executeAndCache(cacheEntry, args) as ReturnType<O>;
      case "read-cache-with-respect-to-expiry":
      default:
        return this.runCacheFirst(cacheEntry, expires, args) as
          | ConduitValue<O, D>
          | ReturnType<O>;
    }
  }

  protected executeAndCache(
    cacheEntry: CacheEntry<ConduitValue<O, D>, any>,
    args: Parameters<O>,
  ) {
    const outstandingTask = cacheEntry.getOutstandingTask<ReturnType<O>>();
    if (outstandingTask) {
      return outstandingTask;
    }
    cacheEntry.setStatus(ConduitStatus.IN_FLIGHT);
    const result = cacheEntry.registerTask(this.options.operation(...args));
    if (result instanceof Promise) {
      void result.then(v => this.onExecutionResult(cacheEntry, v));
    } else {
      this.onExecutionResult(cacheEntry, result);
    }
    return result as ReturnType<O>;
  }

  protected runCacheFirst(
    cacheEntry: CacheEntry<ConduitValue<O, D>, any>,
    expiry: number,
    args: Parameters<O>,
  ) {
    if (Date.now() - cacheEntry.updatedAt >= expiry) {
      return this.executeAndCache(cacheEntry, args) as ReturnType<O>;
    }
    // TODO - maybe a cache refresh on an interval in the background
    return cacheEntry.getValue() as ConduitValue<O, D>;
  }

  protected onExecutionResult(
    cacheEntry: CacheEntry<ConduitValue<O, D>, any>,
    value: IValueType<O>,
  ) {
    cacheEntry.setValue(value);
    cacheEntry.setStatus(ConduitStatus.IDOL);
  }
}
