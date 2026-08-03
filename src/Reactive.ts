import type { IReactive, IValueType } from "./types";
import { Base } from "./Base";

export class Reactive<T extends IReactive<any>> extends Base<T> {
  public execute(...args: Parameters<T["operation"]>) {
    const result = this.options.operation(...args);
    if (result instanceof Promise) {
      void result.then(value => {
        this.write(value);
      });
    } else {
      this.write(result);
    }
    return result as ReturnType<T["operation"]>;
  }

  private write(value: IValueType<T["operation"]>) {
    this.options.getCache().initialize(this.key, value);
    this.lastExecution = performance.now();
  }
}
