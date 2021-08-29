import * as chai from 'chai';
import * as JSONPath from 'jsonpath-plus';
import toPath from 'lodash.topath';

import Nimma from '../../index.mjs';

const { expect } = chai;

export function compare(document, path) {
  const n = new Nimma([path], { unsafe: true });
  const nimma = {
    paths: [],
    results: [],
  };
  n.query(document, {
    [path]({ path, value }) {
      nimma.results.push(value);
      nimma.paths.push(['$', ...path].join('/'));
    },
  });

  nimma.paths.sort(compareFn);
  nimma.results.sort(compareFn);

  const jsonPathPlus = {
    paths: [],
    results: [],
  };
  JSONPath.JSONPath({
    callback({ path, value }) {
      jsonPathPlus.results.push(value);
      jsonPathPlus.paths.push(toPath(path).join('/'));
    },
    json: document,
    path,
    resultType: 'all',
  });

  jsonPathPlus.paths.sort(compareFn);
  jsonPathPlus.results.sort(compareFn);

  expect(nimma.paths).to.deep.eq(jsonPathPlus.paths);
  expect(nimma.results).to.deep.eq(jsonPathPlus.results);
}

const compareFn = (a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b));
