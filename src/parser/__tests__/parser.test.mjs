import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import parse from '../index.mjs';

describe('Parser', () => {
  it('goessner samples', () => {
    assert.deepEqual(parse('$.store.book[foo,bar].author'), [
      {
        type: 'MemberExpression',
        value: 'store',
        deep: false,
      },
      {
        type: 'MemberExpression',
        value: 'book',
        deep: false,
      },
      {
        type: 'MultipleMemberExpression',
        value: ['foo', 'bar'],
        deep: false,
      },
      {
        type: 'MemberExpression',
        value: 'author',
        deep: false,
      },
    ]);

    assert.deepEqual(parse('$.store.book[*].author'), [
      {
        type: 'MemberExpression',
        value: 'store',
        deep: false,
      },
      {
        type: 'MemberExpression',
        value: 'book',
        deep: false,
      },
      {
        type: 'WildcardExpression',
        deep: false,
      },
      {
        type: 'MemberExpression',
        value: 'author',
        deep: false,
      },
    ]);
  });

  it('slice expressions', () => {
    assert.deepEqual(parse('$..book[:2]'), [
      {
        type: 'MemberExpression',
        value: 'book',
        deep: true,
      },
      {
        type: 'SliceExpression',
        value: [0, 2, 1],
        deep: false,
      },
    ]);
    assert.deepEqual(parse('$..book[0:2]'), [
      {
        type: 'MemberExpression',
        value: 'book',
        deep: true,
      },
      {
        type: 'SliceExpression',
        deep: false,
        value: [0, 2, 1],
      },
    ]);
    assert.deepEqual(parse('$..book[-1:]'), [
      {
        type: 'MemberExpression',
        value: 'book',
        deep: true,
      },
      {
        type: 'SliceExpression',
        value: [-1, Infinity, 1],
        deep: false,
      },
    ]);
  });

  it('extra', () => {
    assert.deepEqual(parse("$.test1.test2['test3.test4.test5']"), [
      {
        type: 'MemberExpression',
        value: 'test1',
        deep: false,
      },
      {
        type: 'MemberExpression',
        value: 'test2',
        deep: false,
      },
      {
        type: 'MemberExpression',
        value: 'test3.test4.test5',
        deep: false,
      },
    ]);

    assert.deepEqual(parse('$..book[(@.length-1)]'), [
      {
        type: 'MemberExpression',
        value: 'book',
        deep: true,
      },
      {
        type: 'SliceExpression',
        value: [-1, Infinity, 1],
        deep: false,
      },
    ]);

    assert.deepEqual(parse('$..book'), [
      {
        type: 'MemberExpression',
        value: 'book',
        deep: true,
      },
    ]);

    assert.deepEqual(parse('$.store["book"]'), [
      {
        type: 'MemberExpression',
        value: 'store',
        deep: false,
      },
      {
        type: 'MemberExpression',
        value: 'book',
        deep: false,
      },
    ]);

    assert.deepEqual(parse('$.books[0,1]'), [
      {
        type: 'MemberExpression',
        value: 'books',
        deep: false,
      },
      {
        type: 'MultipleMemberExpression',
        value: [0, 1],
        deep: false,
      },
    ]);

    assert.deepEqual(parse('$.books[?(@.isbn)]'), [
      {
        type: 'MemberExpression',
        value: 'books',
        deep: false,
      },
      {
        type: 'ScriptFilterExpression',
        raw: '(@.isbn)',
        value: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'Identifier',
            name: '@',
          },
          property: {
            type: 'Identifier',
            name: 'isbn',
          },
        },
        deep: false,
      },
    ]);

    assert.deepEqual(parse("$.'application/json'"), [
      {
        type: 'MemberExpression',
        value: 'application/json',
        deep: false,
      },
    ]);
  });

  it('modifiers', () => {
    assert.deepEqual(parse('$.info^~'), [
      {
        type: 'MemberExpression',
        value: 'info',
        deep: false,
      },
      {
        type: 'ParentExpression',
      },
      {
        type: 'KeyExpression',
      },
    ]);

    assert.deepEqual(parse('$.name^^'), [
      {
        type: 'MemberExpression',
        value: 'name',
        deep: false,
      },
      {
        type: 'ParentExpression',
      },
      {
        type: 'ParentExpression',
      },
    ]);
  });

  it('filter expressions', () => {
    assert.deepEqual(parse('$[(@.length-1)]'), [
      {
        type: 'SliceExpression',
        value: [-1, Infinity, 1],
        deep: false,
      },
    ]);
    assert.deepEqual(parse('$[( @.length - 2 )]'), [
      {
        type: 'SliceExpression',
        value: [-2, Infinity, 1],
        deep: false,
      },
    ]);
    assert.deepEqual(parse('$[( @[   "length" ] - 10 )]'), [
      {
        type: 'SliceExpression',
        value: [-10, Infinity, 1],
        deep: false,
      },
    ]);
    assert.deepEqual(parse('$[( @["length"] - 5 )]'), [
      {
        type: 'SliceExpression',
        value: [-5, Infinity, 1],
        deep: false,
      },
    ]);
  });

  it('script filter expressions', () => {
    assert.deepEqual(parse('$[?(@property === "@.schema")]'), [
      {
        type: 'ScriptFilterExpression',
        raw: '(@property === "@.schema")',
        value: {
          type: 'BinaryExpression',
          left: {
            type: 'Identifier',
            name: '@property',
          },
          operator: '===',
          right: {
            type: 'Literal',
            raw: '"@.schema"',
            value: '@.schema',
          },
        },
        deep: false,
      },
    ]);

    assert.deepEqual(parse('$[?(match(@.book[0].isbn, "123"))]'), [
      {
        type: 'ScriptFilterExpression',
        raw: '(match(@.book[0].isbn, "123"))',
        value: {
          type: 'CallExpression',
          arguments: [
            {
              type: 'MemberExpression',
              object: {
                type: 'MemberExpression',
                object: {
                  type: 'MemberExpression',
                  object: {
                    type: 'Identifier',
                    name: '@',
                  },
                  property: {
                    type: 'Identifier',
                    name: 'book',
                  },
                  computed: false,
                },
                property: {
                  type: 'Literal',
                  raw: '0',
                  value: 0,
                },
                computed: true,
              },
              computed: false,
              property: {
                type: 'Identifier',
                name: 'isbn',
              },
            },
            {
              type: 'Literal',
              raw: '"123"',
              value: '123',
            },
          ],
          callee: {
            type: 'Identifier',
            name: 'match',
          },
        },
        deep: false,
      },
    ]);

    assert.deepEqual(
      parse('$["книги"][?(match(@.название, "Мастер и Маргарита"))]'),
      [
        {
          deep: false,
          type: 'MemberExpression',
          value: 'книги',
        },
        {
          type: 'ScriptFilterExpression',
          raw: '(match(@.название, "Мастер и Маргарита"))',
          value: {
            type: 'CallExpression',
            arguments: [
              {
                type: 'MemberExpression',
                object: {
                  name: '@',
                  type: 'Identifier',
                },
                property: {
                  name: 'название',
                  type: 'Identifier',
                },
                computed: false,
              },
              {
                type: 'Literal',
                raw: '"Мастер и Маргарита"',
                value: 'Мастер и Маргарита',
              },
            ],
            callee: {
              type: 'Identifier',
              name: 'match',
            },
          },
          deep: false,
        },
      ],
    );

    assert.deepEqual(parse('$..address.street[?(@.number > 20)]'), [
      {
        type: 'MemberExpression',
        deep: true,
        value: 'address',
      },
      {
        type: 'MemberExpression',
        value: 'street',
        deep: false,
      },
      {
        type: 'ScriptFilterExpression',
        raw: '(@.number > 20)',
        value: {
          type: 'BinaryExpression',
          left: {
            type: 'MemberExpression',
            object: {
              type: 'Identifier',
              name: '@',
            },
            property: {
              type: 'Identifier',
              name: 'number',
            },
            computed: false,
          },
          operator: '>',
          right: {
            type: 'Literal',
            raw: '20',
            value: 20,
          },
        },
        deep: false,
      },
    ]);

    assert.deepEqual(parse('$[?(/^([45]XX)$|^2/i.test(@.value))]'), [
      {
        type: 'ScriptFilterExpression',
        raw: '(/^([45]XX)$|^2/i.test(@.value))',
        value: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            computed: false,
            object: {
              type: 'Literal',
              raw: '/^([45]XX)$|^2/i',
              value: /^([45]XX)$|^2/i,
            },
            property: {
              type: 'Identifier',
              name: 'test',
            },
          },
          arguments: [
            {
              type: 'MemberExpression',
              computed: false,
              object: {
                type: 'Identifier',
                name: '@',
              },
              property: {
                type: 'Identifier',
                name: 'value',
              },
            },
          ],
        },
        deep: false,
      },
    ]);
  });

  it('all parent', () => {
    // '$..', '$..^', '$..~'
    assert.deepEqual(parse('$..'), [
      {
        type: 'AllParentExpression',
      },
    ]);

    assert.deepEqual(parse('$..^'), [
      {
        type: 'AllParentExpression',
      },
      {
        type: 'ParentExpression',
      },
    ]);

    assert.deepEqual(parse('$..~'), [
      {
        type: 'AllParentExpression',
      },
      {
        type: 'KeyExpression',
      },
    ]);

    assert.deepEqual(parse('$..^^'), [
      {
        type: 'AllParentExpression',
      },
      {
        type: 'ParentExpression',
      },
      {
        type: 'ParentExpression',
      },
    ]);

    assert.deepEqual(parse('$..^^~'), [
      {
        type: 'AllParentExpression',
      },
      {
        type: 'ParentExpression',
      },
      {
        type: 'ParentExpression',
      },
      {
        type: 'KeyExpression',
      },
    ]);
  });

  for (const member of ['$$ref', '$ref', '0abc', 'bar-baz']) {
    it(`parses $..${member}`, () => {
      assert.deepEqual(parse(`$..${member}`), [
        {
          type: 'MemberExpression',
          value: member,
          deep: true,
        },
      ]);
    });
  }

  it.only('parses shorthand expressions', () => {
    assert.deepEqual(parse('$.components.schemas..@@schema(0)'), [
      {
        type: 'MemberExpression',
        value: 'components',
        deep: false,
      },
      {
        type: 'MemberExpression',
        value: 'schemas',
        deep: false,
      },
      {
        type: 'CustomShorthandExpression',
        value: 'schema',
        arguments: [0],
        deep: true,
      },
    ]);

    assert.deepEqual(parse('$.components.schemas.@@schema(2)'), [
      {
        type: 'MemberExpression',
        value: 'components',
        deep: false,
      },
      {
        type: 'MemberExpression',
        value: 'schemas',
        deep: false,
      },
      {
        type: 'CustomShorthandExpression',
        value: 'schema',
        arguments: [2],
        deep: false,
      },
    ]);
  });

  for (const expr of ['$.[enum]', '$.[?(@.enum)]', '$.foo.[bar,baz]']) {
    it(`given "${expr}", should should treat .[ as ..`, () => {
      assert.deepEqual(
        parse(expr),
        parse(expr.replace(/\.\?=(\[\?\()|{\.}1\[/g, '..')),
      );
    });
  }

  it('skips whitespaces', () => {
    assert.deepEqual(parse('$.[ name ] [?( @.abc )]\t ..@@test ( 5 )'), [
      {
        type: 'MemberExpression',
        value: 'name',
        deep: true,
      },
      {
        type: 'ScriptFilterExpression',
        raw: '( @.abc )',
        value: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'Identifier',
            name: '@',
          },
          property: {
            type: 'Identifier',
            name: 'abc',
          },
        },
        deep: false,
      },
      {
        type: 'CustomShorthandExpression',
        value: 'test',
        arguments: [5],
        deep: true,
      },
    ]);
  });

  it('handles escapable characters', () => {
    assert.deepEqual(parse('$[?(@ ~= "^P\\\\.")]'), [
      {
        type: 'ScriptFilterExpression',
        raw: '(@ ~= "^P\\\\.")',
        value: {
          type: 'BinaryExpression',
          left: {
            type: 'Identifier',
            name: '@',
          },
          operator: '~=',
          right: {
            type: 'Literal',
            raw: '"^P\\\\."',
            value: '^P\\.',
          },
        },
        deep: false,
      },
    ]);

    assert.deepEqual(parse(`$["'name\\"'","test\\\\",'"a']`), [
      {
        type: 'MultipleMemberExpression',
        value: ["'name\"'", 'test\\', '"a'],
        deep: false,
      },
    ]);

    assert.deepEqual(parse(`$["\\v\\ntest\\b"]`), [
      {
        deep: false,
        type: 'MemberExpression',
        value: '\v\ntest\b',
      },
    ]);

    assert.deepEqual(parse(`$["\\f\\r\\t"]`), [
      {
        deep: false,
        type: 'MemberExpression',
        value: '\f\r\t',
      },
    ]);
  });

  describe('invalid expressions', () => {
    it('empty expression or does not start with $', () => {
      assert.throws(
        () => parse(''),
        SyntaxError('Expected "$" but end of input found.'),
      );
      assert.throws(
        () => parse('a'),
        SyntaxError('Expected "$" but "a" found.'),
      );
      assert.throws(
        () => parse(' $'),
        SyntaxError('Expected "$" but " " found.'),
      );
    });

    it('invalid member expression', () => {
      assert.throws(
        () => parse('$info'),
        SyntaxError(
          'Expected ".", "..", "^", "~", or end of input but "i" found at 1.',
        ),
      );
      assert.throws(
        () => parse('$.'),
        SyntaxError('Expected valid name but end of input found at 2.'),
      );
    });

    it('key expression used in the wrong place', () => {
      assert.throws(
        () => parse('$.name~.a'),
        SyntaxError('Expected "^", "~", or end of input but "." found at 7.'),
      );
    });

    it('unclosed quotes', () => {
      assert.throws(
        () => parse('$.name["a]'),
        SyntaxError(`Expected """ but end of input found at 10.`),
      );
      assert.throws(
        () => parse('$.name["\']'),
        SyntaxError(`Expected """ but end of input found at 10.`),
      );
    });

    it('invalid step in slice expressions', () => {
      assert.throws(
        () => parse('$.name[::test]'),
        SyntaxError('Expected "-" or [0-9] but "t" found at 9.'),
      );
      assert.throws(
        () => parse('$.name[::-]'),
        SyntaxError('Expected [0-9] but "]" found at 10.'),
      );
    });

    it('invalid shorthands', () => {
      assert.throws(
        () => parse('$..@()'),
        SyntaxError('Expected [a-z] but "(" found at 4.'),
      );
      assert.throws(
        () => parse('$..@1()'),
        SyntaxError('Expected [a-z] but "1" found at 4.'),
      );
      assert.throws(
        () => parse('$..@@()'),
        SyntaxError('Expected [a-z] but "(" found at 5.'),
      );
      assert.throws(
        () => parse('$..@@1()'),
        SyntaxError('Expected [a-z] but "1" found at 5.'),
      );
      assert.throws(
        () => parse('$..@@test)'),
        SyntaxError('Expected "(" but ")" found at 9.'),
      );
      assert.throws(
        () => parse('$..@@test('),
        SyntaxError('Expected [0-9] but end of input found at 10.'),
      );
      assert.throws(
        () => parse('$..@@test(5'),
        SyntaxError('Expected ")" but end of input found at 11.'),
      );
      assert.throws(
        () => parse('$..@@test()'),
        SyntaxError('Expected [0-9] but ")" found at 10.'),
      );
      assert.throws(
        () => parse('$..@'),
        SyntaxError('Expected [a-z] but end of input found at 4.'),
      );
    });

    it('invalid filter expressions', () => {
      assert.throws(
        () => parse('$[('),
        SyntaxError('Expected "@" but end of input found at 3.'),
      );
      assert.throws(
        () => parse('$[(@'),
        SyntaxError('Expected "." or "[" but end of input found at 4.'),
      );
      assert.throws(
        () => parse('$[(@.len - 1)]'),
        SyntaxError('Expected "length" but "len - " found at 11.'),
      );
      assert.throws(
        () => parse('$[(@length - 1)]'),
        SyntaxError('Expected "." or "[" but "l" found at 4.'),
      );
      assert.throws(
        () => parse('$[(@[length]-2)]'),
        SyntaxError(`Expected """ or "'" at 5.`),
      );
      assert.throws(
        () => parse('$[(@.length + 1))'),
        SyntaxError('Expected "-" but "+" found at 12.'),
      );
      assert.throws(
        () => parse('$[(@.length - -5))'),
        SyntaxError('Expected positive number but "-5" found at 14.'),
      );
      assert.throws(
        () => parse('$[(@.length - 0))'),
        SyntaxError('Expected positive number but "0" found at 14.'),
      );
    });

    it('unclosed brackets', () => {
      assert.throws(
        () => parse('$.name['),
        SyntaxError('Unexpected end of input at 7.'),
      );
      assert.throws(
        () => parse('$.name[0'),
        SyntaxError('Expected "]" but end of input found at 8.'),
      );
      assert.throws(
        () => parse('$.store["[name]"'),
        SyntaxError('Expected "]" but end of input found at 16.'),
      );
    });

    describe('invalid script filter expressions', () => {
      it('unclosed parentheses', () => {
        assert.throws(
          () => parse('$[?(@.length - 1]'),
          SyntaxError('Expected ")" but "]" found at 16.'),
        );
        assert.throws(
          () => parse('$[?(@.length - 1))'),
          SyntaxError('Expected "]" but ")" found at 17.'),
        );

        // args
        assert.throws(
          () => parse('$[?(abc(1]'),
          SyntaxError('Expected ")" or "," but "]" found at 9.'),
        );
        assert.throws(
          () => parse('$[?(abc(a]'),
          SyntaxError('Expected ")" or "," but "]" found at 9.'),
        );
        assert.throws(
          () => parse('$[?(abc(1 / (2 + 2) ]'),
          SyntaxError('Expected ")" or "," but "]" found at 20.'),
        );

        // groups
        assert.throws(
          () => parse('$[?(1 / (2 + 2) ]'),
          SyntaxError('Expected ")" but "]" found at 16.'),
        );
      });

      it('unclosed brackets', () => {
        assert.throws(
          () => parse('$[?(@[length)]'),
          SyntaxError('Expected "]" but ")" found at 12.'),
        );
        assert.throws(
          () => parse('$[?(@.abc == [1)]'),
          SyntaxError('Expected "]" or "," but ")" found at 15.'),
        );
      });

      it('redundant comma in arguments', () => {
        assert.throws(
          () => parse('$[?(abc(2,))]'),
          SyntaxError('Expected ")" but "," found at 11.'),
        );
        assert.throws(
          () => parse('$[?(abc(2,,))]'),
          SyntaxError('Unexpected "," at 11.'),
        );
        assert.throws(
          () => parse('$[?(abc(,a))]'),
          SyntaxError('Unexpected "," at 9.'),
        );
        assert.throws(
          () => parse('$[?(abc(,))]'),
          SyntaxError('Unexpected "," at 9.'),
        );
      });

      it('missing argument in unary expression', () => {
        assert.throws(
          () => parse('$[?(@.value != -)]'),
          SyntaxError('Expected argument but ")" found at 16.'),
        );
        assert.throws(
          () => parse('$[?(@.value == +    )]'),
          SyntaxError('Expected argument but ")" found at 20.'),
        );
      });

      it('missing side in binary expression', () => {
        assert.throws(
          () => parse('$[?(@.value == 1 + )]'),
          SyntaxError('Expected expression after "+" at 19.'),
        );
        assert.throws(
          () => parse('$[?(@.value == 2 + 5 *    )]'),
          SyntaxError('Expected expression after "*" at 26.'),
        );
      });

      it('identifiers starting with a number', () => {
        assert.throws(
          () => parse('$[?(@.value == 1abc)]'),
          SyntaxError('Expected [0-9] or "." but "a" found at 16.'),
        );

        assert.throws(
          () => parse('$[?(@.value == .abc)]'),
          SyntaxError('Expected [0-9] but "a" found at 16.'),
        );
      });

      it('invalid numbers', () => {
        assert.throws(
          () => parse('$[?(@.value == 1.2.3)]'),
          SyntaxError('Unexpected "." at 18.'),
        );
        assert.throws(
          () => parse('$[?(@.value == .)]'),
          SyntaxError('Unexpected "." at 16.'),
        );
      });

      it('invalid identifiers', () => {
        assert.throws(
          () => parse('$[?(@.#value == 123)]'),
          SyntaxError('Expected a valid identifier char but "#" found at 6.'),
        );
      });
    });
  });
});
