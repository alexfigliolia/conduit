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

  public override toPath(value: any[], onPrimitive: OnPrimitive): boolean {
    onPrimitive(this.KEY_INDICATOR);
    for (const item of value) {
      if (!this.config.traverse(item, onPrimitive)) {
        return false;
      }
    }
    return onPrimitive(this.KEY_INDICATOR);
  }
}
