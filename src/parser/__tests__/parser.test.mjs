import { expect } from 'chai';
import forEach from 'mocha-each';

import parse from '../../parser/index.mjs';

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

  forEach(['$$ref', '$ref', '0abc', 'bar-baz']).it('%s', member => {
    expect(parse(`$..${member}`)).to.deep.equal([
      {
        type: 'MemberExpression',
        value: member,
        deep: true,
      },
    ]);
  });

  forEach(['$info']).it('should refuse to parse %s', expr => {
    expect(parse.bind(null, expr)).to.throw();
  });

  it('should parse @@', () => {
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
  });

  forEach(['$.[enum]', '$.[?(@.enum)]', '$.foo.[bar,baz]']).it(
    'given %s, should should treat .[ as ..',
    expr => {
      expect(parse(expr)).to.deep.equal(
        parse(expr.replace(/\.\?=(\[\?\()|{\.}1\[/g, '..')),
      );
    },
  );
});
