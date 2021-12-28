import CauseError from './cause-error.mjs';

export default class ParserError extends CauseError {
  constructor(message, expression, extra) {
    super(message, extra);
    this.input = expression;
  }
}
