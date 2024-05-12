import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import parse from '../../parser/index.mjs';
import Iterator from '../iterator.mjs';

describe('Iterator', () => {
  describe('analyzer', () => {
    it('$.baz', () => {
      const ast = parse('$.baz');

      assert.deepEqual(Iterator.analyze(ast), {
        fixed: true,
        inverseOffset: -1,
        minimumDepth: 0,
        shorthands: 0,
        stateOffset: -1,
      });
    });

    it('$.baz..baz', () => {
      const ast = parse('$.baz..baz');

      assert.deepEqual(Iterator.analyze(ast), {
        fixed: false,
        inverseOffset: -1,
        minimumDepth: 1,
        shorthands: 0,
        stateOffset: -1,
      });
    });

    it('$.baz..baz[?(@.abc)]', () => {
      const ast = parse('$.baz..baz[?(@.abc)]');

      assert.deepEqual(Iterator.analyze(ast), {
        fixed: false,
        inverseOffset: 1,
        minimumDepth: 2,
        shorthands: 0,
        stateOffset: -1,
      });
    });

    it('$.baz..[?(@.abc)].baz', () => {
      const ast = parse('$.baz..[?(@.abc)].baz');

      assert.deepEqual(Iterator.analyze(ast), {
        fixed: false,
        inverseOffset: -1,
        minimumDepth: 1,
        shorthands: 0,
        stateOffset: 1,
      });
    });

    it('$..foo..bar..baz', () => {
      const ast = parse('$..foo..bar..baz');

      assert.deepEqual(Iterator.analyze(ast), {
        fixed: false,
        inverseOffset: -1,
        minimumDepth: 0,
        shorthands: 0,
        stateOffset: 0,
      });
    });

    it('$.info.contact.*', () => {
      const ast = parse('$.info.contact.*');

      assert.deepEqual(Iterator.analyze(ast), {
        fixed: true,
        inverseOffset: -1,
        minimumDepth: 2,
        shorthands: 0,
        stateOffset: -1,
      });
    });

    it('$.bar[?( @property >= 400 )]..foo', () => {
      const ast = parse('$.bar[?( @property >= 400 )]..foo');

      assert.deepEqual(Iterator.analyze(ast), {
        fixed: false,
        inverseOffset: -1,
        minimumDepth: 1,
        shorthands: 0,
        stateOffset: 1,
      });
    });

    it('$..foo..[?( @property >= 900 )]..foo', () => {
      const ast = parse('$..foo..[?( @property >= 900 )]..foo');

      assert.deepEqual(Iterator.analyze(ast), {
        fixed: false,
        inverseOffset: -1,
        minimumDepth: 0,
        shorthands: 0,
        stateOffset: 0,
      });
    });

    it('$..examples.*', () => {
      const ast = parse('$..examples.*');

      assert.deepEqual(Iterator.analyze(ast), {
        fixed: false,
        inverseOffset: 0,
        minimumDepth: 1,
        shorthands: 0,
        stateOffset: -1,
      });
    });

    it('$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload', () => {
      const ast = parse(
        '$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload',
      );

      assert.deepEqual(Iterator.analyze(ast), {
        fixed: true,
        inverseOffset: -1,
        minimumDepth: 3,
        shorthands: 0,
        stateOffset: 3,
      });
    });

    it('$.continents[:-1].countries', () => {
      const ast = parse('$.continents[:-1].countries');

      assert.deepEqual(Iterator.analyze(ast), {
        fixed: true,
        inverseOffset: -1,
        minimumDepth: 1,
        shorthands: 0,
        stateOffset: 1,
      });
    });

    it('$.Europe[*]..cities[?(@ ~= "^P\\\\.")]', () => {
      const ast = parse('$.Europe[*]..cities[?(@ ~= "^P\\\\.")]');

      assert.deepEqual(Iterator.analyze(ast), {
        fixed: false,
        inverseOffset: 2,
        minimumDepth: 3,
        shorthands: 0,
        stateOffset: -1,
      });
    });

    it('$..book[2]', () => {
      const ast = parse('$..book[2]');

      assert.deepEqual(Iterator.analyze(ast), {
        fixed: false,
        inverseOffset: 0,
        minimumDepth: 1,
        shorthands: 0,
        stateOffset: -1,
      });
    });

    it('$..book[0][category,author]', () => {
      const ast = parse('$..book[0][category,author]');

      assert.deepEqual(Iterator.analyze(ast), {
        fixed: false,
        inverseOffset: 0,
        minimumDepth: 2,
        shorthands: 0,
        stateOffset: -1,
      });
    });

    it('$.paths[*][*].operationId', () => {
      const ast = parse('$.paths[*][*].operationId');

      assert.deepEqual(Iterator.analyze(ast), {
        fixed: true,
        inverseOffset: -1,
        minimumDepth: 3,
        shorthands: 0,
        stateOffset: -1,
      });
    });

    it('$.components.schemas[*]..@@schema(2)', () => {
      const ast = parse('$.components.schemas[*]..@@schema(2)');

      assert.deepEqual(Iterator.analyze(ast), {
        fixed: false,
        inverseOffset: -1,
        minimumDepth: 2,
        shorthands: 1,
        stateOffset: 3,
      });
    });
  });
});
