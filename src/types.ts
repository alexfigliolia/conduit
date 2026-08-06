import type { NodeParent } from "./NodeParent";
import type { Cache } from "./Cache";

export type IToken = string | number;
export type IKey = IToken | IToken[];

export type CacheGetter = Cache | (() => Cache);

export type IOperation = (...args: any[]) => any;

export interface IConduit<O extends IOperation> {
  key: IKey;
  operation: O;
  cache?: CacheGetter;
  expires?: number;
  cachePolicy?: CachePolicy;
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

export enum ConduitStatus {
  UNINITIALIZED,
  IN_FLIGHT,
  IDOL,
}

export type Primative = string | number | symbol | undefined | null;

export type IValueType<O extends IOperation> = Awaited<ReturnType<O>>;

export interface SerializedCacheEntry<T = unknown> {
  value: T;
  lastRead: number;
  updatedAt: number;
  status: ConduitStatus;
}

export interface SerializedNode<T = unknown> {
  entry?: SerializedCacheEntry<T>;
  nodes: Record<string, SerializedNode>;
}

export type ParentPointer = null | NodeParent;
