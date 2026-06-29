// BODY QUEST — shared config loader
// Source of truth: patient.json, organs-core.json, organ-hotspots.json,
// levels-config.json, game-features.json (run scripts/sync-organs-shared.mjs)

function applyOrgansSharedData(data) {
  const hotspots = data.hotspots || {};
  GAME_DATA_ROOT = data.patient;
  ORGAN_HOTSPOT_SIDES = hotspots.sides || {};
  ORGAN_HOTSPOT_MOBILE_TOP = hotspots.mobileTop || {};
  ORGAN_HOTSPOTS = hotspots.hotspots || {};
  LEVELS_CONFIG = data.levelsConfig?.levels || {};
  ALL_ORGAN_IDS = data.levelsConfig?.allOrganIds || [];
  ORGANS_CORE = data.organsCore || {};
}

let GAME_DATA_ROOT = {};
let ORGAN_HOTSPOT_SIDES = {};
let ORGAN_HOTSPOT_MOBILE_TOP = {};
let ORGAN_HOTSPOTS = {};
let LEVELS_CONFIG = {};
let ALL_ORGAN_IDS = [];
let ORGANS_CORE = {};

if (typeof ORGANS_SHARED_DATA !== 'undefined') {
  applyOrgansSharedData(ORGANS_SHARED_DATA);
}
