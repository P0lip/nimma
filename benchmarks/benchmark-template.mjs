/* eslint-disable no-undef */
/* global DOCUMENT, JSON_PATHS precompiledNimma */
import Benchmark from 'benchmark';
import jp from 'jsonpath';
import * as JSONPath from 'jsonpath-plus';
import * as process from 'node:process';

import Nimma from '../dist/esm/index.mjs';

let results = [];
const callbacksWithResults = Object.fromEntries(
  JSON_PATHS.map(p => [
    p,
    r => {
      results.push(r.value);
    },
  ]),
);

const suite = new Benchmark.Suite();

suite.add('Nimma (cold)', function () {
  const n = new Nimma(JSON_PATHS);
  n.query(DOCUMENT, callbacksWithResults);
});

suite.add('Nimma (hot)', function () {
  precompiledNimma(DOCUMENT, callbacksWithResults);
});

suite.add(
  'JSONPath-Plus (resultType=value)',
  JSON_PATHS.length > 1
    ? function () {
        for (const path of JSON_PATHS) {
          JSONPath.JSONPath({
            json: DOCUMENT,
            path,
            resultType: 'value',
          });
        }
      }
    : function () {
        JSONPath.JSONPath({
          json: DOCUMENT,
          path: JSON_PATHS[0],
          resultType: 'value',
        });
      },
);

suite.add(
  'JSONPath-Plus (resultType=all)',
  JSON_PATHS.length > 1
    ? function () {
        for (const path of JSON_PATHS) {
          JSONPath.JSONPath({
            json: DOCUMENT,
            path,
            resultType: 'all',
          });
        }
      }
    : function () {
        JSONPath.JSONPath({
          json: DOCUMENT,
          path: JSON_PATHS[0],
          resultType: 'all',
        });
      },
);

suite.add(
  'JSONPath',
  JSON_PATHS.length > 1
    ? function () {
        for (const path of JSON_PATHS) {
          jp.query(DOCUMENT, path);
        }
      }
    : function () {
        jp.query(DOCUMENT, JSON_PATHS[0]);
      },
);

suite.on('cycle', function (event) {
  process.stdout.write(String(event.target));
  process.stdout.write('\n');
  results = [];
});
suite.on('error', function (e) {
  process.stderr.write(e);
});
suite.on('complete', function () {
  process.stdout.write('Fastest is ' + this.filter('fastest').map('name'));
});
suite.run();
