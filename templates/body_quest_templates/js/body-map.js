// BODY QUEST — body-map.js
function getRawOrganHotspot(organId) {
  const pos = ORGAN_HOTSPOTS[organId];
  if (!pos) {
    return { side: 'right', iconTop: 50, iconLeft: 91.5, anchorTop: 50, anchorLeft: 50, bendX: 70 };
  }
  const sideCfg = ORGAN_HOTSPOT_SIDES[pos.side] || ORGAN_HOTSPOT_SIDES.right;
  const compact = useCompactBodyMapLayout();
  if (pos.iconTop != null && pos.anchorTop != null) {
    const bendX = compact
      ? (pos.mobileBendX != null ? pos.mobileBendX : sideCfg.mobileBendX)
      : (pos.bendX != null ? pos.bendX : sideCfg.bendX);
    const side = pos.side || 'right';
    let iconLeft = compact ? sideCfg.mobileIconLeft : sideCfg.iconLeft;
    if (isLevel1MobileLayout()) {
      iconLeft = side === 'left' ? Math.min(iconLeft + 4, 24) : Math.max(iconLeft - 4, 76);
    }
    return {
      side,
      iconTop: compact && ORGAN_HOTSPOT_MOBILE_TOP[organId] != null
        ? ORGAN_HOTSPOT_MOBILE_TOP[organId]
        : pos.iconTop,
      iconLeft,
      anchorTop: pos.anchorTop,
      anchorLeft: pos.anchorLeft,
      bendX
    };
  }
  const legacyTop = pos.top ?? 50;
  const legacyLeft = pos.left ?? 50;
  return {
    side: pos.side || 'right',
    iconTop: legacyTop,
    iconLeft: legacyLeft,
    anchorTop: legacyTop,
    anchorLeft: legacyLeft,
    bendX: sideCfg.bendX
  };
}

function resolveOrganHotspot(organId) {
  const base = getRawOrganHotspot(organId);
  const ov = _hotspotLayoutOverrides?.[organId];
  return ov ? { ...base, ...ov } : base;
}

function measureHotspotNodeSize(map) {
  const scale = parseFloat(getComputedStyle(map).getPropertyValue('--body-hotspot-fit-scale')) || 1;
  const wrap = map.querySelector('.body-hotspot-wrap');
  const btn = map.querySelector('button.body-hotspot');
  const el = wrap || btn;
  if (el) {
    const r = el.getBoundingClientRect();
    if (r.height > 0 && r.width > 0) {
      return { height: r.height / scale, width: r.width / scale };
    }
  }
  const compact = useCompactBodyMapLayout();
  const mapClick = isMapClickLevel();
  const touch = isTouchLikeUI();
  if (mapClick && isLevel1MobileLayout()) {
    // No action row anymore — just the organ head chip.
    return { height: 46, width: 112 };
  }
  let circle = compact ? 56 : 68;
  if (mapClick && !compact) circle = 76;
  if (mapClick && compact) circle = touch ? 56 : 62;
  return { height: circle, width: circle };
}

function distributeVerticalCenters(desiredYs, minDist, minY, maxY, nodeH) {
  const n = desiredYs.length;
  if (n === 0) return [];
  const order = desiredYs.map((y, i) => i).sort((a, b) => desiredYs[a] - desiredYs[b]);
  const centers = order.map(i => Math.max(minY, Math.min(maxY, desiredYs[i])));

  const avail = maxY - minY;
  let minSep = minDist;
  if (n > 1 && (n - 1) * minSep > avail) {
    minSep = avail / (n - 1);
  }
  if (nodeH && minSep < nodeH && n > 1) {
    minSep = Math.max(nodeH, avail / (n - 1));
  }

  const relax = () => {
    for (let i = 1; i < n; i++) {
      if (centers[i] - centers[i - 1] < minSep) centers[i] = centers[i - 1] + minSep;
    }
    for (let i = n - 2; i >= 0; i--) {
      if (centers[i + 1] - centers[i] < minSep) centers[i] = centers[i + 1] - minSep;
    }
    if (centers[0] < minY) {
      const d = minY - centers[0];
      for (let i = 0; i < n; i++) centers[i] += d;
    }
    if (centers[n - 1] > maxY) {
      const d = centers[n - 1] - maxY;
      for (let i = 0; i < n; i++) centers[i] -= d;
    }
  };

  relax();
  if (n > 1 && centers[n - 1] - centers[0] > avail) {
    for (let i = 0; i < n; i++) centers[i] = minY + (i / (n - 1)) * avail;
  }
  relax();

  const result = [];
  order.forEach((origIdx, sortedIdx) => {
    result[origIdx] = centers[sortedIdx];
  });
  return result;
}

