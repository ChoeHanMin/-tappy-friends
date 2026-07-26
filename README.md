# Tappy Friends

화면을 탭(또는 마우스 클릭)해서 점프하며 초록색 파이프 사이를 지나가는 캐주얼 게임입니다.
Tappy Plane / Flappy Bird 스타일이며, 순수 HTML + CSS + JavaScript(Canvas)로 만들어져 있어
별도의 빌드 과정 없이 바로 GitHub Pages에 올릴 수 있습니다. 사운드도 전부 Web Audio API로
직접 합성해서 만들었기 때문에 별도 오디오 파일이 없습니다.

업데이트 내역은 [CHANGELOG.md](./CHANGELOG.md)를 확인하세요.

## 폴더 구조

```
tappy-friends/
├── index.html      # 게임 화면 구조
├── style.css       # 디자인 (배경, 카드, 버튼 등)
├── game.js         # 게임 로직 전체 (물리, 렌더링, 사운드, 저장 데이터 등)
├── manifest.json    # PWA(앱처럼 설치) 설정
├── sw.js            # 오프라인 캐싱용 서비스워커
├── icon-192.png      # 앱 아이콘 (192x192)
├── icon-512.png      # 앱 아이콘 (512x512)
├── apple-touch-icon.png # iOS 홈 화면 아이콘 (180x180)
├── og-image.png      # 링크 공유 시 뜨는 미리보기 이미지 (1200x630)
├── CHANGELOG.md
└── README.md
```

## 화면 구성

1. **타이틀 화면** — `게임 시작` / `플레이 방법` / `업적` / `랭킹` / `제작자` 버튼과
   오늘의 미션 카드가 있습니다. 최고 거리 400m를 넘기면 겨울 테마 버튼도 나타납니다.
2. **캐릭터 선택** — 한민(수달) · 헨리(치와와) · 찰스(햄스터) · 메리(햄스터) 4명과,
   조건을 채우면 열리는 숨겨진 캐릭터 루이까지 총 5명 중 고를 수 있습니다.
3. **카운트다운** — `GAME START` 문구 후 `3, 2, 1` 카운트다운이 나오고 자동으로 시작됩니다.
4. **플레이 화면** — 상단에 점수·이동 거리(m)가 표시되고, 오른쪽 위에 음소거/일시정지 버튼이 있습니다.
5. **게임 오버** — 부딪히는 순간 화면이 흔들리며 슬로모션 연출이 나온 뒤, 화면이 회색으로
   바뀌며 `THE END`와 함께 점수/거리/무적 콤보와 최고 기록, 새로 딴 업적이 표시됩니다.

## 게임 규칙

- 화면을 탭/클릭(또는 스페이스바)하면 캐릭터가 위로 점프합니다. 아무 입력이 없으면 중력에 의해
  계속 아래로 떨어집니다.
- 초록색 파이프 사이 틈으로 지나가면 점수가 1점씩 올라가고, 이동한 거리(m)도 함께 누적됩니다.
- 점수가 오를수록 파이프 틈/간격이 점점 좁아지고, 일정 점수 이후에는 위아래로 움직이는
  파이프도 등장합니다.
- 파이프나 바닥/천장에 부딪히면 화면이 흔들리고 잠깐 슬로모션이 된 뒤 회색 `THE END` 화면으로
  넘어가며, 최고 점수/최고 거리/최고 무적 콤보가 자동으로 저장됩니다.

### 아이템

파이프 사이 틈에 확률적으로 아이템이 등장합니다. 캐릭터가 스치면 자동으로 먹습니다.

| 아이콘 | 이름 | 효과 |
|---|---|---|
| 🍖 | 고기 | 일정 시간 동안 이동 속도가 빨라집니다 |
| 🍪 | 간식 | 일정 시간 동안 무적이 되어 파이프에 부딪혀도 통과합니다 |
| 💧 | 물 | 일정 시간 동안 조작감이 비행기처럼 부드러워집니다(탭을 누르는 동안 상승, 떼면 서서히 하강). 무적은 아닙니다 |
| 🛡️ | 방패 | 한 번 부딪혀도 죽지 않고 방패만 소모됩니다. 일정 시간 안 쓰면 자동 소멸 |
| ❤️ | 하트 | 치명타를 입는 순간 자동으로 한 번 부활시켜줍니다. 일정 시간 안 쓰면 자동 소멸 |
| 🍬 | 사탕 | 일정 시간 동안 충돌 판정 크기가 작아져 파이프 틈 통과가 쉬워집니다 |
| 🧲 | 자석껌 | 일정 시간 동안 주변 아이템을 자동으로 끌어당깁니다 |
| 🎈 | 풍선껌 | 일정 시간 동안 자동 조종 모드가 되어 알아서 파이프 틈으로 이동합니다 |
| ⭐ | 별사탕 | 일정 시간 동안 파이프 통과 점수가 2배가 됩니다 |
| 🧊 | 얼음과자 | 일정 시간 동안 움직이는 파이프가 멈춥니다 |
| ⏰ | 모래시계 | 일정 시간 동안 전체 속도가 느려지는 슬로모션이 됩니다 |
| 🎁 | 미스터리 | 위 효과 중 하나가 랜덤으로 발동됩니다 (하트만큼 희귀하게 등장) |

### 캐릭터별 차이

