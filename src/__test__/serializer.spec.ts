import { describe, expect, it } from "vitest";

import { Serializer } from "../Cache/Serializer";
import { SERIALIZABLE_TEST_TYPES } from "../__fixtures__/types";
import {
  MapInit,
  MapInitSerialized,
  SetInit,
  SetInitSerialized,
} from "../__fixtures__/serialization";

describe("Serializer - a serializer JavaScript types that for some reason don't serialize themselves to JSON compatible objects", () => {
  describe("Serialization", () => {
    Serializer.SERIALIZED_CONSTRUCTORS.forEach(T => {
      switch (T) {
        case Map: {
          return it(`It serializes Maps to special objects`, () => {
            const serialized = Serializer.serialize(new Map(MapInit as any));
            expect(serialized[Serializer.SERIALIZATION_MARKER]).toEqual("map");
            expect(serialized.value).toEqual(MapInitSerialized);
          });
        }
        case Set: {
          return it(`It serializes Sets to special objects`, () => {
            const serialized = Serializer.serialize(new Set(SetInit));
            expect(serialized[Serializer.SERIALIZATION_MARKER]).toEqual("set");
            expect(serialized.value).toEqual(SetInitSerialized);
          });
        }
        default:
          throw new Error("Test not implemented");
      }
    });

    Serializer.SERIALIZED_TYPES.forEach(type => {
      switch (type) {
        case "bigint": {
          return it(`It serializes BigInts to special objects`, () => {
            const bigInt = 123123123123123123123123123123n;
            const serialized = Serializer.serialize(bigInt);
            expect(serialized[Serializer.SERIALIZATION_MARKER]).toEqual(
              "bigint",
            );
            expect(serialized.value).toEqual(bigInt.toString());
          });
        }
        case "undefined": {
          return it(`It serializes undefined to special objects`, () => {
            const serialized = Serializer.serialize(undefined);
            expect(serialized[Serializer.SERIALIZATION_MARKER]).toEqual(
              "undefined",
            );
            expect(serialized).not.toHaveProperty("value");
          });
        }
        default:
          throw new Error("Test not implemented");
      }
    });

    it("Skips serializing all JSON compatible values", () => {
      SERIALIZABLE_TEST_TYPES.forEach(type => {
        expect(Serializer.serialize(type)).toEqual(type);
      });
    });
  });

  describe("Deserialization", () => {
    Serializer.SERIALIZED_CONSTRUCTORS.forEach(T => {
      switch (T) {
        case Map: {
          return it(`It deserializes conduit Maps into JavaScript Maps`, () => {
            const sourceValue = new Map(MapInit as any);
            const serialized = Serializer.serialize(sourceValue);
            expect(Serializer.deserialize(serialized)).toEqual(sourceValue);
          });
        }
        case Set: {
          return it(`It deserializes conduit Sets into JavaScript Sets`, () => {
            const sourceValue = new Set(SetInit);
            const serialized = Serializer.serialize(sourceValue);
            expect(Serializer.deserialize(serialized)).toEqual(sourceValue);
          });
        }
        default:
          throw new Error("Test not implemented");
      }
    });

    Serializer.SERIALIZED_TYPES.forEach(type => {
      switch (type) {
        case "bigint": {
          return it(`It deserializes BigInts to special objects`, () => {
            const bigInt = 123123123123123123123123123123n;
            const serialized = Serializer.serialize(bigInt);
            expect(Serializer.deserialize(serialized)).toEqual(bigInt);
          });
        }
        case "undefined": {
          return it(`It deserializes undefined to special objects`, () => {
            const serialized = Serializer.serialize(undefined);
            expect(Serializer.deserialize(serialized)).toEqual(undefined);
          });
        }
        default:
          throw new Error("Test not implemented");
      }
    });

    it("Skips deserializing all JSON compatible values", () => {
      SERIALIZABLE_TEST_TYPES.forEach(type => {
        expect(Serializer.deserialize(Serializer.serialize(type))).toEqual(
          type,
        );
      });
    });

    it("Corrupted conduit objects throw", () => {
      [
        { [Serializer.SERIALIZATION_MARKER]: "random" },
        { [Serializer.SERIALIZATION_MARKER]: "map", value: 3 },
        { [Serializer.SERIALIZATION_MARKER]: "map", value: {} },
        { [Serializer.SERIALIZATION_MARKER]: "map", value: "" },
        { [Serializer.SERIALIZATION_MARKER]: "set", value: 3 },
        { [Serializer.SERIALIZATION_MARKER]: "set", value: {} },
        { [Serializer.SERIALIZATION_MARKER]: "set", value: "" },
        { [Serializer.SERIALIZATION_MARKER]: "bigint", value: 3 },
        { [Serializer.SERIALIZATION_MARKER]: "bigint", value: {} },
        { [Serializer.SERIALIZATION_MARKER]: "bigint", value: [] },
      ].forEach(entry => {
        expect(() => {
          const thing = Serializer.deserialize(entry);
        }).toThrow();
      });
    });
  });
});
