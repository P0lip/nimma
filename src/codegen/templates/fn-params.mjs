import * as b from '../ast/builders.mjs';
import scope from './scope.mjs';

export const fnIdentifier = b.identifier('fn');

// scope, fn
export default [scope._, fnIdentifier];
