import isObject from './codegen-functions/is-object.mjs';

function _traverseBody(key, curObj, scope, cb, deps) {
  const value = curObj[key];
  const pos = scope.enter(key);
  scope.next();

  const matched = deps !== null && deps.length > 0 && !deps[0].fn(scope);

  if (deps === null || (deps.length === 1 && matched)) {
    cb(scope);
  }

  if (!isObject(value)) {
    // no-nop
  } else if (deps === null) {
    _traverse(value, scope, cb, deps);
  } else if (deps.length > 0) {
    if (matched) {
      _traverse(value, scope, cb, deps.slice(1));
    }

    if (deps[0].deep) {
      scope.exit(pos);
      scope.enter(key);
      _traverse(value, scope, cb, deps);
    }
  }

  scope.exit(pos);
}

function _traverse(curObj, scope, cb, deps) {
  if (Array.isArray(curObj)) {
    for (let i = 0; i < curObj.length; i++) {
      _traverseBody(i, curObj, scope, cb, deps);
    }
  } else {
    for (const key of Object.keys(curObj)) {
      _traverseBody(key, curObj, scope, cb, deps);
    }
  }
}

export function traverse(cb) {
  _traverse(this.root, this, cb, null);
}

export function bailedTraverse(cb, deps) {
  _traverse(this.value, this, cb, deps);
}
