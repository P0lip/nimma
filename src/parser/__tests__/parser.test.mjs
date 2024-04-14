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
        value: '@.isbn',
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
        value: '@property === "@.schema"',
        deep: false,
      },
    ]);

    expect(parse('$[?(match(@.book[0].isbn, "123"))]')).to.deep.equal([
      {
        type: 'ScriptFilterExpression',
        value: 'match(@.book[0].isbn, "123")',
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
        value: '@.number > 20',
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
        value: '@@schema()',
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
        value: '@@schema()',
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
        value: ' @.abc ',
        deep: false,
      },
      {
        type: 'ScriptFilterExpression',
        value: '@@test( )',
        deep: true,
      },
    ]);
  });

  it('handles escapable', () => {
    expect(parse('$[?(@ ~= "^P\\\\.")]')).to.deep.equal([
      {
        type: 'ScriptFilterExpression',
        value: '@ ~= "^P\\."',
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
      expect(() => parse('$.name[0')).to.throw(
        'Expected "]" but end of input found at 8.',
      );
      expect(() => parse('$.store["[name]"')).to.throw(
        'Expected "]" but end of input found at 16.',
      );
    });
  });
});
