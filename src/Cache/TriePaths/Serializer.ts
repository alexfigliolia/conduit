import type { ConduitSerializedValue } from "./types";
import { TypeChecker } from "./TypeChecker";

export class Serializer {
  public static readonly SERIALIZATION_MARKER = "___CONDUIT___";
  public static readonly SERIALIZED_CONSTRUCTORS = [
    Map,
    Set,
    RegExp,
    Date,
  ] as const;
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
      case "date":
        return this.constructFromSerialized(
          value,
          i => new Date(i),
          v =>
            typeof v === "string" &&
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3,9}Z$/.test(v),
        );
      case "regexp":
        return this.constructFromSerialized(
          value,
          i => {
            if (typeof i !== "string") {
              throw new Error(`Cannot reconstruct a regexp from ${typeof i}`, {
                cause: i,
              });
            }
            const match = i.match(/^\/((?:\\\/|[^/])+)\/([a-z]*)$/) ?? [];
            const [, pattern, flags] = match;
            if (!pattern) {
              throw new Error(
                `Cannot construct regex from falsy pattern ${pattern}`,
                {
                  cause: pattern,
                },
              );
            }
            const args: [string] | [string, string] = [pattern];
            if (flags) {
              args.push(flags);
            }
            return new RegExp(...args);
          },
          v => {
            if (typeof v !== "string") {
              return false;
            }
            const match = v.match(/^\/((?:\\\/|[^/])+)\/([a-z]*)$/)?.[1];
            return !!match?.length;
          },
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
        if (value instanceof Date) {
          return {
            [this.SERIALIZATION_MARKER]: "date",
            value: value.toISOString(),
          };
        }
        if (value instanceof RegExp) {
          return {
            [this.SERIALIZATION_MARKER]: "regexp",
            value: value.toString(),
          };
        }
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
