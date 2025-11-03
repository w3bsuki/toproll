import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..', 'src');
const exts = new Set(['.svelte', '.ts', '.js', '.tsx']);
const replacements = [
  { regex: /from ['"]\\\/utils(?:\\\/index)?['"]/g, replacement: "from '$lib/utils'" },
  { regex: /from ['"]\/utils(?:\/index)?['"]/g, replacement: "from '$lib/utils'" },
  { regex: /from ['"]\\?\$lib\/utils\/index['"]/g, replacement: "from '$lib/utils'" },
  { regex: /from ['"]\\?\$lib\/utils\.js['"]/g, replacement: "from '$lib/utils'" },
  { regex: /['"]\\\$lib\//g, replacement: (match) => match.replace('\\', '') }
];

const touched = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }

    if (!exts.has(path.extname(entry.name))) continue;

    const content = fs.readFileSync(full, 'utf8');
    const updated = replacements.reduce((text, rule) => {
      if (typeof rule.replacement === 'function') {
        return text.replace(rule.regex, rule.replacement);
      }
      return text.replace(rule.regex, rule.replacement);
    }, content);

    if (updated !== content) {
      fs.writeFileSync(full, updated, 'utf8');
      touched.push(path.relative(root, full));
    }
  }
}

walk(root);

console.log(`Normalized utils imports in ${touched.length} files`);
