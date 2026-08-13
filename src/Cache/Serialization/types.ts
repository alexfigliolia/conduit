export interface ConduitSerializedValue<ValueType> {
  ___CONDUIT___: TypeName;
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
  name: TypeName;
  serialize: ISerializer;
  deserialize: ISerializer;
}

export type ISerializer = (input: unknown) => any;
