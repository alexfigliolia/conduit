import type { IConduit, IValueType, IOperationOptions } from "../BaseConduit";
import type { UnknownCacheAbstract } from "../../Cache";

export type IInfiniteOperation<
  T extends Record<string, any> | undefined = Record<string, any>,
  V = any,
> = (config: T) => V;

export type IInfiniteOperationOptions<T extends IInfiniteOperation<any, any>> =
  Parameters<T>[0];

export type IPagingArgs<O extends IInfiniteOperation<any, any>> = ObjectPaths<
  IInfiniteOperationOptions<O>
>[];

export interface IInfiniteConduit<
  O extends IInfiniteOperation<any, any>,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> extends Omit<IConduit<O, undefined, C>, "defaultValue"> {
  defaultValue?: IValueType<O>[];
  pagingArgPaths: IPagingArgs<O>;
}

export type ObjectPaths<T> = T extends object
  ? {
      [K in keyof T & (string | number)]: T[K] extends any[]
        ? `${K}` // Stops recursion at arrays to prevent excessive depth
        : T[K] extends object | undefined
          ? `${K}` | `${K}.${ObjectPaths<T[K]>}`
          : `${K}`;
    }[keyof T & (string | number)]
  : never;

export interface IInfiniteExecuteOptions<
  O extends IInfiniteOperation<any, any>,
> extends IOperationOptions {
  args: IInfiniteOperationOptions<O>;
}
