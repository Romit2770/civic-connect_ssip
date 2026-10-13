import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.resolve(__dirname, '../src/i18n/locales');
const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));
const hi = JSON.parse(fs.readFileSync(path.join(localesDir, 'hi.json'), 'utf8'));
const gu = JSON.parse(fs.readFileSync(path.join(localesDir, 'gu.json'), 'utf8'));

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      keys = keys.concat(getAllKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = new Set(getAllKeys(en));
const hiKeys = new Set(getAllKeys(hi));
const guKeys = new Set(getAllKeys(gu));

console.log(`Total Translation Keys in English (en.json): ${enKeys.size}`);
console.log(`Total Translation Keys in Hindi (hi.json): ${hiKeys.size}`);
console.log(`Total Translation Keys in Gujarati (gu.json): ${guKeys.size}`);

const missingInHi = [...enKeys].filter((k) => !hiKeys.has(k));
const missingInGu = [...enKeys].filter((k) => !guKeys.has(k));

let hasErrors = false;

if (missingInHi.length > 0) {
  console.error(`❌ Missing keys in Hindi (hi.json):`, missingInHi);
  hasErrors = true;
} else {
  console.log(`✅ 100% keys match in Hindi (hi.json)!`);
}

if (missingInGu.length > 0) {
  console.error(`❌ Missing keys in Gujarati (gu.json):`, missingInGu);
  hasErrors = true;
} else {
  console.log(`✅ 100% keys match in Gujarati (gu.json)!`);
}

if (hasErrors) {
  process.exit(1);
} else {
  console.log('🎉 All locales are 100% complete and synchronized!');
}
