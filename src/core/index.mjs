import codegen from '../codegen/index.mjs';
import * as runtime from '../runtime/index.mjs';
import parseExpressions from './utils/parse-expressions.mjs';

export default class Nimma {
  #fallback;
  #compiledFn;
  #module;
  #sourceCode;

  constructor(
    expressions,
    {
      fallback = null,
      unsafe = true,
      module = 'esm',
      npmProvider = null,
      customShorthands = null,
    } = {},
  ) {
    this.#fallback = fallback;
    this.#compiledFn = null;
    this.#module = module;
    this.#sourceCode = null;

    const { erroredExpressions, mappedExpressions } = parseExpressions(
      expressions,
      unsafe,
      fallback !== null,
    );

    this.tree = codegen(mappedExpressions, {
      customShorthands,
      module,
      npmProvider,
    });

    if (erroredExpressions.length > 0) {
      this.tree.attachFallbackExpressions(fallback, erroredExpressions);
    }
  }

  get sourceCode() {
    this.#sourceCode ??= String(this.tree.export(this.#module));
    return this.#sourceCode;
  }

  query(input, callbacks) {
    this.#compiledFn ??= Function(
      'module, require',
      `${String(this.tree.export('commonjs'))};return module.exports`,
    )({}, id => {
      if (id === 'nimma/runtime') {
        return runtime;
      }

      return this.#fallback?.runtimeDeps.get(id);
    });

    this.#compiledFn(input, callbacks);
  }
}
