// BODY QUEST — helpers.js
function isTouchLikeUI() {
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

function isLevel1MobileLayout() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function useCompactBodyMapLayout() {
  return isLevel1MobileLayout() || isTouchLikeUI() || window.innerWidth <= 600;
}

/** Map-click levels on touch or narrow viewports: single tap = info, double tap = select. */
function usesMobileOrganTapGestures() {
  return typeof isMapClickLevel === 'function'
    && isMapClickLevel()
    && (isLevel1MobileLayout() || isTouchLikeUI());
}

const $  = id  => document.getElementById(id);

const $$ = sel => document.querySelectorAll(sel);

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wasLevelComplete(levelId) {
  if (levelId === 1) return !!GS.level1Complete;
  if (levelId === 2) return !!GS.level2Complete;
  if (levelId === 3) return !!GS.level3Complete;
  if (levelId === 4) return !!GS.level4Complete;
  return false;
}

function isLevelCompletedOnAccount(levelId) {
  const lv = USER_LEVELS_CACHE.find(l => l.id === levelId);
  return lv?.status === 'completed';
}

function emptyLevelHistory() {
  return { 1: [], 2: [], 3: [], 4: [] };
}

function ensureHistoryBuckets() {
  if (!GS.scoreHistory || typeof GS.scoreHistory !== 'object') GS.scoreHistory = emptyLevelHistory();
  if (!GS.streakHistory || typeof GS.streakHistory !== 'object') GS.streakHistory = emptyLevelHistory();
  for (const lvl of [1, 2, 3, 4]) {
    if (!Array.isArray(GS.scoreHistory[lvl])) GS.scoreHistory[lvl] = [];
    if (!Array.isArray(GS.streakHistory[lvl])) GS.streakHistory[lvl] = [];
  }
}

/** Reconstruct run rows for levels that have saved scores but no scoreHistory (pre-UTMT sessions). */
function backfillScoreHistoryFromLevelScores(savedAt) {
  ensureHistoryBuckets();
  let changed = false;
  const at = savedAt || Date.now();

  for (const level of [1, 2, 3, 4]) {
    if (GS.scoreHistory[level].length > 0) continue;

    const score = GS[`level${level}Score`] || 0;
    const complete = wasLevelComplete(level);
    if (score <= 0 && !complete) continue;

    GS.scoreHistory[level].push({
      score:     sanitizeIdentifyScore(Math.max(0, score)),
      maxStreak: getLevelMaxStreak(level),
      passed:    complete,
      at
    });
    changed = true;
  }

  return changed;
}

function createSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `bq-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionLevelStatus(levelId) {
  if (levelId === 1) return GS.level1Complete ? 'completed' : 'available';
  if (levelId === 2) {
    if (!GS.level1Complete) return 'locked';
    return GS.level2Complete ? 'completed' : 'available';
  }
  if (levelId === 3) {
    if (!GS.level2Complete) return 'locked';
    return GS.level3Complete ? 'completed' : 'available';
  }
  if (levelId === 4) {
    if (!GS.level3Complete) return 'locked';
    return GS.level4Complete ? 'completed' : 'available';
  }
  return 'locked';
}

function getSessionLevels() {
  if (typeof LEVELS_CONFIG === 'undefined') return [];
  return Object.values(LEVELS_CONFIG)
    .sort((a, b) => a.id - b.id)
    .map(cfg => ({
      id:          cfg.id,
      sort_order:  cfg.id,
      title:       cfg.title,
      description: cfg.description,
      status:      getSessionLevelStatus(cfg.id),
      quiz_score:  GS[`level${cfg.id}Score`] || null
    }));
}

function isLevelInProgress(levelId) {
  if (wasLevelComplete(levelId)) return false;
  const local = typeof getLocalSession === 'function' ? getLocalSession() : null;
  const snap = local?.snapshot;
  const screen = local?.screen || snap?.screen || GS.screen;
  if (!snap || snap.currentLevel !== levelId) return false;
  if (!screen || SESSION_IDLE_SCREENS.has(screen)) return false;
  if (LEVEL_END_SCREENS.has(screen)) return false;
  return SESSION_PLAY_SCREENS.has(screen);
}

function recordStreakEvent(level, correct) {
  if (isLevelReplay()) return;
  ensureHistoryBuckets();
  const streak = isMapClickLevel() || level === 1
    ? (GS.level1Streak || 0)
    : getLevelRunStreak(level);
  GS.streakHistory[level].push({
    correct: !!correct,
    streak,
    at:      Date.now()
  });
}

function recordLevelRunHistory(level, { passed = true } = {}) {
  if (isLevelReplay()) return;
  ensureHistoryBuckets();
  let score = 0;
  if (level === 1 || (GS.currentLevel === level && typeof isMapClickLevel === 'function' && isMapClickLevel())) {
    score = GS.level1RunScore || 0;
  } else if (passed) {
    score = GS[`level${level}Score`] || 0;
  } else {
    score = getLevelRunScore();
  }
  recordLevelMaxStreak(level);
  GS.scoreHistory[level].push({
    score:     sanitizeIdentifyScore(Math.max(0, score)),
    maxStreak: getLevelMaxStreak(level),
    passed:    !!passed,
    at:        Date.now()
  });
}

function formatHistoryTime(ts) {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  } catch {
    return '';
  }
}

function isIdentifyLevel(levelId) {
  if (typeof LEVELS_CONFIG !== 'undefined' && LEVELS_CONFIG[levelId]) {
    return LEVELS_CONFIG[levelId].mode === 'identify';
  }
  return levelId >= 1 && levelId <= 4;
}

/** Map-click run score (+4 / −1) — shared across all identify levels. */
function getMapClickRunScore() {
  return Math.max(0, GS.level1RunScore || 0);
}

/** Max realistic identify score: 30 attempts × +4. Values above are legacy investigation scores. */
const IDENTIFY_SCORE_SANITY_MAX = 150;

function sanitizeIdentifyScore(score) {
  const n = Math.max(0, Number(score) || 0);
  if (!Number.isFinite(n)) return 0;
  return n > IDENTIFY_SCORE_SANITY_MAX ? 0 : n;
}

function getLevelBestScore(level, scoreHistory, levelScores) {
  const runs = scoreHistory[level] || [];
  let best = 0;

  for (const run of runs) {
    const pts = sanitizeIdentifyScore(run?.score);
    if (pts > best) best = pts;
  }

  const saved = sanitizeIdentifyScore(levelScores[level] ?? 0);
  if (saved > best) best = saved;

  if (
    GS.currentLevel === level
    && typeof shouldIncludeLevelRunInOverall === 'function'
    && shouldIncludeLevelRunInOverall()
  ) {
    best = Math.max(best, getMapClickRunScore());
  }

  return best;
}

function getSessionProgressOverall(scoreHistory, levelScores) {
  return [1, 2, 3, 4].reduce(
    (sum, lvl) => sum + getLevelBestScore(lvl, scoreHistory, levelScores),
    0
  );
}

function renderSessionProgressHtml() {
  const local = typeof getLocalSession === 'function' ? getLocalSession() : null;
  if (backfillScoreHistoryFromLevelScores(local?.savedAt)) {
    if (GS.sessionId && typeof persistLocalSession === 'function') persistLocalSession();
  }

  const snap = local?.snapshot || {};
  const scoreHistory = GS.scoreHistory || snap.scoreHistory || emptyLevelHistory();

  const levelScores = {
    1: snap.level1Score ?? GS.level1Score ?? 0,
    2: snap.level2Score ?? GS.level2Score ?? 0,
    3: snap.level3Score ?? GS.level3Score ?? 0,
    4: snap.level4Score ?? GS.level4Score ?? 0
  };
  const levelComplete = {
    1: !!(snap.level1Complete ?? GS.level1Complete),
    2: !!(snap.level2Complete ?? GS.level2Complete),
    3: !!(snap.level3Complete ?? GS.level3Complete),
    4: !!(snap.level4Complete ?? GS.level4Complete)
  };

  const overall = getSessionProgressOverall(scoreHistory, levelScores);
  const levels = getSessionLevels();
  const hasRuns = [1, 2, 3, 4].some(lvl => (scoreHistory[lvl] || []).length > 0);
  const hasProgress = hasRuns || overall > 0 || Object.values(levelComplete).some(Boolean);

  if (!hasProgress) {
    return `<div class="lb-loading">No scores yet — play a level and your score history will appear here.</div>`;
  }

  const levelColors = { 1: '#f39c12', 2: '#5dade2', 3: '#bb86fc', 4: '#a29bfe' };
  const summaryGrid = levels.map(lv => {
    const best = getLevelBestScore(lv.id, scoreHistory, levelScores);
    const done = levelComplete[lv.id];
    const locked = lv.status === 'locked' && !done;
    const icon = done ? '✅' : locked ? '🔒' : '▶';
    return `<span class="lb-summary-chip lb-summary-chip--l${lv.id}" style="--chip-color:${levelColors[lv.id]}">${icon} L${lv.id}: ${best}</span>`;
  }).join('');

  let html = `
    <div class="lb-session-summary">
      <div class="lb-session-summary-inner">
        <div class="lb-session-left">
          <span class="lb-session-star" aria-hidden="true">🌟</span>
          <span class="lb-session-label">${escapeHtml(GS.username || getStoredUsername())}</span>
        </div>
        <div class="lb-session-score">${overall.toLocaleString()} <span class="lb-session-score-unit">pts</span></div>
        <div class="lb-session-grid">${summaryGrid}</div>
      </div>
    </div>
    <div class="lb-level-list">`;

  for (const lv of levels) {
    if (lv.status === 'locked' && !levelComplete[lv.id] && !(scoreHistory[lv.id]?.length)) continue;

    const runs = scoreHistory[lv.id] || [];
    const latest = runs.length ? runs[runs.length - 1] : null;
    const displayScore = getLevelBestScore(lv.id, scoreHistory, levelScores);
    const runCount = runs.length || (displayScore > 0 || levelComplete[lv.id] ? 1 : 0);
    const passed = !!(levelComplete[lv.id] || latest?.passed);
    const timeStr = latest?.at ? formatHistoryTime(latest.at) : '';
    const statusClass = passed ? 'lb-level-status--passed' : 'lb-level-status--retry';
    const statusLabel = passed ? '✅ Passed' : '↻ Try again';

    html += `
      <div class="lb-level-row">
        <span class="lb-level-id">L${lv.id}</span>
        <span class="lb-level-name">${lv.title}</span>
        <span class="lb-level-runs">${runCount} run${runCount === 1 ? '' : 's'}</span>
        <div class="lb-level-score-block">
          <span class="lb-level-pts">⭐ ${displayScore} pts</span>
          ${timeStr ? `<span class="lb-level-time">${timeStr}</span>` : ''}
        </div>
        <span class="lb-level-status ${statusClass}">${statusLabel}</span>
      </div>`;
  }

  html += `</div>`;
  return html;
}

function resetGameSessionState() {
  GS.score = 0;
  GS.patientHealth = 0;
  GS.organsHealed = [];
  GS.currentOrgan = null;
  GS.currentStep = 0;
  GS.stepFirstAttempt = true;
  GS.totalCorrect = 0;
  GS.totalWrong = 0;
  GS.wrongTopics = [];
  GS.organStats = {};
  GS.currentLevel = 1;
  GS.level1Score = 0;
  GS.level2Score = 0;
  GS.level3Score = 0;
  GS.level4Score = 0;
  GS.level1Complete = false;
  GS.level2Complete = false;
  GS.level3Complete = false;
  GS.level4Complete = false;
  GS.level1Streak = 0;
  GS.level2Streak = 0;
  GS.level3Streak = 0;
  GS.level4Streak = 0;
  GS.level1MaxStreak = 0;
  GS.level2MaxStreak = 0;
  GS.level3MaxStreak = 0;
  GS.level4MaxStreak = 0;
  GS.level1Identified = [];
  GS.level1TargetOrgan = null;
  GS.level1AwaitingNext = false;
  GS.level1LastAnswerCorrect = false;
  GS.level1LastSymptomText = null;
  GS.level1UsedSymptoms = {};
  GS.level1RunScore = 0;
  GS.level1AttemptCount = 0;
  GS.levelReplay = false;
  GS.scoreHistory = emptyLevelHistory();
  GS.streakHistory = emptyLevelHistory();
  GAME_DATA = null;
}

function isLevelReplay() {
  return !!GS.levelReplay;
}

function syncSessionLevelFlags(levels) {
  if (!levels?.length) return;
  for (const lv of levels) {
    if (lv.status !== 'completed') continue;
    const pts = lv.quiz_score != null && lv.quiz_score !== ''
      ? Number(lv.quiz_score)
      : null;
    if (lv.id === 1) {
      GS.level1Complete = true;
      if (Number.isFinite(pts)) GS.level1Score = Math.max(GS.level1Score || 0, sanitizeIdentifyScore(pts));
    } else if (lv.id === 2) {
      GS.level2Complete = true;
      if (Number.isFinite(pts)) GS.level2Score = Math.max(GS.level2Score || 0, sanitizeIdentifyScore(pts));
    } else if (lv.id === 3) {
      GS.level3Complete = true;
      if (Number.isFinite(pts)) GS.level3Score = Math.max(GS.level3Score || 0, sanitizeIdentifyScore(pts));
    } else if (lv.id === 4) {
      GS.level4Complete = true;
      if (Number.isFinite(pts)) GS.level4Score = Math.max(GS.level4Score || 0, sanitizeIdentifyScore(pts));
    }
  }
  syncAllScores();
}

function usesOrganProgressHealth(level = GS.currentLevel) {
  return level === 2 || level === 3;
}

const HEALTH_GAIN_PER_ORGAN = GAME_CONFIG.limits.healthGainPerOrgan;

function getHealthGainPerOrgan(level = GS.currentLevel) {
  return usesOrganProgressHealth(level) ? HEALTH_GAIN_PER_ORGAN : 0;
}

function getInitialPatientHealth(level = GS.currentLevel) {
  return usesOrganProgressHealth(level) ? 0 : 0;
}

function getHealthBarMin(level = GS.currentLevel) {
  return usesOrganProgressHealth(level) ? 0 : 0;
}

function recalcPatientHealth(level = GS.currentLevel) {
  if (!usesOrganProgressHealth(level)) return;
  GS.patientHealth = Math.min(GAME_CONFIG.limits.maxPatientHealth, GS.organsHealed.length * HEALTH_GAIN_PER_ORGAN);
}

function isMapClickLevel() {
  return GAME_DATA?.level?.mode === 'identify';
}

function getMapClickPromptType() {
  return GAME_DATA?.level?.promptType || 'symptom';
}

function getMapClickPromptMeta() {
  return MAP_CLICK_PROMPT_META[getMapClickPromptType()] || MAP_CLICK_PROMPT_META.symptom;
}

function isLevel1Identify() {
  return isMapClickLevel();
}

function usesSplitInvestigateLayout() {
  const mode = GAME_DATA?.level?.mode;
  return (GS.currentLevel === 2 && mode === 'investigate')
    || (GS.currentLevel === 3 && mode === 'advanced');
}

function isLevel2Investigate() {
  return GS.currentLevel === 2 && GAME_DATA?.level?.mode === 'investigate';
}

function isLevel3Advanced() {
  return GS.currentLevel === 3 && GAME_DATA?.level?.mode === 'advanced';
}

function resetLevelPlayState(levelId) {
  GS.score = 0;
  GS.patientHealth = getInitialPatientHealth(levelId);
  GS.organsHealed = [];
  GS.currentOrgan = null;
  GS.currentStep = 0;
  GS.stepFirstAttempt = true;
  GS.totalCorrect = 0;
  GS.totalWrong = 0;
  GS.wrongTopics = [];
  GS.organStats = {};
  GS.level1Streak = 0;
  GS.level1MaxStreak = 0;
  GS.level1Identified = [];
  GS.level1TargetOrgan = null;
  GS.level1AwaitingNext = false;
  GS.level1LastAnswerCorrect = false;
  GS.level1LastSymptomText = null;
  GS.level1UsedSymptoms = {};
  GS.level1RunScore = 0;
  GS.level1AttemptCount = 0;
  if (levelId === 2) { GS.level2Streak = 0; GS.level2MaxStreak = 0; }
  if (levelId === 3) { GS.level3Streak = 0; GS.level3MaxStreak = 0; }
  if (levelId === 4) { GS.level4Streak = 0; GS.level4MaxStreak = 0; }
  GS.currentLevel = levelId;
}

function getLevelRunStreak(level = GS.currentLevel) {
  if (level === 2) return GS.level2Streak || 0;
  if (level === 3) return GS.level3Streak || 0;
  if (level === 4) return GS.level4Streak || 0;
  return 0;
}

function recordLevelMaxStreak(level) {
  if (isMapClickLevel()) {
    GS.level1MaxStreak = Math.max(GS.level1MaxStreak || 0, GS.level1Streak || 0);
    if (level === 2) GS.level2MaxStreak = GS.level1MaxStreak;
    else if (level === 3) GS.level3MaxStreak = GS.level1MaxStreak;
    else if (level === 4) GS.level4MaxStreak = GS.level1MaxStreak;
    return;
  }
  if (level === 1) {
    GS.level1MaxStreak = Math.max(GS.level1MaxStreak || 0, GS.level1Streak || 0);
  } else if (level === 2) {
    GS.level2MaxStreak = Math.max(GS.level2MaxStreak || 0, GS.level2Streak || 0);
  } else if (level === 3) {
    GS.level3MaxStreak = Math.max(GS.level3MaxStreak || 0, GS.level3Streak || 0);
  } else if (level === 4) {
    GS.level4MaxStreak = Math.max(GS.level4MaxStreak || 0, GS.level4Streak || 0);
  }
}

function getLevelMaxStreak(level) {
  if (level === 1) return GS.level1MaxStreak || 0;
  if (level === 2) return GS.level2MaxStreak || 0;
  if (level === 3) return GS.level3MaxStreak || 0;
  if (level === 4) return GS.level4MaxStreak || 0;
  return 0;
}

function syncLevelEndMaxStreak(prefix) {
  const el = $(`${prefix}-streak-display`) || $(`${prefix}-max-streak-display`);
  if (!el) return;
  const levelMap = { l1: 1, l2: 2, l3: 3, l4: 4, l1go: 1 };
  const level = levelMap[prefix] || 1;
  recordLevelMaxStreak(level);
  if (isMapClickLevel() || level === 1) {
    el.textContent = GS.level1Streak ?? 0;
    return;
  }
  if (level === 2) el.textContent = GS.level2Streak ?? 0;
  else if (level === 3) el.textContent = GS.level3Streak ?? 0;
  else el.textContent = getLevelMaxStreak(level);
}

function syncLevelResultMetrics(prefix) {
  const levelMap = { l1: 1, l2: 2, l3: 3, l4: 4, l1go: 1 };
  const level = levelMap[prefix] || GS.currentLevel || 1;
  recordLevelMaxStreak(level);

  const scoreEl = $(`${prefix}-score-display`);
  const streakEl = $(`${prefix}-streak-display`);
  const attemptsEl = $(`${prefix}-attempts-display`);

  if (isMapClickLevel()) {
    if (scoreEl) scoreEl.textContent = GS.level1RunScore || 0;
    if (streakEl) streakEl.textContent = GS.level1Streak ?? 0;
    if (attemptsEl) attemptsEl.textContent = GS.level1AttemptCount || 0;
    return;
  }

  if (scoreEl) {
    const levelPts = isLevelReplay()
      ? getLevelRunScore()
      : level === 2
        ? (GS.level2Score || getLevelRunScore())
        : level === 3
          ? (GS.level3Score || getLevelRunScore())
          : getLevelRunScore();
    scoreEl.textContent = levelPts;
  }
  if (streakEl) {
    streakEl.textContent = level === 2
      ? (GS.level2Streak ?? 0)
      : level === 3
        ? (GS.level3Streak ?? 0)
        : (GS.level1Streak ?? 0);
  }
  if (attemptsEl) {
    attemptsEl.textContent = (GS.totalCorrect || 0) + (GS.totalWrong || 0);
  }
}

function getBestOverallStreak() {
  return Math.max(
    GS.level1MaxStreak || 0,
    GS.level2MaxStreak || 0,
    GS.level3MaxStreak || 0,
    GS.level4MaxStreak || 0,
    GS.level1Streak || 0,
    GS.level2Streak || 0,
    GS.level3Streak || 0
  );
}

function adjustLevelRunStreak(correct) {
  if (!usesOrganProgressHealth()) return;
  if (GS.currentLevel === 2) {
    GS.level2Streak = correct
      ? GS.level2Streak + 1
      : Math.max(0, GS.level2Streak - 1);
    recordLevelMaxStreak(2);
    recordStreakEvent(2, correct);
  } else if (GS.currentLevel === 3) {
    GS.level3Streak = correct
      ? GS.level3Streak + 1
      : Math.max(0, GS.level3Streak - 1);
    recordLevelMaxStreak(3);
    recordStreakEvent(3, correct);
  }
  syncLevelRunStatsUI();
}

function getCommittedLevelsScore() {
  let total = 0;
  if (GS.level1Complete) total += GS.level1Score || 0;
  if (GS.level2Complete) total += GS.level2Score || 0;
  if (GS.level3Complete) total += GS.level3Score || 0;
  if (GS.level4Complete) total += GS.level4Score || 0;
  return total;
}

function getLevelRunScore() {
  if (GS.currentLevel >= 1 && GS.currentLevel <= 4 && isIdentifyLevel(GS.currentLevel)) {
    return getMapClickRunScore();
  }
  if (isMapClickLevel()) return getMapClickRunScore();
  if (GS.currentLevel === 2 || GS.currentLevel === 3) return Math.max(0, GS.score || 0);
  return 0;
}

function shouldIncludeLevelRunInOverall() {
  if (isLevelReplay()) return false;
  if (LEVEL_END_SCREENS.has(GS.screen)) return false;
  if (isMapClickLevel() && GS.screen === 'patient') return true;
  if (GS.currentLevel === 2 && !GS.level2Complete) {
    return GS.screen === 'game' || GS.screen === 'patient' || GS.screen === 'healed';
  }
  if (GS.currentLevel === 3 && !GS.level3Complete) {
    return GS.screen === 'game' || GS.screen === 'patient' || GS.screen === 'healed';
  }
  if (GS.currentLevel === 4 && !GS.level4Complete) {
    return GS.screen === 'patient';
  }
  return false;
}

function getOverallScore() {
  ensureHistoryBuckets();
  const levelScores = {
    1: GS.level1Score ?? 0,
    2: GS.level2Score ?? 0,
    3: GS.level3Score ?? 0,
    4: GS.level4Score ?? 0
  };
  return getSessionProgressOverall(GS.scoreHistory, levelScores);
}

function commitLevelScore(level, passed = true) {
  if (isLevelReplay()) return;
  if (passed) {
    const runPts = sanitizeIdentifyScore(getMapClickRunScore());
    if (level === 1) GS.level1Score = runPts;
    else if (level === 2) GS.level2Score = isIdentifyLevel(2) ? runPts : sanitizeIdentifyScore(getLevelRunScore());
    else if (level === 3) GS.level3Score = isIdentifyLevel(3) ? runPts : sanitizeIdentifyScore(getLevelRunScore());
    else if (level === 4) GS.level4Score = runPts;
  }
  recordLevelRunHistory(level, { passed });
  syncAllScores();
}

function syncLevelRunStatsUI() {
  if (!usesSplitInvestigateLayout()) return;

  const streak = getLevelRunStreak();
  const score = getLevelRunScore().toLocaleString();
  const streakEl = $('level-run-streak');
  const scoreEl = $('level-run-score');
  const accEl = $('level-run-acc');
  const titleEl = $('level-run-stats-title');
  if (titleEl) {
    const practice = isLevelReplay() ? ' (practice)' : '';
    titleEl.textContent = GS.currentLevel === 3
      ? `Level 3 Progress${practice}`
      : `Level 2 Progress${practice}`;
  }
  if (streakEl) streakEl.textContent = streak;
  if (scoreEl) scoreEl.textContent = score;
  if (accEl) {
    const total = GS.totalCorrect + GS.totalWrong;
    accEl.textContent = total > 0
      ? Math.round((GS.totalCorrect / total) * 100) + '%'
      : '—';
  }
}

function formatLevelReward(lv) {
  if (lv.quiz_score == null || lv.quiz_score === '') return null;
  const n = Number(lv.quiz_score);
  if (!Number.isFinite(n)) return null;
  if (lv.id >= 1 && lv.id <= 4) return { label: 'Best Score', value: String(n), icon: '🌟' };
  if (n <= 100) return { label: 'Accuracy', value: `${n}%`, icon: '🎯' };
  return { label: 'High Score', value: n.toLocaleString(), icon: '⭐' };
}

function getOrganRecord(organId) {
  return GAME_DATA?.organs?.find(o => o.id === organId)
    || (typeof ORGANS_BY_ID !== 'undefined' ? ORGANS_BY_ID[organId] : null);
}

function organImageSrc(organ) {
  if (typeof getOrganVisualSrc === 'function') {
    const src = getOrganVisualSrc(organ);
    if (src) return src;
  }
  return organ.image || organ.image_url || `images/${organ.id}.png`;
}

function calcAnswerAccuracy() {
  const total = GS.totalCorrect + GS.totalWrong;
  return total > 0 ? Math.round((GS.totalCorrect / total) * 100) : 0;
}

function gradeFromAccuracy(acc) {
  if (acc >= 90) return 'A+';
  if (acc >= 75) return 'A';
  if (acc >= 60) return 'B+';
  if (acc >= 45) return 'B';
  return 'C';
}

function addScore(pts) {
  GS.score += pts;
  syncAllScores();
  syncAllHealthBars();
  syncLevelRunStatsUI();
  popup(`+${pts}`, false);
  if (GS.currentLevel >= 2) saveGameState({ completed: false });
  if (GS.sessionId && !isLevelReplay()) syncSessionScores();
}

function syncAllScores() {
  const overall = getOverallScore().toLocaleString();
  $$('.score-display').forEach(el => { el.textContent = overall; });
}

const HEALTH_BAR_FILL_IDS = [
  'health-bar-fill-p', 'health-bar-fill-s', 'health-bar-fill-g',
  'health-bar-fill-m-p', 'health-bar-fill-m-g'
];
const HEALTH_BAR_PCT_IDS = [
  'health-percent-p', 'health-percent-s', 'health-percent-g',
  'health-percent-m-p', 'health-percent-m-g'
];

function getHealthGlowColor(health) {
  if (health < 30) return '#00FF88';
  if (health < 70) return '#32F5FF';
  return '#00BFFF';
}

function syncAllHealthBars() {
  const minH = getHealthBarMin();
  const defaultH = getInitialPatientHealth();
  const raw = Number(GS.patientHealth);
  const health = Math.min(GAME_CONFIG.limits.maxPatientHealth, Math.max(minH, Number.isFinite(raw) ? raw : defaultH));
  const pct = health + '%';
  HEALTH_BAR_FILL_IDS.forEach(id => {
    const el = $(id); if (el) el.style.width = pct;
  });
  HEALTH_BAR_PCT_IDS.forEach(id => {
    const el = $(id); if (el) el.textContent = pct;
  });
  const topbarHealth = $('game-topbar-health');
  if (topbarHealth) {
    topbarHealth.classList.toggle('health-low', health < 30);
    topbarHealth.style.setProperty('--health-glow', getHealthGlowColor(health));
  }
}

function popup(txt, isDeduct = false) {
  const el = document.createElement('div');
  el.className  = 'score-popup' + (isDeduct ? ' score-popup-deduct' : '');
  el.textContent = txt;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), GAME_CONFIG.timing.pointsPopupMs);
}

function showNameError(msg) {
  const errEl = $('name-error');
  if (errEl) { errEl.textContent = '⚠ '+msg; errEl.style.display='block'; errEl.style.color='var(--red,#e74c3c)'; }
  const inp = $('player-name'); if (inp) inp.style.borderColor = 'var(--red,#e74c3c)';
}

function showNameSuccess(msg) {
  const errEl = $('name-error');
  if (errEl) { errEl.textContent = '✓ '+msg; errEl.style.display='block'; errEl.style.color='var(--green,#27ae60)'; }
  const inp = $('player-name'); if (inp) inp.style.borderColor = 'var(--green,#27ae60)';
}

function hideNameError() {
  const errEl = $('name-error'); if (errEl) errEl.style.display='none';
  const inp = $('player-name'); if (inp) inp.style.borderColor='';
}

function getClientUsernameError(name) {
  if (name.length < 3)  return 'At least 3 characters required.';
  if (name.length > 30) return 'Maximum 30 characters.';
  if (/\s/.test(name))  return 'No spaces — use _ or - instead.';
  if (!/^[a-zA-Z0-9_\-]+$/.test(name)) return 'Only letters, numbers, _ and - allowed.';
  if (name[0]==='_'||name[0]==='-') return 'Cannot start with _ or -.';
  if (name[name.length-1]==='_'||name[name.length-1]==='-') return 'Cannot end with _ or -.';
  return null;
}
