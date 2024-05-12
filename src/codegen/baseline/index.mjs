import * as b from '../ast/builders.mjs';
import fastPaths from '../fast-paths/index.mjs';
import { isDeep } from '../guards.mjs';
import Iterator from '../iterator.mjs';
import generateEmitCall from '../templates/emit-call.mjs';
import scope from '../templates/scope.mjs';
import {
  NEEDS_SHORTHANDS,
  NEEDS_STATE,
  NEEDS_TRAVERSAL,
} from '../tree/consts.mjs';
import ESTree from '../tree/tree.mjs';
import JsonPathHashes from '../utils/jsonpath-hashes.mjs';
import {
  generateCustomShorthandExpression,
  generateFilterScriptExpression,
  generateMemberExpression,
  generateMultipleMemberExpression,
  generateSliceExpression,
  generateWildcardExpression,
} from './generators.mjs';

export default function baseline(jsonPaths) {
  const hashes = new JsonPathHashes();
  const tree = new ESTree({
    hashes,
  });

  traverse: for (const [expression, nodes] of jsonPaths) {
    const iterator = new Iterator(nodes);

    if (iterator.length === -1) {
      continue;
    }

    const hash = JsonPathHashes.generate(iterator.nodes);
    const existingHash = hashes.get(hash);

    if (existingHash !== void 0) {
      const method = tree.getMethodByHash(existingHash);
      let body = method.body.body;

      body.push(
        generateEmitCall(b.stringLiteral(expression), iterator.modifiers),
      );
      hashes.link(hash, expression);
      continue;
    } else {
      hashes.set(hash, expression);
    }

    if (nodes.length > 0 && isDeep(nodes[0])) {
      tree.traversalZones.destroy();
    }

    const ctx = {
      id: b.stringLiteral(expression),
      iterator,
    };

    tree.ctx = ctx;

    for (const fastPath of fastPaths) {
      if (fastPath(nodes, tree, ctx)) {
        continue traverse;
      }
    }

    const branch = [
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
    ];

    let zone = tree.traversalZones.create();

    for (const node of iterator) {
      if (isDeep(node)) {
        zone?.unbind();
        zone = null;
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
        case 'CustomShorthandExpression':
          generateCustomShorthandExpression(branch, iterator, node, tree);
          break;
      }
    }

    branch.push(generateEmitCall(ctx.id, iterator.modifiers));

    let feedback = NEEDS_TRAVERSAL;
    if (iterator.feedback.stateOffset !== -1) {
      feedback |= NEEDS_STATE;
    }
    if (iterator.feedback.shorthands > 0) {
      feedback |= NEEDS_SHORTHANDS;
    }

    tree.addTreeMethod(ctx.id, b.blockStatement(branch), feedback);
  }

  return tree;
}
