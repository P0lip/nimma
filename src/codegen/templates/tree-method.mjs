import * as b from '../ast/builders.mjs';
import {
  NEEDS_SHORTHANDS,
  NEEDS_STATE,
  NEEDS_TRAVERSAL,
} from '../tree/consts.mjs';
import internalScope from './internal-scope.mjs';
import scope from './scope.mjs';
import state from './state.mjs';

const PARAMS = {
  [0]: [scope._],
  [NEEDS_TRAVERSAL]: [scope._],
  [NEEDS_TRAVERSAL | NEEDS_STATE]: [scope._, state._],
  [NEEDS_TRAVERSAL | NEEDS_SHORTHANDS]: [scope._, internalScope.shorthands],
  [NEEDS_TRAVERSAL | NEEDS_STATE | NEEDS_SHORTHANDS]: [
    scope._,
    state._,
    internalScope.shorthands,
  ],
};

export default function generateTreeMethod(id, branch, feedback) {
  return b.objectMethod('method', id, PARAMS[feedback], branch);
}
