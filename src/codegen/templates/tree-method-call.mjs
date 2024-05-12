import * as b from '../ast/builders.mjs';
import internalScope from './internal-scope.mjs';
import scope from './scope.mjs';

export function generateTreeMethodCall(id, state, needsShorthand) {
  const params =
    state === null ? [scope._] : [scope._, state.declarations[0].id];

  if (needsShorthand) {
    params.push(internalScope.shorthands);
  }

  return b.expressionStatement(
    b.callExpression(b.memberExpression(internalScope.tree, id, true), params),
  );
}
