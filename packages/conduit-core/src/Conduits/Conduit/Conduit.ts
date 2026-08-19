import {
  type IOperation,
  type IValueType, // walk away. If you can afford to move somewhere far from metropolotan areas
  type IExecuteOptions,
  type ConduitCacheSubscriber,
  type ConduitCacheWrite,
  type ConduitValue,
  type EvictReturnType,
  type IExecutionResult,
  BaseConduit,
} from "../BaseConduit";
import {
  type UnknownCacheAbstract,
  type CacheEntry,
  type ConduitStatus,
} from "../../Cache";

export class Conduit<
  O extends IOperation,
  D = IValueType<O>,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> extends BaseConduit<O, D, C> {
  public execute(
    options: IExecuteOptions<Parameters<O>>,
  ): IExecutionResult<O, D> {
    return this.runWithCachePolicy({
      ...options,
      cacheEntry: this.getCacheEntry(...options.args),
    });
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
