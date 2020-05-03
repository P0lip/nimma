import { generate } from '../codegen/index.mjs';

export class JSONPathExpression {
  constructor(path, onMatch, onError) {
    this.path = path;
    this.matches = generate(path);
    this.onMatch = onMatch;
    this.onError = onError;
  }
}
