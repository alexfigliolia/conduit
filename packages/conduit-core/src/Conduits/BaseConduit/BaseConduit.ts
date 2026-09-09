import type { NonFunction } from "@figliolia/galena";

import {
  type ConduitStatus,
  type UnknownCacheAbstract,
  type CacheEntry,
} from "../../Cache";

import type {
  IOperation,
  IConduitWithPolicy,
  IConduit,
  EvictReturnType,
  CacheGetter,
} from "./types";

export abstract class BaseConduit<
  O extends IOperation,
  D = undefined,
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
  public abstract subscribe(...args: any[]): () => void;
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

  public static getCache<C extends UnknownCacheAbstract = UnknownCacheAbstract>(
    cache: CacheGetter<C>,
  ) {
    if (typeof cache === "function") {
      return cache();
    }
    return cache;
  }

  public get expires() {
    return this.options.expires ?? BaseConduit.DEFAULT_LIFE_TIME;
  }

  protected static getCacheEntry<
    C extends UnknownCacheAbstract,
    T extends NonFunction<any>,
  >(cache: C, key: any[], args: any[], defaultValue: T | (() => T)) {
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
}
