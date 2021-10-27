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
});
