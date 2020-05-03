import forEach from 'mocha-each';
import astring from 'astring';
import mocha from 'mocha';
import chai from 'chai';

import { parseFilterExpression } from '../utils/parseFilterExpression.mjs';

const { describe, it } = mocha;
const { expect } = chai;

function print(expr) {
  return astring.generate(parseFilterExpression(expr));
}

describe('parseFilterExpression', () => {
  it('@.access', () => {
    expect(print(`(@.schema || @.ex)`)).to.equal(
      `scope.sandbox.value.schema || scope.sandbox.value.ex`,
    );

    expect(print(`(@.schema['d'] || @.ex.baz)`)).to.equal(
      `scope.sandbox.value.schema['d'] || scope.sandbox.value.ex.baz`,
    );
  });

  it('at in string', () => {
    expect(print(`(@property === "@.schema")`)).to.equal(
      `scope.sandbox.property === "@.schema"`,
    );

    expect(print(`(@property === "@string")`)).to.equal(
      `scope.sandbox.property === "@string"`,
    );
  });

  it('basic binary expressions', () => {
    expect(print(`(@.amount + 2 === 4)`)).to.equal(
      `scope.sandbox.value.amount + 2 === 4`,
    );
  });

  it('disallows identifiers', () => {
    expect(print.bind(null, `(@property === foo)`)).to.throw(
      ReferenceError,
      `'foo' is not defined`,
    );
  });

  context('jsonpath-plus exclusive additions', () => {
    it('@property', () => {
      expect(print(`(@property === 'foo')`)).to.equal(
        `scope.sandbox.property === 'foo'`,
      );
    });

    forEach(['string', 'boolean', 'number']).it('@%s', kind => {
      expect(print(`(@${kind}())`)).to.equal(
        `typeof scope.sandbox.value === "${kind}"`,
      );
    });

    it('@null()', () => {
      expect(print(`(@null())`)).to.equal(`scope.sandbox.value === null`);
    });

    it('@array()', () => {
      expect(print(`(@array())`)).to.equal(
        `Array.isArray(scope.sandbox.value)`,
      );
    });

    it('@object()', () => {
      expect(print(`(@object())`)).to.equal(
        `scope.sandbox.value !== null && typeof scope.sandbox.value === "object"`,
      );
    });

    it('@integer()', () => {
      expect(print(`(@integer())`)).to.equal(
        `Number.isInteger(scope.sandbox.value)`,
      );
    });

    it('throws upon unknown shorthand', () => {
      expect(print.bind(null, `(@foo())`)).to.throw(
        SyntaxError,
        `Unsupported shorthand '@foo()'`,
      );
    });
  });
});
