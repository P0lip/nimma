import * as b from '../codegen/ast/builders.mjs';
import codegen from '../codegen/index.mjs';
import Iterator from '../codegen/iterator.mjs';
import scope from '../codegen/templates/scope.mjs';
import parse from '../parser/index.mjs';
import * as runtime from '../runtime/index.mjs';

const IMPORT_DECLARATIONS_REGEXP =
  /import\s*({[^}]+})\s*from\s*['"][^'"]+['"];?/;

function getOutputFormat() {
  try {
    Function('a', 'a?.b')({});
    return 'ES2021';
  } catch {
    return 'ES2018';
  }
}

export default class Nimma {
  #fallback;
  #compiledFn;

  constructor(
    expressions,
    {
      fallback = null,
      unsafe = true,
      output = 'auto',
      npmProvider = null,
    } = {},
  ) {
    this.#fallback = fallback;
    this.#compiledFn = null;

    const mappedExpressions = [];
    const erroredExpressions = [];

    for (const expression of new Set(expressions)) {
      try {
        const parsed = parse(expression);
        if (unsafe === false && Iterator.analyze(parsed).bailed) {
          throw SyntaxError(
            'Unsafe expressions are ignored, but no fallback was specified',
          );
        }

        mappedExpressions.push([expression, parsed]);
      } catch (e) {
        if (fallback === null) {
          throw e;
        }

        erroredExpressions.push(expression);
      }
    }

    const tree = (this.tree = codegen(mappedExpressions, {
      format: output === 'auto' ? getOutputFormat() : output,
      npmProvider,
    }));

    if (fallback !== null && erroredExpressions.length > 0) {
      const path = b.identifier('path');
      const fb = fallback.attach(tree);
      tree.push(
        b.forOfStatement(
          b.variableDeclaration('const', [b.variableDeclarator(path)]),
          b.arrayExpression(
            erroredExpressions.map(expression => b.stringLiteral(expression)),
          ),
          b.blockStatement([
            b.callExpression(fb, [
              b.identifier('input'),
              path,
              b.memberExpression(scope.callbacks, path, true),
            ]),
          ]),
        ),
        'body',
      );
    }

    this.sourceCode = String(tree);
  }

  query(input, callbacks) {
    if (this.#compiledFn !== null) {
      this.#compiledFn(input, callbacks);
      return;
    }

    const globals = '__nimma_globals__';
    const code = this.sourceCode
      .replace('export default function', `return function`)
      .replace(IMPORT_DECLARATIONS_REGEXP, `const $1 = ${globals};`)
      .replace(RegExp(IMPORT_DECLARATIONS_REGEXP.source, 'g'), '');

    (this.#compiledFn = Function(
      globals,
      ...(this.#fallback === null
        ? []
        : Array.from(this.#fallback.runtimeDeps.keys())),
      code,
    )(
      runtime,
      ...(this.#fallback === null
        ? []
        : Array.from(this.#fallback.runtimeDeps.values())),
    ))(input, callbacks);
  }
}
