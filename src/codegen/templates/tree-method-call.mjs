import * as b from '../ast/builders.mjs';
import internalScope from './internal-scope.mjs';

export default function treeMethodCall(id, params) {
  const property = b.stringLiteral(id);
  return b.expressionStatement(
    b.callExpression(
      b.memberExpression(internalScope.tree, property, true),
      params,
    ),
  );
}
