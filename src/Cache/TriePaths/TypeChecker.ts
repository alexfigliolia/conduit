export class TypeChecker {
  public static readonly NON_SERIALIZEABLE_OBJECTS = [
    RegExp,
    Function,
  ] as const;

  public static isObjectType(
    arg: any,
  ): arg is Record<string | number | symbol, any> {
    return typeof arg === "object" && arg !== null;
  }

  public static isHashTable(
    arg: any,
  ): arg is Record<string | number | symbol, any> {
    return this.isObjectType(arg) && !Array.isArray(arg);
  }

  public static parseOrderedHashTableIterator(value: unknown) {
    if (value instanceof Map) {
      return value.entries();
    }
    if (value instanceof Set) {
      return value.values();
    }
  }

  public static nonImplementedError(value: unknown) {
    return new Error(
      `Not Implemented Error: Unhandled data type. The cache can only support JavaScript primitives, objects, maps, sets, and arrays`,
      { cause: value },
    );
  }

  public static serializationError(value: unknown) {
    return new Error(
      `Serialization Error: Failed to serialize a value in the cache. This error's cause contains the value`,
      { cause: value },
    );
  }

  public static deserializationError(value: unknown) {
    return new Error(
      `Deserialization Error: Failed to deserialize a value in the cache. This error's cause contains the value`,
      {
        cause: value,
      },
    );
  }
}
