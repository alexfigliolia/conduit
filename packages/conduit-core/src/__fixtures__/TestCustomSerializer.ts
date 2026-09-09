import type {
  ConduitSerializedValue,
  IInterativeSerializer,
  OnPrimitive,
} from "../Cache/Serialization";
import { AbstractSerializer } from "../Cache";

export function CreateCustomSerializer(
  typeName: string = "Test Custom Serializer",
) {
  return class TestCustomSerializer extends AbstractSerializer<
    TestCustomSerializedStructure,
    ReturnType<TestCustomSerializedStructure["read"]>
  > {
    constructor(config: IInterativeSerializer) {
      super(typeName, config);
    }
    public toPath(
      value: TestCustomSerializedStructure,
      onPrimitive: OnPrimitive,
    ) {
      onPrimitive(this.KEY_INDICATOR);
      const iterable = value.read();
      for (const item of iterable) {
        if (!this.config.traverse(item, onPrimitive)) {
          return false;
        }
      }
      return onPrimitive(this.KEY_INDICATOR);
    }

    public matchPreserializationInput(input: unknown) {
      return input instanceof TestCustomSerializedStructure;
    }

    public deserialize(
      value: ConduitSerializedValue<
        ReturnType<TestCustomSerializedStructure["read"]>
      >,
    ) {
      if (!Array.isArray(value.value) || value.value.length !== 2) {
        this.sanitationError(value.value);
      }
      return new TestCustomSerializedStructure(
        ...(this.config.deserialize(value.value) as ConstructorParameters<
          typeof TestCustomSerializedStructure
        >),
      );
    }

    protected serializeValue(value: TestCustomSerializedStructure) {
      return this.config.serialize(value.read());
    }
  };
}

export class TestCustomSerializedStructure {
  private readonly property: number;
  private readonly nestedProperty: Record<string, any>;
  constructor(
    property: number = 3,
    nestedProperty: Record<string, any> = {
      nested: { nested: [true, true, { nested: true }] },
    },
  ) {
    this.property = property;
    this.nestedProperty = nestedProperty;
  }

  public read() {
    return [this.property, this.nestedProperty] as const;
  }
}
