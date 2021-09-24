import * as b from '../ast/builders.mjs';

const SCOPE_IDENTIFIER = b.identifier('scope');

export default {
  _: SCOPE_IDENTIFIER,

  bail: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('bail')),
  callbacks: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('callbacks')),
  depth: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('depth')),
  destroy: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('destroy')),
  emit: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('emit')),
  fork: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('fork')),
  path: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('path')),
  property: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('property')),
  registerTree: b.memberExpression(
    SCOPE_IDENTIFIER,
    b.identifier('registerTree'),
  ),
  sandbox: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('sandbox')),
  traverse: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('traverse')),
  value: b.memberExpression(SCOPE_IDENTIFIER, b.identifier('value')),
};
