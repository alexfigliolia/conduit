export const MapInit = [
  [1, 2],
  ["hello", "goodbye"],
  [{ complexType: true, nested: { complex: true } }, [2, 3, "asdf"]],
  [
    "nested map",
    new Map<any, any>([
      [1, 2],
      ["hello", "goodbye"],
      [{ complexType: true, nested: { complex: true } }, [2, 3, "asdf"]],
    ]),
  ],
];

export const MapInitSerialized = [
  [1, 2],
  ["hello", "goodbye"],
  [
    {
      complexType: true,
      nested: {
        complex: true,
      },
    },
    [2, 3, "asdf"],
  ],
  [
    "nested map",
    {
      ___CONDUIT___: "map",
      value: [
        [1, 2],
        ["hello", "goodbye"],
        [
          {
            complexType: true,
            nested: {
              complex: true,
            },
          },
          [2, 3, "asdf"],
        ],
      ],
    },
  ],
];

export const SetInit = [
  1,
  2,
  "hello",
  "goodbye",
  { complexType: true, nested: { complex: true } },
  [2, 3, "asdf"],
  new Set([1, 2, 3, 4]),
];

export const SetInitSerialized = [
  1,
  2,
  "hello",
  "goodbye",
  {
    complexType: true,
    nested: {
      complex: true,
    },
  },
  [2, 3, "asdf"],
  {
    ___CONDUIT___: "set",
    value: [1, 2, 3, 4],
  },
];
