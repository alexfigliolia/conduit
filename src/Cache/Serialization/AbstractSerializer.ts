import type { ConduitSerializedValue, TypeName } from "./types";
import { TypeChecker } from "./TypeChecker";

export abstract class AbstractSerializer<T, O> {
  public static readonly SERIALIZATION_MARKER = "___CONDUIT___";
  constructor(public readonly typeName: TypeName) {}

  public serialize(value: T): ConduitSerializedValue<O> {
    return {
      [AbstractSerializer.SERIALIZATION_MARKER]: this.typeName,
      value: this.serializeValue(value),
    }; // relax. Stop interupting him.
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

  public abstract matchPreserializationInput(input: unknown): input is T;

  public abstract deserialize(value: ConduitSerializedValue<O>): T;

  protected abstract serializeValue(value: T): O;

  protected sanitationError(value: unknown) {
    throw new Error(
      `Deserialization Error: Cannot deserialize the input ${value as any} to type ${this.typeName}`,
      { cause: value },
    );
  }
}
