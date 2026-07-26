# 탭탭 프렌즈 (Tap Tap Friends)

화면을 탭(또는 마우스 클릭)해서 점프하며 초록색 파이프 사이를 지나가는 캐주얼 게임입니다.
Tappy Plane / Flappy Bird 스타일이며, 순수 HTML + CSS + JavaScript(Canvas)로 만들어져 있어
별도의 빌드 과정 없이 바로 GitHub Pages에 올릴 수 있습니다.

## 폴더 구조

```
tappy-friends/
├── index.html   # 게임 화면 구조
├── style.css    # 디자인 (배경, 카드, 버튼 등)
├── game.js      # 게임 로직 & 캐릭터 드로잉 & 물리 연산
└── README.md
```

## 캐릭터

| 이름 | 동물 |
|---|---|
| 한민 | 수달 |
| 헨리 | 치와와 |
| 찰스 | 검갈색 햄스터 |
| 메리 | 흰색 햄스터 |

캐릭터 이미지는 별도 파일 없이 `game.js` 안에서 캔버스로 직접 그립니다
(`drawOtter`, `drawChihuahua`, `drawHamster` 함수).

## 로컬에서 실행해보기

파일을 그냥 브라우저로 더블클릭해서 열어도 되고, 로컬 서버로 띄워도 됩니다.

```bash
# 폴더 안에서
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

## GitHub Pages로 배포하기

1. GitHub에 새 저장소를 만들고 이 폴더의 파일들(`index.html`, `style.css`, `game.js`)을
   저장소 루트(또는 원하는 하위 폴더)에 올립니다.

   ```bash
   git init
   git add .
   git commit -m "Add Tap Tap Friends game"
   git branch -M main
   git remote add origin https://github.com/ChoeHanMin/저장소이름.git
   git push -u origin main
   ```

2. GitHub 저장소 페이지에서 **Settings → Pages** 로 이동합니다.
3. **Build and deployment** 항목에서 Source를 `Deploy from a branch`로 설정하고,
   Branch를 `main` / `/(root)` 로 선택한 뒤 **Save** 를 누릅니다.
4. 잠시 후 `https://ChoeHanMin.github.io/저장소이름/` 주소로 게임이 배포됩니다.
   (`index.html`을 하위 폴더에 올렸다면 그 경로까지 포함해서 접속하면 됩니다.)

## 화면 구성

1. **타이틀 화면** — `게임 시작` / `플레이 방법` / `제작자` 3개 버튼이 있습니다.
2. **캐릭터 선택** — 4명 중 한 명을 고르고 시작 버튼을 누릅니다.
3. **카운트다운** — `GAME START` 문구 후 `3, 2, 1` 카운트다운이 나오고 자동으로 시작됩니다.
4. **플레이 화면** — 상단에 점수와 이동 거리(m)가 표시됩니다.
5. **게임 오버** — 화면이 회색으로 바뀌며 `THE END`와 함께 점수/거리/최고 기록이 표시됩니다.

## 게임 규칙

- 화면을 탭/클릭(또는 스페이스바)하면 캐릭터가 위로 점프합니다. 아무 입력이 없으면 중력에 의해 계속 아래로 떨어집니다.
- 초록색 파이프 사이 틈으로 지나가면 점수가 1점씩 올라가고, 이동한 거리(m)도 함께 누적됩니다.
- 파이프나 바닥/천장에 부딪히면 화면이 회색으로 바뀌며 게임이 끝나고, 최고 점수와 최고 거리는
  브라우저(localStorage)에 자동으로 저장됩니다.

### 아이템

파이프 사이 틈에 확률적으로 아이템이 등장합니다. 캐릭터가 스치면 자동으로 먹습니다.

| 아이콘 | 이름 | 효과 |
|---|---|---|
| 🍖 | 고기 | 일정 시간 동안 이동 속도가 빨라집니다 |
| 🍪 | 간식 | 일정 시간 동안 무적이 되어 파이프에 부딪혀도 통과합니다 |
| 💧 | 물 | 일정 시간 동안 조작감이 비행기처럼 부드러워집니다(탭을 누르는 동안 상승, 떼면 서서히 하강). 무적은 아닙니다 |

## 커스터마이징 팁

- 난이도 조절: `game.js` 상단의 `PIPE_GAP`(파이프 틈 크기), `BASE_SPEED`(속도),
  `GRAVITY`/`JUMP_VELOCITY`(중력/점프 세기) 값을 조정하세요.
- 아이템 확률/지속시간: `ITEM_SPAWN_CHANCE`, `SPEED_DURATION`, `INVINCIBLE_DURATION`,
  `FLY_DURATION`, `SPEED_MULTIPLIER` 값을 조정하세요.
- 캐릭터 색상: `CHARACTERS` 객체의 색상 값(`body`, `belly` 등)을 바꾸면 배색이 바뀝니다.
- 새 캐릭터 추가: `CHARACTERS`에 항목을 추가하고, `index.html`의 `#char-grid`에
  카드 버튼을 하나 더 추가한 뒤, `drawCharacter()`에 그리는 분기를 추가하면 됩니다.
- 타이틀 화면의 `플레이 방법` / `제작자` 문구는 `index.html`의 `#screen-howto`, `#screen-credits`
  안의 텍스트를 직접 수정하면 됩니다.
