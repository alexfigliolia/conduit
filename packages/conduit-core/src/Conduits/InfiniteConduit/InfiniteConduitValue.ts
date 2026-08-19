import { State } from "@figliolia/galena";

import type { CacheEntry } from "../../Cache";

export class InfiniteConduitValue<T> {
  private cacheLength = 0;
  public cacheWriter?: () => void;
  readonly value: State<(T | undefined)[]>;
  private readonly pageCacheEntries = new Map<
    number,
    CacheEntry<T | undefined, unknown>
  >();
  private readonly pageSubscribers = new Map<number, () => void>();
  private caches = new WeakSet<CacheEntry<T | undefined, unknown>>();
  constructor(value: (T | undefined)[]) {
    this.value = new State(value);
  }

  public getValue() {
    return this.value.getState();
  }

  public registerCacheWriter(
    onChange: (value: InfiniteConduitValue<T>) => void,
  ) {
    if (this.cacheWriter) {
      throw new Error(
        "Infinite Conduit Value Error: Attempted to register duplicate cache writers",
        {
          cause: this,
        },
      );
    }
    this.cacheWriter = this.value.subscribe(() => onChange(this));
  }

  public registerPageCacheEntry(entry: CacheEntry<T | undefined, unknown>) {
    if (this.caches.has(entry)) {
      return;
    }
    this.caches.add(entry);
    const idx = this.cacheLength++;
    this.pageCacheEntries.set(idx, entry);
    this.pageSubscribers.set(
      idx,
      entry.subscribeToValue(value => {
        this.value.update(previous => {
          const clone = [...previous];
          clone[idx] = value;
          return clone;
        });
      }),
    );
  }

  public destroy() {
    for (const [idx, subscriber] of this.pageSubscribers) {
      subscriber();
      this.pageSubscribers.delete(idx);
      this.pageCacheEntries.delete(idx);
    }
    this.cacheLength = 0;
    this.caches = new WeakSet();
    this.cacheWriter?.();
    this.cacheWriter = undefined;
  }

  public toJSON() {
    return this.value;
  }
}
