import { describe, expect, it } from "vitest";

import { InfiniteConduitValue } from "../Conduits/InfiniteConduit/InfiniteConduitValue";
import { InfiniteConduitValueSerializer } from "../Cache/Serialization/InfiniteConduitValueSerializer";
import {
  BigIntSerializer,
  DateSerializer,
  MapSerializer,
  RegExpSerializer,
  Serializer,
  SetSerializer,
  TypeName,
  UndefinedSerializer,
} from "../Cache/Serialization";
import { SERIALIZABLE_TEST_TYPES } from "../__fixtures__/types";
import {
  MapInit,
  MapInitSerialized,
  SetInit,
  SetInitSerialized,
} from "../__fixtures__/serialization";

describe("Serializer - a serializer JavaScript types that for some reason don't serialize to JSON natively", () => {
  describe("Serialization", () => {
    Serializer.INTERNAL_JSON_SERIALIZERS.forEach(serializer => {
      if (serializer instanceof MapSerializer) {
        return it(`It serializes Maps to special objects`, () => {
          const serialized = Serializer.serialize(new Map(MapInit as any));
          expect(serialized[Serializer.SERIALIZATION_MARKER]).toEqual(
            TypeName.MAP,
          );
          expect(serialized.value).toEqual(MapInitSerialized);
        });
      }
      if (serializer instanceof SetSerializer) {
        return it(`It serializes Sets to special objects`, () => {
          const serialized = Serializer.serialize(new Set(SetInit));
          expect(serialized[Serializer.SERIALIZATION_MARKER]).toEqual(
            TypeName.SET,
          );
          expect(serialized.value).toEqual(SetInitSerialized);
        });
      }
      if (serializer instanceof RegExpSerializer) {
        return it(`It serializes RegExps to special objects`, () => {
          const regexp = new RegExp(/test-pattern/gm);
          const serialized = Serializer.serialize(regexp);
          expect(serialized[Serializer.SERIALIZATION_MARKER]).toEqual(
            TypeName.REGEXP,
          );
          expect(serialized.value).toEqual(regexp.toString());
        });
      }
      if (serializer instanceof DateSerializer) {
        return it(`It serializes Date to special objects`, () => {
          const date = new Date();
          const ISO = date.toISOString();
          const serialized = Serializer.serialize(date);
          expect(serialized[Serializer.SERIALIZATION_MARKER]).toEqual(
            TypeName.DATE,
          );
          expect(serialized.value).toEqual(ISO);
        });
      }
      if (serializer instanceof UndefinedSerializer) {
        return it(`It serializes undefined to special objects`, () => {
          const serialized = Serializer.serialize(undefined);
          expect(serialized[Serializer.SERIALIZATION_MARKER]).toEqual(
            TypeName.UNDEFINED,
          );
          expect(serialized.value).toEqual("undefined");
        });
      }
      if (serializer instanceof BigIntSerializer) {
        return it(`It serializes BigInts to special objects`, () => {
          const bigInt = 123123123123123123123123123123n;
          const serialized = serializer.serialize(bigInt);
          expect(serialized[Serializer.SERIALIZATION_MARKER]).toEqual(
            TypeName.BIGINT,
          );
          expect(serialized.value).toEqual(bigInt.toString());
        });
      }
      if (serializer instanceof InfiniteConduitValueSerializer) {
        return it(`It serializes InfiniteCondiutValues to special objects`, () => {
          const infiniteValue = [1, 2, 3].map(page => ({
            data: page % 2 === 0,
            page,
          }));
          const serialized = serializer.serialize(
            new InfiniteConduitValue(infiniteValue),
          );
          expect(serialized[Serializer.SERIALIZATION_MARKER]).toEqual(
            TypeName.INFINITE_CONDUIT_VALUE,
          );
          expect(serialized.value).toEqual(Serializer.serialize(infiniteValue));
        });
      }
      throw new Error("Test not implemented");
    });

    it("Skips serializing all JSON compatible values", () => {
      SERIALIZABLE_TEST_TYPES.forEach(type => {
        expect(Serializer.serialize(type)).toEqual(type);
      });
    });
  });

  describe("Deserialization", () => {
    Serializer.INTERNAL_JSON_SERIALIZERS.forEach(serializer => {
      if (serializer instanceof MapSerializer) {
        return it(`It deserializes conduit Maps into JavaScript Maps`, () => {
          const sourceValue = new Map(MapInit as any);
          const serialized = Serializer.serialize(sourceValue);
          expect(Serializer.deserialize(serialized)).toEqual(sourceValue);
        });
      }
      if (serializer instanceof SetSerializer) {
        return it(`It deserializes conduit Sets into JavaScript Sets`, () => {
          const sourceValue = new Set(SetInit);
          const serialized = Serializer.serialize(sourceValue);
          expect(Serializer.deserialize(serialized)).toEqual(sourceValue);
        });
      }
      if (serializer instanceof RegExpSerializer) {
        return it(`It deserializes conduit RegExps into JavaScript RegExps`, () => {
          const sourceValue = new RegExp(/test-pattern(\d{4})/);
          const serialized = Serializer.serialize(sourceValue);
          expect(Serializer.deserialize(serialized)).toEqual(sourceValue);
        });
      }
      if (serializer instanceof DateSerializer) {
        return it(`It deserializes conduit Dates into JavaScript Dates`, () => {
          const sourceValue = new Date();
          const serialized = Serializer.serialize(sourceValue);
          expect(Serializer.deserialize(serialized)).toEqual(sourceValue);
        });
      }
      if (serializer instanceof UndefinedSerializer) {
        return it(`It deserializes conduit undefined values to JavaScript's undefined`, () => {
          const serialized = Serializer.serialize(undefined);
          expect(Serializer.deserialize(serialized)).toEqual(undefined);
        });
      }
      if (serializer instanceof BigIntSerializer) {
        return it(`It deserializes condiut BigInt values to JavaScript's BigInt`, () => {
          const bigInt = 123123123123123123123123123123n;
          const serialized = Serializer.serialize(bigInt);
          expect(Serializer.deserialize(serialized)).toEqual(bigInt);
        });
      }
      if (serializer instanceof InfiniteConduitValueSerializer) {
        return it(`It deserializes Infinite Condiut Values into InfiniteCondiutValue Instances`, () => {
          const input = new InfiniteConduitValue(
            [1, 2, 3].map(page => ({
              data: page % 2 === 0,
              page,
            })),
          );
          const serialized = Serializer.serialize(input);
          expect(Serializer.deserialize(serialized).value.getState()).toEqual(
            input.value.getState(),
          );
        });
      }
      throw new Error("Test not implemented");
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
        { [Serializer.SERIALIZATION_MARKER]: "icv", value: "asdf" },
        { [Serializer.SERIALIZATION_MARKER]: "icv", value: 3 },
        { [Serializer.SERIALIZATION_MARKER]: "icv", value: {} },
        { [Serializer.SERIALIZATION_MARKER]: "regexp", value: "asdf" },
        { [Serializer.SERIALIZATION_MARKER]: "regexp", value: "asdf/" },
        { [Serializer.SERIALIZATION_MARKER]: "regexp", value: 3 },
        { [Serializer.SERIALIZATION_MARKER]: "regexp", value: {} },
        { [Serializer.SERIALIZATION_MARKER]: "regexp", value: [] },
        { [Serializer.SERIALIZATION_MARKER]: "date", value: "asdf" },
        { [Serializer.SERIALIZATION_MARKER]: "date", value: "asdf/" },
        { [Serializer.SERIALIZATION_MARKER]: "date", value: 3 },
        { [Serializer.SERIALIZATION_MARKER]: "date", value: {} },
        { [Serializer.SERIALIZATION_MARKER]: "date", value: [] },
        {
          [Serializer.SERIALIZATION_MARKER]: "date",
          value: new Date().toString(),
        },
      ].forEach(entry => {
        expect(() => {
          Serializer.deserialize(entry);
        }).toThrow();
      });
    });
  });
});
