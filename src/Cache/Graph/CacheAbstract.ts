import type { CacheEntry } from "./CacheEntry";

export abstract class CacheAbstract<
  Storage extends Record<any, any>,
  StorageSerialized extends Record<any, any> = Storage,
> {
  constructor(public storage: Storage) {}

  public abstract serialize(): StorageSerialized;

  public abstract set<T>(
    key: any[],
    args: any[],
    value: T,
  ): CacheEntry<T, unknown>;

  public abstract get<T>(
    key: any[],
    args: any[],
  ): CacheEntry<T, unknown> | undefined;

  public abstract reset(): void;

  public abstract evict(key: any[], args: any[]): unknown;

  public abstract createEntryIfNotExists<T>(
    key: any[],
    args: any[],
    defaultValue: T,
  ): CacheEntry<T, unknown>;
}
