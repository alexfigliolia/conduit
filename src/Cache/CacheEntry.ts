import type { SerializedCacheEntry } from "./types";
import { Serializer } from "./Serializer";
import { CacheEntryAbstract } from "./CacheEntryAbstract";

export class CacheEntry<T, R = Promise<void>> extends CacheEntryAbstract<
  T,
  SerializedCacheEntry<T>,
  R
> {
  public static from<T>(
    entry: SerializedCacheEntry<T>,
    evict: () => Promise<void>,
  ): CacheEntry<T> {
    const cacheNode = new CacheEntry<T>({
      evict,
      defaultValue: Serializer.deserialize(entry.value),
    });
    cacheNode.lastRead = entry.lastRead;
    cacheNode.updatedAt = entry.updatedAt;
    cacheNode.setStatus(entry.status);
    return cacheNode;
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
