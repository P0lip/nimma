// Covers:
// $[*]
// $.*

import * as b from '../ast/builders.mjs';
import { isDeep, isWildcardExpression } from '../guards.mjs';
import generateEmitCall from '../templates/emit-call.mjs';
import scope from '../templates/scope.mjs';

const BINARY_EXPRESSION = b.binaryExpression(
  '===',
  scope.depth,
  b.numericLiteral(0),
);

export default (nodes, tree, ctx) => {
  if (
    nodes.length !== 1 ||
    !isWildcardExpression(nodes[0]) ||
    isDeep(nodes[0])
  ) {
    return false;
  }

  tree.push(
    b.blockStatement([
      b.ifStatement(
        BINARY_EXPRESSION,
        b.blockStatement([generateEmitCall(ctx.iterator.modifiers)]),
      ),
    ]),
    'tree-method',
  );

  tree.push(b.stringLiteral(ctx.id), 'traverse');

  tree.traversalZones.create()?.resize().attach();

  return true;
};
