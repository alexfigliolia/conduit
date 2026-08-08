export class ConduitNetworkResult<T, E> {
  public readonly error?: E;
  public readonly data: T | null = null;
  constructor({ error, data }: { error?: E; data: T }) {
    this.error = error;
    this.data = data;
  }

  public static fromError<E>(error: E) {
    return new ConduitNetworkResult({ error, data: null });
  }

  public static fromResponse<T>(data: T) {
    return new ConduitNetworkResult({ data });
  }
}
