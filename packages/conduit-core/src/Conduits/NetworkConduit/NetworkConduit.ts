import { Conduit } from "../Conduit";
import type { ConduitValue, IOperation } from "../BaseConduit";
import { type UnknownCacheAbstract } from "../../Cache";

import type {
  INetworkConduit,
  INetworkOperation,
  NetworkConduitCacheWrite,
} from "./types";
import { ConduitNetworkResult } from "./ConduitNetworkResult";

export class NetworkConduit<
  O extends IOperation,
  D = undefined,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> extends Conduit<
  INetworkOperation<O>,
  ConduitNetworkResult<ConduitValue<O, D>>,
  C
> {
  constructor({
    defaultValue,
    operation,
    ...options
  }: INetworkConduit<O, D, C>) {
    super({
      defaultValue: ConduitNetworkResult.from(defaultValue),
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

  public override writeCache({ args, value }: NetworkConduitCacheWrite<O, D>) {
    return this.getCacheEntry(...args).setValue(previous => {
      if (typeof value === "function") {
        // @ts-expect-error "come back to me"
        const nextState = value(previous);
        if (nextState instanceof Promise) {
          return nextState.then(v => new ConduitNetworkResult(v));
        }
        return new ConduitNetworkResult(nextState);
      }
      return new ConduitNetworkResult(value);
    });
  }
}
