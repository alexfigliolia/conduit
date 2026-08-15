import {
  TypeName,
  type OnPrimitive,
  type PathKeyIndicator,
  type ConduitSerializedValue,
  type IInterativeSerializer,
} from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export class SetSerializer extends AbstractSerializer<Set<any>, any[]> {
  public readonly KEY_INDICATOR: PathKeyIndicator = `${AbstractSerializer.SERIALIZATION_MARKER}:Set`;
  constructor(public readonly config: IInterativeSerializer) {
    super(TypeName.SET);
  }

  public toPath(value: Set<any>, onValue: OnPrimitive): boolean {
    onValue(this.KEY_INDICATOR);
    for (const entry of value) {
      if (!this.config.traverse(entry, onValue)) {
        return false;
      }
    }
    return onValue(this.KEY_INDICATOR);
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
