import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import Nimma from '../../dist/esm/index.mjs';
import scenarios from '../scenarios.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, '../.gen');

function printCode(code) {
  return code.replace(/nimma\/([a-z]+)/, '../../../dist/esm/$1/index.mjs');
}

export function sanitizeExpression(expr) {
  return expr
    .replaceAll('$', '')
    .replaceAll('*', '-wildcard-')
    .replaceAll('.', '-dot-')
    .replaceAll('[', '-left-bracket-')
    .replaceAll(']', '-right-bracket-')
    .replaceAll('(', '-left-parenthesis-')
    .replaceAll('(', '-right-parenthesis-')
    .replaceAll('?', '-question-mark-')
    .replace(/[^A-Za-z0-9\s-]/g, '')
    .slice(0, 30);
}

for (const { expressions, filepath } of scenarios) {
  const { sourceCode } = new Nimma(expressions);

  const actualDist = path.join(
    dist,
    path.basename(filepath, path.extname(filepath)),
  );

  await fs.promises.writeFile(
    path.join(actualDist, `${sanitizeExpression(expressions.join('-'))}.mjs`),
    printCode(sourceCode),
  );

  for (const expression of expressions) {
    const { sourceCode } = new Nimma([expression]);
    await fs.promises.writeFile(
      path.join(actualDist, `${sanitizeExpression(expression)}.mjs`),
      printCode(sourceCode),
    );
  }
}
