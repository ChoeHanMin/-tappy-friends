// ========================================================
// Tappy Friends v3.7
// 탭/클릭으로 점프하며 파이프를 피하는 캐주얼 게임
// ========================================================

// ---------- 기본 설정 ----------
const LOGICAL_W = 360;
const LOGICAL_H = 640;

const GRAVITY        = 0.45;
const JUMP_VELOCITY  = -7.6;
const MAX_FALL_SPEED = 9;

const PIPE_WIDTH   = 54;
const START_PIPE_GAP     = 220;
const MIN_PIPE_GAP       = 148;
const START_PIPE_SPACING = 260;
const MIN_PIPE_SPACING   = 180;
const DIFFICULTY_RAMP_SCORE = 22;
const BASE_SPEED   = 2.6;
const MOVING_PIPE_SCORE_START = 8; // 이 점수부터 움직이는 파이프 등장

// 초반 이지모드 (거리 기준)
const EASY_MODE_DISTANCE  = 200;  // 이 거리(m)까지는 쉬운 외짝 파이프만 등장
const EASY_PIPE_HEIGHT_MIN = 55;  // 외짝 파이프 최소 길이
const EASY_PIPE_HEIGHT_MAX = 120; // 외짝 파이프 최대 길이
const EASY_PIPE_SPACING    = 275; // 이지모드 파이프 간격 (여유있게)

const GROUND_HEIGHT = 90;
const CHAR_RADIUS   = 20;
const PIXELS_PER_METER = 14;

// 아이템
const ITEM_RADIUS = 15;
const ITEM_SPAWN_CHANCE = 0.42;
const SPEED_DURATION       = 260;
const INVINCIBLE_DURATION  = 300;
const FLY_DURATION         = 360;
const SPEED_MULTIPLIER = 1.65;
const FLY_GRAVITY = 0.18;
const FLY_LIFT    = -0.5;
const FLY_MIN_VY  = -4.2;
const FLY_MAX_VY  = 4.6;

// 신규 아이템 지속시간(프레임)/수치
const SHIELD_DURATION    = 480; // 부딪히지 않으면 8초 후 소멸
const HEART_DURATION     = 600; // 10초 안에 안 쓰면 소멸
const CANDY_DURATION     = 300;
const CANDY_SHRINK       = 0.62; // 충돌 판정 반지름 배율
const MAGNET_DURATION    = 300;
const MAGNET_RANGE       = 150;
const MAGNET_PULL        = 0.08;
const BALLOON_DURATION   = 300;
const STAR_DURATION      = 300;
const ICECREAM_DURATION  = 300;
const HOURGLASS_DURATION = 240;
const HOURGLASS_SCALE    = 0.55; // 슬로모션 배율

const ITEM_TYPES = {
  meat:     { emoji: '🍖', label: '고기',      color: '#ffb08a' },
  snack:    { emoji: '🍪', label: '간식',      color: '#ffd873' },
  water:    { emoji: '💧', label: '물',        color: '#7fd1ff' },
  shield:   { emoji: '🛡️', label: '방패',      color: '#9fd6ff' },
  heart:    { emoji: '❤️', label: '하트',      color: '#ff6b81' },
  candy:    { emoji: '🍬', label: '사탕',      color: '#ff9ecf' },
  magnet:   { emoji: '🧲', label: '자석껌',    color: '#c58bff' },
  balloon:  { emoji: '🎈', label: '풍선껌',    color: '#ff8fb3' },
  star:     { emoji: '⭐', label: '별사탕',    color: '#ffe066' },
  iceCream: { emoji: '🧊', label: '얼음과자',  color: '#a0e9ff' },
  hourglass:{ emoji: '⏰', label: '모래시계',  color: '#d9c38a' },
  mystery:  { emoji: '🎁', label: '미스터리',  color: '#c9c9c9' }
};

// 아이템 등장 가중치 (숫자가 클수록 자주 나옴)
const ITEM_WEIGHTS = {
  meat: 3, snack: 3, water: 3, candy: 3,
  shield: 2, magnet: 2, balloon: 2, star: 2, iceCream: 2, hourglass: 2,
  heart: 1, mystery: 1
};
const ITEM_WEIGHTED_POOL = Object.entries(ITEM_WEIGHTS)
  .flatMap(([type, w]) => Array(w).fill(type));

// 저장 키
const STORAGE_KEY_SCORE    = 'tapTapFriends_bestScore';
const STORAGE_KEY_DISTANCE = 'tapTapFriends_bestDistance';
const STORAGE_KEY_COMBO    = 'ttf_bestCombo';
const STORAGE_KEY_MUTED    = 'ttf_muted';
const STORAGE_KEY_WINTER   = 'ttf_winterEnabled';
const STORAGE_KEY_SEEN_HOWTO = 'ttf_seenHowto';
const STORAGE_KEY_STATS    = 'ttf_overallStats';
const STORAGE_KEY_LEADERBOARD = 'ttf_leaderboard';
const DAILY_DONE_PREFIX = 'ttf_dailyDone_';

// 시작 카운트다운
const COUNTDOWN_SEQUENCE = [
  { text: 'GAME START', frames: 55, size: 34 },
  { text: '3', frames: 42, size: 90 },
  { text: '2', frames: 42, size: 90 },
  { text: '1', frames: 42, size: 90 }
];

const DYING_FRAMES = 26; // 슬로모션 연출 길이

// ---------- 캐릭터 정의 ----------
const CHARACTERS = {
  hanmin: {
    name: '한민', desc: '수달 · 균형형',
    body: '#b9835a', bodyDark: '#8a5c39', belly: '#f2e3c4', accent: '#6f4429',
    gravityMult: 1, jumpMult: 1, speedMult: 1, jumpFreq: 520
  },
  henry: {
    name: '헨리', desc: '치와와 · 가볍게 점프',
    body: '#e8c39e', bodyDark: '#caa06a', belly: '#fbf0dd', accent: '#7a5636',
    gravityMult: 0.86, jumpMult: 1.08, speedMult: 1, jumpFreq: 700
  },
  charles: {
    name: '찰스', desc: '검갈색 햄스터 · 질주형',
    body: '#6b4a34', bodyDark: '#4a3122', belly: '#a97e5c', accent: '#2c1c12',
    gravityMult: 1, jumpMult: 1, speedMult: 1.15, jumpFreq: 420
  },
  mary: {
    name: '메리', desc: '흰색 햄스터 · 포근한 착지',
    body: '#fdfbf7', bodyDark: '#e3ded3', belly: '#ffd3dd', accent: '#c9c2b4',
    gravityMult: 0.82, jumpMult: 0.95, speedMult: 1, jumpFreq: 600
  },
  leo: {
    name: '루이', desc: '수수께끼의 황금 냥사자 · 올라운더',
    body: '#e8a83c', bodyDark: '#c98620', belly: '#fbe6b0', accent: '#7a4a12', mane: '#b96a1a',
    gravityMult: 0.92, jumpMult: 1.06, speedMult: 1.08, jumpFreq: 760
  }
};

// ---------- 타이틀 화면 작가 멘트 (로테이션) ----------
const AUTHOR_QUOTES = [
  '제작자 최한민도 이 게임을 못 합니다 ㅋㅋ',
  '최한민은 공주입니다',
  '최한민은 이 게임 오지게 못해요 ㅠㅠ',
  '최한민은 프린세스 뀨우',
  '최한민은 사실 수달 담당입니다',
  '이 게임, 최한민보다 당신이 더 잘할 확률 99%',
  '최한민 왈: "난 그냥 만들었을 뿐..." (근데 못함)',
  '제작자보다 못하기가 더 어렵습니다'
];

// ---------- 일일 미션 템플릿 ----------
const DAILY_TEMPLATES = [
  { text: '무적 없이 30m 가기', check: (r) => r.distance >= 30 && !r.usedInvincible },
  { text: '아이템 3개 먹기', check: (r) => r.itemsCollected >= 3 },
  { text: '점수 10점 넘기기', check: (r) => r.score >= 10 },
  { text: '150m 이상 날아가기', check: (r) => r.distance >= 150 },
  { text: '무적 콤보 3개 이상 만들기', check: (r) => r.maxCombo >= 3 }
];

