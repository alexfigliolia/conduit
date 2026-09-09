import type { Setter } from "@figliolia/galena";

import type { CacheEntry, UnknownCacheAbstract } from "../../Cache";

import type { BaseConduit } from "./BaseConduit";

export type CacheGetter<C extends UnknownCacheAbstract> = C | (() => C);

export type IOperation = (...args: any[]) => any;

export interface IOperationOptions {
  expires?: number;
  cachePolicy?: CachePolicy;
}

export interface IConduit<
  O extends IOperation,
  D = undefined,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> extends IOperationOptions {
  key: any[];
  operation: O;
  cache: CacheGetter<C>;
  defaultValue?: D;
}

export interface IConduitWithPolicy<
  O extends IOperation,
  D = undefined,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> extends Omit<IConduit<O, D, C>, "cachePolicy"> {
  cachePolicy: CachePolicy;
}

export type CachePolicy =
  | "read-cache-with-respect-to-expiry"
  | "bypass-cache"
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

export type ConduitValue<O extends IOperation, D = undefined> =
  | IValueType<O>
  | D;

export interface ConduitCacheIndex<O extends IOperation> {
  args: Parameters<O>;
}

export interface ConduitCacheWrite<
  O extends IOperation,
  D = undefined,
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

export type IExecutionResult<O extends IOperation, D = undefined> =
  | ConduitValue<O, D>
  | ReturnType<O>;

export type ConduitValueType<T extends BaseConduit<any, any>> = ConduitValue<
  T["options"]["operation"],
  T["options"]["defaultValue"]
>;

export interface IConduitExecutor<
  O extends IOperation,
  D = undefined,
  U = ConduitValue<O, D>,
  C = U,
> extends Required<IOperationOptions> {
  operation: O;
  onCacheRead?: (value: U) => C;
  cacheInterceptor?: (previous: U, value: IValueType<O>) => U;
}
