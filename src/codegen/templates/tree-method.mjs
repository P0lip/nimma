import * as b from '../ast/builders.mjs';
import { statefulFnParams, statelessFnParams } from './fn-params.mjs';

export default function generateTreeMethod(id, branch, needsState) {
  return b.objectMethod(
    'method',
    id,
    needsState ? statefulFnParams : statelessFnParams,
    branch,
  );
}
