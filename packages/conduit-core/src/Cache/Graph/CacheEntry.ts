import { type NonFunction, State } from "@figliolia/galena";
import { AutoIncrementingID } from "@figliolia/event-emitter";

import { Serializer } from "../Serialization";

import {
  type ICacheEntry,
  type EvictionCallback,
  type ICacheEntryFromSerializedValue,
  type SerializedCacheEntry,
  ConduitStatus,
} from "./types";

export class CacheEntry<T, R> {
  public lastRead = 0;
  public updatedAt = 0;
  public readonly State: State<T>;
  private outstandingTask?: Promise<unknown>;
  private readonly IDs = new AutoIncrementingID();
  public readonly onEvict?: EvictionCallback<T, R>;
  private readonly subscriptions = new Map<string, () => void>();
  public readonly Status = new State(ConduitStatus.UNINITIALIZED);
  constructor({
    value,
    onEvict,
    lastRead = 0,
    updatedAt = 0,
    status = ConduitStatus.UNINITIALIZED,
  }: ICacheEntry<T, R>) {
    this.onEvict = onEvict;
    this.lastRead = lastRead;
    this.updatedAt = updatedAt;
    this.State = new State(value);
    this.Status = new State(status);
  }

  public static from<T extends NonFunction<any>, R>({
    entry,
    onEvict,
    onCreate,
  }: ICacheEntryFromSerializedValue<T, R>) {
    const { value: serializedValue, ...rest } = entry;
    const value = Serializer.deserialize(serializedValue);
    const cacheNode = new CacheEntry<T, R>({ ...rest, value, onEvict });
    onCreate?.(cacheNode, value);
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

  public subscribe(
    onChange: ({ value, status }: { value: T; status: ConduitStatus }) => void,
  ) {
    const valueSubscriber = this.cacheNotifier(
      this.State.subscribe(value =>
        onChange({ value, status: this.Status.getState() }),
      ),
    );
    const statusSubscriber = this.cacheNotifier(
      this.Status.subscribe(status =>
        onChange({ value: this.State.getState(), status }),
      ),
    );
    return () => {
      valueSubscriber();
      statusSubscriber();
    };
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
    this.releaseSubscriptions();
    return this.onEvict?.(this);
  }

  public serialize(): SerializedCacheEntry<T> {
    return {
      lastRead: this.lastRead,
      updatedAt: this.updatedAt,
      status: this.Status.getState(),
      value: Serializer.serialize(this.State.getState()),
    };
  }

  public toJSON() {
    return this.serialize();
  }

  private cacheNotifier(unsubscriber: () => void) {
    const ID = this.IDs.get();
    const cacheSubscriber = () => {
      this.subscriptions.delete(ID);
      unsubscriber();
    };
    this.subscriptions.set(ID, cacheSubscriber);
    return cacheSubscriber;
  }

  private releaseSubscriptions() {
    for (const [_, subscriber] of this.subscriptions) {
      subscriber();
    }
    this.subscriptions.clear();
  }
}
