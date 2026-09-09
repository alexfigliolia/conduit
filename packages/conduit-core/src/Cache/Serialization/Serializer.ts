import {
  UndefinedSerializer,
  TypeChecker,
  SetSerializer,
  RegExpSerializer,
  MapSerializer,
  InfiniteConduitPageSerializer,
  HashTableSerializer,
  DateSerializer,
  BigIntSerializer,
  ArraySerializer,
  AbstractSerializer,
  AbstractPathSerializer,
  type OnPrimitive,
  type Primitive,
  type CustomSerializer,
  InfiniteConduitValueSerializer,
} from "./Serializers";

export class Serializer {
  public static readonly BINDINGS = {
    traverse: this.traverse.bind(this),
    serialize: this.serialize.bind(this),
    deserialize: this.deserialize.bind(this),
  };
  public static readonly ARRAY_SERIALIZER = new ArraySerializer(this.BINDINGS);
  public static readonly HASH_TABLE_SERIALIZER = new HashTableSerializer(
    this.BINDINGS,
  );
  public static readonly INTERNAL_JSON_SERIALIZERS: AbstractSerializer<
    any,
    any
  >[] = [
    MapSerializer,
    SetSerializer,
    BigIntSerializer,
    DateSerializer,
    RegExpSerializer,
    UndefinedSerializer,
    InfiniteConduitPageSerializer,
    InfiniteConduitValueSerializer,
  ].map(C => new C(this.BINDINGS));
  public static readonly KEY_SERIALIZATION_INDICATOR = `${AbstractPathSerializer.SERIALIZATION_MARKER}:Key`;

  public static registerJSONSerializer(...serializers: CustomSerializer[]) {
    this.INTERNAL_JSON_SERIALIZERS.push(
      ...serializers.map(C => new C(this.BINDINGS)),
    );
  }

  public static toPath(key: any[], args: any[], onPrimitive: OnPrimitive) {
    if (!this.iterateAndTraverse(key, onPrimitive)) {
      return false;
    }
    onPrimitive(Serializer.KEY_SERIALIZATION_INDICATOR);
    return this.iterateAndTraverse(args, onPrimitive);
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
    onPrimitive: (value: unknown) => unknown,
  ) {
    if (!TypeChecker.isObjectType(value)) {
      return value;
    }
    if (TypeChecker.isHashTable(value)) {
      return Object.keys(value).reduce(
        (acc, next) => {
          acc[next] = onPrimitive(value[next]);
          return acc;
        },
        {} as Record<any, any>,
      );
    }
    if (Array.isArray(value)) {
      return (value as any[]).map(v => onPrimitive(v));
    }
    throw TypeChecker.nonImplementedError(value);
  }

  private static iterateAndTraverse(list: any[], onPrimitive: OnPrimitive) {
    for (const item of list) {
      if (!this.traverse(item, onPrimitive)) {
        return false;
      }
    }
    return true;
  }

  private static traverse(value: unknown, onPrimitive: OnPrimitive): any {
    if (!TypeChecker.isObjectType(value) && typeof value !== "undefined") {
      return onPrimitive(value as Primitive);
    }
    if (value instanceof Function) {
      throw TypeChecker.nonImplementedError(value);
    }
    if (Array.isArray(value)) {
      return this.ARRAY_SERIALIZER.toPath(value, onPrimitive);
    }
    for (const serializer of this.INTERNAL_JSON_SERIALIZERS) {
      if (serializer.matchPreserializationInput(value)) {
        return serializer.toPath(value as never, onPrimitive);
      }
    }
    return this.HASH_TABLE_SERIALIZER.toPath(
      value as Record<any, any>,
      onPrimitive,
    );
  }
}
