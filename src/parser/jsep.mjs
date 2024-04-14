/* eslint-disable sort-keys */
// this is a custom fork of jsep
// certain functionalities were dropped,
// and it re-uses parts of code from Nimma's own JSON Path expression parser
import regex from '@jsep-plugin/regex';
import ternary from '@jsep-plugin/ternary';

import { parseString } from './shared.mjs';
import { isChar, isDigit, skipWhitespace } from './utils.mjs';

/**
 * @license
 * Copyright (c) 2013 Stephen Oney, https://ericsmekens.github.io/jsep/, Jakub Rożek
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @implements {IHooks}
 */
class Hooks {
  /**
   * @callback HookCallback
   * @this {*|Jsep} this
   * @param {Jsep} env
   * @returns: void
   */
  /**
   * Adds the given callback to the list of callbacks for the given hook.
   *
   * The callback will be invoked when the hook it is registered for is run.
   *
   * One callback function can be registered to multiple hooks and the same hook multiple times.
   *
   * @param {string} name The name of the hook, or an object of callbacks keyed by name
   * @param {HookCallback|boolean} callback The callback function which is given environment variables.
   * @public
   */
  add(name, callback) {
    this[name] ??= [];
    this[name].push(callback);
  }

  /**
   * Runs a hook invoking all registered callbacks with the given environment variables.
   *
   * Callbacks will be invoked synchronously and in the order in which they were registered.
   *
   * @param {string} name The name of the hook.
   * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
   * @public
   */
  run(name, env) {
    this[name] ??= [];
    for (const callback of this[name]) {
      callback.call(env?.context, env);
    }
  }
}

/**
 * @implements {IPlugins}
 */
class Plugins {
  constructor(jsep) {
    this.jsep = jsep;
    this.registered = {};
  }

  /**
   * @callback PluginSetup
   * @this {Jsep} jsep
   * @returns: void
   */
  /**
   * Adds the given plugin(s) to the registry
   *
   * @param {object} plugins
   * @param {string} plugins.name The name of the plugin
   * @param {PluginSetup} plugins.init The init function
   * @public
   */
  register(...plugins) {
    for (const plugin of plugins) {
      plugin.init(this.jsep);
      this.registered[plugin.name] = plugin;
    }
  }
}

export default class Jsep {
  /**
   * @returns {string}
   */
  get char() {
    return this.expr.charAt(this.index);
  }

  /**
   * @returns {number}
   */
  get code() {
    return this.expr.charCodeAt(this.index);
  }

  /**
   * @param {string} expr a string with the passed in express
   * @returns Jsep
   */
  constructor(expr) {
    // `index` stores the character number we are currently at
    // All of the gobbles below will modify `index` as we move along
    this.expr = expr;
    this.index = 0;
  }

  /**
   * static top-level parser
   * @returns {jsep.Expression}
   */
  static parse(expr) {
    return new Jsep(expr).parse();
  }

  /**
   * Returns the precedence of a binary operator.
   * @param {string} op_val
   * @returns {number}
   */
  static binaryPrecedence(op_val) {
    return Jsep.binary_ops[op_val];
  }

  /**
   * Looks for start of identifier
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierStart(ch) {
    return (
      isChar(ch) ||
      (ch >= 128 && !Jsep.binary_ops[String.fromCharCode(ch)]) || // any non-ASCII that is not an operator
      ch === 0x5f || // '_"
      ch === 0x24 || // "$"
      ch === 0x40 // "@"
    );
  }

  /**
   * @param {number} ch
   * @returns {boolean}
   */
  static isIdentifierPart(ch) {
    return Jsep.isIdentifierStart(ch) || isDigit(ch);
  }

  /**
   * throw error at index of the expression
   * @param {string} message
   * @throws
   */
  throwError(message) {
    throw new SyntaxError(`${message} at ${this.index}.`);
  }

