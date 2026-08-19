import type {
  ConduitSerializedValue,
  OnPrimitive,
  PathKeyIndicator,
} from "./types";
import { TypeName } from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export class RegExpSerializer extends AbstractSerializer<RegExp, string> {
  public readonly KEY_INDICATOR: PathKeyIndicator = `${AbstractSerializer.SERIALIZATION_MARKER}:RegExp`;
  constructor() {
    super(TypeName.REGEXP);
  }

  public override toPath(value: RegExp, onValue: OnPrimitive) {
    onValue(this.KEY_INDICATOR);
    return onValue(value.toString());
  }

  public override matchPreserializationInput(input: unknown): input is RegExp {
    return input instanceof RegExp;
  }

  protected override serializeValue(value: RegExp) {
    return value.toString();
  }

  public override deserialize(value: ConduitSerializedValue<string>) {
    const { value: input } = value;
    if (typeof input !== "string") {
      throw new Error(`Cannot reconstruct a regexp from ${typeof input}`, {
        cause: input,
      });
    }
    const match = input.match(/^\/((?:\\\/|[^/])+)\/([a-z]*)$/) ?? [];
    const [, pattern, flags] = match;
    if (!pattern) {
      throw new Error(`Cannot construct regex from falsy pattern ${pattern}`, {
        cause: pattern,
      });
    }
    const args: [string] | [string, string] = [pattern];
    if (flags) {
      args.push(flags);
    }
    return new RegExp(...args);
  }
}
