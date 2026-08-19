import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const assetDirectory = path.join(root, 'assets');
const entries = await readdir(assetDirectory, { withFileTypes: true });
const files = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
  .map((entry) => path.join('assets', entry.name))
  .sort();

let failed = false;

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  failed ||= result.status !== 0;
}

if (failed) process.exitCode = 1;
else console.log(`JavaScript syntax is valid in ${files.length} asset files.`);