// ---------- 업적 정의 ----------
const ACHIEVEMENTS = [
  { id: 'first_flight', icon: '🐣', title: '첫 비행', desc: '첫 게임을 플레이했어요',
    check: (r, o) => o.gamesPlayed >= 1 },
  { id: 'score_10', icon: '🔟', title: '두 자릿수 클리어', desc: '한 판에서 점수 10점 넘기기',
    check: (r) => r.score >= 10 },
  { id: 'score_25', icon: '🚀', title: '베테랑 파일럿', desc: '한 판에서 점수 25점 넘기기',
    check: (r) => r.score >= 25 },
  { id: 'distance_100', icon: '🏁', title: '100m 클럽', desc: '한 판에서 100m 이상 이동',
    check: (r) => r.distance >= 100 },
  { id: 'distance_500', icon: '🌍', title: '장거리 비행사', desc: '한 판에서 500m 이상 이동',
    check: (r) => r.distance >= 500 },
  { id: 'item_collector', icon: '🎁', title: '수집가', desc: '한 판에서 아이템 3개 이상 먹기',
    check: (r) => r.itemsCollected >= 3 },
  { id: 'invincible_combo_5', icon: '✨', title: '무적 러너', desc: '무적 상태에서 파이프 5개 연속 통과',
    check: (r) => r.maxCombo >= 5 },
  { id: 'all_characters', icon: '👨‍👩‍👧‍👦', title: '네 친구 다 써봤다', desc: '한민·헨리·찰스·메리 모두 플레이',
    check: (r, o) => ['hanmin', 'henry', 'charles', 'mary'].every((c) => o.playedChars.includes(c)) },
  { id: 'hidden_unlocked', icon: '🦁', title: '미스터리 발견', desc: '숨겨진 캐릭터 루이 잠금 해제',
    check: () => isLeoUnlocked() },
  { id: 'daily_done', icon: '📅', title: '오늘의 미션 클리어', desc: '일일 미션을 완료했어요',
    check: (r) => r.dailyCompletedThisRun }
];

// ---------- DOM 참조 ----------
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const screenTitle        = document.getElementById('screen-title');
const screenSelect       = document.getElementById('screen-select');
const screenHowto        = document.getElementById('screen-howto');
const screenAchievements = document.getElementById('screen-achievements');
const screenLeaderboard  = document.getElementById('screen-leaderboard');
const screenCredits      = document.getElementById('screen-credits');
const screenPaused       = document.getElementById('screen-paused');
const screenChangelog    = document.getElementById('screen-changelog');
const screenOver         = document.getElementById('screen-over');
const hud                = document.getElementById('hud');

const btnGotoSelect       = document.getElementById('btn-goto-select');
const btnGotoHowto        = document.getElementById('btn-goto-howto');
const btnGotoAchievements = document.getElementById('btn-goto-achievements');
const btnGotoLeaderboard  = document.getElementById('btn-goto-leaderboard');
const btnGotoCredits      = document.getElementById('btn-goto-credits');
const btnBackTitle1 = document.getElementById('btn-back-title-1');
const btnBackTitle2 = document.getElementById('btn-back-title-2');
const btnBackTitle3 = document.getElementById('btn-back-title-3');
const btnBackTitle4 = document.getElementById('btn-back-title-4');
const btnBackTitle5 = document.getElementById('btn-back-title-5');
const btnBackTitle6 = document.getElementById('btn-back-title-6');
const btnVersion = document.getElementById('btn-version');
const btnStart      = document.getElementById('btn-start');
const btnRetry      = document.getElementById('btn-retry');
const btnChangeChar = document.getElementById('btn-change-char');
const btnSaveImage  = document.getElementById('btn-save-image');
const btnWinterToggle = document.getElementById('btn-winter-toggle');
const btnMute  = document.getElementById('btn-mute');
const btnPause = document.getElementById('btn-pause');
const btnResume    = document.getElementById('btn-resume');
const btnQuitTitle = document.getElementById('btn-quit-title');
const cardLeo = document.getElementById('card-leo');
const leoDescEl = document.getElementById('leo-desc');

const scoreEl         = document.getElementById('score');
const distanceEl      = document.getElementById('distance');
const effectsStatusEl = document.getElementById('effects-status');

const finalScoreEl    = document.getElementById('final-score');
const bestScoreEl     = document.getElementById('best-score');
const finalDistanceEl = document.getElementById('final-distance');
const bestDistanceEl  = document.getElementById('best-distance');
const finalComboEl    = document.getElementById('final-combo');
const bestComboEl     = document.getElementById('best-combo');
const newAchievementsEl = document.getElementById('new-achievements');
const dailyResultEl     = document.getElementById('daily-result');
const newRecordBadgeEl  = document.getElementById('new-record-badge');
const nameEntryEl       = document.getElementById('name-entry');
const nameEntryInput    = document.getElementById('name-entry-input');
const nameEntrySavedEl  = document.getElementById('name-entry-saved');
const btnNameSave       = document.getElementById('btn-name-save');
const authorQuoteEl     = document.getElementById('author-quote');
const titleBestLabel  = document.getElementById('title-best-label');

const dailyTextEl   = document.getElementById('daily-text');
const dailyStatusEl = document.getElementById('daily-status');
const achievementsListEl = document.getElementById('achievements-list');
const leaderboardListEl  = document.getElementById('leaderboard-list');

canvas.width = LOGICAL_W;
canvas.height = LOGICAL_H;

// ---------- 게임 상태 ----------
let state = 'title';
let selectedChar = null;

let player = { x: 96, y: LOGICAL_H / 2, vy: 0, rot: 0 };
let pipes = [];
let items = [];
let particles = [];
let popups = [];

let score = 0;
let distanceM = 0;
let bestScore = Number(localStorage.getItem(STORAGE_KEY_SCORE) || 0);
let bestDistance = Number(localStorage.getItem(STORAGE_KEY_DISTANCE) || 0);
let bestCombo = Number(localStorage.getItem(STORAGE_KEY_COMBO) || 0);

let frame = 0;
let speed = BASE_SPEED;
let groundOffset = 0;
let isPointerDown = false;

let speedTimer = 0;
let invincibleTimer = 0;
let flyTimer = 0;
let shieldTimer = 0;
let heartTimer = 0;
let candyTimer = 0;
let magnetTimer = 0;
let balloonTimer = 0;
let starTimer = 0;
let iceCreamTimer = 0;
let hourglassTimer = 0;

let comboCurrent = 0;
let runMaxCombo = 0;
let itemsCollectedRun = 0;
let usedInvincibleRun = false;
let dailyCompletedThisRun = false;

let shakeIntensity = 0;
let dyingTimer = 0;

let countdownIndex = 0;
let countdownFrameLeft = 0;

let muted = localStorage.getItem(STORAGE_KEY_MUTED) === '1';
let winterEnabled = localStorage.getItem(STORAGE_KEY_WINTER) === '1';
let quoteRotateInterval = null;
let lastQuoteIndex = -1;
let currentNameEntryId = null;

updateMuteButton();

// ========================================================
// 저장 데이터 헬퍼
// ========================================================
function loadStats() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY_STATS));
    if (raw && typeof raw === 'object') {
      return {
        gamesPlayed: raw.gamesPlayed || 0,
        playedChars: raw.playedChars || [],
        unlockedAchievements: raw.unlockedAchievements || []
      };
    }
  } catch (e) { /* ignore */ }
  return { gamesPlayed: 0, playedChars: [], unlockedAchievements: [] };
}

function saveStats(stats) {
  localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
}

function loadLeaderboard() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY_LEADERBOARD));
    if (Array.isArray(raw)) return raw;
  } catch (e) { /* ignore */ }
  return [];
}

function saveLeaderboard(list) {
  localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(list));
}

function updateLeaderboard(entry) {
  const list = loadLeaderboard();
  list.push(entry);
  list.sort((a, b) => (b.score - a.score) || (b.distance - a.distance));
  const trimmed = list.slice(0, 5);
  saveLeaderboard(trimmed);
  return trimmed;
}

function setLeaderboardName(id, name) {
  const list = loadLeaderboard();
  const entry = list.find((e) => e.id === id);
  if (entry) {
    entry.name = name;
    saveLeaderboard(list);
  }
}

function isLeoUnlocked() {
  return bestScore >= 15 || bestDistance >= 300;
}

function isWinterUnlocked() {
  return bestDistance >= 400;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

function isDailyDoneToday() {
  return localStorage.getItem(DAILY_DONE_PREFIX + todayKey()) === '1';
}

function markDailyDone() {
  localStorage.setItem(DAILY_DONE_PREFIX + todayKey(), '1');
}

function getDailyChallenge() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return DAILY_TEMPLATES[dayOfYear % DAILY_TEMPLATES.length];
}

function updateTitleBestLabel() {
  if (bestScore > 0 || bestDistance > 0) {
    let text = `최고 점수 ${bestScore} · 최고 거리 ${bestDistance}m`;
    if (bestCombo > 0) text += ` · 최고 콤보 ${bestCombo}`;
    titleBestLabel.textContent = text;
  } else {
    titleBestLabel.textContent = '아직 최고 기록이 없어요! 첫 판에 도전해보세요 🐣';
  }
}

function pickNextQuoteIndex() {
  if (AUTHOR_QUOTES.length <= 1) return 0;
  let idx;
  do { idx = Math.floor(Math.random() * AUTHOR_QUOTES.length); } while (idx === lastQuoteIndex);
  lastQuoteIndex = idx;
  return idx;
}

