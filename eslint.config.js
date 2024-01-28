import babelParser from '@babel/eslint-parser';
import js from '@eslint/js';
import chaiExpect from 'eslint-plugin-chai-expect';
import chaiFriendly from 'eslint-plugin-chai-friendly';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';

export default [
  {
    files: ['**/*.mjs', '**/*.js'],
    ignores: ['src/parser/parser.mjs'],
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
    },
  },
  {
    files: ['src/**/__tests__/*.test.mjs'],
    languageOptions: {
      globals: globals.mocha,
    },
    plugins: {
      'chai-expect': chaiExpect,
      'chai-friendly': chaiFriendly,
    },
    rules: {
      'no-unused-expressions': 0,
      'sort-keys': 'off',
      ...chaiExpect.configs.recommended.rules,
      'chai-friendly/no-unused-expressions': 2,
    },
  },
];
