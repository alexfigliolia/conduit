import type { Cache, CacheEntry } from "../Cache";

export type IToken = string | number;
export type IKey = IToken | IToken[];

export type CacheGetter = Cache | (() => Cache);

export type IOperation = (...args: any[]) => any;

export interface IConduit<O extends IOperation, D = IValueType<O>> {
  key: IKey;
  operation: O;
  cache?: CacheGetter;
  expires?: number;
  cachePolicy?: CachePolicy;
  defaultValue: D;
}

export interface IConduitWithPolicy<
  O extends IOperation,
  D = IValueType<O>,
> extends Omit<IConduit<O, D>, "cachePolicy"> {
  cachePolicy: CachePolicy;
}

export type CachePolicy =
  | "read-cache-with-respect-to-expiry"
  | "no-cache"
  | "cache-only";

export interface IExecuteOptions<O extends IOperation> {
  expires?: number;
  args: Parameters<O>;
  cachePolicy?: CachePolicy;
}

export type IValueType<O extends IOperation> = Awaited<ReturnType<O>>;

export type ConduitValue<O extends IOperation, D = IValueType<O>> =
  | IValueType<O>
  | D;

export type ConduitCacheEntry<
  O extends IOperation,
  D = IValueType<O>,
> = CacheEntry<ConduitValue<O, D>>;

export type MaybeCacheEntry<O extends IOperation, D = IValueType<O>> =
  | ConduitCacheEntry<O, D>
  | undefined;

export enum ConduitStatus {
  UNINITIALIZED,
  IN_FLIGHT,
  IDOL,
}
