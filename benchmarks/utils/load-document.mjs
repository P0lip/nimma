import * as assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import process from 'node:process';

export default async function loadDocument(scenario, document) {
  if (!document) {
    assert.ok(scenario.defaultDocument);
    const { fileURLToPath } = await import('node:url');
    const { JSONSchemaFaker } = await import(
      'https://cdn.skypack.dev/json-schema-faker'
    );
    const cwd = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

    const schema = JSON.parse(
      await fs.readFile(path.join(cwd, scenario.defaultDocument), 'utf8'),
    );

    return JSONSchemaFaker.generate(schema);
  }

  const yaml = await import('https://cdn.skypack.dev://js-yaml');

  if (document.startsWith('https://')) {
    return yaml.load(await (await fetch(document)).text());
  }

  return yaml.load(
    await fs.readFile(path.join(process.cwd(), document), 'utf8'),
  );
}
