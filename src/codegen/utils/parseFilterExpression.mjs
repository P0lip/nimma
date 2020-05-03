import jsep from 'jsep';
import astring from 'astring';

import * as b from '../builders.mjs';
import { SANDBOX_NODE, SANDBOX } from '../consts.mjs';

jsep.addUnaryOp('@');
jsep.addUnaryOp('@.');

export function parseFilterExpression(expr) {
  return process(jsep(expr));
}

export function parseAndStringifyFilterExpression(expr) {
  return b.literal(astring.generate(b.returnStatement(process(jsep(expr)))));
}

function process(node) {
  switch (node.type) {
    case 'LogicalExpression':
    case 'BinaryExpression':
      node.left = process(node.left);
      node.right = process(node.right);
      break;
    case 'UnaryExpression':
      if (node.operator === '@') {
        return processJsonPathPlusAddition(node);
      }

      if (node.operator === '@.') {
        return b.memberExpression(SANDBOX.VALUE, node.argument);
      }

      break;
    case 'MemberExpression':
      node.object = process(node.object);
      node.property = process(node.property);
      break;
    case 'Identifier':
      throw new ReferenceError(`'${node.name}' is not defined`);
  }

  return node;
}

function processJsonPathPlusAddition(node) {
  if (node.argument.type === 'CallExpression') {
    switch (node.argument.callee.type) {
      case 'Literal':
        return b.binaryExpression(
          '===',
          SANDBOX.VALUE,
          b.identifier(node.argument.callee.raw),
        );
      case 'Identifier':
        switch (node.argument.callee.name) {
          case 'string':
          case 'number':
          case 'boolean':
            return b.binaryExpression(
              '===',
              b.unaryExpression('typeof', SANDBOX.VALUE),
              b.literal(node.argument.callee.name),
            );
          case 'array':
            return b.callExpression(
              b.memberExpression(
                b.identifier('Array'),
                b.identifier('isArray'),
              ),
              [SANDBOX.VALUE],
            );
          case 'object':
            return b.logicalExpression(
              '&&',
              b.binaryExpression('!==', SANDBOX.VALUE, b.identifier('null')),
              b.binaryExpression(
                '===',
                b.unaryExpression('typeof', SANDBOX.VALUE),
                b.literal('object'),
              ),
            );
          case 'integer':
            return b.callExpression(
              b.memberExpression(
                b.identifier('Number'),
                b.identifier('isInteger'),
              ),
              [SANDBOX.VALUE],
            );
          default:
            throw new SyntaxError(
              `Unsupported shorthand '@${node.argument.callee.name}()'`,
            );
        }
    }
  }

  return b.memberExpression(SANDBOX_NODE, node.argument);
}
