// BODY QUEST — screens/level-select.js
async function startGame() {
  initSessionUsername();

  const existing = getLocalSession();
  if (existing?.sessionId && existing?.snapshot) {
    GS.sessionId = existing.sessionId;
    initSessionUsername(existing.username || existing.snapshot?.username);
    applyProgressState(existing.snapshot, existing.snapshot);
    persistLocalSession();
    await goToLevelSelect();
    return;
  }

  clearLocalSession();
  resetGameSessionState();
  GS.sessionId = createSessionId();
  persistLocalSession();
  await goToLevelSelect();
}

function startLevelAfterComplete(levelId) {
  selectLevel(levelId);
}

function renderLevelInfoBadges(lv, { completed }) {
  if (!completed) return '';
  const reward = formatLevelReward(lv);
  let scoreChip = '';
  if (reward) {
    const display = `Score ${reward.value}`;
    scoreChip = `<span class="level-card-chip level-card-chip--score">⭐ ${display}</span>`;
  }
  return `
    <div class="level-card-badges">
      <span class="level-card-chip level-card-chip--done">✅ Completed</span>
      ${scoreChip}
    </div>`;
}

function renderLevelPanelBadge(locked, completed, inProgress) {
  if (locked) {
    return '<span class="level-card-panel-badge level-card-panel-badge--locked">🔒 Locked</span>';
  }
  if (inProgress) {
    return '<span class="level-card-panel-badge level-card-panel-badge--progress">⚡ In progress</span>';
  }
  if (completed) {
    return '<span class="level-card-panel-badge level-card-panel-badge--done">✅ Completed</span>';
  }
  return '<span class="level-card-panel-badge level-card-panel-badge--ready">▶ Ready</span>';
}

function renderLevelPanelBody(locked, completed, inProgress) {
  if (locked) {
    return `
      <div class="level-card-panel-lock" aria-hidden="true">🔒</div>
      <div class="level-card-panel-meta">
        <span class="level-card-panel-label">Progress</span>
        <span class="level-card-panel-text">Complete previous level</span>
      </div>`;
  }
  if (inProgress) {
    return `
      <div class="level-card-panel-meta">
        <span class="level-card-panel-label">💾 Session</span>
        <span class="level-card-panel-text">Resume to continue</span>
      </div>`;
  }
  if (completed) {
    return `
      <div class="level-card-panel-meta">
        <span class="level-card-panel-label">🏆 Score saved</span>
        <span class="level-card-panel-text">Replay anytime</span>
      </div>`;
  }
  return `
    <div class="level-card-panel-meta">
      <span class="level-card-panel-label">▶ Mission</span>
      <span class="level-card-panel-text">Ready to start</span>
    </div>`;
}

function renderLevelPanelActions(lv, { locked, completed, inProgress }) {
  if (locked) return '';
  if (inProgress) {
    return `
      <div class="level-card-panel-actions">
        <button type="button" class="btn-level-play btn-level-play--success btn-level-play--panel"
          onclick="resumeLevel(${lv.id})">▶ Resume</button>
        <button type="button" class="btn-level-play btn-level-play--outline btn-level-play--panel"
          onclick="confirmRestart(${lv.id})">🔄 Restart</button>
      </div>`;
  }
  if (completed) {
    return `
      <div class="level-card-panel-actions">
        <button type="button" class="btn-level-play btn-level-play--success btn-level-play--panel"
          onclick="selectLevel(${lv.id})">🔁 Play Again</button>
      </div>`;
  }
  return `
    <div class="level-card-panel-actions">
      <button type="button" class="btn-level-play btn-level-play--primary btn-level-play--panel"
        onclick="selectLevel(${lv.id})">▶ Play Level ${lv.sort_order}</button>
    </div>`;
}

function renderLevelCard(lv, { hasResume }) {
  const locked    = lv.status === 'locked';
  const completed = lv.status === 'completed';
  const inProgress = !locked && !completed && hasResume;
  const ui = LEVEL_CARD_UI[lv.id] || LEVEL_CARD_UI[1];
  const stateClass = locked ? 'level-card--locked'
    : completed ? 'level-card--completed'
    : inProgress ? 'level-card--progress'
    : 'level-card--ready';

  const desc = lv.description || ui.hint;
  return `
    <article class="level-card ${ui.cardClass} ${stateClass}" data-level-id="${lv.id}">
      <span class="level-card-corner level-card-corner--tl" aria-hidden="true"></span>
      <span class="level-card-corner level-card-corner--tr" aria-hidden="true"></span>
      <span class="level-card-corner level-card-corner--bl" aria-hidden="true"></span>
      <span class="level-card-corner level-card-corner--br" aria-hidden="true"></span>
      <div class="level-card-glow" aria-hidden="true"></div>
      <div class="level-card-inner">
        <div class="level-card-visual" aria-hidden="true">
          <div class="level-card-visual-bg"></div>
          <div class="level-card-visual-grid"></div>
          <img class="level-card-visual-img" src="${ui.visual}" alt="${ui.visualAlt}"
            data-replace-with="${ui.visualFile || ''}" loading="lazy">
          <div class="level-card-visual-scan"></div>
        </div>
        <div class="level-card-info">
          <span class="level-card-level">Level ${lv.sort_order}</span>
          <h2 class="level-card-title">${lv.title}</h2>
          <p class="level-card-desc">${desc}</p>
          ${renderLevelInfoBadges(lv, { completed })}
        </div>
        <div class="level-card-panel">
          <div class="level-card-panel-top">
            ${renderLevelPanelBadge(locked, completed, inProgress)}
          </div>
          <div class="level-card-panel-body">
            ${renderLevelPanelBody(locked, completed, inProgress)}
          </div>
          ${renderLevelPanelActions(lv, { locked, completed, inProgress })}
        </div>
      </div>
    </article>`;
}

async function goToLevelSelect() {
  GS.levelReplay = false;
  showScreen('level-select');

  const userEl = $('level-select-username');
  if (userEl) {
    userEl.innerHTML = `<span class="level-select-user-name">Your session progress is saved automatically in this browser</span>`;
  }

  const container = $('level-cards');
  const levels = getSessionLevels();
  if (!levels.length) {
    if (container) container.innerHTML = '<div class="level-cards-loading">No levels found.</div>';
    return;
  }

  USER_LEVELS_CACHE = levels;
  syncSessionLevelFlags(levels);

  if (!container) return;
  container.innerHTML = levels.map(lv => renderLevelCard(lv, {
    hasResume: isLevelInProgress(lv.id)
  })).join('');
}

async function selectLevel(levelId) {
  showToast('Loading level…', 'info');
  const ok = await loadGameData(levelId);
  if (!ok) return;

  GS.levelReplay = wasLevelComplete(levelId) || isLevelCompletedOnAccount(levelId);
  resetLevelPlayState(levelId);
  saveGameState({ completed: false });

  showPatientScreen();
  initLevel1();
}
