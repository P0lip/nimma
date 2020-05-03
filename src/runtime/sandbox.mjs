import { isObject } from '../utils/isObject.mjs';

export class Sandbox {
  constructor(path, root, history) {
    this._history = history === null ? [this] : history;

    this.path = path;
    this.value = root;
  }

  get pos() {
    return this.path.length - 1;
  }

  push() {
    const sandbox = new Sandbox(
      this.path,
      this.property !== null && isObject(this.value)
        ? this.value[this.property]
        : null,
      this._history,
    );
    this._history.push(sandbox);
    return sandbox;
  }

  pop() {
    this._history.length = this.path.length + 1;
    return this._history[this._history.length - 1];
  }

  get property() {
    return unwrapOrNull(this.path, this.pos);
  }

  get parentProperty() {
    const { parent } = this;
    return parent === null ? null : parent.property;
  }

  get parent() {
    return unwrapOrNull(this._history, this.pos);
  }

  get root() {
    return this._history[0].value;
  }
}

function unwrapOrNull(collection, pos) {
  return pos >= 0 && collection.length > pos ? collection[pos] : null;
}
