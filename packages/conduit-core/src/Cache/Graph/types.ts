import type { NonFunction } from "@figliolia/galena";

import type { AbstractSerializer } from "../Serialization";

import type { NodeParent } from "./NodeParent";
import type { CacheEntry } from "./CacheEntry";
import type { CacheAbstract } from "./CacheAbstract";

export interface SerializedNode<T = unknown> {
  entry?: SerializedCacheEntry<T>;
  nodes: Record<string, SerializedNode>;
}

export type ParentPointer = null | NodeParent;

export interface SerializedCacheEntry<T = unknown> {
  value: NonFunction<T>;
  lastRead: number;
  updatedAt: number;
  status: ConduitStatus;
}

export type UnknownCacheAbstract = CacheAbstract<any, any>;

export enum ConduitStatus {
  UNINITIALIZED = "uninitialized",
  IN_FLIGHT = "in-flight",
  IDOL = "idol",
}

export type SerializedGraph = SerializedStorage<Record<string, SerializedNode>>;

export interface IInfiniteCache {
  lastPageID?: string;
  lastInfiniteID?: string;
}

export interface SerializedStorage<
  T extends Record<string, any>,
> extends Required<IInfiniteCache> {
  data: T;
}

export type EvictionCallback<T, R, V = R> = (node: CacheEntry<T, R>) => V;

export interface ICacheEntryFromSerializedValue<T, R, V = R> {
  entry: SerializedCacheEntry<T>;
  onEvict?: EvictionCallback<T, R, V>;
  onCreate?: (node: CacheEntry<T, R>, value: T) => void;
}

export interface IGraphNodeFromSerializedValue<T> extends Omit<
  Required<ICacheEntryFromSerializedValue<T, Promise<void>, void>>,
  "entry"
> {
  graph: SerializedNode<any>;
  parentPointer: ParentPointer;
}

export interface IFromSerializedGraph extends Omit<
  Required<ICacheEntryFromSerializedValue<any, Promise<void>, void>>,
  "entry"
> {
  graph?: Record<string, SerializedNode>;
}

export interface CacheOptions<StorageSerialized extends Record<any, any>> {
  serializers?: AbstractSerializer<any, any>[];
  data?: Partial<SerializedStorage<StorageSerialized>>;
}

export interface IGraph<T> {
  parent?: ParentPointer;
  onEvict: EvictionCallback<T, Promise<void>, void>;
}

export interface ICacheEntry<T, R> extends Partial<SerializedCacheEntry<T>> {
  value: NonFunction<T>;
  onEvict?: EvictionCallback<T, R>;
}
