// BODY QUEST — loads level Q&A from organs-qa-data.js (synced from level*-questions.json)
// Edit: data/level2-questions.json, level3-questions.json, level4-questions.json
// After editing, run: node scripts/sync-organs-qa.mjs

let ORGANS_LEVEL1 = {};
let ORGANS_LEVEL2 = {};
let ORGANS_LEVEL3 = {};
let ORGANS_LEVEL4 = {};

let _organsQaLoaded = false;

function applyOrgansQAData(data) {
  ORGANS_LEVEL1 = data.level1 || {};
  ORGANS_LEVEL2 = data.level2 || {};
  ORGANS_LEVEL3 = data.level3 || {};
  ORGANS_LEVEL4 = data.level4 || {};
  if (typeof buildOrgansById === 'function') buildOrgansById();
  _organsQaLoaded = true;
}

async function loadOrgansQA() {
  if (_organsQaLoaded) return;

  if (typeof ORGANS_QA_DATA !== 'undefined') {
    applyOrgansQAData(ORGANS_QA_DATA);
    return;
  }
  throw new Error('ORGANS_QA_DATA is not defined');
}
