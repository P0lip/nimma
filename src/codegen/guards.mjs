export function isMemberExpression(node) {
  return node.type === 'MemberExpression';
}

export function isScriptFilterExpression(node) {
  return node.type === 'ScriptFilterExpression';
}

export function isShorthandExpression(node) {
  return node.type === 'CustomShorthandExpression';
}

export function isNegativeSliceExpression(node) {
  return node.type === 'SliceExpression' && node.value.some(isNegativeNumber);
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

export function isNegativeNumber(value) {
  return Number.isFinite(value) && value < 0;
}
