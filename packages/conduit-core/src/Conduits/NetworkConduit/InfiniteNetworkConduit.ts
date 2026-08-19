import {
  InfiniteConduit,
  type IInfiniteOperation,
  type IInfiniteConduit,
} from "../InfiniteConduit";
import { type UnknownCacheAbstract } from "../../Cache";

import type { IInfiniteNetworkOperation } from "./types";
import { NetworkConduit } from "./NetworkConduit";

export class InfiniteNetworkConduit<
  O extends IInfiniteOperation<any, any>,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> extends InfiniteConduit<IInfiniteNetworkOperation<O>, C> {
  constructor({
    defaultValue = [],
    operation,
    ...options
  }: IInfiniteConduit<O, C>) {
    super({
      defaultValue,
      operation: NetworkConduit.toNetworkOperation(
        operation,
      ) as unknown as IInfiniteNetworkOperation<O>,
      ...options,
    });
  }
}
