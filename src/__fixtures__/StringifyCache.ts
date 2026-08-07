import { TypeChecker } from "../Cache/TypeChecker";
import { CacheAbstract } from "../Cache/CacheAbstract";
import { Graph, CacheEntry } from "../Cache";

export class StringifyCache extends CacheAbstract<
  Record<string, CacheEntry<any>>
> {
  protected override storage: Record<any, CacheEntry<any>>;
  constructor(initialState: Record<any, any> = {}) {
    super();
    this.storage = initialState;
  }

  public serialize() {
    return this.storage;
  }

  public set<T>(key: any[], args: any[], value: T) {
    const entry = new CacheEntry(value, new Graph());
    this.storage[this.hash(key, args)] = entry;
    return entry;
  }

  public get<T>(key: any[], args: any[]) {
    return this.storage[this.hash(key, args)] as CacheEntry<T> | undefined;
  }

  public evict(key: any[], args: any[]) {
    delete this.storage[this.hash(key, args)];
  }

  public createEntryIfNotExists<T>(key: any[], args: any[], defaultValue: T) {
    const hash = this.hash(key, args);
    if (!(hash in this.storage)) {
      this.storage[hash] = new CacheEntry(defaultValue, new Graph());
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
