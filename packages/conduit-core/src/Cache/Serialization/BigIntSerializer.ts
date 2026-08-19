import type {
  ConduitSerializedValue,
  OnPrimitive,
  PathKeyIndicator,
} from "./types";
import { TypeName } from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export class BigIntSerializer extends AbstractSerializer<bigint, string> {
  public override KEY_INDICATOR: PathKeyIndicator = `${AbstractSerializer.SERIALIZATION_MARKER}:BigInt`;
  constructor() {
    super(TypeName.BIGINT);
  }

  public override toPath(value: bigint, onValue: OnPrimitive) {
    onValue(this.KEY_INDICATOR);
    return onValue(value.toString());
  }

  public override matchPreserializationInput(input: unknown): input is bigint {
    return typeof input === "bigint";
  }

  protected override serializeValue(value: bigint) {
    return value.toString();
  }

  public override deserialize(value: ConduitSerializedValue<string>) {
    if (typeof value.value !== "string" || !/^\d+$/.test(value.value)) {
      this.sanitationError(value.value);
    }
    return BigInt(value.value?.toString?.() ?? "0");
  }
}
