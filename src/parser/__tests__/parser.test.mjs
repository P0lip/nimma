import { expect } from 'chai';
import forEach from 'mocha-each';

import parse from '../index.mjs';

describe('Parser', () => {
  it('goessner samples', () => {
    expect(parse('$.store.book[foo,bar].author')).to.deep.equal([
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

    expect(parse('$.store.book[*].author')).to.deep.equal([
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
    expect(parse('$..book[:2]')).to.deep.equal([
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
    expect(parse('$..book[0:2]')).to.deep.equal([
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
    expect(parse('$..book[-1:]')).to.deep.equal([
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
    expect(parse("$.test1.test2['test3.test4.test5']")).to.deep.equal([
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

    expect(parse('$..book[(@.length-1)]')).to.deep.equal([
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

    expect(parse('$..book')).to.deep.equal([
      {
        type: 'MemberExpression',
        value: 'book',
        deep: true,
      },
    ]);

    expect(parse('$.store["book"]')).to.deep.equal([
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
    expect(parse('$.books[0,1]')).to.deep.equal([
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

    expect(parse('$.books[?(@.isbn)]')).to.deep.equal([
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
  });

  it('modifiers', () => {
    expect(parse('$.info^~')).to.deep.equal([
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

    expect(parse('$.name^^')).to.deep.equal([
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
    expect(parse('$[(@.length-1)]')).to.deep.equal([
      {
        type: 'SliceExpression',
        value: [-1, Infinity, 1],
        deep: false,
      },
    ]);
    expect(parse('$[( @.length - 2 )]')).to.deep.equal([
      {
        type: 'SliceExpression',
        value: [-2, Infinity, 1],
        deep: false,
      },
    ]);
    expect(parse('$[( @[   "length" ] - 10 )]')).to.deep.equal([
      {
        type: 'SliceExpression',
        value: [-10, Infinity, 1],
        deep: false,
      },
    ]);
    expect(parse('$[( @["length"] - 5 )]')).to.deep.equal([
      {
        type: 'SliceExpression',
        value: [-5, Infinity, 1],
        deep: false,
      },
    ]);
  });

  it('script filter expressions', () => {
    expect(parse('$[?(@property === "@.schema")]')).to.deep.equal([
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

    expect(parse('$[?(match(@.book[0].isbn, "123"))]')).to.deep.equal([
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

    expect(
      parse('$["книги"][?(match(@.название, "Мастер и Маргарита"))]'),
    ).to.deep.equal([
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
    ]);

    expect(parse('$..address.street[?(@.number > 20)]')).to.deep.equal([
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

    expect(parse('$[?(match(@.test, "^((4|5)XX)$|^2"))]')).to.deep.equal([
      {
        type: 'ScriptFilterExpression',
        raw: '(match(@.test, "^((4|5)XX)$|^2"))',
        value: {
          type: 'CallExpression',
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
                name: 'test',
              },
            },
            {
              type: 'Literal',
              raw: '"^((4|5)XX)$|^2"',
              value: '^((4|5)XX)$|^2',
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
  });

  it('all parent', () => {
    // '$..', '$..^', '$..~'
    expect(parse('$..')).to.deep.equal([
      {
        type: 'AllParentExpression',
      },
    ]);

    expect(parse('$..^')).to.deep.equal([
      {
        type: 'AllParentExpression',
      },
      {
        type: 'ParentExpression',
      },
    ]);

    expect(parse('$..~')).to.deep.equal([
      {
        type: 'AllParentExpression',
      },
      {
        type: 'KeyExpression',
      },
    ]);

    expect(parse('$..^^')).to.deep.equal([
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

    expect(parse('$..^^~')).to.deep.equal([
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

  forEach(['$$ref', '$ref', '0abc', 'bar-baz']).it('%s', member => {
    expect(parse(`$..${member}`)).to.deep.equal([
      {
        type: 'MemberExpression',
        value: member,
        deep: true,
      },
    ]);
  });

  it('parses @@', () => {
    expect(parse('$.components.schemas..@@schema()')).to.deep.equal([
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
        type: 'ScriptFilterExpression',
        raw: '@@schema()',
        value: {
          type: 'CallExpression',
          arguments: [],
          callee: {
            name: '@@schema',
            type: 'Identifier',
          },
        },
        deep: true,
      },
    ]);

    expect(parse('$.components.schemas.@@schema()')).to.deep.equal([
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
        type: 'ScriptFilterExpression',
        raw: '@@schema()',
        value: {
          type: 'CallExpression',
          arguments: [],
          callee: {
            name: '@@schema',
            type: 'Identifier',
          },
        },
        deep: false,
      },
    ]);
  });

  forEach(['$.[enum]', '$.[?(@.enum)]', '$.foo.[bar,baz]']).it(
    'given %s, should should treat .[ as ..',
    expr => {
      expect(parse(expr)).to.deep.equal(
        parse(expr.replace(/\.\?=(\[\?\()|{\.}1\[/g, '..')),
      );
    },
  );

  it('skips whitespaces', () => {
    expect(parse('$.[ name ] [?( @.abc )]\t ..@@test( )')).to.deep.equal([
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
        type: 'ScriptFilterExpression',
        raw: '@@test( )',
        value: {
          type: 'CallExpression',
          arguments: [],
          callee: {
            type: 'Identifier',
            name: '@@test',
          },
        },
        deep: true,
      },
    ]);
  });

  it('handles escapable characters', () => {
    expect(parse('$[?(@ ~= "^P\\\\.")]')).to.deep.equal([
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

    expect(parse(`$["'name\\"'","test\\\\",'"a']`)).to.deep.equal([
      {
        type: 'MultipleMemberExpression',
        value: ["'name\"'", 'test\\', '"a'],
        deep: false,
      },
    ]);

    expect(parse(`$["\\v\\ntest\\b"]`)).to.deep.equal([
      {
        deep: false,
        type: 'MemberExpression',
        value: '\v\ntest\b',
      },
    ]);

    expect(parse(`$["\\f\\r\\t"]`)).to.deep.equal([
      {
        deep: false,
        type: 'MemberExpression',
        value: '\f\r\t',
      },
    ]);
  });

  describe('invalid expressions', () => {
    it('empty expression or does not start with $', () => {
      expect(() => parse('')).to.throw('Expected "$" but end of input found.');
      expect(() => parse('a')).to.throw('Expected "$" but "a" found.');
      expect(() => parse(' $')).to.throw('Expected "$" but " " found.');
    });

    it('invalid member expression', () => {
      expect(() => parse('$info')).to.throw(
        'Expected ".", "..", "^", "~", or end of input but "i" found at 1.',
      );
      expect(() => parse('$.')).to.throw(
        'Expected valid name but end of input found at 2.',
      );
    });

    it('key expression used in the wrong place', () => {
      expect(() => parse('$.name~.a')).to.throw(
        'Expected "^", "~", or end of input but "." found at 7.',
      );
    });

    it('unclosed quotes', () => {
      expect(() => parse('$.name["a]')).to.throw(
        `Expected """ but end of input found at 10.`,
      );
      expect(() => parse('$.name["\']')).to.throw(
        `Expected """ but end of input found at 10.`,
      );
    });

    it('invalid step in slice expressions', () => {
      expect(() => parse('$.name[::test]')).to.throw(
        'Expected "-" or [0-9] but "t" found at 9.',
      );
      expect(() => parse('$.name[::-]')).to.throw(
        'Expected [0-9] but "]" found at 10.',
      );
    });

    it('invalid shorthands', () => {
      expect(() => parse('$..@@()')).to.throw(
        'Expected [a-z] but "(" found at 5.',
      );
      expect(() => parse('$..@@test)')).to.throw(
        'Expected "(" but ")" found at 9.',
      );
      expect(() => parse('$..@@test(')).to.throw(
        'Expected ")" but end of input found at 10.',
      );
      expect(() => parse('$..@')).to.throw(
        'Expected [a-z] but end of input found at 4.',
      );
    });

    it('invalid filter expressions', () => {
      expect(() => parse('$[(')).to.throw(
        'Expected "@" but end of input found at 3.',
      );
      expect(() => parse('$[(@')).to.throw(
        'Expected "." or "[" but end of input found at 4.',
      );
      expect(() => parse('$[(@.len - 1)]')).to.throw(
        'Expected "length" but "len - " found at 11.',
      );
      expect(() => parse('$[(@length - 1)]')).to.throw(
        'Expected "." or "[" but "l" found at 4.',
      );
      expect(() => parse('$[(@[length]-2)]')).to.throw(
        `Expected """ or "'" at 5.`,
      );
      expect(() => parse('$[(@.length + 1))')).to.throw(
        'Expected "-" but "+" found at 12.',
      );
      expect(() => parse('$[(@.length - -5))')).to.throw(
        'Expected positive number but "-5" found at 14.',
      );
      expect(() => parse('$[(@.length - 0))')).to.throw(
        'Expected positive number but "0" found at 14.',
      );
    });

    it('unclosed brackets', () => {
      expect(() => parse('$.name[')).to.throw('Unexpected end of input at 7.');
      expect(() => parse('$.name[0')).to.throw(
        'Expected "]" but end of input found at 8.',
      );
      expect(() => parse('$.store["[name]"')).to.throw(
        'Expected "]" but end of input found at 16.',
      );
    });

    describe('invalid script filter expressions', () => {
      it('unclosed parentheses', () => {
        expect(() => parse('$[?(@.length - 1]')).to.throw(
          'Expected ")" but "]" found at 16.',
        );
        expect(() => parse('$[?(@.length - 1))')).to.throw(
          'Expected "]" but ")" found at 17.',
        );

        // args
        expect(() => parse('$[?(abc(1]')).to.throw(
          'Expected ")" or "," but "]" found at 9.',
        );
        expect(() => parse('$[?(abc(a]')).to.throw(
          'Expected ")" or "," but "]" found at 9.',
        );
        expect(() => parse('$[?(abc(1 / (2 + 2) ]')).to.throw(
          'Expected ")" or "," but "]" found at 20.',
        );

        // groups
        expect(() => parse('$[?(1 / (2 + 2) ]')).to.throw(
          'Expected ")" but "]" found at 16.',
        );
      });

      it('unclosed brackets', () => {
        expect(() => parse('$[?(@[length)]')).to.throw(
          'Expected "]" but ")" found at 12.',
        );
        expect(() => parse('$[?(@.abc == [1)]')).to.throw(
          'Expected "]" or "," but ")" found at 15.',
        );
      });

      it('redundant comma in arguments', () => {
        expect(() => parse('$[?(abc(2,))]')).to.throw(
          'Expected ")" but "," found at 11.',
        );
        expect(() => parse('$[?(abc(2,,))]')).to.throw('Unexpected "," at 11.');
        expect(() => parse('$[?(abc(,a))]')).to.throw('Unexpected "," at 9.');
        expect(() => parse('$[?(abc(,))]')).to.throw('Unexpected "," at 9.');
      });

      it('missing argument in unary expression', () => {
        expect(() => parse('$[?(@.value != -)]')).to.throw(
          'Expected argument but ")" found at 16.',
        );
        expect(() => parse('$[?(@.value == +    )]')).to.throw(
          'Expected argument but ")" found at 20.',
        );
      });

      it('missing side in binary expression', () => {
        expect(() => parse('$[?(@.value == 1 + )]')).to.throw(
          'Expected expression after "+" at 19.',
        );
        expect(() => parse('$[?(@.value == 2 + 5 *    )]')).to.throw(
          'Expected expression after "*" at 26.',
        );
      });

      it('identifiers starting with a number', () => {
        expect(() => parse('$[?(@.value == 1abc)]')).to.throw(
          'Expected [0-9] or "." but "a" found at 16.',
        );

        expect(() => parse('$[?(@.value == .abc)]')).to.throw();
      });

      it('invalid numbers', () => {
        expect(() => parse('$[?(@.value == 1.2.3)]')).to.throw(
          'Unexpected "." at 18.',
        );
        expect(() => parse('$[?(@.value == .)]')).to.throw(
          'Unexpected "." at 16.',
        );
      });

      it('invalid identifiers', () => {
        expect(() => parse('$[?(@.#value == 123)]')).to.throw(
          'Expected a valid identifier char but "#" found at 6.',
        );
      });
    });
  });
});
