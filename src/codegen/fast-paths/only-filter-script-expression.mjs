// covers:
// $..[?(@.bar])
// $[?(@.bar])

import * as b from '../ast/builders.mjs';
import { rewriteESTree } from '../baseline/generators.mjs';
import jsep from '../../parser/jsep/index.mjs';
import { isDeep } from '../guards.mjs';
import generateEmitCall from '../templates/emit-call.mjs';
import scope from '../templates/scope.mjs';

const TOP_LEVEL_DEPTH_IF_STATEMENT = b.ifStatement(
  b.binaryExpression('!==', scope.depth, b.numericLiteral(0)),
  b.returnStatement(),
);

export default (nodes, tree, ctx) => {
  if (nodes.length !== 1 || nodes[0].type !== 'ScriptFilterExpression') {
    return false;
  }

  const condition = b.unaryExpression(
    '!',
    rewriteESTree(jsep(nodes[0].value), 0),
    true,
  );

  tree.pushAll([
    [
      b.blockStatement([
        ...(isDeep(nodes[0]) ? [] : [TOP_LEVEL_DEPTH_IF_STATEMENT]),
        b.ifStatement(condition, b.returnStatement()),
        generateEmitCall(ctx.iterator.modifiers),
      ]),
      'tree-method',
    ],
    [b.stringLiteral(ctx.id), 'traverse'],
  ]);

  return true;
};
