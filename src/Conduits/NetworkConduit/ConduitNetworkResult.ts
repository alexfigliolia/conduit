export class ConduitNetworkResult<T, E = unknown> {
  public readonly error?: E;
  public readonly data: T | null = null;
  constructor({ error, data = null }: { error?: E; data?: T | null }) {
    this.data = data;
    this.error = error;
  }

  public static fromError<E = unknown>(error: E) {
    return new ConduitNetworkResult({ error });
  }

  public static fromResponse<T>(data: T) {
    return new ConduitNetworkResult({ data });
  }
}
