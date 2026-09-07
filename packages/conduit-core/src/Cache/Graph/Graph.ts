import type { NonFunction, Setter } from "@figliolia/galena";

import type { Primitive } from "../Serialization";
import { Serializer } from "../Serialization";

import {
  type UnknownCacheAbstract,
  type SerializedNode,
  type ParentPointer,
} from "./types";
import { NodeParent } from "./NodeParent";
import { CacheEntry } from "./CacheEntry";

export class Graph<T = any> {
  public nodes: Record<any, Graph> = {};
  public entry?: CacheEntry<T, Promise<void>>;
  constructor(
    private readonly cache: UnknownCacheAbstract,
    public parent: ParentPointer = null,
  ) {}

  public static from(
    cache: UnknownCacheAbstract,
    node: SerializedNode,
    parent: ParentPointer = null,
  ) {
    const graph = new Graph(cache, parent);
    if (node.entry) {
      graph.entry = CacheEntry.from(node.entry, graph.evict, cache);
    }
    for (const key in node.nodes) {
      const childNode = node.nodes[key];
      if (childNode) {
        graph.set(
          key,
          Graph.from(cache, childNode, new NodeParent(graph, key)),
        );
      }
    }
    return graph;
  }

  public static fromSerialized(
    serialized: Record<string, SerializedNode> = {},
    cache: UnknownCacheAbstract,
  ) {
    const graph = new Graph(cache);
    for (const key in serialized) {
      if (serialized[key]) {
        graph.set(
          key,
          Graph.from(cache, serialized[key], new NodeParent(graph, key)),
        );
      }
    }
    return graph;
  }

  public index<T extends NonFunction<any>>(
    key: any[],
    args: any[],
    value: T | (() => T),
  ) {
    const { node, created } = this.maybeIndex(key, args, value);
    if (created) {
      node.entry!.updatedAt = Date.now();
    } else {
      node.entry!.setValue(value as Setter<T>);
    }
    return node.entry!;
  }

  public createNodeIfNotExists<T>(key: any[], args: any[]) {
    let current = this as Graph;
    Serializer.toPath(key, args, primative => {
      let next = current.get(primative);
      if (!next) {
        next = new Graph(this.cache, new NodeParent(current, primative));
        current.set(primative, next);
      }
      current = next;
      return true;
    });
    return current as Graph<T>;
  }

  public createCacheEntryIfNotExists<T extends NonFunction<any>>(
    key: any[],
    args: any[],
    defaultValue: T | (() => T),
  ) {
    const { node } = this.maybeIndex(key, args, defaultValue);
    return node.entry!;
  }

  public lookup<T>(key: any[], args: any[]) {
    const node = this.find<T>(key, args);
    return node?.entry;
  }

  public get(key: Primitive) {
    return this.nodes[key as any];
  }

  public set(key: Primitive, node: Graph) {
    this.nodes[key as any] = node;
  }

  public readonly evict = async () => {
    this.entry = undefined;
    await Promise.resolve();
    if (await this.treeTrimDownwards(node => !node.entry)) {
      this.nodes = {};
      await this.treeTrimUpwards();
    }
  };

  public reset() {
    for (const key in this.nodes) {
      delete this.nodes[key];
    }
  }

  public serialize(cache: UnknownCacheAbstract) {
    const nodes = Object.keys(this.nodes).reduce<
      Record<string, SerializedNode>
    >((acc, next) => {
      if (this.nodes[next]) {
        acc[next] = this.nodes[next].serialize(cache);
      }
      return acc;
    }, {});
    const result: SerializedNode<T> = { nodes };
    if (this.entry) {
      result.entry = this.entry.toJSON();
    }
    return result;
  }

  private find<T>(key: any[], args: any[]) {
    let current = this as Graph;
    const found = Serializer.toPath(key, args, primative => {
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

  private async treeTrimDownwards(
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
          !this.treeTrimDownwards(onNode, nextDepth, nodes[key].nodes) ||
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
    let current = this as Graph | undefined;
    while (current) {
      if (!current.entry && Object.keys(current.nodes).length === 1) {
        current.nodes = {};
      }
      current = current?.parent?.parent;
      if (depth % 20 === 0) {
        await Promise.resolve();
      }
      depth++;
    }
  }

  public maybeIndex<T extends NonFunction<any>>(
    key: any[],
    args: any[],
    defaultValue: T | (() => T),
  ) {
    let created = false;
    const node = this.createNodeIfNotExists<T>(key, args);
    if (!node.entry) {
      node.entry = new CacheEntry<T, Promise<void>>({
        evict: node.evict,
        defaultValue: // @ts-expect-error typescript-bug
          typeof defaultValue === "function" ? defaultValue() : defaultValue,
      });
      created = true;
    }
    return { node, created };
  }
}
