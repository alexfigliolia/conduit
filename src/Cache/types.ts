import type { ConduitStatus } from "../Conduits/types";

import type { NodeParent } from "./NodeParent";

export type Primitive = string | number | symbol | undefined | null;

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
