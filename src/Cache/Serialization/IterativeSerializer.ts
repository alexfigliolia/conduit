import type { IInterativeSerializer } from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export abstract class IterativeSerializer<T, O> extends AbstractSerializer<
  T,
  O
> {
  constructor(public readonly config: IInterativeSerializer) {
    super(config.name);
  }
}
