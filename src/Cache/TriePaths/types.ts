export interface ConduitSerializedValue<ValueType> {
  ___CONDUIT___: string;
  value?: ValueType;
}

export type Primitive = string | number | symbol | undefined | null;
