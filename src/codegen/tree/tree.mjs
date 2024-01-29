import jsep from '../../parser/jsep.mjs';
import * as b from '../ast/builders.mjs';
import astring from '../dump.mjs';
import {
  statefulFnParams,
  statelessFnParams,
} from '../templates/fn-params.mjs';
import internalScope from '../templates/internal-scope.mjs';
import scope from '../templates/scope.mjs';
import treeMethodCall from '../templates/tree-method-call.mjs';
import commonjs from './modules/commonjs.mjs';
import esm from './modules/esm.mjs';
import TraversalZones from './traversal-zones.mjs';

const params = [b.identifier('input'), b.identifier('callbacks')];

const NEW_SCOPE_VARIABLE_DECLARATION = b.variableDeclaration('const', [
  b.variableDeclarator(scope._, b.newExpression(b.identifier('Scope'), params)),
]);

/*
import {
 // deps
} from 'nimma/runtime';
// placement: tree
const tree = {};

// placement: program

export default function (input, callbacks) {
  const scope = new Scope(input, callbacks);

  try {
    // placement: body

    scope.traverse(() => {
      // placement: traverse
    });
  } finally {
    scope.destroy();
  }
}
*/

export default class ESTree {
  #tree = b.objectExpression([]);
  #shorthands = b.objectExpression([]);
  #runtimeDependencies;
  #program = new Set();
  #body = new Set();
  #traverse = new Set();
  #availableShorthands;
  #states = -1;

  constructor({ customShorthands, module }) {
    this.module = module;
    this.ctx = null;
    this.traversalZones = new TraversalZones();
    this.#availableShorthands = customShorthands;
    this.#runtimeDependencies = new Map([['Scope', 'Scope']]);
  }

  addRuntimeDependency(specifier) {
    this.#runtimeDependencies.set(specifier, specifier);
  }

  attachCustomShorthand(name) {
    if (
      this.#availableShorthands === null ||
      !(name in this.#availableShorthands)
    ) {
      throw new ReferenceError(`Shorthand '${name}' is not defined`);
    }

    this.#shorthands.properties.push(
      b.objectMethod(
        'method',
        b.identifier(name),
        statefulFnParams,
        b.blockStatement([
          b.returnStatement(jsep(this.#availableShorthands[name])),
        ]),
      ),
    );
  }

  getMethodByHash(hash) {
    return this.#tree.properties.find(prop => prop.key.value === hash);
  }

  push(node, placement) {
    switch (placement) {
      case 'tree-method':
      case 'stateful-tree-method':
        this.#tree.properties.push(
          b.objectMethod(
            'method',
            b.stringLiteral(this.ctx.id),
            placement === 'stateful-tree-method'
              ? statefulFnParams
              : statelessFnParams,
            node,
          ),
        );
        break;
      case 'program':
        if (!this.#program.has(node)) {
          this.#program.add(node);
        }

        break;
      case 'body':
        if (!this.#body.has(node)) {
          this.#body.add(node);
        }

        break;
      case 'traverse':
        this.#traverse.add(treeMethodCall(node.value, statelessFnParams));
        break;
      case 'stateful-traverse': {
        this.#states += 1;
        const id = b.identifier(`state${this.#states}`);
        this.push(
          b.variableDeclaration('const', [
            b.variableDeclarator(id, b.callExpression(scope.allocState, [])),
          ]),
          'body',
        );

        this.#traverse.add(treeMethodCall(node.value, [scope._, id]));
        break;
      }
    }
  }

  pushAll(items) {
    for (const item of items) {
      this.push(...item);
    }
  }

  export(format) {
    const traversalZones = this.traversalZones.root;

    const program = b.program(
      [
        ...this.#program,
        traversalZones,
        this.#tree.properties.length === 0
          ? null
          : b.variableDeclaration('const', [
              b.variableDeclarator(internalScope.tree, this.#tree),
            ]),
        this.#shorthands.properties.length === 0
          ? null
          : b.variableDeclaration('const', [
              b.variableDeclarator(internalScope.shorthands, this.#shorthands),
            ]),
        b.functionDeclaration(
          null,
          params,
          b.blockStatement(
            [
              NEW_SCOPE_VARIABLE_DECLARATION,
              b.tryStatement(
                b.blockStatement(
                  [
                    ...this.#body,
                    this.#traverse.size === 0
                      ? null
                      : b.expressionStatement(
                          b.callExpression(scope.traverse, [
                            b.arrowFunctionExpression(
                              [],
                              b.blockStatement(Array.from(this.#traverse)),
                            ),
                            traversalZones === null
                              ? b.nullLiteral()
                              : traversalZones.declarations[0].id,
                          ]),
                        ),
                  ].filter(Boolean),
                ),
                null,
                b.blockStatement([
                  b.expressionStatement(b.callExpression(scope.destroy, [])),
                ]),
              ),
            ].filter(Boolean),
          ),
        ),
      ].filter(Boolean),
    );

    const mod = format === 'esm' ? esm : commonjs;
    mod(Array.from(this.#runtimeDependencies), program);

    return astring(program);
  }
}
