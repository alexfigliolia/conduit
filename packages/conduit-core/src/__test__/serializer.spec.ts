import { describe, expect, it } from "vitest";

import { InfiniteConduitValue } from "../Conduits/InfiniteConduit/InfiniteConduitValue";
import { InfiniteConduitPage } from "../Conduits";
import type { SerializedInfiniteConduitValueType } from "../Cache/Serialization/Serializers";
import {
  AbstractPathSerializer,
  BigIntSerializer,
  DateSerializer,
  InfiniteConduitPageSerializer,
  InfiniteConduitValueSerializer,
  MapSerializer,
  RegExpSerializer,
  SetSerializer,
  TypeName,
  UndefinedSerializer,
} from "../Cache/Serialization/Serializers";
import { Serializer } from "../Cache/Serialization";
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
          expect(
            serialized[AbstractPathSerializer.SERIALIZATION_MARKER],
          ).toEqual(TypeName.MAP);
          expect(serialized.value).toEqual(MapInitSerialized);
        });
      }
      if (serializer instanceof SetSerializer) {
        return it(`It serializes Sets to special objects`, () => {
          const serialized = Serializer.serialize(new Set(SetInit));
          expect(
            serialized[AbstractPathSerializer.SERIALIZATION_MARKER],
          ).toEqual(TypeName.SET);
          expect(serialized.value).toEqual(SetInitSerialized);
        });
      }
      if (serializer instanceof RegExpSerializer) {
        return it(`It serializes RegExps to special objects`, () => {
          const regexp = new RegExp(/test-pattern/gm);
          const serialized = Serializer.serialize(regexp);
          expect(
            serialized[AbstractPathSerializer.SERIALIZATION_MARKER],
          ).toEqual(TypeName.REGEXP);
          expect(serialized.value).toEqual(regexp.toString());
        });
      }
      if (serializer instanceof DateSerializer) {
        return it(`It serializes Date to special objects`, () => {
          const date = new Date();
          const ISO = date.toISOString();
          const serialized = Serializer.serialize(date);
          expect(
            serialized[AbstractPathSerializer.SERIALIZATION_MARKER],
          ).toEqual(TypeName.DATE);
          expect(serialized.value).toEqual(ISO);
        });
      }
      if (serializer instanceof UndefinedSerializer) {
        return it(`It serializes undefined to special objects`, () => {
          const serialized = Serializer.serialize(undefined);
          expect(
            serialized[AbstractPathSerializer.SERIALIZATION_MARKER],
          ).toEqual(TypeName.UNDEFINED);
          expect(serialized.value).toEqual("undefined");
        });
      }
      if (serializer instanceof BigIntSerializer) {
        return it(`It serializes BigInts to special objects`, () => {
          const bigInt = 123123123123123123123123123123n;
          const serialized = serializer.serialize(bigInt);
          expect(
            serialized[AbstractPathSerializer.SERIALIZATION_MARKER],
          ).toEqual(TypeName.BIGINT);
          expect(serialized.value).toEqual(bigInt.toString());
        });
      }
      if (serializer instanceof InfiniteConduitValueSerializer) {
        return it(`It serializes InfiniteCondiutValues to special objects`, () => {
          const pages = [1, 2, 3].map(
            (page, index) =>
              new InfiniteConduitPage({
                index,
                infiniteCacheID: "10",
                pageID: index.toString(),
                value: page % 2 === 0,
              }),
          );
          const infiniteValue = new InfiniteConduitValue({
            infiniteCacheID: "10",
            value: pages,
          });
          const serialized = serializer.serialize(infiniteValue);
          expect(
            serialized[AbstractPathSerializer.SERIALIZATION_MARKER],
          ).toEqual(TypeName.INFINITE_CONDUIT_VALUE);
          const [value, id] =
            serialized.value as SerializedInfiniteConduitValueType<any>;
          expect(id).toEqual("10");
          expect(value).toHaveLength(3);
          value.forEach((serializedPage, i) => {
            expect(serializedPage).toEqual(Serializer.serialize(pages[i]));
          });
        });
      }
      if (serializer instanceof InfiniteConduitPageSerializer) {
        return it(`It serializes InfiniteCondiutPages to special objects`, () => {
          const page = new InfiniteConduitPage({
            index: 0,
            infiniteCacheID: "10",
            pageID: "0",
            value: true,
          });
          const serialized = serializer.serialize(page);
          expect(
            serialized[AbstractPathSerializer.SERIALIZATION_MARKER],
          ).toEqual(TypeName.INFINITE_CONDUIT_PAGE);
          expect(serialized.value).toEqual(page.toJSON());
        });
      }
      throw new Error("Test not implemented", { cause: serializer });
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
          const infiniteValue = [1, 2, 3].map(
            (page, index) =>
              new InfiniteConduitPage({
                index,
                infiniteCacheID: "10",
                pageID: index.toString(),
                value: page % 2 === 0,
              }),
          );
          const serialized = Serializer.serialize(infiniteValue);
          expect(Serializer.deserialize(serialized)).toEqual(infiniteValue);
        });
      }
      if (serializer instanceof InfiniteConduitPageSerializer) {
        return it(`It deserializes Infinite Condiut Pages into InfiniteCondiutPage Instances`, () => {
          const page = new InfiniteConduitPage({
            index: 0,
            infiniteCacheID: "10",
            pageID: "0",
            value: true,
          });
          const serialized = serializer.serialize(page);
          expect(serializer.deserialize(serialized)).toEqual(page);
        });
      }
      throw new Error("Test not implemented", { cause: serializer });
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
        { [AbstractPathSerializer.SERIALIZATION_MARKER]: "random" },
        { [AbstractPathSerializer.SERIALIZATION_MARKER]: "map", value: 3 },
        { [AbstractPathSerializer.SERIALIZATION_MARKER]: "map", value: {} },
        { [AbstractPathSerializer.SERIALIZATION_MARKER]: "map", value: "" },
        { [AbstractPathSerializer.SERIALIZATION_MARKER]: "set", value: 3 },
        { [AbstractPathSerializer.SERIALIZATION_MARKER]: "set", value: {} },
        { [AbstractPathSerializer.SERIALIZATION_MARKER]: "set", value: "" },
        { [AbstractPathSerializer.SERIALIZATION_MARKER]: "bigint", value: 3 },
        { [AbstractPathSerializer.SERIALIZATION_MARKER]: "bigint", value: {} },
        { [AbstractPathSerializer.SERIALIZATION_MARKER]: "bigint", value: [] },
        { [AbstractPathSerializer.SERIALIZATION_MARKER]: "icv", value: "asdf" },
        { [AbstractPathSerializer.SERIALIZATION_MARKER]: "icv", value: 3 },
        { [AbstractPathSerializer.SERIALIZATION_MARKER]: "icv", value: {} },
        {
          [AbstractPathSerializer.SERIALIZATION_MARKER]: "regexp",
          value: "asdf",
        },
        {
          [AbstractPathSerializer.SERIALIZATION_MARKER]: "regexp",
          value: "asdf/",
        },
        { [AbstractPathSerializer.SERIALIZATION_MARKER]: "regexp", value: 3 },
        { [AbstractPathSerializer.SERIALIZATION_MARKER]: "regexp", value: {} },
        { [AbstractPathSerializer.SERIALIZATION_MARKER]: "regexp", value: [] },
        {
          [AbstractPathSerializer.SERIALIZATION_MARKER]: "date",
          value: "asdf",
        },
        {
          [AbstractPathSerializer.SERIALIZATION_MARKER]: "date",
          value: "asdf/",
        },
        { [AbstractPathSerializer.SERIALIZATION_MARKER]: "date", value: 3 },
        { [AbstractPathSerializer.SERIALIZATION_MARKER]: "date", value: {} },
        { [AbstractPathSerializer.SERIALIZATION_MARKER]: "date", value: [] },
        {
          [AbstractPathSerializer.SERIALIZATION_MARKER]: "date",
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
