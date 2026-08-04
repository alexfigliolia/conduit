import {
  type IOperation,
  type IReactivePaginated,
  type IValueType,
  type IPaginatedSetter,
  Status,
} from "./types";
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
    this.setStatus(Status.COMPUTING);
    const result = this.options.operation(...args);
    const page = this.options.getPage(args);
    if (result instanceof Promise) {
      void result.then(value => {
        this.write(page, value);
      });
    } else {
      this.write(page, result);
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
    super.evict();
  }

  // @ts-expect-error "type modified for pagination"
  public override mutate(value: IPaginatedSetter<O>) {
    this.runMutation(value);
  }

  private write(page: number, value: IValueType<O>) {
    const cache = this.options.getCache();
    const cachedValue = [...(cache.get<IValueType<O>[]>(this.key) ?? [])];
    cachedValue[page] = value;
    super.processValue(cachedValue);
    const pageKey = Base.toKey([this.key, page]);
    cache.initialize(pageKey, value);
  }
}
