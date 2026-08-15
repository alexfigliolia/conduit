import type { IConduit, IOperation, IValueType } from "../Conduit";
import type { UnknownCacheAbstract } from "../../Cache";

import type { ConduitNetworkResult } from "./ConduitNetworkResult";

export type INetworkOperation<O extends IOperation> = (
  ...args: Parameters<O>
) => INetworkResolultion<O>;

export type INetworkResolultion<O extends IOperation> =
  ReturnType<O> extends Promise<any>
    ? Promise<ConduitNetworkResult<IValueType<O>>>
    : ConduitNetworkResult<IValueType<O>>;

export interface INetworkConduit<
  O extends IOperation,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> extends Omit<IConduit<O, IValueType<O>, C>, "defaultValue"> {
  defaultValue?: IValueType<O>;
}
