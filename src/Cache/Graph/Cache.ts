import type { SerializedNode } from "./types";
import { Graph } from "./Graph";
import { CacheAbstract } from "./CacheAbstract";

export class Cache extends CacheAbstract<
  Graph,
  Record<string, SerializedNode>
> {
  constructor(initialState?: Record<string, SerializedNode>) {
    super(Graph.fromSerialized(initialState));
  }

  public serialize() {
    return this.storage.serialize().nodes;
  }

  public set<T>(key: any[], args: any[], value: T) {
    return this.storage.index(key, args, value);
  }

  public createEntryIfNotExists<T>(key: any[], args: any[], defaultValue: T) {
    return this.storage.createCacheEntryIfNotExists(key, args, defaultValue);
  }

  public get<T>(key: any[], args: any[]) {
    return this.storage.lookup<T>(key, args);
  }

  public evict(key: any[], args: any[]) {
    return this.get(key, args)?.evict();
  }

  public reset() {
    return this.storage.reset();
  }
}
