// BODY QUEST — levels/map-click.js
function reparentL1MobileProgress(mobile) {
  const wrap = $('l1-organ-progress-wrap');
  const chrome = $('l1-mobile-chrome');
  const psRight = document.querySelector('.ps-right');
  const listTitle = $('ps-organ-list-title');
  if (!wrap || !psRight) return;
  if (mobile && chrome) {
    if (wrap.parentElement !== chrome) chrome.appendChild(wrap);
  } else if (listTitle && wrap.parentElement !== psRight) {
    psRight.insertBefore(wrap, listTitle.nextSibling);
  }
}

function reparentL1MobileQuestionAbove(mobile) {
  const stack = $('l1-mobile-question-above');
  const psLeft = document.querySelector('.ps-left');
  const patientCard = psLeft?.querySelector('.ps-patient-card');
  const challenge = $('level1-challenge');
  const header = $('l1-mobile-left-header');
  const guidelines = $('level1-guidelines-wrap');
  if (!stack || !psLeft || !patientCard || !challenge) return;
  if (mobile) {
    if (patientCard.parentElement !== stack) stack.appendChild(patientCard);
    if (challenge.parentElement !== stack) stack.appendChild(challenge);
  } else {
    if (patientCard.parentElement !== psLeft) {
      psLeft.insertBefore(patientCard, header?.nextSibling || psLeft.firstChild);
    }
    if (challenge.parentElement !== psLeft) {
      psLeft.insertBefore(challenge, guidelines || null);
    }
  }
}

