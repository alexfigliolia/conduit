import type { Setter } from "@figliolia/galena";

import type { CacheEntry, UnknownCacheAbstract } from "../../Cache";

import type { Conduit } from "./Conduit";

export type CacheGetter<C extends UnknownCacheAbstract> = C | (() => C);

export type IOperation = (...args: any[]) => any;

export interface IConduit<
  O extends IOperation,
  D = IValueType<O>,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> {
  key: any[];
  operation: O;
  cache?: CacheGetter<C>;
  expires?: number;
  cachePolicy?: CachePolicy;
  defaultValue: D;
}

export interface IConduitWithPolicy<
  O extends IOperation,
  D = IValueType<O>,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> extends Omit<IConduit<O, D, C>, "cachePolicy"> {
  cachePolicy: CachePolicy;
}

export type OperationArgs<T extends Conduit<any, any, any>> = Parameters<
  T["options"]["operation"]
>;

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

export type MaybeCacheEntry<O extends IOperation, D = IValueType<O>> =
  | CacheEntry<ConduitValue<O, D>, any>
  | undefined;

export type EvictReturnType<C extends UnknownCacheAbstract> = ReturnType<
  ReturnType<C["createEntryIfNotExists"]>["evict"]
>;
