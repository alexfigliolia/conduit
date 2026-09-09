import type { NonFunction } from "@figliolia/galena";

import { TypeChecker } from "../Cache/Serialization";
import type { CacheOptions, SerializedCacheEntry } from "../Cache";
import { CacheEntry, CacheAbstract } from "../Cache";

export class StringifyCache extends CacheAbstract<
  FlatCache,
  SerializedFlatCache
> {
  public override storage: Record<string, CacheEntry<any, void>> = {};
  constructor(options?: CacheOptions<SerializedFlatCache>) {
    super(options);
    const serializedCache = options?.data?.data;
    if (serializedCache) {
      for (const key in serializedCache) {
        if (serializedCache[key]) {
          this.storage[key] = this.createCacheEntryFromSerialized({
            ...serializedCache[key],
            onEvict: () => {
              delete this.storage[key];
            },
          });
        }
      }
    }
  }

  public override serialize() {
    return {
      data: Object.keys(this.storage).reduce((acc, next) => {
        acc[next] = this.storage[next]!.serialize();
        return acc;
      }, {} as SerializedFlatCache),
      lastPageID: this.InfiniteCache.lastPageID,
      lastInfiniteID: this.InfiniteCache.lastInfiniteID,
    };
  }

  public set<T>(key: any[], args: any[], value: NonFunction<T> | (() => T)) {
    const entry = new CacheEntry<T, void>({
      onEvict: () => this.evict(key, args),
      // @ts-expect-error "typescript function discrimination bug"
      value: typeof value === "function" ? value() : value,
    });
    this.storage[this.hash(key, args)] = entry;
    return entry;
  }

  public get<T>(key: any[], args: any[]) {
    return this.storage[this.hash(key, args)] as
      | CacheEntry<T, void>
      | undefined;
  }

  public evict(key: any[], args: any[]) {
    delete this.storage[this.hash(key, args)];
  }

  public createEntryIfNotExists<T>(
    key: any[],
    args: any[],
    value: NonFunction<T> | (() => NonFunction<T>),
  ) {
    const hash = this.hash(key, args);
    if (!(hash in this.storage)) {
      this.storage[hash] = new CacheEntry({
        // @ts-expect-error "typescript function discrimination bug"
        value: typeof value === "function" ? value() : value,
        onEvict: () => this.evict(key, args),
      });
    }
    return this.storage[hash]! as CacheEntry<T, void>;
  }

  public reset() {
    this.storage = {};
  }

  protected hash(key: any[], args: any[]) {
    return JSON.stringify([key, args], (_, val) => {
      if (TypeChecker.isHashTable(val)) {
        return Object.keys(val)
          .sort()
          .reduce((result, key) => {
            result[key] = val[key];
            return result;
          }, {} as any);
      }
      if (typeof val === "bigint") {
        return val.toString();
      }
      return val;
    });
  }
}

export type FlatCache = Record<string, CacheEntry<any, void>>;
export type SerializedFlatCache = Record<string, SerializedCacheEntry>;
