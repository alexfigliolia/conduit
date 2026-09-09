import type { NonFunction } from "@figliolia/galena";

import { ConduitStatus } from "../../Cache/Graph/types";
import type { CacheEntry } from "../../Cache/Graph/CacheEntry";

import type {
  ConduitValue,
  IConduitExecutor,
  IOperation,
  IValueType,
} from "./types";

export class ConduitExecutor<
  O extends IOperation,
  D = undefined,
  U = ConduitValue<O, D>,
  C = U,
> {
  constructor(public readonly config: IConduitExecutor<O, D, U, C>) {}

  public build(cacheEntry: CacheEntry<U, any>) {
    return (...args: Parameters<O>) => {
      switch (this.config.cachePolicy) {
        case "cache-only":
          return this.readCache(cacheEntry);
        case "bypass-cache":
          return this.executeAndCache(cacheEntry, args);
        case "read-cache-with-respect-to-expiry":
        default:
          return this.runCacheFirst(cacheEntry, args);
      }
    };
  }

  private runCacheFirst(cacheEntry: CacheEntry<U, any>, args: Parameters<O>) {
    if (Date.now() - cacheEntry.updatedAt >= this.config.expires) {
      return this.executeAndCache(cacheEntry, args);
    }
    return this.readCache(cacheEntry);
  }

  private executeAndCache(
    cacheEntry: CacheEntry<U, any>,
    args: Parameters<O>,
  ): ReturnType<O> {
    const outstandingTask = cacheEntry.getOutstandingTask<ReturnType<O>>();
    if (outstandingTask) {
      return outstandingTask;
    }
    cacheEntry.setStatus(ConduitStatus.IN_FLIGHT);
    const result = cacheEntry.registerTask(this.config.operation(...args));
    if (result instanceof Promise) {
      return result.then(v =>
        this.onExecutionResult(cacheEntry, v),
      ) as ReturnType<O>;
    }
    return this.onExecutionResult(cacheEntry, result);
  }

  private onExecutionResult(
    cacheEntry: CacheEntry<U, any>,
    value: IValueType<O>,
  ) {
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
    return cacheValue as C;
  }
}
