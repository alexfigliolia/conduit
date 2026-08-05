import { State } from "@figliolia/galena";
import type { NonFunction } from "@figliolia/galena";

import { ConduitStatus } from "./types";
import { type Primative, type SerializedNode } from "./types";
import { Indexable } from "./Indexable";

export class Graph<T = any> {
  public lastRead = 0;
  public updatedAt = 0;
  public State?: State<T>;
  public Status?: State<ConduitStatus>;
  public readonly nodes: Record<any, Graph> = {};

  public static from(node: SerializedNode) {
    const graph = new Graph();
    graph.lastRead = node.lastRead;
    graph.updatedAt = node.updatedAt;
    if (node.value !== undefined) {
      graph.setValue(Indexable.deserialize(node.value), false);
    }
    for (const key in node.nodes) {
      const childNode = node.nodes[key];
      if (childNode) {
        graph.set(key, Graph.from(childNode));
      }
    }
    return graph;
  }

  public index(args: any, value: T) {
    const node = this.createIfNotExists(args);
    node.setValue(value);
    return node;
  }

  public subscribeToValue(
    key: any,
    defaultValue: T,
    onChange: (value: T) => void,
  ) {
    const node = this.createIfNotExists(key);
    if (!node.State) {
      node.State = new State(defaultValue as NonFunction<T>);
    }
    return node.State.subscribe(onChange);
  }

  public subscribeToStatus(key: any, onChange: (value: ConduitStatus) => void) {
    const node = this.createIfNotExists(key);
    if (!node.Status) {
      node.Status = new State<ConduitStatus>(ConduitStatus.UNINITIALIZED);
    }
    return node.Status.subscribe(onChange);
  }

  public createIfNotExists(key: any) {
    let current = this as Graph;
    Indexable.traverse(key, primative => {
      const next = current.get(primative) ?? new Graph();
      current.set(primative, next);
      current = next;
      return true;
    });
    return current;
  }

  public lookup<T>(key: any) {
    let current = this as Graph;
    const found = Indexable.traverse(key, primative => {
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
    current.lastRead = Date.now();
    return current as Graph<T>;
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

  public setValue(value: T, mark = true) {
    let written = false;
    if (!this.State) {
      this.State = new State(value as NonFunction<T>);
      written = true;
    } else if (value !== this.State.getState()) {
      this.State.set(value as NonFunction<T>);
      written = true;
    }
    if (mark && written) {
      this.updatedAt = Date.now();
    }
  }

  public serialize(): SerializedNode {
    const nodes = Object.keys(this.nodes).reduce<
      Record<string, SerializedNode>
    >((acc, next) => {
      if (this.nodes[next]) {
        acc[next] = this.nodes[next].serialize();
      }
      return acc;
    }, {});
    const result = {
      nodes,
      lastRead: this.lastRead,
      updatedAt: this.updatedAt,
    } as SerializedNode;
    if (!this.State) {
      return result;
    }
    result.value = Indexable.serialize(this.State.getState());
    return result;
  }
}
