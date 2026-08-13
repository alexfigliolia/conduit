import {
  TypeName,
  type ConduitSerializedValue,
  type IInterativeSerializer,
} from "./types";
import { IterativeSerializer } from "./IterativeSerializer";

export class SetSerializer extends IterativeSerializer<Set<any>, any[]> {
  constructor(config: Omit<IInterativeSerializer, "name">) {
    super({ ...config, name: TypeName.SET });
  }

  public matchPreserializationInput(input: unknown) {
    return input instanceof Set;
  }

  public deserialize(value: ConduitSerializedValue<[any, any]>) {
    if (!Array.isArray(value.value)) {
      this.sanitationError(value.value);
    }
    return new Set(this.config.deserialize(value.value ?? []));
  }

  protected serializeValue(value: Set<any>) {
    return this.config.serialize(Array.from(value.values()));
  }
}
