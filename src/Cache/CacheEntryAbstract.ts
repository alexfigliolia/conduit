import { State, type NonFunction } from "@figliolia/galena";

import { ConduitStatus } from "../Conduits/types";

import type { ICacheEntry, SerializedCacheEntry } from "./types";

export abstract class CacheEntryAbstract<
  T,
  S extends SerializedCacheEntry<T>,
  R,
> {
  public lastRead = 0;
  public updatedAt = 0;
  public readonly State: State<T>;
  public readonly Status = new State(ConduitStatus.UNINITIALIZED);
  constructor(public readonly options: ICacheEntry<T, R>) {
    this.State = new State(options.defaultValue as NonFunction<T>);
  }

  public static from<S extends SerializedCacheEntry<any>>(
    _entry: S,
    _evict: () => any,
  ): CacheEntryAbstract<any, any, any> {
    throw new Error(
      "Not implemented Error: Override with this static method in your extension of the CachEntryAbstract to create cache entries from serialized data",
    );
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

  public abstract serialize(): S;
}
