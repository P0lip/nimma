import * as b from '../ast/builders.mjs';
import fastPaths from '../fast-paths/index.mjs';
import { isDeep } from '../guards.mjs';
import Iterator from '../iterator.mjs';
import generateEmitCall from '../templates/emit-call.mjs';
import fnParams from '../templates/fn-params.mjs';
import internalScope from '../templates/internal-scope.mjs';
import scope from '../templates/scope.mjs';
import ESTree from '../tree/tree.mjs';
import {
  generateFilterScriptExpression,
  generateMemberExpression,
  generateMultipleMemberExpression,
  generateSliceExpression,
  generateWildcardExpression,
} from './generators.mjs';

const POS_VARIABLE_DECLARATION = b.variableDeclaration('let', [
  b.variableDeclarator(internalScope.pos, b.numericLiteral(0)),
]);

export default function baseline(jsonPaths, format) {
  const tree = new ESTree({ format });
  const hashes = new Map();
  const callbacks = new Map();

  traverse: for (const [id, nodes] of jsonPaths) {
    const iterator = new Iterator(nodes);

    if (iterator.length === -1) {
      continue;
    }

    const hash = JSON.stringify(iterator.nodes);
    const existingHash = hashes.get(hash);

    if (existingHash !== void 0) {
      void (
        callbacks.get(existingHash)?.push(id) ??
        callbacks.set(existingHash, [id])
      );

      const method = tree.getMethodByHash(existingHash);
      if (method === void 0) {
        break;
      }

      let body = method.body.body;

      if (iterator.feedback.bailed) {
        body = body[0].expression.arguments[1].body.body;
      }

      body.push(generateEmitCall(id, iterator.modifiers));
      continue;
    } else {
      hashes.set(hash, id);
    }

    if (iterator.feedback.bailed || (nodes.length > 0 && isDeep(nodes[0]))) {
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
        ].concat(iterator.feedback.fixed ? [] : POS_VARIABLE_DECLARATION);

    const zone = iterator.feedback.bailed ? null : tree.traversalZones.create();
    const inverseAt = iterator.feedback.inverseAt;

    for (const node of iterator) {
      if (isDeep(node) || inverseAt === iterator.state.absolutePos) {
        zone?.allIn();
      }

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
              ? internalScope.pos
              : b.binaryExpression(
                  '+',
                  internalScope.pos,
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
              b.blockStatement([
                b.expressionStatement(
                  generateEmitCall(ctx.id, iterator.modifiers).expression,
                ),
              ]),
            ),
            b.arrayExpression([...branch]),
          ]),
        ),
      );
    } else {
      branch.push(generateEmitCall(ctx.id, iterator.modifiers));
    }

    if (placement === 'body') {
      tree.push(
        b.expressionStatement(
          b.callExpression(
            b.memberExpression(internalScope.tree, b.stringLiteral(id), true),
            fnParams,
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

  return tree;
}
