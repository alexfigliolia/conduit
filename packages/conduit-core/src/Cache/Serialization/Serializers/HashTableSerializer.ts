import {
  type OnPrimitive,
  TypeName,
  type IInterativeSerializer,
} from "./types";
import { AbstractPathSerializer } from "./AbstractPathSerializer";

export class HashTableSerializer extends AbstractPathSerializer<
  Record<any, any>
> {
  public static readonly COLLATOR = new Intl.Collator("en-us", {
    numeric: true,
    sensitivity: "base",
  });
  constructor(config: IInterativeSerializer) {
    super(TypeName.OBJECT, config);
  }

  public override toPath(
    value: Record<any, any>,
    onValue: OnPrimitive,
  ): boolean {
    onValue(this.KEY_INDICATOR);
    const keys = HashTableSerializer.sortObjectKeys(value);
    for (const key of keys) {
      if (!onValue(key) || !this.config.traverse(value[key], onValue)) {
        return false;
      }
    }
    return onValue(this.KEY_INDICATOR);
  }

  private static sortObjectKeys(obj: Record<any, any>) {
    const digits: any[] = [];
    const strings: string[] = [];
    for (const key in obj) {
      if (!isNaN(Number(key))) {
        digits.push(key);
      } else {
        strings.push(key);
      }
    }
    strings.sort(this.COLLATOR.compare);
    return [...digits, ...strings];
  }
}
