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
import { fnIdentifier } from '../templates/fn-params.mjs';
import sandbox from '../templates/sandbox.mjs';
import scope from '../templates/scope.mjs';
import treeMethodCall from '../templates/tree-method-call.mjs';

const VALUE_IDENTIFIER = b.identifier('value');
const IS_OBJECT_IDENTIFIER = b.identifier('isObject');
const GET_IDENTIFIER = b.identifier('get');

const IS_OBJECT_CALL_EXPRESSION = b.callExpression(IS_OBJECT_IDENTIFIER, [
  VALUE_IDENTIFIER,
]);

const DUMP_SCOPE_OBJECT_EXPRESSION = b.variableDeclaration('const', [
  b.variableDeclarator(
    b.identifier('emptyScope'),
    b.objectExpression([
      b.objectMethod('method', scope.emit.property, [], b.blockStatement([])),
    ]),
  ),
]);

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

  const emitCall = b.memberExpression(
    b.callExpression(scope.fork, [b.arrayExpression(nodes.map(toLiteral))]),
    scope.emit.property,
    false,
    true,
  );

  if (tree.format === 'ES2018') {
    tree.addRuntimeDependency(GET_IDENTIFIER.name);
    tree.push(DUMP_SCOPE_OBJECT_EXPRESSION, 'program');
    emitCall.optional = false;
    emitCall.object = b.logicalExpression(
      '||',
      emitCall.object,
      DUMP_SCOPE_OBJECT_EXPRESSION.declarations[0].id,
    );
  }

  tree.pushAll([
    [
      b.blockStatement([
        valueVariableDeclaration,
        b.ifStatement(
          IS_OBJECT_CALL_EXPRESSION,
          b.blockStatement([
            b.expressionStatement(
              b.callExpression(emitCall, [
                fnIdentifier,
                b.numericLiteral(ctx.iterator.modifiers.parents),
                b.booleanLiteral(ctx.iterator.modifiers.keyed),
              ]),
            ),
          ]),
        ),
      ]),
      'tree-method',
    ],
    [treeMethodCall(ctx.id), 'body'],
  ]);

  return true;
};
