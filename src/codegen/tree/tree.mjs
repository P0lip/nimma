import jsep from '../../parser/jsep.mjs';
import * as b from '../ast/builders.mjs';
import astring from '../dump.mjs';
import generateAllocState from '../templates/alloc-state.mjs';
import { statefulFnParams } from '../templates/fn-params.mjs';
import internalScope from '../templates/internal-scope.mjs';
import scope from '../templates/scope.mjs';
import generateTreeMethod from '../templates/tree-method.mjs';
import {
  generateStatefulTreeMethodCall,
  generateTreeMethodCall,
} from '../templates/tree-method-call.mjs';
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
  #hashes;
  #tree = b.objectExpression([]);
  #shorthands = b.objectExpression([]);
  #runtimeDependencies;
  #traverse = [];
  #availableShorthands;
  #states = -1;

  constructor({ hashes, customShorthands }) {
    this.#hashes = hashes;
    this.cacheInfo = {};
    this.body = [];
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

  addTreeMethod(id, block, scope) {
    this.cacheInfo[id.value] = {
      hash: this.#hashes.getHash(id.value),
      scope,
    };

    if (scope === 'stateful-traverse') {
      const state = generateAllocState(++this.#states);
      this.body.push(state);
      this.#tree.properties.push(generateTreeMethod(id, block, true));
      this.#traverse.push(generateStatefulTreeMethodCall(id, state));
      return;
    }

    this.#tree.properties.push(generateTreeMethod(id, block, false));

    const call = generateTreeMethodCall(id);
    if (scope === 'traverse') {
      this.#traverse.push(call);
    } else {
      this.body.push(call);
    }
  }

  export(format) {
    const traversalZones = this.traversalZones.build();

    const program = b.program(
      [
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
                    ...this.body,
                    this.#traverse.length === 0
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
