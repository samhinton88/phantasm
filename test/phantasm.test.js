const phantasm = require("..");

const toGhost = (
  {
    foo: { bar, baz },
    "..": {
      bim: [boo],
    },
  },
  {
    blow: [
      {
        bum: [bobbies, [booties]],
      },
    ],
  }
) => {
  // code for the function
};

describe("phantasm", () => {
  it("should handle simple params", () => {
    expect(
      phantasm(({ foo }) => {
        // blah blah code blah blah
      })
    ).toEqual({ 0: { foo: null }, length: 1 });
  });

  it("should handle array destructuring in params", () => {
    expect(
      phantasm(({ foo }, [bar, baz]) => {
        // blah blah code blah blah
      })
    ).toEqual({ 0: { foo: null }, 1: { 0: null, 1: null }, length: 2 });

    expect(
      phantasm(([bar, baz], { foo }) => {
        // blah blah code blah blah
      })
    ).toEqual({ 0: { 0: null, 1: null }, 1: { foo: null }, length: 2 });
  });

  it("should sniff out a schema from a function with complex params", () => {
    const memo = phantasm(toGhost);
    expect(memo).toEqual({
      0: {
        // <- argument 1
        foo: {
          bar: null,
          baz: null,
        },
        "..": {
          bim: {
            0: null,
          },
        },
      },
      1: {
        // <- argument 2
        blow: {
          0: {
            bum: {
              0: null,
              1: {
                0: null,
              },
            },
          },
        },
      },
      length: 2,
    });
  });
});
