import type {
  CachePolicy,
  ConduitValue,
  IConduitWithPolicy,
  IExecuteOptions,
  IKey,
  IValueType,
  MaybeCacheEntry,
} from "./types";
import { ConduitStatus, type IConduit, type IOperation } from "./types";
import { Cache } from "./Cache";

export class Conduit<O extends IOperation, D = IValueType<O>> {
  public readonly options: IConduitWithPolicy<O, D>;
  public static readonly DEFAULT_LIFE_TIME = 1000 * 60 * 5;
  constructor(options: IConduit<O, D>) {
    this.options = Object.freeze(this.validateOptions(options));
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
    const cacheEntry = cache?.createEntryIfNotExists?.<ConduitValue<O, D>>(
      [this.options.key, args],
      this.options.defaultValue,
    );
    const resolvedPolicy = this.validateCachePolicy(
      this.options.key,
      cache,
      this.options.cachePolicy,
      cachePolicy,
    );
    switch (resolvedPolicy) {
      case "cache-only":
        if (!cacheEntry) {
          throw this.cachePolicyError("cache-only");
        }
        return cacheEntry.read();
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

  private executeAndCache(
    cacheEntry: MaybeCacheEntry<O, D>,
    ...args: Parameters<O>
  ) {
    cacheEntry?.Status?.set?.(ConduitStatus.IN_FLIGHT);
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
    return cacheEntry.read();
  }

  private onExecutionResult(
    cacheEntry: MaybeCacheEntry<O, D>,
    value: IValueType<O>,
  ) {
    cacheEntry?.write?.(value);
    cacheEntry?.Status?.set?.(ConduitStatus.IDOL);
  }

  private validateOptions(options: IConduit<O, D>) {
    options.cachePolicy = this.validateCachePolicy(
      options.key,
      this.getCache(options),
      "read-cache-with-respect-to-expiry",
      options.cachePolicy,
    );
    return options as IConduitWithPolicy<O, D>;
  }

  private validateCachePolicy(
    key: IKey,
    cache: Cache | undefined,
    fallback: CachePolicy = "read-cache-with-respect-to-expiry",
    policy?: CachePolicy,
  ): CachePolicy {
    if (!cache && policy && policy !== "no-cache") {
      console.warn(
        `A conduit with the key "${key as any}" is using a cachePolicy of "${policy}", but no cache is specified. Switching to the "no-cache" policy`,
      );
      return "no-cache";
    }
    return !cache ? "no-cache" : (policy ?? fallback);
  }

  private cachePolicyError(policy: CachePolicy) {
    return new Error(
      `Internal Error: Use of "${policy}" policy without specifying the 'cache' option`,
    );
  }
}
