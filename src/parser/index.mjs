import * as parser from './parser.mjs';

const { parse } = parser;

export default function (input) {
  return parse(input);
}
