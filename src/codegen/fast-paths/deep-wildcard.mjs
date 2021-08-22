// covers:
// $..[*]
// $..*

import * as b from '../ast/builders.mjs';
import { isDeep, isWildcardExpression } from '../guards.mjs';
import generateEmitCall from '../templates/emit-call.mjs';

export default (nodes, tree, ctx) => {
  if (
    nodes.length !== 1 ||
    !isWildcardExpression(nodes[0]) ||
    !isDeep(nodes[0])
  ) {
    return false;
  }

  tree.push(
    b.blockStatement([generateEmitCall(ctx.iterator.modifiers)]),
    'tree-method',
  );

  tree.push(b.stringLiteral(ctx.id), 'traverse');

  return true;
};