  /**
   * Run a given hook
   * @param {string} name
   * @param {jsep.Expression|false} [node]
   * @returns {?jsep.Expression}
   */
  runHook(name, node) {
    if (Jsep.hooks[name]) {
      const env = { context: this, node };
      Jsep.hooks.run(name, env);
      return env.node;
    }
    return node;
  }

  /**
   * Runs a given hook until one returns a node
   * @param {string} name
   * @returns {?jsep.Expression}
   */
  searchHook(name) {
    if (Jsep.hooks[name]) {
      const env = { context: this };
      Jsep.hooks[name].find(function (callback) {
        callback.call(env.context, env);
        return env.node;
      });
      return env.node;
    }
  }

  /**
   * Push `index` up to the next non-space character
   */
  gobbleSpaces() {
    const ctx = { expr: this.expr, i: this.index };
    skipWhitespace(ctx);
    this.index = ctx.i;
    this.runHook('gobble-spaces');
  }

  /**
   * Top-level method to parse the first expression
   * @returns {jsep.Expression}
   */
  parse() {
    this.runHook('before-all');
    const node = this.gobbleExpression();
    // If there's only one expression just try returning the expression
    return this.runHook('after-all', node);
  }

  /**
   * The main parsing function.
   * @returns {?jsep.Expression}
   */
  gobbleExpression() {
    const node =
      this.searchHook('gobble-expression') || this.gobbleBinaryExpression();
    this.gobbleSpaces();

    return this.runHook('after-expression', node);
  }

  /**
   * Search for the operation portion of the string (e.g. `+`, `===`)
   * Start by taking the longest possible binary operations (3 characters: `===`, `!==`, `>>>`)
   * and move down from 3 to 2 to 1 character until a matching binary operation is found
   * then, return that binary operation
   * @returns {string|boolean}
   */
  gobbleBinaryOp() {
    this.gobbleSpaces();
    let to_check = this.expr.slice(this.index, this.index + Jsep.max_binop_len);
    let tc_len = to_check.length;

    while (tc_len > 0) {
      // Don't accept a binary op when it is an identifier.
      // Binary ops that start with a identifier-valid character must be followed
      // by a non identifier-part valid character
      if (
        Object.hasOwn(Jsep.binary_ops, to_check) &&
        (!Jsep.isIdentifierStart(this.code) ||
          (this.index + to_check.length < this.expr.length &&
            !Jsep.isIdentifierPart(
              this.expr.charCodeAt(this.index + to_check.length),
            )))
      ) {
        this.index += tc_len;
        return to_check;
      }
      to_check = to_check.substr(0, --tc_len);
    }
    return false;
  }

  /**
   * This function is responsible for gobbling an individual expression,
   * e.g. `1`, `1+2`, `a+(b*2)-Math.sqrt(2)`
   * @returns {?jsep.BinaryExpression}
   */
  gobbleBinaryExpression() {
    let node, biop, prec, stack, biop_info, left, right, i, cur_biop;

    // First, try to get the leftmost thing
    // Then, check to see if there's a binary operator operating on that leftmost thing
    // Don't gobbleBinaryOp without a left-hand-side
    left = this.gobbleToken();
    if (!left) {
      return left;
    }
    biop = this.gobbleBinaryOp();

    // If there wasn't a binary operator, just return the leftmost node
    if (!biop) {
      return left;
    }

    // Otherwise, we need to start a stack to properly place the binary operations in their
    // precedence structure
    biop_info = {
      value: biop,
      prec: Jsep.binaryPrecedence(biop),
    };

    right = this.gobbleToken();

    if (!right) {
      this.throwError(`Expected expression after "${biop}"`);
    }

    stack = [left, biop_info, right];

    // Properly deal with precedence using [recursive descent](http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm)
    while ((biop = this.gobbleBinaryOp())) {
      prec = Jsep.binaryPrecedence(biop);

      biop_info = {
        value: biop,
        prec,
      };

      cur_biop = biop;

      // Reduce: make a binary expression from the three topmost entries.
      const comparePrev = prev => prec <= prev.prec;
      while (stack.length > 2 && comparePrev(stack[stack.length - 2])) {
        right = stack.pop();
        biop = stack.pop().value;
        left = stack.pop();
        node = {
          type: Jsep.BINARY_EXP,
          operator: biop,
          left,
          right,
        };
        stack.push(node);
      }

      node = this.gobbleToken();

      if (!node) {
        this.throwError(`Expected expression after "${cur_biop}"`);
      }

      stack.push(biop_info, node);
    }

    i = stack.length - 1;
    node = stack[i];

    while (i > 1) {
      node = {
        type: Jsep.BINARY_EXP,
        operator: stack[i - 1].value,
        left: stack[i - 2],
        right: node,
      };
      i -= 2;
    }

    return node;
  }

