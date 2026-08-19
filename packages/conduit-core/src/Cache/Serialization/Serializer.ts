import { UndefinedSerializer } from "./UndefinedSerializer";
import type { OnPrimitive, Primitive } from "./types";
import { TypeChecker } from "./TypeChecker";
import { SetSerializer } from "./SetSerializer";
import { RegExpSerializer } from "./RegexSerializer";
import { MapSerializer } from "./MapSerializer";
import { InfiniteConduitValueSerializer } from "./InfiniteConduitValueSerializer";
import { HashTableSerializer } from "./HashTableSerializer";
import { DateSerializer } from "./DateSerializer";
import { BigIntSerializer } from "./BigIntSerializer";
import { ArraySerializer } from "./ArraySerializer";
import { AbstractSerializer } from "./AbstractSerializer";

export class Serializer {
  public static readonly SERIALIZATION_MARKER =
    AbstractSerializer.SERIALIZATION_MARKER;
  public static readonly BINDINGS = {
    traverse: this.traverse.bind(this),
    serialize: this.serialize.bind(this),
    deserialize: this.deserialize.bind(this),
  };
  public static readonly ARRAY_SERIALIZER = new ArraySerializer(
    this.BINDINGS.traverse,
  );
  public static readonly HASH_TABLE_SERIALIZER = new HashTableSerializer(
    this.BINDINGS.traverse,
  );
  public static readonly MAP_SERIALIZER = new MapSerializer(this.BINDINGS);
  public static readonly INTERNAL_JSON_SERIALIZERS = [
    this.MAP_SERIALIZER,
    new SetSerializer(this.BINDINGS),
    new BigIntSerializer(),
    new DateSerializer(),
    new RegExpSerializer(),
    new UndefinedSerializer(),
    new InfiniteConduitValueSerializer(this.BINDINGS),
  ];
  public static readonly KEY_SERIALIZATION_INDICATOR = `${this.SERIALIZATION_MARKER}:Key`;

  public static toPath(key: any[], args: any[], onValue: OnPrimitive) {
    if (!this.iterateAndTraverse(key, onValue)) {
      return false;
    }
    onValue(this.KEY_SERIALIZATION_INDICATOR);
    return this.iterateAndTraverse(args, onValue);
  }

  public static serialize(value: unknown): any {
    for (const serializer of this.INTERNAL_JSON_SERIALIZERS) {
      if (serializer.matchPreserializationInput(value)) {
        return serializer.serialize(value as never);
      }
    }
    return this.handleNativeSerializeables(value, this.BINDINGS.serialize);
  }

  public static deserialize(value: unknown): any {
    if (AbstractSerializer.isSerializedValue(value)) {
      for (const deserializer of this.INTERNAL_JSON_SERIALIZERS) {
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

  private static iterateAndTraverse(list: any[], onValue: OnPrimitive) {
    for (const item of list) {
      if (!this.traverse(item, onValue)) {
        return false;
      }
    }
    return true;
  }

  private static traverse(value: unknown, onValue: OnPrimitive): any {
    if (!TypeChecker.isObjectType(value) && typeof value !== "undefined") {
      return onValue(value as Primitive);
    }
    if (value instanceof Function) {
      throw TypeChecker.nonImplementedError(value);
    }
    if (Array.isArray(value)) {
      return this.ARRAY_SERIALIZER.toPath(value, onValue);
    }
    for (const serializer of this.INTERNAL_JSON_SERIALIZERS) {
      if (serializer.matchPreserializationInput(value)) {
        return serializer.toPath(value as never, onValue);
      }
    }
    return this.HASH_TABLE_SERIALIZER.toPath(
      value as Record<any, any>,
      onValue,
    );
  }
}
