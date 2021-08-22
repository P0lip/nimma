import {
  isDeep,
  isMemberExpression,
  isModifierExpression,
  isScriptFilterExpression,
  isWildcardExpression,
} from './guards.mjs';

export default class Iterator {
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

  #nodes;
  #i;

  constructor(nodes) {
    this.modifiers = Iterator.trim(nodes);
    this.#nodes = Iterator.compact(nodes);
    this.#i = -1;
    this.pos = -1;
    this.feedback = {};
    this.fixed = !this.#nodes.some(isDeep);
    this.length = this.#nodes.length;
    this.bailed = !this.fixed && Iterator.getBailedPos(this.#nodes) !== -1;

    if (this.fixed && this.modifiers.parents > this.length) {
      this.length = -1;
    }
  }

  get nextNode() {
    return this.#i + 1 < this.#nodes.length ? this.#nodes[this.#i + 1] : null;
  }

  static getBailedPos(nodes) {
    for (const [i, node] of nodes.entries()) {
      if (i + 1 === nodes.length) {
        continue;
      }

      if (isScriptFilterExpression(node)) {
        return i;
      }

      if (isDeep(node)) {
        if (isMemberExpression(node)) {
          for (let x = i; x < nodes.length; x++) {
            const nextNode = nodes[x];
            if (isDeep(nextNode) && isMemberExpression(nextNode)) {
              continue;
            }

            if (x === nodes.length - 1 && isScriptFilterExpression(nextNode)) {
              return -1;
            }

            return i;
          }
        } else {
          return i;
        }
      }
    }

    return -1;
  }

  *[Symbol.iterator]() {
    if (this.bailed) {
      return yield* this.#nodes;
    }

    let order = 1;

    for (let i = 0; i < this.#nodes.length; i++) {
      const node = this.#nodes[i];
      this.pos += order;
      this.#i++;

      if (isDeep(node)) {
        // revert nodes
        yield node;
        this.pos = 0;
      } else {
        yield node;
      }
    }
  }
}
