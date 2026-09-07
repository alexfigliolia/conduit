import type { NonFunction } from "@figliolia/galena";

import { TypeChecker } from "../Cache/Serialization";
import { CacheAbstract, CacheEntry } from "../Cache";

export class StringifyCache extends CacheAbstract<
  Record<string, CacheEntry<any, void>>
> {
  public storage = this.options.data ?? {};

  public override serialize() {
    return {
      data: this.storage,
      lastPageID: this.InfiniteCache.lastPageID,
      lastInfiniteID: this.InfiniteCache.lastInfiniteID,
    };
  }

  public set<T extends NonFunction<any>>(
    key: any[],
    args: any[],
    value: T | (() => T),
  ) {
    const entry = new CacheEntry<T, void>({
      evict: () => this.evict(key, args),
      // @ts-expect-error typescript bug
      defaultValue: typeof value === "function" ? value() : value,
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

  public createEntryIfNotExists<T>(key: any[], args: any[], defaultValue: T) {
    const hash = this.hash(key, args);
    if (!(hash in this.storage)) {
      this.storage[hash] = new CacheEntry({
        defaultValue,
        evict: () => this.evict(key, args),
      });
    }
    return this.storage[hash]!;
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
