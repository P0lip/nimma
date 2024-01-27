import * as b from '../ast/builders.mjs';
import scope from './scope.mjs';

export default function generateEmitCall(id, { parents, keyed }) {
  return b.expressionStatement(
    b.callExpression(scope.emit, [
      b.stringLiteral(id),
      b.numericLiteral(parents),
      b.booleanLiteral(keyed),
    ]),
  );
}
