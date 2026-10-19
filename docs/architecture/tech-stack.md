# 기술 스택 · 폴더 구조 · 빌드/배포 (C1 프론트 아키텍트)

작성일: 2026-10-19 · 버전 v1.0 (Phase 2 산출물)
근거 문서: `00-team-and-plan.md` 5절·9절, `research/gate-1-review.md` 2·3절, `research/references.md` 5·6절 및 결정 제안 9~12

---

## 1. 스택 결정

| 영역 | 결정 | 대안 | 이유 |
|---|---|---|---|
| 빌드 | **Vite 6** | — | 정적 산출물, `base` 한 줄로 서브경로 배포, vite-plugin-pwa와 가장 매끄러움 |
| 런타임 | **바닐라 JS (ES 모듈)**, 프레임워크 없음 | Preact | 아래 1-1 |
| 스타일 | **CSS 변수(토큰) + 일반 CSS 파일 3개** | Tailwind, CSS-in-JS | 색 주입이 핵심 기능이라 CSS 변수가 곧 데이터 경로. 빌드 도구 추가 불필요 |
| PWA | **vite-plugin-pwa, `generateSW` 모드, `registerType: 'prompt'`** | injectManifest | Workbox 설정만으로 precache 완성. 업데이트는 다음 실행 때 적용(1-2) |
| 데이터 | **JSON 정적 import** (`src/data/*.json` → 번들에 포함) | fetch 런타임 로드 | 전부 합쳐도 수백 KB. 번들에 넣으면 precache 누락 위험이 0, 오프라인 첫 실행도 안전 |
| 저장 | **localStorage** (잃어도 되는 것만) | IndexedDB | 4절 |
| 백엔드 | **없음** | — | 계획서 5절. 호스팅 비용 0, 오프라인 우선 |
| 테스트 | **Node 내장 `node:test`** (엔진·데이터 검증) | Vitest | 의존성 0. 엔진이 순수 함수라 DOM 불필요 |
| 린트 | 없음 (MVP) | ESLint | 1인 프로젝트. Phase 4에서 필요하면 추가 |

### 1-1. 왜 Preact가 아니라 바닐라 JS인가

- **화면이 4개**(홈/결과, 카테고리, 색 칩, 더 보기 탭)뿐이고 상태는 `{base, season, mode}` 하나. 컴포넌트 트리 재조정이 필요한 규모가 아니다.
- **SVG 색 주입은 DOM 직접 조작이 가장 짧다**: `svg.style.setProperty('--c-top', hex)`. VDOM을 끼우면 오히려 한 겹 늘어난다.
- 엔진(C2)이 순수 함수이고 카드(C3)가 `(outfit) → HTMLElement`이면 프레임워크 없이도 역할 경계가 명확하다.
- 번들: Preact 4KB는 작지만, 1초 첫 로딩 예산에서 JS 파싱 시간보다 **습관적 복잡도(hook·effect·key)**를 빼는 게 1인 개발 속도에 더 이득.
- 2차(옷장 등록, 즐겨찾기)에서 폼·리스트가 늘면 그때 Preact로 올려도 엔진·데이터·SVG는 그대로 재사용된다(결합 지점이 `render(outfit)` 하나).

렌더링 규약(C3·C1 공통):
- 컴포넌트 = `export function OutfitCard(props): HTMLElement`. 내부에서 `document.createElement` 또는 `template` 문자열 + `innerHTML`(정적 문자열만. 데이터 라벨은 `textContent`).
- 전역 상태는 `src/app/state.js`의 작은 스토어(`get/set/subscribe`). 화면 전환은 `src/app/router.js`가 `hash` 기반으로 처리(`#/`, `#/pick/:category`, `#/result`).

### 1-2. 서비스워커 업데이트 정책

- `registerType: 'prompt'` → 새 SW는 **대기(waiting)** 상태로 두고, 모든 탭이 닫히면 다음 실행 때 활성화. 아침 사용 중 리로드가 일어나지 않는다(references 5-3).
- `main.js`는 `onNeedRefresh`에서 아무것도 하지 않거나, 작은 토스트 "새 버전은 다음 실행에 적용돼요"만 띄운다. 강제 적용 버튼은 설정 화면(2차)에.
- `cleanupOutdatedCaches: true`, `clientsClaim: false`(prompt 모드 기본).

---

## 2. 폴더 구조

