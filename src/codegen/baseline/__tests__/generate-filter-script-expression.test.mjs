import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import parse from '../../../parser/index.mjs';
import astring from '../../dump.mjs';
import Iterator from '../../iterator.mjs';
import { generateFilterScriptExpression } from '../generators.mjs';

function print(expr) {
  const ast = parse(`$[${expr}]`);
  const iterator = new Iterator(ast);
  const { value: node } = iterator[Symbol.iterator]().next();
  const branch = [];

  generateFilterScriptExpression(branch, iterator, node, {
    attachCustomShorthand() {
      // no-op
    },
  });

  return astring(branch[0].test);
}

describe('generateFilterScriptExpression', () => {
  it('at member expression', () => {
    assert.equal(
      print(`?(@.schema || @.ex)`),
      `!(scope.sandbox.value.schema || scope.sandbox.value.ex)`,
    );

    assert.equal(
      print(`?(@.schema['d'] || @.ex.baz)`),
      `!(scope.sandbox.value.schema['d'] || scope.sandbox.value.ex.baz)`,
    );

    assert.equal(print(`?(!@.summary)`), `!!scope.sandbox.value.summary`);
  });

  it('"unknown" identifier', () => {
    assert.equal(
      print(`?(@.schema === undefined)`),
      `!(scope.sandbox.value.schema === void 0)`,
    );
  });

  it('at in a string', () => {
    assert.equal(
      print(`?(@property === "@.schema")`),
      `!(scope.sandbox.property === "@.schema")`,
    );

    assert.equal(
      print(`?(@property === "@string")`),
      `!(scope.sandbox.property === "@string")`,
    );
  });

  it('unary expressions', () => {
    assert.equal(print(`?(!@.amount)`), `!!scope.sandbox.value.amount`);
    assert.equal(
      print(`?(!@.line == -@.char)`),
      '!(!scope.sandbox.value.line == -scope.sandbox.value.char)',
    );
  });

  it('binary expressions', () => {
    assert.equal(
      print(`?(@.amount + 2 === 4)`),
      `!(scope.sandbox.value.amount + 2 === 4)`,
    );
  });

  for (const expression of [
    `@property === Array`,
    `Array.isArray`,
    `Array`,
    `!Array`,
    `Array + Object`,
    `Array()`,
    `Array()()()`,
  ]) {
    it(`disallows usage of untrusted identifiers in "${expression}"`, () => {
      assert.throws(
        () => print(`?(${expression})`),
        ReferenceError,
        `"Array" is not defined`,
      );
    });
  }

  describe('jsonpath-plus exclusive additions', () => {
    it('@property', () => {
      assert.equal(
        print(`?(@property === 'foo')`),
        `!(scope.sandbox.property === 'foo')`,
      );
    });

    it('@path', () => {
      assert.equal(
        print(`?(@path.includes("foo"))`),
        `!scope.sandbox.path.includes("foo")`,
      );
    });

    it('@parent', () => {
      assert.equal(
        print(`?(@parent.version === 1)`),
        `!(scope.sandbox.parentValue.version === 1)`,
      );
    });

    for (const kind of ['string', 'boolean', 'number']) {
      it(`@${kind}`, () => {
        assert.equal(
          print(`?(@${kind}())`),
          `!(typeof scope.sandbox.value === "${kind}")`,
        );
      });
    }

    it('@scalar()', () => {
      assert.equal(
        print(`?(@scalar())`),
        `!(scope.sandbox.value === null || typeof scope.sandbox.value !== "object")`,
      );
    });

    it('@null()', () => {
      assert.equal(print(`?(@null())`), `!(scope.sandbox.value === null)`);
    });

    it('@array()', () => {
      assert.equal(print(`?(@array())`), `!Array.isArray(scope.sandbox.value)`);
    });

    it('@object()', () => {
      assert.equal(
        print(`?(@object())`),
        `!(scope.sandbox.value !== null && typeof scope.sandbox.value === "object")`,
      );
    });

    it('@integer()', () => {
      assert.equal(
        print(`?(@integer())`),
        `!Number.isInteger(scope.sandbox.value)`,
      );
    });

    it('throws upon unknown shorthand', () => {
      assert.throws(
        () => print(`?(@foo())`),
        Error(`Unsupported shorthand "@foo"`),
      );
    });
  });

  it('supports ~= operator', () => {
    assert.equal(print(`?(@ ~= "abc")`), '!/abc/.test(scope.sandbox.value)');
  });

  it('prohibits the use of ~= operator for nodes other than Literals', () => {
    assert.throws(
      () => print(`?(@ ~= baz)`),
      SyntaxError('~= must be used with strings'),
    );
  });
});
