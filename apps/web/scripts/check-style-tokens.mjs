import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const raw = execSync("rg --files src -g '*.{css,ts,tsx}'", { encoding: 'utf8' });
const files = raw
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .filter((file) => file !== 'src/tokens.css')
  .filter((file) => !file.endsWith('.test.ts'))
  .filter((file) => !file.includes('/__fixtures__/'));

const offenders = [];
const patterns = [
  { name: 'hex color', regex: /#[0-9a-fA-F]{3,8}\b/g },
];

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern.regex)];
    if (matches.length > 0) offenders.push(`${file}: ${pattern.name} (${matches.length})`);
  }
}

if (offenders.length > 0) {
  console.error('Found hard-coded style values. Use tokens from src/tokens.css instead:');
  for (const offender of offenders) console.error(`- ${offender}`);
  process.exit(1);
}

console.log('Style token check passed.');
