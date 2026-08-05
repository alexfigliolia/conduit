import type { SerializedNode } from "./types";
import { Graph } from "./Graph";

export class Cache {
  private readonly storage = new Graph();
  constructor(initialState: Record<string, SerializedNode> = {}) {
    for (const key in initialState) {
      if (initialState[key]) {
        this.storage.set(key, Graph.from(initialState[key]));
      }
    }
  }

  public serialize() {
    return this.storage.serialize().nodes;
  }

  public set<T>(args: any, value: T) {
    return this.storage.index(args, value);
  }

  public subscribeToValue<T>(
    key: any,
    defaultValue: T,
    onChange: (value: T) => void,
  ) {
    return this.storage.subscribeToValue(key, defaultValue, onChange);
  }

  public subscribeToStatus(
    ...args: Parameters<Cache["storage"]["subscribeToStatus"]>
  ) {
    return this.storage.subscribeToStatus(...args);
  }

  public get<T>(args: any) {
    return this.storage.lookup<T>(args);
  }

  public reset() {
    return this.storage.reset();
  }
}
