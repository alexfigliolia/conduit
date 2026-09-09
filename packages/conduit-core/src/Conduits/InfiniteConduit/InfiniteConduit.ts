import {
  BaseConduit,
  type IValueType,
  type EvictReturnType,
  ConduitExecutor,
} from "../BaseConduit";
import { TypeChecker } from "../../Cache/Serialization";
import {
  type UnknownCacheAbstract,
  type CacheEntry,
  ConduitStatus,
} from "../../Cache";

import {
  type PageType,
  type IInfiniteConduit,
  type IPagingArgs,
  type IInfiniteOperation,
  type IInfiniteOperationOptions,
  type IInfiniteExecuteOptions,
  type IInfiniteValueSubscriber,
  type IPageValueSubscriber,
  type IInfiniteStatusSubscriber,
  type IInfiniteCacheWrite,
  type IInfiniteConduitSubscriber,
} from "./types";
import { InfiniteConduitValue } from "./InfiniteConduitValue";
import { InfiniteConduitPage } from "./InfiniteConduitPage";
import { DUMMY_PAGE } from "./DummyPage";

export class InfiniteConduit<
  O extends IInfiniteOperation<any, any>,
  C extends UnknownCacheAbstract = UnknownCacheAbstract,
> extends BaseConduit<O, InfiniteConduitPage<IValueType<O>, C>, C> {
  private readonly pagingTokens: string[][];
  private readonly defaultValue: IValueType<O>[];
  private readonly paginationArgs: IPagingArgs<O>;
  constructor({
    paginationArgs,
    defaultValue = [],
    ...options
  }: IInfiniteConduit<O, C>) {
    super({
      ...options,
      defaultValue: DUMMY_PAGE,
    });
    this.defaultValue = defaultValue;
    this.paginationArgs = paginationArgs;
    this.pagingTokens = this.paginationArgs.map(t => t.split("."));
    if (!paginationArgs.length) {
      throw new Error(
        `Paging Arg Path Error: At least one path an operation's argument object must be used for pagination`,
        {
          cause: paginationArgs,
        },
      );
    }
  }

  public override execute({
    args,
    expires = this.expires,
    cachePolicy = this.options.cachePolicy,
  }: IInfiniteExecuteOptions<O>): PageType<IValueType<O>> | ReturnType<O> {
    const infiniteEntry = this.getCacheEntry(args);
    const pageCacheEntry = this.getPageCacheEntry(args, infiniteEntry);
    infiniteEntry.setStatus(ConduitStatus.IN_FLIGHT);
    const result = new ConduitExecutor({
      expires,
      cachePolicy,
      operation: this.options.operation,
      onCacheRead: (value: InfiniteConduitPage<IValueType<O>, C>) =>
        value.value,
      cacheInterceptor: (previous, next: IValueType<O>) =>
        previous.write(next, this.getCache()),
    }).build(
      pageCacheEntry,
      // @ts-expect-error typescript bug
    )(args);
    if ((result as any) instanceof Promise) {
      return (result as Promise<IValueType<O>>).then(v =>
        this.onPageExecution(v, infiniteEntry),
      ) as ReturnType<O>;
    }
    return this.onPageExecution(result, infiniteEntry);
  }

  public override getCacheEntry(args: IInfiniteOperationOptions<O>) {
    let created = false;
    const cache = this.getCache();
    const cacheNode = InfiniteConduit.getCacheEntry(
      cache,
      this.options.key,
      [this.getInfiniteOptions(args)],
      () => {
        created = true;
        return new InfiniteConduitValue<IValueType<O>, C>({
          value: this.defaultValue,
          infiniteCacheID: cache.InfiniteCache.getInfiniteID(),
        });
      },
    );
    if (created) {
      cache.InfiniteCache.registerInfiniteNode(cacheNode);
    }
    return cacheNode;
  }

  public getPageCacheEntry(
    args: IInfiniteOperationOptions<O>,
    infiniteCacheEntry = this.getCacheEntry(args),
  ) {
    const { value, infiniteCacheID } = infiniteCacheEntry.getValue();
    return this.getOrCreatePageCacheEntry(args, value.length, infiniteCacheID);
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
                path: this.paginationArgs[i],
              },
            },
          );
        }
      }
    }
    return result;
  }

  public subscribe({ args, onChange }: IInfiniteConduitSubscriber<O, C>) {
    return this.getCacheEntry(args).subscribe(onChange);
  }

  public subscribeToValue({ args, onChange }: IInfiniteValueSubscriber<O>) {
    return this.getCacheEntry(args).subscribeToValue(value =>
      onChange(value.decompose()),
    );
  }

  public subscribeToPageValue({ args, onChange }: IPageValueSubscriber<O>) {
    return this.getPageCacheEntry(args).subscribeToValue(value =>
      onChange(value.value),
    );
  }

  public subscribeToStatus({ args, onChange }: IInfiniteStatusSubscriber<O>) {
    return this.getCacheEntry(args).subscribeToStatus(onChange);
  }

  public subscribeToPageStatus({
    args,
    onChange,
  }: IInfiniteStatusSubscriber<O>) {
    return this.getPageCacheEntry(args).subscribeToStatus(onChange);
  }

  public getStatus(args: IInfiniteOperationOptions<O>) {
    return this.getCacheEntry(args).getStatus();
  }

  public getPageStatus(args: IInfiniteOperationOptions<O>) {
    return this.getPageCacheEntry(args).getStatus();
  }

  public writeCache({ args, value }: IInfiniteCacheWrite<O>) {
    return this.getPageCacheEntry(args).setValue(previous =>
      previous.write(value, this.getCache()),
    );
  }

  public readCache(args: IInfiniteOperationOptions<O>) {
    return this.getCacheEntry(args).getValue().decompose();
  }

  public readPageCache(args: IInfiniteOperationOptions<O>) {
    return this.getPageCacheEntry(args).getValue().value;
  }

  public evict(args: IInfiniteOperationOptions<O>) {
    return this.getCache().evict(this.options.key, [
      this.getInfiniteOptions(args),
    ]);
  }

  public evictPage(args: IInfiniteOperationOptions<O>) {
    return this.getCache().evict(this.options.key, [args]);
  }

  public evictAll(args: IInfiniteOperationOptions<O>) {
    const cache = this.getCache();
    const node = cache.get<
      InfiniteConduitValue<InfiniteConduitPage<IValueType<O>, C>, C>
    >(this.options.key, [this.getInfiniteOptions(args)]);
    const value = node?.getValue?.();
    const result = node?.evict?.();
    const pages =
      value?.value?.map?.(page => {
        const node = cache.InfiniteCache.getPageNode(page.pageID);
        return node?.evict?.();
      }) ?? [];
    if (result instanceof Promise) {
      return Promise.all([result, ...pages]).then(
        v => v[0],
      ) as EvictReturnType<C>;
    }
    return result as EvictReturnType<C>;
  }

  private onPageExecution<V>(
    value: V,
    cacheEntry: CacheEntry<
      InfiniteConduitValue<IValueType<O>, C>,
      EvictReturnType<C>
    >,
  ) {
    cacheEntry.setStatus(ConduitStatus.IDOL);
    return value;
  }

  private getOrCreatePageCacheEntry(
    args: IInfiniteOperationOptions<O>,
    index: number,
    infiniteCacheID: string,
  ) {
    let created = false;
    const cache = this.getCache();
    const entry = InfiniteConduit.getCacheEntry(
      this.getCache(),
      this.options.key,
      [args],
      () => {
        created = true;
        return new InfiniteConduitPage({
          cache,
          index,
          write: true,
          infiniteCacheID,
          value: undefined,
          pageID: cache.InfiniteCache.getPageID(),
        });
      },
    ) as unknown as CacheEntry<
      InfiniteConduitPage<IValueType<O>, C>,
      ReturnType<C["evict"]>
    >;
    if (created) {
      cache.InfiniteCache.registerPageNode(entry);
    }
    return entry;
  }
}
