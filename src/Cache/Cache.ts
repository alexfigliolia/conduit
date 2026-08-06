import type { ConduitStatus } from "../Conduits";

import type { SerializedNode } from "./types";
import { NodeParent } from "./NodeParent";
import { Graph } from "./Graph";

export class Cache {
  private readonly storage = new Graph();
  constructor(initialState: Record<string, SerializedNode> = {}) {
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

  public set<T>(args: any, value: T) {
    return this.storage.index(args, value);
  }

  public subscribeToValue<T>(
    key: any,
    defaultValue: T,
    onChange: (value: T) => void,
  ) {
    const entry = this.createEntryIfNotExists(key, defaultValue);
    return entry.subscribeToValue(onChange);
  }

  public subscribeToStatus<T>(
    key: any,
    defaultValue: T,
    onChange: (value: ConduitStatus) => void,
  ) {
    const entry = this.createEntryIfNotExists(key, defaultValue);
    return entry.subscribeToStatus(onChange);
  }

  public createEntryIfNotExists<T>(key: any, defaultValue: T) {
    return this.storage.createCacheEntryIfNotExists(key, defaultValue);
  }

  public get<T>(key: any) {
    return this.storage.lookup<T>(key);
  }

  public evict(key: any) {
    return this.storage.evict(key);
  }

  public reset() {
    return this.storage.reset();
  }
}
