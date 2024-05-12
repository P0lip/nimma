import * as b from '../ast/builders.mjs';
import { isNegativeSliceExpression } from '../guards.mjs';
import internalScope from '../templates/internal-scope.mjs';
import sandbox from '../templates/sandbox.mjs';
import scope from '../templates/scope.mjs';
import state from '../templates/state.mjs';

function generateStateCheck(branch, iterator, check, deep) {
  const [prevNo, no] = iterator.state.numbers;

  if (iterator.state.isLastNode) {
    return b.ifStatement(
      b.logicalExpression(
        '||',
        b.binaryExpression('<', state.initialValue, b.numericLiteral(prevNo)),
        b.unaryExpression('!', check),
      ),
      b.returnStatement(),
    );
  }

  return b.ifStatement(
    b.binaryExpression('>=', state.initialValue, b.numericLiteral(prevNo)),
    b.blockStatement([
      b.ifStatement(
        check,
        b.blockStatement([
          b.assignmentExpression('|=', state.value, b.numericLiteral(no)),
        ]),
        deep
          ? void 0
          : b.ifStatement(
              b.binaryExpression(
                '===',
                b.callExpression(
                  b.memberExpression(b.identifier('state'), b.identifier('at')),
                  [b.numericLiteral(-1)],
                ),
                b.numericLiteral(prevNo),
              ),
              b.blockStatement([
                b.assignmentExpression(
                  '&=',
                  state.value,
                  b.numericLiteral(iterator.state.groupNumbers[0]),
                ),
                b.returnStatement(),
              ]),
            ),
      ),
    ]),
  );
}

function generatePropertyAccess(iterator) {
  return (!iterator.state.indexed && iterator.state.isLastNode) ||
    iterator.state.usesState
    ? scope.property
    : b.memberExpression(
        scope.path,
        iterator.state.indexed
          ? b.numericLiteral(iterator.state.offset)
          : b.binaryExpression(
              '-',
              scope.depth,
              b.numericLiteral(Math.abs(iterator.state.offset)),
            ),
        true,
      );
}

export function generateMemberExpression(branch, iterator, node) {
  if (iterator.state.usesState) {
    branch.push(
      generateStateCheck(
        branch,
        iterator,
        b.safeBinaryExpression('===', scope.property, b.literal(node.value)),
        node.deep,
      ),
    );
  } else {
    branch.push(
      b.ifStatement(
        b.safeBinaryExpression(
          '!==',
          generatePropertyAccess(iterator),
          b.literal(node.value),
        ),
        b.returnStatement(),
      ),
    );
  }
}

export function generateMultipleMemberExpression(branch, iterator, node) {
  const property = generatePropertyAccess(iterator);

  const logicalOperator = iterator.state.usesState ? '||' : '&&';
  const binaryOperator = iterator.state.usesState ? '===' : '!==';

  const condition = node.value
    .slice(1)
    .reduce(
      (concat, member) =>
        b.logicalExpression(
          logicalOperator,
          concat,
          b.safeBinaryExpression(binaryOperator, property, b.literal(member)),
        ),
      b.safeBinaryExpression(
        binaryOperator,
        property,
        b.literal(node.value[0]),
      ),
    );

  if (iterator.state.usesState) {
    branch.push(generateStateCheck(branch, iterator, condition, node.deep));
  } else {
    branch.push(b.ifStatement(condition, b.returnStatement()));
  }
}

const IN_BOUNDS_IDENTIFIER = b.identifier('inBounds');

function generateNegativeSliceExpression(branch, iterator, node, tree) {
  tree.addRuntimeDependency(IN_BOUNDS_IDENTIFIER.name);

  const property = generatePropertyAccess(iterator);
  const isNumberBinaryExpression = b.binaryExpression(
    '!==',
    b.unaryExpression('typeof', property),
    b.stringLiteral('number'),
  );

  const condition = b.binaryExpression(
    '||',
    isNumberBinaryExpression,
    b.unaryExpression(
      '!',
      b.callExpression(IN_BOUNDS_IDENTIFIER, [
        scope.sandbox,
        generatePropertyAccess(iterator),
        ...node.value.map(value => b.numericLiteral(value)),
      ]),
    ),
  );

  if (iterator.state.usesState) {
    branch.push(
      generateStateCheck(
        branch,
        iterator,
        b.unaryExpression('!', condition),
        node.deep,
      ),
    );
  } else {
    branch.push(b.ifStatement(condition, b.returnStatement()));
  }
}

export function generateSliceExpression(branch, iterator, node, tree) {
  if (isNegativeSliceExpression(node)) {
    return generateNegativeSliceExpression(branch, iterator, node, tree);
  }

  const property = generatePropertyAccess(iterator);

  const isNumberBinaryExpression = b.binaryExpression(
    '!==',
    b.unaryExpression('typeof', property),
    b.stringLiteral('number'),
  );

  const condition = node.value.reduce((merged, value, i) => {
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
      property,
      b.numericLiteral(Number(value)),
    );

    return b.logicalExpression(
      '||',
      merged,
      operator === '%'
        ? b.logicalExpression(
            '&&',
            b.binaryExpression(
              '!==',
              property,
              b.numericLiteral(node.value[0]),
            ),
            b.binaryExpression(
              '!==',
              expression,
              b.numericLiteral(node.value[0]),
            ),
          )
        : expression,
    );
  }, isNumberBinaryExpression);

  if (iterator.state.usesState) {
    branch.push(
      generateStateCheck(
        branch,
        iterator,
        b.unaryExpression('!', condition),
        node.deep,
      ),
    );
  } else {
    branch.push(b.ifStatement(condition, b.returnStatement()));
  }
}

