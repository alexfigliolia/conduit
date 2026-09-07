import { InfiniteConduitValue } from "../../../Conduits/InfiniteConduit/InfiniteConduitValue";

import {
  type OnPrimitive,
  type PathKeyIndicator,
  TypeName,
  type IInterativeSerializer,
  type ConduitSerializedValue,
} from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export class InfiniteConduitValueSerializer extends AbstractSerializer<
  InfiniteConduitValue<any, any>,
  any[]
> {
  public readonly KEY_INDICATOR: PathKeyIndicator = `${AbstractSerializer.SERIALIZATION_MARKER}:ICV`;
  constructor(public readonly config: IInterativeSerializer) {
    super(TypeName.INFINITE_CONDUIT_VALUE);
  }

  public toPath(
    value: InfiniteConduitValue<any, any>,
    onValue: OnPrimitive,
  ): boolean {
    onValue(this.KEY_INDICATOR);
    this.config.traverse(value, onValue);
    return onValue(this.KEY_INDICATOR);
  }

  public matchPreserializationInput(input: unknown) {
    return input instanceof InfiniteConduitValue;
  }

  public deserialize(value: ConduitSerializedValue<any[]>) {
    if (!value.value) {
      this.sanitationError(value.value);
    }
    const config = this.config.deserialize(value.value);
    if (typeof config.infiniteCacheID !== "string") {
      this.sanitationError(config);
    }
    return new InfiniteConduitValue(config);
  }

  protected serializeValue(value: InfiniteConduitValue<any, any>) {
    return this.config.serialize(value);
  }
}
