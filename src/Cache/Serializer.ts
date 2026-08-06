import type { ConduitSerializedValue } from "./types";
import { TypeChecker } from "./TypeChecker";

export class Serializer {
  public static readonly SERIALIZATION_MARKER = "___CONDUIT___";
  public static readonly SERIALIZED_CONSTRUCTORS = [Map, Set] as const;
  public static readonly SERIALIZED_TYPES = ["undefined", "bigint"] as const;

  public static serialize(value: unknown): any {
    if (Serializer.shouldUseInternalSerializer(value)) {
      return Serializer.applyInteralSerialization(value);
    }
    if (!TypeChecker.isObjectType(value)) {
      return value;
    }
    if (TypeChecker.isHashTable(value)) {
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
    throw TypeChecker.nonImplementedError(value);
  }

  public static deserialize(value: unknown): any {
    if (!TypeChecker.isObjectType(value)) {
      return value;
    }
    if (TypeChecker.isHashTable(value)) {
      if (Serializer.isInternallySerialized(value)) {
        return Serializer.applyInteralDeserialization(value);
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
    throw TypeChecker.nonImplementedError(value);
  }

  public static isInternallySerialized(value: any) {
    return TypeChecker.isHashTable(value) && this.SERIALIZATION_MARKER in value;
  }

  public static shouldUseInternalSerializer(value: any) {
    return (
      this.SERIALIZED_TYPES.includes(typeof value as any) ||
      this.SERIALIZED_CONSTRUCTORS.some(C => value instanceof C)
    );
  }

  public static applyInteralDeserialization(value: any) {
    const type = value[this.SERIALIZATION_MARKER] as string;
    switch (type) {
      case "undefined":
        return undefined;
      case "bigint":
        return this.constructFromSerialized(
          value,
          v => BigInt(v),
          v => typeof v === "string",
        );
      case "map":
        return this.constructFromSerialized(
          value,
          i => new Map(i),
          v => Array.isArray(v),
        );
      case "set":
        return this.constructFromSerialized(
          value,
          i => new Set(i),
          v => Array.isArray(v),
        );
      default:
        throw TypeChecker.nonImplementedError(value);
    }
  }

  public static applyInteralSerialization(
    value: any,
  ): ConduitSerializedValue<unknown> {
    switch (typeof value) {
      case "undefined": {
        return { [this.SERIALIZATION_MARKER]: "undefined" };
      }
      case "bigint": {
        return {
          [this.SERIALIZATION_MARKER]: "bigint",
          value: value.toString(),
        };
      }
      default:
        if (value instanceof Map) {
          return {
            [this.SERIALIZATION_MARKER]: "map",
            value: this.serialize(Array.from(value.entries())),
          };
        }
        if (value instanceof Set) {
          return {
            [this.SERIALIZATION_MARKER]: "set",
            value: this.serialize(Array.from(value.values())),
          };
        }
        throw TypeChecker.nonImplementedError(value);
    }
  }

  private static constructFromSerialized<F extends (...values: any[]) => any>(
    value: ConduitSerializedValue<unknown>,
    creator: F,
    validator: (value: unknown) => boolean,
  ) {
    if (!("value" in value) || !validator(value.value)) {
      throw TypeChecker.deserializationError(value);
    }
    return creator(this.deserialize(value.value));
  }
}
