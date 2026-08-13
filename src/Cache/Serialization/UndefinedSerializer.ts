import type { ConduitSerializedValue } from "./types";
import { TypeName } from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export class UndefinedSerializer extends AbstractSerializer<
  undefined,
  "undefined"
> {
  public static TYPE_OF = "undefined" as const;
  constructor() {
    super(TypeName.UNDEFINED);
  }

  public override matchPreserializationInput(
    input: unknown,
  ): input is undefined {
    return typeof input === UndefinedSerializer.TYPE_OF;
  }

  protected override serializeValue(_: undefined) {
    return UndefinedSerializer.TYPE_OF;
  }

  public override deserialize(_: ConduitSerializedValue<string>) {
    return undefined;
  }
}
