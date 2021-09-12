import fnv1a from '@sindresorhus/fnv1a';

export default function (expr) {
  return fnv1a(expr, { size: 128 });
}
