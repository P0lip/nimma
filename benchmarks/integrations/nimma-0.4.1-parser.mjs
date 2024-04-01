import * as assert from 'node:assert';

import parse from 'https://unpkg.com/nimma@0.4.1/src/parser/index.mjs';

export default async (suite, document, expressions) => {
  suite.add(`Nimma@0.4.1 (parser)`, function () {
    const parsed = new Set();
    for (const expression of expressions) {
      parsed.add(parse(expression));
    }

    assert.ok(parsed.size === expressions.length);
  });
};
