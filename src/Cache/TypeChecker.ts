export class TypeChecker {
  public static readonly NON_SERIALIZEABLE_OBJECTS = [
    Map,
    Set,
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

  public static nonImplementedError(value: unknown) {
    throw new Error(
      `Not Implemented Error: unhandled data type ${value as any}. The cache can only support JavaScript primitives, objects, and arrays`,
    );
  }
}
