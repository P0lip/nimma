import isObject from './codegen-functions/is-object.mjs';

function printSegment(path, segment) {
  return path + `[${typeof segment === 'string' ? `'${segment}'` : segment}]`;
}

function dumpPath(path) {
  return `$${path.reduce(printSegment, '')}`;
}

export class Sandbox {
  #history;
  #path;

  constructor(path, root) {
    this.root = root;
    this.#path = path;
    this.#history = [root];
    this.property = null;
    this.value = this.root;
  }

  get path() {
    return dumpPath(this.#path);
  }

  parentAt(i) {
    return this.#history[this.#path.length + i];
  }

  get parentValue() {
    if (this.#path.length < 2) {
      return void 0;
    }

    return this.#history[this.#path.length - 2];
  }

  get parentProperty() {
    if (this.#path.length < 2) {
      return void 0;
    }

    return this.#path[this.#path.length - 2];
  }

  destroy() {
    this.#history.length = 0;
  }

  push() {
    const length = this.#path.length;

    this.property = length === 0 ? null : this.#path[length - 1];

    const root =
      this.property !== null && isObject(this.value)
        ? this.value[this.property]
        : null;

    if (length + 1 > this.#history.length) {
      this.#history.push(root);
    } else {
      this.#history[length] = root;
    }

    this.value = root;
  }

  pop() {
    const length = this.#path.length;
    if (length === 0) {
      this.value = this.root;
      this.property = null;
    } else {
      this.property = this.#path[length - 1];
      this.value = this.#history[length];
    }
  }
}