function scrollL1MobileQuestionIntoView(focusFeedback) {
  const stack = $('l1-mobile-question-above');
  if (!stack) return;
  if (focusFeedback) {
    const fb = $('level1-answer-feedback');
    const btn = $('level1-next-btn');
    requestAnimationFrame(() => {
      fb?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      btn?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    return;
  }
  stack.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function syncL1MobileNavActive(panel) {
  document.querySelectorAll('.l1-mobile-nav-btn').forEach(btn => {
    btn.classList.toggle('l1-mobile-nav-btn--active', panel && btn.dataset.l1Panel === panel);
  });
}

function closeL1MobilePanels() {
  const screen = $('screen-patient');
  if (!screen?.classList.contains('level-1-mobile')) return;
  screen.classList.remove('l1-mobile-show-clue', 'l1-mobile-show-progress', 'l1-mobile-show-help');
  syncL1MobileNavActive(null);
}

function syncL1MobileSheetHeaders() {
  const screen = $('screen-patient');
  const title = $('l1-mobile-left-title');
  if (!screen?.classList.contains('level-1-mobile') || !title) return;
  if (screen.classList.contains('l1-mobile-show-help')) title.textContent = 'Help';
  else if (screen.classList.contains('l1-mobile-show-clue')) title.textContent = getMapClickPromptMeta().label;
}

function syncMapClickPromptLabels() {
  const meta = getMapClickPromptMeta();
  const label = $('level1-symptom-label');
  const mobileLabel = document.querySelector('.l1-mobile-clue-strip-label');
  if (label) label.textContent = `${meta.label} (one organ only):`;
  if (mobileLabel) mobileLabel.textContent = meta.label;
  syncL1MobileSheetHeaders();
}

function syncMapClickGuidelinesUI() {
  const level = GS.currentLevel || 1;
  const meta = getMapClickPromptMeta();
  const clueLabel = meta.label.toLowerCase();
  const nextLevel = level < 4 ? level + 1 : null;
  const heading = `📋 What to do in Level ${level}`;

  const toggleLabel = document.querySelector('.level1-guidelines-toggle-label');
  const panel = $('level1-guidelines');
  if (toggleLabel) toggleLabel.textContent = heading;
  if (panel) panel.setAttribute('aria-label', `Level ${level} instructions`);

  const list = document.querySelector('.level1-guidelines-list');
  if (!list) return;

  const completeLi = nextLevel
    ? `Identify <strong>all 10 organs</strong> with a <strong>10-streak</strong> within <strong>30 attempts</strong> to complete Level ${level} and unlock Level ${nextLevel}.`
    : `Identify <strong>all 10 organs</strong> with a <strong>10-streak</strong> within <strong>30 attempts</strong> to complete Level ${level} and finish the game.`;

  list.innerHTML = `
    <li>Read the <strong>${clueLabel}</strong> above — it points to <strong>one organ only</strong>.</li>
    <li><strong>Click</strong> the organ on the body map that matches the clue.</li>
    <li>Each correct pick adds <strong>+4</strong> to your score and increases your <strong>🔥 streak</strong> by 1.</li>
    <li>A wrong pick costs <strong>−1</strong> point, resets your streak to 0, and all identified organs become unidentified again.</li>
    <li>Wrong questions return to the pool until you answer them correctly.</li>
    <li>After each answer, tap <strong>Next Question</strong> for another random clue.</li>
    <li>${completeLi}</li>`;
}

function syncL1MobileBackdrop() {
  const screen = $('screen-patient');
  const backdrop = $('l1-mobile-backdrop');
  if (!backdrop) return;
  const mobile = screen?.classList.contains('level-1-mobile');
  const sheetOpen = mobile && (
    screen.classList.contains('l1-mobile-show-clue')
    || screen.classList.contains('l1-mobile-show-progress')
    || screen.classList.contains('l1-mobile-show-help')
  );
  const open = mobile && sheetOpen;
  backdrop.classList.toggle('hidden', !open);
  backdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
}

function closeL1MobilePopups() {
  closeL1MobilePanels();
  syncL1MobileBackdrop();
}

function openL1MobilePanel(panel) {
  const screen = $('screen-patient');
  if (!screen?.classList.contains('level-1-mobile') || !panel) return;
  if (panel === 'clue') {
    scrollL1MobileQuestionIntoView(GS.level1AwaitingNext);
    return;
  }
  screen.classList.remove('l1-mobile-show-clue', 'l1-mobile-show-progress', 'l1-mobile-show-help');
  screen.classList.add(`l1-mobile-show-${panel}`);
  syncL1MobileNavActive(panel);
  if (panel === 'help') {
    const guidelines = $('level1-guidelines');
    const toggle = $('level1-guidelines-toggle');
    if (guidelines) {
      guidelines.classList.remove('hidden');
      guidelines.classList.add('is-open');
    }
    if (toggle) {
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }
  } else if (panel !== 'clue') {
    collapseLevel1Guidelines();
  }
  syncL1MobileSheetHeaders();
  syncL1MobileBackdrop();
  if (panel === 'progress') syncLevel1MobileProgressRing();
}

function setL1MobilePanel(panel) {
  const screen = $('screen-patient');
  if (!screen?.classList.contains('level-1-mobile')) return;
  if (panel === 'clue') {
    closeL1MobilePanels();
    scrollL1MobileQuestionIntoView(GS.level1AwaitingNext);
    syncL1MobileNavActive(null);
    syncL1MobileBackdrop();
    return;
  }
  const wasOpen = panel && screen.classList.contains(`l1-mobile-show-${panel}`);
  screen.classList.remove('l1-mobile-show-clue', 'l1-mobile-show-progress', 'l1-mobile-show-help');
  if (panel && !wasOpen) screen.classList.add(`l1-mobile-show-${panel}`);
  syncL1MobileNavActive(panel && !wasOpen ? panel : null);
  if (panel === 'help' && !wasOpen) {
    const guidelines = $('level1-guidelines');
    const toggle = $('level1-guidelines-toggle');
    if (guidelines) {
      guidelines.classList.remove('hidden');
      guidelines.classList.add('is-open');
    }
    if (toggle) {
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }
  } else if (!wasOpen) {
    collapseLevel1Guidelines();
  }
  syncL1MobileSheetHeaders();
  syncL1MobileBackdrop();
  if (panel === 'progress' && !wasOpen) syncLevel1MobileProgressRing();
}

function syncLevel1MobileUI(isMapClick) {
  const screen = $('screen-patient');
  const nav = $('l1-mobile-nav');
  const chrome = $('l1-mobile-chrome');
  const mobile = isMapClick && isLevel1MobileLayout();
  if (screen) screen.classList.toggle('level-1-mobile', mobile);
  if (nav) nav.classList.toggle('hidden', !mobile);
  if (chrome) chrome.classList.toggle('hidden', !mobile);
  reparentL1MobileProgress(mobile);
  reparentL1MobileQuestionAbove(mobile);
  if (mobile) {
    syncLevel1MobileClueStrip();
    syncLevel1MobileStats();
  } else {
    screen?.classList.remove(
      'l1-mobile-show-clue', 'l1-mobile-show-progress', 'l1-mobile-show-help', 'l1-organ-sheet-open'
    );
  }
}

function applyGameLayoutMode() {
  const screen = $('screen-game');
  if (screen) {
    screen.classList.toggle('level-split-play', usesSplitInvestigateLayout());
    screen.classList.toggle('level-2-play', isLevel2Investigate());
    screen.classList.toggle('level-3-play', isLevel3Advanced());
  }
  const back = $('game-back-btn');
  if (back) {
    if (usesSplitInvestigateLayout()) {
      back.style.display = 'none';
    } else {
      back.style.display = '';
      back.textContent = '← Organs';
    }
  }
  syncLevelRunStatsUI();
}

function syncLevel1PatientUI(isMapClick) {
  const symBox = $('ps-symptoms-box');
  const hint = $('ps-general-hint');
  const health = $('ps-health-wrap');
  const topbarHealth = $('ps-topbar-health');
  const patientScreen = $('screen-patient');
  const scoreBadge = document.querySelector('.ps-topbar .score-badge');
  const listTitle = $('ps-organ-list-title');
  const clearedLabel = $('organs-cleared-label');
  const left = document.querySelector('.ps-left');
  const patientCard = left?.querySelector('.ps-patient-card');
  const challenge = $('level1-challenge');
  const guidelinesWrap = $('level1-guidelines-wrap');
  const streakBar = $('level1-streak-bar');
  const statsWrap = $('level1-stats-wrap');
  const bodyHint = $('ps-body-hint');
  const showHealth = !isMapClick;

  if (patientScreen) {
    patientScreen.classList.toggle('show-patient-health', showHealth);
    patientScreen.classList.toggle('level-1-play', isMapClick);
  }
  if (symBox) symBox.style.display = isMapClick ? 'none' : '';
  if (hint) hint.style.display = isMapClick ? 'none' : '';
  if (health) health.style.display = showHealth ? '' : 'none';
  if (scoreBadge) scoreBadge.style.display = isMapClick ? 'none' : '';
  if (listTitle) listTitle.textContent = isMapClick ? 'ORGAN PROGRESS' : 'SELECT ORGAN';
  if (clearedLabel) clearedLabel.textContent = isMapClick ? 'Identified:' : 'Organs cleared:';
  if (left) left.classList.toggle('l1-active', isMapClick);
  if (patientCard) patientCard.style.display = '';
  if (challenge) challenge.style.display = isMapClick ? 'block' : 'none';
  if (guidelinesWrap) guidelinesWrap.style.display = isMapClick ? '' : 'none';
  if (!isMapClick) collapseLevel1Guidelines();
  if (streakBar) streakBar.style.display = 'none';
  if (statsWrap) statsWrap.style.display = isMapClick ? 'flex' : 'none';
  if (bodyHint) {
    bodyHint.textContent = isMapClick
      ? 'Click the organ that matches the clue'
      : 'Click a highlighted organ to begin';
  }
  if (isMapClick) {
    syncMapClickPromptLabels();
    syncMapClickGuidelinesUI();
  }
  syncLevel1MobileUI(isMapClick);
}

function initLevel1() {
  syncLevel1IdentifiedWithStreak();
  const title = $('ps-screen-title');
  if (title) title.textContent = getMapClickPromptMeta().title;
  GS.level1AwaitingNext = false;
  GS.level1LastAnswerCorrect = false;
  hideLevel1AnswerUI();
  collapseLevel1Guidelines();
  syncLevel1PatientUI(true);
  restoreLevel1LeftPanel();
  renderBodyMap();
  syncLevel1StreakUI();
  if (!_bodyMapResizeBound) {
    _bodyMapResizeBound = true;
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (GS.screen === 'patient') {
          if (isMapClickLevel()) {
            syncLevel1PatientUI(true);
            renderBodyMap();
            renderOrganSidebar();
          } else {
            renderBodyMap();
          }
        }
      }, 150);
    });
    window.visualViewport?.addEventListener('resize', () => {
      if (GS.screen === 'patient') scheduleBodyMapLayout();
    });
  }
  if (!_l1MobileMqBound) {
    _l1MobileMqBound = true;
    window.matchMedia('(max-width: 768px)').addEventListener('change', () => {
      if (isMapClickLevel() && GS.screen === 'patient') {
        syncLevel1PatientUI(true);
        renderBodyMap();
        renderOrganSidebar();
      }
    });
  }
  if (level1Passed()) {
    completeMapClickLevel();
  } else if (level1AttemptsExhausted()) {
    failMapClickLevel();
  } else {
    const hasActiveTarget = GS.level1TargetOrgan
      && isLevel1OrganEligibleForQuestions(GS.level1TargetOrgan);
    pickNextLevel1Target(!hasActiveTarget);
  }
}

