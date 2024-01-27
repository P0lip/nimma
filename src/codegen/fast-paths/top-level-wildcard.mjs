// Covers:
// $[*]
// $.*

import * as b from '../ast/builders.mjs';
import { isDeep, isWildcardExpression } from '../guards.mjs';
import generateEmitCall from '../templates/emit-call.mjs';
import scope from '../templates/scope.mjs';

const IS_NOT_ZERO_DEPTH_IF_STATEMENT = b.ifStatement(
  b.binaryExpression('!==', scope.depth, b.numericLiteral(1)),
  b.returnStatement(),
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
      IS_NOT_ZERO_DEPTH_IF_STATEMENT,
      generateEmitCall(ctx.id, ctx.iterator.modifiers),
    ]),
    'tree-method',
  );

  tree.push(b.stringLiteral(ctx.id), 'traverse');

  tree.traversalZones.create()?.resize().attach();

  return true;
};
