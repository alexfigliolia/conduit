import { TypeChecker } from "../Cache/Serialization";
import { CacheAbstract, CacheEntry } from "../Cache";

export class StringifyCache extends CacheAbstract<
  Record<string, CacheEntry<any, void>>
> {
  constructor(initialState: Record<string, CacheEntry<any, void>> = {}) {
    super(initialState);
  }

  public serialize() {
    return this.storage;
  }

  public set<T>(key: any[], args: any[], value: T) {
    const entry = new CacheEntry({
      defaultValue: value,
      evict: () => this.evict(key, args),
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
