// BODY QUEST — persistence.js
// All gameplay data lives in the browser (localStorage + sessionStorage). No server DB required.

function getStoredUsername() {
  try {
    return localStorage.getItem(USERNAME_STORAGE_KEY)
      || sessionStorage.getItem(USERNAME_STORAGE_KEY)
      || 'Player';
  } catch {
    return 'Player';
  }
}

function setStoredUsername(name) {
  const safe = (name || '').trim() || 'Player';
  GS.username = safe;
  try {
    localStorage.setItem(USERNAME_STORAGE_KEY, safe);
    sessionStorage.setItem(USERNAME_STORAGE_KEY, safe);
  } catch { /* quota / private mode */ }
}

function initSessionUsername(preferred) {
  const name = (preferred || '').trim() || getStoredUsername();
  setStoredUsername(name);
  return GS.username;
}

function readSessionPayload() {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
      || localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSessionPayload(payload) {
  const json = JSON.stringify(payload);
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, json);
    sessionStorage.setItem(SESSION_STORAGE_KEY, json);
  } catch { /* quota / private mode */ }
}

function getLocalSession() {
  return readSessionPayload();
}

function persistLocalSession() {
  if (!GS.sessionId) return;
  if (!GS.username) initSessionUsername();
  writeSessionPayload({
    sessionId:    GS.sessionId,
    username:     GS.username,
    screen:       GS.screen,
    currentLevel: GS.currentLevel,
    savedAt:      Date.now(),
    snapshot:     buildGameState()
  });
}

function clearLocalSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch { /* ignore */ }
}

function buildGameState(extra = {}) {
  ensureHistoryBuckets();
  return {
    username: GS.username || getStoredUsername(),
    screen: GS.screen,
    score: GS.score,
    overallScore: getOverallScore(),
    levelRunScore: getLevelRunScore(),
    patientHealth: GS.patientHealth,
    organsHealed: GS.organsHealed,
    totalCorrect: GS.totalCorrect,
    totalWrong: GS.totalWrong,
    wrongTopics: GS.wrongTopics,
    organStats: GS.organStats,
    currentLevel: GS.currentLevel,
    currentOrganId: GS.currentOrgan?.id || null,
    currentStep: GS.currentStep,
    stepFirstAttempt: GS.stepFirstAttempt,
    level1Score: GS.level1Score || 0,
    level2Score: GS.level2Score || 0,
    level3Score: GS.level3Score || 0,
    level4Score: GS.level4Score || 0,
    level1Complete: !!GS.level1Complete,
    level2Complete: !!GS.level2Complete,
    level3Complete: !!GS.level3Complete,
    level4Complete: !!GS.level4Complete,
    level1Streak: GS.level1Streak || 0,
    level2Streak: GS.level2Streak || 0,
    level3Streak: GS.level3Streak || 0,
    level4Streak: GS.level4Streak || 0,
    level1MaxStreak: GS.level1MaxStreak || 0,
    level2MaxStreak: GS.level2MaxStreak || 0,
    level3MaxStreak: GS.level3MaxStreak || 0,
    level4MaxStreak: GS.level4MaxStreak || 0,
    level1Identified: GS.level1Identified || [],
    level1TargetOrgan: GS.level1TargetOrgan || null,
    level1UsedSymptoms: GS.level1UsedSymptoms || {},
    level1RunScore: GS.level1RunScore || 0,
    level1AttemptCount: GS.level1AttemptCount || 0,
    levelReplay: !!GS.levelReplay,
    scoreHistory: GS.scoreHistory,
    streakHistory: GS.streakHistory,
    ...extra
  };
}

function saveGameState(extra = {}) {
  if (!GS.sessionId) return;
  persistLocalSession();
}

