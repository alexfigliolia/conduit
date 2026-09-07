import type { NonFunction } from "@figliolia/galena";

import { ConduitStatus } from "../../Cache/Graph/types";
import type { CacheEntry } from "../../Cache/Graph/CacheEntry";

import type { IConduitExecutor } from "./types";

export class ConduitExecutor<T, U = T, C = U> {
  constructor(public readonly config: IConduitExecutor<T, U, C>) {}

  public build<F extends (...args: any[]) => T>(
    operation: F,
    cacheEntry: CacheEntry<U, any>,
  ) {
    return (...args: Parameters<F>) => {
      switch (this.config.cachePolicy) {
        case "cache-only":
          return this.readCache(cacheEntry);
        case "bypass-cache":
          return this.executeAndCache(cacheEntry, operation, args);
        case "read-cache-with-respect-to-expiry":
        default:
          return this.runCacheFirst(cacheEntry, operation, args);
      }
    };
  }

  private runCacheFirst<F extends (...args: any[]) => T>(
    cacheEntry: CacheEntry<U, any>,
    operation: F,
    args: Parameters<F>,
  ) {
    if (Date.now() - cacheEntry.updatedAt >= this.config.expires) {
      return this.executeAndCache(cacheEntry, operation, args);
    }
    return this.readCache(cacheEntry);
  }

  private executeAndCache<F extends (...args: any[]) => T>(
    cacheEntry: CacheEntry<U, any>,
    operation: F,
    args: Parameters<F>,
  ): ReturnType<F> {
    const outstandingTask = cacheEntry.getOutstandingTask<ReturnType<F>>();
    if (outstandingTask) {
      return outstandingTask;
    }
    cacheEntry.setStatus(ConduitStatus.IN_FLIGHT);
    const result = cacheEntry.registerTask(operation(...args));
    if (result instanceof Promise) {
      return result.then(v =>
        this.onExecutionResult(cacheEntry, v),
      ) as ReturnType<F>;
    }
    return this.onExecutionResult(cacheEntry, result) as ReturnType<F>;
  }

  private onExecutionResult(cacheEntry: CacheEntry<U, any>, value: T) {
    const { cacheInterceptor } = this.config;
    if (typeof cacheInterceptor === "function") {
      cacheEntry.setValue(
        prev => cacheInterceptor(prev, value) as NonFunction<U>,
      );
    } else {
      cacheEntry.setValue(value as NonFunction<U>);
    }
    cacheEntry.setStatus(ConduitStatus.IDOL);
    return value;
  }

  private readCache(cacheEntry: CacheEntry<U, any>) {
    const cacheValue = cacheEntry.getValue();
    if (this.config.onCacheRead) {
      return this.config.onCacheRead(cacheValue);
    }
    return cacheValue as U;
  }
}
