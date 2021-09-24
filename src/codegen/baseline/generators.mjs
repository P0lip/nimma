import jsep from '../../parser/jsep/index.mjs';
import * as b from '../ast/builders.mjs';
import internalScope from '../templates/internal-scope.mjs';
import sandbox from '../templates/sandbox.mjs';
import scope from '../templates/scope.mjs';

export function generateMemberExpression(iterator, { deep, value }) {
  if (iterator.feedback.bailed) {
    return b.binaryExpression('!==', scope.property, b.literal(value));
  }

  if (iterator.state.inverted) {
    return b.binaryExpression(
      '!==',
      iterator.state.pos === 0
        ? scope.property
        : b.memberExpression(
            scope.path,
            b.binaryExpression(
              '-',
              scope.depth,
              b.numericLiteral(Math.abs(iterator.state.pos)),
            ),
            true,
          ),
      b.literal(value),
    );
  }

  if (deep) {
    const isLastNode =
      iterator.nextNode === null || iterator.nextNode === 'KeyExpression';

    const right = b.sequenceExpression([
      b.assignmentExpression(
        '=',
        internalScope.pos,
        isLastNode
          ? b.conditionalExpression(
              b.binaryExpression('!==', scope.property, b.literal(value)),
              b.numericLiteral(-1),
              scope.depth,
            )
          : b.callExpression(
              b.memberExpression(scope.path, b.identifier('indexOf')),
              [
                b.literal(value),
                iterator.state.pos === 0
                  ? internalScope.pos
                  : b.binaryExpression(
                      '+',
                      internalScope.pos,
                      b.numericLiteral(1),
                    ),
              ],
            ),
      ),
      b.binaryExpression('===', internalScope.pos, b.numericLiteral(-1)),
    ]);

    if (isLastNode) {
      return b.logicalExpression(
        '||',
        b.binaryExpression(
          '<',
          scope.depth,
          iterator.state.pos === 0
            ? internalScope.pos
            : b.binaryExpression(
                '+',
                internalScope.pos,
                b.numericLiteral(iterator.state.pos),
              ),
        ),
        right,
      );
    }

    return right;
  }

  let left;

  if (!iterator.feedback.fixed && iterator.state.absolutePos !== 0) {
    left = b.binaryExpression(
      '<',
      scope.depth,
      iterator.state.pos === 0
        ? internalScope.pos
        : b.binaryExpression(
            '+',
            internalScope.pos,
            b.numericLiteral(iterator.state.pos),
          ),
    );
  }

  const right = b.binaryExpression(
    '!==',
    b.memberExpression(
      scope.path,
      iterator.state.pos === 0
        ? b.numericLiteral(0)
        : iterator.feedback.fixed
        ? b.numericLiteral(iterator.state.pos)
        : b.binaryExpression(
            '+',
            internalScope.pos,
            b.numericLiteral(iterator.state.pos),
          ),
      true,
    ),
    b.literal(value),
  );

  return left !== void 0 ? b.logicalExpression('||', left, right) : right;
}

export function generateMultipleMemberExpression(iterator, node) {
  return node.value.slice(1).reduce(
    (concat, member) =>
      b.logicalExpression(
        '&&',
        concat,
        generateMemberExpression(iterator, {
          type: 'MemberExpression',
          value: member,
          // eslint-disable-next-line sort-keys
          deep: node.deep,
        }),
      ),
    generateMemberExpression(iterator, {
      type: 'MemberExpression',
      value: node.value[0],
      // eslint-disable-next-line sort-keys
      deep: node.deep,
    }),
  );
}

const IN_BOUNDS_IDENTIFIER = b.identifier('inBounds');

