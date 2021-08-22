// covers:
// $..test
// $..script

import * as b from '../ast/builders.mjs';
import { isDeep, isMemberExpression } from '../guards.mjs';
import scope from '../templates/scope.mjs';
import generateEmitCall from '../templates/emit-call.mjs';

export default (nodes, tree, ctx) => {
  if (
    nodes.length !== 1 ||
    !isDeep(nodes[0]) ||
    !isMemberExpression(nodes[0])
  ) {
    return false;
  }

  tree.push(
    b.blockStatement([
      b.ifStatement(
        b.binaryExpression(
          '===',
          scope.property,
          b.stringLiteral(nodes[0].value),
        ),
        b.blockStatement([generateEmitCall(ctx.iterator.modifiers)]),
      ),
    ]),
    'tree-method',
  );

  tree.push(b.stringLiteral(ctx.id), 'traverse');

  return true;
};
