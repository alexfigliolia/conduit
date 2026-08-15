import type {
  ConduitSerializedValue,
  OnPrimitive,
  PathKeyIndicator,
} from "./types";
import { TypeName } from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export class UndefinedSerializer extends AbstractSerializer<
  undefined,
  "undefined"
> {
  public static TYPE_OF = "undefined" as const;
  public readonly KEY_INDICATOR: PathKeyIndicator = `${AbstractSerializer.SERIALIZATION_MARKER}:Undefined`;
  constructor() {
    super(TypeName.UNDEFINED);
  }

  public toPath(_value: undefined, onValue: OnPrimitive) {
    onValue(this.KEY_INDICATOR);
    return onValue(UndefinedSerializer.TYPE_OF);
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
