import * as b from '../ast/builders.mjs';
import { fnIdentifier } from './fn-params.mjs';
import scope from './scope.mjs';

export default function generateEmitCall({ parents, keyed }) {
  // can emit check
  // todo: add check
  return b.expressionStatement(
    b.callExpression(scope.emit, [
      fnIdentifier,
      b.numericLiteral(parents),
      b.booleanLiteral(keyed),
    ]),
  );
}
