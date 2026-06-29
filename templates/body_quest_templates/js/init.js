// BODY QUEST — init.js

// Expose inline HTML handlers on window (no import/export — script load order provides globals).
Object.assign(window, {
  backFromProgress,
  backToMenu,
  backToPatient,
  closeL1MobilePopups,
  confirmRestart,
  goToFinalComplete,
  goToLevelSelect,
  onBodyHotspotActivate,
  onBodyHotspotClick,
  onHotspotInfoClick,
  onLevel1NextQuestion,
  restartGame,
  resumeLevel,
  retryCurrentLevel,
  selectLevel,
  setL1MobilePanel,
  showHowToPlay,
  showMyProgress,
  startGame,
  startLevelAfterComplete,
  submitLevel1OrganAnswer,
  toggleLevel1Guidelines
});

document.addEventListener('DOMContentLoaded', () => { restoreSessionOnLoad(); });

window.addEventListener('beforeunload', () => {
  persistLocalSession();
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') persistLocalSession();
});
