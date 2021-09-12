import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import Nimma from '../../dist/esm/index.mjs';
import scenarios from '../scenarios.mjs';
import expressionToFilePath from './utils/expression-to-file-path.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, '../.gen/nimma');

function printCode(code) {
  return code.replace(/nimma\/([a-z]+)/, '../../../../dist/esm/$1/index.mjs');
}

for (const { expressions, filepath } of scenarios) {
  const { sourceCode } = new Nimma(expressions);

  const actualDist = path.join(
    dist,
    path.basename(filepath, path.extname(filepath)),
  );

  await fs.promises.mkdir(actualDist, { recursive: true });

  await fs.promises.writeFile(
    path.join(actualDist, `${expressionToFilePath(expressions.join('-'))}.mjs`),
    printCode(sourceCode),
  );

  for (const expression of expressions) {
    const { sourceCode } = new Nimma([expression]);
    await fs.promises.writeFile(
      path.join(actualDist, `${expressionToFilePath(expression)}.mjs`),
      printCode(sourceCode),
    );
  }
}
