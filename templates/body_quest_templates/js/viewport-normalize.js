// Cross-browser viewport normalization — same window size → same UI scale.
// Also stamps html.is-mobile-vp synchronously so CSS can target mobile
// before any JS-driven class toggling, eliminating the flash of desktop layout.
(function () {
  'use strict';

  const REF_W = 1366;
  const REF_H = 768;
  const BASE_PX = 17;
  const SCALE_BOOST = 1.06;
  const DESKTOP_MIN = 901;
  // Must match isLevel1MobileLayout() in helpers.js
  const MOBILE_BREAKPOINT = 768;

  function syncMobileClass() {
    const root = document.documentElement;
    const w = root.clientWidth || window.innerWidth;
    root.classList.toggle('is-mobile-vp', w <= MOBILE_BREAKPOINT);
  }

  function syncViewportScale() {
    const root = document.documentElement;
    const w = root.clientWidth || window.innerWidth;
    const h = root.clientHeight || window.innerHeight;

    // Keep the mobile class in sync on every resize
    root.classList.toggle('is-mobile-vp', w <= MOBILE_BREAKPOINT);

    if (w < DESKTOP_MIN) {
      root.style.removeProperty('font-size');
      root.style.setProperty('--ui-scale', '1');
      return;
    }

    const scale = Math.min(w / REF_W, h / REF_H) * SCALE_BOOST;
    root.style.setProperty('--ui-scale', scale.toFixed(4));
    root.style.fontSize = `${BASE_PX * scale}px`;
  }

  // Run synchronously — this executes while the parser is still in <head>,
  // before any layout/paint, so the class is present on the very first render.
  syncMobileClass();
  syncViewportScale();

  window.addEventListener('resize', syncViewportScale, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncViewportScale, { passive: true });
  }
})();
