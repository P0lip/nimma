import * as b from '../ast/builders.mjs';

const state = b.identifier('state');
export default {
  _: state,

  initialValue: b.memberExpression(state, b.identifier('initialValue')),
  value: b.memberExpression(state, b.identifier('value')),
};
