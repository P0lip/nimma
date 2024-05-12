import Jsep from './jsep.mjs';
import { parseString } from './shared.mjs';
import {
  assertNotEndOfInput,
  eat,
  isChar,
  isDigit,
  isQuote,
  skipWhitespace,
} from './utils.mjs';

/**
 * @typedef {WildcardExpression | MemberExpression | MultipleMemberExpression | SliceExpression | ScriptFilterExpression} Node
 *
 * @typedef {Object} WildcardExpression
 * @property {boolean} deep - Indicates a descendant node.
 *
 * @typedef {Object} MemberExpression
 * @property {string} value - The member name.
 * @property {boolean} deep - Indicates a descendant node.
 *
 * @typedef {Object} MultipleMemberExpression
 * @property {string[]} value - The member names.
 * @property {boolean} deep - Indicates a descendant node.
 *
 * @typedef {Object} SliceExpression
 * @property {[number, number, number]} value - The slice range.
 * @property {boolean} deep - Indicates a descendant node.
 *
 * @typedef {Object} ScriptFilterExpression
 * @property {string} raw - The raw expression.
 * @property {*} value - The parsed expression.
 *
 * @typedef {Object} CustomShorthandExpression
 * @property {string} name - The shorthand name.
 */

/* eslint-disable sort-keys */
/**
 * @param expr
 * @returns {Node[]}
 */
export function parser(expr) {
  if (expr.length === 0) {
    throw SyntaxError('Expected "$" but end of input found.');
  }

  if (expr.charCodeAt(0) !== 0x24 /* "$" */) {
    throw SyntaxError(`Expected "$" but "${expr[0]}" found.`);
  }

  const jsep = new Jsep(expr);
  const nodes = [];

  const ctx = { expr, i: 1 };
  while (ctx.i < expr.length) {
    skipWhitespace(ctx);
    parseNode(ctx, nodes, jsep);
  }

  return nodes;
}

function parseNode(ctx, nodes, jsep) {
  const { expr, i } = ctx;
  switch (true) {
    case expr.charCodeAt(i) === 0x2e /* "." */ &&
      expr.charCodeAt(i + 1) === 0x2e /* "." */: {
      ctx.i += 2;
      const node = parseDeepNode(ctx, jsep);
      if (node.type !== 'AllParentExpression') {
        node.deep = true;
      }
      nodes.push(node);
      break;
    }
    case expr.charCodeAt(i) === 0x2e /* "." */ &&
      expr.charCodeAt(i + 1) === 0x5b /* "[" */: {
      // jsonpath-plus compatibility
      ctx.i += 2;
      const node = parseBracket(ctx, jsep);
      node.deep = true;
      nodes.push(node);
      break;
    }
    case expr.charCodeAt(i) === 0x2e /* "." */:
      ctx.i++;
      if (expr.charCodeAt(ctx.i) === 0x40 /* "@" */) {
        nodes.push(parseShorthand(ctx));
      } else {
        nodes.push(parseNamed(ctx));
      }

      break;
    case expr.charCodeAt(i) === 0x5b /* "[" */:
      ctx.i++;
      nodes.push(parseBracket(ctx, jsep));
      break;
    case expr.charCodeAt(i) === 0x5e /* "^" */:
      do {
        nodes.push({ type: 'ParentExpression' });
      } while (
        ++ctx.i < expr.length &&
        expr.charCodeAt(ctx.i) === 0x5e /* "^ */
      );

      if (expr.charCodeAt(ctx.i) === 0x7e /* "~" */ || ctx.i === expr.length) {
        break;
      }

      throw SyntaxError(
        `Expected "^", "~", or end of input but "${expr[ctx.i]}" found at ${ctx.i}`,
      );
    case expr.charCodeAt(i) === 0x7e /* "~" */:
      nodes.push({ type: 'KeyExpression' });
      while (++ctx.i < expr.length && expr.charCodeAt(ctx.i) === 0x5e /* "^ */);

      if (ctx.i !== expr.length) {
        throw SyntaxError(
          `Expected "^", "~", or end of input but "${expr[ctx.i]}" found at ${ctx.i}.`,
        );
      }

      break;
    case expr.charCodeAt(i) === 0x40 /* "@" */:
      nodes.push(parseShorthand(ctx));
      break;
    default:
      throw SyntaxError(
        `Expected ".", "..", "^", "~", or end of input but "${expr[i]}" found at ${i}.`,
      );
  }
}

