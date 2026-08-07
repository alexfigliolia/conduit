import { State } from "@figliolia/galena";
import type { NonFunction } from "@figliolia/galena";

import { ConduitStatus } from "../Conduits/types";

import type { SerializedCacheEntry } from "./types";
import { Serializer } from "./Serializer";
import type { Graph } from "./Graph";

export class CacheEntry<T> {
  public lastRead = 0;
  public updatedAt = 0;
  public readonly State: State<T>;
  public readonly Status = new State(ConduitStatus.UNINITIALIZED);
  constructor(
    defaultValue: T,
    public readonly cacheNode: Graph<T>,
  ) {
    this.State = new State(defaultValue as NonFunction<T>);
  }

  public static from<T>(entry: SerializedCacheEntry<T>, node: Graph<T>) {
    const cacheNode = new CacheEntry(Serializer.deserialize(entry.value), node);
    cacheNode.lastRead = entry.lastRead;
    cacheNode.updatedAt = entry.updatedAt;
    cacheNode.setStatus(entry.status);
    return cacheNode;
  }

  public subscribeToValue(onChange: (value: T) => void) {
    return this.State.subscribe(onChange);
  }

  public subscribeToStatus(onChange: (value: ConduitStatus) => void) {
    return this.Status.subscribe(onChange);
  }

  public getStatus() {
    return this.Status.getState();
  }

  public setStatus(...args: Parameters<State<ConduitStatus>["update"]>) {
    this.Status.update(...args);
  }

  public readValue() {
    this.lastRead = Date.now();
    return this.State.getState();
  }

  public writeValue(...args: Parameters<State<T>["update"]>) {
    this.updatedAt = Date.now();
    this.State.update(...args);
  }

  public evict() {
    return this.cacheNode.evictSelf();
  }

  public serialize(): SerializedCacheEntry<T> {
    return {
      lastRead: this.lastRead,
      updatedAt: this.updatedAt,
      status: this.Status.getState(),
      value: Serializer.serialize(this.State.getState()),
    };
  }
}
