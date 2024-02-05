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

function _zonedTraverseBody(key, curObj, scope, cb, nextZone) {
  const value = curObj[key];
  const pos = scope.enter(key);

  cb(scope);

  if (isObject(value)) {
    if (nextZone === null) {
      _traverse(value, scope, cb);
    } else {
      _zonedTraverse(value, scope, cb, nextZone);
    }
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

function _zonedTraverse(curObj, scope, cb, zone) {
  const keys = zone.keys;

  if (keys !== void 0) {
    let i = 0;
    const isArray = Array.isArray(curObj);
    for (const key of keys) {
      if (Object.hasOwn(curObj, key)) {
        const actualKey = isArray ? key : String(key);
        _zonedTraverseBody(actualKey, curObj, scope, cb, zone.zones[i]);
      }

      i++;
    }
  } else if (!('zone' in zone)) {
    // stop traversal
  } else if (zone.zone === null) {
    _traverse(curObj, scope, cb);
  } else if (Array.isArray(curObj)) {
    for (let i = 0; i < curObj.length; i++) {
      _zonedTraverseBody(i, curObj, scope, cb, zone.zone);
    }
  } else {
    for (const key of Object.keys(curObj)) {
      _zonedTraverseBody(key, curObj, scope, cb, zone.zone);
    }
  }
}

export function traverse(cb) {
  _traverse(this.root, this, cb);
}

export function zonedTraverse(cb, zones) {
  _zonedTraverse(this.root, this, cb, zones);
}