  /**
   * An individual part of a binary expression:
   * e.g. `foo.bar(baz)`, `1`, `"abc"`, `(a % 2)` (because it's in parentheses)
   * @returns {boolean|jsep.Expression|jsep.Literal}
   */
  gobbleToken() {
    let ch, to_check, tc_len, node;

    this.gobbleSpaces();
    node = this.searchHook('gobble-token');
    if (node) {
      return this.runHook('after-token', node);
    }

    ch = this.code;

    if (isDigit(ch) || ch === Jsep.PERIOD_CODE) {
      // Char code 46 is a dot `.` which can start off a numeric literal
      return this.gobbleNumericLiteral();
    }

    if (ch === Jsep.SQUOTE_CODE || ch === Jsep.DQUOTE_CODE) {
      // Single or double quotes
      node = this.gobbleStringLiteral();
    } else if (ch === Jsep.OBRACK_CODE) {
      node = this.gobbleArray();
    } else {
      to_check = this.expr.slice(this.index, this.index + Jsep.max_unop_len);
      tc_len = to_check.length;

      while (tc_len > 0) {
        // Don't accept an unary op when it is an identifier.
        // Unary ops that start with a identifier-valid character must be followed
        // by a non identifier-part valid character
        if (
          Object.hasOwn(Jsep.unary_ops, to_check) &&
          (!Jsep.isIdentifierStart(this.code) ||
            (this.index + to_check.length < this.expr.length &&
              !Jsep.isIdentifierPart(
                this.expr.charCodeAt(this.index + to_check.length),
              )))
        ) {
          this.index += tc_len;
          const argument = this.gobbleToken();
          if (!argument) {
            this.throwError(`Expected argument but "${this.char}" found`);
          }
          return this.runHook('after-token', {
            type: Jsep.UNARY_EXP,
            operator: to_check,
            argument,
            prefix: true,
          });
        }

        to_check = to_check.substr(0, --tc_len);
      }

      if (Jsep.isIdentifierStart(ch)) {
        node = this.gobbleIdentifier();
        if (Object.hasOwn(Jsep.literals, node.name)) {
          node = {
            type: Jsep.LITERAL,
            value: Jsep.literals[node.name],
            raw: node.name,
          };
        }
      } else if (ch === Jsep.OPAREN_CODE) {
        // open parenthesis
        node = this.gobbleGroup();
      }
    }

    if (!node) {
      return this.runHook('after-token', false);
    }

    node = this.gobbleTokenProperty(node);
    return this.runHook('after-token', node);
  }

