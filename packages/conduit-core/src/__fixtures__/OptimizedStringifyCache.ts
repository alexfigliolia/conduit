import { Serializer } from "../Cache/Serialization";

import { StringifyCache } from "./StringifyCache";

export class OptimizedStringifyCache extends StringifyCache {
  protected override hash(key: any[], args: any[]) {
    const result: any[] = [];
    Serializer.toPath(key, args, primitive => {
      result.push(primitive);
      return true;
    });
    return result.join(" || ");
  }
}
