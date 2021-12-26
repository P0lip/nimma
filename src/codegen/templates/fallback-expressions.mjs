import * as b from '../ast/builders.mjs';
import scope from './scope.mjs';

export default function generateFallbackExpressions(fallback, expressions) {
  const path = b.identifier('path');

  return b.forOfStatement(
    b.variableDeclaration('const', [b.variableDeclarator(path)]),
    b.arrayExpression(expressions.map(b.stringLiteral)),
    b.blockStatement([
      b.callExpression(fallback, [
        b.identifier('input'),
        path,
        b.memberExpression(scope.callbacks, path, true),
      ]),
    ]),
  );
}