function getL1MobileClueGuardTopPx(map) {
  const challenge = $('level1-challenge');
  if (!challenge || !map) return L1_MOBILE_CLUE_GAP;
  const mapTop = map.getBoundingClientRect().top;
  return challenge.getBoundingClientRect().bottom + L1_MOBILE_CLUE_GAP - mapTop;
}

function getL1MobileWrapRisePx(scaledNodeH, fitScale) {
  const shiftPx = parseFloat(getComputedStyle($('body-map') || document.body)
    .getPropertyValue('--l1-mobile-wrap-shift')) || 27;
  return scaledNodeH / 2 + shiftPx * fitScale;
}

function getL1MobileClueGuardCenterY(map, scaledNodeH, fitScale) {
  if (!map) return scaledNodeH / 2 + 4;
  const guardTop = getL1MobileClueGuardTopPx(map);
  const rise = getL1MobileWrapRisePx(scaledNodeH, fitScale);
  return Math.max(scaledNodeH / 2 + 4, guardTop + rise);
}

function enforceL1MobileClueGuard(map) {
  if (!isLevel1MobileLayout() || !isMapClickLevel() || !map) return false;
  const challenge = $('level1-challenge');
  if (!challenge) return false;
  const clueLine = challenge.getBoundingClientRect().bottom + L1_MOBILE_CLUE_GAP;
  const wraps = map.querySelectorAll('.body-hotspot-wrap--mobile');
  let pushPx = 0;
  wraps.forEach(wrap => {
    const overlap = clueLine - wrap.getBoundingClientRect().top;
    if (overlap > pushPx) pushPx = overlap;
  });
  if (pushPx <= 0.5) return false;
  const mapH = map.clientHeight;
  if (mapH < 48) return false;
  const pushPct = (pushPx / mapH) * 100;
  GAME_DATA.organs.forEach(o => {
    const raw = getRawOrganHotspot(o.id);
    const prev = _hotspotLayoutOverrides?.[o.id]?.iconTop ?? raw.iconTop;
    if (!_hotspotLayoutOverrides) _hotspotLayoutOverrides = {};
    _hotspotLayoutOverrides[o.id] = {
      ...(_hotspotLayoutOverrides[o.id] || {}),
      iconTop: prev + pushPct
    };
  });
  return true;
}

function computeHotspotLayoutOverrides() {
  const map = $('body-map');
  if (!map || !GAME_DATA?.organs?.length) return null;

  const mapH = map.clientHeight;
  const mapW = map.clientWidth;
  if (mapH < 48 || mapW < 48) return null;

  const { height: rawNodeH } = measureHotspotNodeSize(map);
  const mobileL1 = isLevel1MobileLayout() && isMapClickLevel();
  const safeGap = mobileL1
    ? Math.max(8, Math.min(12, mapH * 0.018))
    : Math.max(4, Math.min(8, mapH * 0.012));
  const rawPadY = rawNodeH / 2 + 4;
  let rawMinY = rawPadY;
  if (mobileL1) {
    rawMinY = Math.max(rawPadY, getL1MobileClueGuardCenterY(map, rawNodeH, 1));
  }
  const rawMaxY = mapH - rawPadY;
  const rawAvailSpan = rawMaxY - rawMinY;
  const rawMinDist = rawNodeH + safeGap;

  let fitScale = 1;
  ['left', 'right'].forEach(side => {
    const count = GAME_DATA.organs.filter(o => getRawOrganHotspot(o.id).side === side).length;
    if (count > 1) {
      const needed = (count - 1) * rawMinDist;
      if (needed > rawAvailSpan) fitScale = Math.min(fitScale, rawAvailSpan / needed);
    }
  });
  const minFitScale = (!mobileL1 && window.matchMedia('(min-width:901px)').matches) ? 1 : 0.72;
  fitScale = Math.max(minFitScale, Math.min(1, fitScale));
  map.style.setProperty('--body-hotspot-fit-scale', fitScale.toFixed(3));

  const nodeH = rawNodeH * fitScale;
  const minDist = nodeH + safeGap;
  const padY = nodeH / 2 + 4;
  let minY = padY;
  if (mobileL1) {
    minY = Math.max(padY, getL1MobileClueGuardCenterY(map, nodeH, fitScale));
  }
  const maxY = mapH - padY;

  const overrides = {};
  const sides = ['left', 'right'];

  sides.forEach(side => {
    const organs = GAME_DATA.organs.filter(o => getRawOrganHotspot(o.id).side === side);
    if (!organs.length) return;

    const desiredYs = organs.map(o => (getRawOrganHotspot(o.id).iconTop / 100) * mapH);
    const adjustedYs = distributeVerticalCenters(desiredYs, minDist, minY, maxY, nodeH);

    organs.forEach((o, i) => {
      const rawTop = getRawOrganHotspot(o.id).iconTop;
      const newTop = (adjustedYs[i] / mapH) * 100;
      if (Math.abs(newTop - rawTop) > 0.12) {
        overrides[o.id] = { iconTop: newTop };
      }
    });
  });

  return overrides;
}

