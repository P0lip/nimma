import parse from '../../parser/index.mjs';

function pickException([, ex]) {
  return ex;
}

function pickExpression([expression]) {
  return expression;
}

export default function parseExpressions(expressions) {
  const mappedExpressions = [];
  const erroredExpressions = [];

  for (const expression of new Set(expressions)) {
    try {
      const parsed = parse(expression);
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
