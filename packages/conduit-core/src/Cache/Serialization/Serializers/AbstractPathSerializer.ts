import type {
  IInterativeSerializer,
  OnPrimitive,
  PathKeyIndicator,
  TypeName,
} from "./types";

export abstract class AbstractPathSerializer<T> {
  private static readonly memo = new Set<TypeName & string>();
  public readonly KEY_INDICATOR: PathKeyIndicator;
  public static readonly SERIALIZATION_MARKER = "___CONDUIT___";
  constructor(
    public readonly typeName: TypeName & string,
    public readonly config: IInterativeSerializer,
  ) {
    if (AbstractPathSerializer.memo.has(typeName)) {
      throw new Error(
        `Serialization Error: A serializer with the typeName "${typeName}" already exists. Please choose a different name for the serializer "${this.constructor.name}"`,
      );
    }
    AbstractPathSerializer.memo.add(typeName);
    this.KEY_INDICATOR = AbstractPathSerializer.toSerializationMarker(typeName);
  }

  public abstract toPath(value: T, onValue: OnPrimitive): boolean;

  public static toSerializationMarker(
    marker: TypeName & string,
  ): PathKeyIndicator {
    return `${this.SERIALIZATION_MARKER}:${marker}`;
  }
}
