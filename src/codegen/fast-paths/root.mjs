// covers: $

import * as b from '../ast/builders.mjs';
import generateEmitCall from '../templates/emit-call.mjs';

const emitCall = generateEmitCall({
  keyed: false,
  parents: 0,
});

emitCall.expression.arguments[0] = b.memberExpression(
  b.identifier('_callbacks'),
  b.identifier('$'),
);

export default (nodes, tree) => {
  if (nodes.length > 0) {
    return false;
  }

  tree.push(emitCall, 'body');
  return true;
};
