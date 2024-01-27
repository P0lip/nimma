import scope from './scope.mjs';
import state from './state.mjs';

export const statelessFnParams = [scope._];
export const statefulFnParams = [scope._, state._];
