import type { ConduitSerializedValue, OnPrimitive } from "./types";
import { TypeChecker } from "./TypeChecker";
import { AbstractPathSerializer } from "./AbstractPathSerializer";

export abstract class AbstractSerializer<
  T,
  O,
> extends AbstractPathSerializer<T> {
  public serialize(value: T): ConduitSerializedValue<O> {
    return {
      [AbstractSerializer.SERIALIZATION_MARKER]: this.typeName,
      value: this.serializeValue(value),
    };
  }

  public matchPostSerializedInput(
    input: ConduitSerializedValue<unknown>,
  ): input is ConduitSerializedValue<T> {
    return input[AbstractSerializer.SERIALIZATION_MARKER] === this.typeName;
  }

  public static isSerializedValue(
    input: unknown,
  ): input is ConduitSerializedValue<unknown> {
    return (
      TypeChecker.isHashTable(input) &&
      AbstractSerializer.SERIALIZATION_MARKER in input
    );
  }

  public abstract toPath(value: T, onPrimitive: OnPrimitive): boolean;

  public abstract matchPreserializationInput(input: unknown): input is T;

  public abstract deserialize(value: ConduitSerializedValue<O>): T;

  protected defaultPathSerializer(value: T, onPrimitive: OnPrimitive) {
    onPrimitive(this.KEY_INDICATOR);
    for (const key in value) {
      if (
        !value[key] ||
        !onPrimitive(key) ||
        !this.config.traverse(value[key], onPrimitive)
      ) {
        return false;
      }
    }
    return onPrimitive(this.KEY_INDICATOR);
  }

  protected abstract serializeValue(value: T): O;

  protected sanitationError(value: unknown) {
    throw new Error(
      `Deserialization Error: ${this.constructor.name} cannot deserialize the input ${value as any} to type ${this.typeName}`,
      { cause: value },
    );
  }
}
