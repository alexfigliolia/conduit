import { UndefinedSerializer } from "./UndefinedSerializer";
import { TypeChecker } from "./TypeChecker";
import { SetSerializer } from "./SetSerializer";
import { RegExpSerializer } from "./RegexSerializer";
import { MapSerializer } from "./MapSerializer";
import { DateSerializer } from "./DateSerializer";
import { BigIntSerializer } from "./BigIntSerializer";
import { AbstractSerializer } from "./AbstractSerializer";

export class Serializer {
  public static readonly BINDINGS = {
    serialize: Serializer.serialize.bind(Serializer),
    deserialize: Serializer.deserialize.bind(Serializer),
  };
  public static readonly INTERNAL_SERIALIZERS = [
    new MapSerializer(this.BINDINGS),
    new SetSerializer(this.BINDINGS),
    new BigIntSerializer(),
    new DateSerializer(),
    new RegExpSerializer(),
    new UndefinedSerializer(),
  ];
  public static readonly SERIALIZATION_MARKER =
    AbstractSerializer.SERIALIZATION_MARKER;

  public static serialize(value: unknown): any {
    for (const serializer of this.INTERNAL_SERIALIZERS) {
      if (serializer.matchPreserializationInput(value)) {
        return serializer.serialize(value as never);
      }
    }
    return this.handleNativeSerializeables(value, this.BINDINGS.serialize);
  }

  public static deserialize(value: unknown): any {
    if (AbstractSerializer.isSerializedValue(value)) {
      for (const deserializer of this.INTERNAL_SERIALIZERS) {
        if (deserializer.matchPostSerializedInput(value)) {
          return deserializer.deserialize(value as never);
        }
      }
      throw TypeChecker.nonImplementedError(value);
    }
    return this.handleNativeSerializeables(value, this.BINDINGS.deserialize);
  }

  private static handleNativeSerializeables(
    value: unknown,
    onValue: (value: unknown) => unknown,
  ) {
    if (!TypeChecker.isObjectType(value)) {
      return value;
    }
    if (TypeChecker.isHashTable(value)) {
      return Object.keys(value).reduce(
        (acc, next) => {
          acc[next] = onValue(value[next]);
          return acc;
        },
        {} as Record<any, any>,
      );
    }
    if (Array.isArray(value)) {
      return (value as any[]).map(v => onValue(v));
    }
    throw TypeChecker.nonImplementedError(value);
  }
}
