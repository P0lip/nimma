import fg from 'fast-glob';
import fileEntryCache from 'file-entry-cache';
import jsf from 'json-schema-faker';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cwd = path.join(__dirname, '../fixtures');

const entries = await fg(['*.json'], { absolute: true, cwd });

const cache = fileEntryCache.createFromFile(
  path.join(__dirname, '../.gen/.fixtures-cache'),
);
const changedEntries = cache.getUpdatedFiles(entries);

for (const entry of entries.filter(entry => !changedEntries.includes(entry))) {
  try {
    await fs.promises.access(getDist(entry), fs.constants.F_OK);
  } catch (e) {
    if (e.code === 'ENOENT') {
      changedEntries.push(entry);
    } else {
      throw e;
    }
  }
}

for (const entry of changedEntries) {
  console.log('generating %s', entry);

  const schema = JSON.parse(await fs.promises.readFile(entry, 'utf8'));

  await fs.promises.mkdir(path.dirname(getDist(entry)), { recursive: true });
  await fs.promises.writeFile(
    getDist(entry),
    JSON.stringify(jsf.generate(schema), null, 2),
  );
}

cache.reconcile();

function getDist(entry) {
  return path.join(__dirname, '../.gen/documents', path.basename(entry));
}
