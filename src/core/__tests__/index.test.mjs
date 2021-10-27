/* eslint-disable no-undef */
import chai from 'chai';

import Nimma from '../index.mjs';

const { expect } = chai;

describe('Core', () => {
  it('given unsupported, should throw', () => {
    expect(() => new Nimma(['$.a^.a'])).to.throw(
      'Expected "^", "~", or end of input but "." found.',
    );
  });

  it('given unsafe expression and no fallback, should throw', () => {
    expect(
      () => new Nimma(['$..[?(@.a)]..[?(@.b)]..c..d'], { unsafe: false }),
    ).to.throw(
      SyntaxError,
      'Unsafe expressions are ignored, but no fallback was specified',
    );
  });

  it('should be able to query multiple times', () => {
    const n = new Nimma(['$']);
    const values = [];
    function $(scope) {
      values.push([scope.path, scope.value]);
    }

    n.query({ doc: true }, { $ });
    n.query({ foo: false }, { $ });

    expect(values).to.deep.eq([
      [[], { doc: true }],
      [[], { foo: false }],
    ]);
  });
});
