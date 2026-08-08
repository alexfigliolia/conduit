import { type IValueType } from "../Conduit/types";
import { Conduit } from "../Conduit/Conduit";
import type { UnknownCacheAbstract } from "../../Cache";

import type { INetworkConduit, INetworkOperation } from "./types";

export class NetworkConduit<
  O extends INetworkOperation<any, any>,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> extends Conduit<O, IValueType<O>, C> {
  constructor({ defaultValue = null, ...rest }: INetworkConduit<O, C>) {
    super({
      ...rest,
      defaultValue: { data: defaultValue, error: undefined } as IValueType<O>,
    });
  }
}
