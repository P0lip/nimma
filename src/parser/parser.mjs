/* eslint-disable sort-keys */
export function parser(expr) {
  if (expr.length === 0) {
    throw SyntaxError('Expected "$" but end of input found.');
  }

  if (expr.charCodeAt(0) !== 0x24 /* "$" */) {
    throw SyntaxError(`Expected "$" but "${expr[0]}" found.`);
  }

  const nodes = [];
  let descendant = false;

  let i = 1;
  while (i < expr.length) {
    skipWhitespace();
    parseNode();
  }

  return nodes;

  function parseNode() {
    descendant = false;

    switch (true) {
      case expr.charCodeAt(i) === 0x2e /* "." */ &&
        expr.charCodeAt(i + 1) === 0x2e /* "." */:
        i += 2;
        descendant = true;

        if (expr.charCodeAt(i) === 0x5b /* "[" */) {
          i++;
          nodes.push(parseBracket());
        } else if (expr.charCodeAt(i) === 0x40 /* "@" */) {
          nodes.push(parseCustomShorthand());
        } else if (i === expr.length) {
          nodes.push({ type: 'AllParentExpression' });
        } else if (
          expr.charCodeAt(i) !== 0x7e /* "~" */ &&
          expr.charCodeAt(i) !== 0x5e /* "^" */
        ) {
          nodes.push(parseNamed());
        } else {
          nodes.push({ type: 'AllParentExpression' });
        }

        break;
      case expr.charCodeAt(i) === 0x2e /* "." */ &&
        expr.charCodeAt(i + 1) === 0x5b /* "[" */:
        // jsonpath-plus compatibility
        descendant = true;
        i += 2;
        nodes.push(parseBracket());
        break;
      case expr.charCodeAt(i) === 0x2e /* "." */:
        i++;
        if (expr.charCodeAt(i) === 0x40 /* "@" */) {
          nodes.push(parseCustomShorthand());
        } else {
          nodes.push(parseNamed());
        }

        break;
      case expr.charCodeAt(i) === 0x5b /* "[" */:
        i++;
        nodes.push(parseBracket());
        break;
      case expr.charCodeAt(i) === 0x5e /* "^" */:
        do {
          nodes.push({ type: 'ParentExpression' });
        } while (++i < expr.length && expr.charCodeAt(i) === 0x5e /* "^ */);

        if (expr.charCodeAt(i) === 0x7e /* "~" */ || i === expr.length) {
          break;
        }

        throw SyntaxError(
          `Expected "^", "~", or end of input but "${expr[i]}" found at ${i}`,
        );
      case expr.charCodeAt(i) === 0x7e /* "~" */:
        nodes.push({ type: 'KeyExpression' });
        while (++i < expr.length && expr.charCodeAt(i) === 0x5e /* "^ */);

        if (i !== expr.length) {
          throw SyntaxError(
            `Expected "^", "~", or end of input but "${expr[i]}" found at ${i}.`,
          );
        }

        break;
      case expr.charCodeAt(i) === 0x40 /* "@" */:
        nodes.push(parseCustomShorthand());
        break;
      default:
        throw SyntaxError(
          `Expected ".", "..", "^", "~", or end of input but "${expr[i]}" found at ${i}.`,
        );
    }
  }

  function parseNamed() {
    if (expr.charCodeAt(i) === 0x2a /* "*" */) {
      i++;
      return { type: 'WildcardExpression', deep: descendant };
    } else {
      return {
        type: 'MemberExpression',
        value: parseMember(),
        deep: descendant,
      };
    }
  }

  function parseBracket() {
    assertNotEndOfInput();
    const code = expr.charCodeAt(i);
    const start = i;

    skipWhitespace();

    if (code === 0x2a /* "*" */) {
      i++;
      skipWhitespace();
      eat(0x5d /* "]" */);
      return { type: 'WildcardExpression', deep: descendant };
    } else if (code === 0x3f /* "?" */) {
      i++;
      eat(0x28 /* "(" */);
      return parseScriptFilterExpression();
    } else if (code === 0x28 /* "(" */) {
      i++;
      return parseFilterExpression();
    }

    const members = [];
    while (i < expr.length) {
      const code = expr.charCodeAt(i);
      if (code === 0x3a /* ":" */ || code === 0x2d /* "-" */) {
        i = start;
        return parseSliceExpression();
      }

      if (isQuote(code)) {
        members.push(parseString().slice(1, -1));
      } else {
        members.push(parseMember());
      }

      if (expr.charCodeAt(i) === 0x3a /* ":" */) {
        i = start;
        return parseSliceExpression();
      }

      skipWhitespace();
      if (expr.charCodeAt(i) !== 0x2c /* "," */) {
        break;
      } else {
        i++;
      }
    }

    eat(0x5d /* "]" */);
    if (members.length === 1) {
      return {
        type: 'MemberExpression',
        value: members[0],
        deep: descendant,
      };
    } else {
      return {
        type: 'MultipleMemberExpression',
        value: members,
        deep: descendant,
      };
    }
  }

  function parseSliceExpression() {
    const ranges = [0, Infinity, 1];
    let index = 0;
    while (i < expr.length && index < 3) {
      const code = expr.charCodeAt(i);
      if (code === 0x5d /* "]" */) {
        break;
      } else if (code === 0x3a /* ":" */) {
        index++;
        i++;
      } else {
        ranges[index] = parseNumber();
      }
    }

    eat(0x5d /* "]" */);
    return { type: 'SliceExpression', value: ranges, deep: descendant };
  }

  function parseScriptFilterExpression() {
    let expression = '';
    while (i < expr.length) {
      const code = expr.charCodeAt(i);
      i++;
      if (isQuote(code)) {
        i--;
        expression += parseString();
      } else if (code === 0x28 /* "(" */) {
        expression += parseJsFnCall();
      } else if (code === 0x29 /* ")" */) {
        break;
      } else {
        expression += expr[i - 1];
      }
    }

    eat(0x5d /* "]" */);
    return {
      type: 'ScriptFilterExpression',
      value: expression,
      deep: descendant,
    };
  }

  function parseFilterExpression() {
    skipWhitespace();
    eat(0x40 /* "@" */);
    skipWhitespace();

    assertNotEndOfInput(`"." or "["`);

    let member;

    switch (expr.charCodeAt(i)) {
      case 0x2e /* "." */:
        member = expr.slice(i + 1, i + 7);
        i += 7;
        break;
      case 0x5b /* "[" */:
        i++;
        skipWhitespace();
        member = parseString().slice(1, -1);
        skipWhitespace();
        eat(0x5d /* "]" */);
        break;
      default:
        throw SyntaxError(
          `Expected "." or "[" but "${expr[i]}" found at ${i}.`,
        );
    }

    if (member !== 'length') {
      throw Error(`Expected "length" but "${member}" found at ${i}.`);
    }

    skipWhitespace();

    eat(0x2d /* "-" */);
    skipWhitespace();

    const start = i;
    const number = parseNumber();

    if (number <= 0) {
      throw SyntaxError(
        `Expected positive number but "${number}" found at ${start}.`,
      );
    }

    skipWhitespace();
    eat(0x29 /* ")" */);
    skipWhitespace();
    eat(0x5d /* "]" */);

    return {
      type: 'SliceExpression',
      value: [-number, Infinity, 1],
      deep: descendant,
    };
  }

  function parseString() {
    const leftQuoteCode = expr.charCodeAt(i);
    if (!isQuote(leftQuoteCode)) {
      throw SyntaxError(`Expected """ or "'" at ${i}.`);
    }

    const leftQuote = expr[i];
    let start = i;
    let value = leftQuote;
    i++;

    while (i < expr.length) {
      start = i;
      eatUnescaped();
      if (start !== i) {
        value += expr.slice(start, i);
      }

      const code = expr.charCodeAt(i);

      if (isQuote(code)) {
        value += expr[i];

        if (code === leftQuoteCode) {
          break;
        }

        i++;
      } else if (code === 0x5c /* "\\" */) {
        assertNotEndOfInput();
        value += getEscapable(expr.charCodeAt(++i));
        i++;
      } else {
        break;
      }
    }

    assertNotEndOfInput(`"${leftQuote}"`);
    eat(leftQuoteCode);

    return value;
  }

  function eatUnescaped() {
    while (i < expr.length) {
      const code = expr.charCodeAt(i);
      if (
        (code >= 0x20 && code <= 0x21) || // omit 0x22 "\""
        (code >= 0x23 && code <= 0x26) || // omit 0x27 "'"
        (code >= 0x28 && code <= 0x5b) || // omit 0x5c "\"
        (code >= 0x5d && code <= 0xd7ff) || // skip surrogate code points
        (code >= 0xe000 && code <= 0x10ffff) // skip surrogate code points
      ) {
        i++;
      } else {
        break;
      }
    }
  }

  function parseJsFnCall() {
    const start = i;
    while (i < expr.length && expr.charCodeAt(i) !== 0x29 /* ")" */) {
      i++;
    }

    eat(0x29 /* ")" */);
    return expr.slice(start - 1, i);
  }

  function parseNumber() {
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
      assertNotEndOfInput('"-" or [0-9]');
      throw SyntaxError(
        `Expected "-" or [0-9] but "${expr[i]}" found at ${i}.`,
      );
    }

    return Number.parseInt(expr.slice(start, i), 10);
  }

  function parseMember() {
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
      assertNotEndOfInput('valid name');
      throw SyntaxError(`Expected valid name but "${expr[i]}" found at ${i}.`);
    }

    const member = expr.slice(start, i);
    return hasOnlyDigits ? Number.parseInt(member, 10) : member;
  }

  function parseCustomShorthand() {
    const start = i;

    i++;

    if (i < expr.length && expr.charCodeAt(i) === 0x40 /* "@" */) {
      i++;
      assertNotEndOfInput('[a-z]');
    }

    assertNotEndOfInput('[a-z]');

    if (!isChar(expr.charCodeAt(i))) {
      throw SyntaxError(`Expected [a-z] but "${expr[i]}" found at ${i}.`);
    }

    while (++i < expr.length && isChar(expr.charCodeAt(i)));

    eat(0x28 /* "(" */);
    skipWhitespace();
    eat(0x29 /* ")" */);

    return {
      type: 'ScriptFilterExpression',
      value: expr.slice(start, i),
      deep: descendant,
    };
  }

  function skipWhitespace() {
    while (i < expr.length) {
      const code = expr.charCodeAt(i);
      if (
        code === 0x20 /* " " ; Space */ ||
        code === 0x09 /* "\t" ; H Tab */ ||
        code === 0x0a /* "\n" ; LF */ ||
        code === 0x0d /* "\r" ; CR */
      ) {
        i++;
      } else {
        break;
      }
    }
  }

  function eat(code) {
    if (i === expr.length) {
      throw SyntaxError(
        `Expected "${String.fromCharCode(code)}" but end of input found at ${i}.`,
      );
    }

    if (expr.charCodeAt(i) !== code) {
      throw SyntaxError(
        `Expected "${String.fromCharCode(code)}" but "${expr[i]}" found at ${i}.`,
      );
    }

    i++;
  }

  function assertNotEndOfInput(expected) {
    if (i === expr.length) {
      throw SyntaxError(
        expected === void 0
          ? `Unexpected end of input at ${i}`
          : `Expected ${expected} but end of input found at ${i}.`,
      );
    }
  }
}

function isQuote(code) {
  return code === 0x22 /* "\"" */ || code === 0x27 /* "'" */;
}

function isChar(code) {
  return (
    (code >= 0x41 /* "A" */ && code <= 0x5a) /* "Z" */ ||
    (code >= 0x61 /* "a" */ && code <= 0x7a) /* "z" */
  );
}

function isDigit(code) {
  return code >= 0x30 /* "0" */ && code <= 0x39 /* "9" */;
}

function getEscapable(code) {
  switch (code) {
    case 0x5c /* "\\" */:
      return '\\';
    case 0x62 /* "b"; backspace */:
      return '\b';
    case 0x66 /* "f"; form feed */:
      return '\f';
    case 0x6e /* "n"; line feed */:
      return '\n';
    case 0x72 /* "r"; carriage return */:
      return '\r';
    case 0x74 /* "t"; horizontal tab */:
      return '\t';
    case 0x76 /* "v"; vertical tab */:
      return '\v';
    default:
      return String.fromCharCode(code);
  }
}
