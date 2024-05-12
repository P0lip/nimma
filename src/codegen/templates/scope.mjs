import * as b from '../ast/builders.mjs';

const SCOPE_IDENTIFIER = b.identifier('scope');

const PATH = b.memberExpression(SCOPE_IDENTIFIER, b.identifier('path'));
const DEPTH = b.memberExpression(PATH, b.identifier('length'));

export default {
  _: SCOPE_IDENTIFIER,

  allocState: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('allocState')),
  callbacks: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('callbacks')),
  depth: DEPTH,
  destroy: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('destroy')),
  emit: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('emit')),
  fork: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('fork')),
  path: PATH,
  property: b.memberExpression(
    PATH,
    b.binaryExpression('-', DEPTH, b.numericLiteral(1)),
    true,
  ),
  sandbox: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('sandbox')),
  shorthands: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('shorthands')),
  traverse: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('traverse')),
  value: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('value')),
};
