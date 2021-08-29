import * as b from '../ast/builders.mjs';

export default function toObjectLiteral(input) {
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
        return b.arrayExpression(input.map(toObjectLiteral));
      }

      return b.objectExpression(
        Object.keys(input).map(key =>
          b.objectProperty(b.stringLiteral(key), toObjectLiteral(input[key])),
        ),
      );
  }
}
