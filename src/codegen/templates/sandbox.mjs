import * as b from '../ast/builders.mjs';
import scope from './scope.mjs';

export default {
  at: b.memberExpression(scope.sandbox, b.identifier('at')),
  index: b.memberExpression(scope.sandbox, b.identifier('index')),
  parent: b.memberExpression(scope.sandbox, b.identifier('parent')),
  parentProperty: b.memberExpression(
    scope.sandbox,
    b.identifier('parentProperty'),
  ),
  parentValue: b.memberExpression(scope.sandbox, b.identifier('parentValue')),
  path: b.memberExpression(scope.sandbox, b.identifier('path')),
  property: b.memberExpression(scope.sandbox, b.identifier('property')),
  root: b.memberExpression(scope.sandbox, b.identifier('root')),
  value: b.memberExpression(scope.sandbox, b.identifier('value')),
};
