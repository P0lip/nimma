/* eslint-env node */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const pkg = JSON.parse(
  fs.readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), 'package.json'),
    'utf8',
  ),
);

const BASE_DIR = '.';

export default [
  {
    external: Object.keys(pkg.dependencies),
    input: Object.values(pkg.exports).map(entry => entry.import),
    output: [
      {
        dir: path.join(BASE_DIR, './cjs'),
        entryFileNames: '[name].cjs',
        exports: 'named',
        format: 'cjs',
        name: pkg.name,
        preserveModules: true,
      },
    ],
  },
];
