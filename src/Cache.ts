import { State } from "@figliolia/galena";
import { EventEmitter } from "@figliolia/event-emitter";

import type { IKey } from "./types";
import { Base } from "./Base";

export class Cache {
  public readonly values: Record<string, State<any>>;
  private readonly Emitter = new EventEmitter<{ change: any }>();
  private readonly internalSubscriptions = new Map<string, () => void>();
  constructor(public readonly initialState: Record<string, any> = {}) {
    this.values = Object.keys(initialState).reduce(
      (acc, next) => {
        acc[next] = new State(initialState[next]);
        this.subscribeInternal(next, acc[next]);
        return acc;
      },
      {} as Record<string, State<any>>,
    );
  }

  public getValues() {
    return Object.keys(this.values).reduce(
      (acc, next) => {
        acc[next] = this.values[next].getState();
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  public get<T = unknown>(key: IKey) {
    return this.getEntry(key)?.getState?.() as T;
  }

  public getEntry<T>(key: IKey): State<T> | undefined {
    const entryKey = Base.toKey(key);
    if (!this.values[entryKey]) {
      console.warn(`Attempted to query an uninitialized key: "${entryKey}"`);
    }
    return this.values[entryKey];
  }

  public evict(key: IKey) {
    const entryKey = Base.toKey(key);
    // TODO - handle evicting paginated keys
    delete this.values[entryKey];
    const subscriber = this.internalSubscriptions.get(entryKey);
    subscriber?.();
    this.internalSubscriptions.delete(entryKey);
  }

  public subscribeTo<T>(key: IKey, onChange: (value: T) => void) {
    const entry = this.getEntry<T>(key);
    if (!entry) {
      throw new Error(
        `Attempted to subscribe to an uninitialized key: "${Base.toKey(key)}"`,
      );
    }
    return entry.subscribe(onChange);
  }

  public subscribe<T>(onChange: (values: T) => void) {
    const ID = this.Emitter.on("change", onChange);
    return () => {
      this.Emitter.off("change", ID);
    };
  }

  public initialize<T>(key: string, value: T | undefined) {
    if (!(key in this.values)) {
      // @ts-expect-error "Undefined incompatibility with NonFunction<T>"
      this.values[key] = new State(value);
      this.subscribeInternal(key);
      return this.observeChange(value);
    }
    if (value !== this.values[key].getState()) {
      this.values[key].set(value);
    }
  }

  public reset() {
    for (const key in this.values) {
      this.values[key].set(this.initialState[key]);
    }
  }

  private readonly observeChange = <T>(_value: T) => {
    if (this.internalSubscriptions.size) {
      this.Emitter.emit("change", this.getValues());
    }
  };

  private subscribeInternal(key: string, State = this.values[key]) {
    if (!State) {
      throw new Error(
        `Internal Error: Attempted to subscribe to an uninitialized key: "${key}"`,
      );
    }
    this.internalSubscriptions.set(key, State.subscribe(this.observeChange));
  }
}
