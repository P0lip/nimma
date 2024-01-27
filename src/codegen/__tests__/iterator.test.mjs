import { expect } from 'chai';

import parse from '../../parser/index.mjs';
import Iterator from '../iterator.mjs';

describe('Iterator', () => {
  describe('analyzer', () => {
    it('$.baz', () => {
      const ast = parse('$.baz');

      expect(Iterator.analyze(ast)).to.deep.eq({
        fixed: true,
        inverseOffset: -1,
        minimumDepth: 0,
        stateOffset: -1,
      });
    });

    it('$.baz..baz', () => {
      const ast = parse('$.baz..baz');

      expect(Iterator.analyze(ast)).to.deep.eq({
        fixed: false,
        inverseOffset: -1,
        minimumDepth: 1,
        stateOffset: -1,
      });
    });

    it('$.baz..baz[?(@.abc)]', () => {
      const ast = parse('$.baz..baz[?(@.abc)]');

      expect(Iterator.analyze(ast)).to.deep.eq({
        fixed: false,
        inverseOffset: 1,
        minimumDepth: 2,
        stateOffset: -1,
      });
    });

    it('$.baz..[?(@.abc)].baz', () => {
      const ast = parse('$.baz..[?(@.abc)].baz');

      expect(Iterator.analyze(ast)).to.deep.eq({
        fixed: false,
        inverseOffset: -1,
        minimumDepth: 1,
        stateOffset: 1,
      });
    });

    it('$..foo..bar..baz', () => {
      const ast = parse('$..foo..bar..baz');

      expect(Iterator.analyze(ast)).to.deep.eq({
        fixed: false,
        inverseOffset: -1,
        minimumDepth: 0,
        stateOffset: 0,
      });
    });

    it('$.info.contact.*', () => {
      const ast = parse('$.info.contact.*');

      expect(Iterator.analyze(ast)).to.deep.eq({
        fixed: true,
        inverseOffset: -1,
        minimumDepth: 2,
        stateOffset: -1,
      });
    });

    it('$.bar[?( @property >= 400 )]..foo', () => {
      const ast = parse('$.bar[?( @property >= 400 )]..foo');

      expect(Iterator.analyze(ast)).to.deep.eq({
        fixed: false,
        inverseOffset: -1,
        minimumDepth: 1,
        stateOffset: 1,
      });
    });

    it('$..foo..[?( @property >= 900 )]..foo', () => {
      const ast = parse('$..foo..[?( @property >= 900 )]..foo');

      expect(Iterator.analyze(ast)).to.deep.eq({
        fixed: false,
        inverseOffset: -1,
        minimumDepth: 0,
        stateOffset: 0,
      });
    });

    it('$..examples.*', () => {
      const ast = parse('$..examples.*');

      expect(Iterator.analyze(ast)).to.deep.eq({
        fixed: false,
        inverseOffset: 0,
        minimumDepth: 1,
        stateOffset: -1,
      });
    });

    it('$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload', () => {
      const ast = parse(
        '$.channels[*][publish,subscribe][?(@.schemaFormat === void 0)].payload',
      );

      expect(Iterator.analyze(ast)).to.deep.eq({
        fixed: true,
        inverseOffset: -1,
        minimumDepth: 3,
        stateOffset: 3,
      });
    });

    it('$.continents[:-1].countries', () => {
      const ast = parse('$.continents[:-1].countries');

      expect(Iterator.analyze(ast)).to.deep.eq({
        fixed: true,
        inverseOffset: -1,
        minimumDepth: 1,
        stateOffset: 1,
      });
    });

    it('$.Europe[*]..cities[?(@ ~= "^P\\\\.")]', () => {
      const ast = parse('$.Europe[*]..cities[?(@ ~= "^P\\\\.")]');

      expect(Iterator.analyze(ast)).to.deep.eq({
        fixed: false,
        inverseOffset: 2,
        minimumDepth: 3,
        stateOffset: -1,
      });
    });

    it('$..book[2]', () => {
      const ast = parse('$..book[2]');

      expect(Iterator.analyze(ast)).to.deep.eq({
        fixed: false,
        inverseOffset: 0,
        minimumDepth: 1,
        stateOffset: -1,
      });
    });

    it('$..book[0][category,author]', () => {
      const ast = parse('$..book[0][category,author]');

      expect(Iterator.analyze(ast)).to.deep.eq({
        fixed: false,
        inverseOffset: 0,
        minimumDepth: 2,
        stateOffset: -1,
      });
    });

    it('$.paths[*][*].operationId', () => {
      const ast = parse('$.paths[*][*].operationId');

      expect(Iterator.analyze(ast)).to.deep.eq({
        fixed: true,
        inverseOffset: -1,
        minimumDepth: 3,
        stateOffset: -1,
      });
    });
  });
});
