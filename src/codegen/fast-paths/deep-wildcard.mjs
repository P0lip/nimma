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

  tree.addTreeMethod(
    ctx.id,
    b.blockStatement([generateEmitCall(ctx.id, ctx.iterator.modifiers)]),
    'traverse',
  );

  return true;
};
