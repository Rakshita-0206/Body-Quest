// BODY QUEST — organ data loader (merges per-level question data)
// Edit questions in: data/level2-questions.json, level3-questions.json, level4-questions.json
// Edit hover cards and symptoms in: data/organ-cards.json
// After editing JSON: node scripts/sync-organs-qa.mjs  (for level files)
//                     node scripts/sync-organs-shared.mjs  (for organ-cards.json)
// Map-click prompts: data/map-click-challenges.js
// Shared metadata: data/organs-shared.js

function attachMapClickPrompts(organ, level) {
  const cfg = LEVELS_CONFIG[level];
  if (!cfg || cfg.mode !== 'identify' || typeof getMapClickChallengePool !== 'function') {
    return organ;
  }
  organ.challengePrompts = getMapClickChallengePool(organ.id, cfg.promptType);
  return organ;
}

function buildOrganForLevel(organId, level) {
  const core = ORGANS_CORE[organId];
  if (!core) return null;

  const base = JSON.parse(JSON.stringify(core));
  return attachMapClickPrompts(base, level);
}

/** Full organ records (all levels) — used by body map, resume, summaries */
const ORGANS_BY_ID = {};

function buildOrgansById() {
  ALL_ORGAN_IDS.forEach(id => {
    const core = ORGANS_CORE[id];
    ORGANS_BY_ID[id] = JSON.parse(JSON.stringify(core));
  });
}
