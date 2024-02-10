/* eslint-disable no-undef */
import { expect } from 'chai';

import Nimma from '../index.mjs';

describe('Core', () => {
  it('given unsupported, should throw', () => {
    const fn = () => new Nimma(['$.a^.a']);

    expect(fn).to.throw(AggregateError, 'Error parsing $.a^.a');

    try {
      fn();
    } catch (e) {
      expect(e.errors[0]).to.be.instanceof(SyntaxError);
      expect(e.errors[0].message).to.eq(
        'Expected "^", "~", or end of input but "." found at 4',
      );
    }
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
