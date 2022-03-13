import chai from 'chai';
import forEach from 'mocha-each';

import parse from '../../../parser/index.mjs';
import astring from '../../dump.mjs';
import Iterator from '../../iterator.mjs';
import { generateFilterScriptExpression } from '../generators.mjs';

const { expect } = chai;

function print(expr) {
  const ast = parse(`$[${expr}]`);
  const iterator = new Iterator(ast);
  const { value: node } = iterator[Symbol.iterator]().next();
  return astring(
    generateFilterScriptExpression(iterator, node, {
      attachCustomShorthand() {
        // no-op
      },
    }),
  );
}

describe('parseFilterExpression', () => {
  it('at member expression', () => {
    expect(print(`?(@.schema || @.ex)`)).to.eq(
      `!(scope.sandbox.value.schema || scope.sandbox.value.ex)`,
    );

    expect(print(`?(@.schema['d'] || @.ex.baz)`)).to.eq(
      `!(scope.sandbox.value.schema['d'] || scope.sandbox.value.ex.baz)`,
    );

    expect(print(`?(!@.summary)`)).to.eq(`!!scope.sandbox.value.summary`);
  });

  it('"unknown" identifier', () => {
    expect(print(`?(@.schema === undefined)`)).to.eq(
      `!(scope.sandbox.value.schema === void 0)`,
    );
  });

  it('at in a string', () => {
    expect(print(`?(@property === "@.schema")`)).to.eq(
      `!(scope.sandbox.property === "@.schema")`,
    );

    expect(print(`?(@property === "@string")`)).to.eq(
      `!(scope.sandbox.property === "@string")`,
    );
  });

  it('basic binary expressions', () => {
    expect(print(`?(@.amount + 2 === 4)`)).to.eq(
      `!(scope.sandbox.value.amount + 2 === 4)`,
    );
  });

  forEach([
    `@property === Array`,
    `Array.isArray`,
    `Array`,
    `!Array`,
    `Array + Object`,
    `Array()`,
    `Array()()()`,
  ]).it('disallows usage of untrusted identifiers in %s', expression => {
    expect(print.bind(null, `?(${expression})`)).to.throw(
      ReferenceError,
      `'Array' is not defined`,
    );
  });

  context('jsonpath-plus exclusive additions', () => {
    it('@property', () => {
      expect(print(`?(@property === 'foo')`)).to.eq(
        `!(scope.sandbox.property === 'foo')`,
      );
    });

    it('@path', () => {
      expect(print(`?(@path.includes("foo"))`)).to.eq(
        `!scope.sandbox.path.includes("foo")`,
      );
    });

    it('@parent', () => {
      expect(print(`?(@parent.version === 1)`)).to.eq(
        `!(scope.sandbox.parentValue.version === 1)`,
      );
    });

    forEach(['string', 'boolean', 'number']).it('@%s', kind => {
      expect(print(`?(@${kind}())`)).to.eq(
        `!(typeof scope.sandbox.value === "${kind}")`,
      );
    });

    it('@scalar()', () => {
      expect(print(`?(@scalar())`)).to.eq(
        `!(scope.sandbox.value === null || typeof scope.sandbox.value !== "object")`,
      );
    });

    it('@null()', () => {
      expect(print(`?(@null())`)).to.eq(`!(scope.sandbox.value === null)`);
    });

    it('@array()', () => {
      expect(print(`?(@array())`)).to.eq(`!Array.isArray(scope.sandbox.value)`);
    });

    it('@object()', () => {
      expect(print(`?(@object())`)).to.eq(
        `!(scope.sandbox.value !== null && typeof scope.sandbox.value === "object")`,
      );
    });

    it('@integer()', () => {
      expect(print(`?(@integer())`)).to.eq(
        `!Number.isInteger(scope.sandbox.value)`,
      );
    });

    it('supports custom handlers', () => {
      expect(print(`?(@@schema())`)).to.eq(`!shorthands.schema(scope)`);
    });

    it('throws upon unknown shorthand', () => {
      expect(print.bind(null, `?(@foo())`)).to.throw(
        SyntaxError,
        `Unsupported shorthand '@foo'`,
      );
    });
  });
});