function applyProgressState(p, localSnapshot) {
  const s = localSnapshot && typeof localSnapshot === 'object' ? localSnapshot : {};
  const merged = { ...p, ...s };

  if (merged.username) setStoredUsername(merged.username);

  GS.score            = merged.levelRunScore ?? merged.score ?? 0;
  GS.organsHealed     = merged.organsHealed || [];
  GS.totalCorrect     = merged.totalCorrect || 0;
  GS.totalWrong       = merged.totalWrong || 0;
  GS.wrongTopics      = merged.wrongTopics || [];
  GS.organStats       = merged.organStats || {};
  GS.level1Score      = merged.level1Score || 0;
  GS.level2Score      = merged.level2Score || 0;
  GS.level3Score      = merged.level3Score || 0;
  GS.level4Score      = merged.level4Score || 0;
  GS.level1Complete   = !!merged.level1Complete;
  GS.level2Complete   = !!merged.level2Complete;
  GS.level3Complete   = !!merged.level3Complete;
  GS.level4Complete   = !!merged.level4Complete;
  GS.level1Streak     = merged.level1Streak || 0;
  GS.level2Streak     = merged.level2Streak || 0;
  GS.level3Streak     = merged.level3Streak || 0;
  GS.level4Streak     = merged.level4Streak || 0;
  GS.level1MaxStreak  = merged.level1MaxStreak || 0;
  GS.level2MaxStreak  = merged.level2MaxStreak || 0;
  GS.level3MaxStreak  = merged.level3MaxStreak || 0;
  GS.level4MaxStreak  = merged.level4MaxStreak || 0;
  GS.level1Identified = merged.level1Identified || [];
  GS.level1TargetOrgan  = merged.level1TargetOrgan || null;
  GS.level1AwaitingNext = false;
  GS.level1LastAnswerCorrect = false;
  GS.level1LastSymptomText = null;
  GS.level1UsedSymptoms = merged.level1UsedSymptoms || {};
  GS.level1RunScore = merged.level1RunScore || 0;
  GS.level1AttemptCount = merged.level1AttemptCount || 0;
  GS.scoreHistory = merged.scoreHistory || emptyLevelHistory();
  GS.streakHistory = merged.streakHistory || emptyLevelHistory();
  ensureHistoryBuckets();
  GS.currentStep      = merged.currentStep ?? 0;
  GS.stepFirstAttempt = merged.stepFirstAttempt !== false;
  GS.currentLevel     = merged.currentLevel || 1;
  const lvl = merged.currentLevel || 1;
  if (usesOrganProgressHealth(lvl)) recalcPatientHealth(lvl);
  else if (typeof merged.patientHealth === 'number') GS.patientHealth = merged.patientHealth;
  else GS.patientHealth = getInitialPatientHealth(lvl);
  if (merged.screen) GS.screen = merged.screen;
  GS.levelReplay = !!merged.levelReplay;
  syncAllScores();
  syncLevelRunStatsUI();

  const savedAt = typeof getLocalSession === 'function' ? getLocalSession()?.savedAt : undefined;
  if (backfillScoreHistoryFromLevelScores(savedAt) && GS.sessionId) {
    persistLocalSession();
  }
}

function resolveCurrentOrgan(organId) {
  if (!organId) return null;
  const fromLevel = GAME_DATA?.organs?.find(o => o.id === organId);
  if (fromLevel) return fromLevel;
  if (typeof buildOrganForLevel === 'function' && GS.currentLevel) {
    return buildOrganForLevel(organId, GS.currentLevel);
  }
  if (typeof ORGANS_BY_ID === 'undefined') return null;
  const cached = ORGANS_BY_ID[organId];
  if (!cached) return null;
  const organ = JSON.parse(JSON.stringify(cached));
  if (GS.currentLevel === 3 && organ.stepsLevel3?.length) {
    organ.steps = organ.stepsLevel3;
  }
  return organ;
}

function syncSessionScores() {
  persistLocalSession();
}

async function restoreInferredScreen() {
  const savedLevel = GS.currentLevel;
  const allOrgansHealed = GAME_DATA?.organs &&
    GS.organsHealed.length >= GAME_DATA.organs.length;
  const mode = GAME_DATA?.level?.mode;

  if (GS.level4Complete && savedLevel === 4) {
    await goToLevelSelect();
    return;
  }

  if (mode === 'identify') {
    const lvl = GS.currentLevel;
    const alreadyDone = (lvl === 1 && GS.level1Complete)
      || (lvl === 2 && GS.level2Complete)
      || (lvl === 3 && GS.level3Complete)
      || (lvl === 4 && GS.level4Complete);
    if (alreadyDone) {
      await goToLevelSelect();
      return;
    }
    showPatientScreen();
    initLevel1();
    return;
  }

  if (allOrgansHealed) {
    if (savedLevel === 2) {
      await showLevel2Complete();
      return;
    }
    if (savedLevel === 3) {
      await finishLevel3();
      return;
    }
    await goToLevelSelect();
    return;
  }

  if (mode === 'investigate' || mode === 'advanced') {
    if (GS.currentOrgan && !GS.organsHealed.includes(GS.currentOrgan.id)) {
      showGameScreen();
    } else {
      startAutoOrganQueue();
    }
    return;
  }

  await goToLevelSelect();
}

