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
    onPrimitive: OnPrimitive,
  ): boolean {
    onPrimitive(this.KEY_INDICATOR);
    const strings: string[] = [];
    for (const key in value) {
      // @ts-expect-error bitwise int comparison using loose equality check
      if (key == (key | 0)) {
        if (
          !onPrimitive(key) ||
          !this.config.traverse(value[key], onPrimitive)
        ) {
          return false;
        }
      } else {
        strings.push(key);
      }
    }
    // sort string keys for deterministic paths
    strings.sort(HashTableSerializer.COLLATOR.compare);
    for (const key of strings) {
      if (!onPrimitive(key) || !this.config.traverse(value[key], onPrimitive)) {
        return false;
      }
    }
    return onPrimitive(this.KEY_INDICATOR);
  }
}
