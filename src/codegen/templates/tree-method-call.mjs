import * as b from '../ast/builders.mjs';
import fnParams from './fn-params.mjs';
import internalScope from './internal-scope.mjs';

export default function treeMethodCall(id) {
  const property = b.stringLiteral(id);
  return b.expressionStatement(
    b.callExpression(
      b.memberExpression(internalScope.tree, property, true),
      fnParams,
    ),
  );
}
