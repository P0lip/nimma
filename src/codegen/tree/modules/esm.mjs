import * as b from '../../ast/builders.mjs';

export default function (runtimeDependencies, program) {
  program.body.unshift(
    b.importDeclaration(
      runtimeDependencies.map(([imported, local]) =>
        b.importSpecifier(b.identifier(local), b.identifier(imported)),
      ),
      b.stringLiteral('nimma/runtime'),
    ),
  );

  program.body[program.body.length - 1] = b.exportDefaultDeclaration(
    program.body[program.body.length - 1],
  );
  return program;
}
