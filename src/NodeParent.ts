import type { Primative } from "./types";
import type { Graph } from "./Graph";

export class NodeParent {
  constructor(
    public readonly parent: Graph<unknown>,
    public readonly key: Primative,
  ) {}
}
