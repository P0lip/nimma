// based on https://github.com/niksy/aggregate-error-ponyfill
import { isObject } from '../codegen-functions/index.mjs';

function isIterable(value) {
  return isObject(value) && typeof value[Symbol.iterator] === 'function';
}

export default globalThis.AggregateError ??
  class AggregateError extends Error {
    constructor(errors, message = '') {
      super(message);
      if (!Array.isArray(errors) && !isIterable(errors)) {
        throw new TypeError(`${errors} is not an iterable`);
      }

      this.errors = [...errors];
    }
  };
