import babelParser from '@babel/eslint-parser';
import js from '@eslint/js';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  {
    files: ['**/*.mjs', '**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      parser: babelParser,
      sourceType: 'module',
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...js.configs.recommended.rules,
      'padding-line-between-statements': [
        'error',
        { blankLine: 'never', prev: '*', next: 'case' },
        { blankLine: 'never', prev: '*', next: 'default' },
        { blankLine: 'always', prev: 'block-like', next: 'break' },
      ],
      'simple-import-sort/imports': 'error',
      'sort-keys': 'error',
    },
  },
  {
    files: ['src/**/__tests__/*.test.mjs'],
    rules: {
      'no-unused-expressions': 0,
      'sort-keys': 'off',
    },
  },
];
