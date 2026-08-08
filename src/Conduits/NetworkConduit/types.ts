import type { IConduit, IValueType } from "../Conduit";
import type { UnknownCacheAbstract } from "../../Cache";

import type { ConduitNetworkResult } from "./ConduitNetworkResult";

export type INetworkOperation<T, E> = (
  ...args: any[]
) => ConduitNetworkResult<T, E> | Promise<ConduitNetworkResult<T, E>>;

export interface INetworkConduit<
  O extends INetworkOperation<any, any>,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> extends Omit<IConduit<O, IValueType<O>, C>, "defaultValue"> {
  defaultValue?: IValueType<O>["data"];
}
