// ═══════════════════════════════════════════════════════════════
//  BODY QUEST — central game configuration
//  All tunable gameplay values live here. Change a number in this
//  file to retune the game; no source-code edits required.
//
//  Loaded from index.html and exposed globally as
//  `GAME_CONFIG`. Grouped by concern: scoring, thresholds, limits,
//  and timing.
// ═══════════════════════════════════════════════════════════════

const GAME_CONFIG = {
  // ─── Scoring ──────────────────────────────────────────────────
  scoring: {
    // Level 1 — organ identification (streak-based run score)
    level1: {
      pointsCorrect: 4,   // points added per correct organ pick
      pointsWrong: -1     // points added per wrong organ pick (can be negative)
    },
    // Levels 2 & 3 — investigation / advanced diagnosis
    investigation: {
      pointsCorrect: 100,        // base points for a correct answer
      firstTryBonus: 50,         // extra points when correct on the first attempt
      wrongPenalty: 30,          // points deducted for a wrong answer (subtracted, floored at 0)
      organHealBonus: 200,       // points awarded for fully healing an organ
      levelCompleteBonus: 500    // bonus for passing the final level
    }
  },

  // ─── Pass thresholds ──────────────────────────────────────────
  thresholds: {
    // Minimum answer accuracy (%) required to pass each level
    levelPassAccuracy: { 2: 70, 3: 80 },
    // Fallback when a level is missing from levelPassAccuracy
    defaultPassAccuracy: 70
  },

  // ─── Limits & gameplay rules ──────────────────────────────────
  limits: {
    level1MaxAttempts: 30,     // attempts allowed before Level 1 game over
    level1RequiredStreak: 10,  // streak required to pass Level 1
    healthGainPerOrgan: 10,    // patient health % gained per healed organ
    maxPatientHealth: 100,     // patient health is capped at this %
    defaultOrganTotal: 10      // assumed organ count when data is unavailable
  },

  // ─── UI / interaction timing (milliseconds) ───────────────────
  timing: {
    answerFeedbackResetMs: 2200, // delay before clearing a wrong-answer highlight
    quizResultDelayMs: 1500,     // delay before showing the legacy quiz result
    toastDurationMs: 3000,       // how long a toast stays on screen
    pointsPopupMs: 1300          // lifetime of the floating +/- points popup
  }
};

if (typeof window !== 'undefined') window.GAME_CONFIG = GAME_CONFIG;
