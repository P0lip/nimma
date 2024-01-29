import codegen from '../codegen/index.mjs';
import * as runtime from '../runtime/index.mjs';
import parseExpressions from './utils/parse-expressions.mjs';

export default class Nimma {
  #compiledFn;
  #module;
  #sourceCode;

  constructor(expressions, { module = 'esm', customShorthands = null } = {}) {
    this.#compiledFn = null;
    this.#module = module;
    this.#sourceCode = null;

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

    this.#compiledFn(input, callbacks);
  }
}
