// ========================================================
// 탭탭 프렌즈 (Tap Tap Friends)
// 탭/클릭으로 점프하며 파이프를 피하는 캐주얼 게임
// ========================================================

// ---------- 기본 설정 ----------
const LOGICAL_W = 360;
const LOGICAL_H = 640;

const GRAVITY        = 0.45;
const JUMP_VELOCITY  = -7.6;
const MAX_FALL_SPEED = 9;

const PIPE_WIDTH   = 54;
const START_PIPE_GAP     = 220;  // 시작할 때 파이프 틈 (넉넉하게)
const MIN_PIPE_GAP       = 148;  // 최소 틈 (이 밑으로는 안 좁아짐)
const START_PIPE_SPACING = 260;  // 시작할 때 파이프-파이프 간격
const MIN_PIPE_SPACING   = 180;  // 최소 간격
const DIFFICULTY_RAMP_SCORE = 22; // 이 점수까지 서서히 어려워지고 이후 최대 난이도 유지
const BASE_SPEED   = 2.6;

const GROUND_HEIGHT = 90;
const CHAR_RADIUS   = 20;      // 충돌/그리기 기준 반지름
const PIXELS_PER_METER = 14;   // 이동 거리 환산 비율

// 아이템 관련
const ITEM_RADIUS = 15;
const ITEM_SPAWN_CHANCE = 0.42;
const SPEED_DURATION       = 260; // 프레임 (~4.3초)
const INVINCIBLE_DURATION  = 300; // ~5초
const FLY_DURATION         = 360; // ~6초
const SPEED_MULTIPLIER = 1.65;
const FLY_GRAVITY = 0.18;
const FLY_LIFT    = -0.5;
const FLY_MIN_VY  = -4.2;
const FLY_MAX_VY  = 4.6;

const ITEM_TYPES = {
  meat:  { emoji: '🍖', label: '고기',  color: '#ffb08a' },
  snack: { emoji: '🍪', label: '간식',  color: '#ffd873' },
  water: { emoji: '💧', label: '물',    color: '#7fd1ff' }
};

const STORAGE_KEY_SCORE    = 'tapTapFriends_bestScore';
const STORAGE_KEY_DISTANCE = 'tapTapFriends_bestDistance';

// 시작 카운트다운 시퀀스
const COUNTDOWN_SEQUENCE = [
  { text: 'GAME START', frames: 55, size: 34 },
  { text: '3', frames: 42, size: 90 },
  { text: '2', frames: 42, size: 90 },
  { text: '1', frames: 42, size: 90 }
];

// ---------- 캐릭터 정의 ----------
const CHARACTERS = {
  hanmin: {
    name: '한민', desc: '수달',
    body: '#b9835a', bodyDark: '#8a5c39', belly: '#f2e3c4',
    accent: '#6f4429'
  },
  henry: {
    name: '헨리', desc: '치와와',
    body: '#e8c39e', bodyDark: '#caa06a', belly: '#fbf0dd',
    accent: '#7a5636'
  },
  charles: {
    name: '찰스', desc: '검갈색 햄스터',
    body: '#6b4a34', bodyDark: '#4a3122', belly: '#a97e5c',
    accent: '#2c1c12'
  },
  mary: {
    name: '메리', desc: '흰색 햄스터',
    body: '#fdfbf7', bodyDark: '#e3ded3', belly: '#ffd3dd',
    accent: '#c9c2b4'
  }
};

// ---------- DOM 참조 ----------
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const screenTitle   = document.getElementById('screen-title');
const screenSelect  = document.getElementById('screen-select');
const screenHowto   = document.getElementById('screen-howto');
const screenCredits = document.getElementById('screen-credits');
const screenOver    = document.getElementById('screen-over');
const hud           = document.getElementById('hud');

const btnGotoSelect  = document.getElementById('btn-goto-select');
const btnGotoHowto   = document.getElementById('btn-goto-howto');
const btnGotoCredits = document.getElementById('btn-goto-credits');
const btnBackTitle1  = document.getElementById('btn-back-title-1');
const btnBackTitle2  = document.getElementById('btn-back-title-2');
const btnBackTitle3  = document.getElementById('btn-back-title-3');
const btnStart       = document.getElementById('btn-start');
const btnRetry       = document.getElementById('btn-retry');
const btnChangeChar  = document.getElementById('btn-change-char');

const scoreEl         = document.getElementById('score');
const distanceEl      = document.getElementById('distance');
const effectsStatusEl = document.getElementById('effects-status');

