import type { ConduitSerializedValue } from "./types";
import { TypeName } from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export class RegExpSerializer extends AbstractSerializer<RegExp, string> {
  constructor() {
    super(TypeName.REGEXP);
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
