#!/usr/bin/env sh
cd $(dirname $0)
mkdir -p ../.gen
node --no-warnings --experimental-network-imports --import 'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register(pathToFileURL("../utils/hook.mjs"));' ../benchmark.mjs --scenario="$1" --document="$2"