const finalScoreEl    = document.getElementById('final-score');
const bestScoreEl     = document.getElementById('best-score');
const finalDistanceEl = document.getElementById('final-distance');
const bestDistanceEl  = document.getElementById('best-distance');
const titleBestLabel  = document.getElementById('title-best-label');

// 캔버스 해상도 고정 (CSS로 시각적 크기만 스케일)
canvas.width = LOGICAL_W;
canvas.height = LOGICAL_H;

// ---------- 게임 상태 ----------
let state = 'title'; // 'title' | 'select' | 'howto' | 'credits' | 'countdown' | 'playing' | 'gameover'
let selectedChar = null;

let player = { x: 96, y: LOGICAL_H / 2, vy: 0, rot: 0 };
let pipes = [];
let items = [];
let score = 0;
let distanceM = 0;
let bestScore = Number(localStorage.getItem(STORAGE_KEY_SCORE) || 0);
let bestDistance = Number(localStorage.getItem(STORAGE_KEY_DISTANCE) || 0);
let frame = 0;
let speed = BASE_SPEED;
let groundOffset = 0;

let isPointerDown = false;

// 효과 타이머 (프레임 단위 남은 시간)
let speedTimer = 0;
let invincibleTimer = 0;
let flyTimer = 0;

// 카운트다운 진행 상태
let countdownIndex = 0;
let countdownFrameLeft = 0;

updateTitleBestLabel();

function updateTitleBestLabel() {
  if (bestScore > 0 || bestDistance > 0) {
    titleBestLabel.textContent = `최고 점수 ${bestScore} · 최고 거리 ${bestDistance}m`;
  } else {
    titleBestLabel.textContent = '';
  }
}

