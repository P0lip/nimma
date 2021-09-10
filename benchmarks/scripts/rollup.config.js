import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import scenarios from '../scenarios.mjs';

function sanitizeExpression(expr) {
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, '../.gen');

function getIntro(filepath, expressions) {
  return `import * as fs from 'node:fs';
import precompiledNimma from './${sanitizeExpression(
    expressions.join('-'),
  )}.mjs';

const JSON_PATHS = ${JSON.stringify(expressions)};
const DOCUMENT = JSON.parse(
  await fs.promises.readFile('${path.join(__dirname, '..', filepath)}', 'utf8'),
);`;
}

export default scenarios.flatMap(scenario => [
  {
    input: path.join(__dirname, '../benchmark-template.mjs'),
    output: {
      dir: path.join(
        dist,
        path.basename(scenario.filepath, path.extname(scenario.filepath)),
      ),
      entryFileNames: 'all.mjs',
      format: 'es',
      intro: getIntro(scenario.filepath, scenario.expressions),
    },
    treeshake: false,
  },

  ...scenario.expressions.map((expression, i) => ({
    input: path.join(__dirname, '../benchmark-template.mjs'),
    output: {
      dir: path.join(
        dist,
        path.basename(scenario.filepath, path.extname(scenario.filepath)),
      ),
      entryFileNames: `${i}.mjs`,
      format: 'es',
      intro: getIntro(scenario.filepath, [expression]),
    },
    treeshake: false,
  })),
]);
