// covers: $

import * as b from '../ast/builders.mjs';
import generateEmitCall from '../templates/emit-call.mjs';

const EMIT_ROOT_CALL_EXPRESSION = generateEmitCall({
  keyed: false,
  parents: 0,
});

EMIT_ROOT_CALL_EXPRESSION.expression.arguments[0] = b.memberExpression(
  b.identifier('_callbacks'),
  b.identifier('$'),
);

export default (nodes, tree) => {
  if (nodes.length > 0) {
    return false;
  }

  tree.push(EMIT_ROOT_CALL_EXPRESSION, 'body');
  return true;
};
