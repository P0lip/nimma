import * as assert from 'node:assert';

import parse from '../../src/parser/index.mjs';

export default async (suite, document, expressions) => {
  suite.add(`Nimma@local (parser)`, function () {
    const parsed = new Set();
    for (const expression of expressions) {
      parsed.add(parse(expression));
    }

    assert.ok(parsed.size === expressions.length);
  });
};
