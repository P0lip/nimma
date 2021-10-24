#!/usr/bin/env sh
cd $(dirname $0)
mkdir -p ../.gen
export NODE_ENV=production
npx rollup -c ./rollup.config.js
node ./generate-schema-fixtures.mjs
node ./compile-nimma.mjs

