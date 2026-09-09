import {
  TypeName,
  type OnPrimitive,
  type ConduitSerializedValue,
  type IInterativeSerializer,
} from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export class MapSerializer extends AbstractSerializer<
  Map<any, any>,
  [any, any][]
> {
  constructor(config: IInterativeSerializer) {
    super(TypeName.MAP, config);
  }

  public override toPath(value: Map<any, any>, onValue: OnPrimitive): boolean {
    onValue(this.KEY_INDICATOR);
    for (const entry of value) {
      if (!this.config.traverse(entry, onValue)) {
        return false;
      }
    }
    return onValue(this.KEY_INDICATOR);
  }

  public override matchPreserializationInput(input: unknown) {
    return input instanceof Map;
  }

  public override deserialize(value: ConduitSerializedValue<[any, any][]>) {
    if (!Array.isArray(value.value)) {
      this.sanitationError(value.value);
    }
    return new Map(this.config.deserialize(value.value ?? []));
  }

  protected override serializeValue(value: Map<any, any>) {
    return this.config.serialize(Array.from(value.entries()));
  }
}
