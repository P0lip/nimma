import {
  isDeep,
  isModifierExpression,
  isNegativeSliceExpression,
  isScriptFilterExpression,
  isShorthandExpression,
  isWildcardExpression,
} from './guards.mjs';

function emptyState() {
  return {
    absoluteOffset: -1,
    groupNumbers: [],
    indexed: true,
    isLastNode: true,
    numbers: [-1, -1],
    offset: -1,
    usesState: false,
  };
}

export default class Iterator {
  nodes;

  constructor(nodes) {
    this.modifiers = Iterator.trim(nodes);
    this.nodes = Iterator.compact(nodes);
    this.feedback = Iterator.analyze(this.nodes);
    this.length = this.nodes.length;
    this.state = emptyState();

    if (this.feedback.fixed && this.modifiers.parents > this.length) {
      this.length = -1;
    }
  }

  static compact(nodes) {
    let marked;
    for (let i = 0; i < nodes.length; i++) {
      if (
        isWildcardExpression(nodes[i]) &&
        isDeep(nodes[i]) &&
        i !== nodes.length - 1
      ) {
        (marked ??= []).push(i);
      }
    }

    if (marked === void 0) {
      return nodes;
    }

    const _nodes = nodes.slice();
    for (let i = 0; i < marked.length; i++) {
      _nodes[marked[i] - i + 1].deep = true;
      _nodes.splice(marked[i] - i, 1);
    }

    return _nodes;
  }

  static trim(nodes) {
    const modifiers = {
      keyed: false,
      parents: 0,
    };

    while (nodes.length > 0 && isModifierExpression(nodes[nodes.length - 1])) {
      switch (nodes.pop().type) {
        case 'KeyExpression':
          modifiers.keyed = true;
          modifiers.parents = 0;
          break;
        case 'ParentExpression':
          modifiers.parents++;
          break;
      }
    }

    return modifiers;
  }

  static analyze(nodes) {
    const feedback = {
      fixed: true,
      inverseOffset: -1,
      minimumDepth: -1,
      shorthands: 0,
      stateOffset: -1,
    };

    let deep = -1;
    let potentialInverseOffset = -1;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (isShorthandExpression(node)) {
        if (node.arguments[0] > 0) {
          feedback.stateOffset = i;
        }

        feedback.minimumDepth = i - 1;
        feedback.shorthands++;
        feedback.fixed = false;
      }

      if (!isDeep(node)) {
        if (isScriptFilterExpression(node) || isNegativeSliceExpression(node)) {
          if (i === nodes.length - 1) {
            feedback.inverseOffset = potentialInverseOffset;
          } else {
            feedback.stateOffset = deep === -1 ? i : deep;
          }
        } else {
          feedback.inverseOffset = potentialInverseOffset;
        }

        continue;
      }

      if (potentialInverseOffset === -1) {
        potentialInverseOffset = i;
      }

      if (deep !== -1) {
        feedback.stateOffset = deep;
        break;
      } else if (isScriptFilterExpression(node) && i !== nodes.length - 1) {
        feedback.stateOffset = i;
        deep = i;
        break;
      }

      deep = i;
    }

    if (feedback.shorthands === 0) {
      feedback.fixed = deep === -1;
      feedback.minimumDepth =
        feedback.stateOffset === -1 ? nodes.length - 1 : feedback.stateOffset;
    }

    return feedback;
  }

  *[Symbol.iterator]() {
    const { feedback, nodes, state } = this;

    Object.assign(state, emptyState());

    for (let i = 0; i < nodes.length; i++) {
      state.absoluteOffset = i;

      if (isDeep(nodes[i])) {
        state.offset = -1;
        state.indexed = false;

        if (state.groupNumbers.length > 0) {
          state.groupNumbers.length = 0;
        }
      }

      if (feedback.stateOffset === i) {
        state.offset = -1;
        state.usesState = true;
      }

      if (feedback.inverseOffset === i) {
        state.offset = i - nodes.length;
      } else {
        state.offset++;
      }

      if (state.usesState) {
        if (state.numbers[0] === -1) {
          state.numbers[0] = 0;
          state.numbers[1] = 1;
        } else {
          state.numbers[0] = state.numbers[1];
          state.numbers[1] = (state.numbers[1] << 1) + 1;
        }

        state.groupNumbers.push(state.numbers[0]);
      }

      state.isLastNode = i === nodes.length - 1;

      yield nodes[i];

      if (isShorthandExpression(nodes[i])) {
        let depth = nodes[i].arguments[0];
        while (depth-- > 0) {
          state.numbers[1] = (state.numbers[1] << 1) + 1;
        }
      }
    }
  }
}
