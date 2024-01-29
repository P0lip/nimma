import * as b from '../../ast/builders.mjs';

export default function (runtimeDependencies, program) {
  program.body.unshift(
    b.expressionStatement(b.stringLiteral('use strict')),
    b.variableDeclaration('const', [
      b.variableDeclarator(
        b.objectExpression(
          runtimeDependencies.map(([imported, local]) =>
            b.objectProperty(
              b.identifier(imported),
              b.identifier(local),
              false,
              imported === local,
            ),
          ),
        ),
        b.callExpression(b.identifier('require'), [
          b.stringLiteral('nimma/runtime'),
        ]),
      ),
    ]),
  );

  program.body[program.body.length - 1] = b.expressionStatement(
    b.assignmentExpression(
      '=',
      b.memberExpression(b.identifier('module'), b.identifier('exports')),
      program.body[program.body.length - 1],
    ),
  );

  return program;
}