export function generateSliceExpression(iterator, node, tree) {
  const member = iterator.state.inverted
    ? b.binaryExpression('-', scope.depth, b.numericLiteral(iterator.state.pos))
    : iterator.state.pos === 0
    ? b.numericLiteral(0)
    : iterator.feedback.fixed
    ? b.numericLiteral(iterator.state.pos)
    : b.binaryExpression(
        '+',
        internalScope.pos,
        b.numericLiteral(iterator.state.pos),
      );

  const path = iterator.feedback.bailed
    ? scope.property
    : b.memberExpression(scope.path, member, true);

  const isNumberBinaryExpression = b.binaryExpression(
    '!==',
    b.unaryExpression('typeof', path),
    b.stringLiteral('number'),
  );

  const hasNegativeIndex = node.value.some(
    value => Number.isFinite(value) && value < 0,
  );

  if (hasNegativeIndex) {
    tree.addRuntimeDependency(IN_BOUNDS_IDENTIFIER.name);
    return b.binaryExpression(
      '||',
      isNumberBinaryExpression,
      b.unaryExpression(
        '!',
        b.callExpression(IN_BOUNDS_IDENTIFIER, [
          iterator.state.absolutePos === 0
            ? sandbox.parentValue
            : remapSandbox(sandbox.value, iterator.state.absolutePos),
          b.memberExpression(
            scope.path,
            iterator.feedback.bailed
              ? b.binaryExpression(
                  '-',
                  b.memberExpression(scope.path, b.identifier('length')),
                  b.numericLiteral(1),
                )
              : member,
            true,
          ),
          ...node.value.map(value => b.numericLiteral(value)),
        ]),
      ),
    );
  }

  return node.value.reduce((merged, value, i) => {
    if (i === 0 && value === 0) {
      return merged;
    }

    if (i === 1 && !Number.isFinite(value)) {
      return merged;
    }

    if (i === 2 && value === 1) {
      return merged;
    }

    const operator = i === 0 ? '<' : i === 1 ? '>=' : '%';

    const expression = b.binaryExpression(
      operator,
      path,
      b.numericLiteral(Number(value)),
    );

    return b.logicalExpression(
      '||',
      merged,
      operator === '%'
        ? b.logicalExpression(
            '&&',
            b.binaryExpression('!==', path, b.numericLiteral(node.value[0])),
            b.binaryExpression(
              '!==',
              expression,
              b.numericLiteral(node.value[0]),
            ),
          )
        : expression,
    );
  }, isNumberBinaryExpression);
}

export function generateWildcardExpression(iterator) {
  if (iterator.feedback.bailed) {
    return b.booleanLiteral(false);
  } else if (iterator.nextNode === null && !iterator.feedback.fixed) {
    return b.sequenceExpression([
      b.assignmentExpression(
        '=',
        internalScope.pos,
        b.conditionalExpression(
          b.binaryExpression(
            '<',
            scope.depth,
            b.numericLiteral(iterator.state.pos),
          ),
          b.numericLiteral(-1),
          scope.depth,
        ),
      ),
      b.binaryExpression('===', internalScope.pos, b.numericLiteral(-1)),
    ]);
  } else {
    return null;
  }
}

export function generateFilterScriptExpression(iterator, { deep, value }) {
  const esTree = jsep(value);
  assertDefinedIdentifier(esTree);
  const node = b.unaryExpression(
    '!',
    rewriteESTree(
      esTree,
      iterator.state.fixed &&
        iterator.state.pos > 0 &&
        iterator.nextNode !== null
        ? iterator.state.pos + 1
        : iterator.state.inverted && iterator.state.pos !== 0
        ? iterator.state.pos - 1
        : 0,
    ),
  );

  if (iterator.feedback.bailed || !deep || iterator.state.inverted) return node;

  const assignment = b.sequenceExpression([
    b.assignmentExpression(
      '=',
      internalScope.pos,
      b.conditionalExpression(node, b.numericLiteral(-1), scope.depth),
    ),
    b.binaryExpression('===', internalScope.pos, b.numericLiteral(-1)),
  ]);

  if (iterator.state.pos === 0) return assignment;

  return b.logicalExpression(
    '||',
    b.binaryExpression(
      '<',
      scope.depth,
      iterator.state.pos === 0
        ? internalScope.pos
        : b.binaryExpression(
            '+',
            internalScope.pos,
            b.numericLiteral(iterator.state.pos),
          ),
    ),
    assignment,
  );
}

