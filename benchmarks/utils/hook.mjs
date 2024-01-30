import * as fs from 'node:fs/promises';
const { dependencies } = JSON.parse(
  await fs.readFile('../../package.json', 'utf8'),
);
export async function resolve(specifier, context, nextResolve) {
  if (Object.hasOwn(dependencies, specifier)) {
    return nextResolve(`https://cdn.skypack.dev/${specifier}`, context);
  }

  return nextResolve(specifier, context);
}
