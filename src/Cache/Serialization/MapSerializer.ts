import {
  TypeName,
  type ConduitSerializedValue,
  type IInterativeSerializer,
} from "./types";
import { IterativeSerializer } from "./IterativeSerializer";

export class MapSerializer extends IterativeSerializer<
  Map<any, any>,
  [any, any][]
> {
  constructor(config: Omit<IInterativeSerializer, "name">) {
    super({ ...config, name: TypeName.MAP });
  }

  public matchPreserializationInput(input: unknown) {
    return input instanceof Map;
  }

  public deserialize(value: ConduitSerializedValue<[any, any]>) {
    if (!Array.isArray(value.value)) {
      this.sanitationError(value.value);
    }
    return new Map(this.config.deserialize(value.value ?? []));
  }

  protected serializeValue(value: Map<any, any>) {
    return this.config.serialize(Array.from(value.entries()));
  }
}