```
morning-coordi/
├─ index.html                 # lang="ko", viewport-fit=cover, theme-color 2종, apple-touch-icon, manifest
├─ package.json
├─ vite.config.js             # base 환경변수, vite-plugin-pwa
├─ README.md
├─ .gitignore
├─ public/                    # 그대로 복사되는 정적 파일
│  ├─ manifest.webmanifest    # start_url/scope 상대경로("./") → 호스팅 비의존
│  ├─ _headers                # Cloudflare Pages 전용(GitHub Pages는 무시)
│  ├─ icons/
│  │  ├─ icon-192.png         # Android
│  │  ├─ icon-512.png
│  │  ├─ icon-512-maskable.png
│  │  └─ apple-touch-icon.png # 180×180, 투명 없음 (iOS)
│  └─ screenshots/            # (선택) narrow 1장 → Android Richer Install UI
├─ scripts/
│  ├─ make-placeholder-icons.mjs   # 임시 아이콘 생성(D2 아이콘 오면 삭제)
│  └─ validate-data.mjs            # C2: data-schema.md 8절 검증 실행 (npm run validate)
├─ src/
│  ├─ main.js                 # 부트스트랩: 토큰 로드, 라우터 시작, SW 등록
│  ├─ app/                    # (C1, Phase 3) 화면·상태
│  │  ├─ router.js            # hash 라우팅 3경로
│  │  ├─ state.js             # {base, season, mode, recent[]} 스토어
│  │  ├─ storage.js           # localStorage 래퍼(4절 키 관리, try/catch)
│  │  ├─ install.js           # 설치 상태 감지 + iOS/Android 안내 배너
│  │  └─ views/               # home.js, pick-category.js, pick-color.js, result.js
│  ├─ components/             # (C3) OutfitCard.js, ColorChip.js, Silhouette.js
│  ├─ engine/                 # (C2) 순수 함수. DOM 접근 금지. engine-spec.md
│  │  ├─ index.js             # 공개 API 재수출
│  │  ├─ lookup.js            # 데이터 인덱스(Map) 생성
│  │  ├─ score.js             # 축별 점수 + 합산
│  │  ├─ candidates.js        # 후보 생성(Quick/Deep)
│  │  ├─ groups.js            # 톤별·색상별·변주 그룹핑
│  │  ├─ explain.js           # 설명 문자열
│  │  ├─ recommend.js         # 진입점 recommend()
│  │  └─ validate.js          # 데이터 정합성 검사(빌드·테스트에서 호출)
│  ├─ data/                   # (C2) JSON. data-schema.md가 단일 진실
│  │  ├─ index.js             # 모든 JSON을 하나의 객체로 재수출
│  │  └─ *.json
│  ├─ assets/
│  │  └─ silhouettes/         # (D2) 토르소 SVG. CSS 변수로 색 주입
│  └─ styles/
│     ├─ tokens.css           # (D2) 색·타이포·간격 토큰, 다크 기본
│     ├─ base.css             # reset, safe-area, 타이포 기본
│     └─ app.css              # 화면·컴포넌트 스타일
├─ tests/                     # node:test. engine/*.test.js, data.test.js
└─ docs/
   ├─ architecture/           # 이 문서, data-schema.md, engine-spec.md
   ├─ design/                 # D1·D2
   ├─ research/
   └─ review/                 # Phase 4
```

소유권: `src/engine`·`src/data`·`scripts/validate-data.mjs` = C2, `src/components` = C3, `src/assets/silhouettes`·`src/styles/tokens.css` = D2, 나머지 = C1. 다른 팀 폴더는 PR(또는 메시지)로만 건드린다.

---

## 3. 빌드 · 배포

### 3-1. 명령

| 명령 | 동작 |
|---|---|
| `npm install` | 의존성(vite, vite-plugin-pwa)만. 런타임 의존성 0 |
| `npm run dev` | `vite` 개발 서버. SW는 dev에서 `devOptions.enabled: false`(기본) |
| `npm run build` | `vite build` → `dist/`. 산출물: `index.html`, `assets/*.js|css`, `sw.js`, `workbox-*.js`, `manifest.webmanifest`, `icons/` |
| `npm run preview` | `vite preview` — 빌드 결과를 로컬 HTTPS 없이 확인(SW 동작은 localhost 허용) |
| `npm run validate` | C2 데이터 검증 스크립트 (data-schema.md 8절). CI·커밋 전 실행 |
| `npm test` | `node --test` (`tests/**/*.test.js` 자동 탐색) |

### 3-2. `base` 처리 (호스팅 미결정 대응)

`vite.config.js`:

```js
const base = process.env.BASE_PATH || '/';   // GitHub Pages: '/morning-coordi/'
export default defineConfig({ base, plugins: [VitePWA({ ... })] });
```

