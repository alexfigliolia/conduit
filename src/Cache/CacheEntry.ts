import { State } from "@figliolia/galena";
import type { NonFunction } from "@figliolia/galena";

import { ConduitStatus } from "../Conduits/types";

import type { SerializedCacheEntry } from "./types";
import { Indexable } from "./Indexable";

export class CacheEntry<T> {
  public lastRead = 0;
  public updatedAt = 0;
  public readonly State: State<T>;
  public readonly Status = new State(ConduitStatus.UNINITIALIZED);
  constructor(defaultValue: T) {
    this.State = new State(defaultValue as NonFunction<T>);
  }

  public static from(entry: SerializedCacheEntry) {
    const cacheNode = new CacheEntry(Indexable.deserialize(entry.value));
    cacheNode.lastRead = entry.lastRead;
    cacheNode.updatedAt = entry.updatedAt;
    cacheNode.Status.set(entry.status);
    return cacheNode;
  }

  public subscribeToValue(onChange: (value: T) => void) {
    return this.State.subscribe(onChange);
  }

  public subscribeToStatus(onChange: (value: ConduitStatus) => void) {
    return this.Status.subscribe(onChange);
  }

  public read() {
    this.lastRead = Date.now();
    return this.State.getState();
  }

  public write(...args: Parameters<State<T>["update"]>) {
    this.updatedAt = Date.now();
    this.State.update(...args);
  }

  public serialize(): SerializedCacheEntry<T> {
    return {
      lastRead: this.lastRead,
      updatedAt: this.updatedAt,
      status: this.Status.getState(),
      value: Indexable.serialize(this.State.getState()),
    };
  }
}
