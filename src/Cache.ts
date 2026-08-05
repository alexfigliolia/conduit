import { Graph } from "./Graph";

export class Cache {
  private readonly storage = new Graph();
  constructor(initialState: Record<any, Graph> = {}) {
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

  public get<T>(args: any) {
    return this.storage.lookup(args) as Graph<T> | undefined;
  }

  public reset() {
    return this.storage.reset();
  }
}
