/**
 * Run: node frontend/scripts/verify-score-sync.mjs
 * Mirrors js/helpers.js score rules — no DOM required.
 */

const LEVEL_END_SCREENS = new Set([
  'level1-complete', 'level1-gameover', 'level2-complete', 'level3-complete', 'complete'
]);

function getCommittedLevelsScore(gs) {
  let total = 0;
  if (gs.level1Complete) total += gs.level1Score || 0;
  if (gs.level2Complete) total += gs.level2Score || 0;
  if (gs.level3Complete) total += gs.level3Score || 0;
  return total;
}

function getLevelRunScore(gs) {
  if (gs.currentLevel === 2 || gs.currentLevel === 3) return Math.max(0, gs.score || 0);
  return 0;
}

function shouldIncludeLevelRunInOverall(gs) {
  if (gs.levelReplay) return false;
  if (LEVEL_END_SCREENS.has(gs.screen)) return false;
  if (gs.currentLevel === 2 && !gs.level2Complete) {
    return ['game', 'patient', 'healed'].includes(gs.screen);
  }
  if (gs.currentLevel === 3 && !gs.level3Complete) {
    return ['game', 'patient', 'healed'].includes(gs.screen);
  }
  return false;
}

function getOverallScore(gs) {
  let total = getCommittedLevelsScore(gs);
  if (shouldIncludeLevelRunInOverall(gs)) total += getLevelRunScore(gs);
  return total;
}

function overallScoreFromGameState(gs) {
  if (gs.overallScore != null) return Math.max(0, parseInt(gs.overallScore, 10) || 0);
  let total = getCommittedLevelsScore(gs);
  const screen = gs.screen || '';
  if (LEVEL_END_SCREENS.has(screen) || gs.levelReplay) return total;
  const run = Math.max(0, parseInt(gs.levelRunScore ?? gs.score ?? 0, 10) || 0);
  if (gs.currentLevel === 2 && !gs.level2Complete) total += run;
  else if (gs.currentLevel === 3 && !gs.level3Complete) total += run;
  return total;
}

function assert(name, got, expected) {
  if (got !== expected) {
    console.error(`FAIL ${name}: got ${got}, expected ${expected}`);
    process.exitCode = 1;
    return false;
  }
  console.log(`OK   ${name}`);
  return true;
}

// L1 complete, playing L2 mid-run
assert(
  'L1 done + L2 run 350',
  getOverallScore({
    screen: 'game', currentLevel: 2, level1Complete: true, level1Score: 8,
    level2Complete: false, score: 350
  }),
  8 + 350
);

// L2 fail end screen — run must NOT count
assert(
  'L2 fail screen excludes run',
  getOverallScore({
    screen: 'level2-complete', currentLevel: 2, level1Complete: true, level1Score: 8,
    level2Complete: false, score: 1200
  }),
  8
);

// L2 pass committed
assert(
  'L2 pass committed only',
  getOverallScore({
    screen: 'level2-complete', currentLevel: 2, level1Complete: true, level1Score: 8,
    level2Complete: true, level2Score: 2400, score: 2400
  }),
  8 + 2400
);

// L3 pass with bonus in level3Score
assert(
  'All levels complete',
  getOverallScore({
    screen: 'complete', currentLevel: 3,
    level1Complete: true, level1Score: 8,
    level2Complete: true, level2Score: 2400,
    level3Complete: true, level3Score: 3100,
    score: 3100
  }),
  8 + 2400 + 3100
);

// buildGameState overallScore matches frontend on fail save
const failPayload = {
  screen: 'level2-complete', currentLevel: 2,
  level1Complete: true, level1Score: 8, level2Complete: false,
  score: 900, levelRunScore: 900, overallScore: getOverallScore({
    screen: 'level2-complete', currentLevel: 2,
    level1Complete: true, level1Score: 8, level2Complete: false, score: 900
  })
};
assert(
  'overallScore in save payload',
  failPayload.overallScore,
  8
);
assert(
  'backend reads overallScore',
  overallScoreFromGameState(failPayload),
  8
);

// backend fallback without overallScore on fail screen
assert(
  'backend fallback fail screen',
  overallScoreFromGameState({
    screen: 'level2-complete', currentLevel: 2,
    level1Complete: true, level1Score: 8, level2Complete: false,
    score: 900, levelRunScore: 900
  }),
  8
);

// L2 replay — run points must not affect overall
assert(
  'L2 replay mid-run overall fixed',
  getOverallScore({
    levelReplay: true, screen: 'game', currentLevel: 2,
    level1Complete: true, level1Score: 8,
    level2Complete: true, level2Score: 2400,
    score: 900
  }),
  8 + 2400
);

if (process.exitCode !== 1) {
  console.log('\nAll score sync checks passed.');
}
