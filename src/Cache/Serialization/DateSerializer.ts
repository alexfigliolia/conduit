import type { ConduitSerializedValue } from "./types";
import { TypeName } from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export class DateSerializer extends AbstractSerializer<Date, string> {
  constructor() {
    super(TypeName.DATE);
  }

  public override matchPreserializationInput(input: unknown): input is Date {
    return input instanceof Date;
  }

  protected override serializeValue(value: Date) {
    return value.toISOString();
  }

  public override deserialize(value: ConduitSerializedValue<string>) {
    if (
      typeof value.value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{1,9}Z$/.test(value.value)
    ) {
      this.sanitationError(value.value);
    }
    return new Date(value?.value ?? "");
  }
}
