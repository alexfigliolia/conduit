import type { ThirdPartyTypeName } from "./types";
import { AbstractSerializer } from "./AbstractSerializer";

export abstract class ConduitSerializer<
  S extends string,
  T,
  O,
> extends AbstractSerializer<T, O> {
  constructor(typeName: ThirdPartyTypeName<S>) {
    super(typeName);
  }
}
