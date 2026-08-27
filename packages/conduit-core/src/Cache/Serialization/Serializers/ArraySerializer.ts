import {
  type TokenTraversalFn,
  type OnPrimitive,
  type PathKeyIndicator,
} from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export class ArraySerializer {
  public readonly KEY_INDICATOR: PathKeyIndicator = `${AbstractSerializer.SERIALIZATION_MARKER}:[]`;
  constructor(public readonly traverse: TokenTraversalFn) {}

  public toPath(value: any[], onValue: OnPrimitive): boolean {
    onValue(this.KEY_INDICATOR);
    for (const item of value) {
      if (!onValue(item)) {
        return false;
      }
    }
    return onValue(this.KEY_INDICATOR);
  }
}
