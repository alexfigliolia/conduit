import type { NonFunction } from "@figliolia/galena";

import { Serializer } from "../Serialization";
import { InfiniteConduitValue } from "../../Conduits/InfiniteConduit/InfiniteConduitValue";
import { InfiniteConduitPage } from "../../Conduits/InfiniteConduit/InfiniteConduitPage";

import type { CacheOptions, ICacheEntry, SerializedStorage } from "./types";
import { InfiniteCache } from "./InfiniteCache";
import { CacheEntry } from "./CacheEntry";

export abstract class CacheAbstract<
  Storage extends Record<any, any>,
  StorageSerialized extends Record<any, any> = Storage,
> {
  public abstract storage: Storage;
  public readonly InfiniteCache: InfiniteCache<typeof this>;
  constructor({
    data = {},
    serializers = [],
  }: CacheOptions<StorageSerialized> = {}) {
    this.InfiniteCache = new InfiniteCache(data);
    Serializer.registerJSONSerializer(...serializers);
  }

  public abstract serialize(): SerializedStorage<StorageSerialized>;

  public abstract set<T extends NonFunction<any>>(
    key: any[],
    args: any[],
    value: T | (() => T),
  ): CacheEntry<T, any> | undefined;

  public abstract get<T>(
    key: any[],
    args: any[],
  ): CacheEntry<T, any> | undefined;

  public abstract reset(): void;

  public abstract evict(key: any[], args: any[]): unknown;

  public abstract createEntryIfNotExists<T extends NonFunction<any>>(
    key: any[],
    args: any[],
    defaultValue: T | (() => T),
  ): CacheEntry<T, any>;

  public createCacheEntryFromValue<T>(value: NonFunction<T>) {
    const entry = new CacheEntry<T, void>({
      value,
      onEvict: this.onCacheEntryEvict,
    });
    this.onCacheEntryCreate(entry, value);
    return entry;
  }

  public createCacheEntryFromSerialized<T>(
    input: Omit<ICacheEntry<T, any>, "serialize">,
  ) {
    const { value, ...rest } = input;
    const entry = new CacheEntry<T, void>({
      ...rest,
      value: Serializer.deserialize(value),
      onEvict: this.onCacheEntryEvict,
    });
    this.onCacheEntryCreate(entry, value);
    return entry;
  }

  protected readonly onCacheEntryCreate = <T>(
    node: CacheEntry<T, any>,
    value: NonFunction<T>,
  ) => {
    if (value instanceof InfiniteConduitValue) {
      this.InfiniteCache.registerInfiniteNode(node as any);
    } else if (value instanceof InfiniteConduitPage) {
      this.InfiniteCache.registerPageNode(node as any);
    }
  };

  protected readonly onCacheEntryEvict = (node: CacheEntry<any, unknown>) => {
    const value = node.getValue();
    if (value instanceof InfiniteConduitValue) {
      this.InfiniteCache.deleteInfiniteNode(node as any);
    } else if (value instanceof InfiniteConduitPage) {
      this.InfiniteCache.deletePageNode(node as any);
    }
  };
}
