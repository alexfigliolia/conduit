import type { AbstractSerializer } from "./AbstractSerializer";

export interface ConduitSerializedValue<ValueType> {
  ___CONDUIT___: string;
  value?: ValueType;
}

export enum TypeName {
  ARRAY = "[]",
  OBJECT = "{}",
  UNDEFINED = "undefined",
  BIGINT = "bigint",
  MAP = "map",
  SET = "set",
  DATE = "date",
  REGEXP = "regexp",
  INFINITE_CONDUIT_PAGE = "ICP",
  INFINITE_CONDUIT_VALUE = "ICV",
}

export interface IInterativeSerializer {
  serialize: ISerializer;
  deserialize: ISerializer;
  traverse: TokenTraversalFn;
}

export type ISerializer = (input: unknown) => any;

export type Primitive = string | number | symbol | undefined | null;

export type OnPrimitive = (current: Primitive) => boolean;

export type TokenTraversalFn = (
  value: unknown,
  onPrimitive: OnPrimitive,
) => boolean;

export type PathKeyIndicator =
  `${typeof AbstractSerializer.SERIALIZATION_MARKER}:${string}`;

export type ThirdPartyTypeName<T extends string> = T extends `${TypeName}`
  ? never
  : T;

export type SerializedInfiniteConduitValueType<T> = [
  value: ConduitSerializedValue<T>[],
  infiniteCacheID: string,
];

export type CustomSerializer = new (
  args: IInterativeSerializer,
) => AbstractSerializer<any, any>;