export function generateWildcardExpression(branch, iterator) {
  if (!iterator.state.usesState) return;

  const [prevNo, no] = iterator.state.numbers;

  if (iterator.state.isLastNode) {
    branch.push(
      b.ifStatement(
        b.binaryExpression('<', state.initialValue, b.numericLiteral(prevNo)),
        b.returnStatement(),
      ),
    );
  } else {
    branch.push(
      b.ifStatement(
        b.binaryExpression('>=', state.initialValue, b.numericLiteral(prevNo)),
        b.blockStatement([
          b.assignmentExpression('|=', state.value, b.numericLiteral(no)),
        ]),
      ),
    );
  }
}

export function generateCustomShorthandExpression(branch, iterator, node) {
  branch.push(
    b.ifStatement(
      b.unaryExpression(
        '!',
        b.callExpression(
          b.memberExpression(
            internalScope.shorthands,
            b.identifier(node.value),
          ),
          iterator.state.usesState
            ? [scope._, state._, b.numericLiteral(iterator.state.numbers[0])]
            : [scope._],
        ),
      ),
      b.returnStatement(),
    ),
  );
}

export function generateFilterScriptExpression(
  branch,
  iterator,
  { value: esTree },
  tree,
) {
  assertDefinedIdentifier(esTree);
  const node = rewriteESTree(tree, esTree);

  if (iterator.state.usesState) {
    branch.push(
      generateStateCheck(branch, iterator, node, iterator.state.isLastNode),
    );
  } else {
    branch.push(
      b.ifStatement(b.unaryExpression('!', node), b.returnStatement()),
    );
  }
}

export function rewriteESTree(tree, node) {
  switch (node.type) {
    case 'LogicalExpression':
    case 'BinaryExpression':
      if (node.operator === 'in') {
        node.operator = '===';
        node.left = b.callExpression(
          b.memberExpression(node.right, b.identifier('includes')),
          [rewriteESTree(tree, node.left)],
        );
        node.right = b.booleanLiteral(true);
      } else if (node.operator === '~=') {
        if (node.right.type !== 'Literal') {
          throw SyntaxError('~= must be used with strings');
        }

        return b.callExpression(
          b.memberExpression(
            b.regExpLiteral(node.right.value, ''),
            b.identifier('test'),
          ),
          [rewriteESTree(tree, node.left)],
        );
      } else {
        node.left = rewriteESTree(tree, node.left);
        node.right = rewriteESTree(tree, node.right);
        assertDefinedIdentifier(node.left);
        assertDefinedIdentifier(node.right);
      }

      break;
    case 'UnaryExpression':
      node.argument = rewriteESTree(tree, node.argument);
      assertDefinedIdentifier(node.argument);
      return node;
    case 'MemberExpression':
      node.object = rewriteESTree(tree, node.object);
      assertDefinedIdentifier(node.object);
      node.property = rewriteESTree(tree, node.property);
      if (node.computed) {
        assertDefinedIdentifier(node.property);
      }

      break;
    case 'CallExpression':
      if (
        node.callee.type === 'Identifier' &&
        node.callee.name.startsWith('@')
      ) {
        return processAtIdentifier(tree, node.callee.name);
      }

      node.callee = rewriteESTree(tree, node.callee);
      node.arguments = node.arguments.map(argument =>
        rewriteESTree(tree, argument),
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
        return processAtIdentifier(tree, node.name);
      }

      if (node.name === 'undefined') {
        return b.unaryExpression('void', b.numericLiteral(0));
      }

      if (node.name === 'index') {
        return sandbox.index;
      }

      break;
  }

  return node;
}

function processAtIdentifier(tree, name) {
  switch (name) {
    case '@':
      return sandbox.value;
    case '@root':
      return sandbox.root;
    case '@path':
      return sandbox.path;
    case '@property':
      return sandbox.property;
    case '@parent':
      return sandbox.parentValue;
    case '@parentProperty':
      return sandbox.parentProperty;
    case '@string':
    case '@number':
    case '@boolean':
      return b.binaryExpression(
        '===',
        b.unaryExpression('typeof', sandbox.value),
        b.stringLiteral(name.slice(1)),
      );
    case '@scalar':
      return b.logicalExpression(
        '||',
        b.binaryExpression('===', sandbox.value, b.nullLiteral()),
        b.binaryExpression(
          '!==',
          b.unaryExpression('typeof', sandbox.value),
          b.stringLiteral('object'),
        ),
      );
    case '@array':
      return b.callExpression(
        b.memberExpression(b.identifier('Array'), b.identifier('isArray')),
        [sandbox.value],
      );
    case '@null':
      return b.binaryExpression('===', sandbox.value, b.nullLiteral());
    case '@object':
      return b.logicalExpression(
        '&&',
        b.binaryExpression('!==', sandbox.value, b.nullLiteral()),
        b.binaryExpression(
          '===',
          b.unaryExpression('typeof', sandbox.value),
          b.stringLiteral('object'),
        ),
      );
    case '@integer':
      return b.callExpression(
        b.memberExpression(b.identifier('Number'), b.identifier('isInteger')),
        [sandbox.value],
      );
    default:
      throw Error(`Unsupported shorthand "${name}"`);
  }
}

const KNOWN_IDENTIFIERS = [scope._.name, 'index'];

function assertDefinedIdentifier(node) {
  if (node.type !== 'Identifier') return;
  if (KNOWN_IDENTIFIERS.includes(node.name)) return;
  throw ReferenceError(`"${node.name}" is not defined`);
}
