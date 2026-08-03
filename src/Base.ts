import type { IKey, IReactive } from "./types";

export abstract class Base<T extends IReactive<any>> {
  public lastExecution = 0;
  public readonly key: string;
  constructor(public readonly options: T) {
    this.key = Base.toKey(this.options.key);
    this.options
      .getCache()
      .initialize(this.key, Base.toCacheInit(this.key, this.options));
  }

  public evict() {
    return this.options.getCache().evict(this.key);
  }

  public get isStale() {
    if (typeof this.options.expiresIn === "undefined") {
      return false;
    }
    return this.lastExecution + this.options.expiresIn <= performance.now();
  }

  public static toKey(key: IKey) {
    if (typeof key === "string") {
      return key;
    }
    return key.join(".");
  }

  private static toCacheInit<T extends IReactive<any>>(
    key: string,
    options: T,
  ) {
    if (!("defaultValue" in options)) {
      return options.getCache().get(key);
    }
    return options.defaultValue;
  }
}
