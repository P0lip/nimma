import jsf from 'json-schema-faker';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cwd = path.join(__dirname, '../fixtures');

for (const item of await fs.promises.readdir(cwd)) {
  const itempath = path.join(cwd, item);
  const stat = await fs.promises.stat(itempath);
  if (stat.isDirectory()) continue;
  console.log('generating %s', itempath);
  const schema = JSON.parse(await fs.promises.readFile(itempath, 'utf8'));
  await fs.promises.writeFile(
    path.join(__dirname, '../.gen', path.basename(itempath)),
    JSON.stringify(jsf.generate(schema), null, 2),
  );
}
