import { Indexable } from "../Indexable";

export class StringifyCache {
  private storage: Record<any, any>;
  constructor(initialState: Record<any, any> = {}) {
    this.storage = initialState;
  }

  public toSerialized() {
    return this.storage;
  }

  public set<T>(args: any, value: T) {
    this.storage[this.hash(args)] = value;
  }

  public get<T>(args: any) {
    return this.storage[this.hash(args)] as T | undefined;
  }

  public reset() {
    this.storage = {};
  }

  private hash(args: any) {
    return JSON.stringify(args, (_, val) => {
      if (Indexable.isHashTable(val)) {
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
