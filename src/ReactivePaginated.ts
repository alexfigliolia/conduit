import type { IOperation, IReactivePaginated, IValueType } from "./types";
import { Reactive } from "./Reactive";
import { Base } from "./Base";

export class ReactivePaginated<O extends IOperation> extends Reactive<
  IReactivePaginated<O>
> {
  constructor(options: Omit<IReactivePaginated<O>, "defaultValue">) {
    const cache = options.getCache();
    const defaultValue =
      cache.get<IValueType<O>[]>(Base.toKey(options.key)) ?? [];
    super({ ...options, defaultValue });
    let idx = -1;
    for (const entry of defaultValue) {
      cache.initialize(Base.toKey([this.key, ++idx]), entry);
    }
  }

  public execute(...args: Parameters<O>) {
    const result = this.options.operation(...args);
    const page = this.options.getPage(args);
    if (result instanceof Promise) {
      void result.then(value => {
        this.processValue(page, value);
      });
    } else {
      this.processValue(page, result);
    }
    return result as ReturnType<O>;
  }

  public override evict() {
    const cache = this.options.getCache();
    const value = cache.get<IValueType<O>[]>(this.key);
    let idx = -1;
    for (const _ of value) {
      cache.evict(Base.toKey([this.key, ++idx]));
    }
    cache.evict(this.key);
  }

  private processValue(page: number, value: IValueType<O>) {
    const cache = this.options.getCache();
    const cachedValue = [...(cache.get<IValueType<O>[]>(this.key) ?? [])];
    cachedValue[page] = value;
    cache.initialize(this.key, cachedValue);
    this.lastExecution = performance.now();
    const pageKey = Base.toKey([this.key, page]);
    cache.initialize(pageKey, value);
  }
}
