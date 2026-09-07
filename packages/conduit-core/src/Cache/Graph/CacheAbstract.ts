import type { NonFunction } from "@figliolia/galena";

import type { InfiniteConduitValue } from "../../Conduits/InfiniteConduit/InfiniteConduitValue";
import type { InfiniteConduitPage } from "../../Conduits/InfiniteConduit/InfiniteConduitPage";
import type { EvictReturnType } from "../../Conduits/BaseConduit/types";

import type { SerializedStorage, UnknownCacheAbstract } from "./types";
import { InfiniteCache } from "./InfiniteCache";
import type { CacheEntry } from "./CacheEntry";

export abstract class CacheAbstract<
  Storage extends Record<any, any>,
  StorageSerialized extends Record<any, any> = Storage,
> {
  public abstract storage: Storage;
  public readonly InfiniteCache = new InfiniteCache(this.options);
  constructor(
    public readonly options: Partial<SerializedStorage<StorageSerialized>> = {},
  ) {}

  public abstract serialize(): SerializedStorage<StorageSerialized>;

  public abstract set<T extends NonFunction<any>>(
    key: any[],
    args: any[],
    value: T | (() => T),
  ): CacheEntry<T, unknown>;

  public abstract get<T>(
    key: any[],
    args: any[],
  ): CacheEntry<T, EvictReturnType<UnknownCacheAbstract>> | undefined;

  public abstract reset(): void;

  public abstract evict(key: any[], args: any[]): unknown;

  public abstract createEntryIfNotExists<T extends NonFunction<any>>(
    key: any[],
    args: any[],
    defaultValue: T | (() => T),
  ): CacheEntry<T, unknown>;

  public getInfiniteCacheEntry<T>(ID: string) {
    return this.InfiniteCache.getInfiniteNode<T>(ID);
  }

  public getPageCacheEntry<T>(ID: string) {
    return this.InfiniteCache.getPageNode<T>(ID);
  }

  public registerInfiniteCacheEntry<C extends UnknownCacheAbstract>(
    cacheNode: CacheEntry<InfiniteConduitValue<any, C>, EvictReturnType<C>>,
  ) {
    this.InfiniteCache.registerInfiniteNode(cacheNode);
  }

  public registerPageCacheEntry<C extends UnknownCacheAbstract>(
    cacheNode: CacheEntry<InfiniteConduitPage<any, C>, EvictReturnType<C>>,
  ) {
    this.InfiniteCache.registerPageNode(cacheNode);
  }

  public evictInfiniteCacheEntry(ID: string) {
    this.InfiniteCache.deleteInfiniteNode(ID);
  }

  public evictPageCacheEntry(ID: string) {
    this.InfiniteCache.deletePageNode(ID);
  }
}
