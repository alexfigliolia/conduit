import { type NonFunction, State } from "@figliolia/galena";

import { Serializer } from "../Serialization";

import {
  type ICacheEntry,
  type SerializedCacheEntry,
  ConduitStatus,
} from "./types";

// TODO - clear subscribers on evictions
export class CacheEntry<T, R> {
  public lastRead = 0;
  public updatedAt = 0;
  public readonly State: State<T>;
  private outstandingTask?: unknown;
  private readonly subscriptions: (() => void)[] = [];
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

  public registerTask<T = unknown>(task: T) {
    if (task instanceof Promise) {
      this.outstandingTask = task;
      void task
        .then(() => (this.outstandingTask = undefined))
        .catch(() => (this.outstandingTask = undefined));
    }
    return task;
  }

  public getOutstandingTask<T = unknown>() {
    return this.outstandingTask as T | undefined;
  }

  public subscribeToValue(onChange: (value: T) => void) {
    return this.cacheNotifier(this.State.subscribe(onChange));
  }

  public subscribeToStatus(onChange: (value: ConduitStatus) => void) {
    return this.cacheNotifier(this.Status.subscribe(onChange));
  }

  public getStatus() {
    return this.Status.getState();
  }

  public setStatus(...args: Parameters<State<ConduitStatus>["update"]>) {
    this.Status.update(...args);
  }

  public getValue() {
    this.lastRead = Date.now();
    return this.State.getState();
  }

  public setValue(...args: Parameters<State<T>["update"]>) {
    this.updatedAt = Date.now();
    this.State.update(...args);
  }

  public evict() {
    const result = this.options.evict();
    if (result instanceof Promise) {
      void result.then(() => this.releaseSubscriptions());
    } else {
      this.releaseSubscriptions();
    }
    return result;
  }

  public serialize(): SerializedCacheEntry<T> {
    return {
      lastRead: this.lastRead,
      updatedAt: this.updatedAt,
      status: this.Status.getState(),
      value: Serializer.serialize(this.State.getState()),
    };
  }

  private cacheNotifier(unsubscriber: () => void) {
    this.subscriptions.push(unsubscriber);
    return unsubscriber;
  }

  private releaseSubscriptions() {
    while (this.subscriptions.length) {
      this.subscriptions.pop()!();
    }
  }
}
