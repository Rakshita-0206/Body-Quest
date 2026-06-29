// BODY QUEST — navigation.js
const showScreen = name => {
  $$('.screen').forEach(s => s.classList.remove('active'));
  document.querySelector(`.screen[data-screen="${name}"]`)?.classList.add('active');
  GS.screen = name;
  persistLocalSession();
};

function initMenu() {
  GS.currentOrgan     = null;
  GS.currentStep      = 0;
  GS.stepFirstAttempt = true;
  initSessionUsername();
  showScreen('menu');
  spawnParticles();
}

function spawnParticles() {
  const c = $('particle-container');
  if (!c) return;
  const emojis = ['🩸','👁️','🦴','🫁','🫃','❤️','🧬','💊','🔬','🩺','⚕️','🧪'];
  c.innerHTML = '';
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;
      animation-delay:${Math.random()*7}s;animation-duration:${5+Math.random()*5}s;
      font-size:${12+Math.random()*18}px;opacity:${.08+Math.random()*.2}`;
    c.appendChild(p);
  }
}

function showPatientScreen() {
  syncLevelBadge();
  GS.currentOrgan = null; GS.currentStep = 0; GS.stepFirstAttempt = true;
  const isMapClick = isMapClickLevel();
  // Pre-apply the mobile class BEFORE showScreen() makes the element visible.
  // This prevents the flash of desktop layout: the class must be present on the
  // very first paint, not applied asynchronously after display:flex kicks in.
  if (typeof syncLevel1MobileUI === 'function') {
    syncLevel1MobileUI(isMapClick);
  }
  showScreen('patient');
  syncLevel1PatientUI(isMapClick);
  const title = $('ps-screen-title');
  if (title) title.textContent = isMapClick ? getMapClickPromptMeta().title : 'SELECT ORGAN';
  renderSymptoms();
  renderOrganSidebar();
  if (isMapClick) { renderBodyMap(); syncLevel1StreakUI(); }
  syncAllHealthBars();
  syncAllScores();
}

function backToMenu()    { initMenu(); }

function backFromProgress() {
  if (GS.sessionId) goToLevelSelect();
  else initMenu();
}

function backToPatient() {
  showPatientScreen();
}

function showHowToPlay() { showScreen('howtoplay'); }

async function showMyProgress() {
  showScreen('progress');
  const el = $('progress-list');
  if (el) el.innerHTML = renderSessionProgressHtml();
}

function restartGame() {
  clearLocalSession();
  GS.sessionId = null;
  resetGameSessionState();
  initSessionUsername();
  initMenu();
}

function retryCurrentLevel() {
  selectLevel(GS.currentLevel);
}

function goToFinalComplete() {
  if (!GS.level4Complete) return;
  gameComplete();
}

function gameComplete(accuracyPct) {
  showScreen('complete');
  saveGameState({ completed: true });
  syncAllScores();
  syncLevelRunStatsUI();
  syncSessionScores();
  renderCompleteScreen(accuracyPct);
  confetti();
}

function renderCompleteScreen(accuracyPct) {
  const combined = getOverallScore();
  const total = GS.totalCorrect + GS.totalWrong;
  const acc   = accuracyPct != null ? accuracyPct : (total > 0 ? Math.round((GS.totalCorrect/total)*100) : 100);
  const grade = gradeFromAccuracy(acc);

  const fs = $('final-score-display'); if (fs) fs.textContent = combined;
  const gr = $('final-grade-display'); if (gr) gr.textContent = grade;
  const st = $('final-streak-display'); if (st) st.textContent = getBestOverallStreak();
  const title = $('complete-main-title');
  if (title) title.textContent = '🏆 All Levels Complete!';
  const sub = $('complete-main-sub');
  if (sub) {
    sub.textContent = `Outstanding work! You completed all four levels with a combined score of ${combined}. Grade: ${grade}.`;
  }
}

