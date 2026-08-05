import { ConduitStatus, type IConduit, type IOperation } from "./types";
import type { IExecuteOptions, IValueType } from "./types";
import { Cache } from "./Cache";

export class Conduit<O extends IOperation> {
  public readonly options: IConduit<O>;
  public static readonly DEFAULT_LIFE_TIME = 1000 * 60 * 5;
  constructor(options: IConduit<O>) {
    this.options = Object.freeze(options);
  }

  public prepare(options: Omit<IExecuteOptions<O>, "args"> = {}) {
    return (...args: Parameters<O>) => this.execute({ ...options, args });
  }

  public execute({
    args,
    expires,
    cachePolicy = this.options.cachePolicy,
  }: IExecuteOptions<O>) {
    const cacheKey = [this.options.key, args];
    switch (cachePolicy) {
      case "cache-only":
        return this.getCachedValue(cacheKey);
      case "no-cache":
        return this.executeAndCache(cacheKey, ...args);
      case "read-cache-with-respect-to-expiry":
      default:
        return this.runCacheFirst(
          cacheKey,
          expires ?? this.options.expires ?? Conduit.DEFAULT_LIFE_TIME,
          ...args,
        );
    }
  }

  public executeAndCache(cacheKey: any[], ...args: Parameters<O>) {
    this.getCache()?.get?.(cacheKey)?.Status?.set(ConduitStatus.IN_FLIGHT);
    const result = this.options.operation(...args);
    if (result instanceof Promise) {
      void result.then(v => this.onExecutionResult(cacheKey, v));
    } else {
      this.onExecutionResult(cacheKey, result);
    }
    return result as ReturnType<O>;
  }

  private runCacheFirst(
    cacheKey: any[],
    expiry: number,
    ...args: Parameters<O>
  ) {
    const node = this.getCachedNode(cacheKey);
    if (!node?.State || Date.now() - node.updatedAt >= expiry) {
      return this.executeAndCache(cacheKey, ...args);
    }
    // TODO - maybe a cache refresh on an interval in the background
    return node.State.getState() as unknown as IValueType<O>;
  }

  public getCache() {
    if (typeof this.options.cache === "function") {
      return this.options.cache();
    }
    if (this.options.cache instanceof Cache) {
      return this.options.cache;
    }
  }

  public getCachedNode(cacheKey: any[]) {
    const cache = this.getCache();
    return cache?.get?.(cacheKey);
  }

  private getCachedValue(cacheKey: any[]) {
    const cacheState = this.getCachedNode(cacheKey)?.State;
    if (!cacheState) {
      return;
    }
    return cacheState.getState() as IValueType<O>;
  }

  private onExecutionResult(key: any[], value: IValueType<O>) {
    const node = this.getCache()?.set?.(key, value);
    node?.Status?.set?.(ConduitStatus.IDOL);
  }
}
