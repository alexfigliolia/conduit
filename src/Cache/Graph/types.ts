import type { NodeParent } from "./NodeParent";
import type { CacheAbstract } from "./CacheAbstract";

export interface SerializedNode<T = unknown> {
  entry?: SerializedCacheEntry<T>;
  nodes: Record<string, SerializedNode>;
}

export type ParentPointer = null | NodeParent;

export interface SerializedCacheEntry<T = unknown> {
  value: T;
  lastRead: number;
  updatedAt: number;
  status: ConduitStatus;
}

export interface ICacheEntry<T, R> {
  defaultValue: T;
  evict: () => R;
}

export type UnknownCacheAbstract = CacheAbstract<any, any>;

export enum ConduitStatus {
  UNINITIALIZED,
  IN_FLIGHT,
  IDOL,
}
