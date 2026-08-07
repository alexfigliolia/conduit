import type { CacheEntryAbstract } from "./CacheEntryAbstract";

export abstract class CacheAbstract<
  T extends Record<any, any>,
  R extends CacheEntryAbstract<any, any, any>,
  I extends Record<any, any> = T,
> {
  constructor(public storage: T) {}

  public abstract serialize(): I;

  public abstract set<T>(key: any[], args: any[], value: T): R;

  public abstract get(key: any[], args: any[]): R | undefined;

  public abstract reset(): any;

  public abstract createEntryIfNotExists<T>(
    key: any[],
    args: any[],
    defaultValue: T,
  ): R;
}
