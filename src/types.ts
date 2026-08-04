import type { NonFunction } from "@figliolia/galena";

import type { Conduit } from "./Conduit";
import type { Cache } from "./Cache";

export type IKey = string | (string | number)[];

export type IOperation = (...args: any[]) => NonFunction<any>;

export interface IConduit<O extends IOperation, D = IValueType<O> | undefined> {
  key: IKey;
  operation: O;
  expiresIn?: number;
  getCache: () => Cache;
  defaultValue?: D;
}

export interface IPaginatedConduit<O extends IOperation> extends IConduit<
  O,
  IValueType<O>[]
> {
  getPage: (args: Parameters<O>) => number;
}

export type IValueType<O extends IOperation> = Awaited<ReturnType<O>>;

export type ValueType<T extends Conduit<any>> = Awaited<
  ReturnType<T["execute"]>
>;

export type Mutator<T> =
  | NonFunction<T>
  | ((prevState: NonFunction<T> | undefined) => NonFunction<T>);

export type ISetter<O extends IOperation> = Mutator<IValueType<O>>;

export type IPaginatedSetter<O extends IOperation> = Mutator<IValueType<O>[]>;

export enum Status {
  IDOL,
  COMPUTING,
  UNINITIALIZED,
}
