import * as b from '../../ast/builders.mjs';

export default {
  createDefaultExport(member) {
    return b.exportDefaultDeclaration(member);
  },

  createImport(members, source) {
    return b.importDeclaration(
      members.map(([imported, local]) =>
        b.importSpecifier(b.identifier(local), b.identifier(imported)),
      ),
      b.stringLiteral(source),
    );
  },
};
