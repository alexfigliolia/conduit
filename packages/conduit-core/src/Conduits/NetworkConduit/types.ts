import type {
  IInfiniteOperation,
  IInfiniteOperationOptions,
} from "../InfiniteConduit";
import type {
  IConduit,
  IValueType,
  IOperation,
  ConduitCacheIndex,
  ConduitValue,
} from "../BaseConduit";
import type { UnknownCacheAbstract } from "../../Cache";

import type { ConduitNetworkResult } from "./ConduitNetworkResult";

export interface INetworkConduit<
  O extends IOperation,
  D = undefined,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> extends Omit<
  IConduit<O, ConduitNetworkResult<ConduitValue<O, D>>, C>,
  "defaultValue"
> {
  defaultValue?: D;
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

export interface NetworkConduitCacheWrite<
  O extends IOperation,
  D = undefined,
> extends ConduitCacheIndex<O> {
  value:
    | IConduitNetworkResult<ConduitValue<O, D>, unknown>
    | ((
        previous: ConduitNetworkResult<ConduitValue<O, D>>,
      ) =>
        | IConduitNetworkResult<ConduitValue<O, D>, unknown>
        | Promise<IConduitNetworkResult<ConduitValue<O, D>, unknown>>);
}
