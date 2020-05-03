import * as b from './builders.mjs';

export const SCOPE_ID = 'scope';

const SCOPE_NODE = b.identifier(SCOPE_ID);
export const SCOPE = {
  DESTROY: b.memberExpression(SCOPE_NODE, b.identifier('destroy')),
  EVALUATE: b.memberExpression(SCOPE_NODE, b.identifier('evaluate')),
  LAST_INDEX: b.memberExpression(SCOPE_NODE, b.identifier('lastIndex')),
  PATH: b.memberExpression(SCOPE_NODE, b.identifier('path')),
  PROPERTY: b.memberExpression(SCOPE_NODE, b.identifier('property')),
};

export const SANDBOX_NODE = b.memberExpression(
  SCOPE_NODE,
  b.identifier('sandbox'),
);
export const SANDBOX = {
  VALUE: b.memberExpression(SANDBOX_NODE, b.identifier('value')),
};
