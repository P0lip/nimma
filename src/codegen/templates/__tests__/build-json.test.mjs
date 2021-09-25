import chai from 'chai';
import mocha from 'mocha';

import dump from '../../dump.mjs';
import buildJson from '../build-json.mjs';

const { describe, it } = mocha;
const { expect } = chai;

function compare(input) {
  expect(JSON.parse(dump(buildJson(input)))).to.deep.eq(input);
}

describe('buildJson', () => {
  it('primitives', () => {
    compare(1);
    compare(0);
    compare(false);
    compare(true);
    compare(null);
    compare('');
    compare('abc');
  });

  it('arrays', () => {
    compare([]);
    compare([1, 2]);
    compare([{}, true, null, 'a']);
  });

  it('objects', () => {
    compare({});
    compare({ a: null });
    compare({
      b: [{}, { c: false }],
      d: [],
    });
  });
});