// ========================================================
// 캐릭터 드로잉 (전부 도형으로 직접 그림)
// ========================================================
function drawCharacter(context, key, cx, cy, size, rot, bob) {
  const c = CHARACTERS[key];
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
// 배경 (하늘/구름/땅) 그리기
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

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_H);
  if (invincibleTimer > 0) {
    grad.addColorStop(0, '#ffe89a');
    grad.addColorStop(1, '#fff6db');
  } else {
    grad.addColorStop(0, '#8fd3f4');
    grad.addColorStop(1, '#dff5ea');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

  clouds.forEach(cl => drawCloud(cl.x, cl.y, cl.scale));

  ctx.fillStyle = 'rgba(120,190,150,0.35)';
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
  ctx.fillStyle = '#d8c47a';
  ctx.fillRect(0, gy, LOGICAL_W, GROUND_HEIGHT);
  ctx.fillStyle = '#8bc76a';
  ctx.fillRect(0, gy, LOGICAL_W, 14);

  ctx.fillStyle = '#79b85c';
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
// 난이도 곡선: 점수가 오를수록 파이프 틈/간격이 점점 좁아짐
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
function spawnPipe(xStart) {
  const gap = currentPipeGap();
  const margin = 60;
  const minTop = margin;
  const maxTop = LOGICAL_H - GROUND_HEIGHT - margin - gap;
  const topHeight = minTop + Math.random() * Math.max(20, (maxTop - minTop));
  const pipe = {
    x: xStart,
    topHeight,
    bottomY: topHeight + gap,
    passed: false
  };
  pipes.push(pipe);

  if (Math.random() < ITEM_SPAWN_CHANCE) {
    const types = Object.keys(ITEM_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    items.push({
      x: xStart + PIPE_WIDTH / 2,
      y: topHeight + gap / 2,
      type,
      collected: false,
      bobPhase: Math.random() * Math.PI * 2
    });
  }
}

function resetPipes() {
  pipes = [];
  items = [];
  let x = LOGICAL_W + 80;
  for (let i = 0; i < 4; i++) {
    spawnPipe(x);
    x += currentPipeSpacing();
  }
}

function drawPipe(p) {
  const groundY = LOGICAL_H - GROUND_HEIGHT;
  drawPipeSegment(p.x, 0, PIPE_WIDTH, p.topHeight, true);
  drawPipeSegment(p.x, p.bottomY, PIPE_WIDTH, groundY - p.bottomY, false);
}

function drawPipeSegment(x, y, w, h, isTop) {
  const capH = 22;
  ctx.fillStyle = '#4fb85f';
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = '#3a9b4a';
  ctx.fillRect(x, y, 6, h);

  ctx.fillStyle = '#2f8f42';
  if (isTop) {
    ctx.fillRect(x - 4, y + h - capH, w + 8, capH);
    ctx.fillStyle = '#3ea850';
    ctx.fillRect(x - 4, y + h - capH, w + 8, 6);
  } else {
    ctx.fillRect(x - 4, y, w + 8, capH);
    ctx.fillStyle = '#3ea850';
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
// 이펙트 / 상태 표시
// ========================================================
function collectItem(type) {
  if (type === 'meat') {
    speedTimer = SPEED_DURATION;
  } else if (type === 'snack') {
    invincibleTimer = INVINCIBLE_DURATION;
  } else if (type === 'water') {
    flyTimer = FLY_DURATION;
  }
}

function updateEffectsHud() {
  const badges = [];
  if (speedTimer > 0) badges.push(`🍖 x${SPEED_MULTIPLIER.toFixed(1)} ${Math.ceil(speedTimer / 60)}s`);
  if (invincibleTimer > 0) badges.push(`🍪 무적 ${Math.ceil(invincibleTimer / 60)}s`);
  if (flyTimer > 0) badges.push(`💧 비행 ${Math.ceil(flyTimer / 60)}s`);
  effectsStatusEl.innerHTML = badges.map(b => `<span class="effect-badge">${b}</span>`).join('');
}

// ========================================================
// 충돌 판정
// ========================================================
function checkGroundCeilingCollision() {
  const groundY = LOGICAL_H - GROUND_HEIGHT;
  if (player.y + CHAR_RADIUS * 0.75 >= groundY) return true;
  if (player.y - CHAR_RADIUS * 0.75 <= 0) return true;
  return false;
}

function checkPipeCollision() {
  for (const p of pipes) {
    const px1 = p.x;
    const px2 = p.x + PIPE_WIDTH;
    const cx1 = player.x - CHAR_RADIUS * 0.7;
    const cx2 = player.x + CHAR_RADIUS * 0.7;

    if (cx2 > px1 && cx1 < px2) {
      const cy1 = player.y - CHAR_RADIUS * 0.7;
      const cy2 = player.y + CHAR_RADIUS * 0.7;
      if (cy1 < p.topHeight || cy2 > p.bottomY) {
        return true;
      }
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

// ========================================================
// 화면 전환
// ========================================================
function showScreen(name) {
  screenTitle.classList.toggle('hidden', name !== 'title');
  screenSelect.classList.toggle('hidden', name !== 'select');
  screenHowto.classList.toggle('hidden', name !== 'howto');
  screenCredits.classList.toggle('hidden', name !== 'credits');
  screenOver.classList.toggle('hidden', name !== 'gameover');
  hud.classList.toggle('hidden', name !== 'playing');
}

function goToTitle() {
  state = 'title';
  updateTitleBestLabel();
  showScreen('title');
}

function goToSelect() {
  state = 'select';
  showScreen('select');
}

function goToHowto() {
  state = 'howto';
  showScreen('howto');
}

function goToCredits() {
  state = 'credits';
  showScreen('credits');
}

function goToCountdown() {
  state = 'countdown';
  player.y = LOGICAL_H / 2;
  player.vy = 0;
  player.rot = 0;
  score = 0;
  distanceM = 0;
  speed = BASE_SPEED;
  speedTimer = 0;
  invincibleTimer = 0;
  flyTimer = 0;
  resetPipes();
  countdownIndex = 0;
  countdownFrameLeft = COUNTDOWN_SEQUENCE[0].frames;
  showScreen('playing'); // 카운트다운 동안에도 HUD/캔버스 노출 (카운트다운 문구는 캔버스에 직접 그림)
  scoreEl.textContent = '0';
  distanceEl.textContent = '0 m';
  effectsStatusEl.innerHTML = '';
}

function startPlaying() {
  state = 'playing';
  player.vy = JUMP_VELOCITY;
}

function gameOver() {
  state = 'gameover';
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem(STORAGE_KEY_SCORE, String(bestScore));
  }
  const distFloor = Math.floor(distanceM);
  if (distFloor > bestDistance) {
    bestDistance = distFloor;
    localStorage.setItem(STORAGE_KEY_DISTANCE, String(bestDistance));
  }
  finalScoreEl.textContent = score;
  bestScoreEl.textContent = bestScore;
  finalDistanceEl.textContent = distFloor;
  bestDistanceEl.textContent = bestDistance;
  showScreen('gameover');
}

// ========================================================
// 메인 루프
// ========================================================
function update() {
  frame++;

  clouds.forEach(cl => {
    cl.x -= cl.speed;
    if (cl.x < -60) cl.x = LOGICAL_W + 60;
  });

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
    if (speedTimer > 0) speedTimer--;
    if (invincibleTimer > 0) invincibleTimer--;
    if (flyTimer > 0) flyTimer--;

    const currentSpeed = speed * (speedTimer > 0 ? SPEED_MULTIPLIER : 1);
    distanceM += currentSpeed / PIXELS_PER_METER;
    groundOffset -= currentSpeed;

    if (flyTimer > 0) {
      if (isPointerDown) {
        player.vy += FLY_LIFT;
        if (player.vy < FLY_MIN_VY) player.vy = FLY_MIN_VY;
      } else {
        player.vy += FLY_GRAVITY;
        if (player.vy > FLY_MAX_VY) player.vy = FLY_MAX_VY;
      }
      player.rot = Math.max(-0.35, Math.min(0.35, player.vy / 8));
    } else {
      player.vy += GRAVITY;
      if (player.vy > MAX_FALL_SPEED) player.vy = MAX_FALL_SPEED;
      player.rot = Math.max(-0.5, Math.min(1.1, player.vy / 12));
    }
    player.y += player.vy;

    pipes.forEach(p => { p.x -= currentSpeed; });
    items.forEach(it => { it.x -= currentSpeed; });

    if (pipes.length && pipes[0].x + PIPE_WIDTH < -20) {
      pipes.shift();
      const lastX = pipes[pipes.length - 1].x;
      spawnPipe(lastX + currentPipeSpacing());
    }
    items = items.filter(it => it.x > -40 && !it.collected);

    pipes.forEach(p => {
      if (!p.passed && p.x + PIPE_WIDTH < player.x - CHAR_RADIUS) {
        p.passed = true;
        score++;
        scoreEl.textContent = score;
        speed = Math.min(BASE_SPEED + score * 0.06, 5.2);
      }
    });

    checkItemCollisions();
    updateEffectsHud();
    distanceEl.textContent = `${Math.floor(distanceM)} m`;

    const hitGroundOrCeiling = checkGroundCeilingCollision();
    const hitPipe = invincibleTimer > 0 ? false : checkPipeCollision();

    if (hitGroundOrCeiling || hitPipe) {
      gameOver();
    }
  }
}

function drawCountdownText() {
  const step = COUNTDOWN_SEQUENCE[countdownIndex];
  if (!step) return;
  const progress = 1 - countdownFrameLeft / step.frames; // 0 -> 1
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
}

function drawGameOverOverlay() {
  ctx.save();
  ctx.fillStyle = 'rgba(130,130,132,0.62)';
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
  ctx.restore();
}

function render() {
  drawBackground();

  if (state === 'playing' || state === 'countdown' || state === 'gameover') {
    pipes.forEach(drawPipe);
    drawItems();
  }

  drawGround();

  if (state === 'playing' || state === 'countdown' || state === 'gameover') {
    drawEffectAura();
    const bob = state === 'countdown' ? 0 : Math.sin(frame * 0.25) * 3;
    drawCharacter(ctx, selectedChar, player.x, player.y, CHAR_RADIUS, player.rot, bob);
  }

  if (state === 'countdown') {
    drawCountdownText();
  }

  if (state === 'gameover') {
    drawGameOverOverlay();
  }
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ========================================================
// 이벤트 바인딩
// ========================================================
btnGotoSelect.addEventListener('click', goToSelect);
btnGotoHowto.addEventListener('click', goToHowto);
btnGotoCredits.addEventListener('click', goToCredits);
btnBackTitle1.addEventListener('click', goToTitle);
btnBackTitle2.addEventListener('click', goToTitle);
btnBackTitle3.addEventListener('click', goToTitle);

document.querySelectorAll('.char-card').forEach(card => {
  card.addEventListener('click', () => {
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

function onPressEdge() {
  if (state === 'playing' && flyTimer <= 0) {
    player.vy = JUMP_VELOCITY;
  }
}

canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  isPointerDown = true;
  onPressEdge();
});
['pointerup', 'pointercancel', 'pointerleave'].forEach(evt => {
  canvas.addEventListener(evt, () => { isPointerDown = false; });
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    if (!isPointerDown) {
      isPointerDown = true;
      onPressEdge();
    }
  }
});
document.addEventListener('keyup', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    isPointerDown = false;
  }
});

// 초기 화면
goToTitle();
