import * as b from '../ast/builders.mjs';
import { isDeep, isMemberExpression } from '../guards.mjs';
import generateEmitCall from '../templates/emit-call.mjs';
import sandbox from '../templates/sandbox.mjs';
import scope from '../templates/scope.mjs';

const VALUE_IDENTIFIER = b.identifier('value');
const IS_OBJECT_IDENTIFIER = b.identifier('isObject');

const IS_NOT_OBJECT_IF_STATEMENT = b.ifStatement(
  b.unaryExpression(
    '!',
    b.callExpression(IS_OBJECT_IDENTIFIER, [VALUE_IDENTIFIER]),
  ),
  b.returnStatement(),
);

const IS_NULL_SCOPE_IF_STATEMENT = b.ifStatement(
  b.binaryExpression('===', scope._, b.nullLiteral()),
  b.returnStatement(),
);

function toLiteral(node) {
  return b.literal(node.value);
}

export default (nodes, tree, ctx) => {
  if (!nodes.every(isMemberExpression) || nodes.some(isDeep)) {
    return false;
  }

  const valueVariableDeclaration = b.variableDeclaration('const', [
    b.variableDeclarator(
      VALUE_IDENTIFIER,
      nodes
        .slice(0, -1)
        .reduce(
          (object, node) =>
            b.memberExpression(object, b.literal(node.value), true, true),
          sandbox.root,
        ),
    ),
  ]);

  tree.addRuntimeDependency(IS_OBJECT_IDENTIFIER.name);

  tree.addTreeMethod(
    ctx.id,
    b.blockStatement([
      valueVariableDeclaration,
      IS_NOT_OBJECT_IF_STATEMENT,
      b.expressionStatement(
        b.assignmentExpression(
          '=',
          scope._,
          b.callExpression(scope.fork, [
            b.arrayExpression(nodes.map(toLiteral)),
          ]),
        ),
      ),
      IS_NULL_SCOPE_IF_STATEMENT,
      generateEmitCall(ctx.id, ctx.iterator.modifiers),
    ]),
    0,
  );

  return true;
};
