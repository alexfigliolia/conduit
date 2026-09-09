import type { Primitive } from "../Serialization";

import type { Graph } from "./Graph";

export class NodeParent {
  constructor(
    public readonly parent: Graph<any>,
    public readonly key: Primitive,
  ) {}
}
