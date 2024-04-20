import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Nimma from '../index.mjs';

describe('Core', () => {
  it('given unsupported, should throw', () => {
    const fn = () => new Nimma(['$.a^.a']);

    assert.throws(fn, AggregateError, 'Error parsing $.a^.a');

    try {
      fn();
    } catch (e) {
      assert.ok(e.errors[0] instanceof SyntaxError);
      assert.equal(
        e.errors[0].message,
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

    assert.deepEqual(values, [
      [[], { doc: true }],
      [[], { foo: false }],
    ]);
  });
});
