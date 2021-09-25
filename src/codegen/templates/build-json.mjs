import * as b from '../ast/builders.mjs';

export default function buildJson(input) {
  switch (typeof input) {
    case 'boolean':
      return b.booleanLiteral(input);
    case 'string':
      return b.stringLiteral(input);
    case 'number':
      return b.numericLiteral(input);
    case 'object':
      if (input === null) {
        return b.nullLiteral();
      }

      if (Array.isArray(input)) {
        return b.arrayExpression(input.map(buildJson));
      }

      return b.objectExpression(
        Object.keys(input).map(key =>
          b.objectProperty(b.stringLiteral(key), buildJson(input[key])),
        ),
      );
  }
}
