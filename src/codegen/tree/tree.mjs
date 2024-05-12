import * as b from '../ast/builders.mjs';
import astring from '../dump.mjs';
import generateAllocState from '../templates/alloc-state.mjs';
import internalScope from '../templates/internal-scope.mjs';
import scope from '../templates/scope.mjs';
import generateTreeMethod from '../templates/tree-method.mjs';
import { generateTreeMethodCall } from '../templates/tree-method-call.mjs';
import { NEEDS_SHORTHANDS, NEEDS_STATE, NEEDS_TRAVERSAL } from './consts.mjs';
import commonjs from './modules/commonjs.mjs';
import esm from './modules/esm.mjs';
import TraversalZones from './traversal-zones.mjs';

const DEFAULT_PARAMS = [b.identifier('input'), b.identifier('callbacks')];

const NEW_SCOPE_VARIABLE_DECLARATION = b.variableDeclaration('const', [
  b.variableDeclarator(
    scope._,
    b.newExpression(b.identifier('Scope'), DEFAULT_PARAMS),
  ),
]);

export default class ESTree {
  #tree = b.objectExpression([]);
  #hasShorthands = false;
  #runtimeDependencies;
  #traverse = [];
  #states = -1;

  constructor() {
    this.body = [];
    this.traversalZones = new TraversalZones();
    this.#runtimeDependencies = new Map([['Scope', 'Scope']]);
  }

  /**
   * @param {string} specifier
   */
  addRuntimeDependency(specifier) {
    this.#runtimeDependencies.set(specifier, specifier);
  }

  /**
   * @param hash
   * @returns {*}
   */
  getMethodByHash(hash) {
    return this.#tree.properties.find(prop => prop.key.value === hash);
  }

  /**
   * @param {Object} id
   * @param {'StringLiteral'} id.type
   * @param {string} id.value
   * @param {Object} block
   * @param {number} feedback
   */
  addTreeMethod(id, block, feedback) {
    let state;
    if ((feedback & NEEDS_STATE) > 0) {
      state = generateAllocState(++this.#states);
      this.body.push(state);
    } else {
      state = null;
    }

    const needsShorthands = (feedback & NEEDS_SHORTHANDS) > 0;
    this.#hasShorthands ||= needsShorthands;

    this.#tree.properties.push(generateTreeMethod(id, block, feedback));
    const call = generateTreeMethodCall(id, state, needsShorthands);
    ((feedback & NEEDS_TRAVERSAL) > 0 ? this.#traverse : this.body).push(call);
  }

  /**
   * Generates JS code based on the underlying ESTree
   * @param {'esm'|'commonjs'} format
   * @returns {string}
   */
  export(format) {
    const traversalZones = this.traversalZones.build();
    const params = this.#hasShorthands
      ? [...DEFAULT_PARAMS, internalScope.shorthands]
      : DEFAULT_PARAMS;

    const program = b.program(
      [
        traversalZones,
        this.#tree.properties.length === 0
          ? null
          : b.variableDeclaration('const', [
              b.variableDeclarator(internalScope.tree, this.#tree),
            ]),
        b.functionDeclaration(
          null,
          params,
          b.blockStatement([
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
          ]),
        ),
      ].filter(Boolean),
    );

    const mod = format === 'esm' ? esm : commonjs;
    mod(Array.from(this.#runtimeDependencies), program);

    return astring(program);
  }
}
