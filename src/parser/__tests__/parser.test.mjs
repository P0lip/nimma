import { expect } from 'chai';
import forEach from 'mocha-each';

import { parse } from '../parser.mjs';

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

  describe('invalid expressions', () => {
    it('empty expression or does not start with $', () => {
      expect(() => parse('')).to.throw('Expected "$" but end of input found.');
      expect(() => parse('a')).to.throw('Expected "$" but "a" found.');
      expect(() => parse(' $')).to.throw('Expected "$" but " " found.');
    });

    it('invalid member expression', () => {
      expect(() => parse('$info')).to.throw(
        'Expected ".", "..", "^", "~", or end of input but "i" found.',
      );
      expect(() => parse('$.')).to.throw(
        'Expected "*", "@", "[", [$_\\-], [0-9], or [A-Za-z] but end of input found.',
      );
    });

    it('key expression used in the wrong place', () => {
      expect(() => parse('$.name~.a')).to.throw(
        'Expected "^", "~", or end of input but "." found.',
      );
    });

    it('unclosed quotes', () => {
      expect(() => parse('$.name["a]')).to.throw(
        `Expected "\\"" or [^"] but end of input found.`,
      );
      expect(() => parse('$.name["\']')).to.throw(
        `Expected "\\"" or [^"] but end of input found.`,
      );
    });

    it('invalid step in slice expressions', () => {
      expect(() => parse('$.name[::test]')).to.throw(
        'Expected "-" or [0-9] but "t" found.',
      );
    });

    it('invalid shorthands', () => {
      expect(() => parse('$..@@()')).to.throw('Expected [a-z] but "(" found.');
      expect(() => parse('$..@@test)')).to.throw(
        'Expected "()" or [a-z] but ")" found.',
      );
      expect(() => parse('$..@@test(')).to.throw(
        'Expected "()" or [a-z] but "(" found.',
      );
      expect(() => parse('$..@@test)')).to.throw(
        'Expected "()" or [a-z] but ")" found.',
      );
      expect(() => parse('$..@')).to.throw(
        'Expected "@" or [a-z] but end of input found.',
      );
    });

    it('unclosed brackets', () => {
      expect(() => parse('$.name[0')).to.throw(
        'Expected "\'", ",", ":", "\\"", "]", [$_\\-], [0-9], or [A-Za-z] but end of input found.',
      );
      expect(() => parse('$.store["[name]"')).to.throw(
        'Expected "\'", ",", "\\"", "]", [$_\\-], [0-9], or [A-Za-z] but end of input found.',
      );
    });
  });
});
