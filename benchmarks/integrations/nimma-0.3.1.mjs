import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import Nimma from 'https://unpkg.com/nimma@0.3.1/dist/esm/index.mjs';

async function generateQuery(expressions) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const nimma = new Nimma(expressions);

  const filepath = path.join(__dirname, '../.gen/nimma-0.3.1.mjs');
  await fs.writeFile(
    filepath,
    nimma.sourceCode.replace(
      /nimma\/runtime/g,
      'https://unpkg.com/nimma@0.3.1/dist/esm/runtime/index.mjs',
    ),
  );

  return (await import(filepath)).default;
}

export default async (suite, document, expressions) => {
  const query = await generateQuery(expressions);

  suite.add(
    `Nimma@0.3.1 (no precompiled code)`,
    function (callbacksWithResults) {
      const nimma = new Nimma(expressions);
      nimma.query(document, callbacksWithResults);
    },
    setup,
  );

  suite.add(
    `Nimma@0.3.1 (precompiled code)`,
    function (callbacksWithResults) {
      query(document, callbacksWithResults);
    },
    setup,
  );

  function setup() {
    const results = [];
    return Object.fromEntries(
      expressions.map(p => [
        p,
        r => {
          results.push(r.value);
        },
      ]),
    );
  }
};
