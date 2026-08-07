import type { SerializedNode } from "./types";
import { NodeParent } from "./NodeParent";
import { Graph } from "./Graph";
import { CacheAbstract } from "./CacheAbstract";

export class Cache extends CacheAbstract<Graph> {
  protected override readonly storage = new Graph();
  constructor(initialState: Record<string, SerializedNode> = {}) {
    super();
    for (const key in initialState) {
      if (initialState[key]) {
        this.storage.set(
          key,
          Graph.from(initialState[key], new NodeParent(this.storage, key)),
        );
      }
    }
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
