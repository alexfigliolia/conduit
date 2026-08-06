import type { Primative } from "./types";
import { TypeChecker } from "./TypeChecker";
import { Serialized } from "./Serialized";

export class Indexable extends TypeChecker {
  public static readonly COLLATOR = new Intl.Collator("en-us", {
    numeric: true,
    sensitivity: "base",
  });

  public static traverse(
    value: unknown,
    onValue: (current: Primative) => boolean,
  ) {
    if (!this.isObjectType(value)) {
      if (
        Indexable.NON_SERIALIZEABLE_NUMBERS.some(p => value === p) ||
        Indexable.NON_SERIALIZEABLE_PRIMITIVES.some(t => typeof value === t)
      ) {
        this.nonImplementedError(value);
      }
      if (typeof value === "bigint") {
        return onValue(value.toString());
      }
      return onValue(value as Primative);
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (!this.traverse(item, onValue)) {
          return false;
        }
      }
    } else {
      if (Indexable.NON_SERIALIZEABLE_OBJECTS.some(c => value instanceof c)) {
        this.nonImplementedError(value);
      }
      const keys = this.sortObjectKeys(value);
      for (const key of keys) {
        if (!onValue(key) || !this.traverse(value[key], onValue)) {
          return false;
        }
      }
    }
    return true;
  }

  public static serialize(value: unknown): any {
    if (Serialized.shouldSerialize(value)) {
      return Serialized.serialize(value);
    }
    if (!this.isObjectType(value)) {
      return value;
    }
    if (this.isHashTable(value)) {
      return Object.keys(value).reduce(
        (acc, next) => {
          acc[next] = this.serialize(value[next]);
          return acc;
        },
        {} as Record<any, any>,
      );
    }
    if (Array.isArray(value)) {
      return (value as any[]).map(v => this.serialize(v));
    }
    this.nonImplementedError(value);
  }

  public static deserialize(value: unknown): any {
    if (!this.isObjectType(value)) {
      return value;
    }
    if (this.isHashTable(value)) {
      if (Serialized.shouldDeserialize(value)) {
        return Serialized.deserialize(value);
      }
      return Object.keys(value).reduce(
        (acc, next) => {
          acc[next] = this.deserialize(value[next]);
          return acc;
        },
        {} as Record<any, any>,
      );
    }
    if (Array.isArray(value)) {
      return (value as any[]).map(v => this.deserialize(v));
    }
    this.nonImplementedError(value);
  }

  public static sortObjectKeys(obj: Record<any, any>) {
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
