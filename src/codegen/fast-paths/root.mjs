// covers: $

import * as b from '../ast/builders.mjs';
import generateEmitCall from '../templates/emit-call.mjs';

const EMIT_ROOT_CALL_EXPRESSION = generateEmitCall(b.stringLiteral('$'), {
  keyed: false,
  parents: 0,
});

export default (nodes, tree) => {
  if (nodes.length > 0) {
    return false;
  }

  tree.body.push(EMIT_ROOT_CALL_EXPRESSION);
  return true;
};
