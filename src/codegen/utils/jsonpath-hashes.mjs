export default class JsonPathHashes {
  #hashes = new Map();
  #expressions = new Map();

  get(key) {
    return this.#hashes.get(key);
  }

  getHash(expression) {
    return this.#expressions.get(expression);
  }

  set(key, value) {
    this.#hashes.set(key, value);
    this.#expressions.set(value, key);
  }

  link(value, key) {
    this.#expressions.set(value, key);
  }

  static generate(nodes) {
    return JSON.stringify(nodes);
  }
}