  /**
   * Gobble properties of identifiers/strings/arrays/groups.
   * e.g. `foo`, `bar.baz`, `foo['bar'].baz`
   * It also gobbles function calls:
   * e.g. `Math.acos(obj.angle)`
   * @param {jsep.Expression} node
   */
  gobbleTokenProperty(node) {
    this.gobbleSpaces();

    let ch = this.code;
    while (
      ch === Jsep.PERIOD_CODE ||
      ch === Jsep.OBRACK_CODE ||
      ch === Jsep.OPAREN_CODE ||
      ch === Jsep.QUMARK_CODE
    ) {
      this.index++;

      if (ch === Jsep.OBRACK_CODE) {
        node = {
          type: Jsep.MEMBER_EXP,
          computed: true,
          object: node,
          property: this.gobbleExpression(),
        };
        this.gobbleSpaces();
        ch = this.code;
        if (ch !== Jsep.CBRACK_CODE) {
          this.throwError(`Expected "]" but "${this.char}" found`);
        }
        this.index++;
      } else if (ch === Jsep.OPAREN_CODE) {
        // A function call is being made; gobble all thQUMARK_CODEe arguments
        node = {
          type: Jsep.CALL_EXP,
          arguments: this.gobbleArguments(Jsep.CPAREN_CODE),
          callee: node,
        };
      } else if (ch === Jsep.PERIOD_CODE) {
        this.gobbleSpaces();
        node = {
          type: Jsep.MEMBER_EXP,
          computed: false,
          object: node,
          property: this.gobbleIdentifier(),
        };
      }

      this.gobbleSpaces();
      ch = this.code;
    }

    return node;
  }

  /**
   * Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
   * keep track of everything in the numeric literal and then calling `parseFloat` on that string
   * @returns {jsep.Literal}
   */
  gobbleNumericLiteral() {
    const { expr } = this;
    const start = this.index;
    let isDecimal = false;
    while (isDigit(expr.charCodeAt(this.index))) {
      this.index++;
    }

    if (this.code === Jsep.PERIOD_CODE) {
      this.index++;
      isDecimal = true;
      // can start with a decimal marker
      while (isDigit(expr.charCodeAt(this.index))) {
        this.index++;
      }
    }

    const number = expr.slice(start, this.index);
    const chCode = this.code;

    // Check to make sure this isn't a variable name that start with a number (123abc)
    if (Jsep.isIdentifierStart(chCode)) {
      this.throwError(
        `Expected [0-9]${isDecimal ? '' : ' or "."'} but "${this.char}" found`,
      );
    } else if (
      chCode === Jsep.PERIOD_CODE ||
      (number.length === 1 && isDecimal)
    ) {
      this.throwError('Unexpected "."');
    }

    return {
      type: Jsep.LITERAL,
      value: parseFloat(number),
      raw: number,
    };
  }

  /**
   * Parses a string literal, staring with single or double quotes with basic support for escape codes
   * e.g. `"hello world"`, `'this is\nJSEP'`
   * @returns {jsep.Literal}
   */
  gobbleStringLiteral() {
    const startIndex = this.index;
    const ctx = {
      expr: this.expr,
      i: this.index,
    };
    const value = parseString(ctx).slice(1, -1);
    this.index = ctx.i;

    return {
      type: Jsep.LITERAL,
      value,
      raw: this.expr.substring(startIndex, this.index),
    };
  }

  /**
   * Gobbles only identifiers
   * e.g.: `foo`, `_value`, `$x1`
   * Also, this function checks if that identifier is a literal:
   * (e.g. `true`, `false`, `null`) or `this`
   * @returns {jsep.Identifier}
   */
  gobbleIdentifier() {
    let ch = this.code,
      start = this.index;

    if (Jsep.isIdentifierStart(ch)) {
      this.index++;
    } else {
      this.throwError(
        `Expected a valid identifier char but "${this.char}" found`,
      );
    }

    while (this.index < this.expr.length) {
      ch = this.code;

      if (Jsep.isIdentifierPart(ch)) {
        this.index++;
      } else {
        break;
      }
    }
    return {
      type: Jsep.IDENTIFIER,
      name: this.expr.slice(start, this.index),
    };
  }

