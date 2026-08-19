import { Conduit } from "../Conduit";
import { type IOperation, type IValueType } from "../BaseConduit";
import { type UnknownCacheAbstract } from "../../Cache";

import type { INetworkConduit, INetworkOperation } from "./types";
import { ConduitNetworkResult } from "./ConduitNetworkResult";

export class NetworkConduit<
  O extends IOperation,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> extends Conduit<
  INetworkOperation<O>,
  ConduitNetworkResult<IValueType<O>>,
  C
> {
  constructor({ defaultValue, operation, ...options }: INetworkConduit<O, C>) {
    super({
      defaultValue: ConduitNetworkResult.from<IValueType<O>>(defaultValue),
      operation: NetworkConduit.toNetworkOperation(
        operation,
      ) as unknown as INetworkOperation<O>,
      ...options,
    });
  }

  public static toNetworkOperation<O extends IOperation>(operation: O) {
    return (...args: Parameters<O>) => {
      try {
        const result = operation(...args);
        if (result instanceof Promise) {
          return result
            .then(v => ConduitNetworkResult.from(v))
            .catch(e => ConduitNetworkResult.fromError(e));
        }
        return ConduitNetworkResult.from(result);
      } catch (error: unknown) {
        return ConduitNetworkResult.fromError(error);
      }
    };
  }
}