function getHotspotPositionElement(map, organId) {
  const inner = map.querySelector(`.hotspot-organ-head[data-organ-id="${organId}"]`)
    || map.querySelector(`.body-hotspot[data-organ-id="${organId}"]`);
  if (inner?.closest('.body-hotspot-wrap')) return inner.closest('.body-hotspot-wrap');
  return map.querySelector(`button.body-hotspot[data-organ-id="${organId}"]`);
}

function applyHotspotLayoutToDOM() {
  const map = $('body-map');
  if (!map || !GAME_DATA?.organs) return;

  GAME_DATA.organs.forEach(o => {
    const pos = resolveOrganHotspot(o.id);
    const el = getHotspotPositionElement(map, o.id);
    if (el) {
      el.style.top = `${pos.iconTop}%`;
      el.style.left = `${pos.iconLeft}%`;
    }
    const line = map.querySelector(`.body-map-line[data-organ-id="${o.id}"]`);
    if (line) line.setAttribute('points', buildOrganConnectorPoints(pos));
  });
}

function scheduleBodyMapLayout() {
  clearTimeout(_bodyMapLayoutTimer);
  _bodyMapLayoutTimer = setTimeout(() => {
    const map = $('body-map');
    if (!map || !$('screen-patient')?.classList.contains('active')) return;
    const overrides = computeHotspotLayoutOverrides();
    _hotspotLayoutOverrides = overrides || {};
    applyHotspotLayoutToDOM();
    if (isLevel1MobileLayout() && isMapClickLevel()) {
      for (let i = 0; i < 5; i++) {
        if (!enforceL1MobileClueGuard(map)) break;
        applyHotspotLayoutToDOM();
      }
    }
  }, 40);
}

function initBodyMapLayoutObserver() {
  if (_bodyMapLayoutObserver) return;
  const wrap = document.querySelector('.ps-body-wrap');
  if (!wrap || typeof ResizeObserver === 'undefined') return;
  _bodyMapLayoutObserver = new ResizeObserver(() => scheduleBodyMapLayout());
  _bodyMapLayoutObserver.observe(wrap);
  const questionStack = $('l1-mobile-question-above');
  const challenge = $('level1-challenge');
  if (questionStack) _bodyMapLayoutObserver.observe(questionStack);
  if (challenge) _bodyMapLayoutObserver.observe(challenge);
}

function buildOrganConnectorPoints(pos) {
  const { iconLeft, iconTop, anchorLeft, anchorTop, bendX, side } = pos;
  const inset = 3.6;
  const bendPull = 0.5;
  const startX = side === 'left' ? iconLeft + inset : iconLeft - inset;
  const pulledBendX = bendX + (anchorLeft - bendX) * bendPull;
  const elbowX = side === 'left'
    ? Math.max(startX + 1.5, Math.min(pulledBendX, anchorLeft - 1))
    : Math.min(startX - 1.5, Math.max(pulledBendX, anchorLeft + 1));
  return `${startX},${iconTop} ${elbowX},${iconTop} ${elbowX},${anchorTop} ${anchorLeft},${anchorTop}`;
}