function syncLevel1MobileProgressRing() {
  if (!isLevel1MobileLayout()) return;
  const total = GAME_DATA?.organs?.length || 10;
  const identified = GS.level1Identified?.length || 0;
  const pct = total > 0 ? Math.round((identified / total) * 100) : 0;
  const ringLen = 2 * Math.PI * 82;
  const filled = (pct / 100) * ringLen;

  const pctEl = $('l1-progress-ring-pct');
  if (pctEl) pctEl.textContent = `${pct}%`;
  const countEl = $('l1-progress-ring-count');
  if (countEl) countEl.textContent = `${identified} OF ${total}`;
  const fillEl = $('l1-progress-ring-fill');
  if (fillEl) fillEl.setAttribute('stroke-dasharray', `${filled} ${ringLen - filled}`);

  const titleEl = $('l1-progress-encourage-title');
  const subEl = $('l1-progress-encourage-sub');
  if (titleEl && subEl) {
    if (identified >= total) {
      titleEl.textContent = 'AMAZING!';
      subEl.textContent = 'All organs identified!';
    } else if (identified === 0) {
      titleEl.textContent = 'KEEP GOING!';
      subEl.textContent = 'Match organs to fill the ring';
    } else if (identified >= total * 0.6) {
      titleEl.textContent = 'ALMOST THERE!';
      subEl.textContent = 'Just a few more organs!';
    } else {
      titleEl.textContent = 'KEEP GOING!';
      subEl.textContent = "You're doing great!";
    }
  }
}

function syncLevel1MobileStats() {
  if (!isLevel1MobileLayout()) return;
  const streakEl = $('l1-mobile-streak-val');
  if (streakEl) streakEl.textContent = GS.level1Streak;
  const scoreEl = $('l1-mobile-score-val');
  if (scoreEl) scoreEl.textContent = GS.level1RunScore || 0;
  const identifiedEl = $('l1-mobile-identified-val');
  if (identifiedEl && GAME_DATA?.organs) {
    identifiedEl.textContent = `${GS.level1Identified.length} / ${GAME_DATA.organs.length}`;
  }
  syncLevel1MobileProgressRing();
}

