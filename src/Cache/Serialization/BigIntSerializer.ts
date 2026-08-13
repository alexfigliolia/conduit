import type { ConduitSerializedValue } from "./types";
import { TypeName } from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export class BigIntSerializer extends AbstractSerializer<bigint, string> {
  constructor() {
    super(TypeName.BIGINT);
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
