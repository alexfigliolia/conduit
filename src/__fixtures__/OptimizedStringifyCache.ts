import { NodePathGenerator } from "../Cache/TriePaths";

import { StringifyCache } from "./StringifyCache";

export class OptimizedStringifyCache extends StringifyCache {
  protected override hash(key: any[], args: any[]) {
    const result: any[] = [];
    NodePathGenerator.toPath(key, args, primitive => {
      result.push(primitive);
      return true;
    });
    return result.join(" || ");
  }
}
