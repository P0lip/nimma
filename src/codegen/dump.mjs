import * as astring from 'astring';

const customGenerator = {
  ...astring.baseGenerator,
  BooleanLiteral(node, state) {
    state.write(`${node.value}`, node);
  },
  NullLiteral(node, state) {
    state.write('null', node);
  },
  NumericLiteral(node, state) {
    state.write(node.value, node);
  },
  ObjectMethod(node, state) {
    // eslint-disable-next-line no-unused-vars
    const { key, type, ...value } = node;
    return this.ObjectProperty(
      {
        key: node.key,
        value: {
          type: 'FunctionExpression',
          ...value,
        },
      },
      state,
    );
  },
  ObjectProperty(node, state) {
    return this.Property(
      {
        ...node,
        kind: 'init',
      },
      state,
    );
  },
  RegExpLiteral(node, state) {
    state.write(`/${node.pattern}/${node.flags}`, node);
  },
  StringLiteral(node, state) {
    state.write(JSON.stringify(node.value), node);
  },
};

export default function (tree) {
  return astring.generate(tree, { generator: customGenerator });
}
