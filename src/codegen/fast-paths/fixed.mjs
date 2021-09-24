// Examples
// $.info
// $.info.foo
// $.foo.bar.baz
/**
 *  function (scope, fn) {
 *    const value = scope.sandbox.root?.info;
 *    if (isObject(value)) {
 *      fn(scope.fork(['info', 'foo']).emit());
 *    }
 *  }
 */

import * as b from '../ast/builders.mjs';
import { isDeep, isMemberExpression } from '../guards.mjs';
import generateEmitCall from '../templates/emit-call.mjs';
import sandbox from '../templates/sandbox.mjs';
import scope from '../templates/scope.mjs';
import treeMethodCall from '../templates/tree-method-call.mjs';

const VALUE_IDENTIFIER = b.identifier('value');
const IS_OBJECT_IDENTIFIER = b.identifier('isObject');
const GET_IDENTIFIER = b.identifier('get');

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
      nodes.slice(0, -1).reduce(
        (object, node) => {
          if (tree.format === 'ES2018') {
            object.arguments[1].elements.push(b.literal(node.value));
            return object;
          }

          return b.memberExpression(object, b.literal(node.value), true, true);
        },
        tree.format === 'ES2018' && nodes.length > 0
          ? b.callExpression(b.identifier('get'), [
              sandbox.root,
              b.arrayExpression([]),
            ])
          : sandbox.root,
      ),
    ),
  ]);

  tree.addRuntimeDependency(IS_OBJECT_IDENTIFIER.name);

  if (tree.format === 'ES2018') {
    tree.addRuntimeDependency(GET_IDENTIFIER.name);
  }

  tree.pushAll([
    [
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
      'tree-method',
    ],
    [treeMethodCall(ctx.id), 'body'],
  ]);

  return true;
};
