import type {
  IInfiniteOperation,
  IInfiniteOperationOptions,
} from "../InfiniteConduit";
import type { IConduit, IValueType, IOperation } from "../BaseConduit";
import type { UnknownCacheAbstract } from "../../Cache";

import type { ConduitNetworkResult } from "./ConduitNetworkResult";

export interface INetworkConduit<
  O extends IOperation,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> extends Omit<IConduit<O, IValueType<O>, C>, "defaultValue"> {
  defaultValue?: IValueType<O>;
}

export interface IConduitNetworkResult<T, E> {
  data?: T | null;
  error?: E;
}

export type INetworkOperation<O extends IOperation, E = unknown> = (
  ...args: Parameters<O>
) => ReturnType<O> extends Promise<any>
  ? Promise<ConduitNetworkResult<IValueType<O>, E>>
  : ConduitNetworkResult<IValueType<O>, E>;

export type IInfiniteNetworkOperation<
  O extends IInfiniteOperation<any, any>,
  E = unknown,
> = (
  options: IInfiniteOperationOptions<O>,
) => ReturnType<O> extends Promise<any>
  ? Promise<ConduitNetworkResult<IValueType<O>, E>>
  : ConduitNetworkResult<IValueType<O>, E>;
