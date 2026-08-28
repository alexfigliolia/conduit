export class Protected<T> {
  constructor(private value: T) {}

  public get() {
    return this.value;
  }

  public set(value: T) {
    this.value = value;
  }

  public valueOf() {
    return this.value;
  }

  public toJSON() {
    return this.value;
  }
}
