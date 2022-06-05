import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import scenarios from '../scenarios.mjs';
import expressionToFilePath from './utils/expression-to-file-path.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, '../.gen/suites');

function getIntro(filepath, expressions) {
  const filename = path.basename(filepath, path.extname(filepath));
  return `import * as fs from 'node:fs';

import precompiledNimma from '../../nimma/${filename}/${expressionToFilePath(
    expressions.join('-'),
  )}.mjs';

const JSON_PATHS = ${JSON.stringify(expressions)};

const DOCUMENT = JSON.parse(
  await fs.promises.readFile('${path.join(
    __dirname,
    '../.gen/documents/',
    `${filename}.json`,
  )}', 'utf8'),
);`;
}

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
);

const external = [
  /^node:/,
  ...Object.keys({
    ...pkg.dependencies,
    ...pkg.optionalDependencies,
    ...pkg.devDependencies,
  }),
];

export default scenarios.flatMap(scenario => {
  const dir = path.join(
    dist,
    scenario.name ??
      path.basename(scenario.filepath, path.extname(scenario.filepath)),
  );

  return [
    {
      external,
      input: path.join(__dirname, '../benchmark-template.mjs'),
      output: {
        dir,
        entryFileNames: 'all.mjs',
        format: 'es',
        intro: getIntro(scenario.filepath, scenario.expressions),
      },
      treeshake: false,
    },

    ...scenario.expressions.map((expression, i) => ({
      external,
      input: path.join(__dirname, '../benchmark-template.mjs'),
      output: {
        dir,
        entryFileNames: `${i}.mjs`,
        format: 'es',
        intro: getIntro(scenario.filepath, [expression]),
      },
      treeshake: false,
    })),
  ];
});
