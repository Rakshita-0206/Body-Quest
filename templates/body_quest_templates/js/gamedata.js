// BODY QUEST — gamedata.js
async function loadGameData(level = 1) {
  if (typeof LEVELS_CONFIG === 'undefined' || typeof ORGANS_CORE === 'undefined') {
    showToast('Game data missing. Ensure data/*.js and organs.js are loaded.', 'error');
    return false;
  }
  try {
    await loadOrgansQA();
  } catch {
    showToast('Could not load question data. Refresh the page or run: node scripts/sync-organs-qa.mjs', 'error');
    return false;
  }
  const cfg = LEVELS_CONFIG[level] || LEVELS_CONFIG[1];
  const organs = cfg.organIds.map(id => buildOrganForLevel(id, level)).filter(Boolean);
  GAME_DATA = {
    patient: GAME_DATA_ROOT.patient,
    organs,
    quiz:    [],
    level:   {
      id: level,
      title: cfg.title,
      mode: cfg.mode,
      promptType: cfg.promptType || 'symptom',
      description: cfg.description
    }
  };
  GS.currentLevel = level;
  syncLevelBadge(level);
  return true;
}

function syncLevelBadge(level = GS.currentLevel) {
  const meta = LEVEL_BADGE_META[level] || LEVEL_BADGE_META[1];
  const subtitle = GAME_DATA?.level?.title || meta.name;
  const html = `<span class="level-badge-main ${meta.cls}">${meta.emoji} ${meta.short}</span><span class="level-badge-name">${subtitle}</span>`;
  ['level-badge-patient', 'level-badge-game'].forEach(id => {
    const el = $(id);
    if (!el) return;
    el.innerHTML = html;
    el.className = `level-play-badge ${meta.cls}`;
  });
}
