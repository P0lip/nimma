import * as b from '../ast/builders.mjs';
import fastPaths from '../fast-paths/index.mjs';
import Iterator from '../iterator.mjs';
import generateEmitCall from '../templates/emit-call.mjs';
import scope from '../templates/scope.mjs';
import ESTree from '../tree/tree.mjs';
import {
  generateFilterScriptExpression,
  generateMemberExpression,
  generateMultipleMemberExpression,
  generateSliceExpression,
  generateWildcardExpression,
} from './generators.mjs';

export default function baseline(jsonPaths, format) {
  const tree = new ESTree({ format });
  const hashes = new Map();
  const callbacks = new Map();

  const _callbacks = b.identifier('_callbacks');

  traverse: for (const [id, nodes] of jsonPaths) {
    const hash = JSON.stringify(nodes);
    const existingHash = hashes.get(hash);

    if (existingHash !== void 0) {
      void (
        callbacks.get(existingHash)?.push(id) ??
        callbacks.set(existingHash, [id])
      );

      continue;
    }

    hashes.set(hash, id);

    const iterator = new Iterator(nodes);

    if (iterator.length === -1) {
      continue;
    }

    if (!iterator.feedback.fixed) {
      tree.traversalZones.destroy();
    }

    const ctx = {
      id,
      iterator,
    };

    tree.ctx = ctx;

    for (const fastPath of fastPaths) {
      if (fastPath(nodes, tree, ctx)) {
        continue traverse;
      }
    }

    const branch = iterator.feedback.bailed
      ? []
      : [
          b.ifStatement(
            b.binaryExpression(
              iterator.feedback.fixed ? '!==' : '<',
              scope.depth,
              b.numericLiteral(iterator.length - 1),
            ),
            b.returnStatement(),
          ),
        ].concat(
          iterator.feedback.fixed
            ? []
            : b.variableDeclaration('let', [
                b.variableDeclarator(b.identifier('pos'), b.numericLiteral(0)),
              ]),
        );

    const zone = iterator.feedback.fixed ? tree.traversalZones.create() : null;

    for (const node of iterator) {
      let treeNode;

      switch (node.type) {
        case 'MemberExpression':
          treeNode = generateMemberExpression(iterator, node, tree);
          zone?.expand(node.value);
          break;
        case 'MultipleMemberExpression':
          treeNode = generateMultipleMemberExpression(iterator, node, tree);
          zone?.expandMultiple(node.value);
          break;
        case 'SliceExpression':
          treeNode = generateSliceExpression(iterator, node, tree);
          zone?.resize();
          break;
        case 'ScriptFilterExpression':
          treeNode = generateFilterScriptExpression(iterator, node, tree);
          zone?.resize();
          break;
        case 'WildcardExpression':
          treeNode = generateWildcardExpression(iterator, node, tree);
          zone?.resize();
          if (treeNode === null) {
            continue;
          }

          break;
        default:
          throw new SyntaxError('Unsupported');
      }

      if (iterator.feedback.bailed) {
        branch.push(
          b.objectExpression([
            b.objectProperty(
              b.identifier('fn'),
              b.arrowFunctionExpression([scope._], treeNode),
            ),
            b.objectProperty(b.identifier('deep'), b.booleanLiteral(node.deep)),
          ]),
        );
      } else {
        branch.push(b.ifStatement(treeNode, b.returnStatement()));
      }
    }

    if (
      !iterator.feedback.fixed &&
      !iterator.feedback.bailed &&
      !iterator.state.inverted
    ) {
      branch.push(
        b.ifStatement(
          b.binaryExpression(
            '!==',
            scope.depth,
            iterator.state.pos === 0
              ? b.identifier('pos')
              : b.binaryExpression(
                  '+',
                  b.identifier('pos'),
                  b.numericLiteral(iterator.state.pos),
                ),
          ),
          b.returnStatement(),
        ),
      );
    }

    const placement = iterator.feedback.bailed ? 'body' : 'traverse';

    if (iterator.feedback.bailed) {
      branch.splice(
        0,
        branch.length,
        b.expressionStatement(
          b.callExpression(scope.bail, [
            b.stringLiteral(id),
            b.arrowFunctionExpression(
              [scope._],
              generateEmitCall(iterator.modifiers).expression,
            ),
            b.arrayExpression([...branch]),
          ]),
        ),
      );
    } else {
      branch.push(generateEmitCall(iterator.modifiers));
    }

    if (placement === 'body') {
      tree.push(
        b.expressionStatement(
          b.callExpression(
            b.memberExpression(
              b.identifier('_tree'),
              b.stringLiteral(id),
              true,
            ),
            [
              scope._,
              b.memberExpression(_callbacks, b.stringLiteral(id), true),
            ],
          ),
        ),
        placement,
      );
    } else {
      tree.push(b.stringLiteral(id), placement);
    }

    tree.push(b.blockStatement(branch), 'tree-method');

    zone?.attach();
  }

  tree.push(
    b.objectExpression(
      Array.from(callbacks.entries()).map(([key, values]) =>
        b.objectProperty(
          b.stringLiteral(key),
          b.arrayExpression(values.map(value => b.stringLiteral(value))),
        ),
      ),
    ),
    'callbacks',
  );

  return tree;
}
