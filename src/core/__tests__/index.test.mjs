/* eslint-disable no-undef */
import chai from 'chai';

import { ParserError } from '../../runtime/errors/index.mjs';
import Nimma from '../index.mjs';

const { expect } = chai;

describe('Core', () => {
  it('given unsupported, should throw', () => {
    const fn = () => new Nimma(['$.a^.a']);

    expect(fn).to.throw(AggregateError, 'Error parsing $.a^.a');

    try {
      fn();
    } catch (e) {
      expect(e.errors[0]).to.be.instanceof(ParserError);
      expect(e.errors[0].cause.name).to.eq('SyntaxError');
      expect(e.errors[0].message).to.eq(
        'Expected "^", "~", or end of input but "." found.',
      );
    }
  });

  it('given unsafe expression and no fallback, should throw', () => {
    const fn = () =>
      new Nimma(
        ['$..[?(@.a)]..[?(@.b)]..c..d', '$..[?(@.ab)]..[?(@.cb)]..c..d'],
        { unsafe: false },
      );

    expect(fn).to.throw(
      AggregateError,
      'Error parsing $..[?(@.a)]..[?(@.b)]..c..d, $..[?(@.ab)]..[?(@.cb)]..c..d',
    );

    try {
      fn();
    } catch (e) {
      expect(e.errors[0]).to.be.instanceof(SyntaxError);
      expect(e.errors[1]).to.be.instanceof(SyntaxError);
      expect(e.errors[0].message).to.eq(
        'Unsafe expressions are ignored, but no fallback was specified',
      );
      expect(e.errors[1].message).to.eq(
        'Unsafe expressions are ignored, but no fallback was specified',
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
