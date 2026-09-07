import type { IInfiniteConduitPageOptions } from "../../../Conduits/InfiniteConduit/types";
import { InfiniteConduitPage } from "../../../Conduits/InfiniteConduit/InfiniteConduitPage";

import {
  type OnPrimitive,
  type PathKeyIndicator,
  TypeName,
  type IInterativeSerializer,
  type ConduitSerializedValue,
} from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export class InfiniteConduitPageSerializer extends AbstractSerializer<
  InfiniteConduitPage<any, any>,
  any[]
> {
  public readonly KEY_INDICATOR: PathKeyIndicator = `${AbstractSerializer.SERIALIZATION_MARKER}:ICP`;
  constructor(public readonly config: IInterativeSerializer) {
    super(TypeName.INFINITE_CONDUIT_VALUE);
  }

  public toPath(
    value: InfiniteConduitPage<any, any>,
    onValue: OnPrimitive,
  ): boolean {
    onValue(this.KEY_INDICATOR);
    this.config.traverse(value, onValue);
    return onValue(this.KEY_INDICATOR);
  }

  public matchPreserializationInput(input: unknown) {
    return input instanceof InfiniteConduitPage;
  }

  public deserialize(value: ConduitSerializedValue<any[]>) {
    if (!value.value) {
      this.sanitationError(value.value);
    }
    const config = this.config.deserialize(
      value.value,
    ) as IInfiniteConduitPageOptions<any>;
    if (
      typeof config.index !== "number" ||
      typeof config.infiniteCacheID !== "string"
    ) {
      this.sanitationError(config);
    }
    return new InfiniteConduitPage(config);
  }

  protected serializeValue(value: InfiniteConduitPage<any, any>) {
    return this.config.serialize(value);
  }
}
