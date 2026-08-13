import type { AbstractSerializer } from "./AbstractSerializer";

export interface ConduitSerializedValue<ValueType> {
  ___CONDUIT___: string;
  value?: ValueType;
}

export enum TypeName {
  UNDEFINED = "undefined",
  BIGINT = "bigint",
  MAP = "map",
  SET = "set",
  DATE = "date",
  REGEXP = "regexp",
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
  onValue: OnPrimitive,
) => boolean;

export type PathKeyIndicator =
  `${typeof AbstractSerializer.SERIALIZATION_MARKER}:${string}`;

export type ThirdPartyTypeName<T extends string> = T extends `${TypeName}`
  ? never
  : T;