function parseDeepNode(ctx, jsep) {
  const { expr } = ctx;
  if (expr.charCodeAt(ctx.i) === 0x5b /* "[" */) {
    ctx.i++;
    return parseBracket(ctx, jsep);
  } else if (expr.charCodeAt(ctx.i) === 0x40 /* "@" */) {
    return parseShorthand(ctx);
  } else if (ctx.i === expr.length) {
    return { type: 'AllParentExpression' };
  } else if (
    expr.charCodeAt(ctx.i) !== 0x7e /* "~" */ &&
    expr.charCodeAt(ctx.i) !== 0x5e /* "^" */
  ) {
    return parseNamed(ctx);
  } else {
    return { type: 'AllParentExpression' };
  }
}

function parseNamed(ctx) {
  if (ctx.expr.charCodeAt(ctx.i) === 0x2a /* "*" */) {
    ctx.i++;
    return { type: 'WildcardExpression', deep: false };
  } else {
    return {
      type: 'MemberExpression',
      value: parseMember(ctx),
      deep: false,
    };
  }
}

function parseBracket(ctx, jsep) {
  assertNotEndOfInput(ctx);
  const { expr } = ctx;
  const code = expr.charCodeAt(ctx.i);
  const start = ctx.i;

  skipWhitespace(ctx);

  if (code === 0x2a /* "*" */) {
    ctx.i++;
    skipWhitespace(ctx);
    eat(ctx, 0x5d /* "]" */);
    return { type: 'WildcardExpression', deep: false };
  } else if (code === 0x3f /* "?" */) {
    ctx.i++;
    eat(ctx, 0x28 /* "(" */);
    return parseScriptFilterExpression(ctx, jsep);
  } else if (code === 0x28 /* "(" */) {
    ctx.i++;
    return parseFilterExpression(ctx);
  }

  const members = [];
  while (ctx.i < expr.length) {
    const code = expr.charCodeAt(ctx.i);
    if (code === 0x3a /* ":" */ || code === 0x2d /* "-" */) {
      ctx.i = start;
      return parseSliceExpression(ctx);
    }

    if (isQuote(code)) {
      members.push(parseString(ctx).slice(1, -1));
    } else {
      members.push(parseMember(ctx));
    }

    if (expr.charCodeAt(ctx.i) === 0x3a /* ":" */) {
      ctx.i = start;
      return parseSliceExpression(ctx);
    }

    skipWhitespace(ctx);
    if (expr.charCodeAt(ctx.i) !== 0x2c /* "," */) {
      break;
    } else {
      ctx.i++;
    }
  }

  eat(ctx, 0x5d /* "]" */);
  if (members.length === 1) {
    return {
      type: 'MemberExpression',
      value: members[0],
      deep: false,
    };
  } else {
    return {
      type: 'MultipleMemberExpression',
      value: members,
      deep: false,
    };
  }
}

function parseSliceExpression(ctx) {
  const ranges = [0, Infinity, 1];
  const { expr } = ctx;
  let index = 0;
  while (ctx.i < expr.length && index < 3) {
    const code = expr.charCodeAt(ctx.i);
    if (code === 0x5d /* "]" */) {
      break;
    } else if (code === 0x3a /* ":" */) {
      index++;
      ctx.i++;
    } else {
      ranges[index] = parseNumber(ctx);
    }
  }

  eat(ctx, 0x5d /* "]" */);
  return { type: 'SliceExpression', value: ranges, deep: false };
}

function parseScriptFilterExpression(ctx, jsep) {
  const start = ctx.i - 1;
  jsep.index = start;
  const value = jsep.parse();
  ctx.i = jsep.index;
  eat(ctx, 0x5d /* "]" */);
  return {
    type: 'ScriptFilterExpression',
    raw: ctx.expr.slice(start, ctx.i - 1),
    value,
    deep: false,
  };
}

function parseFilterExpression(ctx) {
  skipWhitespace(ctx);
  eat(ctx, 0x40 /* "@" */);
  skipWhitespace(ctx);

  assertNotEndOfInput(ctx, `"." or "["`);

  const { expr, i } = ctx;

  let member;

  switch (expr.charCodeAt(i)) {
    case 0x2e /* "." */:
      member = expr.slice(i + 1, i + 7);
      ctx.i += 7;
      break;
    case 0x5b /* "[" */:
      ctx.i++;
      skipWhitespace(ctx);
      member = parseString(ctx).slice(1, -1);
      skipWhitespace(ctx);
      eat(ctx, 0x5d /* "]" */);
      break;
    default:
      throw SyntaxError(`Expected "." or "[" but "${expr[i]}" found at ${i}.`);
  }

  if (member !== 'length') {
    throw SyntaxError(`Expected "length" but "${member}" found at ${ctx.i}.`);
  }

  skipWhitespace(ctx);
  eat(ctx, 0x2d /* "-" */);
  skipWhitespace(ctx);

  const start = ctx.i;
  const number = parseNumber(ctx);

  if (number <= 0) {
    throw SyntaxError(
      `Expected positive number but "${number}" found at ${start}.`,
    );
  }

  skipWhitespace(ctx);
  eat(ctx, 0x29 /* ")" */);
  skipWhitespace(ctx);
  eat(ctx, 0x5d /* "]" */);

  return {
    type: 'SliceExpression',
    value: [-number, Infinity, 1],
    deep: false,
  };
}

