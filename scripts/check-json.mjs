import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { parse, printParseErrorCode } from 'jsonc-parser';

const root = process.cwd();
const directories = ['config', 'locales', 'sections', 'templates'];
const files = [];

for (const directory of directories) {
  const entries = await readdir(path.join(root, directory), { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.json')) files.push(path.join(directory, entry.name));
  }
}

const failures = [];

for (const file of files.sort()) {
  const source = await readFile(path.join(root, file), 'utf8');
  const errors = [];
  parse(source, errors, { allowTrailingComma: false, disallowComments: false });

  for (const error of errors) {
    failures.push(`${file}: ${printParseErrorCode(error.error)} at character ${error.offset}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`JSON is valid in ${files.length} files.`);
}
