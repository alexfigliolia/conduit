import type { Setter } from "@figliolia/galena";

import type { CacheEntry, UnknownCacheAbstract } from "../../Cache";

export type CacheGetter<C extends UnknownCacheAbstract> = C | (() => C);

export type IOperation = (...args: any[]) => any;

export interface IOperationOptions {
  expires?: number;
  cachePolicy?: CachePolicy;
}

export interface IConduit<
  O extends IOperation,
  D = IValueType<O>,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> extends IOperationOptions {
  key: any[];
  operation: O;
  cache: CacheGetter<C>;
  defaultValue: D;
}

export interface IConduitWithPolicy<
  O extends IOperation,
  D = IValueType<O>,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> extends Omit<IConduit<O, D, C>, "cachePolicy"> {
  cachePolicy: CachePolicy;
}

export type CachePolicy =
  | "read-cache-with-respect-to-expiry"
  | "no-cache"
  | "cache-only";

export interface IExecuteOptions<O extends any[]> extends IOperationOptions {
  args: O;
}

export interface IExecutionOptionsWithCacheEntry<
  O extends any[],
  T,
> extends IExecuteOptions<O> {
  cacheEntry: CacheEntry<T, any>;
}

export type IValueType<O extends IOperation> = Awaited<ReturnType<O>>;

export type ConduitValue<O extends IOperation, D = IValueType<O>> =
  | IValueType<O>
  | D;

export interface ConduitCacheIndex<O extends IOperation> {
  args: Parameters<O>;
}

export interface ConduitCacheWrite<
  O extends IOperation,
  D = IValueType<O>,
> extends ConduitCacheIndex<O> {
  value: Setter<ConduitValue<O, D>>;
}

export interface ConduitCacheSubscriber<
  O extends IOperation,
  T,
> extends ConduitCacheIndex<O> {
  onChange: (value: T) => void;
}

export type EvictReturnType<C extends UnknownCacheAbstract> = ReturnType<
  C["evict"]
>;

export type IExecutionResult<O extends IOperation, D = IValueType<O>> =
  | ConduitValue<O, D>
  | ReturnType<O>;
