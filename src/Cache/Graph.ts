import type { Setter } from "@figliolia/galena";

import {
  type Primitive,
  type SerializedNode,
  type ParentPointer,
} from "./types";
import { NodePathGenerator } from "./NodePathGenerator";
import { NodeParent } from "./NodeParent";
import { CacheEntry } from "./CacheEntry";

export class Graph<T = any> {
  public entry?: CacheEntry<T>;
  public nodes: Record<any, Graph> = {};
  constructor(public parent: ParentPointer = null) {}

  public static from(node: SerializedNode, parent: ParentPointer = null) {
    const graph = new Graph(parent);
    if (node.entry) {
      graph.entry = CacheEntry.from(node.entry, graph.evict);
    }
    for (const key in node.nodes) {
      const childNode = node.nodes[key];
      if (childNode) {
        graph.set(key, Graph.from(childNode, new NodeParent(graph, key)));
      }
    }
    return graph;
  }

  public static fromSerialized(
    serialized: Record<string, SerializedNode> = {},
  ) {
    const graph = new Graph();
    for (const key in serialized) {
      if (serialized[key]) {
        graph.set(key, Graph.from(serialized[key], new NodeParent(graph, key)));
      }
    }
    return graph;
  }

  public index<T>(key: any[], args: any[], value: T) {
    const { node, created } = this.maybeIndex(key, args, value);
    if (created) {
      node.entry!.updatedAt = Date.now();
    } else {
      node.entry!.writeValue(value as Setter<T>);
    }
    return node.entry!;
  }

  public createNodeIfNotExists<T>(key: any[], args: any[]) {
    let current = this as Graph;
    NodePathGenerator.toPath(key, args, primative => {
      let next = current.get(primative);
      if (!next) {
        next = new Graph(new NodeParent(current, primative));
        current.set(primative, next);
      }
      current = next;
      return true;
    });
    return current as Graph<T>;
  }

  public createCacheEntryIfNotExists<T>(
    key: any[],
    args: any[],
    defaultValue: T,
  ) {
    const { node } = this.maybeIndex(key, args, defaultValue);
    return node.entry!;
  }

  public lookup<T>(key: any[], args: any[]) {
    const node = this.find(key, args);
    return node?.entry as CacheEntry<T> | undefined;
  }

  public get(key: Primitive) {
    return this.nodes[key as any];
  }

  public set(key: Primitive, node: Graph) {
    this.nodes[key as any] = node;
  }

  public readonly evict = () => {
    this.entry = undefined;
    return Promise.resolve().then(async () => {
      if (await this.recurseDownward(node => !node.entry)) {
        this.nodes = {};
        await this.treeTrimUpwards();
      }
    });
  };

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

  private find<T>(key: any[], args: any[]) {
    let current = this as Graph;
    const found = NodePathGenerator.toPath(key, args, primative => {
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

  private async recurseDownward(
    onNode: (graph: Graph) => boolean,
    depth: number = 0,
    nodes: Record<any, Graph> = this.nodes,
  ) {
    for (const key in nodes) {
      if (nodes[key]) {
        const children = nodes[key].nodes;
        if (!Object.keys(children).length) {
          continue;
        }
        const nextDepth = depth + 1;
        if (nextDepth % 4 === 0) {
          await Promise.resolve();
        }
        if (
          !this.recurseDownward(onNode, nextDepth, nodes[key].nodes) ||
          !onNode(nodes[key])
        ) {
          return false;
        }
      }
    }
    return true;
  }

  private async treeTrimUpwards() {
    let depth = 0;
    let current = this as Graph | null;
    while (current?.parent) {
      if (!current.entry && Object.keys(current.nodes).length === 1) {
        current.nodes = {};
      }
      current = current.parent.parent;
      if (depth % 20 === 0) {
        await Promise.resolve();
      }
      depth++;
    }
  }

  public maybeIndex<T>(key: any[], args: any[], defaultValue: T) {
    let created = false;
    const node = this.createNodeIfNotExists<T>(key, args);
    if (!node.entry) {
      node.entry = new CacheEntry<T>({
        defaultValue,
        evict: node.evict,
      });
      created = true;
    }
    return { node, created };
  }
}
