#!/usr/bin/env sh
cd benchmarks/scripts
mkdir -p ../.gen
export NODE_ENV=production
npx rollup -c ./rollup.config.js
# node ./generate-schema-fixtures.mjs --force="${1:-false}"
node ./compile-nimma.mjs

