import type { Primative } from "./types";
import { Indexable } from "./Indexable";

export class Graph<T = unknown> {
  public lastRead = 0;
  public updatedAt = 0;
  public readonly nodes: Record<any, Graph> = {};
  constructor(public value?: T) {}

  public static from<G extends Graph<any>>(node: G) {
    const graph = new Graph(Indexable.deserialize(node.value));
    graph.lastRead = node.lastRead;
    graph.updatedAt = node.updatedAt;
    for (const key in node.nodes) {
      const childNode = node.nodes[key as any];
      if (childNode) {
        graph.set(key, Graph.from(childNode));
      }
    }
    return graph;
  }

  public index(args: any, value: T) {
    let current = this as Graph;
    Indexable.traverse(args, primative => {
      const next = current.get(primative) ?? new Graph();
      current.set(primative, next);
      current = next;
      return true;
    });
    current.update(value);
  }

  public lookup(args: any) {
    let current = this as Graph;
    const found = Indexable.traverse(args, primative => {
      const next = current.get(primative);
      if (!next) {
        return false;
      }
      current = next;
      return true;
    });
    if (!found) {
      return;
    }
    current.lastRead = performance.now();
    return current;
  }

  public update(value: T) {
    this.value = value;
    this.updatedAt = performance.now();
  }

  public get(key: Primative) {
    return this.nodes[key as any];
  }

  public set(key: Primative, node: Graph) {
    this.nodes[key as any] = node;
  }

  public reset() {
    for (const key in this.nodes) {
      delete this.nodes[key];
    }
  }

  public serialize() {
    const nodes = Object.keys(this.nodes).reduce(
      (acc, next) => {
        if (this.nodes[next]) {
          acc[next] = this.nodes[next].serialize();
        }
        return acc;
      },
      {} as Record<string, Graph>,
    );
    const result = {
      nodes,
      lastRead: this.lastRead,
      updatedAt: this.updatedAt,
    };
    if (typeof this.value === "undefined") {
      return result as Graph;
    }
    return { ...result, value: Indexable.serialize(this.value) } as Graph;
  }
}
