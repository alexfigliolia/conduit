import { Indexable } from "../Cache/Indexable";

import { StringifyCache } from "./StringifyCache";

export class OptimizedStringifyCache extends StringifyCache {
  protected override hash(args: any) {
    const result: any[] = [];
    Indexable.traverse(args, primitive => {
      result.push(primitive);
      return true;
    });
    return result.join(" || ");
  }
}
