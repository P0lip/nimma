import { ParserError } from '../runtime/errors/index.mjs';
import * as parser from './parser.mjs';

const { parse } = parser;

export default function (input) {
  try {
    return parse(input);
  } catch (e) {
    throw new ParserError(e.message, input, { cause: e });
  }
}
