import {
  type TokenTraversalFn,
  type OnPrimitive,
  type PathKeyIndicator,
} from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export class HashTableSerializer {
  public static readonly COLLATOR = new Intl.Collator("en-us", {
    numeric: true,
    sensitivity: "base",
  });
  public readonly KEY_INDICATOR: PathKeyIndicator = `${AbstractSerializer.SERIALIZATION_MARKER}:{}`;
  constructor(public readonly traverse: TokenTraversalFn) {}

  public toPath(value: Record<any, any>, onValue: OnPrimitive): boolean {
    onValue(this.KEY_INDICATOR);
    const keys = HashTableSerializer.sortObjectKeys(value);
    for (const key of keys) {
      if (!onValue(key) || !this.traverse(value[key], onValue)) {
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
