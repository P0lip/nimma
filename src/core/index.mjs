import codegen from '../codegen/index.mjs';
import * as runtime from '../runtime/index.mjs';
import parseExpressions from './utils/parse-expressions.mjs';

export default class Nimma {
  #compiledFn;
  #module;
  #sourceCode;
  #customShorthands;

  constructor(expressions, { module = 'esm', customShorthands = null } = {}) {
    this.#compiledFn = null;
    this.#module = module;
    this.#sourceCode = null;
    this.#customShorthands = customShorthands;

    this.tree = codegen(parseExpressions(expressions), {
      customShorthands,
      module,
    });
  }

  get sourceCode() {
    this.#sourceCode ??= String(this.tree.export(this.#module));
    return this.#sourceCode;
  }

  query(input, callbacks) {
    this.#compiledFn ??= Function(
      'module, require',
      `${String(this.tree.export('commonjs'))};return module.exports`,
    )({}, () => runtime);

    if (this.#customShorthands === null) {
      this.#compiledFn(input, callbacks);
    } else {
      this.#compiledFn(input, callbacks, this.#customShorthands);
    }
  }

  static query(input, callbacks, options) {
    const nimma = new Nimma(Object.keys(callbacks), options);
    nimma.query(input, callbacks);
    return input => nimma.query(input, callbacks);
  }
}
