import * as b from './ast/builders.mjs';

function safeName(name) {
  return `nimma_${name}`;
}

function safeIdentifier(name) {
  return b.identifier(safeName(name));
}

function getFunctionBody(fn) {
  const source = Reflect.apply(Function.toString, fn, []);
  const paramsDefEnd = source.indexOf(')') + 1;
  const body = source.slice(paramsDefEnd).replace(/^\s*(=>\s*)?/, '');

  const arr = source
    .slice(source.indexOf('('), paramsDefEnd)
    .split(/[,\s]+/)
    .splice(0, 3);

  return `${arr.join(', ')} => ${body}`;
}

export default class Fallback {
  #modules = new Set();
  #deps = new Map();
  #fn;
  #extraCode = '';
  runtimeDeps = new Map();

  constructor(deps, fn) {
    this.#fn = fn;

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
  }

  get extraCode() {
    this.#extraCode ||= getFunctionBody(this.#fn);

    return this.#extraCode;
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
            b.memberExpression(
              b.callExpression(b.identifier('Function'), [
                b.templateLiteral(
                  [b.templateElement({ raw: `return ${this.extraCode}` })],
                  [],
                ),
              ]),
              b.identifier('call'),
            ),
            [
              b.objectExpression(
                args.map(arg =>
                  b.objectProperty(b.stringLiteral(arg), safeIdentifier(arg)),
                ),
              ),
            ],
          ),
        ),
      ]),
      'program',
    );

    return id;
  }
}
