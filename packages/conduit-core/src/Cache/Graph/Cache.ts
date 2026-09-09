import type { NonFunction } from "@figliolia/galena";

import type { CacheOptions, SerializedGraph, SerializedNode } from "./types";
import { Graph } from "./Graph";
import { CacheAbstract } from "./CacheAbstract";

export class Cache extends CacheAbstract<
  Graph,
  Record<string, SerializedNode>
> {
  public readonly storage: Graph<any>;
  constructor(options?: CacheOptions<Record<string, SerializedNode>>) {
    super(options);
    this.storage = Graph.fromSerialized({
      graph: options?.data?.data,
      onEvict: this.onCacheEntryEvict,
      onCreate: this.onCacheEntryCreate,
    });
  }

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
    return entry?.evict?.();
  }

  public reset() {
    this.storage.reset();
    this.InfiniteCache.onReset();
  }
}
