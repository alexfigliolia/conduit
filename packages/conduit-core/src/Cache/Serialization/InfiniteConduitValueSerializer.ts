import { InfiniteConduitValue } from "../../Conduits/InfiniteConduit/InfiniteConduitValue";

import {
  type OnPrimitive,
  type PathKeyIndicator,
  TypeName,
  type IInterativeSerializer,
  type ConduitSerializedValue,
} from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export class InfiniteConduitValueSerializer extends AbstractSerializer<
  InfiniteConduitValue<any>,
  any[]
> {
  public readonly KEY_INDICATOR: PathKeyIndicator = `${AbstractSerializer.SERIALIZATION_MARKER}:ICV`;
  constructor(public readonly config: IInterativeSerializer) {
    super(TypeName.INFINITE_CONDUIT_VALUE);
  }

  public toPath(
    value: InfiniteConduitValue<any>,
    onValue: OnPrimitive,
  ): boolean {
    onValue(this.KEY_INDICATOR);
    const pages = value.value.getState();
    for (const entry of pages) {
      if (!this.config.traverse(entry, onValue)) {
        return false;
      }
    }
    return onValue(this.KEY_INDICATOR);
  }

  public matchPreserializationInput(input: unknown) {
    return input instanceof InfiniteConduitValue;
  }

  public deserialize(value: ConduitSerializedValue<any[]>) {
    if (!Array.isArray(value.value)) {
      this.sanitationError(value.value);
    }
    return new InfiniteConduitValue(this.config.deserialize(value.value ?? []));
  }

  protected serializeValue(value: InfiniteConduitValue<any>) {
    return this.config.serialize(Array.from(value.value.getState()));
  }
}
