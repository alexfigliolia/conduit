export const PRIMITIVES = [
  null,
  undefined,
  "test",
  123,
  BigInt("123123123123"),
];

export const SERIALIZABLE_PRIMITIVES = [...PRIMITIVES].filter(
  v => !["bigint", "undefined"].includes(typeof v),
);

export const NON_PRIMITIVES = [
  ...buildObjectTypes(PRIMITIVES),
  new Set(PRIMITIVES),
  new Map(PRIMITIVES.map(item => [item, item])),
  /test-pattern(\d{4})/,
  new Date(),
];
export const SERIALIZABLE_NON_PRIMITIVES = buildObjectTypes(
  SERIALIZABLE_PRIMITIVES,
);

export const TEST_TYPES = [...PRIMITIVES, ...NON_PRIMITIVES];
export const SERIALIZABLE_TEST_TYPES = [
  ...SERIALIZABLE_PRIMITIVES,
  ...SERIALIZABLE_NON_PRIMITIVES,
];

function buildObjectTypes(args: any[]) {
  return [
    args.reduce(
      (acc, next) => {
        acc[next as any] = args;
        return acc;
      },
      {} as Record<any, any>,
    ),
    args,
  ];
}
