import {
  TypeName,
  type OnPrimitive,
  type PathKeyIndicator,
  type ConduitSerializedValue,
  type IInterativeSerializer,
} from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export class MapSerializer extends AbstractSerializer<
  Map<any, any>,
  [any, any][]
> {
  public readonly KEY_INDICATOR: PathKeyIndicator = `${AbstractSerializer.SERIALIZATION_MARKER}:Map`;
  constructor(public readonly config: IInterativeSerializer) {
    super(TypeName.MAP);
  }

  public toPath(value: Map<any, any>, onValue: OnPrimitive): boolean {
    onValue(this.KEY_INDICATOR);
    for (const entry of value) {
      if (!this.config.traverse(entry, onValue)) {
        return false;
      }
    }
    return onValue(this.KEY_INDICATOR);
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
