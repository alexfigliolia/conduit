import {
  type IInterativeSerializer,
  TypeName,
  type OnPrimitive,
} from "./types";
import { AbstractPathSerializer } from "./AbstractPathSerializer";

export class ArraySerializer extends AbstractPathSerializer<any[]> {
  constructor(config: IInterativeSerializer) {
    super(TypeName.ARRAY, config);
  }

  public override toPath(value: any[], onValue: OnPrimitive): boolean {
    onValue(this.KEY_INDICATOR);
    for (const item of value) {
      if (!this.config.traverse(item, onValue)) {
        return false;
      }
    }
    return onValue(this.KEY_INDICATOR);
  }
}