- `index.html`의 링크(`manifest.webmanifest`, `icons/...`)는 **앞에 `/`를 붙이지 않는 상대경로**로 쓴다. Vite가 `base`를 붙여 준다.
- `manifest.webmanifest`는 `start_url: "./"`, `scope: "./"`, `icons.src: "icons/icon-192.png"` — manifest 파일 위치 기준 상대경로이므로 루트 배포·서브경로 배포 모두 동작.
- Workbox `navigateFallback`은 플러그인이 `${base}index.html`로 자동 설정.
- 두 호스팅 모두 검증한 뒤 Phase 5에서 하나를 고른다. 코드 변경 없이 환경변수만 다르다.

### 3-3. GitHub Pages

```bash
# 로컬 확인 (Windows Git Bash는 앞에 MSYS_NO_PATHCONV=1 — '/morning-coordi/'가 Windows 경로로 바뀌는 것 방지)
BASE_PATH=/morning-coordi/ npm run build && npm run preview
```

`.github/workflows/pages.yml` (Phase 5에 추가):

```yaml
name: pages
on: { push: { branches: [main] } }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run validate && npm test
      - run: BASE_PATH=/morning-coordi/ npm run build
      - run: cp dist/index.html dist/404.html   # SPA 폴백 트릭
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages }
    steps:
      - id: d
        uses: actions/deploy-pages@v4
```

제약: 커스텀 헤더 불가(`Cache-Control` 조정 못 함 → `sw.js`는 GitHub가 10분 캐시. 업데이트가 최대 10분 늦을 수 있음, 허용). 상업적 사용 금지(ToS).

### 3-4. Cloudflare Pages

- 대시보드 연결: Framework preset **Vite**, Build command `npm run build`, Output `dist`, Node 22. `BASE_PATH`는 설정하지 않음(루트).
- 또는 CLI: `npx wrangler pages deploy dist --project-name morning-coordi`.
- `public/_headers` (이미 포함):

```
/sw.js
  Cache-Control: no-cache
/manifest.webmanifest
  Cache-Control: no-cache
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

- SPA 폴백: Pages는 `index.html`이 있으면 자동 폴백. 별도 `_redirects` 불필요(hash 라우팅이라 애초에 깊은 URL이 없음).

---

## 4. localStorage 키

접두사 `mc.v1.` — 스키마가 바뀌면 `v2`로 올리고 구버전 키는 읽기 실패 시 무시.

| 키 | 값 | 잃어도 되는가 | 비고 |
|---|---|---|---|
| `mc.v1.last` | `{category, color, material?, season, at}` | 예 | 홈 = 마지막 선택 결과 화면. 없으면 카테고리 화면 |
| `mc.v1.recent` | 위 객체 배열, 최대 3 | 예 | 상단 "최근" 칩 |
| `mc.v1.season` | `"springFall"\|"summer"\|"winter"` | 예 | 없으면 오늘 날짜(월)로 추정: 3~5·10~11 봄가을, 6~9 여름, 12~2 겨울 |
| `mc.v1.theme` | `"dark"\|"light"\|"auto"` | 예 | 기본 auto(다크 우선 토큰) |
| `mc.v1.install` | `{visits, dismissedAt}` | 예 | 2회 방문 후 노출, 닫으면 7일 숨김 |
| `mc.v1.favorites` | outfit id 배열 | **2차**. 잃으면 아쉬우나 동작엔 무관 | MVP 미사용 |

규칙: 모든 접근은 `storage.js`를 통해 `try/catch`. iOS 저장소 삭제(7일 미사용·용량)를 전제로, **없어도 모든 화면이 열려야 한다**. 서버가 없으므로 복구 수단도 없다 — 사용자에게 "저장됨"을 약속하는 문구를 쓰지 않는다.

---

## 5. 성능 예산

| 항목 | 예산 | 측정 |
|---|---|---|
| precache 총량 (`dist` 전체) | **< 2MB** (목표 < 800KB) | 빌드 로그의 "precache N entries (X KiB)" |
| JS 번들(gzip) | < 60KB (엔진+데이터+앱) | `vite build` 출력 |
| 실루엣 SVG | 파일당 < 15KB, path ≤ 35 | D2 |
| 아이콘 PNG 3장 | 합 < 60KB | — |
| 첫 로딩 (4G, 비캐시) | **< 1s** FCP | Chrome DevTools throttling "Fast 4G" |
| 재실행 (설치 후, 오프라인) | < 300ms 결과 화면 | 실기기 |
| 추천 계산 | < 10ms / 요청 | `performance.now()` (engine-spec 5절) |
| 폰트 | 시스템 폰트만(`-apple-system, "Apple SD Gothic Neo", "Noto Sans KR"` 로컬 폴백). 웹폰트 로드 없음 | — |

데이터 JSON은 번들에 정적 포함(1절). 400 페어 × 60B ≈ 25KB 수준이라 분리 청크 불필요. 200KB를 넘기면 `src/data/index.js`를 동적 import로 바꾼다.

---

## 6. PWA 완료 기준 (DoD) — references 5-4 적용

Phase 3 종료 시 C1이 아래 전부 체크. P2는 같은 표로 재검증.

```
[ ] HTTPS 배포 URL에서 열림 (preview URL 포함)
[ ] manifest.webmanifest: name "아침 코디", short_name "아침코디", id "./", start_url "./", scope "./",
    display "standalone", theme_color, background_color, description, icons 192/512 PNG + 512 maskable
