import type { Primitive } from "../Serialization";

import type { Graph } from "./Graph";

export class NodeParent {
  constructor(
    public readonly parent: Graph<unknown>,
    public readonly key: Primitive,
  ) {}
}
