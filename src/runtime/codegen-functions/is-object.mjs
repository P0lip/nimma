export default function isObject(maybeObj) {
  return typeof maybeObj === 'object' && maybeObj !== null;
}