function parseNumber(ctx) {
  const { expr } = ctx;
  let { i } = ctx;
  const start = i;

  if (expr.charCodeAt(i) === 0x2d /* "-" */) {
    i++;

    if (!isDigit(expr.charCodeAt(i))) {
      throw SyntaxError(`Expected [0-9] but "${expr[i]}" found at ${i}.`);
    }
  }

  while (i < expr.length && isDigit(expr.charCodeAt(i))) {
    i++;
  }

  if (start === i) {
    assertNotEndOfInput(ctx, '"-" or [0-9]');
    throw SyntaxError(`Expected "-" or [0-9] but "${expr[i]}" found at ${i}.`);
  }

  ctx.i = i;
  return Number.parseInt(expr.slice(start, i), 10);
}

function parseMember(ctx) {
  const { expr } = ctx;
  let { i } = ctx;

  // jsonpath-plus compatibility
  if (isQuote(expr.charCodeAt(i))) {
    return parseString(ctx).slice(1, -1);
  }

  const start = i;
  let hasOnlyDigits = true;

  while (i < expr.length) {
    const code = expr.charCodeAt(i);
    if (
      code === 0x24 /* "$" */ ||
      code === 0x5f /* "_" */ ||
      code === 0x2d /* "-" ; for compat with JSONPath-plus */ ||
      code === 0x2f /* "/" ; for compat with JSONPath-plus */
    ) {
      i++;
      hasOnlyDigits &&= false;
    } else if (isChar(code)) {
      i++;
      hasOnlyDigits &&= false;
    } else if (isDigit(code)) {
      i++;
    } else {
      break;
    }
  }

  if (start === i) {
    assertNotEndOfInput(ctx, 'valid name');
    throw SyntaxError(`Expected valid name but "${expr[i]}" found at ${i}.`);
  }

  ctx.i = i;
  const member = expr.slice(start, i);
  return hasOnlyDigits ? Number.parseInt(member, 10) : member;
}

function parseShorthand(ctx) {
  const { expr } = ctx;
  let { i } = ctx;
  let start = i;

  ctx.i = ++i;

  if (i < expr.length && expr.charCodeAt(i) === 0x40 /* "@" */) {
    ctx.i = ++i;
    return parseCustomShorthand(ctx);
  }

  ctx.i = i;
  assertNotEndOfInput(ctx, '[a-z]');

  if (!isChar(expr.charCodeAt(i))) {
    throw SyntaxError(`Expected [a-z] but "${expr[i]}" found at ${i}.`);
  }

  while (++i < expr.length && isChar(expr.charCodeAt(i)));

  const name = expr.slice(start, i);
  ctx.i = i;
  skipWhitespace(ctx);
  eat(ctx, 0x28 /* "(" */);
  skipWhitespace(ctx);
  eat(ctx, 0x29 /* ")" */);

  return {
    type: 'ScriptFilterExpression',
    raw: name + expr.slice(start + name.length, ctx.i),
    value: {
      type: 'CallExpression',
      arguments: [],
      callee: {
        type: 'Identifier',
        name,
      },
    },
    deep: false,
  };
}

function parseCustomShorthand(ctx) {
  assertNotEndOfInput(ctx, '[a-z]');

  const { expr } = ctx;
  let { i } = ctx;
  let start = i;

  if (!isChar(expr.charCodeAt(i))) {
    throw SyntaxError(`Expected [a-z] but "${expr[i]}" found at ${i}.`);
  }

  while (++i < expr.length) {
    const code = expr.charCodeAt(i);
    if (!isDigit(code) && !isChar(code)) {
      break;
    }
  }

  const name = expr.slice(start, i);
  ctx.i = i;
  skipWhitespace(ctx);
  eat(ctx, 0x28 /* "(" */);
  skipWhitespace(ctx);
  assertNotEndOfInput(ctx, '[0-9]');

  i = ctx.i;
  start = i;
  while (isDigit(expr.charCodeAt(i))) i++;
  if (start === i) {
    throw SyntaxError(`Expected [0-9] but "${expr[i]}" found at ${i}.`);
  }

  const depth = Number.parseInt(expr.slice(start, i), 10);
  ctx.i = i;

  skipWhitespace(ctx);
  eat(ctx, 0x29 /* ")" */);

  return {
    type: 'CustomShorthandExpression',
    value: name,
    arguments: [depth],
    deep: false,
  };
}
