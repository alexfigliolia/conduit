import type { IInfiniteConduitPageOptions } from "../../../Conduits/InfiniteConduit/types";
import { InfiniteConduitPage } from "../../../Conduits/InfiniteConduit/InfiniteConduitPage";

import {
  type OnPrimitive,
  TypeName,
  type IInterativeSerializer,
  type ConduitSerializedValue,
} from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export class InfiniteConduitPageSerializer extends AbstractSerializer<
  InfiniteConduitPage<any, any>,
  IInfiniteConduitPageOptions<any>
> {
  constructor(config: IInterativeSerializer) {
    super(TypeName.INFINITE_CONDUIT_PAGE, config);
  }

  public override toPath(
    value: InfiniteConduitPage<any, any>,
    onPrimitive: OnPrimitive,
  ): boolean {
    onPrimitive(this.KEY_INDICATOR);
    this.config.traverse(value, onPrimitive);
    return onPrimitive(this.KEY_INDICATOR);
  }

  public override matchPreserializationInput(input: unknown) {
    return input instanceof InfiniteConduitPage;
  }

  public override deserialize(
    value: ConduitSerializedValue<IInfiniteConduitPageOptions<any>>,
  ) {
    if (!value.value) {
      this.sanitationError(value.value);
    }
    const config = this.config.deserialize(
      value.value,
    ) as IInfiniteConduitPageOptions<any>;
    if (
      typeof config.index !== "number" ||
      typeof config.pageID !== "string" ||
      typeof config.infiniteCacheID !== "string"
    ) {
      this.sanitationError(config);
    }
    return new InfiniteConduitPage(config);
  }

  protected override serializeValue(input: InfiniteConduitPage<any, any>) {
    return this.config.serialize(input.toJSON());
  }
}
