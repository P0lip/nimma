import * as assert from 'node:assert/strict';

import * as JSONPath from 'jsonpath-plus';
import toPath from 'lodash-es/toPath.js';

import Nimma from '../../index.mjs';

export function compare(document, path) {
  const n = new Nimma([path]);
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

  assert.deepEqual(nimma.paths, jsonPathPlus.paths);
  assert.deepEqual(nimma.results, jsonPathPlus.results);
}

const compareFn = (a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b));
