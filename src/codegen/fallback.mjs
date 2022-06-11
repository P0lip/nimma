import * as b from './ast/builders.mjs';

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
  #modules = new Map();
  #deps = new Map();
  #fn;
  #extraCode = '';
  runtimeDeps = new Map();

  constructor(deps, fn) {
    this.#fn = fn;

    for (const [source, specifiers] of Object.entries(deps)) {
      const members = new Map();
      const localModule = {};

      for (const { imported, local, value } of specifiers) {
        this.#deps.set(local, value);
        localModule[imported] = value;
        members.set(imported, local);
      }

      this.#modules.set(source, members);
      this.runtimeDeps.set(source, localModule);
    }
  }

  get extraCode() {
    this.#extraCode ||= getFunctionBody(this.#fn);

    return this.#extraCode;
  }

  attach(tree) {
    for (const [source, members] of this.#modules.entries()) {
      tree.addModule(members, source);
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
                  b.objectProperty(b.stringLiteral(arg), b.identifier(arg)),
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
