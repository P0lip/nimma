/* eslint-env node */
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const pkg = JSON.parse(
  fs.readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), 'package.json'),
    'utf8',
  ),
);

const BASE_DIR = './dist';

export default [
  {
    external: id =>
      id.startsWith('@babel/runtime') ||
      Object.keys(pkg.dependencies).includes(id) ||
      Object.keys(pkg.optionalDependencies).includes(id),
    input: [
      './src/index.mjs',
      './src/fallbacks/index.mjs',
      './src/runtime/errors/index.mjs',
    ],
    output: [
      {
        dir: path.join(BASE_DIR, './cjs'),
        entryFileNames: '[name].cjs',
        exports: 'named',
        format: 'cjs',
        name: pkg.name,
        preserveModules: true,
      },
      {
        dir: path.join(BASE_DIR, './esm'),
        entryFileNames: '[name].mjs',
        format: 'es',
        name: pkg.name,
        preserveModules: true,
      },
    ],
    plugins: [babel({ babelHelpers: 'bundled' }), commonjs()],
  },
];
