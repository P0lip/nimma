import * as parser from './parser.cjs';

const { parse } = parser;

export default function (input) {
  return parse(input);
}
