import type { IConduitNetworkResult } from "./types";

export class ConduitNetworkResult<T, E = unknown> {
  public readonly error?: E;
  public readonly data: T | null = null;
  constructor({ error, data = null }: IConduitNetworkResult<T, E>) {
    this.error = error;
    this.data = data ?? null;
  }

  public from(value: T | null | Mutator<T>) {
    if (typeof value === "function") {
      return ConduitNetworkResult.from((value as Mutator<T>)(this.data));
    }
    return ConduitNetworkResult.from(value);
  }

  public static from<T, E = unknown>(data: T | null = null) {
    return new ConduitNetworkResult<T, E>({ data });
  }

  public static fromError<T, E = unknown>(error: E) {
    return new ConduitNetworkResult<T, E>({ error });
  }
}

type Mutator<T> = (previous: T | null) => T | null;
