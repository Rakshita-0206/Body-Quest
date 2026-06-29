// BODY QUEST — state.js
const GS = {
  screen:           'menu',
  username:         null,
  sessionId:        null,
  currentLevel:     1,
  currentOrgan:     null,
  currentStep:      0,
  score:            0,
  patientHealth:    0,
  organsHealed:     [],
  stepFirstAttempt: true,
  totalCorrect:     0,
  totalWrong:       0,
  wrongTopics:      [],
  organStats:       {},
  level1Score:      0,
  level2Score:      0,
  level3Score:      0,
  level4Score:      0,
  level1Complete:   false,
  level2Complete:   false,
  level3Complete:   false,
  level4Complete:   false,
  level1Streak:     0,
  level2Streak:     0,
  level3Streak:     0,
  level4Streak:     0,
  level1MaxStreak:  0,
  level2MaxStreak:  0,
  level3MaxStreak:  0,
  level4MaxStreak:  0,
  level1Identified: [],
  level1TargetOrgan:  null,
  level1AwaitingNext: false,
  level1LastAnswerCorrect: false,
  level1LastSymptomText: null,
  /** organId → symptom texts consumed by wrong answers (identified organs skip pool) */
  level1UsedSymptoms: {},
  level1RunScore:     0,
  level1AttemptCount: 0,
  /** Per-level run history — [{ score, maxStreak, passed, at }] */
  scoreHistory:       { 1: [], 2: [], 3: [], 4: [] },
  /** Per-answer streak events — [{ correct, streak, at }] */
  streakHistory:      { 1: [], 2: [], 3: [], 4: [] },
  /** True when replaying an already-completed level — overall/banked scores stay fixed */
  levelReplay:        false
};

const SESSION_IDLE_SCREENS = new Set(['menu', 'level-select', 'howtoplay', 'progress']);

const SESSION_PLAY_SCREENS = new Set(['patient', 'game', 'healed']);

const LEVEL1_POINTS_CORRECT = GAME_CONFIG.scoring.level1.pointsCorrect;

const LEVEL1_POINTS_WRONG = GAME_CONFIG.scoring.level1.pointsWrong;

const LEVEL1_MAX_ATTEMPTS = GAME_CONFIG.limits.level1MaxAttempts;

const LEVEL1_REQUIRED_STREAK = GAME_CONFIG.limits.level1RequiredStreak;

let GAME_DATA = null;

let _hoverCardOrganId = null;

let _bodyMapResizeBound = false;

let _l1MobileMqBound = false;

let _hotspotLayoutOverrides = null;

let _bodyMapLayoutObserver = null;

let _bodyMapLayoutTimer = null;

let USER_LEVELS_CACHE = [];

const SESSION_STORAGE_KEY = 'bodyquest_session';
const USERNAME_STORAGE_KEY = 'bodyquest_username';

const LEVEL_BADGE_META = {
  1: { emoji: '🟢', short: 'Level 1', name: 'Organ Identification', cls: 'level-badge--1' },
  2: { emoji: '🟡', short: 'Level 2', name: 'Disease Matching', cls: 'level-badge--2' },
  3: { emoji: '🔴', short: 'Level 3', name: 'Food Matching', cls: 'level-badge--3' },
  4: { emoji: '🟣', short: 'Level 4', name: 'Symptom Diagnosis', cls: 'level-badge--4' }
};

const LEVEL_END_SCREENS = new Set([
  'level1-complete', 'level1-gameover', 'level2-complete', 'level3-complete', 'level4-complete', 'complete'
]);

const LEVEL_CARD_UI = {
  1: {
    icon: '🟢',
    cardClass: 'level-card--1',
    hint: 'Match organ functions on the body map',
    visual: 'images/level-cards/level-1-card.png',
    visualFile: 'level-1-card.png',
    visualAlt: 'Level 1 — organ identification artwork',
    tag: 'Body Map'
  },
  2: {
    icon: '🟡',
    cardClass: 'level-card--2',
    hint: 'Match diseases to organs on the body map',
    visual: 'images/level-cards/level-2-card.png',
    visualFile: 'level-2-card.png',
    visualAlt: 'Level 2 — disease matching artwork',
    tag: 'Diseases'
  },
  3: {
    icon: '🔴',
    cardClass: 'level-card--3',
    hint: 'Match healing foods to organs on the body map',
    visual: 'images/level-cards/level-3-card.png',
    visualFile: 'level-3-card.png',
    visualAlt: 'Level 3 — food matching artwork',
    tag: 'Nutrition'
  },
  4: {
    icon: '🟣',
    cardClass: 'level-card--4',
    hint: 'Match symptoms to organs on the body map',
    visual: 'images/level-cards/level-4-card.png',
    visualFile: 'level-4-card.png',
    visualAlt: 'Level 4 — medical scan dashboard artwork',
    tag: 'Symptoms'
  }
};

const MAP_CLICK_PROMPT_META = {
  function: { label: 'Function clue', title: 'MATCH FUNCTIONS', matchHint: 'matching the function' },
  disease:  { label: 'Disease clue', title: 'MATCH DISEASES', matchHint: 'matching the disease' },
  food:     { label: 'Food + hint', title: 'MATCH FOODS', matchHint: 'matching the food and hint' },
  symptom:  { label: 'Symptom clue', title: 'MATCH SYMPTOMS', matchHint: 'matching the symptom' }
};

const LEVEL1_QUESTIONS_PER_ORGAN = 5;

const L1_MOBILE_CLUE_GAP = 16;

let _hoverHideTimer = null;

const LEVEL_PASS_MIN = GAME_CONFIG.thresholds.levelPassAccuracy;

const ORGAN_VISUAL_ASSETS = {
  blood:            { src: 'images/blood_cells.png',      caption: 'Red Blood Cells',        fit: 'contain' },
  eyes:             { src: 'images/eye.png',              caption: 'Human Eye',              fit: 'contain' },
  bones:            { src: 'images/bones.png',            caption: 'Bone Structure',         fit: 'contain' },
  lungs:            { src: 'images/lungs.png',            caption: 'Lungs',                  fit: 'contain' },
  stomach:          { src: 'images/stomach.png',          caption: 'Stomach',                fit: 'contain' },
  brain:            { src: 'images/brain.png',            caption: 'Brain & Nervous System', fit: 'contain' },
  skin:             { src: 'images/skin.png',             caption: 'Skin & Body Surface',    fit: 'contain' },
  heart:            { src: 'images/heart.png',            caption: 'Heart & Circulation',    fit: 'contain' },
  small_intestine:  { src: 'images/smallintestine.png',   caption: 'Small Intestine',        fit: 'contain' },
  large_intestine:  { src: 'images/largeIntestine.png',   caption: 'Large Intestine',        fit: 'contain' }
};

const revisionSessions = {};

let selOpt = -1, selFoods = [], nextStepLocked = false;

let presentedStep = null;

const DEDUCT = GAME_CONFIG.scoring.investigation.wrongPenalty;