function syncLevel1StreakUI() {
  const streak = GS.level1Streak;
  const score = GS.level1RunScore || 0;
  const el = $('level1-streak-count');
  if (el) el.textContent = streak;
  const big = $('level1-big-streak-count');
  if (big) big.textContent = streak;
  const scoreBig = $('level1-big-score-count');
  if (scoreBig) scoreBig.textContent = score;
  const bar = $('level1-streak-bar');
  if (bar) bar.setAttribute('aria-label', `Current streak: ${streak}`);
  const bigBar = $('level1-big-streak');
  if (bigBar) bigBar.setAttribute('aria-label', `Current streak: ${streak}`);
  const scoreBar = $('level1-big-score');
  if (scoreBar) scoreBar.setAttribute('aria-label', `Total score: ${score}`);
  syncLevel1MobileStats();
}

function getLevel1OrganRecord(organId) {
  return GAME_DATA?.organs?.find(o => o.id === organId) || null;
}

function getLevel1QuestionsPerOrgan() {
  return LEVEL1_QUESTIONS_PER_ORGAN;
}

function getLevel1TotalQuestions() {
  return (GAME_DATA?.organs?.length || 10) * getLevel1QuestionsPerOrgan();
}

function getMapClickQuestionPool(organ) {
  let pool = [];
  if (organ?.challengePrompts?.length) {
    pool = [...organ.challengePrompts];
  } else if (typeof getMapClickChallengePool === 'function') {
    pool = getMapClickChallengePool(organ?.id, getMapClickPromptType());
  }
  return pool.slice(0, getLevel1QuestionsPerOrgan());
}

function getLevel1QuestionPool(organ) {
  return getMapClickQuestionPool(organ);
}

function ensureLevel1UsedSymptoms() {
  if (!GS.level1UsedSymptoms || typeof GS.level1UsedSymptoms !== 'object') {
    GS.level1UsedSymptoms = {};
  }
}

function getLevel1UsedSymptomsList(organId) {
  ensureLevel1UsedSymptoms();
  return GS.level1UsedSymptoms[organId] || [];
}

function markLevel1SymptomUsed(organId, symptomText) {
  if (!organId || !symptomText) return;
  ensureLevel1UsedSymptoms();
  const used = getLevel1UsedSymptomsList(organId);
  if (!used.includes(symptomText)) {
    GS.level1UsedSymptoms[organId] = [...used, symptomText];
  }
}

/** Identified organs are only locked out of the pool while the streak is active. */
function syncLevel1IdentifiedWithStreak() {
  if ((GS.level1Streak || 0) <= 0) {
    GS.level1Identified = [];
  }
}

function isLevel1OrganEligibleForQuestions(organId) {
  syncLevel1IdentifiedWithStreak();
  if ((GS.level1Streak || 0) <= 0) return true;
  return !GS.level1Identified.includes(organId);
}

function markLevel1OrganIdentified(organId) {
  if (!organId) return;
  syncLevel1IdentifiedWithStreak();
  if (!GS.level1Identified.includes(organId)) {
    GS.level1Identified.push(organId);
  }
}

function resetLevel1StreakIdentifiedState() {
  GS.level1Streak = 0;
  GS.level1Identified = [];
  GS.level1UsedSymptoms = {};
}

function getLevel1UnusedSymptoms(organId) {
  const organ = getLevel1OrganRecord(organId);
  if (!organ) return [];
  const pool = getLevel1QuestionPool(organ);
  const used = getLevel1UsedSymptomsList(organId);
  return pool.filter(s => !used.includes(s));
}

function getLevel1AttemptsRemaining() {
  return Math.max(0, LEVEL1_MAX_ATTEMPTS - (GS.level1AttemptCount || 0));
}

function level1Passed() {
  return level1AllOrgansIdentified() && (GS.level1Streak || 0) >= LEVEL1_REQUIRED_STREAK;
}

function level1AttemptsExhausted() {
  return (GS.level1AttemptCount || 0) >= LEVEL1_MAX_ATTEMPTS && !level1Passed();
}

function buildLevel1AvailableQuestions() {
  syncLevel1IdentifiedWithStreak();
  const available = [];
  const organs = GAME_DATA?.organs || [];
  for (const o of organs) {
    if (!isLevel1OrganEligibleForQuestions(o.id)) continue;
    for (const symptom of getLevel1QuestionPool(o)) {
      available.push({ organId: o.id, symptom });
    }
  }
  return available;
}

function level1AllOrgansIdentified() {
  const organTotal = GAME_DATA?.organs?.length || 10;
  return GS.level1Identified.length >= organTotal;
}

