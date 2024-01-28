export default class ParserError extends Error {
  constructor(message, expression, extra) {
    super(message, extra);
    this.input = expression;
  }
}
