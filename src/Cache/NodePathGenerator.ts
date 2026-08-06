import type { Primitive } from "./types";
import { TypeChecker } from "./TypeChecker";

export class NodePathGenerator extends TypeChecker {
  public static readonly COLLATOR = new Intl.Collator("en-us", {
    numeric: true,
    sensitivity: "base",
  });

  public static traverse(
    value: unknown,
    onValue: (current: Primitive) => boolean,
  ) {
    if (!this.isObjectType(value)) {
      return onValue(value as Primitive);
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (!this.onValue(item, onValue)) {
          return false;
        }
      }
    } else {
      if (
        // TODO allow maps and sets
        NodePathGenerator.NON_SERIALIZEABLE_OBJECTS.some(
          c => value instanceof c,
        )
      ) {
        this.nonImplementedError(value);
      }
      const keys = this.sortObjectKeys(value);
      for (const key of keys) {
        if (!onValue(key) || !this.onValue(value[key], onValue)) {
          return false;
        }
      }
    }
    return true;
  }

  private static onValue(value: any, onValue: (value: Primitive) => boolean) {
    if (!this.isObjectType(value)) {
      if (!onValue(value as Primitive)) {
        return false;
      }
    } else if (!this.traverse(value, onValue)) {
      return false;
    }
    return true;
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
