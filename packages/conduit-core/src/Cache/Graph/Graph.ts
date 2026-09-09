import type { NonFunction, Setter } from "@figliolia/galena";

import { Serializer, type Primitive } from "../Serialization";

import {
  type IGraph,
  type IFromSerializedGraph,
  type EvictionCallback,
  type IGraphNodeFromSerializedValue,
  type UnknownCacheAbstract,
  type SerializedNode,
  type ParentPointer,
} from "./types";
import { NodeParent } from "./NodeParent";
import { CacheEntry } from "./CacheEntry";

export class Graph<T = any> {
  public readonly parent: ParentPointer;
  public nodes: Record<any, Graph> = {};
  public entry?: CacheEntry<T, Promise<void>>;
  private readonly evict: EvictionCallback<T, Promise<void>>;
  constructor({ onEvict, parent = null }: IGraph<T>) {
    this.parent = parent;
    this.evict = node => {
      onEvict(node);
      return this.treeTrim();
    };
  }

  public static from<T>({
    graph,
    onEvict,
    onCreate,
    parentPointer,
  }: IGraphNodeFromSerializedValue<T>) {
    const node = new Graph<T>({
      onEvict,
      parent: parentPointer,
    });
    if (graph.entry) {
      node.entry = CacheEntry.from({
        onCreate,
        entry: graph.entry,
        onEvict: node.evict,
      });
    }
    for (const key in graph.nodes) {
      const childNode = graph.nodes[key];
      if (childNode) {
        node.set(
          key,
          Graph.from({
            onEvict,
            onCreate,
            graph: childNode,
            parentPointer: new NodeParent(node, key),
          }),
        );
      }
    }
    return node;
  }

  public static fromSerialized({
    onEvict,
    onCreate,
    graph = {},
  }: IFromSerializedGraph) {
    const root = new Graph({ onEvict, parent: null });
    for (const key in graph) {
      if (graph[key]) {
        root.set(
          key,
          Graph.from({
            onEvict,
            onCreate,
            graph: graph[key],
            parentPointer: new NodeParent(root, key),
          }),
        );
      }
    }
    return root;
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
        next = new Graph({
          onEvict: this.evict,
          parent: new NodeParent(current, primative),
        });
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

  private async treeTrim() {
    this.entry = undefined;
    await Promise.resolve();
    if (await this.treeTrimDownwards(node => !node.entry)) {
      this.nodes = {};
      await this.treeTrimUpwards();
    }
  }

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
      result.entry = this.entry.serialize();
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
        value:
          // @ts-expect-error "typescript function discrimination bug"
          typeof defaultValue === "function" ? defaultValue() : defaultValue,
        onEvict: node.evict,
      });
      created = true;
    }
    return { node, created };
  }
}
