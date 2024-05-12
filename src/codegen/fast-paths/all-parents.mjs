// covers:
// $..

import * as b from '../ast/builders.mjs';
import generateEmitCall from '../templates/emit-call.mjs';
import sandbox from '../templates/sandbox.mjs';
import { NEEDS_TRAVERSAL } from '../tree/consts.mjs';

const IS_OBJECT_IDENTIFIER = b.identifier('isObject');
const IS_NOT_OBJECT_IF_STATEMENT = b.ifStatement(
  b.unaryExpression(
    '!',
    b.callExpression(IS_OBJECT_IDENTIFIER, [sandbox.value]),
  ),
  b.returnStatement(),
);

const EMIT_ROOT_CALL_EXPRESSION = generateEmitCall(b.stringLiteral('$..'), {
  keyed: false,
  parents: 0,
});

export default (nodes, tree, ctx) => {
  if (nodes.length !== 1 || nodes[0].type !== 'AllParentExpression') {
    return false;
  }

  tree.addRuntimeDependency(IS_OBJECT_IDENTIFIER.name);

  tree.addTreeMethod(
    ctx.id,
    b.blockStatement([
      IS_NOT_OBJECT_IF_STATEMENT,
      generateEmitCall(ctx.id, ctx.iterator.modifiers),
    ]),
    NEEDS_TRAVERSAL,
  );

  tree.body.push(EMIT_ROOT_CALL_EXPRESSION);

  return true;
};
