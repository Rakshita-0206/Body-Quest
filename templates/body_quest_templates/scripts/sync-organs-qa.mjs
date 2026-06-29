#!/usr/bin/env node
/**
 * Merge level question JSON files into organs-qa-data.js for browser loading.
 * Edit: data/level2-questions.json, level3-questions.json, level4-questions.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

function readJson(name) {
  const text = fs.readFileSync(path.join(dataDir, name), 'utf8').trim();
  return JSON.parse(text);
}

const combined = {
  level1: readJson('level1-questions.json'),
  level2: readJson('level2-questions.json'),
  level3: readJson('level3-questions.json'),
  level4: readJson('level4-questions.json'),
};

const header = `// BODY QUEST — organ Q&A data (auto-generated)
// Edit level2-questions.json, level3-questions.json, level4-questions.json
// Then run: node scripts/sync-organs-qa.mjs
`;

fs.writeFileSync(
  path.join(dataDir, 'organs-qa-data.js'),
  `${header}const ORGANS_QA_DATA = ${JSON.stringify(combined, null, 2)};\n`
);

console.log('Synced level question JSON → organs-qa-data.js');
