import { Conduit, type IValueType, type IOperation } from "../Conduit";
import type { UnknownCacheAbstract } from "../../Cache";

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
  constructor({ operation, defaultValue, ...rest }: INetworkConduit<O, C>) {
    super({
      ...rest,
      operation: NetworkConduit.toNetworkOperator<O>(
        operation,
      ) as INetworkOperation<O>,
      defaultValue: { data: defaultValue ?? null, error: undefined },
    });
  }

  public static toNetworkOperator<O extends IOperation, E = unknown>(
    operation: O,
  ) {
    return (...args: Parameters<O>) => {
      try {
        const result = operation(...args);
        if (result instanceof Promise) {
          return result
            .then(ConduitNetworkResult.fromResponse)
            .catch(e => ConduitNetworkResult.fromError(e as E));
        }
        return ConduitNetworkResult.fromResponse(result);
      } catch (error: unknown) {
        return ConduitNetworkResult.fromError(error as E);
      }
    };
  }
}
