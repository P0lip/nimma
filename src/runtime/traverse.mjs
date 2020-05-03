import { Scope } from './scope.mjs';

function _traverse(curObj, scope) {
  for (const key of Object.keys(curObj)) {
    const value = curObj[key];
    const pos = scope.enter(key);

    for (; scope.pos < scope.exprs.length; ) {
      const expr = scope.exprs[scope.pos];
      const hasBeenMatched = scope.next(expr.path);

      try {
        hasBeenMatched;
        if (expr.matches(scope)) {
          expr.onMatch(value, scope.path);
          scope.hit(expr.path);
        }
      } catch (ex) {
        expr.onError(ex);
      }
    }

    if (value !== null && typeof value === 'object') {
      _traverse(value, scope);
    }

    scope.exit(pos);
  }

  scope.collect();
}

export function traverse(root, exprs) {
  const scope = new Scope(root, exprs);

  for (const expr of scope.exprs) {
    scope.next();

    try {
      if (expr.matches(scope)) {
        expr.onMatch(root, scope.path);
      }
    } catch (ex) {
      expr.onError(ex);
    }
  }

  _traverse(root, scope);
}
