/* global it */
import chai from 'chai';
import each from 'it-each';
import mocha from 'mocha';

import parse from '../../parser/index.mjs';

const { describe } = mocha;
const { expect } = chai;

each({ testPerIteration: true });

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

  it.each(
    ['$$ref', '$ref', '0abc', 'bar-baz'].map(member => ({ member })),
    '%s',
    ['member'],
    ({ member }) => {
      expect(parse(`$..${member}`)).to.deep.equal([
        {
          type: 'MemberExpression',
          value: member,
          deep: true,
        },
      ]);
    },
  );
});
