import { existsSync, mkdirSync, symlinkSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const target = dirname(require.resolve('electron/package.json'));
const nodeModules = join(process.cwd(), 'node_modules');
const link = join(nodeModules, 'electron');

if (!existsSync(link)) {
  mkdirSync(nodeModules, { recursive: true });
  symlinkSync(target, link, 'junction');
}
