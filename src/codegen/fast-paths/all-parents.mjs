// covers:
// $..

import * as b from '../ast/builders.mjs';
import generateEmitCall from '../templates/emit-call.mjs';
import internalScope from '../templates/internal-scope.mjs';
import sandbox from '../templates/sandbox.mjs';

const IS_OBJECT_IDENTIFIER = b.identifier('isObject');
const IS_OBJECT_CALL_EXPRESSION = b.callExpression(IS_OBJECT_IDENTIFIER, [
  sandbox.value,
]);

const EMIT_ROOT_CALL_EXPRESSION = generateEmitCall({
  keyed: false,
  parents: 0,
});

EMIT_ROOT_CALL_EXPRESSION.expression.arguments[0] = b.memberExpression(
  internalScope.callbacks,
  b.stringLiteral('$..'),
  true,
);

export default (nodes, tree, ctx) => {
  if (nodes.length !== 1 || nodes[0].type !== 'AllParentExpression') {
    return false;
  }

  tree.addRuntimeDependency(IS_OBJECT_IDENTIFIER.name);

  tree.push(
    b.blockStatement([
      b.ifStatement(
        IS_OBJECT_CALL_EXPRESSION,
        generateEmitCall(ctx.iterator.modifiers),
      ),
    ]),
    'tree-method',
  );

  tree.push(b.stringLiteral(ctx.id), 'traverse');
  tree.push(EMIT_ROOT_CALL_EXPRESSION, 'body');

  return true;
};
