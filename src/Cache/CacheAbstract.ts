import type { CacheEntry } from "./CacheEntry";

export abstract class CacheAbstract<T> {
  protected abstract readonly storage: T;

  public abstract serialize(): Record<any, any>;

  public abstract set<T>(key: any[], args: any[], value: T): CacheEntry<T>;

  public abstract get(key: any[], args: any[]): CacheEntry<T> | undefined;

  public abstract reset(): any;

  public abstract createEntryIfNotExists<T>(
    key: any[],
    args: any[],
    defaultValue: T,
  ): CacheEntry<T>;
}
