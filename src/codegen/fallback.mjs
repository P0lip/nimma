import * as b from './ast/builders.mjs';

function safeName(name) {
  return `nimma_${name}`;
}

function safeIdentifier(name) {
  return b.identifier(safeName(name));
}

export default class Fallback {
  #modules = new Set();
  #deps = new Map();
  runtimeDeps = new Map();

  constructor(deps, fn) {
    for (const [source, specifiers] of Object.entries(deps)) {
      const importSpecifiers = [];
      for (const { imported, local, value } of specifiers) {
        this.#deps.set(local, value);
        this.runtimeDeps.set(safeName(local), value);

        importSpecifiers.push(
          b.importSpecifier(safeIdentifier(local), b.identifier(imported)),
        );

        this.#modules.add(
          b.importDeclaration(importSpecifiers, b.stringLiteral(source)),
        );
      }
    }

    this.extraCode = Reflect.apply(Function.toString, fn, []).replace(
      /\(([^)]+)\)/,
      (_, args) => {
        const arr = args.split(/[,\s]+/);
        arr.length = 3;
        return `(${arr.join(', ')})`;
      },
    );
  }

  attach(tree) {
    for (const mod of this.#modules) {
      tree.push(mod, 'program');
    }

    const id = b.identifier('fallback');
    const args = Array.from(this.#deps.keys());

    tree.push(
      b.variableDeclaration('const', [
        b.variableDeclarator(
          id,
          b.callExpression(
            b.callExpression(b.identifier('Function'), [
              ...args.map(b.stringLiteral),
              b.templateLiteral(
                [b.templateElement({ raw: `return ${this.extraCode}` })],
                [],
              ),
            ]),
            args.map(safeIdentifier),
          ),
        ),
      ]),
      'program',
    );

    return id;
  }
}
