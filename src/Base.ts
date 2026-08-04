import { EventEmitter } from "@figliolia/event-emitter";

import { Status, type IKey, type IReactive, type Mutator } from "./types";

export abstract class Base<T extends IReactive<any>> {
  public lastExecution = 0;
  public readonly key: string;
  public status = Status.UNINITIALIZED;
  private readonly Emitter = new EventEmitter<{ status: Status }>();
  constructor(public readonly options: T) {
    this.key = Base.toKey(this.options.key);
    this.options
      .getCache()
      .initialize(this.key, Base.toCacheInit(this.key, this.options));
  }

  public setStatus(status: Status) {
    this.status = status;
  }

  public subscribe(callback: (status: Status) => void) {
    const ID = this.Emitter.on("status", callback);
    return () => {
      this.Emitter.off("status", ID);
    };
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

  protected runMutation(value: Mutator<any>) {
    const cache = this.options.getCache();
    if (typeof value !== "function") {
      return cache.initialize(this.key, value);
    }
    return cache.initialize(this.key, value(cache.get(this.key)));
  }

  protected processValue<T>(value: T) {
    this.options.getCache().initialize(this.key, value);
    this.lastExecution = performance.now();
    this.setStatus(Status.IDOL);
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
