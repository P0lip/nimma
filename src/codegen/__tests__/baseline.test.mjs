import astring from 'astring';
import mocha from 'mocha';
import chai from 'chai';

import Parser from '../../parser/parser.mjs';
import { baseline } from '../baseline.mjs';

const { describe, it } = mocha;
const { expect } = chai;

function print(path) {
  const parser = new Parser();
  return astring.generate(baseline(parser.parse(path)));
}

describe('baseline', () => {
  it('flat', () => {
    expect(print('$.info')).to.equal(
      `scope.path.length > 0 && scope.path[0] === "info" && scope.path.length === 1 && void scope.destroy() === void 0`,
    );

    expect(print('$.info.contact')).to.equal(
      `scope.path.length > 0 && scope.path[0] === "info" && (scope.path.length > 1 && scope.path[1] === "contact") && scope.path.length === 2 && void scope.destroy() === void 0`,
    );

    expect(print('$.servers[*].url')).to.equal(
      `scope.path.length > 0 && scope.path[0] === "servers" && scope.path.length > 1 && (scope.path.length > 2 && scope.path[2] === "url") && scope.path.length === 3 && void scope.destroy() === void 0`,
    );
  });

  it('deep', () => {
    expect(print('$..content..*')).to.equal(
      `(scope.lastIndex = scope.path.indexOf("content", scope.lastIndex), scope.lastIndex !== -1) && scope.path.length > scope.lastIndex`,
    );

    expect(print('$..empty')).to.equal(`scope.property === "empty"`);

    expect(print('$.paths..content.*.examples')).to.equal(
      `scope.path.length > 0 && scope.path[0] === "paths" && (scope.lastIndex = scope.path.indexOf("content", scope.lastIndex), scope.lastIndex !== -1) && scope.path.length > scope.lastIndex + 1 && (scope.path.length > scope.lastIndex + 2 && scope.path[scope.lastIndex + 2] === "examples") && scope.path.length === scope.lastIndex + 3`,
    );

    expect(print('$..foo..bar..baz')).to.equal(
      `(scope.lastIndex = scope.path.indexOf("foo", scope.lastIndex), scope.lastIndex !== -1) && (scope.lastIndex = scope.path.indexOf("bar", scope.lastIndex), scope.lastIndex !== -1) && scope.property === "baz"`,
    );
  });

  it('string literal', () => {
    expect(print("$.bar['children']")).to.equal(
      'scope.path.length > 0 && scope.path[0] === "bar" && (scope.path.length > 1 && scope.path[1] === "children") && scope.path.length === 2 && void scope.destroy() === void 0',
    );

    expect(print("$.bar['0']")).to.equal(
      'scope.path.length > 0 && scope.path[0] === "bar" && (scope.path.length > 1 && scope.path[1] === "0") && scope.path.length === 2 && void scope.destroy() === void 0',
    );

    expect(print("$.bar['children.bar']")).to.equal(
      'scope.path.length > 0 && scope.path[0] === "bar" && (scope.path.length > 1 && scope.path[1] === "children.bar") && scope.path.length === 2 && void scope.destroy() === void 0',
    );
  });

  it('filter expressions', () => {
    expect(print(`$..[?(@property === '$ref')]`)).to.equal(
      `scope.sandbox.property === '$ref'`,
    );

    expect(print(`$.info..*[?(@property.startsWith('foo'))]`)).to.equal(
      `scope.path.length > 0 && scope.path[0] === "info" && scope.path.length > scope.lastIndex && scope.sandbox.property.startsWith('foo')`,
    );

    expect(print(`$.info.*[?(@property.startsWith('foo'))]`)).to.equal(
      `scope.path.length > 0 && scope.path[0] === "info" && scope.path.length > 1 && scope.sandbox.property.startsWith('foo') && scope.path.length === 3 && void scope.destroy() === void 0`,
    );

    expect(
      print(`$..[?(@property === 'description' || @property === 'title')]`),
    ).to.equal(
      `scope.sandbox.property === 'description' || scope.sandbox.property === 'title'`,
    );

    expect(print('$..headers..[?(@.example && @.schema)]')).to.equal(
      `(scope.lastIndex = scope.path.indexOf("headers", scope.lastIndex), scope.lastIndex !== -1) && (scope.sandbox.value.example && scope.sandbox.value.schema)`,
    );

    expect(print('$..headers..*[?(@.example && @.schema)]')).to.equal(
      `(scope.lastIndex = scope.path.indexOf("headers", scope.lastIndex), scope.lastIndex !== -1) && scope.path.length > scope.lastIndex && (scope.sandbox.value.example && scope.sandbox.value.schema)`,
    );

    expect(
      print(
        "$.paths.*[?( @property === 'get' || @property === 'put' || @property === 'post' )]",
      ),
    ).to.equal(
      `scope.path.length > 0 && scope.path[0] === "paths" && scope.path.length > 1 && (scope.sandbox.property === 'get' || scope.sandbox.property === 'put' || scope.sandbox.property === 'post') && scope.path.length === 3 && void scope.destroy() === void 0`,
    );

    expect(print('$.paths.*[?( @property >= 400 )]')).to.equal(
      `scope.path.length > 0 && scope.path[0] === "paths" && scope.path.length > 1 && scope.sandbox.property >= 400 && scope.path.length === 3 && void scope.destroy() === void 0`,
    );
  });

  it('filter expressions in the middle', () => {
    // expect(print('$..[?( @property >= 400 )].foo')).to.equal(
    //   `(scope.lastIndex = scope.evaluateDeep("return scope.sandbox.property >= 400;", scope.lastIndex, 1), scope.lastIndex !== -1) && (scope.path.length > scope.lastIndex + 1 && scope.path[scope.lastIndex + 1] === "foo") && scope.path.length === scope.lastIndex + 2`,
    // );
    //
    // expect(print('$..[?( @property >= 400 )]..foo')).to.equal(
    //   `(scope.lastIndex = scope.evaluateDeep("return scope.sandbox.property >= 400;", scope.lastIndex, 1), scope.lastIndex !== -1) && scope.property === "foo"`,
    // );
    //
    // expect(print('$.bar[?( @property >= 400 )]..foo')).to.equal(
    //   `scope.path.length > 0 && scope.path[0] === "bar" && scope.evaluate("return scope.sandbox.property >= 400;", 1, 2) && scope.property === "foo"`,
    // );
    // expect(print('$..bar..[?( @property >= 400 )]..foo')).to.equal(
    //   `(scope.lastIndex = scope.path.indexOf("bar", scope.lastIndex), scope.lastIndex !-- -1) && scope.path.length > scope.lastIndex + 1 && scope.evaluateDeep("return scope.sandbox.property >= 400;", 1) && scope.property === "foo"`,
    // );
  });

  it('unsupported', () => {
    expect(print.bind(null, '$.paths[0:2]')).to.throw();
    expect(print.bind(null, '$..book[(@.length-1)]')).to.throw();
    expect(print.bind(null, '$.paths^')).to.throw();
    expect(print.bind(null, '$.paths~')).to.throw();
  });
});
