import * as b from '../ast/builders.mjs';
import fnParams from './fn-params.mjs';

export default function treeMethodCall(id) {
  const property = b.stringLiteral(id);
  return b.expressionStatement(
    b.callExpression(
      b.memberExpression(b.identifier('_tree'), property, true),
      fnParams,
    ),
  );
}
