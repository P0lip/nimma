import isObject from './codegen-functions/is-object.mjs';

function _traverseBody(key, curObj, scope, cb) {
  const value = curObj[key];
  const pos = scope.enter(key);

  cb(scope);

  if (isObject(value)) {
    _traverse(value, scope, cb);
  }

  scope.exit(pos);
}

function _traverse(curObj, scope, cb) {
  if (Array.isArray(curObj)) {
    for (let i = 0; i < curObj.length; i++) {
      _traverseBody(i, curObj, scope, cb);
    }
  } else {
    for (const key of Object.keys(curObj)) {
      _traverseBody(key, curObj, scope, cb);
    }
  }
}

export function traverse(cb) {
  _traverse(this.root, this, cb);
}

export function zonedTraverse(cb, zones) {
  if (isSaneObject(this.root)) {
    zonesRegistry.set(this.root, zones);
    _traverse(new Proxy(this.root, traps), this, cb);
  } else {
    _traverse(this.root, this, cb);
  }
}

const zonesRegistry = new WeakMap();

const traps = {
  get(target, prop) {
    const value = target[prop];

    if (Array.isArray(target)) {
      if (prop === 'length') {
        return target.length;
      }

      const stored = zonesRegistry.get(target);
      if (prop in stored && isObject(value)) {
        zonesRegistry.set(value, stored[prop]);
      }

      return value;
    }

    if (!isObject(value)) {
      return value;
    }

    if (!isSaneObject(value)) {
      return value;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (isObject(item)) {
          zonesRegistry.set(item, zonesRegistry.get(value));
        }
      }
    }

    const stored = zonesRegistry.get(value);
    return '**' in stored ? value : new Proxy(value, traps);
  },

  ownKeys(target) {
    const stored = zonesRegistry.get(target);
    zonesRegistry.delete(target);

    if ('*' in stored) {
      const actualKeys = Object.keys(target);

      for (const key of actualKeys) {
        const value = target[key];
        if (isObject(value)) {
          zonesRegistry.set(value, stored['*']);
        }
      }

      return actualKeys;
    }

    const actualKeys = Object.keys(stored);

    for (let i = 0; i < actualKeys.length; i++) {
      const key = actualKeys[i];

      if (!Object.hasOwnProperty.call(target, key)) {
        actualKeys.splice(i, 1);
        i--;
        continue;
      }

      const value = target[key];
      if (isObject(value)) {
        zonesRegistry.set(value, stored[key]);
      }
    }

    return actualKeys;
  },
};

function isSaneObject(object) {
  return !(
    Object.isFrozen(object) ||
    Object.isSealed(object) ||
    !Object.isExtensible(object)
  );
}
