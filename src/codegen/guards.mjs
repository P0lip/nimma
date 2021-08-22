export function isMemberExpression(node) {
  return node.type === 'MemberExpression';
}

export function isScriptFilterExpression(node) {
  return node.type === 'ScriptFilterExpression';
}

export function isModifierExpression(node) {
  return node.type === 'KeyExpression' || node.type === 'ParentExpression';
}

export function isWildcardExpression(node) {
  return node.type === 'WildcardExpression';
}

export function isDeep(node) {
  return node.deep;
}
