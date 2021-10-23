import chai from 'chai';
import forEach from 'mocha-each';

import Fallback from '../fallback.mjs';

const { expect } = chai;

describe('Fallback', () => {
  forEach([
    /* eslint-disable no-unused-vars */
    function (input, path, fn) {},
    function bar(input, path, fn) {},
    (input, path, fn) => {},
    /* eslint-enable no-unused-vars */
  ]).it('%s', fn => {
    const fb = new Fallback({}, fn);

    expect(fb.extraCode).to.equal('(input, path, fn) => {}');
  });
});
