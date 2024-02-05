/* eslint-disable sort-keys */

// since our usage is fairly narrow, we don't really need to install extra deps such ast-types or @babel/types.
// the set of builders I've prepared here should be sufficient for our needs

export function program(body) {
  return {
    type: 'Program',
    body,
  };
}

export function blockStatement(body, directives) {
  return {
    type: 'BlockStatement',
    body,
    directives,
  };
}

export function expressionStatement(expression) {
  return {
    type: 'ExpressionStatement',
    expression,
  };
}

export function literal(value) {
  return typeof value === 'number'
    ? numericLiteral(value)
    : stringLiteral(value);
}

export function stringLiteral(value) {
  return {
    type: 'StringLiteral',
    value,
  };
}

export function booleanLiteral(value) {
  return {
    type: 'BooleanLiteral',
    value,
  };
}

export function numericLiteral(value) {
  return {
    type: 'NumericLiteral',
    value,
  };
}

export function nullLiteral() {
  return {
    type: 'NullLiteral',
    value: null,
  };
}

export function regExpLiteral(pattern, flags = '') {
  return {
    type: 'RegExpLiteral',
    pattern,
    flags,
  };
}

export function identifier(name) {
  return {
    type: 'Identifier',
    name,
  };
}

export function logicalExpression(operator, left, right) {
  return {
    type: 'LogicalExpression',
    operator,
    left,
    right,
  };
}

export function ifStatement(test, consequent, alternate) {
  return {
    type: 'IfStatement',
    test,
    consequent,
    alternate,
  };
}

export function binaryExpression(operator, left, right) {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
  };
}

export function safeBinaryExpression(operator, left, right) {
  let actualRight = right;

  if (
    right.type === 'NumericLiteral' ||
    (right.type === 'StringLiteral' &&
      Number.isSafeInteger(Number(right.value)))
  ) {
    actualRight = stringLiteral(String(right.value));
  }

  return {
    type: 'BinaryExpression',
    operator,
    left:
      actualRight === right
        ? left
        : callExpression(identifier('String'), [left]),
    right: actualRight,
  };
}

export function unaryExpression(operator, argument, prefix = true) {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix,
  };
}

export function memberExpression(
  object,
  property,
  computed = false,
  optional = null,
) {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed,
    optional,
  };
}

export function assignmentExpression(operator, left, right) {
  return {
    type: 'AssignmentExpression',
    operator,
    left,
    right,
  };
}

export function callExpression(callee, _arguments) {
  return {
    type: 'CallExpression',
    callee,
    arguments: _arguments,
  };
}

export function functionDeclaration(id, params, body) {
  return {
    type: 'FunctionDeclaration',
    id,
    params,
    body,
  };
}

export function returnStatement(argument) {
  return {
    type: 'ReturnStatement',
    argument,
  };
}

export function arrayExpression(elements) {
  return {
    type: 'ArrayExpression',
    elements,
  };
}

export function objectExpression(properties) {
  return {
    type: 'ObjectExpression',
    properties,
  };
}

export function objectMethod(
  kind,
  key,
  params,
  body,
  computed = false,
  generator = false,
  _async = false,
) {
  return {
    type: 'ObjectMethod',
    kind,
    key,
    params,
    body,
    computed,
    generator,
    async: _async,
  };
}

export function objectProperty(
  key,
  value,
  computed = false,
  shorthand = false,
  decorators = null,
) {
  return {
    type: 'ObjectProperty',
    key,
    value,
    computed,
    shorthand,
    decorators,
  };
}

export function variableDeclaration(kind, declarations) {
  return {
    type: 'VariableDeclaration',
    kind,
    declarations,
  };
}

export function variableDeclarator(id, init) {
  return {
    type: 'VariableDeclarator',
    id,
    init,
  };
}

export function newExpression(callee, _arguments) {
  return {
    type: 'NewExpression',
    callee,
    arguments: _arguments,
  };
}

export function importDeclaration(specifiers, source) {
  return {
    type: 'ImportDeclaration',
    specifiers,
    source,
  };
}

export function importSpecifier(local, imported) {
  return {
    type: 'ImportSpecifier',
    local,
    imported,
  };
}

export function exportDefaultDeclaration(declaration) {
  return {
    type: 'ExportDefaultDeclaration',
    declaration,
  };
}

export function arrowFunctionExpression(params, body, _async = false) {
  return {
    type: 'ArrowFunctionExpression',
    params,
    body,
    async: _async,
  };
}

export function tryStatement(block, handler = null, finalizer = null) {
  return {
    type: 'TryStatement',
    block,
    handler,
    finalizer,
  };
}
