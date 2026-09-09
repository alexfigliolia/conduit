import {
  TypeName,
  type OnPrimitive,
  type ConduitSerializedValue,
  type IInterativeSerializer,
} from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export class SetSerializer extends AbstractSerializer<Set<any>, any[]> {
  constructor(config: IInterativeSerializer) {
    super(TypeName.SET, config);
  }

  public override toPath(value: Set<any>, onValue: OnPrimitive): boolean {
    onValue(this.KEY_INDICATOR);
    for (const entry of value) {
      if (!this.config.traverse(entry, onValue)) {
        return false;
      }
    }
    return onValue(this.KEY_INDICATOR);
  }

  public override matchPreserializationInput(input: unknown) {
    return input instanceof Set;
  }

  public override deserialize(value: ConduitSerializedValue<any[]>) {
    if (!Array.isArray(value.value)) {
      this.sanitationError(value.value);
    }
    return new Set(this.config.deserialize(value.value ?? []));
  }

  protected override serializeValue(value: Set<any>) {
    return this.config.serialize(Array.from(value.values()));
  }
}
