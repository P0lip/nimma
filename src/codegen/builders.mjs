/* eslint-disable sort-keys */

// since our usage is fairly narrow, we don't really need to install extra deps such ast-types or @babel/types.
// the set of builders I've prepared here should be sufficient for our needs

export function literal(value) {
  return {
    type: 'Literal',
    value,
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

export function binaryExpression(operator, left, right) {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
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

export function memberExpression(object, property, computed = false) {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed,
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

export function sequenceExpression(expressions) {
  return {
    type: 'SequenceExpression',
    expressions,
  };
}
