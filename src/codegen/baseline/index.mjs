import * as b from '../ast/builders.mjs';
import fastPaths from '../fast-paths/index.mjs';
import { isDeep } from '../guards.mjs';
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

export default function baseline(jsonPaths, opts) {
  const tree = new ESTree(opts);
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
      let body = method.body.body;

      body.push(generateEmitCall(id, iterator.modifiers));
      continue;
    } else {
      hashes.set(hash, id);
    }

    if (nodes.length > 0 && isDeep(nodes[0])) {
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

    const branch =
      iterator.feedback.minimumDepth !== -1
        ? [
            b.ifStatement(
              b.binaryExpression(
                iterator.feedback.fixed && iterator.feedback.stateOffset === -1
                  ? '!=='
                  : '<',
                scope.depth,
                b.numericLiteral(iterator.feedback.minimumDepth + 1),
              ),
              b.returnStatement(),
            ),
          ]
        : [];

    const zone = tree.traversalZones.create();

    for (const node of iterator) {
      if (isDeep(node)) {
        zone?.allIn();
      }

      switch (node.type) {
        case 'MemberExpression':
          generateMemberExpression(branch, iterator, node, tree);
          zone?.expand(node.value);
          break;
        case 'MultipleMemberExpression':
          generateMultipleMemberExpression(branch, iterator, node, tree);
          zone?.expandMultiple(node.value);
          break;
        case 'SliceExpression':
          generateSliceExpression(branch, iterator, node, tree);
          zone?.resize();
          break;
        case 'ScriptFilterExpression':
          generateFilterScriptExpression(branch, iterator, node, tree);
          zone?.resize();
          break;
        case 'WildcardExpression':
          generateWildcardExpression(branch, iterator, node, tree);
          zone?.resize();
          break;
      }
    }

    branch.push(generateEmitCall(ctx.id, iterator.modifiers));

    if (iterator.feedback.stateOffset !== -1) {
      tree.push(b.stringLiteral(id), 'stateful-traverse');
      tree.push(b.blockStatement(branch), 'stateful-tree-method');
    } else {
      tree.push(b.stringLiteral(id), 'traverse');
      tree.push(b.blockStatement(branch), 'tree-method');
    }

    zone?.attach();
  }

  return tree;
}