  /**
   * Gobbles a list of arguments within the context of a function call
   * or array literal. This function also assumes that the opening character
   * `(` or `[` has already been gobbled, and gobbles expressions and commas
   * until the terminator character `)` or `]` is encountered.
   * e.g. `foo(bar, baz)`, `my_func()`, or `[bar, baz]`
   * @param {number} termination
   * @returns {jsep.Expression[]}
   */
  gobbleArguments(termination) {
    const args = [];
    let separator_count = 0;

    while (this.index < this.expr.length) {
      this.gobbleSpaces();
      const { code } = this;

      if (code === termination) {
        // done parsing
        this.index++;

        if (separator_count && separator_count >= args.length) {
          this.throwError(
            `Expected "${String.fromCharCode(termination)}" but "," found`,
          );
        }

        break;
      } else if (code === Jsep.COMMA_CODE) {
        // between expressions
        this.index++;
        separator_count++;

        if (separator_count !== args.length) {
          // missing argument
          this.throwError('Unexpected ","');
        }
      } else {
        const node = this.gobbleExpression();

        if (!node) {
          this.throwError(
            `Expected "${String.fromCharCode(termination)}" or "," but "${this.char}" found`,
          );
        }

        args.push(node);
      }
    }

    return args;
  }

  /**
   * Responsible for parsing a group of things within parentheses `()`
   * that have no identifier in front (so not a function call)
   * This function assumes that it needs to gobble the opening parenthesis
   * and then tries to gobble everything within that parenthesis, assuming
   * that the next thing it should see is the close parenthesis. If not,
   * then the expression probably doesn't have a `)`
   * @returns {boolean|jsep.Expression}
   */
  gobbleGroup() {
    this.index++;
    let node = this.gobbleExpression();
    if (this.code === Jsep.CPAREN_CODE) {
      this.index++;
      return node;
    } else {
      this.throwError(`Expected ")" but "${this.char}" found`);
    }
  }

  /**
   * Responsible for parsing Array literals `[1, 2, 3]`
   * This function assumes that it needs to gobble the opening bracket
   * and then tries to gobble the expressions as arguments.
   * @returns {jsep.ArrayExpression}
   */
  gobbleArray() {
    this.index++;

    return {
      type: Jsep.ARRAY_EXP,
      elements: this.gobbleArguments(Jsep.CBRACK_CODE),
    };
  }

  static hooks = new Hooks();
  static plugins = new Plugins(Jsep);

  // Node Types
  // ----------
  // This is the full set of types that any JSEP node can be.
  // Store them here to save space when minified
  static IDENTIFIER = 'Identifier';
  static MEMBER_EXP = 'MemberExpression';
  static LITERAL = 'Literal';
  static CALL_EXP = 'CallExpression';
  static UNARY_EXP = 'UnaryExpression';
  static BINARY_EXP = 'BinaryExpression';
  static ARRAY_EXP = 'ArrayExpression';

  static PERIOD_CODE = 46; // '.'
  static COMMA_CODE = 44; // ','
  static SQUOTE_CODE = 39; // single quote
  static DQUOTE_CODE = 34; // double quotes
  static OPAREN_CODE = 40; // (
  static CPAREN_CODE = 41; // )
  static OBRACK_CODE = 91; // [
  static CBRACK_CODE = 93; // ]
  static QUMARK_CODE = 63; // ?
  static COLON_CODE = 58; // :

  // Operations
  // ----------
  // Use a quickly-accessible map to store all of the unary operators
  // Values are set to `1` (it really doesn't matter)
  static unary_ops = {
    '-': 1,
    '!': 1,
    '~': 1,
    '+': 1,
    void: 1,
  };

  // Also use a map for the binary operations but set their values to their
  // binary precedence for quick reference (higher number = higher precedence)
  // see [Order of operations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)
  static binary_ops = {
    '||': 1,
    '&&': 2,
    '|': 3,
    '^': 4,
    '&': 5,
    '==': 6,
    '!=': 6,
    '===': 6,
    '!==': 6,
    '<': 7,
    '>': 7,
    '<=': 7,
    '>=': 7,
    '<<': 8,
    '>>': 8,
    '>>>': 8,
    '+': 9,
    '-': 9,
    '*': 10,
    '/': 10,
    '%': 10,
    in: 12,
    '~=': 20,
  };

  // Literals
  // ----------
  // Store the values to return for the various literals we may encounter
  static literals = {
    true: true,
    false: false,
    null: null,
  };
}

Jsep.max_unop_len = 4;
Jsep.max_binop_len = 3;

Jsep.plugins.register(ternary, regex);
