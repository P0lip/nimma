import { assertNotEndOfInput, eat, getEscapable, isQuote } from './utils.mjs';

export function parseString(ctx) {
  const { expr } = ctx;
  const leftQuoteCode = expr.charCodeAt(ctx.i);
  if (!isQuote(leftQuoteCode)) {
    throw SyntaxError(`Expected """ or "'" at ${ctx.i}.`);
  }

  const leftQuote = expr[ctx.i];
  let start = ctx.i;
  let value = leftQuote;
  ctx.i++;

  while (ctx.i < expr.length) {
    start = ctx.i;
    eatUnescaped(ctx);
    if (start !== ctx.i) {
      value += expr.slice(start, ctx.i);
    }

    const code = expr.charCodeAt(ctx.i);

    if (isQuote(code)) {
      value += expr[ctx.i];

      if (code === leftQuoteCode) {
        break;
      }

      ctx.i++;
    } else if (code === 0x5c /* "\\" */) {
      assertNotEndOfInput(ctx);
      value += getEscapable(expr.charCodeAt(++ctx.i));
      ctx.i++;
    } else {
      break;
    }
  }

  assertNotEndOfInput(ctx, `"${leftQuote}"`);
  eat(ctx, leftQuoteCode);

  return value;
}

function eatUnescaped(ctx) {
  const { expr } = ctx;
  let { i } = ctx;
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

  ctx.i = i;
}
