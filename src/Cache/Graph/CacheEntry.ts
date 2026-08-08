import { State, type NonFunction } from "@figliolia/galena";

import { Serializer } from "../TriePaths";

import {
  type ICacheEntry,
  type SerializedCacheEntry,
  ConduitStatus,
} from "./types";

export class CacheEntry<T, R> {
  public lastRead = 0;
  public updatedAt = 0;
  public readonly State: State<T>;
  public readonly Status = new State(ConduitStatus.UNINITIALIZED);
  constructor(public readonly options: ICacheEntry<T, R>) {
    this.State = new State(options.defaultValue as NonFunction<T>);
  }

  public static from<T, R>(
    entry: SerializedCacheEntry<T>,
    evict: () => R,
  ): CacheEntry<T, R> {
    const cacheNode = new CacheEntry<T, R>({
      evict,
      defaultValue: Serializer.deserialize(entry.value),
    });
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
    return this.options.evict();
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
