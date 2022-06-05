import cpy from 'cpy';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

for (const dist of ['esm', 'cjs']) {
  await cpy(['**/*.d.ts'], path.join(__dirname, '../dist', dist), {
    cwd: path.join(__dirname, '../src'),
    parents: true,
  });
}
