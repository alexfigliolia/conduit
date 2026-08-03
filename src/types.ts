import type { Reactive } from "./Reactive";
import type { Cache } from "./Cache";

export type IKey = string | (string | number)[];

export type IOperation = (...args: any[]) => any;

export interface IReactive<
  O extends IOperation,
  D = IValueType<O> | undefined,
> {
  key: IKey;
  operation: O;
  expiresIn?: number;
  getCache: () => Cache;
  defaultValue?: D;
}

export interface IReactivePaginated<O extends IOperation> extends IReactive<
  O,
  IValueType<O>[]
> {
  getPage: (args: Parameters<O>) => number;
}

export type IValueType<O extends IOperation> = Awaited<ReturnType<O>>;

export type ValueType<T extends Reactive<any>> = Awaited<
  ReturnType<T["execute"]>
>;
