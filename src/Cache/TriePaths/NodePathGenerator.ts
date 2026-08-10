import type { Primitive } from "./types";
import { TypeChecker } from "./TypeChecker";
import { Serializer } from "./Serializer";

export class NodePathGenerator {
  public static readonly COLLATOR = new Intl.Collator("en-us", {
    numeric: true,
    sensitivity: "base",
  });
  public static readonly KEY_SERIALIZATION_INDICATOR = `${Serializer.SERIALIZATION_MARKER}:Key`;
  public static readonly ARRAY_SERIALIZATION_INDICATOR = `${Serializer.SERIALIZATION_MARKER}:[]`;
  public static readonly SET_SERIALIZATION_INDICATOR = `${Serializer.SERIALIZATION_MARKER}:Set{}`;
  public static readonly MAP_SERIALIZATION_INDICATOR = `${Serializer.SERIALIZATION_MARKER}:Map{}`;
  public static readonly OBJECT_SERIALIZATION_INDICATOR = `${Serializer.SERIALIZATION_MARKER}:{}`;
  public static readonly UNKNOWN_SERIALIZATION_INDICATOR = `${Serializer.SERIALIZATION_MARKER}:?`;
  public static readonly DATE_SERIALIZATION_INDICATOR = `${Serializer.SERIALIZATION_MARKER}:Date`;
  public static readonly REGEX_SERIALIZATION_INDICATOR = `${Serializer.SERIALIZATION_MARKER}:RegExp`;

  public static toPath(
    key: any[],
    args: any[],
    onValue: (current: Primitive) => boolean,
  ) {
    if (!this.iterateAndTraverse(key, onValue)) {
      return false;
    }
    onValue(this.KEY_SERIALIZATION_INDICATOR);
    return this.iterateAndTraverse(args, onValue);
  }

  private static iterateAndTraverse(
    list: any[],
    onValue: (current: Primitive) => boolean,
  ) {
    for (const item of list) {
      if (!this.traverse(item, onValue)) {
        return false;
      }
    }
    return true;
  }

  private static traverse(
    value: unknown,
    onValue: (current: Primitive) => boolean,
  ) {
    if (!TypeChecker.isObjectType(value)) {
      return onValue(value as Primitive);
    }
    if (Array.isArray(value)) {
      onValue(this.ARRAY_SERIALIZATION_INDICATOR);
      for (const item of value) {
        if (!this.traverse(item, onValue)) {
          return false;
        }
      }
      return onValue(this.ARRAY_SERIALIZATION_INDICATOR);
    }
    if (TypeChecker.NON_SERIALIZEABLE_OBJECTS.some(c => value instanceof c)) {
      throw TypeChecker.nonImplementedError(value);
    }
    if (value instanceof Date) {
      onValue(this.DATE_SERIALIZATION_INDICATOR);
      return onValue(value.toISOString());
    }
    if (value instanceof RegExp) {
      onValue(this.REGEX_SERIALIZATION_INDICATOR);
      return onValue(value.toString());
    }
    const orderedIterator = this.parseOrderedHashTableIterator(value);
    if (orderedIterator) {
      let indicator: string;
      if (value instanceof Map) {
        indicator = this.MAP_SERIALIZATION_INDICATOR;
      } else if (value instanceof Set) {
        indicator = this.SET_SERIALIZATION_INDICATOR;
      } else {
        indicator = this.UNKNOWN_SERIALIZATION_INDICATOR;
      }
      onValue(indicator);
      for (const entry of orderedIterator) {
        if (!this.traverse(entry, onValue)) {
          return false;
        }
      }
      return onValue(indicator);
    }
    onValue(this.OBJECT_SERIALIZATION_INDICATOR);
    const keys = this.sortObjectKeys(value);
    for (const key of keys) {
      if (!onValue(key) || !this.traverse(value[key], onValue)) {
        return false;
      }
    }
    return onValue(this.OBJECT_SERIALIZATION_INDICATOR);
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

  private static parseOrderedHashTableIterator(value: unknown) {
    if (value instanceof Map) {
      return value.entries();
    }
    if (value instanceof Set) {
      return value.values();
    }
  }
}