async function restoreToScreen(screen) {
  if (screen === 'menu') {
    initMenu();
    return;
  }
  if (screen === 'howtoplay') {
    showScreen('howtoplay');
    return;
  }
  if (screen === 'progress' || screen === 'leaderboard') {
    await showMyProgress();
    return;
  }
  if (screen === 'level-select') {
    await goToLevelSelect();
    return;
  }

  const savedLevel = GS.currentLevel;
  if (!GAME_DATA) {
    const ok = await loadGameData(savedLevel);
    if (!ok) { await goToLevelSelect(); return; }
  }

  const mode = GAME_DATA.level?.mode;

  switch (screen) {
    case 'patient':
      if (mode === 'identify') {
        showPatientScreen();
        initLevel1();
      } else {
        showPatientScreen();
      }
      break;
    case 'game':
      applyGameLayoutMode();
      if (GS.currentOrgan && !GS.organsHealed.includes(GS.currentOrgan.id)) {
        showGameScreen();
      } else {
        await restoreInferredScreen();
      }
      break;
    case 'healed':
      if (GS.currentOrgan) showHealedScreen(GS.currentOrgan);
      else await restoreInferredScreen();
      break;
    case 'level1-complete':
      renderLevel1CompleteScreen();
      showScreen('level1-complete');
      break;
    case 'level1-gameover':
      renderLevel1GameOverScreen();
      showScreen('level1-gameover');
      break;
    case 'level2-complete': {
      const acc = syncLevelEndStats('l2');
      renderLevel2EndScreen(levelRunPassed(2), acc);
      showScreen('level2-complete');
      break;
    }
    case 'level3-complete': {
      renderMapClickLevelCompleteScreen(3);
      showScreen('level3-complete');
      break;
    }
    case 'level4-complete': {
      renderMapClickLevelCompleteScreen(4);
      showScreen('level4-complete');
      break;
    }
    case 'complete': {
      const total = GS.totalCorrect + GS.totalWrong;
      const acc = total > 0 ? Math.round((GS.totalCorrect / total) * 100) : 0;
      showScreen('complete');
      renderCompleteScreen(acc);
      break;
    }
    default:
      await restoreInferredScreen();
  }
}

async function restoreLocalSession(preferredScreen, options = {}) {
  const { silent = false } = options;
  const local = getLocalSession();
  if (!local?.sessionId || !local?.snapshot) return false;

  GS.sessionId = local.sessionId;
  initSessionUsername(local.username || local.snapshot?.username);
  GS.currentLevel = local.currentLevel || local.snapshot?.currentLevel || 1;
  applyProgressState(local.snapshot, local.snapshot);
  syncAllScores();

  const savedLevel = GS.currentLevel || 1;
  const ok = await loadGameData(savedLevel);
  if (!ok) {
    await goToLevelSelect();
    return true;
  }

  const organId = local.snapshot?.currentOrganId;
  GS.currentOrgan = resolveCurrentOrgan(organId);

  const screen = preferredScreen || local.screen || GS.screen;
  if (screen && screen !== 'menu') {
    await restoreToScreen(screen);
  } else {
    await goToLevelSelect();
  }

  persistLocalSession();
  if (!silent) showToast('Welcome back — progress restored', 'success');
  return true;
}

async function resumeLevel(levelId) {
  showToast('Loading your progress…', 'info');
  const ok = await restoreLocalSession(null, { silent: true });
  if (!ok || GS.currentLevel !== levelId) {
    await goToLevelSelect();
    return;
  }
  persistLocalSession();
}

async function restoreSessionOnLoad() {
  $$('.screen').forEach(s => s.classList.remove('active'));
  initSessionUsername();
  const ok = await restoreLocalSession(null, { silent: true });
  if (!ok) initMenu();
}

async function confirmRestart(levelId) {
  const ok = confirm('Start fresh? Your progress on this level will be lost.');
  if (!ok) return;
  if (GS.sessionId) {
    GS.levelReplay = false;
    resetLevelPlayState(levelId);
    await loadGameData(levelId);
    saveGameState({ completed: false });
  }
  const mode = GAME_DATA?.level?.mode;
  if (mode === 'identify') {
    showPatientScreen();
    initLevel1();
  } else {
    startAutoOrganQueue();
  }
}

function freshStart() {
  document.getElementById('resume-overlay')?.remove();
  goToLevelSelect();
}
