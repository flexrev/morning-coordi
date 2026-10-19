# PWA · QA 재검증 — Phase 4 (P2)

- 검토자: P2 (PWA/QA) · 2026-10-19 · 검토 전용(소스 미수정)
- 기준: `docs/architecture/tech-stack.md` 6절(16항목)·7절(8항목), `docs/research/references.md` 5절, `docs/review/pwa-dod.md`(C1 자체 점검 — 신뢰하지 않고 전부 재실행), `docs/review/gate-3-review.md` 3절 9·10번
- 환경: Windows 11, Node 20+, vite 6.4.4, vite-plugin-pwa 1.3.0 (Workbox 7), Lighthouse 12.8.2(헤드리스 Chrome), 브라우저 패널(Android 14 Pixel 8 UA, 375×812 기본 + 320/360/390/430)
- 산출물: 이 문서, `docs/review/shots-p2/` (lighthouse.report.html/json, s1-dark-375.jpg, s2-dark-375.jpg, s2-light-375-chip-border.jpg, s3-dark-375-banner.jpg)

## 0. 요약

| 구분 | 결과 |
|---|---|
| 6절 PWA DoD (16) | **13 pass / 0 fail / 3 pending** (pending 3건은 전부 배포·실기기 필요: #1, #14, #15) |
| 7절 iOS 방어 (8) | **8 pass / 0 fail** |
| Lighthouse (모바일, S1) | Performance **99** · Accessibility **100** · Best Practices **100** |
| 오프라인 | preview 서버를 실제로 끈 상태에서 리로드 → `index.html`·JS·CSS 전부 `cache-storage`, S1→S6 전 화면 동작 |
| 업데이트 UX | `dist/index.html` 리비전만 바꿔 새 SW 생성 → 2번째 로드에서 토스트 "새 버전은 다음 실행에 적용돼요", `registration.waiting=true`, 기존 버전 계속 서빙(리로드 없음) 확인 |
| localStorage 차단 | `localStorage` getter가 `SecurityError`를 던지게 한 뒤 S1→S2→칩 선택→S3→S4→S5→S6→O1→계절 토글: 크래시 0, 콘솔 오류 0 |
| 콘솔 | 전 화면 오류·경고 0건 (오프라인 테스트 중 내가 직접 보낸 `fetch` 1건 제외) |
| 발견 | 높음 0 · 중간 3 · 낮음 10 |
| 검증기 경고 45 | V-09 36 · V-18 6 · V-21 3 (V-22는 현재 발생하지 않음) |
| 테스트 | `npm test` 39/39 pass. UI·storage·install·빌드 산출물 테스트 없음 |

C1의 13/3 집계는 맞다. 단 C1 표에서 "코드 확인"에 그쳤던 #12(localStorage 없이), #13(다음 실행 적용), #8(오프라인)은 이번에 런타임으로 실증했다.

## 1. 정적 검토 (index.html · manifest · vite.config · SW 등록)

| 항목 | 결과 | 근거 |
|---|---|---|
| manifest 필드 | pass | `id/start_url/scope "./"`, `name 아침 코디`, `short_name 아침코디`(4자), `lang ko`, `display standalone`, `orientation portrait`, `theme_color/background_color #121212`, `description`, icons 192·512·512 maskable(`purpose: "maskable"` 단독 — "any maskable" 혼용 아님, 올바름). `screenshots: []` → P2-12 |
| meta 태그 | pass | `viewport-fit=cover`, `theme-color` light/dark 2종(media), `color-scheme dark light`, `apple-touch-icon 180x180`(상대경로), `apple-mobile-web-app-capable`, `mobile-web-app-capable`, `apple-mobile-web-app-title`. `apple-mobile-web-app-status-bar-style` 미사용(결정대로) |
| BASE_PATH 서브경로 | pass | `MSYS_NO_PATHCONV=1 BASE_PATH=/morning-coordi/ npm run build`: `dist/index.html`의 JS/CSS는 `/morning-coordi/assets/...`, manifest·apple-touch-icon·favicon은 상대경로 유지, 번들 내 SW 등록이 `"/morning-coordi/sw.js"` + scope `"/morning-coordi/"`로 치환됨. manifest `start_url "./"`·`icons "icons/..."`는 manifest 파일 위치 기준이라 서브경로에서도 유효. sw.js precache URL은 sw.js 위치 기준 상대경로(`assets/..`, `index.html`) |
| SW 전략 | pass | `generateSW`, `registerType: 'prompt'`, `cleanupOutdatedCaches`, `clientsClaim` 미설정(기본 false), `skipWaiting`은 메시지 수신 시에만. `main.js`가 `registerSW({ immediate: true, onNeedRefresh → toast })`. 강제 적용 버튼 없음(2차 예정) |
| navigateFallback | pass | `dist/sw.js`: `NavigationRoute(createHandlerBoundToURL("index.html"))`. 라우트가 전부 해시라 어떤 진입점이든 `index.html` 하나로 덮임. `denylist` 불필요 |
| precache glob | pass (중복 있음) | `**/*.{js,css,html,svg,png,webmanifest,woff2}` + `includeAssets: ['icons/*.png','manifest.webmanifest']` → 같은 파일이 두 번 나열됨(16 entries, 실제 고유 11). Workbox가 동일 URL+revision은 런타임에서 무시하므로 오류는 없음 → P2-03. 데이터 JSON은 `index-lsZ1nW39.js`(218 KB)로 번들, 실루엣 SVG 27개는 `import.meta.glob(..., {query:'?raw', eager:true})`로 JS에 인라인 → 별도 요청 0, precache 누락 가능성 0 |
| 불필요한 precache | 없음 | `_headers`(217 B)는 glob에 없어 제외됨. `workbox-window` 청크(5.7 KB)는 등록 코드에 필요 |
| SW 등록 코드 | pass | `virtual:pwa-register` 사용, `'serviceWorker' in navigator` 가드 |
| `install.js` | pass | `isStandalone()`(matchMedia + navigator.standalone), `isIOS()`(iPadOS MacIntel+터치 포함), `beforeinstallprompt` 저장 → 배너 [설치] 버튼, 없으면 [설치 방법] → O1 3단계 시트. 노출 규칙은 P2-11 참고 |
| `storage.js` | pass | 접근 전부 `try/catch`, `globalThis.localStorage` getter 예외까지 흡수(`store()` 자체가 try). `state.js`는 손상 JSON·무효 값에 기본값 |

## 2. 빌드 산출물 (`dist/`)

| | 루트 빌드 | `/morning-coordi/` 빌드 |
|---|---|---|
| precache (빌드 로그) | 16 entries · 380.02 KiB | 16 entries · 380.11 KiB |
| 고유 파일 합계 | 11 파일 · **389,228 B = 380.1 KiB** (예산 2 MB의 19%, 목표 800 KB 이내) | 동일 |
| 가장 큰 항목 | `assets/index-lsZ1nW39.js` 218.3 KB (데이터+실루엣, gzip 29.8 KB) · `assets/index-kZFAJ2x3.js` 65.4 KB (앱, gzip 18.9 KB) · `assets/index-DCTQyaon.js` 47.2 KB (엔진, gzip 16.7 KB) · CSS 18.6 KB (gzip 4.4 KB) · `workbox-*.js` 15.0 KB(런타임, precache 아님) · icon-512 ×2 11.9 KB | 동일 |
| JS gzip 합계 | 16.7 + 18.9 + 29.8 + 2.4 = **67.8 KB** — 예산 "< 60 KB"를 8 KB 초과 (데이터 청크 29.8 KB 포함 기준). 앱+엔진만이면 38 KB | 동일 |
| 아이콘 PNG 3장 | 4.2 + 11.9 + 11.9 = 28 KB (< 60 KB) · 전부 colorType 2(RGB, 알파 없음) | — |
| `mock` 문자열 | 0건 (`.env.production` `VITE_USE_MOCK=false`, 트리셰이킹 확인) | — |
| `icon-512.png` vs `icon-512-maskable.png` | **md5 동일**(`b4e31340…`) → P2-02 | — |

## 3. 재검증 DoD 표

### 3-1. 6절 PWA DoD (16)

| # | 항목 | 결과 | 근거 (P2 직접 확인) |
|---|---|---|---|
| 1 | HTTPS 배포 URL에서 열림 | **pending** | 미배포. localhost preview에서만 확인 |
| 2 | manifest 필드 전부 | pass | 1절 표. 브라우저에서 `manifest.webmanifest` 200 |
| 3 | `<link rel=manifest>` + theme-color 2종 | pass | `index.html` 9·10·11행. 런타임 `meta[name=theme-color]` 2개 media 확인 |
| 4 | apple-touch-icon 180 PNG 불투명 | pass | 180×180, colorType 2 |
| 5 | apple/mobile-web-app-capable, title | pass | `index.html` 15~18행 |
| 6 | viewport-fit=cover | pass | `index.html` 5행 |
| 7 | 상단 `max(env(safe-area-inset-top), 44px)` standalone 한정 + 하단 env | pass | `base.css` `@media (display-mode: standalone) #app{padding-top:max(var(--safe-top),44px)}`; `.bottom`·`.sheet`·`.detail`·토스트 `max(var(--safe-bottom), 16px)`. (standalone 에뮬레이션 불가 → CSS 판독) |
| 8 | precache에 데이터+실루엣+아이콘 | pass | 2절. Cache Storage `workbox-precache-v2` 11개 URL. **서버 종료 후** 리로드: navigation·JS·CSS 전부 `deliveryType: cache-storage`, transferSize 0, S1~S6 전 화면 렌더(카드 3/5/12장, SVG path 렌더) |
| 9 | 설치 상태 감지 | pass | `install.js isStandalone()` |
| 10 | 설치 배너 iOS/Android | pass | 2회차 방문에서 S3 상단 배너 노출, [설치 방법] → `#/result/install` O1 시트(step 3개, `role=dialog`) 확인. Android 경로는 `beforeinstallprompt` 저장→`prompt()`→`userChoice` 코드 확인(브라우저 패널에서 이벤트 발화 불가) |
| 11 | 노출 규칙 2회 방문·하루 1회·7일 | pass (주석) | `shouldShowBanner()`: visits<2 → 없음(확인), dismissedAt 7일, shownAt 1일. "하루 1회"가 닫지 않으면 매 실행 재노출로 동작 → P2-11(낮음) |
| 12 | localStorage 없이 모든 화면 | pass | ① `localStorage.clear()` 후 리로드 → S1. ② `window.localStorage` getter가 `SecurityError` throw 하도록 교체 후 S2→칩 탭→S3→S4(5장)→S5→S6(fit)→O1→✕→계절 토글(여름 반영): 크래시 0, 콘솔 0 |
| 13 | 새 버전은 다음 실행에 적용 | pass | `dist/index.html` 리비전 변경 → 2번째 로드에서 토스트 + `waiting: true`, `fetch('/index.html')`은 여전히 구버전(테스트 주석 없음). 리로드 없음. 이후 `npm run build`로 dist 원복 |
| 14 | 실기기 iOS 18/26 · Android 비행기 모드 | **pending** | 실기기 없음. #8의 "서버 종료" 테스트가 데스크톱 대용 증거 |
| 15 | DevTools Manifest/SW 경고 0 | **pending** (간접 pass) | 패널 자체는 못 열었음. 대용: Lighthouse Best Practices 100(`errors-in-console` pass), manifest 200, SW active/scope 정상, 콘솔 0건 |
| 16 | precache < 2 MB · 첫 로딩 < 1 s | pass (조건부) | 380 KiB. Lighthouse(모바일, 느린 4G 시뮬레이션): FCP 1.3 s · LCP 1.8 s · TBT 0 · CLS 0. 예산의 "Fast 4G < 1 s"는 Lighthouse 기본 스로틀링보다 느린 조건이라 직접 비교 불가 — 실기기·DevTools Fast 4G로 Phase 5 재측정 권고. 2회차(SW) 로드: DCL 13 ms |

### 3-2. 7절 iOS 방어 (8)

| 항목 | 결과 | 근거 |
|---|---|---|
| 아이콘 180 불투명 + link | pass | #4. 단 내용이 캔버스의 ~60%만 차지해 iOS 홈에서 작게 보일 수 있음 → P2-02 |
| 상태바: status-bar-style 미사용, theme-color 2종 | pass | `index.html` |
| viewport-fit=cover + env() | pass | #6·#7 |
| iOS 26.1 회귀 44px 하한(standalone만) | pass | `base.css` |
| 설치 유도: iOS 비설치 감지 → 안내 | pass | `isIOS()` + `!isStandalone()` → 배너/시트 |
| 저장소: 잃어도 되는 데이터만 | pass | `mc.v1.last/recent/season/theme/install` 뿐. "저장됨" 문구 없음 |
| 스플래시 생략, background_color 다크 | pass | manifest `#121212` |
| manifest iOS 미지원 필드 유지 | pass | `background_color, orientation` |

## 4. 런타임 · 레이아웃 · 접근성

### 4-1. 레이아웃 (너비별 `scrollWidth <= innerWidth`, 하단 고정 영역 겹침)

| 너비 | S1 | S2 | S3 | S4 톤/색상/변주 | S5 | S6 시트 | O1 시트 |
|---|---|---|---|---|---|---|---|
| 320×568 | ok | **overflow (innerWidth 328)** → P2-07 | ok | ok | ok | ok(288px) | ok(303px) |
| 360×740 | ok | ok | ok | ok | ok | ok | ok |
| 375×812 | ok | ok | ok (마지막 카드 bottom 671 = `.bottom` top 671, 겹침 없음) | ok | ok | ok | ok |
| 390×844 | ok | ok | ok | ok | ok | ok | ok |
| 430×932 | ok | ok | ok | ok | ok | ok | ok |

- `.bottom`(더 보기 56 + 카테고리 48 + 패딩) 높이 141px, `position: sticky` — 스크롤 끝에서 마지막 카드와 정확히 맞닿음. 시트 `max-height: min(72dvh, 640px)` 안에서 내용 오버플로 없음.
- `.toast`는 `bottom: safe+120px` 고정이라 S2 칩 그리드 2~3행과 겹침(2.6초, `shots-p2/s2-light-375-chip-border.jpg`) → P2-13.

### 4-2. 라이트 테마 (`mc.v1.theme='light'` 후 리로드)

| 요소 | 색/배경 | 대비 | 판정 |
|---|---|---|---|
| 칩 라벨 `text-2` / bg-0 | #5A5955 / #F6F5F1 | 6.43 | ok |
| 카드 라벨·이유 `text-3` / 카드 #FFF | #6B6963 | 5.49 (12px) | ok (AA) |
| 주 버튼 | #FFF on #8A6A2E | 5.02 | ok |
| **화이트 칩 스와치 / bg-0** | #FFF / #F6F5F1, 테두리 rgba(0,0,0,.14)→실효 #DBDBDB | 스와치 1.09 · **테두리 1.27** | **fail** (WCAG 1.4.11 비텍스트 3:1) → P2-01 |
| 크림 스와치 / bg-0 | #F4ECC9 | 1.09 (테두리 동일) | fail → P2-01 |
| 카드 안 화이트 점 / 카드 #FFF | 1.00, 테두리 .14 | fail → P2-01 |
| 다크: 블랙 스와치 #141414 / #121212, 테두리 rgba(255,255,255,.28)→실효 #545454 | 테두리 ≈ 2.4 | 경계 — P2-01에 함께 |

다크 테마 텍스트 대비: `text-3` on bg-1 5.47, `text-2` 8.0~8.8, 주 버튼 10.6 — 전부 AA 이상.

### 4-3. 접근성 (Lighthouse axe 19 pass / 10 manual / 44 n.a. + 수동)

| 검사 | 결과 |
|---|---|
| `lang="ko"` | pass |
| 터치 타깃 ≥ 48 | 칩 80×82, 카테고리 버튼 165×88, 탭 114×48, 필 ≥95×48, 카드 ≥128, 상세 행 48, 뒤로 48×48, 배너 ✕ 48. **예외**: `.seg__opt` 44px 높이(::after로 52까지 확장, P2-05), **`.sheet__close` 35×48**(긴 제목일 때 flex 수축, P2-04) |
| 색 칩 aria-label | pass — `"화이트, 뉴트럴, 모노톤"` 형식(색+톤). `role=radio` + `aria-checked` 그리드(`role=radiogroup`) |
| ⚑ 의견 갈림 | pass(코드) — `flag()` `role=img aria-label="의견 갈림" title`, 카드 aria-label 끝에 ". 의견 갈림" 병기. S6 대안 행의 ⚑도 aria-label. 인디고 기본 결과에는 disputed 카드가 없어 런타임 노출은 미확인 |
| 카드 안 색 점 | pass — `role=img aria-label="상의: 화이트"`; 장식용 점은 `aria-hidden` |
| SVG | 실루엣 `aria-hidden`(카드) / S5는 `label` 전달. aria 없는 SVG 0 |
| 시트 | `role=dialog aria-modal`, 제목 `h2`, 열리면 ✕에 포커스, Esc 닫기 — 포커스 트랩·복귀 없음(P2-08) |
| 제목 구조 | **S1만 h1**, S2~S5는 h 요소 없음(topbar 제목이 div) → P2-06 |
| focus-visible | `:focus-visible` 2px accent 링. 키보드 Tab 순서는 DOM 순(상단바→본문→하단) 자연스러움 |
| `prefers-reduced-motion` | 전역 애니메이션 off |

### 4-4. Lighthouse 12.8.2 (`shots-p2/lighthouse.report.html`)

- 대상: `http://localhost:4176/#/` 모바일 에뮬레이션(새 프로필이라 S1). Performance **99** / Accessibility **100** / Best Practices **100** (PWA 카테고리는 LH 12에 없음).
- FCP 1.3 s · LCP 1.8 s(LCP 요소 `<h1>`) · Speed Index 1.3 s · TBT 0 ms · CLS 0 · TTI 1.8 s.
- 감점 감사: `render-blocking-resources` (CSS 18.6 KB, 150 ms 절감 가능) — 토큰 CSS 인라인 또는 수용(P2-14). 그 외 없음.
- 한계: 새 프로필이라 S3(카드 화면)는 LH로 측정 안 됨. S3는 4-1~4-3의 수동 측정으로 대체.

## 5. 검증기 경고 45건 분류 (`npm run validate`: 0 error / 45 warning)

| 규칙 | 건수 | 내용 | 분류 | 조치 |
|---|---|---|---|---|
| V-09 | 36 | classic·5점인데 출처 1개 (`colorRules` 2,5,6,7,10,13~23) | **(c) P3 데이터 갭** | 출처 2개째를 찾거나 score 4로 내림. 5장 신발 열(R1 "담당자 판단") 비중 큼 — `data-conversion-log.md` 59행의 우선 목록대로 |
| V-18 | 6 | outfits 아이템 쌍에 colorRules 없음: o14 blackDenim↔midGrey, o30 indigo↔forestGreen, o32 beige↔indigo(아우터), o52 greyMelange↔black ×3 | **(c) P3 데이터 갭** 3건(o14/o30/o32: 규칙 행 추가 — 실제 흔한 조합) · **(b) 수용+주석** 3건(o52 스웻팬츠는 변환 로그 107행대로 수동 지정, 기본 3점) | 규칙 추가 시 V-18 → 0 |
| V-21 | 3 | 고아 색: `midDenim`, `teal`, `taupe` — 어느 규칙·코디에도 없음. `catalog.colorsFor()`는 규칙에 등장한 색만 S2에 올리므로 UI 노출 없음 | **(a) 지금 수정** 2건: `teal`, `taupe`를 `colors.json`·`tokens.css --g-*`에서 제거(또는 비활성) · **(c) P3** 1건: `midDenim`(미드워시 데님)은 실사용 빈도 높은 베이스 — 규칙 행을 추가해야 S2에 나타남 | |
| V-22 | 0 | JSON 합계 300 KB 초과 — gate-3 목록에는 있으나 현재 빌드에서 발생하지 않음(데이터 청크 218 KB) | — | 목록에서 제거 |

합계: (a) 2 · (b) 3 · (c) 40.

## 6. 테스트 (`npm test`: 39 pass / 0 fail, 0.5 s)

현재 범위: 엔진(E-01~E-20), 통합(quick/deep/caption/perf), 데이터 검증, 카탈로그 라벨 일치. **없음**: UI/DOM(화면·라우터·상태), `storage.js`/`state.js` 복원, `install.js` 노출 규칙, 빌드 산출물(sw/manifest) 검사.

가장 가치 있는 추가 테스트 3개:

1. `tests/storage.test.js` — `globalThis.localStorage`를 ① undefined ② getter throw ③ `setItem` QuotaExceeded ④ 손상 JSON(`"{"`)으로 바꿔 `read()`가 fallback, `write()`가 false를 돌려주고 예외가 새지 않는지, `state.js` 초기화가 `validBase`·계절 추정 기본값으로 떨어지는지. (DoD #12를 회귀 방지)
2. `tests/install.test.js` — `shouldShowBanner()` 매트릭스: visits 1/2, dismissedAt 6일/8일, dismissedAt 'forever', shownAt 23h/25h, `showing` 유지, standalone, UA 데스크톱. `navigator`·`matchMedia`·localStorage 스텁으로 node:test에서 실행 가능(이미 ESM 순수 모듈). P2-11 결정에 따라 기대값 고정.
3. `tests/build.test.js` (빌드 후 실행, `npm run build && node --test tests/build.test.js`) — `dist/sw.js`의 precache 목록에 `index.html`·모든 `assets/*.{js,css}`·아이콘 4개가 있고 URL 중복이 없으며 합계 < 2 MB; `dist/index.html`의 `src/href`가 base로 시작; `dist/manifest.webmanifest`가 유효 JSON이고 필수 필드(name, short_name, start_url, display, icons 192/512/maskable)를 가짐. BASE_PATH 변형도 같은 테스트로 돌림.

(차순위: `nav.parse()` 단위 테스트 — 딥링크 `#/result/bottom/indigo/more/var` 분해.)

## 7. 저장소 위생

| 항목 | 결과 |
|---|---|
| `.gitignore` | `node_modules/ dist/ dev-dist/ .vite/ *.log .DS_Store Thumbs.db .env .env.*` — **`.env.*`가 `.env.production`까지 무시** → tech-stack·README의 "프로덕션은 false 고정" 약속이 저장소에 안 들어감 (P2-09). 현재 디렉터리는 아직 git 저장소가 아님(`.git` 없음) |
| README | 실행 명령 8개 전부 `package.json`에 존재·동작 확인(dev/build/preview/validate/test/build:data/icons/icons:placeholder). `npm run preview`는 "localhost"만 적혀 있고 포트가 4173 기본이나 점유 시 바뀜(이번엔 4176) — 한 줄 보강 권고. Git Bash `MSYS_NO_PATHCONV=1` 안내 정확 |
| `.claude/launch.json` ×2 | 저장소 안(`npm run dev/preview`, 4173)과 **상위 디렉터리**(`npm --prefix morning-coordi ... --host 127.0.0.1`) 두 벌. 상위 것은 저장소 밖이라 배포에는 무관하지만 어느 쪽이 실행되는지 혼동됨 → P2-10 |
| 배포 파일 | `.github/workflows/pages.yml`·`404.html` 복사 단계 없음(Phase 5 예정, tech-stack 3-3). `public/_headers`는 Cloudflare 전용으로 정확 |
| `docs/review/scratch-p3/` | P3 작업 폴더가 review 아래에 있음 — 최종본과 섞이지 않게 정리 대상(정보) |

## 8. 발견 목록

심각도: **높음** = 설치·오프라인 실패, 크래시, 데이터 손실 / 중간 = 사용성·접근성 기준 미달 / 낮음 = 정리·일관성.

| ID | 심각도 | 요소/파일 | 증거 | 수정안 |
|---|---|---|---|---|
| P2-01 | **중간** | `src/styles/tokens.css` `--chip-border` (D2) | 라이트: 화이트/크림/오프화이트 칩 스와치·카드 색 점의 테두리 실효 대비 1.27:1(비텍스트 기준 3:1 미달), 화이트 점 vs 카드 1.00. 다크: 블랙 칩 테두리 ≈2.4:1. `shots-p2/s2-light-375-chip-border.jpg` | 라이트 `--chip-border: rgba(0,0,0,.42)`(≈3:1 on #FFF), 다크 `rgba(255,255,255,.40)`(≈3.5:1 on #121212). 또는 밝은 색(L>90)에만 `.chip__swatch[data-light]` 2px 테두리 |
| P2-02 | 낮음 | `public/icons/icon-512.png` = `icon-512-maskable.png`, `scripts/make-icons.mjs` | md5 동일. 그림이 캔버스 ~60%만 차지(maskable 안전영역 기준) → `purpose any`·apple-touch-icon은 iOS 홈·데스크톱에서 작게 보임. 설치 자체는 정상 | `make-icons.mjs`에서 any·apple용은 그림을 ~85%로 키운 변형으로 래스터화(배경은 그대로). maskable만 현재 여백 유지 |
| P2-03 | 낮음 | `vite.config.js` `includeAssets` | precache 목록에 manifest·아이콘 4개가 2회씩(16 entries, 고유 11). Workbox가 동일 항목을 무시해 런타임 오류는 없음 | `includeAssets` 삭제(globPatterns가 이미 png·webmanifest 포함) → 로그 11 entries |
| P2-04 | **중간** | `src/styles/app.css` `.sheet__close` | S6 신발 시트(제목 "신발 스타일 — 인디고 데님 · 스트레이트 · 노브레이크")에서 ✕ 버튼이 35×48로 수축(flex-shrink) | `.sheet__close { flex: 0 0 var(--tap-min); }` 추가. 제목은 `min-width:0`으로 줄바꿈 |
| P2-05 | 낮음 | `.seg__opt` | 박스 44px 높이(::after `inset:-4px 0`로 52까지 확장되나 가시 영역은 44) | `min-height: 48px`로 올리고 `.seg` padding 0, 또는 현 상태 수용(주석 유지) |
| P2-06 | 낮음 | `components.js topbar()` | S2~S5에 h1/h2 없음(S1만 h1). 시트 h2가 h1 없이 등장 | `.topbar__title`을 `h1`으로 렌더(스타일 동일), `topbar__title--app`도 h1. 스크린리더 랜드마크/제목 탐색 개선 |
| P2-07 | 낮음 | `.chip { min-width: 72px }` + `.chipgrid` 4열 | 320px 폭에서 4×72+3×8+32 = 344 > 320 → 레이아웃 뷰포트 328로 확장(가로 스크롤). 360 이상 정상 | `.chip { min-width: 0 }` (스와치 52px가 이미 최소 폭 보장) |
| P2-08 | 낮음 | `components.js sheet()` | `document.addEventListener('keydown', onKey)`가 Esc 외 경로(스크림·✕·뒤로)로 닫을 때 제거되지 않음 → 세션 중 누적. 포커스 트랩·복귀 없음 | `close` 래퍼에서 `removeEventListener`; 열기 전 `document.activeElement` 저장 후 닫을 때 `focus()` 복귀 |
| P2-09 | 낮음 | `.gitignore` | `.env.*`가 `.env.production`을 무시. 현재는 `VITE_USE_MOCK` 미설정도 false로 접혀 결과는 같지만 문서 약속과 불일치 | `.env.*` 아래 `!.env.production` 추가 |
| P2-10 | 낮음 | `.claude/launch.json` (저장소) + `../.claude/launch.json` (상위) | 두 벌. 상위 것은 `--prefix morning-coordi --host 127.0.0.1`. 어느 설정이 뜨는지 혼동, 4173 점유 시 포트 이동 | 상위 파일 삭제(저장소 밖) 또는 README에 "저장소 루트에서만 실행" 명시 |
| P2-11 | 낮음 | `install.js shouldShowBanner()` | `showing:true`가 닫기 전까지 유지되어 `shownAt` 24h 검사를 건너뜀 → 닫지 않으면 매 실행 노출("하루 1회" 아님). 비모달 배너라 치명적이지 않음 | `if (s.shownAt && now - s.shownAt < DAY) return s.showing === true ? true : false;` 식으로 당일은 같은 세션에만 유지, 다음날 다시 1회. 또는 사양을 "닫기 전까지 유지"로 바꿔 문서화 |
| P2-12 | 낮음 | `public/manifest.webmanifest` `screenshots: []` | 빈 배열. Android Richer Install UI(references 5-2)는 narrow 1장이면 발동 | Phase 5에 S3 375×812 PNG 1장 추가(`form_factor: "narrow"`), precache glob에 포함되므로 용량(≈30 KB) 확인 |
| P2-13 | 낮음 | `.toast` 위치 | `bottom: safe+120px` 고정 → S2 칩 그리드 2·3행을 2.6초 가림(`shots-p2/s2-light-375-chip-border.jpg`) | S2/S4처럼 하단 고정 영역이 없는 화면에선 `bottom: safe+16px`; 또는 상단 토스트 |
| P2-14 | 낮음 | `index.html` CSS link | Lighthouse `render-blocking-resources` 150 ms(CSS 18.6 KB/gzip 4.4 KB) | 수용 가능. 원하면 `tokens.css`만 `<style>` 인라인 |

## 9. 수정 권고 우선순위

1. **P2-01 칩 테두리 대비(중간, D2 `tokens.css` 한 줄 ×2)** — 라이트 테마에서 흰 계열 칩이 사실상 안 보임. 색 선택이 핵심 기능이라 가장 먼저.
2. **P2-04 시트 ✕ 수축(중간, `app.css` 한 줄)** — 터치 타깃 48 미달, 긴 제목 시트(S6 신발)에서 재현.
3. **P2-03 + P2-09 + P2-10 (낮음, 설정 정리 10분)** — precache 중복 제거, `.env.production` 커밋 보장, launch.json 한 벌로.
4. **P2-06 + P2-07 + P2-08 (낮음, UI 마감)** — topbar h1, 320px 칩 min-width, 시트 리스너·포커스 복귀.
5. **V-21 teal/taupe 제거 (a)** 과 **V-18/V-09 P3 이관 (c)** — 데이터 담당에게 5절 표 전달.
6. **P2-02 아이콘 any 변형**, **P2-12 screenshots 1장**, **P2-11 배너 규칙 결정** — Phase 5 배포 직전 묶음.
7. **pending 3건(#1·#14·#15)** — 배포 URL 확보 후: iOS 18/26 Safari 홈 추가 → 비행기 모드 → S3 도달, Android Chrome 설치 프롬프트, DevTools Application 패널 경고 0, Fast 4G FCP 실측. 6절 테스트 3개 추가 시 #12·#13은 회귀 자동화 가능.
