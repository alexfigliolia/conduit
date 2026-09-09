import {
  type IOperation,
  type IExecuteOptions,
  type ConduitCacheSubscriber,
  type ConduitCacheWrite,
  type ConduitValue,
  type EvictReturnType,
  BaseConduit,
  ConduitExecutor,
} from "../BaseConduit";
import {
  type UnknownCacheAbstract,
  type CacheEntry,
  type ConduitStatus,
} from "../../Cache";

import type { ConduitOperationSubscriber } from "./types";

export class Conduit<
  O extends IOperation,
  D = undefined,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> extends BaseConduit<O, D, C> {
  public execute({
    args,
    expires = this.expires,
    cachePolicy = this.options.cachePolicy,
  }: IExecuteOptions<Parameters<O>>) {
    return new ConduitExecutor<O, D>({
      expires,
      cachePolicy,
      operation: this.options.operation,
    }).build(this.getCacheEntry(...args))(...args);
  }

  public subscribeToValue({
    args,
    onChange,
  }: ConduitCacheSubscriber<O, ConduitValue<O, D>>) {
    return this.getCacheEntry(...args).subscribeToValue(onChange);
  }

  public subscribeToStatus({
    args,
    onChange,
  }: ConduitCacheSubscriber<O, ConduitStatus>) {
    return this.getCacheEntry(...args).subscribeToStatus(onChange);
  }

  public subscribe({ args, onChange }: ConduitOperationSubscriber<O, D>) {
    return this.getCacheEntry(...args).subscribe(onChange);
  }

  public getStatus(...args: Parameters<O>) {
    return this.getCacheEntry(...args).getStatus();
  }

  public writeCache({ args, value }: ConduitCacheWrite<O, D>) {
    return this.getCacheEntry(...args).setValue(value);
  }

  public readCache(...args: Parameters<O>) {
    return this.getCacheEntry(...args).getValue();
  }

  public evict(...args: Parameters<O>) {
    return this.getCacheEntry(...args).evict() as EvictReturnType<C>;
  }

  public override getCacheEntry(...args: Parameters<O>) {
    return Conduit.getCacheEntry(
      this.getCache(),
      this.options.key,
      args,
      this.options.defaultValue,
    ) as CacheEntry<ConduitValue<O, D>, EvictReturnType<C>>;
  }
}
