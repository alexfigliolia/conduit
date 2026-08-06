import { type Primitive, type SerializedNode } from "./types";
import type { ParentPointer } from "./types";
import { NodePathGenerator } from "./NodePathGenerator";
import { NodeParent } from "./NodeParent";
import { CacheEntry } from "./CacheEntry";

export class Graph<T = any> {
  public entry?: CacheEntry<T>;
  public readonly nodes: Record<any, Graph> = {};
  constructor(public parent: ParentPointer = null) {}

  public static from(node: SerializedNode, parent: ParentPointer = null) {
    const graph = new Graph(parent);
    if (node.entry) {
      graph.entry = CacheEntry.from(node.entry);
    }
    for (const key in node.nodes) {
      const childNode = node.nodes[key];
      if (childNode) {
        graph.set(key, Graph.from(childNode, new NodeParent(graph, key)));
      }
    }
    return graph;
  }

  public index<T>(args: any, value: T) {
    const node = this.createNodeIfNotExists(args);
    if (!node.entry) {
      node.entry = new CacheEntry(value);
      node.entry.updatedAt = Date.now();
    } else {
      node.entry.write(value);
    }
    return node.entry as CacheEntry<T>;
  }

  public createNodeIfNotExists(key: any) {
    let current = this as Graph;
    NodePathGenerator.traverse(key, primative => {
      let next = current.get(primative);
      if (!next) {
        next = new Graph(new NodeParent(current, primative));
        current.set(primative, next);
      }
      current = next;
      return true;
    });
    return current;
  }

  public createCacheEntryIfNotExists<T>(key: any, defaultValue: T) {
    const node = this.createNodeIfNotExists(key);
    if (!node.entry) {
      node.entry = new CacheEntry(defaultValue);
    }
    return node.entry as CacheEntry<T>;
  }

  public lookup<T>(key: any) {
    const node = this.find(key);
    return node?.entry as CacheEntry<T> | undefined;
  }

  public evict(key: any) {
    const node = this.find(key);
    if (
      !node?.parent ||
      !((node.parent.key as any) in node.parent.parent.nodes)
    ) {
      return;
    }
    delete node.parent.parent.nodes[node.parent.key as any];
    return node;
  }

  public get(key: Primitive) {
    return this.nodes[key as any];
  }

  public set(key: Primitive, node: Graph) {
    this.nodes[key as any] = node;
  }

  public reset() {
    for (const key in this.nodes) {
      delete this.nodes[key];
    }
  }

  public serialize() {
    const nodes = Object.keys(this.nodes).reduce<
      Record<string, SerializedNode>
    >((acc, next) => {
      if (this.nodes[next]) {
        acc[next] = this.nodes[next].serialize();
      }
      return acc;
    }, {});
    const result: SerializedNode<T> = { nodes };
    if (this.entry) {
      result.entry = this.entry.serialize();
    }
    return result;
  }

  private find<T>(key: any) {
    let current = this as Graph;
    const found = NodePathGenerator.traverse(key, primative => {
      const next = current.get(primative);
      if (!next) {
        return false;
      }
      current = next;
      return true;
    });
    if (!found || !current.entry) {
      return;
    }
    return current as Graph<T>;
  }
}