function showNextQuote() {
  if (!authorQuoteEl) return;
  authorQuoteEl.style.opacity = '0';
  setTimeout(() => {
    authorQuoteEl.textContent = AUTHOR_QUOTES[pickNextQuoteIndex()];
    authorQuoteEl.style.opacity = '1';
  }, 220);
}

function startQuoteRotation() {
  stopQuoteRotation();
  authorQuoteEl.style.opacity = '1';
  authorQuoteEl.textContent = AUTHOR_QUOTES[pickNextQuoteIndex()];
  quoteRotateInterval = setInterval(showNextQuote, 3600);
}

function stopQuoteRotation() {
  if (quoteRotateInterval) { clearInterval(quoteRotateInterval); quoteRotateInterval = null; }
}

function updateDailyCardUI() {
  const challenge = getDailyChallenge();
  dailyTextEl.textContent = challenge.text;
  dailyStatusEl.textContent = isDailyDoneToday() ? '✅ 완료!' : '🔥 도전 중';
}

function updateLeoLockUI() {
  if (isLeoUnlocked()) {
    cardLeo.classList.remove('locked');
    leoDescEl.textContent = CHARACTERS.leo.desc;
  } else {
    cardLeo.classList.add('locked');
    leoDescEl.textContent = '🔒 점수 15 또는 거리 300m 달성 시 해제';
  }
}

function updateWinterButtonUI() {
  if (isWinterUnlocked()) {
    btnWinterToggle.classList.remove('hidden');
    btnWinterToggle.textContent = `❄️ 겨울 테마: ${winterEnabled ? 'ON' : 'OFF'}`;
  } else {
    btnWinterToggle.classList.add('hidden');
  }
}

function updateMuteButton() {
  btnMute.textContent = muted ? '🔇' : '🔊';
}

// ========================================================
// 오디오 (전부 Web Audio API로 합성 - 외부 파일 없음)
// ========================================================
let audioCtx = null;
let bgmInterval = null;
let bgmStep = 0;
// 신나는 8비트풍 루프: 리드 멜로디 + 베이스 라인을 같이 연주
const BGM_LEAD = [659, 784, 988, 784, 659, 988, 784, 659, 523, 659, 784, 659, 523, 659, 523, 392];
const BGM_BASS = [262, 262, 330, 262, 262, 262, 330, 392, 196, 196, 247, 196, 196, 196, 196, 196];
const BGM_STEP_MS = 165;

function ensureAudioCtx() {
  if (audioCtx) return;
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtxClass) return;
  audioCtx = new AudioCtxClass();
}

function resumeAudioCtx() {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
}

