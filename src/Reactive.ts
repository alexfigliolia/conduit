import { Status, type IReactive, type ISetter, type IValueType } from "./types";
import { Base } from "./Base";

export class Reactive<T extends IReactive<any>> extends Base<T> {
  public execute(...args: Parameters<T["operation"]>) {
    this.setStatus(Status.COMPUTING);
    const result = this.options.operation(...args);
    if (result instanceof Promise) {
      void result.then(value => {
        this.processValue(value);
      });
    } else {
      this.processValue(result);
    }
    return result as ReturnType<T["operation"]>;
  }

  public mutate(value: ISetter<IValueType<T["operation"]>>) {
    super.runMutation(value);
  }

  protected diffSetter(
    value: ISetter<IValueType<T["operation"]>>,
  ): value is IValueType<T["operation"]> {
    return typeof value !== "function";
  }
}
