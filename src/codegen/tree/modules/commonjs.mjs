import * as b from '../../ast/builders.mjs';

export default {
  createDefaultExport(member) {
    return b.expressionStatement(
      b.assignmentExpression(
        '=',
        b.memberExpression(b.identifier('module'), b.identifier('exports')),
        member,
      ),
    );
  },

  createImport(members, source) {
    return b.variableDeclaration('const', [
      b.variableDeclarator(
        b.objectExpression(
          members.map(([imported, local]) =>
            b.objectProperty(
              b.identifier(imported),
              b.identifier(local),
              false,
              imported === local,
            ),
          ),
        ),
        b.callExpression(b.identifier('require'), [b.stringLiteral(source)]),
      ),
    ]);
  },
};
