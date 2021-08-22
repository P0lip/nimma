import * as b from '../codegen/ast/builders.mjs';
import codegen from '../codegen/index.mjs';
import Iterator from '../codegen/iterator.mjs';
import * as parser from '../parser/parser.cjs';
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

  constructor(
    expressions,
    { fallback = null, unsafe = true, output = 'auto' } = {},
  ) {
    this.#fallback = fallback;

    const mappedExpressions = [];
    const erroredExpressions = [];

    for (const expression of new Set(expressions)) {
      try {
        const parsed = parser.parse(expression);
        if (unsafe === false && Iterator.getBailedPos(parsed) !== -1) {
          throw SyntaxError('Bail');
        }

        mappedExpressions.push([expression, parsed]);
      } catch (e) {
        if (fallback === null) {
          throw e;
        }

        erroredExpressions.push(expression);
      }
    }

    const tree = codegen(
      mappedExpressions,
      output === 'auto' ? getOutputFormat() : output,
    );

    if (fallback !== null) {
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
              b.memberExpression(b.identifier('_callbacks'), path, true),
            ]),
          ]),
        ),
        'body',
      );
    }

    this.sourceCode = String(tree);
  }

  query(input, callbacks) {
    const globals = '__nimma_globals__';
    const code = this.sourceCode
      .replace('export default function', `return function`)
      .replace(IMPORT_DECLARATIONS_REGEXP, `const $1 = ${globals};`)
      .replace(RegExp(IMPORT_DECLARATIONS_REGEXP.source, 'g'), '');

    Function(
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
    )(input, callbacks);
  }
}
