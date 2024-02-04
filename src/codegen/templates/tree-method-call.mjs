import * as b from '../ast/builders.mjs';
import { statelessFnParams } from './fn-params.mjs';
import internalScope from './internal-scope.mjs';
import scope from './scope.mjs';

export function generateTreeMethodCall(id) {
  return b.expressionStatement(
    b.callExpression(
      b.memberExpression(internalScope.tree, id, true),
      statelessFnParams,
    ),
  );
}

export function generateStatefulTreeMethodCall(id, state) {
  return b.expressionStatement(
    b.callExpression(b.memberExpression(internalScope.tree, id, true), [
      scope._,
      state.declarations[0].id,
    ]),
  );
}
