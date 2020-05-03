import * as b from './builders.mjs';
import { SCOPE } from './consts.mjs';
import {
  parseAndStringifyFilterExpression,
  parseFilterExpression,
} from './utils/parseFilterExpression.mjs';

class Feedback {
  constructor() {
    this.ticks = 0;
    this._tick = -1;
    this.descendant = false;
  }

  get tick() {
    return this._tick;
  }

  set tick(value) {
    this._tick = value;
    this.ticks++;
  }
}

function finalize(node) {
  switch (node.type) {
    case 'SequenceExpression':
      node.type = 'BinaryExpression';
      node.operator = '===';
      node.left = SCOPE.PROPERTY;
      node.right = node.expressions[0].right.arguments[0];
      delete node.expressions;

      break;
    case 'LogicalExpression':
      finalize(node.right);

      break;
  }
}

class ESTree {
  constructor() {
    this.root = null;
  }

  addDep(node) {
    if (this.root === null) {
      this.root = node;
      return;
    }

    this.root = b.logicalExpression('&&', this.root, node);
  }

  bail(expression) {
    throw new SyntaxError(`Unsupported syntax: ${expression.type}`);
  }

  finalize() {
    finalize(this.root);
  }
}

export function baseline(ast) {
  const feedback = new Feedback();
  const tree = new ESTree();

  for (let i = 0; i < ast.length; i++) {
    const node = ast[i];
    const { expression, operation, scope } = node;
    if (expression.type === 'root') continue;

    if (scope === 'descendant') {
      feedback.tick = -1;
      feedback.descendant = true;
    }

    feedback.tick++;

    switch (operation) {
      case 'member':
        switch (expression.type) {
          case 'identifier':
            tree.addDep(generatePlainMember(expression.value, scope, feedback));
            break;
          case 'wildcard':
            if (tree.root !== null) {
              tree.addDep(assertNoOOB(SCOPE.PATH, generateTick(feedback)));
            }

            break;
          default:
            throw new Error('Unsupported syntax');
        }

        break;
      case 'subscript':
        switch (expression.type) {
          case 'string_literal':
            tree.addDep(generatePlainMember(expression.value, scope, feedback));
            break;
          case 'filter_expression':
            if (
              feedback.descendant &&
              ast[i - 1].expression.type === 'wildcard'
            ) {
              // urgh.
              feedback.tick = -1;
            }

            if (i + 1 === ast.length) {
              tree.addDep(parseFilterExpression(expression.value.slice(1)));
            } else if (feedback.descendant) {
              tree.bail(expression);
              // body = generateLogicalAndExpression(
              //   body,
              //   generateLogicalAndExpression(
              //     assertNoOOB(PATH_NODE, b.binaryExpression('+', SCOPE_LAST_INDEX_NODE, b.literal(1))),
              //     assignToLastIndex(
              //       b.callExpression(
              //         b.memberExpression(
              //           SCOPE_NODE,
              //           b.identifier('evaluateDeep'),
              //         ),
              //         [
              //           parseAndStringifyFilterExpression(
              //             expression.value.slice(1),
              //           ),
              //           generateTick(tick, descendant),
              //           b.literal(i),
              //         ],
              //       ),
              //     ),
              //   ),
              // );
            } else {
              tree.addDep(
                b.callExpression(SCOPE.EVALUATE, [
                  parseAndStringifyFilterExpression(expression.value.slice(1)),
                  generateTick(feedback),
                  b.literal(i),
                ]),
              );
            }

            break;
          case 'wildcard':
            if (tree.root !== null) {
              tree.addDep(assertNoOOB(SCOPE.PATH, generateTick(feedback)));
            }

            break;
          default:
            tree.bail(expression);
        }

        break;
      default:
        tree.bail(expression);
    }
  }

  tree.finalize();

  if (feedback.tick >= feedback.descendant ? 1 : 0) {
    feedback.tick++;
    tree.addDep(
      b.binaryExpression(
        '===',
        b.memberExpression(SCOPE.PATH, b.identifier('length')),
        generateTick(feedback),
      ),
    );
  }

  if (!feedback.descendant) {
    tree.addDep(
      b.binaryExpression(
        '===',
        b.unaryExpression('void', b.callExpression(SCOPE.DESTROY, [])),
        b.unaryExpression('void', b.literal(0)),
      ),
    );
  }

  return tree.root;
}

function assertNoOOB(arrNode, length) {
  return b.binaryExpression(
    '>',
    b.memberExpression(arrNode, b.identifier('length')),
    length,
  );
}

function generateTick({ tick: value, descendant }) {
  const tick = b.literal(value);

  if (descendant === false) {
    return tick;
  }

  if (value === 0) {
    return SCOPE.LAST_INDEX;
  }

  return b.binaryExpression('+', SCOPE.LAST_INDEX, tick);
}

function generateIdentifier(value, tick) {
  return b.logicalExpression(
    '&&',
    assertNoOOB(SCOPE.PATH, tick),
    b.binaryExpression(
      '===',
      b.memberExpression(SCOPE.PATH, tick, true),
      b.literal(value),
    ),
  );
}

function assignToLastIndex(expr) {
  return b.sequenceExpression([
    b.assignmentExpression('=', SCOPE.LAST_INDEX, expr),
    assertNonNegativeIndex(),
  ]);
}

function generateIndexOf(value) {
  return assignToLastIndex(
    b.callExpression(b.memberExpression(SCOPE.PATH, b.identifier('indexOf')), [
      b.literal(value),
      SCOPE.LAST_INDEX,
    ]),
  );
}

function generatePlainMember(value, scope, feedback) {
  if (scope === 'descendant') {
    return generateIndexOf(value);
  } else {
    return generateIdentifier(value, generateTick(feedback));
  }
}

function assertNonNegativeIndex() {
  return b.binaryExpression(
    '!==',
    SCOPE.LAST_INDEX,
    b.unaryExpression('-', b.literal(1)),
  );
}