function buildBodyHotspotButton(o, pos, identified, displayLabel, touchUI) {
  const borderColor = identified ? 'var(--green)' : o.color;
  const mobileL1 = isMapClickLevel() && isLevel1MobileLayout();
  const classes = `body-hotspot ${identified ? 'identified' : ''}`;
  const labelHtml = `<span class="hotspot-label">${displayLabel}</span>`;

  // Touch / mobile map-click: single tap = info, double tap = select (see map-click.js).
  const touchHandlers = `ontouchstart="handleHotspotTouchStart('${o.id}', event)" ontouchmove="handleHotspotTouchMove(event)" ontouchend="handleHotspotTouchEnd('${o.id}', event)" ontouchcancel="handleHotspotTouchCancel()" oncontextmenu="return false"`;
  const gestureMode = isMapClickLevel() && (mobileL1 || touchUI);
  const activateHandler = gestureMode ? 'onBodyHotspotActivate' : 'onBodyHotspotClick';
  const ariaLabel = gestureMode
    ? `${o.name}. Tap to select.`
    : `${o.name}`;

  if (mobileL1) {
    const organHead = `<button type="button" class="${classes} hotspot-organ-head"
      data-organ-id="${o.id}" data-side="${pos.side}"
      aria-label="${ariaLabel}"
      style="border-color:${borderColor};--organ-color:${o.color}"
      onclick="${activateHandler}('${o.id}', event)"
      ${touchHandlers}>
      <span class="hotspot-organ-icon" aria-hidden="true">${identified ? '✓' : (o.icon || '●')}</span>
      <span class="hotspot-name-mobile">${o.name}</span>
    </button>`;
    return `<div class="body-hotspot-wrap body-hotspot-wrap--stack body-hotspot-wrap--mobile" data-side="${pos.side}"
      style="top:${pos.iconTop}%;left:${pos.iconLeft}%">
      ${organHead}
    </div>`;
  }

  if (!touchUI || !isMapClickLevel()) {
    return `<button type="button" class="${classes}"
      data-organ-id="${o.id}" data-side="${pos.side}"
      aria-label="${o.name}"
      style="top:${pos.iconTop}%;left:${pos.iconLeft}%;border-color:${borderColor};--organ-color:${o.color}"
      onclick="onBodyHotspotClick('${o.id}', event)"
      >${labelHtml}</button>`;
  }

  const organBadge = `<button type="button" class="${classes}"
      data-organ-id="${o.id}" data-side="${pos.side}"
      aria-label="${ariaLabel}"
      style="border-color:${borderColor};--organ-color:${o.color}"
      onclick="${activateHandler}('${o.id}', event)"
      ${touchHandlers}
      >${labelHtml}</button>`;

  return `<div class="body-hotspot-wrap body-hotspot-wrap--stack" data-side="${pos.side}"
    style="top:${pos.iconTop}%;left:${pos.iconLeft}%">
    ${organBadge}
  </div>`;
}


function renderBodyMap() {
  const map = $('body-map');
  if (!map || !GAME_DATA) return;
  _hotspotLayoutOverrides = null;
  const organs = GAME_DATA.organs;

  const lines = organs.map(o => {
    const pos = resolveOrganHotspot(o.id);
    const identified = (GS.level1Streak || 0) > 0 && GS.level1Identified.includes(o.id);
    const stroke = identified ? '#2ed573' : o.color;
    const points = buildOrganConnectorPoints(pos);
    return `<polyline class="body-map-line${identified ? ' identified' : ''}" points="${points}"
      stroke="${stroke}" data-organ-id="${o.id}"/>`;
  }).join('');

  const dots = organs.map(o => {
    const pos = resolveOrganHotspot(o.id);
    const identified = (GS.level1Streak || 0) > 0 && GS.level1Identified.includes(o.id);
    const fill = identified ? '#2ed573' : o.color;
    return `<circle class="body-map-anchor${identified ? ' identified' : ''}" cx="${pos.anchorLeft}" cy="${pos.anchorTop}" r="0.85"
      fill="${fill}" data-organ-id="${o.id}"/>`;
  }).join('');

  const mobileL1 = isMapClickLevel() && isLevel1MobileLayout();
  const touchUI = isTouchLikeUI() && !mobileL1;

  const buttons = organs.map(o => {
    const pos = resolveOrganHotspot(o.id);
    const identified = (GS.level1Streak || 0) > 0 && GS.level1Identified.includes(o.id);
    const displayLabel = identified
      ? `<span style="font-size:1rem">✓</span>`
      : `<span class="hotspot-organ-icon" aria-hidden="true">${o.icon || ''}</span><span class="hotspot-name">${o.name}</span>`;
    return buildBodyHotspotButton(o, pos, identified, displayLabel, touchUI);
  }).join('');

  map.innerHTML = `
    <svg class="body-map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <marker id="organ-line-arrow" viewBox="0 0 10 10" refX="8.5" refY="5"
          markerWidth="3.5" markerHeight="3.5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L10,5 L0,10 Z" fill="context-stroke"/>
        </marker>
      </defs>
      ${lines}
      ${dots}
    </svg>
    ${buttons}`;

  initBodyMapLayoutObserver();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const overrides = computeHotspotLayoutOverrides();
      _hotspotLayoutOverrides = overrides || {};
      applyHotspotLayoutToDOM();
    });
  });
}
