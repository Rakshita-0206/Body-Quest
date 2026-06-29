#!/usr/bin/env node
/**
 * Bundle shared config JSON into organs-shared-data.js for browser loading.
 * Edit: data/patient.json, organs-core.json, organ-hotspots.json,
 *       levels-config.json, game-features.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8').trim());
}

const bundle = {
  patient: readJson('patient.json'),
  organsCore: readJson('organs-core.json'),
  hotspots: readJson('organ-hotspots.json'),
  levelsConfig: readJson('levels-config.json'),
};

const header = `// BODY QUEST — shared config (auto-generated)
// Edit JSON files in data/, then run: node scripts/sync-organs-shared.mjs
`;

fs.writeFileSync(
  path.join(dataDir, 'organs-shared-data.js'),
  `${header}const ORGANS_SHARED_DATA = ${JSON.stringify(bundle, null, 2)};\n`
);

console.log('Synced shared JSON → organs-shared-data.js');

