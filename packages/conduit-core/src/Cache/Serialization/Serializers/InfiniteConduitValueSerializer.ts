import { InfiniteConduitValue } from "../../../Conduits/InfiniteConduit/InfiniteConduitValue";

import {
  type OnPrimitive,
  TypeName,
  type IInterativeSerializer,
  type ConduitSerializedValue,
  type SerializedInfiniteConduitValueType,
} from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export class InfiniteConduitValueSerializer extends AbstractSerializer<
  InfiniteConduitValue<any, any>,
  SerializedInfiniteConduitValueType<any>
> {
  constructor(config: IInterativeSerializer) {
    super(TypeName.INFINITE_CONDUIT_VALUE, config);
  }

  public override toPath(
    value: InfiniteConduitValue<any, any>,
    onPrimitive: OnPrimitive,
  ): boolean {
    onPrimitive(this.KEY_INDICATOR);
    this.config.traverse(value, onPrimitive);
    return onPrimitive(this.KEY_INDICATOR);
  }

  public override matchPreserializationInput(input: unknown) {
    return input instanceof InfiniteConduitValue;
  }

  public override deserialize(
    value: ConduitSerializedValue<SerializedInfiniteConduitValueType<any>>,
  ) {
    if (!Array.isArray(value.value) || value.value.length !== 2) {
      this.sanitationError(value.value);
    }
    const deserialized = this.config.deserialize(value.value);
    const [infiniteValue, infiniteCacheID] = deserialized;
    if (typeof infiniteCacheID !== "string" || !Array.isArray(infiniteValue)) {
      this.sanitationError(value.value);
    }
    return new InfiniteConduitValue({ infiniteCacheID, value: infiniteValue });
  }

  protected override serializeValue(input: InfiniteConduitValue<any, any>) {
    const { value, infiniteCacheID } = input;
    return this.config.serialize([value, infiniteCacheID]);
  }
}
