import { type IConduit, type IOperation } from "./types";
import type { IExecuteOptions, IValueType } from "./types";
import { Cache } from "./Cache";

export class Conduit<O extends IOperation> {
  public readonly options: IConduit<O>;
  private static readonly DEFAULT_LIFE_TIME = 1000 * 60 * 5;
  constructor(options: IConduit<O>) {
    this.options = Object.freeze(options);
  }

  public execute({
    args,
    expires,
    cachePolicy = "read-cache-with-respect-to-expiry",
  }: IExecuteOptions<O>) {
    const cacheKey = [this.options.key, args];
    if (cachePolicy === "read-cache-with-respect-to-expiry") {
      return this.runCacheFirst(
        cacheKey,
        expires ?? this.options.expires ?? Conduit.DEFAULT_LIFE_TIME,
        ...args,
      );
    }
    return this.executeAndAttemptToCache(cacheKey, ...args);
  }

  private runCacheFirst(
    cacheKey: any[],
    expiry: number,
    ...args: Parameters<O>
  ) {
    const cache = this.getCache();
    const node = cache?.get?.(cacheKey);
    if (!cache || !node || performance.now() - node.updatedAt >= expiry) {
      return this.executeAndAttemptToCache(cacheKey, ...args);
    }
    // TODO - maybe a cache refresh on an interval in the background
    return node.value as unknown as IValueType<O>;
  }

  private executeAndAttemptToCache(cacheKey: any[], ...args: Parameters<O>) {
    const cache = this.getCache();
    const result = this.options.operation(...args);
    if (result instanceof Promise) {
      void result.then(v => cache?.set?.(cacheKey, v));
    } else {
      cache?.set?.(cacheKey, result);
    }
    return result as ReturnType<O>;
  }

  private getCache() {
    if (typeof this.options.cache === "function") {
      return this.options.cache();
    }
    if (this.options.cache instanceof Cache) {
      return this.options.cache;
    }
  }
}