function pickRandomLevel1Question() {
  if (level1AttemptsExhausted()) return null;
  const available = buildLevel1AvailableQuestions()
    .filter(q => isLevel1OrganEligibleForQuestions(q.organId));
  if (!available.length) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function restoreLevel1LeftPanel() {
  const left = document.querySelector('#screen-patient .ps-left');
  const panel = $('level1-guidelines');
  if (left) left.scrollTop = 0;
  if (panel) panel.scrollTop = 0;
}

function collapseLevel1AnswerPanel() {
  const fb = $('level1-answer-feedback');
  const btn = $('level1-next-btn');
  if (fb) fb.classList.add('level1-panel-collapsed');
  if (btn) btn.classList.add('level1-panel-collapsed');
}

function expandLevel1AnswerPanel() {
  if (!GS.level1AwaitingNext) return;
  const fb = $('level1-answer-feedback');
  const btn = $('level1-next-btn');
  if (fb) fb.classList.remove('level1-panel-collapsed');
  if (btn) {
    btn.classList.remove('level1-panel-collapsed');
    if (btn.textContent) btn.style.display = 'block';
  }
}

function collapseLevel1Guidelines() {
  const panel = $('level1-guidelines');
  const btn = $('level1-guidelines-toggle');
  const wrap = $('level1-guidelines-wrap');
  if (panel) {
    panel.classList.add('hidden');
    panel.classList.remove('is-open');
    panel.scrollTop = 0;
  }
  if (btn) {
    btn.setAttribute('aria-expanded', 'false');
    btn.classList.remove('is-open');
  }
  if (wrap) wrap.classList.remove('is-open');
  restoreLevel1LeftPanel();
}

function toggleLevel1Guidelines() {
  const panel = $('level1-guidelines');
  const btn = $('level1-guidelines-toggle');
  const wrap = $('level1-guidelines-wrap');
  if (!panel || !btn) return;
  const willOpen = panel.classList.contains('hidden');
  if (willOpen) {
    collapseLevel1AnswerPanel();
    panel.classList.remove('hidden');
    panel.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.classList.add('is-open');
    if (wrap) wrap.classList.add('is-open');
  } else {
    collapseLevel1Guidelines();
    expandLevel1AnswerPanel();
  }
}

function syncLevel1QuestionsRemainingUI() {
  const attempts = GS.level1AttemptCount || 0;
  const remaining = getLevel1AttemptsRemaining();
  const attemptsEl = $('level1-attempts-hud');
  const mobileAttempts = $('l1-mobile-attempts-hud');
  const badge = $('l1-mobile-questions-badge');
  const attemptsText = `${attempts}/${LEVEL1_MAX_ATTEMPTS}`;
  if (attemptsEl) attemptsEl.textContent = attemptsText;
  if (mobileAttempts) mobileAttempts.textContent = attemptsText;
  if (badge) badge.textContent = `${remaining} left`;
}

function syncLevel1MobileClueStrip() {
  const preview = $('l1-mobile-clue-preview');
  const symptomEl = $('level1-symptom-text');
  if (preview && symptomEl) preview.textContent = symptomEl.textContent || GS.level1LastSymptomText || '';
  syncLevel1QuestionsRemainingUI();
}

function updateLevel1ChallengeUI(symptomText) {
  const el = $('level1-symptom-text');
  if (el) el.textContent = symptomText;
  syncLevel1QuestionsRemainingUI();
  syncLevel1MobileClueStrip();
}

function hideLevel1AnswerUI() {
  const fb = $('level1-answer-feedback');
  const btn = $('level1-next-btn');
  const screen = $('screen-patient');
  if (fb) {
    fb.className = 'level1-answer-feedback';
    fb.innerHTML = '';
    fb.classList.remove('level1-panel-collapsed');
  }
  if (btn) {
    btn.style.display = 'none';
    btn.classList.remove('level1-panel-collapsed');
  }
  if (screen?.classList.contains('level-1-mobile')) {
    screen.classList.remove('l1-mobile-awaiting-next');
    closeL1MobilePanels();
    syncL1MobileBackdrop();
  }
}

function showLevel1AnswerFeedback(correct, pickedOrganId) {
  const fb = $('level1-answer-feedback');
  const btn = $('level1-next-btn');
  const targetOrgan = getLevel1OrganRecord(GS.level1TargetOrgan);
  const pickedOrgan = getLevel1OrganRecord(pickedOrganId);
  GS.level1LastAnswerCorrect = correct;
  collapseLevel1Guidelines();

  const shouldComplete = correct && level1Passed();
  const shouldFail = level1AttemptsExhausted();

  if (fb) {
    fb.className = `level1-answer-feedback ${correct ? 'level1-answer-feedback--correct' : 'level1-answer-feedback--wrong'} is-visible`;
    fb.classList.remove('level1-panel-collapsed');
    if (shouldComplete) {
      fb.innerHTML = `<span class="level1-fb-icon" aria-hidden="true">✅</span><span>Correct! That was the <strong>${targetOrgan?.name || 'organ'}</strong>. All organs identified with a ${LEVEL1_REQUIRED_STREAK} streak!</span>`;
    } else if (shouldFail) {
      fb.innerHTML = correct
        ? `<span class="level1-fb-icon" aria-hidden="true">✅</span><span>Correct — <strong>${targetOrgan?.name || 'organ'}</strong>. You used all ${LEVEL1_MAX_ATTEMPTS} attempts without reaching a ${LEVEL1_REQUIRED_STREAK} streak.</span>`
        : `<span class="level1-fb-icon" aria-hidden="true">❌</span><span>Not quite — you picked <strong>${pickedOrgan?.name || 'that organ'}</strong>. You used all ${LEVEL1_MAX_ATTEMPTS} attempts without reaching a ${LEVEL1_REQUIRED_STREAK} streak.</span>`;
    } else {
      fb.innerHTML = correct
        ? `<span class="level1-fb-icon" aria-hidden="true">✅</span><span>Correct! That was the <strong>${targetOrgan?.name || 'organ'}</strong>. Streak: <strong>${GS.level1Streak}</strong> · Score: <strong>${GS.level1RunScore || 0}</strong></span>`
        : `<span class="level1-fb-icon" aria-hidden="true">❌</span><span>Not quite — you picked <strong>${pickedOrgan?.name || 'that organ'}</strong>. Streak reset to 0 and all organs must be identified again. Score: <strong>${GS.level1RunScore || 0}</strong>. Tap <strong>Next Question</strong> to continue.</span>`;
    }
  }

  syncLevel1QuestionsRemainingUI();
  syncLevel1StreakUI();
  renderBodyMap();
  renderOrganSidebar();
  scheduleBodyMapLayout();

  if (shouldComplete || shouldFail) {
    GS.level1AwaitingNext = false;
    if (btn) btn.style.display = 'none';
    setTimeout(() => {
      if (!isMapClickLevel()) return;
      hideLevel1AnswerUI();
      if (shouldComplete) completeMapClickLevel();
      else failMapClickLevel();
    }, 1200);
    return;
  }

  GS.level1AwaitingNext = true;
  if (btn) {
    btn.style.display = 'block';
    btn.textContent = 'Next Question →';
    btn.classList.remove('level1-panel-collapsed');
  }
  if (isLevel1MobileLayout()) {
    const screen = $('screen-patient');
    if (screen) screen.classList.add('l1-mobile-awaiting-next');
    scrollL1MobileQuestionIntoView(true);
  }
}

function onLevel1NextQuestion() {
  if (!GS.level1AwaitingNext || !isMapClickLevel()) return;
  hideLevel1AnswerUI();
  GS.level1AwaitingNext = false;

  if (GS.level1LastAnswerCorrect && level1Passed()) {
    completeMapClickLevel();
    return;
  }

  if (level1AttemptsExhausted()) {
    failMapClickLevel();
    return;
  }

  pickNextLevel1Target(true);
}

function pickNextLevel1Target(forceNew = true) {
  hideLevel1AnswerUI();
  collapseLevel1Guidelines();
  restoreLevel1LeftPanel();
  GS.level1AwaitingNext = false;
  GS.level1LastAnswerCorrect = false;

  if (level1Passed()) {
    completeMapClickLevel();
    return;
  }

  if (level1AttemptsExhausted()) {
    failMapClickLevel();
    return;
  }

  syncLevel1IdentifiedWithStreak();

  if (!forceNew && GS.level1TargetOrgan && isLevel1OrganEligibleForQuestions(GS.level1TargetOrgan)) {
    const symptom = GS.level1LastSymptomText
      || getLevel1QuestionPool(getLevel1OrganRecord(GS.level1TargetOrgan))?.[0]
      || '';
    if (symptom) {
      updateLevel1ChallengeUI(symptom);
      renderBodyMap();
      renderOrganSidebar();
      return;
    }
  }

  const pick = pickRandomLevel1Question();
  if (!pick) {
    if (level1Passed()) completeMapClickLevel();
    else failMapClickLevel();
    return;
  }

  GS.level1TargetOrgan = pick.organId;
  GS.level1LastSymptomText = pick.symptom;
  updateLevel1ChallengeUI(pick.symptom);
  renderBodyMap();
  renderOrganSidebar();
}

// Mobile map-click: tap organ to submit answer (no info popup).
let _hotspotPressStartXY = null;
const HOTSPOT_MOVE_TOLERANCE = 12;

function resetHotspotTapState() {}

function handleHotspotTapGesture(organId, evt) {
  resetHotspotTapState();
  onBodyHotspotClick(organId, evt);
}

function handleHotspotTouchStart(organId, evt) {
  const touch = evt?.touches?.[0];
  _hotspotPressStartXY = touch ? { x: touch.clientX, y: touch.clientY } : null;
}

function handleHotspotTouchMove(evt) {
  if (!_hotspotPressStartXY) return;
  const touch = evt?.touches?.[0];
  if (!touch) return;
  const dx = touch.clientX - _hotspotPressStartXY.x;
  const dy = touch.clientY - _hotspotPressStartXY.y;
  if (Math.sqrt(dx * dx + dy * dy) > HOTSPOT_MOVE_TOLERANCE) {
    resetHotspotTapState();
    _hotspotPressStartXY = null;
  }
}

function handleHotspotTouchEnd(organId, evt) {
  if (!_hotspotPressStartXY) return;
  const touch = evt?.changedTouches?.[0];
  if (touch) {
    const dx = touch.clientX - _hotspotPressStartXY.x;
    const dy = touch.clientY - _hotspotPressStartXY.y;
    if (Math.sqrt(dx * dx + dy * dy) > HOTSPOT_MOVE_TOLERANCE) {
      _hotspotPressStartXY = null;
      return;
    }
  }
  _hotspotPressStartXY = null;
  if (evt?.cancelable) evt.preventDefault();
  handleHotspotTapGesture(organId, evt);
}

function handleHotspotTouchCancel() {
  resetHotspotTapState();
  _hotspotPressStartXY = null;
}

function onBodyHotspotActivate(organId, evt) {
  if (usesMobileOrganTapGestures()) {
    if (isTouchLikeUI() && evt?.type === 'click') return;
    handleHotspotTapGesture(organId, evt);
    return;
  }
  onBodyHotspotClick(organId, evt);
}

function onHotspotInfoClick(organId, evt) {
  if (evt) evt.stopPropagation();
}

function onBodyHotspotClick(organId, evt) {
  if (!isMapClickLevel()) {
    selectOrgan(organId);
    return;
  }
  if (GS.level1AwaitingNext) {
    showToast('Tap Next Question to continue', 'info');
    return;
  }
  submitLevel1OrganAnswer(organId);
}

function submitLevel1OrganAnswer(organId) {
  if (!isMapClickLevel() || !GS.level1TargetOrgan) return;
  if (GS.level1AwaitingNext) return;
  syncLevel1IdentifiedWithStreak();
  if ((GS.level1Streak || 0) > 0
    && GS.level1Identified.includes(organId)
    && organId !== GS.level1TargetOrgan) {
    const hint = getMapClickPromptMeta().matchHint;
    showToast(`That organ is already identified — find the one ${hint}`, 'info');
    return;
  }
  GS.level1AttemptCount = (GS.level1AttemptCount || 0) + 1;

  if (organId === GS.level1TargetOrgan) {
    GS.level1Streak++;
    markLevel1OrganIdentified(organId);
    recordLevelMaxStreak(GS.currentLevel);
    recordStreakEvent(GS.currentLevel, true);
    GS.level1RunScore = (GS.level1RunScore || 0) + LEVEL1_POINTS_CORRECT;
    syncLevel1StreakUI();
    saveGameState({ completed: false });
    showLevel1AnswerFeedback(true, organId);
  } else {
    GS.level1RunScore = (GS.level1RunScore || 0) + LEVEL1_POINTS_WRONG;
    resetLevel1StreakIdentifiedState();
    recordStreakEvent(GS.currentLevel, false);
    syncLevel1StreakUI();
    saveGameState({ completed: false });
    showLevel1AnswerFeedback(false, organId);
  }
}

function syncLevel1ResultMetrics(prefix) {
  syncLevelResultMetrics(prefix);
}

function renderLevel1CompleteScreen() {
  renderMapClickLevelCompleteScreen(1);
}

function renderLevel1GameOverScreen() {
  renderMapClickLevelGameOverScreen(GS.currentLevel || 1);
}

function renderMapClickLevelCompleteScreen(level) {
  const organTotal = GAME_DATA?.organs?.length || 10;
  const meta = getMapClickPromptMeta();
  if (level === 1) {
    const msg = $('l1-complete-msg');
    if (msg) {
      msg.textContent = `Outstanding! You matched all ${organTotal} organs by ${meta.label.toLowerCase()} with a streak of ${GS.level1Streak} and scored ${GS.level1RunScore || 0} points!`;
    }
    syncLevel1ResultMetrics('l1');
    return;
  }

  const prefix = level === 2 ? 'l2' : level === 3 ? 'l3' : 'l4';
  const title = $(`${prefix}-complete-title`);
  const msg = $(`${prefix}-complete-msg`);
  const passActions = $(`${prefix}-pass-actions`);
  const failActions = $(`${prefix}-fail-actions`);

  if (title) title.textContent = `🎉 Level ${level} Complete!`;
  if (msg) {
    msg.textContent = `Great work! You matched all ${organTotal} organs by ${meta.label.toLowerCase()} with a streak of ${GS.level1Streak} and scored ${GS.level1RunScore || 0} points!`;
  }
  if (passActions) passActions.classList.remove('hidden');
  if (failActions) failActions.classList.add('hidden');
  const continueBtn = passActions?.querySelector('.btn-continue');
  if (continueBtn && level === 3) {
    continueBtn.textContent = 'Start Level 4 →';
    continueBtn.setAttribute('onclick', 'startLevelAfterComplete(4)');
  } else if (continueBtn && level === 4) {
    continueBtn.textContent = 'View Final Results →';
    continueBtn.setAttribute('onclick', 'goToFinalComplete()');
  }
  syncLevelResultMetrics(prefix);
}

function renderMapClickLevelGameOverScreen(level) {
  const meta = getMapClickPromptMeta();
  const msg = $('l1go-msg');
  const retryBtn = document.querySelector('#screen-level1-gameover .btn-continue');
  if (msg) {
    msg.textContent = `You used all ${LEVEL1_MAX_ATTEMPTS} attempts without reaching a ${LEVEL1_REQUIRED_STREAK} streak. Study the ${meta.label.toLowerCase()}s and try again!`;
  }
  if (retryBtn) retryBtn.textContent = `🔄 Retry Level ${level}`;
  syncLevel1ResultMetrics('l1go');
}

async function completeMapClickLevel() {
  const level = GS.currentLevel;
  if (level === 1) return completeLevel1();
  if (level === 2) return completeMapClickLevel2();
  if (level === 3) return completeMapClickLevel3();
  if (level === 4) return completeMapClickLevel4();
}

async function completeMapClickLevel2() {
  if (!isLevelReplay()) {
    GS.level2Complete = true;
    commitLevelScore(2, true);
  }
  saveGameState({ completed: false });
  syncSessionScores();
  renderMapClickLevelCompleteScreen(2);
  showScreen('level2-complete');
  confetti();
}

async function completeMapClickLevel3() {
  if (!isLevelReplay()) {
    GS.level3Complete = true;
    commitLevelScore(3, true);
  }
  saveGameState({ completed: false });
  syncSessionScores();
  renderMapClickLevelCompleteScreen(3);
  showScreen('level3-complete');
  confetti();
}

async function completeMapClickLevel4() {
  if (!isLevelReplay()) {
    GS.level4Complete = true;
    commitLevelScore(4, true);
  }
  saveGameState({ completed: true });
  syncSessionScores();
  renderMapClickLevelCompleteScreen(4);
  showScreen('level4-complete');
  confetti();
}

async function failMapClickLevel() {
  const level = GS.currentLevel;
  recordLevelRunHistory(level, { passed: false });
  saveGameState({ completed: false });
  syncSessionScores();
  renderMapClickLevelGameOverScreen(level);
  showScreen('level1-gameover');
}

async function completeLevel1() {
  if (!isLevelReplay()) {
    GS.level1Complete = true;
    commitLevelScore(1, true);
  }
  saveGameState({ completed: false });
  syncSessionScores();
  renderMapClickLevelCompleteScreen(1);
  showScreen('level1-complete');
  confetti();
}

async function failLevel1() {
  failMapClickLevel();
}

function renderSymptoms() {
  if (isLevel1Identify()) return;
  const el = $('symptom-list');
  if (!el || !GAME_DATA) return;
  const generic = GAME_DATA.patient.genericSymptoms || [];
  el.innerHTML = generic
    .slice(0, 3)
    .map(s => `<li><span class="symptom-dot"></span>${s}</li>`).join('');
  const hint = $('ps-general-hint');
  if (hint) hint.textContent = 'Multiple systems affected — select an organ to investigate';
}

function renderOrganSidebar() {
  const el = $('organ-sidebar');
  if (!el || !GAME_DATA) return;
  const isL1 = isLevel1Identify();
  el.innerHTML = GAME_DATA.organs.map(o => {
    const healed = GS.organsHealed.includes(o.id);
    const identified = (GS.level1Streak || 0) > 0 && GS.level1Identified.includes(o.id);
    const done = isL1 ? identified : healed;
    const click = isL1 ? '' : `onclick="selectOrgan('${o.id}')"`;
    const status = isL1
      ? (identified ? '✓ Found' : '')
      : (healed ? '✓ Healed' : '');
    if (isL1) {
      if (isLevel1MobileLayout()) {
        const stateClass = identified ? 'l1-progress-organ--found' : 'l1-progress-organ--pending';
        return `
    <div class="l1-progress-organ ${stateClass}"${identified ? ` title="${o.name}"` : ''}>
      <span class="l1-progress-organ-icon">${identified ? '✓' : o.icon}</span>
      ${identified ? `<span class="l1-progress-organ-name">${o.name}</span>` : ''}
    </div>`;
      }
      return `
    <div class="ps-organ-card ps-organ-card--l1 ${done ? 'healed' : ''}"
         style="border-color:${done ? 'var(--green)' : o.color};cursor:default">
      <div class="ps-organ-icon" style="background:${done ? 'rgba(46,213,115,.15)' : o.color + '18'};border-color:${done ? 'var(--green)' : o.color}">${done ? '✓' : o.icon}</div>
      <div class="ps-organ-info">
        <div class="ps-organ-name">${o.name}</div>
      </div>
      <div class="ps-organ-arrow" style="color:${done ? 'var(--green)' : o.color}">${done ? '✓' : ''}</div>
    </div>`;
    }
    return `
    <div class="ps-organ-card ${done ? 'healed' : ''}" ${click}
         style="border-color:${done ? 'var(--green)' : o.color}">
      <div class="ps-organ-icon"
           style="background:${done ? 'rgba(46,213,115,.15)' : o.color + '22'};
                  border-color:${done ? 'var(--green)' : o.color}">
        <span style="font-size:22px">${o.icon}</span>
      </div>
      <div class="ps-organ-info">
        <div class="ps-organ-name">${o.name}</div>
        ${status ? `<div class="ps-organ-disease" style="color:var(--green)">${status}</div>` : ''}
      </div>
      <div class="ps-organ-arrow" style="color:${done ? 'var(--green)' : o.color}">
        ${done ? '✓' : '›'}
      </div>
    </div>`;
  }).join('');
  const cc = $('organs-cleared-count');
  if (cc) {
    const n = isL1 ? GS.level1Identified.length : GS.organsHealed.length;
    cc.textContent = `${n} / ${GAME_DATA.organs.length}`;
  }
  if (isL1 && isLevel1MobileLayout()) {
    syncLevel1MobileStats();
  }
}