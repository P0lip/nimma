export function isChar(code) {
  return (
    (code >= 0x41 /* "A" */ && code <= 0x5a) /* "Z" */ ||
    (code >= 0x61 /* "a" */ && code <= 0x7a) /* "z" */
  );
}

export function isDigit(code) {
  return code >= 0x30 /* "0" */ && code <= 0x39 /* "9" */;
}

export function isQuote(code) {
  return code === 0x22 /* "\"" */ || code === 0x27 /* "'" */;
}

export function getEscapable(code) {
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

export function assertNotEndOfInput({ expr, i }, expected) {
  if (i === expr.length) {
    throw SyntaxError(
      expected === void 0
        ? `Unexpected end of input at ${i}.`
        : `Expected ${expected} but end of input found at ${i}.`,
    );
  }
}

export function skipWhitespace(ctx) {
  const { expr } = ctx;
  let { i } = ctx;
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

  ctx.i = i;
}

export function eat(ctx, code) {
  const { expr, i } = ctx;
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

  ctx.i++;
}
