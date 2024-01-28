import Iterator from '../../codegen/iterator.mjs';
import parse from '../../parser/index.mjs';

function pickException([, ex]) {
  return ex;
}

function pickExpression([expression]) {
  return expression;
}

export default function parseExpressions(expressions, unsafe) {
  const mappedExpressions = [];
  const erroredExpressions = [];

  for (const expression of new Set(expressions)) {
    try {
      const parsed = parse(expression);
      if (unsafe === false && Iterator.analyze(parsed).bailed) {
        throw SyntaxError('Unsafe expressions are ignored');
      }

      mappedExpressions.push([expression, parsed]);
    } catch (e) {
      erroredExpressions.push([expression, e]);
    }
  }

  if (erroredExpressions.length > 0) {
    throw new AggregateError(
      erroredExpressions.map(pickException),
      `Error parsing ${erroredExpressions.map(pickExpression).join(', ')}`,
    );
  }

  return mappedExpressions;
}
