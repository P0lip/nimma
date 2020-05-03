import astring from 'astring';

import { baseline } from './baseline.mjs';
import * as b from './builders.mjs';
import { SCOPE_ID } from './consts.mjs';
import Parser from '../parser/parser.mjs';

const cache = new Map([
  ['$', 'return scope.path.length === 0'],
  ['$..*', 'return true'],
]);

export function generate(path) {
  const cachedValue = cache.get(path);
  if (cachedValue !== void 0) {
    return cachedValue === null ? cachedValue : constructFn(cachedValue);
  }

  try {
    const parser = new Parser();
    const code = baseline(parser.parse(path));
    const body = astring.generate(generateBody(code));
    cache.set(path, body);
    return constructFn(body);
  } catch (ex) {
    cache.set(path, null);
    return null;
  }
}

function generateBody(body) {
  return b.returnStatement(body);
}

export function constructFn(body) {
  return Function(SCOPE_ID, body);
}
