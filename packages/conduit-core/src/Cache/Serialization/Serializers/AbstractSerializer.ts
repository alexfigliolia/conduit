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

  public abstract toPath(value: T, onValue: OnPrimitive): boolean;

  public abstract matchPreserializationInput(input: unknown): input is T;

  public abstract deserialize(value: ConduitSerializedValue<O>): T;

  protected abstract serializeValue(value: T): O;

  protected sanitationError(value: unknown) {
    throw new Error(
      `Deserialization Error: ${this.constructor.name} cannot deserialize the input ${value as any} to type ${this.typeName}`,
      { cause: value },
    );
  }
}