| 캐릭터 | 특징 |
|---|---|
| 한민 (수달) | 균형 잡힌 기본형 |
| 헨리 (치와와) | 더 가볍게, 더 높게 점프 |
| 찰스 (햄스터) | 시작부터 더 빠른 기본 속도 |
| 메리 (햄스터) | 떨어질 때 더 사뿐하게 |
| 루이 (숨김) | 점수 15 또는 거리 300m 달성 시 해제. 전체적으로 살짝 좋은 올라운더 |

### 업적 / 오늘의 미션 / 랭킹

- **업적**: 타이틀 화면 `업적` 버튼에서 확인. 첫 플레이, 점수 10/25 돌파, 100m/500m 클럽,
  아이템 3개 먹기, 무적 콤보 5, 캐릭터 4명 다 플레이, 숨겨진 캐릭터 발견, 일일 미션 클리어 등
  총 10종.
- **오늘의 미션**: 타이틀 화면에 날짜별로 자동으로 바뀌는 미션이 표시됩니다. 완료하면 그날은
  완료 표시로 바뀝니다.
- **로컬 랭킹 TOP 5**: 타이틀 화면 `랭킹` 버튼에서 이 브라우저 기준 최고 기록 5개를 확인할 수
  있습니다.
- **결과 이미지 저장**: 게임오버 화면의 `📸 결과 이미지 저장` 버튼으로 점수/거리가 찍힌 이미지를
  바로 다운로드할 수 있습니다.

## 로컬에서 실행해보기

```bash
# 폴더 안에서
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

## GitHub Pages로 배포하기

1. GitHub에 새 저장소를 만들고 이 폴더의 파일들을 저장소 루트(또는 원하는 하위 폴더)에 올립니다.

   ```bash
   git init
   git add .
   git commit -m "Add Tappy Friends game"
   git branch -M main
   git remote add origin https://github.com/ChoeHanMin/저장소이름.git
   git push -u origin main
   ```

2. GitHub 저장소 페이지에서 **Settings → Pages** 로 이동합니다.
3. **Build and deployment** 항목에서 Source를 `Deploy from a branch`로 설정하고,
   Branch를 `main` / `/(root)` 로 선택한 뒤 **Save** 를 누릅니다.
4. 잠시 후 `https://ChoeHanMin.github.io/저장소이름/` 주소로 게임이 배포됩니다.

> **참고**: `index.html`의 `og:image`/`twitter:image`는 카카오톡·아이메시지 등에 링크를
> 공유했을 때 미리보기 이미지가 뜨도록 `https://choehanmin.github.io/-tappy-friends/og-image.png`로
> 고정되어 있습니다. 저장소 이름이나 계정명이 다르다면 `index.html` 상단의 이 두 URL을 실제
> 배포 주소에 맞게 바꿔주세요.

## 커스터마이징 팁

- 난이도 조절: `game.js` 상단의 `START_PIPE_GAP`/`MIN_PIPE_GAP`(파이프 틈), `START_PIPE_SPACING`/
  `MIN_PIPE_SPACING`(파이프 간격), `DIFFICULTY_RAMP_SCORE`(몇 점까지 서서히 어려워질지),
  `MOVING_PIPE_SCORE_START`(움직이는 파이프 등장 시점), `BASE_SPEED`, `GRAVITY`/`JUMP_VELOCITY` 값을
  조정하세요.
- 아이템 확률/지속시간: `ITEM_SPAWN_CHANCE`, `SPEED_DURATION`, `INVINCIBLE_DURATION`,
  `FLY_DURATION`, `SPEED_MULTIPLIER` 값을 조정하세요.
- 신규 아이템 9종 세부 수치: `SHIELD_DURATION`, `HEART_DURATION`, `CANDY_DURATION`/`CANDY_SHRINK`,
  `MAGNET_DURATION`/`MAGNET_RANGE`/`MAGNET_PULL`, `BALLOON_DURATION`, `STAR_DURATION`,
  `ICECREAM_DURATION`, `HOURGLASS_DURATION`/`HOURGLASS_SCALE` 값을 조정하세요.
- 아이템 등장 확률(가중치): `ITEM_WEIGHTS` 객체의 숫자를 바꾸면 특정 아이템이 더 자주/드물게
  나오게 할 수 있습니다 (하트·미스터리는 기본적으로 희귀하게 설정되어 있습니다).
- 캐릭터 색상/능력치: `CHARACTERS` 객체의 색상 값과 `gravityMult`/`jumpMult`/`speedMult`를 바꾸면
  배색과 조작감이 달라집니다.
- 루이/겨울테마 해금 조건: `isLeoUnlocked()`, `isWinterUnlocked()` 함수의 조건을 바꾸면 됩니다. (함수 이름은 `Leo`로 남아있지만 실제 캐릭터 이름은 루이입니다)
- 업적/일일미션 추가: `ACHIEVEMENTS`, `DAILY_TEMPLATES` 배열에 항목을 추가하면 됩니다.
- 새 캐릭터 추가: `CHARACTERS`에 항목을 추가하고, `index.html`의 `#char-grid`에 카드 버튼을
  추가한 뒤, `drawCharacter()`에 그리는 분기를 추가하면 됩니다.
- 새 아이템 추가: `ITEM_TYPES`와 `ITEM_WEIGHTS`에 항목을 추가하고, `applyItemEffect()`에 효과
  분기를 추가한 뒤 필요하면 `drawEffectAura()`/`drawEffectIcons()`에 시각 효과를 추가하면 됩니다.
- 타이틀 화면의 `플레이 방법` / `제작자` 문구는 `index.html`의 `#screen-howto`, `#screen-credits`
  안의 텍스트를 직접 수정하면 됩니다.