function beep(freq, dur, type = 'sine', vol = 0.18, delay = 0) {
  if (muted || !audioCtx) return;
  const t0 = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function playJump() {
  const freq = (selectedChar && CHARACTERS[selectedChar].jumpFreq) || 520;
  beep(freq, 0.11, 'triangle', 0.14);
}

function playItem(type) {
  if (type === 'meat') { beep(700, 0.08, 'square', 0.15); beep(900, 0.1, 'square', 0.15, 0.07); }
  else if (type === 'snack') { beep(900, 0.07, 'sine', 0.15); beep(1200, 0.07, 'sine', 0.15, 0.06); beep(1500, 0.1, 'sine', 0.15, 0.12); }
  else if (type === 'water') { beep(600, 0.08, 'sine', 0.13); beep(450, 0.12, 'sine', 0.13, 0.07); }
  else if (type === 'shield') { beep(500, 0.1, 'square', 0.14); beep(750, 0.12, 'square', 0.14, 0.06); }
  else if (type === 'heart') { beep(784, 0.09, 'sine', 0.16); beep(988, 0.09, 'sine', 0.16, 0.08); beep(1175, 0.14, 'sine', 0.16, 0.16); }
  else if (type === 'candy') { beep(1000, 0.05, 'triangle', 0.12); beep(1300, 0.06, 'triangle', 0.12, 0.05); }
  else if (type === 'magnet') { beep(300, 0.1, 'sawtooth', 0.12); beep(600, 0.1, 'sawtooth', 0.12, 0.06); }
  else if (type === 'balloon') { beep(500, 0.1, 'sine', 0.13); beep(700, 0.1, 'sine', 0.13, 0.06); beep(900, 0.12, 'sine', 0.13, 0.12); }
  else if (type === 'star') { beep(1046, 0.06, 'square', 0.14); beep(1318, 0.06, 'square', 0.14, 0.05); beep(1568, 0.1, 'square', 0.14, 0.1); }
  else if (type === 'iceCream') { beep(1200, 0.1, 'sine', 0.12); beep(900, 0.14, 'sine', 0.12, 0.08); }
  else if (type === 'hourglass') { beep(400, 0.2, 'sine', 0.12); beep(350, 0.24, 'sine', 0.12, 0.1); }
  else if (type === 'mystery') { beep(500, 0.05, 'square', 0.1); beep(700, 0.05, 'square', 0.1, 0.05); beep(900, 0.05, 'square', 0.1, 0.1); }
}

function playShieldBreak() {
  beep(300, 0.1, 'square', 0.16);
  beep(180, 0.16, 'square', 0.14, 0.05);
}

function playRevive() {
  beep(523, 0.1, 'sine', 0.16);
  beep(659, 0.1, 'sine', 0.16, 0.08);
  beep(784, 0.16, 'sine', 0.16, 0.16);
}

function playScorePoint() {
  beep(880, 0.07, 'square', 0.1);
}

function playCollision() {
  beep(140, 0.28, 'sawtooth', 0.22);
  beep(90, 0.3, 'sawtooth', 0.18, 0.03);
}

function vibrate(ms) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

function startBgm() {
  stopBgm();
  if (muted) return;
  ensureAudioCtx();
  resumeAudioCtx();
  if (!audioCtx) return;
  bgmStep = 0;
  bgmInterval = setInterval(() => {
    if (muted || !audioCtx) return;
    resumeAudioCtx();
    const lead = BGM_LEAD[bgmStep % BGM_LEAD.length];
    const bass = BGM_BASS[bgmStep % BGM_BASS.length];
    beep(lead, 0.15, 'triangle', 0.1);
    if (bgmStep % 2 === 0) beep(bass, 0.28, 'sine', 0.08);
    bgmStep++;
  }, BGM_STEP_MS);
}

function stopBgm() {
  if (bgmInterval) { clearInterval(bgmInterval); bgmInterval = null; }
}

// ========================================================
// 캐릭터 드로잉
// ========================================================
function drawCharacter(context, key, cx, cy, size, rot, bob) {
  const c = CHARACTERS[key];
  if (!c) return;
  context.save();
  context.translate(cx, cy);
  context.rotate(rot);

  context.save();
  context.rotate(-rot);
  context.beginPath();
  context.ellipse(0, size + 6, size * 0.9, size * 0.28, 0, 0, Math.PI * 2);
  context.fillStyle = 'rgba(0,0,0,0.15)';
  context.fill();
  context.restore();

  const s = size / 20;

  if (key === 'hanmin') drawOtter(context, c, s, bob);
  else if (key === 'henry') drawChihuahua(context, c, s, bob);
  else if (key === 'charles' || key === 'mary') drawHamster(context, c, s, bob, key === 'mary');
  else if (key === 'leo') drawLion(context, c, s, bob);

  context.restore();
}

function drawOtter(ctx, c, s, bob) {
  ctx.fillStyle = c.bodyDark;
  ctx.beginPath();
  ctx.ellipse(-16 * s, 6 * s + bob * 0.3, 12 * s, 5 * s, 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.body;
  ctx.beginPath();
  ctx.ellipse(0, 2 * s, 19 * s, 17 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.belly;
  ctx.beginPath();
  ctx.ellipse(1 * s, 8 * s, 11 * s, 9 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.bodyDark;
  ctx.beginPath();
  ctx.arc(-11 * s, -13 * s, 4 * s, 0, Math.PI * 2);
  ctx.arc(9 * s, -13 * s, 4 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.belly;
  ctx.beginPath();
  ctx.ellipse(0, 1 * s, 10 * s, 8 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.ellipse(0, -2 * s, 2.6 * s, 2 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  drawEyes(ctx, s, -5 * s);

  ctx.strokeStyle = 'rgba(60,40,25,0.5)';
  ctx.lineWidth = 1;
  [-1, 1].forEach(dir => {
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.moveTo(dir * 6 * s, -1 * s + i * 3 * s);
      ctx.lineTo(dir * 16 * s, -3 * s + i * 4 * s);
      ctx.stroke();
    }
  });

  ctx.fillStyle = c.bodyDark;
  ctx.beginPath();
  ctx.ellipse(-8 * s, 17 * s + bob * 0.4, 5 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(8 * s, 17 * s - bob * 0.4, 5 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawChihuahua(ctx, c, s, bob) {
  ctx.fillStyle = c.bodyDark;
  ctx.beginPath();
  ctx.moveTo(-9 * s, -10 * s);
  ctx.quadraticCurveTo(-24 * s, -22 * s - bob, -14 * s, -2 * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(9 * s, -10 * s);
  ctx.quadraticCurveTo(24 * s, -22 * s + bob, 14 * s, -2 * s);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = c.body;
  ctx.beginPath();
  ctx.ellipse(0, 2 * s, 18 * s, 16 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.belly;
  ctx.beginPath();
  ctx.ellipse(0, 8 * s, 9 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.ellipse(0, 5 * s, 2.4 * s, 1.8 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  drawEyes(ctx, s, -2 * s, 3.4);

  ctx.fillStyle = c.bodyDark;
  ctx.beginPath();
  ctx.ellipse(-7 * s, 16 * s + bob * 0.4, 4.5 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(7 * s, 16 * s - bob * 0.4, 4.5 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHamster(ctx, c, s, bob, isMary) {
  ctx.fillStyle = c.body;
  ctx.beginPath();
  ctx.ellipse(0, 4 * s, 19 * s, 16 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isMary ? c.belly : c.bodyDark;
  ctx.beginPath();
  ctx.arc(-12 * s, -10 * s, 4.2 * s, 0, Math.PI * 2);
  ctx.arc(12 * s, -10 * s, 4.2 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.belly;
  ctx.beginPath();
  ctx.ellipse(-13 * s, 6 * s, 7 * s, 6 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(13 * s, 6 * s, 7 * s, 6 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.belly;
  ctx.beginPath();
  ctx.ellipse(0, 10 * s, 9 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.ellipse(0, -1 * s, 2 * s, 1.6 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  drawEyes(ctx, s, -3 * s, 3.2);

  ctx.fillStyle = c.bodyDark;
  ctx.beginPath();
  ctx.ellipse(-7 * s, 18 * s + bob * 0.4, 4.5 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(7 * s, 18 * s - bob * 0.4, 4.5 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawLion(ctx, c, s, bob) {
  ctx.fillStyle = c.mane;
  const spikes = 10;
  for (let i = 0; i < spikes; i++) {
    const ang = (i / spikes) * Math.PI * 2;
    const mx = Math.cos(ang) * 17 * s;
    const my = Math.sin(ang) * 17 * s;
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.ellipse(0, 0, 7 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = c.body;
  ctx.beginPath();
  ctx.ellipse(0, 3 * s, 17 * s, 15 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.belly;
  ctx.beginPath();
  ctx.ellipse(0, 7 * s, 9 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.bodyDark;
  ctx.beginPath();
  ctx.arc(-10 * s, -11 * s, 3.6 * s, 0, Math.PI * 2);
  ctx.arc(10 * s, -11 * s, 3.6 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.ellipse(0, 3 * s, 2.2 * s, 1.7 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  drawEyes(ctx, s, -1 * s, 2.8);

  ctx.fillStyle = c.bodyDark;
  ctx.beginPath();
  ctx.ellipse(-7 * s, 16 * s + bob * 0.4, 4.5 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(7 * s, 16 * s - bob * 0.4, 4.5 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawEyes(ctx, s, y, r = 2.6) {
  ctx.fillStyle = '#2b2018';
  ctx.beginPath();
  ctx.arc(-6 * s, y, r * s, 0, Math.PI * 2);
  ctx.arc(6 * s, y, r * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-6 * s + r * s * 0.35, y - r * s * 0.35, r * s * 0.3, 0, Math.PI * 2);
  ctx.arc(6 * s + r * s * 0.35, y - r * s * 0.35, r * s * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

// 캐릭터별 점프 대사
const JUMP_TALK = {
  hanmin: ['첨벙!', '흐앗!', '가자!'],
  henry: ['멍!', '멍멍!', '깽!'],
  charles: ['찍!', '찌직!', '흐냐!'],
  mary: ['찌익!', '뿌잉!', '두둥!'],
  leo: ['그르릉!', '어흥!', '가아앙!']
};

function spawnJumpPopup() {
  const list = JUMP_TALK[selectedChar] || ['점프!'];
  const text = list[Math.floor(Math.random() * list.length)];
  popups.push({ text, x: player.x, y: player.y - CHAR_RADIUS - 6, life: 40, maxLife: 40 });
}

// ========================================================
// 캐릭터 선택 화면 미리보기 렌더링
// ========================================================
function renderCharPreviews() {
  document.querySelectorAll('.char-card').forEach(card => {
    const key = card.dataset.char;
    const prevCanvas = card.querySelector('.char-preview');
    const pctx = prevCanvas.getContext('2d');
    pctx.clearRect(0, 0, prevCanvas.width, prevCanvas.height);
    drawCharacter(pctx, key, prevCanvas.width / 2, prevCanvas.height / 2 + 6, 18, 0, 0);
  });
}
renderCharPreviews();

// ========================================================
// 배경 (하늘/구름/땅/눈) 그리기
// ========================================================
const clouds = [];
for (let i = 0; i < 5; i++) {
  clouds.push({
    x: Math.random() * LOGICAL_W,
    y: 40 + Math.random() * 220,
    scale: 0.6 + Math.random() * 0.8,
    speed: 0.15 + Math.random() * 0.2
  });
}

const snowflakes = [];
for (let i = 0; i < 40; i++) {
  snowflakes.push({
    x: Math.random() * LOGICAL_W,
    y: Math.random() * LOGICAL_H,
    r: 1.5 + Math.random() * 2.5,
    speed: 0.6 + Math.random() * 1.2,
    drift: Math.random() * Math.PI * 2
  });
}

function drawCloud(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 13, 0, 0, Math.PI * 2);
  ctx.ellipse(18, -6, 16, 11, 0, 0, Math.PI * 2);
  ctx.ellipse(-16, -4, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function getSkyPhase() {
  // 0: 낮, 1: 노을, 2: 밤 (15점마다 순환)
  return Math.floor(score / 15) % 3;
}

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_H);

  if (winterEnabled) {
    grad.addColorStop(0, '#cfe8f7');
    grad.addColorStop(1, '#f2f9ff');
  } else if (invincibleTimer > 0) {
    grad.addColorStop(0, '#ffe89a');
    grad.addColorStop(1, '#fff6db');
  } else {
    const phase = state === 'playing' || state === 'dying' || state === 'gameover' ? getSkyPhase() : 0;
    if (phase === 0) {
      grad.addColorStop(0, '#8fd3f4');
      grad.addColorStop(1, '#dff5ea');
    } else if (phase === 1) {
      grad.addColorStop(0, '#ff9a76');
      grad.addColorStop(1, '#ffd9a0');
    } else {
      grad.addColorStop(0, '#1b2a4a');
      grad.addColorStop(1, '#3c4f72');
    }
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

  // 밤일 때 별
  if (!winterEnabled && (state === 'playing' || state === 'dying' || state === 'gameover') && getSkyPhase() === 2 && invincibleTimer <= 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 0; i < 18; i++) {
      const sx = (i * 53 + (frame * 0.02) % 40) % LOGICAL_W;
      const sy = (i * 37) % (LOGICAL_H - GROUND_HEIGHT - 40);
      ctx.beginPath();
      ctx.arc(sx, sy + 10, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  clouds.forEach(cl => drawCloud(cl.x, cl.y, cl.scale));

  if (winterEnabled) {
    snowflakes.forEach(f => {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill();
    });
  }

  ctx.fillStyle = winterEnabled ? 'rgba(200,225,240,0.5)' : 'rgba(120,190,150,0.35)';
  ctx.beginPath();
  ctx.moveTo(0, LOGICAL_H - GROUND_HEIGHT);
  for (let x = 0; x <= LOGICAL_W; x += 40) {
    ctx.lineTo(x, LOGICAL_H - GROUND_HEIGHT - 20 - Math.sin(x * 0.02) * 14);
  }
  ctx.lineTo(LOGICAL_W, LOGICAL_H - GROUND_HEIGHT);
  ctx.closePath();
  ctx.fill();
}

function drawGround() {
  const gy = LOGICAL_H - GROUND_HEIGHT;
  ctx.fillStyle = winterEnabled ? '#eaf3fb' : '#d8c47a';
  ctx.fillRect(0, gy, LOGICAL_W, GROUND_HEIGHT);
  ctx.fillStyle = winterEnabled ? '#ffffff' : '#8bc76a';
  ctx.fillRect(0, gy, LOGICAL_W, 14);

  ctx.fillStyle = winterEnabled ? '#dceaf5' : '#79b85c';
  const tileW = 22;
  for (let x = -tileW + (groundOffset % tileW); x < LOGICAL_W; x += tileW) {
    ctx.beginPath();
    ctx.moveTo(x, gy + 14);
    ctx.lineTo(x + tileW / 2, gy + 4);
    ctx.lineTo(x + tileW, gy + 14);
    ctx.closePath();
    ctx.fill();
  }
}

// ========================================================
// 난이도 곡선
// ========================================================
function currentPipeGap() {
  const t = Math.min(1, score / DIFFICULTY_RAMP_SCORE);
  return START_PIPE_GAP - (START_PIPE_GAP - MIN_PIPE_GAP) * t;
}

function currentPipeSpacing() {
  const t = Math.min(1, score / DIFFICULTY_RAMP_SCORE);
  return START_PIPE_SPACING - (START_PIPE_SPACING - MIN_PIPE_SPACING) * t;
}

// ========================================================
// 파이프 (장애물) + 아이템
// ========================================================
function isEasyPhase() {
  return distanceM < EASY_MODE_DISTANCE;
}

function maybeSpawnItem(xStart, itemY) {
  if (Math.random() < ITEM_SPAWN_CHANCE) {
    const type = ITEM_WEIGHTED_POOL[Math.floor(Math.random() * ITEM_WEIGHTED_POOL.length)];
    items.push({
      x: xStart + PIPE_WIDTH / 2,
      y: itemY,
      type,
      collected: false,
      bobPhase: Math.random() * Math.PI * 2
    });
  }
}

function spawnEasyPipe(xStart) {
  const groundY = LOGICAL_H - GROUND_HEIGHT;
  const height = EASY_PIPE_HEIGHT_MIN + Math.random() * (EASY_PIPE_HEIGHT_MAX - EASY_PIPE_HEIGHT_MIN);
  const fromTop = Math.random() < 0.5; // 절반은 천장에서, 절반은 땅에서 튀어나옴

  let topHeight = 0;
  let bottomY = groundY;
  let itemY;

  if (fromTop) {
    topHeight = height;
    itemY = topHeight + (groundY - topHeight) / 2;
  } else {
    bottomY = groundY - height;
    itemY = bottomY / 2;
  }

  pipes.push({
    x: xStart,
    topHeight,
    bottomY,
    gap: bottomY - topHeight,
    passed: false,
    moving: false,
    baseTop: topHeight,
    oscAmp: 0, oscSpeed: 0, oscPhase: 0,
    hasTop: fromTop,
    hasBottom: !fromTop
  });

  maybeSpawnItem(xStart, itemY);
}

function spawnNormalPipe(xStart) {
  const gap = currentPipeGap();
  const margin = 60;
  const minTop = margin;
  const maxTop = LOGICAL_H - GROUND_HEIGHT - margin - gap;
  const topHeight = minTop + Math.random() * Math.max(20, (maxTop - minTop));

  const movingChance = Math.min(0.45, Math.max(0, (score - MOVING_PIPE_SCORE_START) * 0.025));
  const isMoving = score >= MOVING_PIPE_SCORE_START && Math.random() < movingChance;

  pipes.push({
    x: xStart,
    topHeight,
    bottomY: topHeight + gap,
    gap,
    passed: false,
    moving: isMoving,
    baseTop: topHeight,
    oscAmp: 16 + Math.random() * 22,
    oscSpeed: 0.02 + Math.random() * 0.02,
    oscPhase: Math.random() * Math.PI * 2,
    hasTop: true,
    hasBottom: true
  });

  maybeSpawnItem(xStart, topHeight + gap / 2);
}

function spawnPipe(xStart) {
  if (isEasyPhase()) {
    spawnEasyPipe(xStart);
  } else {
    spawnNormalPipe(xStart);
  }
}

function nextPipeSpacing() {
  return isEasyPhase() ? EASY_PIPE_SPACING : currentPipeSpacing();
}

function resetPipes() {
  pipes = [];
  items = [];
  let x = LOGICAL_W + 80;
  for (let i = 0; i < 4; i++) {
    spawnPipe(x);
    x += nextPipeSpacing();
  }
}

function drawPipe(p) {
  const groundY = LOGICAL_H - GROUND_HEIGHT;
  if (p.hasTop) drawPipeSegment(p.x, 0, PIPE_WIDTH, p.topHeight, true);
  if (p.hasBottom) drawPipeSegment(p.x, p.bottomY, PIPE_WIDTH, groundY - p.bottomY, false);
}

function drawPipeSegment(x, y, w, h, isTop) {
  const capH = 22;
  const frosty = winterEnabled || iceCreamTimer > 0;
  const cMain = frosty ? '#bfe4f7' : '#4fb85f';
  const cSide = frosty ? '#9ccbe6' : '#3a9b4a';
  const cCap = frosty ? '#8fbcd9' : '#2f8f42';
  const cCapTop = frosty ? '#a9d3ec' : '#3ea850';

  ctx.fillStyle = cMain;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = cSide;
  ctx.fillRect(x, y, 6, h);

  ctx.fillStyle = cCap;
  if (isTop) {
    ctx.fillRect(x - 4, y + h - capH, w + 8, capH);
    ctx.fillStyle = cCapTop;
    ctx.fillRect(x - 4, y + h - capH, w + 8, 6);
  } else {
    ctx.fillRect(x - 4, y, w + 8, capH);
    ctx.fillStyle = cCapTop;
    ctx.fillRect(x - 4, y + capH - 6, w + 8, 6);
  }
}

function drawItems() {
  items.forEach(it => {
    if (it.collected) return;
    const info = ITEM_TYPES[it.type];
    const bob = Math.sin(frame * 0.12 + it.bobPhase) * 5;
    const y = it.y + bob;

    ctx.save();
    ctx.beginPath();
    ctx.arc(it.x, y, ITEM_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fill();
    ctx.strokeStyle = info.color;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = "20px 'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(info.emoji, it.x, y + 1);
    ctx.restore();
  });
}

// ========================================================
// 파티클 / 말풍선
// ========================================================
function spawnParticles(x, y, color, count = 18) {
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 1.5 + Math.random() * 4;
    particles.push({
      x, y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd - 1,
      life: 30 + Math.random() * 20,
      maxLife: 50,
      size: 2 + Math.random() * 3,
      color
    });
  }
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.18;
    p.life--;
  });
  particles = particles.filter(p => p.life > 0);
}

function drawParticles() {
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function updatePopups() {
  popups.forEach(p => { p.y -= 0.6; p.life--; });
  popups = popups.filter(p => p.life > 0);
}

function drawPopups() {
  popups.forEach(p => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.font = "bold 14px 'Gaegu', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2b3a4a';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.strokeText(p.text, p.x, p.y);
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();
  });
}

// ========================================================
// 이펙트 / 상태 표시
// ========================================================
function applyItemEffect(type) {
  if (type === 'meat') {
    speedTimer = SPEED_DURATION;
  } else if (type === 'snack') {
    invincibleTimer = INVINCIBLE_DURATION;
    usedInvincibleRun = true;
  } else if (type === 'water') {
    flyTimer = FLY_DURATION;
  } else if (type === 'shield') {
    shieldTimer = SHIELD_DURATION;
  } else if (type === 'heart') {
    heartTimer = HEART_DURATION;
  } else if (type === 'candy') {
    candyTimer = CANDY_DURATION;
  } else if (type === 'magnet') {
    magnetTimer = MAGNET_DURATION;
  } else if (type === 'balloon') {
    balloonTimer = BALLOON_DURATION;
  } else if (type === 'star') {
    starTimer = STAR_DURATION;
  } else if (type === 'iceCream') {
    iceCreamTimer = ICECREAM_DURATION;
  } else if (type === 'hourglass') {
    hourglassTimer = HOURGLASS_DURATION;
  } else if (type === 'mystery') {
    const pool = ITEM_WEIGHTED_POOL.filter((t) => t !== 'mystery');
    const picked = pool[Math.floor(Math.random() * pool.length)];
    applyItemEffect(picked);
  }
  playItem(type);
}

function collectItem(type) {
  itemsCollectedRun++;
  applyItemEffect(type);
}

function updateEffectsHud() {
  const badges = [];
  if (speedTimer > 0) badges.push(`🍖 x${SPEED_MULTIPLIER.toFixed(1)} ${Math.ceil(speedTimer / 60)}s`);
  if (invincibleTimer > 0) badges.push(`🍪 무적 ${Math.ceil(invincibleTimer / 60)}s`);
  if (flyTimer > 0) badges.push(`💧 비행 ${Math.ceil(flyTimer / 60)}s`);
  if (shieldTimer > 0) badges.push(`🛡️ 방패 ${Math.ceil(shieldTimer / 60)}s`);
  if (heartTimer > 0) badges.push(`❤️ 여벌목숨 ${Math.ceil(heartTimer / 60)}s`);
  if (candyTimer > 0) badges.push(`🍬 축소 ${Math.ceil(candyTimer / 60)}s`);
  if (magnetTimer > 0) badges.push(`🧲 자석 ${Math.ceil(magnetTimer / 60)}s`);
  if (balloonTimer > 0) badges.push(`🎈 자동비행 ${Math.ceil(balloonTimer / 60)}s`);
  if (starTimer > 0) badges.push(`⭐ 점수 x2 ${Math.ceil(starTimer / 60)}s`);
  if (iceCreamTimer > 0) badges.push(`🧊 파이프 정지 ${Math.ceil(iceCreamTimer / 60)}s`);
  if (hourglassTimer > 0) badges.push(`⏰ 슬로모션 ${Math.ceil(hourglassTimer / 60)}s`);
  effectsStatusEl.innerHTML = badges.map(b => `<span class="effect-badge">${b}</span>`).join('');
}

// ========================================================
// 충돌 판정
// ========================================================
function getEffectiveCharRadius() {
  return CHAR_RADIUS * (candyTimer > 0 ? CANDY_SHRINK : 1);
}

function checkGroundCeilingCollision() {
  const r = getEffectiveCharRadius();
  const groundY = LOGICAL_H - GROUND_HEIGHT;
  if (player.y + r * 0.75 >= groundY) return true;
  if (player.y - r * 0.75 <= 0) return true;
  return false;
}

function checkPipeCollision() {
  const r = getEffectiveCharRadius();
  for (const p of pipes) {
    const px1 = p.x;
    const px2 = p.x + PIPE_WIDTH;
    const cx1 = player.x - r * 0.7;
    const cx2 = player.x + r * 0.7;

    if (cx2 > px1 && cx1 < px2) {
      const cy1 = player.y - r * 0.7;
      const cy2 = player.y + r * 0.7;
      if (p.hasTop && cy1 < p.topHeight) return true;
      if (p.hasBottom && cy2 > p.bottomY) return true;
    }
  }
  return false;
}

function checkItemCollisions() {
  items.forEach(it => {
    if (it.collected) return;
    const dx = player.x - it.x;
    const dy = player.y - it.y;
    const dist = Math.hypot(dx, dy);
    if (dist < CHAR_RADIUS * 0.85 + ITEM_RADIUS * 0.7) {
      it.collected = true;
      collectItem(it.type);
    }
  });
}

function applyMagnetPull() {
  if (magnetTimer <= 0) return;
  items.forEach(it => {
    if (it.collected) return;
    const dx = player.x - it.x;
    const dy = player.y - it.y;
    const dist = Math.hypot(dx, dy);
    if (dist < MAGNET_RANGE) {
      it.x += dx * MAGNET_PULL;
      it.y += dy * MAGNET_PULL;
    }
  });
}

// ========================================================
// 화면 전환
// ========================================================
function showScreen(name) {
  screenTitle.classList.toggle('hidden', name !== 'title');
  screenSelect.classList.toggle('hidden', name !== 'select');
  screenHowto.classList.toggle('hidden', name !== 'howto');
  screenAchievements.classList.toggle('hidden', name !== 'achievements');
  screenLeaderboard.classList.toggle('hidden', name !== 'leaderboard');
  screenCredits.classList.toggle('hidden', name !== 'credits');
  screenPaused.classList.toggle('hidden', name !== 'paused');
  screenChangelog.classList.toggle('hidden', name !== 'changelog');
  screenOver.classList.toggle('hidden', name !== 'gameover');
  hud.classList.toggle('hidden', name !== 'playing');
}

function goToTitle() {
  state = 'title';
  stopBgm();
  updateTitleBestLabel();
  updateDailyCardUI();
  updateWinterButtonUI();
  startQuoteRotation();
  showScreen('title');
}

function goToSelect() {
  state = 'select';
  stopQuoteRotation();
  updateLeoLockUI();
  showScreen('select');
}

function goToHowto() {
  state = 'howto';
  stopQuoteRotation();
  showScreen('howto');
}

function goToAchievements() {
  state = 'achievements';
  stopQuoteRotation();
  renderAchievementsList();
  showScreen('achievements');
}

function goToLeaderboard() {
  state = 'leaderboard';
  stopQuoteRotation();
  renderLeaderboardList();
  showScreen('leaderboard');
}

function goToCredits() {
  state = 'credits';
  stopQuoteRotation();
  showScreen('credits');
}

function goToChangelog() {
  state = 'changelog';
  stopQuoteRotation();
  showScreen('changelog');
}

function goToCountdown() {
  state = 'countdown';
  stopQuoteRotation();
  player.y = LOGICAL_H / 2;
  player.vy = 0;
  player.rot = 0;
  score = 0;
  distanceM = 0;
  speed = BASE_SPEED * (CHARACTERS[selectedChar].speedMult || 1);
  speedTimer = 0;
  invincibleTimer = 0;
  flyTimer = 0;
  shieldTimer = 0;
  heartTimer = 0;
  candyTimer = 0;
  magnetTimer = 0;
  balloonTimer = 0;
  starTimer = 0;
  iceCreamTimer = 0;
  hourglassTimer = 0;
  comboCurrent = 0;
  runMaxCombo = 0;
  itemsCollectedRun = 0;
  usedInvincibleRun = false;
  dailyCompletedThisRun = false;
  particles = [];
  popups = [];
  shakeIntensity = 0;
  resetPipes();
  countdownIndex = 0;
  countdownFrameLeft = COUNTDOWN_SEQUENCE[0].frames;
  showScreen('playing');
  scoreEl.textContent = '0';
  distanceEl.textContent = '0 m';
  effectsStatusEl.innerHTML = '';
  ensureAudioCtx();
  resumeAudioCtx();
}

function startPlaying() {
  state = 'playing';
  player.vy = JUMP_VELOCITY * (CHARACTERS[selectedChar].jumpMult || 1);
  startBgm();
}

function beginDying() {
  state = 'dying';
  dyingTimer = DYING_FRAMES;
  shakeIntensity = 10;
  const charColor = (CHARACTERS[selectedChar] && CHARACTERS[selectedChar].body) || '#ffffff';
  spawnParticles(player.x, player.y, charColor);
  spawnParticles(player.x, player.y, '#5cc36a', 10);
  stopBgm();
  playCollision();
  vibrate(200);
}

function bounceOffShield() {
  player.vy = JUMP_VELOCITY * 0.7;
  invincibleTimer = Math.max(invincibleTimer, 15);
  spawnParticles(player.x, player.y, '#9fd6ff', 16);
  playShieldBreak();
  vibrate(60);
}

function reviveWithHeart() {
  player.y = Math.max(60, player.y - 24);
  player.vy = -6;
  invincibleTimer = Math.max(invincibleTimer, 90);
  spawnParticles(player.x, player.y, '#ff6b81', 20);
  playRevive();
  vibrate([40, 40, 40]);
}

function gameOver() {
  state = 'gameover';

  const distFloor = Math.floor(distanceM);
  const prevBestScore = bestScore;
  const prevBestDistance = bestDistance;

  if (score > bestScore) { bestScore = score; localStorage.setItem(STORAGE_KEY_SCORE, String(bestScore)); }
  if (distFloor > bestDistance) { bestDistance = distFloor; localStorage.setItem(STORAGE_KEY_DISTANCE, String(bestDistance)); }
  if (runMaxCombo > bestCombo) { bestCombo = runMaxCombo; localStorage.setItem(STORAGE_KEY_COMBO, String(bestCombo)); }

  const overall = loadStats();
  overall.gamesPlayed++;
  if (!overall.playedChars.includes(selectedChar)) overall.playedChars.push(selectedChar);

  const runStats = {
    score, distance: distFloor, itemsCollected: itemsCollectedRun,
    maxCombo: runMaxCombo, usedInvincible: usedInvincibleRun,
    char: selectedChar, dailyCompletedThisRun: false
  };

  const challenge = getDailyChallenge();
  if (!isDailyDoneToday() && challenge.check(runStats)) {
    markDailyDone();
    dailyCompletedThisRun = true;
    runStats.dailyCompletedThisRun = true;
  }

  const newlyUnlocked = [];
  ACHIEVEMENTS.forEach(a => {
    if (!overall.unlockedAchievements.includes(a.id) && a.check(runStats, overall)) {
      overall.unlockedAchievements.push(a.id);
      newlyUnlocked.push(a);
    }
  });
  saveStats(overall);

  const entryId = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const leaderboardEntry = {
    id: entryId, score, distance: distFloor, char: selectedChar,
    name: '', date: new Date().toLocaleDateString('ko-KR')
  };
  const updatedList = updateLeaderboard(leaderboardEntry);
  const rank = updatedList.findIndex((e) => e.id === entryId);

  finalScoreEl.textContent = score;
  bestScoreEl.textContent = bestScore;
  finalDistanceEl.textContent = distFloor;
  bestDistanceEl.textContent = bestDistance;
  finalComboEl.textContent = runMaxCombo;
  bestComboEl.textContent = bestCombo;

  const recordMsgs = [];
  if (score > 0 && score > prevBestScore) recordMsgs.push('🎉 점수 신기록!');
  if (distFloor > 0 && distFloor > prevBestDistance) recordMsgs.push('🎉 거리 신기록!');
  newRecordBadgeEl.innerHTML = recordMsgs.map(m => `<div class="record-badge">${m}</div>`).join('');

  newAchievementsEl.innerHTML = newlyUnlocked
    .map(a => `<div class="new-achv-badge">🏆 ${a.icon} ${a.title} 달성!</div>`).join('');
  dailyResultEl.innerHTML = dailyCompletedThisRun
    ? `<div class="daily-result-badge">📅 오늘의 미션 클리어! 🎉</div>` : '';

  if (rank > -1 && rank < 5) {
    currentNameEntryId = entryId;
    nameEntryInput.value = '';
    nameEntrySavedEl.classList.add('hidden');
    nameEntryEl.classList.remove('hidden');
  } else {
    currentNameEntryId = null;
    nameEntryEl.classList.add('hidden');
  }

  showScreen('gameover');
}

// ========================================================
// 메인 루프
// ========================================================
function update() {
  frame++;

  btnPause.classList.toggle('hidden', state !== 'playing');

  if (state !== 'paused') {
    clouds.forEach(cl => {
      cl.x -= cl.speed;
      if (cl.x < -60) cl.x = LOGICAL_W + 60;
    });
    if (winterEnabled) {
      snowflakes.forEach(f => {
        f.y += f.speed;
        f.x += Math.sin(frame * 0.02 + f.drift) * 0.4;
        if (f.y > LOGICAL_H) { f.y = -5; f.x = Math.random() * LOGICAL_W; }
      });
    }
  }

  if (state === 'countdown') {
    player.y = LOGICAL_H / 2 + Math.sin(frame * 0.08) * 8;

    countdownFrameLeft--;
    if (countdownFrameLeft <= 0) {
      countdownIndex++;
      if (countdownIndex >= COUNTDOWN_SEQUENCE.length) {
        startPlaying();
      } else {
        countdownFrameLeft = COUNTDOWN_SEQUENCE[countdownIndex].frames;
      }
    }
  } else if (state === 'playing') {
    const stats = CHARACTERS[selectedChar];

    if (speedTimer > 0) speedTimer--;
    if (invincibleTimer > 0) invincibleTimer--;
    if (flyTimer > 0) flyTimer--;
    if (shieldTimer > 0) shieldTimer--;
    if (heartTimer > 0) heartTimer--;
    if (candyTimer > 0) candyTimer--;
    if (magnetTimer > 0) magnetTimer--;
    if (balloonTimer > 0) balloonTimer--;
    if (starTimer > 0) starTimer--;
    if (iceCreamTimer > 0) iceCreamTimer--;
    if (hourglassTimer > 0) hourglassTimer--;

    const timeScale = hourglassTimer > 0 ? HOURGLASS_SCALE : 1;

    const currentSpeed = speed * (speedTimer > 0 ? SPEED_MULTIPLIER : 1) * timeScale;
    distanceM += currentSpeed / PIXELS_PER_METER;
    groundOffset -= currentSpeed;

    if (balloonTimer > 0) {
      const nextPipe = pipes.find(p => p.x + PIPE_WIDTH > player.x);
      const targetY = nextPipe ? (nextPipe.topHeight + nextPipe.gap / 2) : player.y;
      player.y += (targetY - player.y) * 0.06;
      player.vy = 0;
      player.rot = Math.sin(frame * 0.1) * 0.15;
    } else if (flyTimer > 0) {
      if (isPointerDown) {
        player.vy += FLY_LIFT * timeScale;
        if (player.vy < FLY_MIN_VY) player.vy = FLY_MIN_VY;
      } else {
        player.vy += FLY_GRAVITY * timeScale;
        if (player.vy > FLY_MAX_VY) player.vy = FLY_MAX_VY;
      }
      player.rot = Math.max(-0.35, Math.min(0.35, player.vy / 8));
      player.y += player.vy;
    } else {
      player.vy += GRAVITY * stats.gravityMult * timeScale;
      if (player.vy > MAX_FALL_SPEED) player.vy = MAX_FALL_SPEED;
      player.rot = Math.max(-0.5, Math.min(1.1, player.vy / 12));
      player.y += player.vy;
    }

    pipes.forEach(p => {
      p.x -= currentSpeed;
      if (p.moving && iceCreamTimer <= 0) {
        p.topHeight = p.baseTop + Math.sin(frame * p.oscSpeed + p.oscPhase) * p.oscAmp;
        const minTop = 30;
        const maxTop = LOGICAL_H - GROUND_HEIGHT - 30 - p.gap;
        if (p.topHeight < minTop) p.topHeight = minTop;
        if (p.topHeight > maxTop) p.topHeight = maxTop;
        p.bottomY = p.topHeight + p.gap;
      }
    });
    items.forEach(it => { it.x -= currentSpeed; });
    applyMagnetPull();

    if (pipes.length && pipes[0].x + PIPE_WIDTH < -20) {
      pipes.shift();
      const lastX = pipes[pipes.length - 1].x;
      spawnPipe(lastX + nextPipeSpacing());
    }
    items = items.filter(it => it.x > -40 && !it.collected);

    pipes.forEach(p => {
      if (!p.passed && p.x + PIPE_WIDTH < player.x - CHAR_RADIUS) {
        p.passed = true;
        score += starTimer > 0 ? 2 : 1;
        scoreEl.textContent = score;
        speed = Math.min(BASE_SPEED * (stats.speedMult || 1) + score * 0.06, 5.6);
        playScorePoint();

        if (invincibleTimer > 0) {
          comboCurrent++;
        } else {
          comboCurrent = 0;
        }
        runMaxCombo = Math.max(runMaxCombo, comboCurrent);
      }
    });

    checkItemCollisions();
    updateEffectsHud();
    distanceEl.textContent = `${Math.floor(distanceM)} m`;
    updatePopups();

    const hitGroundOrCeiling = checkGroundCeilingCollision();
    const hitPipe = invincibleTimer > 0 ? false : checkPipeCollision();

    if (hitGroundOrCeiling || hitPipe) {
      if (heartTimer > 0) {
        heartTimer = 0;
        reviveWithHeart();
      } else if (hitPipe && !hitGroundOrCeiling && shieldTimer > 0) {
        shieldTimer = 0;
        bounceOffShield();
      } else {
        beginDying();
      }
    }
  } else if (state === 'dying') {
    updatePopups();
    player.vy += GRAVITY * 0.25;
    player.y += player.vy * 0.35;
    updateParticles();
    if (shakeIntensity > 0) shakeIntensity *= 0.88;

    dyingTimer--;
    if (dyingTimer <= 0) {
      gameOver();
    }
  }
}

function drawCountdownText() {
  const step = COUNTDOWN_SEQUENCE[countdownIndex];
  if (!step) return;
  const progress = 1 - countdownFrameLeft / step.frames;
  const pop = 1 + 0.35 * Math.max(0, 1 - progress * 2.2);
  const alpha = progress < 0.85 ? 1 : Math.max(0, 1 - (progress - 0.85) / 0.15);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(LOGICAL_W / 2, LOGICAL_H / 2 - 60);
  ctx.scale(pop, pop);
  ctx.font = `900 ${step.size}px 'Jua', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(43,58,74,0.9)';
  ctx.strokeText(step.text, 0, 0);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(step.text, 0, 0);
  ctx.restore();
}

function drawEffectAura() {
  if (invincibleTimer > 0) {
    ctx.save();
    ctx.translate(player.x, player.y);
    const pulse = 1 + Math.sin(frame * 0.3) * 0.08;
    ctx.beginPath();
    ctx.arc(0, 0, (CHAR_RADIUS + 8) * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,210,90,0.85)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }
  if (shieldTimer > 0) {
    ctx.save();
    ctx.translate(player.x, player.y);
    const pulse = 1 + Math.sin(frame * 0.25) * 0.06;
    ctx.beginPath();
    ctx.arc(0, 0, (CHAR_RADIUS + 6) * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(130,200,255,0.9)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }
  if (speedTimer > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const off = 10 + i * 9 + (frame * 2 % 9);
      ctx.beginPath();
      ctx.moveTo(player.x - CHAR_RADIUS - off, player.y - 6 + i * 6);
      ctx.lineTo(player.x - CHAR_RADIUS - off - 14, player.y - 6 + i * 6);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (flyTimer > 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(160,225,255,0.55)';
    for (let i = 0; i < 3; i++) {
      const bx = player.x - CHAR_RADIUS - 6 - i * 12;
      const by = player.y + 10 + Math.sin(frame * 0.2 + i) * 4;
      ctx.beginPath();
      ctx.arc(bx, by, 5 - i, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  if (starTimer > 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(255,224,102,0.85)';
    for (let i = 0; i < 4; i++) {
      const ang = frame * 0.12 + i * (Math.PI / 2);
      const sx = player.x + Math.cos(ang) * (CHAR_RADIUS + 12);
      const sy = player.y + Math.sin(ang) * (CHAR_RADIUS + 12);
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  if (magnetTimer > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(197,139,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x, player.y, MAGNET_RANGE * (0.85 + Math.sin(frame * 0.15) * 0.05), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawEffectIcons() {
  const icons = [];
  if (heartTimer > 0) icons.push('❤️');
  if (candyTimer > 0) icons.push('🍬');
  if (balloonTimer > 0) icons.push('🎈');
  if (iceCreamTimer > 0) icons.push('🧊');
  if (hourglassTimer > 0) icons.push('⏰');
  if (!icons.length) return;

  ctx.save();
  ctx.font = "16px 'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  icons.forEach((ic, i) => {
    const bx = player.x + (i - (icons.length - 1) / 2) * 20;
    const by = player.y - CHAR_RADIUS - 22 + Math.sin(frame * 0.15 + i) * 3;
    ctx.fillText(ic, bx, by);
  });
  ctx.restore();
}

function drawGameOverOverlay() {
  ctx.save();
  ctx.fillStyle = 'rgba(130,130,132,0.62)';
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
  ctx.restore();
}

function render() {
  ctx.save();

  if (shakeIntensity > 0.3) {
    const sx = (Math.random() - 0.5) * shakeIntensity * 2;
    const sy = (Math.random() - 0.5) * shakeIntensity * 2;
    ctx.translate(sx, sy);
  }

  drawBackground();

  const showWorld = state === 'playing' || state === 'countdown' || state === 'gameover' || state === 'dying' || state === 'paused';

  if (showWorld) {
    pipes.forEach(drawPipe);
    drawItems();
  }

  drawGround();

  if (showWorld) {
    drawEffectAura();
    const bob = (state === 'countdown') ? 0 : Math.sin(frame * 0.25) * 3;
    const drawRadius = state === 'playing' ? getEffectiveCharRadius() : CHAR_RADIUS;
    drawCharacter(ctx, selectedChar, player.x, player.y, drawRadius, player.rot, bob);
    drawEffectIcons();
    drawParticles();
    drawPopups();
  }

  if (state === 'countdown') {
    drawCountdownText();
  }

  if (state === 'gameover') {
    drawGameOverOverlay();
  }

  ctx.restore();
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ========================================================
// 업적 / 랭킹 렌더링
// ========================================================
function renderAchievementsList() {
  const overall = loadStats();
  achievementsListEl.innerHTML = ACHIEVEMENTS.map(a => {
    const unlocked = overall.unlockedAchievements.includes(a.id);
    return `<div class="achv-row ${unlocked ? '' : 'locked'}">
      <div class="achv-icon">${unlocked ? a.icon : '❔'}</div>
      <div class="achv-body">
        <div class="achv-title">${unlocked ? a.title : '???'}</div>
        <div class="achv-desc">${unlocked ? a.desc : '아직 잠겨있어요'}</div>
      </div>
    </div>`;
  }).join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderLeaderboardList() {
  const list = loadLeaderboard();
  if (!list.length) {
    leaderboardListEl.innerHTML = `<div class="empty-note">아직 기록이 없어요! 첫 판을 도전해보세요 🐣</div>`;
    return;
  }
  const medals = ['🥇', '🥈', '🥉', '4', '5'];
  leaderboardListEl.innerHTML = list.map((e, i) => {
    const charName = (CHARACTERS[e.char] && CHARACTERS[e.char].name) || e.char;
    const displayName = e.name && e.name.trim()
      ? `${escapeHtml(e.name.trim())} (${charName})`
      : charName;
    return `<div class="lb-row">
      <div class="lb-rank">${medals[i] || (i + 1)}</div>
      <div class="lb-body">
        <div class="lb-name">${displayName} · 점수 ${e.score}</div>
        <div class="lb-meta">${e.distance}m · ${e.date}</div>
      </div>
    </div>`;
  }).join('');
}

// ========================================================
// 결과 이미지 저장
// ========================================================
function exportResultImage() {
  const off = document.createElement('canvas');
  off.width = LOGICAL_W;
  off.height = LOGICAL_H;
  const octx = off.getContext('2d');
  octx.drawImage(canvas, 0, 0);

  octx.fillStyle = 'rgba(0,0,0,0.4)';
  octx.fillRect(0, LOGICAL_H - 130, LOGICAL_W, 130);

  octx.textAlign = 'center';
  octx.fillStyle = '#ffffff';
  octx.font = "bold 24px 'Jua', sans-serif";
  octx.fillText('Tappy Friends', LOGICAL_W / 2, LOGICAL_H - 95);

  octx.font = "18px 'Gaegu', sans-serif";
  octx.fillText(`점수 ${score} · ${Math.floor(distanceM)}m`, LOGICAL_W / 2, LOGICAL_H - 65);

  octx.font = "13px 'Gaegu', sans-serif";
  octx.fillText(new Date().toLocaleDateString('ko-KR'), LOGICAL_W / 2, LOGICAL_H - 40);

  const link = document.createElement('a');
  link.download = `tappy-friends-score${score}.png`;
  link.href = off.toDataURL('image/png');
  link.click();
}

// ========================================================
// 이벤트 바인딩
// ========================================================
btnGotoSelect.addEventListener('click', goToSelect);
btnGotoHowto.addEventListener('click', goToHowto);
btnGotoAchievements.addEventListener('click', goToAchievements);
btnGotoLeaderboard.addEventListener('click', goToLeaderboard);
btnGotoCredits.addEventListener('click', goToCredits);
btnBackTitle1.addEventListener('click', goToTitle);
btnBackTitle2.addEventListener('click', () => {
  goToTitle();
  btnBackTitle2.textContent = '뒤로';
});
btnBackTitle3.addEventListener('click', goToTitle);
btnBackTitle4.addEventListener('click', goToTitle);
btnBackTitle5.addEventListener('click', goToTitle);
btnBackTitle6.addEventListener('click', goToTitle);
btnVersion.addEventListener('click', goToChangelog);

document.querySelectorAll('.char-card').forEach(card => {
  card.addEventListener('click', () => {
    if (card.classList.contains('locked')) return;
    document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedChar = card.dataset.char;
    btnStart.disabled = false;
    btnStart.textContent = `${CHARACTERS[selectedChar].name}(으)로 시작하기`;
  });
});

btnStart.addEventListener('click', () => {
  if (!selectedChar) return;
  goToCountdown();
});

btnRetry.addEventListener('click', () => {
  goToCountdown();
});

btnChangeChar.addEventListener('click', () => {
  goToSelect();
});

btnSaveImage.addEventListener('click', exportResultImage);

function saveEnteredName() {
  if (!currentNameEntryId) return;
  const name = nameEntryInput.value.trim().slice(0, 8);
  setLeaderboardName(currentNameEntryId, name);
  nameEntrySavedEl.classList.remove('hidden');
}

btnNameSave.addEventListener('click', saveEnteredName);
nameEntryInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    saveEnteredName();
  }
});

btnWinterToggle.addEventListener('click', () => {
  winterEnabled = !winterEnabled;
  localStorage.setItem(STORAGE_KEY_WINTER, winterEnabled ? '1' : '0');
  updateWinterButtonUI();
});

btnMute.addEventListener('click', () => {
  muted = !muted;
  localStorage.setItem(STORAGE_KEY_MUTED, muted ? '1' : '0');
  updateMuteButton();
  if (muted) stopBgm();
  else if (state === 'playing') startBgm();
});

btnPause.addEventListener('click', () => {
  if (state !== 'playing') return;
  state = 'paused';
  stopBgm();
  showScreen('paused');
});

btnResume.addEventListener('click', () => {
  state = 'playing';
  showScreen('playing');
  if (!muted) startBgm();
});

btnQuitTitle.addEventListener('click', () => {
  stopBgm();
  goToTitle();
});

function onPressEdge() {
  if (state === 'playing' && flyTimer <= 0) {
    player.vy = JUMP_VELOCITY * (CHARACTERS[selectedChar].jumpMult || 1);
    playJump();
    spawnJumpPopup();
  } else if (state === 'playing') {
    playJump();
  }
}

canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  ensureAudioCtx();
  resumeAudioCtx();
  isPointerDown = true;
  onPressEdge();
});
['pointerup', 'pointercancel', 'pointerleave'].forEach(evt => {
  canvas.addEventListener(evt, () => { isPointerDown = false; });
});

document.addEventListener('keydown', (e) => {
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    ensureAudioCtx();
    resumeAudioCtx();
    if (!isPointerDown) {
      isPointerDown = true;
      onPressEdge();
    }
  }
});
document.addEventListener('keyup', (e) => {
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    isPointerDown = false;
  }
});

// ========================================================
// PWA 서비스워커 등록
// ========================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* 오프라인 캐싱 실패해도 게임엔 지장 없음 */ });
  });
}

// ========================================================
// 초기 화면 (첫 실행이면 플레이 방법을 먼저 보여줌)
// ========================================================
if (!localStorage.getItem(STORAGE_KEY_SEEN_HOWTO)) {
  localStorage.setItem(STORAGE_KEY_SEEN_HOWTO, '1');
  goToHowto();
  btnBackTitle2.textContent = '확인했어요, 시작할게요!';
} else {
  goToTitle();
}
