export const PRIMITIVES = [
  null,
  undefined,
  "test",
  123,
  BigInt("123123123123"),
];
export const NON_PRIMITIVES = [
  PRIMITIVES.reduce(
    (acc, next) => {
      acc[next as any] = PRIMITIVES;
      return acc;
    },
    {} as Record<any, any>,
  ),
  PRIMITIVES,
];
export const TEST_TYPES = [...PRIMITIVES, ...NON_PRIMITIVES];
