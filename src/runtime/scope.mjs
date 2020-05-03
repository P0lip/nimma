import { Path } from './path.mjs';
import { Sandbox } from './sandbox.mjs';
import { constructFn } from '../codegen/index.mjs';

export class Scope {
  constructor(root, exprs) {
    this._lookupCache = new Set();
    this._lastIndex = -1;
    this.pos = -1;

    this.ticks = 0;

    this.exprs = exprs;
    this.markedForCollection = [];

    this.state = new Map();
    this.path = new Path();
    this.sandbox = new Sandbox(this.path, root, null);
  }

  enter(key) {
    this._lookupCache.clear();
    this.pos = 0;
    this.ticks += 1;
    this.path.push(key);
    this.sandbox = this.sandbox.push();

    return this.path.length;
  }

  get property() {
    return this.sandbox.property;
  }

  exit(pos) {
    this._lookupCache.clear();
    this._lastIndex = -1;
    this.pos = -1;
    this.path.length = pos - 1;
    this.sandbox = this.sandbox.pop();

    return this.path.length;
  }

  set lastIndex(value) {
    const exprState = this._getCacheForExpr(this.exprs[this.pos]);
    exprState.lastIndex = value;
    this._lastIndex = value;
  }

  get lastIndex() {
    if (this._lastIndex !== -1) {
      return this._lastIndex;
    }

    return this._getCacheForExpr(this.exprs[this.pos]).lastIndex;
  }

  next(path) {
    this._lastIndex = -1;
    this.pos += 1;

    return this._lookupCache.has(path);
  }

  _getCacheForExpr(expr) {
    const cache = this.state.get(expr);
    if (cache !== void 0) {
      return cache;
    }

    const newCache = {
      evalResult: {},
      lastIndex: 0,
    };

    this.state.set(expr, newCache);
    return newCache;
  }

  evaluate(code, index, id) {
    const { evalResult } = this._getCacheForExpr(this.exprs[this.pos]);

    if (this.path.length === index + 1) {
      try {
        if (constructFn(code)(this)) {
          evalResult[id] = true;
          return true;
        }
      } catch {
        evalResult[id] = false;
        // happens
      }
    }

    return evalResult[id] === true;
  }

  // store(value, id) {
  //   const { evalResult } = this._getCacheForExpr(this.exprs[this.pos]);
  //
  //   if (value === true) {
  //     evalResult[id] = this.path.length;
  //     return evalResult[id];
  //   }
  //
  //   const lastKnownIndex = evalResult[id];
  //   if (lastKnownIndex === void 0 || lastKnownIndex < fromIndex) {
  //     return -1;
  //   }
  //
  //   return lastKnownIndex;
  // }

  // todo: use this concept instead of path.indexOf
  evaluateDeep(code, fromIndex, id) {
    const { evalResult } = this._getCacheForExpr(this.exprs[this.pos]);

    try {
      if (constructFn(code)(this)) {
        evalResult[id] = this.path.length - 1;
        return evalResult[id];
      }
    } catch (ex) {
      // happens
    }

    const lastKnownIndex = evalResult[id];
    if (lastKnownIndex === void 0 || lastKnownIndex < fromIndex) {
      return -1;
    }

    return lastKnownIndex;
  }

  hit(path) {
    this._lookupCache.add(path);
  }

  miss() {
    // stub
  }

  destroy() {
    // this.markedForCollection.push(this.exprs[this.pos]);
  }

  collect() {
    while (this.markedForCollection.length > 0) {
      const expr = this.markedForCollection.pop();
      this.exprs.splice(this.exprs.indexOf(expr, 1));
      this.state.delete(expr);
    }
  }
}
