const dependencies = [
  '@jsep-plugin/regex',
  '@jsep-plugin/ternary',
  'jsep',
  'astring',
];

export async function resolve(specifier, context, nextResolve) {
  if (dependencies.includes(specifier)) {
    return nextResolve(`https://cdn.skypack.dev/${specifier}`, context);
  }

  return nextResolve(specifier, context);
}
