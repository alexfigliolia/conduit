import type { NonFunction } from "@figliolia/galena";

import type { SerializedGraph, SerializedNode } from "./types";
import { Graph } from "./Graph";
import { CacheAbstract } from "./CacheAbstract";

export class Cache extends CacheAbstract<
  Graph,
  Record<string, SerializedNode>
> {
  public storage = Graph.fromSerialized(this.options.data, this);

  public override serialize(): SerializedGraph {
    return {
      data: this.storage.serialize(this).nodes,
      lastPageID: this.InfiniteCache.lastPageID,
      lastInfiniteID: this.InfiniteCache.lastInfiniteID,
    };
  }

  public set<T extends NonFunction<any>>(
    key: any[],
    args: any[],
    value: T | (() => T),
  ) {
    return this.storage.index(key, args, value);
  }

  public createEntryIfNotExists<T extends NonFunction<any>>(
    key: any[],
    args: any[],
    defaultValue: T | (() => T),
  ) {
    return this.storage.createCacheEntryIfNotExists<T>(key, args, defaultValue);
  }

  public get<T>(key: any[], args: any[]) {
    return this.storage.lookup<T>(key, args);
  }

  public evict(key: any[], args: any[]) {
    const entry = this.get(key, args);
    const result = entry?.evict?.();
    if (entry) {
      this.InfiniteCache.onEvict(entry);
    }
    return result;
  }

  public reset() {
    return this.storage.reset();
  }
}
