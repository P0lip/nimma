import proxyCallbacks from './proxy-callbacks.mjs';
import { Sandbox } from './sandbox.mjs';
import { traverse, zonedTraverse } from './traverse.mjs';

class State {
  #values = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  #size = 0;

  initialValue = 0;

  get value() {
    return this.#values[this.#size];
  }

  at(index) {
    return this.#values.slice(0, this.#size).at(index);
  }

  set value(value) {
    this.#values[this.#size] = value;
  }

  enter() {
    this.#size++;
    if (this.#values.length === this.#size) {
      this.#values.push(0);
    }

    this.#values[this.#size] = this.#values[this.#size - 1];
    this.initialValue = this.value;
  }

  exit(depth) {
    this.#size = Math.max(0, depth - 1);
  }
}

export default class Scope {
  constructor(root, callbacks) {
    this.root = root;
    this.path = [];
    this.errors = [];
    this.states = [];
    this.sandbox = new Sandbox(this.path, root);
    this.callbacks = proxyCallbacks(callbacks, this.errors);
  }

  allocState() {
    const state = new State();
    this.states.push(state);
    return state;
  }

  enter(key) {
    this.path.push(key);
    this.sandbox.push();

    for (let i = 0; i < this.states.length; i++) {
      const state = this.states[i];
      state.enter(key);
    }

    return this.path.length;
  }

  exit(depth) {
    const length = Math.max(0, depth - 1);
    while (this.path.length > length) {
      this.path.pop();
    }

    this.sandbox.pop();

    for (let i = 0; i < this.states.length; i++) {
      const state = this.states[i];
      state.exit(depth);
    }

    return length;
  }

  fork(path) {
    const newScope = new Scope(this.root, this.callbacks);

    for (const segment of path) {
      newScope.enter(segment);
      if (newScope.sandbox.value === void 0) {
        return null;
      }
    }

    return newScope;
  }

  traverse(fn, zones) {
    if (zones !== null) {
      zonedTraverse.call(this, fn, zones);
    } else {
      traverse.call(this, fn);
    }
  }

  emit(id, pos, withKeys) {
    const fn = this.callbacks[id];

    if (pos === 0 && !withKeys) {
      return void fn({
        path: this.path.slice(),
        value: this.sandbox.value,
      });
    }

    if (pos !== 0 && pos > this.path.length) {
      return;
    }

    let path;
    let value;
    if (pos > 0) {
      path = this.path.slice(0, this.path.length - pos);
      value = this.sandbox.valueAt(-pos);
    } else {
      path = this.path.slice();
      value = this.sandbox.value;
    }

    if (!withKeys) {
      fn({ path, value });
    } else {
      fn({
        path,
        value: path.length === 0 ? null : path[path.length - 1],
      });
    }
  }

  destroy() {
    this.path.length = 0;
    this.states.length = 0;
    this.sandbox.destroy();

    if (this.errors.length > 0) {
      throw new AggregateError(this.errors, 'Error running Nimma');
    }
  }
}