[ ] index.html: <link rel="manifest">, <meta name="theme-color"> 라이트/다크 2종(media)
[ ] <link rel="apple-touch-icon" sizes="180x180"> PNG(투명 없음)
[ ] <meta name="apple-mobile-web-app-capable" content="yes">, mobile-web-app-capable, apple-mobile-web-app-title
[ ] <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
[ ] CSS: 상단 padding max(env(safe-area-inset-top), 44px) 폴백(iOS 26.1 회귀), 하단 탭바 env(safe-area-inset-bottom)
[ ] SW precache에 data(JSON은 번들 내) + assets/silhouettes/*.svg + icons 포함 (globPatterns)
[ ] 설치 상태 감지: matchMedia('(display-mode: standalone)') || navigator.standalone
[ ] 설치 배너: iOS = 공유 → "홈 화면에 추가" 3단계 그림 / Android = beforeinstallprompt 저장 후 버튼
[ ] 배너 노출 규칙: 2회 방문 후, 하루 1회, 닫으면 7일 숨김 (mc.v1.install)
[ ] localStorage 없이도(시크릿 모드) 모든 화면 동작
[ ] 새 버전은 다음 실행에 적용 (사용 중 리로드 없음)
[ ] 실기기: iOS 18/26 Safari, Android Chrome 최신 — 홈 화면 추가 후 비행기 모드에서 실행, 결과 화면까지 도달
[ ] DevTools > Application > Manifest / Service Workers 경고 0건 (Lighthouse PWA 카테고리는 없음)
[ ] precache 총량 < 2MB, 첫 로딩 < 1s (5절)
```

---

## 7. iOS 방어 규칙

| 항목 | 구현 | 근거 |
|---|---|---|
| 아이콘 | `public/icons/apple-touch-icon.png` 180×180, 불투명 배경. manifest 아이콘보다 우선 적용됨 | references 5-1 |
| 상태바 | `apple-mobile-web-app-status-bar-style`은 쓰지 않음(deprecated). `theme-color` 2종으로 대체 | 5-1 |
| 전체화면 | `viewport-fit=cover` + CSS `env(safe-area-inset-*)` | 5-1 |
| iOS 26.1 회귀 | `padding-top: max(env(safe-area-inset-top, 0px), 44px)` — standalone일 때만(`@media (display-mode: standalone)`). 브라우저 탭에서는 44px가 과하므로 `env()`만 | 5-1 [53] |
| 설치 유도 | `beforeinstallprompt` 없음 → `install.js`가 iOS Safari 비설치 상태를 감지(`navigator.standalone === false` + UA iPhone/iPad)하면 안내 배너(공유 아이콘 → "홈 화면에 추가") 표시 | 5-1, 결정 5 |
| 저장소 | localStorage는 4절의 "잃어도 되는" 데이터만. 설치 앱과 Safari 탭은 저장소가 분리되므로 "Safari에서 고른 것이 앱에 없다"는 정상 | 5-1 |
| 스플래시 | `apple-touch-startup-image`는 MVP 생략(없으면 마지막 화면 캡처 사용). background_color를 다크 배경으로 맞춰 번쩍임 최소화 | 5-1 |
| manifest 미지원 필드 | `background_color, orientation, shortcuts`는 iOS가 무시 — Android용으로만 유지 | 5-1 |

---

## 8. 다른 팀에 넘기는 인터페이스 요약

- **C2**: `docs/architecture/data-schema.md` + `engine-spec.md`. `src/engine/*.js` 스텁의 시그니처를 유지한 채 구현. `npm run validate`가 0건으로 끝나야 Phase 3 통과.
- **C3**: `OutfitCard(outfit, score, opts) → HTMLElement`. 색은 `data.colors`의 hex, 실루엣은 `src/assets/silhouettes/torso.svg`를 `<use>`/inline 후 `--c-top/--c-bottom/--c-shoes/--c-outer` 변수로 주입.
- **D2**: `src/styles/tokens.css`의 변수명을 유지(placeholder 참조). 아이콘 4장을 `public/icons/`에 같은 파일명으로 교체하면 끝.
- **D1**: 라우트 3개(`#/`, `#/pick/:category`, `#/pick/:category/color`), 결과 화면 탭 바(클래식 | 톤별 | 색상별 | 변주). Quick = 2탭 고정.
