import { NodePathGenerator } from "../Cache/NodePathGenerator";

import { StringifyCache } from "./StringifyCache";

export class OptimizedStringifyCache extends StringifyCache {
  protected override hash(args: any) {
    const result: any[] = [];
    NodePathGenerator.traverse(args, primitive => {
      result.push(primitive);
      return true;
    });
    return result.join(" || ");
  }
}
