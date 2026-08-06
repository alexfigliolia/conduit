import { TypeChecker } from "./TypeChecker";
import { SerializedValues } from "./SerializedValues";

export class Serializer extends TypeChecker {
  public static serialize(value: unknown): any {
    if (SerializedValues.shouldSerialize(value)) {
      return SerializedValues.serialize(value);
    }
    if (!this.isObjectType(value)) {
      return value;
    }
    if (this.isHashTable(value)) {
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
    this.nonImplementedError(value);
  }

  public static deserialize(value: unknown): any {
    if (!this.isObjectType(value)) {
      return value;
    }
    if (this.isHashTable(value)) {
      if (SerializedValues.shouldDeserialize(value)) {
        return SerializedValues.deserialize(value);
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
    this.nonImplementedError(value);
  }
}
