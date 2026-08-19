import {
  BaseConduit,
  type IValueType,
  type EvictReturnType,
} from "../BaseConduit";
import { TypeChecker } from "../../Cache/Serialization";
import {
  type UnknownCacheAbstract,
  type CacheEntry,
  ConduitStatus,
} from "../../Cache";

import type {
  IInfiniteConduit,
  IPagingArgs,
  IInfiniteOperation,
  IInfiniteOperationOptions,
  IInfiniteExecuteOptions,
} from "./types";
import { InfiniteConduitValue } from "./InfiniteConduitValue";

export class InfiniteConduit<
  O extends IInfiniteOperation<any, any>,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> extends BaseConduit<O, undefined, C> {
  private readonly pagingTokens: string[][];
  private readonly defaultValue: IValueType<O>[];
  private readonly pagingArgPaths: IPagingArgs<O>;
  constructor({
    operation,
    pagingArgPaths,
    defaultValue = [],
    ...options
  }: IInfiniteConduit<O, C>) {
    super({ ...options, operation, defaultValue: undefined });
    this.defaultValue = defaultValue;
    this.pagingArgPaths = pagingArgPaths;
    this.pagingTokens = this.pagingArgPaths.map(t => t.split("."));
    if (!pagingArgPaths.length) {
      throw new Error(
        `Paging Arg Path Error: At least one path an operation's argument used for pagination is required`,
        {
          cause: pagingArgPaths,
        },
      );
    }
  }

  public override execute(options: IInfiniteExecuteOptions<O>) {
    const infiniteCacheEntry = this.getCacheEntry(options.args);
    const pageCacheEntry = this.getPageCacheEntry(options.args);
    const pagingData = infiniteCacheEntry.getValue();
    pagingData.registerPageCacheEntry(pageCacheEntry);
    infiniteCacheEntry.setStatus(ConduitStatus.IN_FLIGHT);
    const { args, ...rest } = options;
    const result = this.runWithCachePolicy({
      ...rest,
      args: [args],
      cacheEntry: pageCacheEntry,
    });
    if (result && (result as unknown) instanceof Promise) {
      return (result as Promise<IValueType<O>>).then(v => {
        return this.onPageExecution(v, infiniteCacheEntry);
      });
    }
    return this.onPageExecution(result, infiniteCacheEntry);
  }

  public override getCacheEntry(args: IInfiniteOperationOptions<O>) {
    const entry = InfiniteConduit.getCacheEntry(
      this.getCache(),
      this.options.key,
      [this.getInfiniteOptions(args)],
      new InfiniteConduitValue(this.defaultValue),
    );
    const value = entry.getValue();
    if (!value.cacheWriter) {
      value.registerCacheWriter(value => entry.setValue(value));
    }
    return entry;
  }

  public getPageCacheEntry(args: IInfiniteOperationOptions<O>) {
    return InfiniteConduit.getCacheEntry(
      this.getCache(),
      this.options.key,
      [args],
      undefined,
    ) as CacheEntry<IValueType<O> | undefined, EvictReturnType<C>>;
  }

  public getInfiniteOptions(args: IInfiniteOperationOptions<O>) {
    const result = structuredClone(args);
    const { length: totalPaths } = this.pagingTokens;
    for (let j = 0; j < totalPaths; j++) {
      const path = this.pagingTokens[j]!;
      const { length: tokenLength } = path;
      let current = result;
      for (let i = 0; i < tokenLength; i++) {
        const token = path[i]!;
        if (TypeChecker.isHashTable(current) && token in current) {
          if (i === tokenLength - 1) {
            delete current[token];
          } else {
            current = current[token];
          }
        } else {
          throw new Error(
            `Paging Arg Path Error: The following paging argument could not be found on the input object`,
            {
              cause: {
                args,
                path: this.pagingArgPaths[i],
              },
            },
          );
        }
      }
    }
    return result;
  }

  public subscribeToValue(
    args: IInfiniteOperationOptions<O>,
    onChange: (value: InfiniteConduitValue<IValueType<O>>) => void,
  ) {
    return this.getCacheEntry(args).subscribeToValue(onChange);
  }

  public subscribeToPageValue(
    args: IInfiniteOperationOptions<O>,
    onChange: (value: IValueType<O> | undefined) => void,
  ) {
    return this.getPageCacheEntry(args).subscribeToValue(onChange);
  }

  public subscribeToStatus(
    args: IInfiniteOperationOptions<O>,
    onChange: (value: ConduitStatus) => void,
  ) {
    return this.getCacheEntry(args).subscribeToStatus(onChange);
  }

  public subscribeToPageStatus(
    args: IInfiniteOperationOptions<O>,
    onChange: (value: ConduitStatus) => void,
  ) {
    return this.getPageCacheEntry(args).subscribeToStatus(onChange);
  }

  public getStatus(args: IInfiniteOperationOptions<O>) {
    return this.getCacheEntry(args).getStatus();
  }

  public getPageStatus(args: IInfiniteOperationOptions<O>) {
    return this.getPageCacheEntry(args).getStatus();
  }

  public writeCache(
    args: IInfiniteOperationOptions<O>,
    value: IValueType<O> | undefined,
  ) {
    return this.getPageCacheEntry(args).setValue(value);
  }

  public readCache(args: IInfiniteOperationOptions<O>) {
    return this.getCacheEntry(args).getValue().getValue();
  }

  public readPageCache(args: IInfiniteOperationOptions<O>) {
    return this.getPageCacheEntry(args).getValue();
  }

  public evict(args: IInfiniteOperationOptions<O>) {
    const entry = this.getCacheEntry(args);
    entry.getValue().destroy();
    return entry.evict();
  }

  public evictPage(args: IInfiniteOperationOptions<O>) {
    return this.getPageCacheEntry(args).evict();
  }

  private onPageExecution<V>(
    value: V,
    cacheEntry: CacheEntry<InfiniteConduitValue<IValueType<O>>, unknown>,
  ) {
    cacheEntry.setStatus(ConduitStatus.IDOL);
    return value;
  }
}