export function rewriteESTree(node, pos) {
  switch (node.type) {
    case 'LogicalExpression':
    case 'BinaryExpression':
      if (node.operator === 'in') {
        node.operator = '===';
        node.left = b.callExpression(
          b.memberExpression(node.right, b.identifier('includes')),
          [rewriteESTree(node.left, pos)],
        );
        node.right = b.booleanLiteral(true);
      } else if (node.operator === '~=') {
        node.operator = '===';
        if (node.right.type !== 'Literal') {
          throw SyntaxError('Expected string');
        }

        node.left = b.callExpression(
          b.memberExpression(
            b.regExpLiteral(node.right.value, ''),
            b.identifier('test'),
          ),
          [rewriteESTree(node.left, pos)],
        );
        node.right = b.booleanLiteral(true);
      } else {
        node.left = rewriteESTree(node.left, pos);
        node.right = rewriteESTree(node.right, pos);
        assertDefinedIdentifier(node.left);
        assertDefinedIdentifier(node.right);
      }

      break;
    case 'UnaryExpression':
      node.argument = rewriteESTree(node.argument, pos);
      assertDefinedIdentifier(node.argument);
      return node;
    case 'MemberExpression':
      node.object = rewriteESTree(node.object, pos);
      assertDefinedIdentifier(node.object);
      node.property = rewriteESTree(node.property, pos);
      if (node.computed) {
        assertDefinedIdentifier(node.property);
      }

      break;
    case 'CallExpression':
      if (
        node.callee.type === 'Identifier' &&
        node.callee.name.startsWith('@')
      ) {
        return processAtIdentifier(node.callee.name, pos);
      }

      node.callee = rewriteESTree(node.callee, pos);
      node.arguments = node.arguments.map(argument =>
        rewriteESTree(argument, pos),
      );

      if (
        node.callee.type === 'MemberExpression' &&
        node.callee.object === sandbox.property &&
        node.callee.property.name in String.prototype
      ) {
        node.callee.object = b.callExpression(b.identifier('String'), [
          node.callee.object,
        ]);
      }

      assertDefinedIdentifier(node.callee);
      break;
    case 'Identifier':
      if (node.name.startsWith('@')) {
        return processAtIdentifier(node.name, pos);
      }

      if (node.name === 'index') {
        return sandbox.index;
      }

      break;
  }

  return node;
}

function processAtIdentifier(name, pos) {
  switch (name) {
    case '@':
      return remapSandbox(sandbox.value, pos);
    case '@root':
      return remapSandbox(sandbox.root, pos);
    case '@path':
      return remapSandbox(sandbox.path, pos);
    case '@property':
      return remapSandbox(sandbox.property, pos);
    case '@parent':
      return remapSandbox(sandbox.parentValue, pos);
    case '@parentProperty':
      return remapSandbox(sandbox.parentProperty, pos);
    case '@string':
    case '@number':
    case '@boolean':
      return b.binaryExpression(
        '===',
        b.unaryExpression('typeof', remapSandbox(sandbox.value, pos)),
        b.stringLiteral(name.slice(1)),
      );
    case '@scalar':
      return b.logicalExpression(
        '||',
        b.binaryExpression(
          '===',
          remapSandbox(sandbox.value, pos),
          b.nullLiteral(),
        ),
        b.binaryExpression(
          '!==',
          b.unaryExpression('typeof', remapSandbox(sandbox.value, pos)),
          b.stringLiteral('object'),
        ),
      );
    case '@array':
      return b.callExpression(
        b.memberExpression(b.identifier('Array'), b.identifier('isArray')),
        [remapSandbox(sandbox.value, pos)],
      );
    case '@null':
      return b.binaryExpression(
        '===',
        remapSandbox(sandbox.value, pos),
        b.nullLiteral(),
      );
    case '@object':
      return b.logicalExpression(
        '&&',
        b.binaryExpression(
          '!==',
          remapSandbox(sandbox.value, pos),
          b.nullLiteral(),
        ),
        b.binaryExpression(
          '===',
          b.unaryExpression('typeof', remapSandbox(sandbox.value, pos)),
          b.stringLiteral('object'),
        ),
      );
    case '@integer':
      return b.callExpression(
        b.memberExpression(b.identifier('Number'), b.identifier('isInteger')),
        [remapSandbox(sandbox.value, pos)],
      );
    default:
      throw new SyntaxError(`Unsupported shorthand '${name}'`);
  }
}

const KNOWN_IDENTIFIERS = [scope._.name, 'index'];

function assertDefinedIdentifier(node) {
  if (node.type !== 'Identifier') return;
  if (KNOWN_IDENTIFIERS.includes(node.name)) return;
  throw ReferenceError(`'${node.name}' is not defined`);
}

function remapSandbox(node, pos) {
  if (node.type === 'MemberExpression' && pos !== 0) {
    return {
      ...node,
      object: b.callExpression(sandbox.at, [b.numericLiteral(pos)]),
    };
  }

  return node;
}
