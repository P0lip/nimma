import * as b from '../ast/builders.mjs';
import scope from './scope.mjs';

const ALLOC_STATE_CALL = b.callExpression(scope.allocState, []);

export default function generateAllocState(count) {
  const id = b.identifier(`state${count}`);
  return b.variableDeclaration('const', [
    b.variableDeclarator(id, ALLOC_STATE_CALL),
  ]);
}
