import { TypeChecker } from "./TypeChecker";

export class SerializedValues extends TypeChecker {
  public static readonly SERIALIZATION_MARKER = "___CONDUIT___";
  public static readonly SERIALIZED_TYPES = ["undefined", "bigint"];

  public static shouldDeserialize(value: any) {
    return this.isHashTable(value) && this.SERIALIZATION_MARKER in value;
  }

  public static shouldSerialize(value: any) {
    return this.SERIALIZED_TYPES.includes(typeof value);
  }

  public static deserialize(value: any) {
    const type = value[this.SERIALIZATION_MARKER] as string;
    switch (type) {
      case "undefined":
        return undefined;
      case "bigint":
        if (!("value" in value)) {
          this.nonImplementedError(value);
        }
        return BigInt(value.value);
    }
    this.nonImplementedError(value);
  }

  public static serialize(value: any) {
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
        this.nonImplementedError(value);
    }
  }
}
