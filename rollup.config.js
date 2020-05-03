import pkg from './package.json';

export default [
  {
    input: './src/index.mjs',
    output: {
      exports: 'named',
      file: './dist/index.cjs',
      format: 'cjs',
      name: pkg.name,
    },
  },
  {
    input: './src/index.mjs',
    output: {
      file: './dist/index.mjs',
      format: 'es',
      name: pkg.name,
    },
  },
];
