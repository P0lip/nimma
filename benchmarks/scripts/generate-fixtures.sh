#!/usr/bin/env sh
cd benchmarks/scripts
mkdir -p ../.gen
export NODE_ENV=production
npx rollup -c ./rollup.config.js
node ./generate-schema-fixtures.mjs
node ./compile-nimma.mjs

