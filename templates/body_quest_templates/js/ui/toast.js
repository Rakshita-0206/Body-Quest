// BODY QUEST — ui/toast.js
function showToast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className  = `toast toast-${type}`; el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, GAME_CONFIG.timing.toastDurationMs);
}
