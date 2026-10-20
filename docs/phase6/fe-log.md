# Phase 6-B · FE 작업 로그 — 비주얼 리뉴얼(B 스튜디오 다크) · 모션 · 새 표면 · 자산 v2 렌더러

작성일: 2026-10-20 · 담당: FE · 입력: `gate-5-review.md`(결정 1~7, 3절), `ad-concepts.md` B·A 타이포, `concept-b.html`, `motion-spec.md`, `ux-enhancement.md`, `ux-wireframes-v2.html`, `asset-system.md` 4-4 + `src/assets/v2/index-v2.json`, `content-expansion.md` 7·9절
소유 범위만 수정: `src/ui/**`, `src/styles/**`, `src/main.js`, `index.html`, `public/manifest.webmanifest`, `tests/ui/**`, 이 문서, `docs/phase6/shots-fe/`. `src/engine`·`src/data`·`src/assets`·`scripts`·`package.json`은 손대지 않음(커밋은 PM).

---

## 1. 파일별 변경

### 1-1. 스타일

| 파일 | 변경 |
|---|---|
| `src/styles/tokens.css` | **B 팔레트로 재작성**: `--bg-0 #0E0F12`, 글래스 `--bg-1 rgba(255,255,255,.045)` + `--bg-1-solid #1A1B1F`(폴백), `--glass-border/--glass-hi`, `--text-1/2/3 #F4F2ED/#B9B6AF/#8E8B85`, `--accent #E8B964` + `--accent-soft/--accent-glow`, `--spot`, `--stage-glow`(AS stage 레이어가 읽는 단색 `#FFE6BE`), `--stage-floor`, `--morning`(좌상단 아침빛), `--grain`(data-URI feTurbulence) + `--grain-opacity`, `--sil-ink`. **라이트(B-light)** 유지: 종이 `#F3EFE6`(시안 C 톤), 글래스 흰색 .62, 텍스트 `#1F1C18`, 액센트 `#7E5F26`(기존 `#8A6A2E`는 11px 라벨에서 4.38:1이라 5.2:1로 올림). A의 타이포 위계: `--fs-display 30/38 800`, `--fs-hero 17/22`(기준 바), `--fs-cap 15/22 600`(카드 캡션), `--fs-eyebrow 11 +.12em 700`. `--g-<colorId>` 32색·`--c-top/bottom/shoes/outer` 유지, `--c-skin/hair/sole/metal/belt/watch/socks/bag/cap/scarf/mid` 폴백 추가(metal 라이트 `#A8A6A0`). **모션 토큰** 15개(`--dur-fast/base/slow/enter/fade`, `--ease-standard/emphasized/exit/spring`, `--stagger`, `--dist-sm/md`, `--press/--press-soft`) + 별칭 `--motion-fast/--motion-sheet`. reduced 덮어쓰기 두 벌: `@media (prefers-reduced-motion)` + `:root[data-motion="reduce"]`(값은 motion-spec 2-1 reduced 열) |
| `src/styles/base.css` | 전역 `animation:none !important` **삭제**(토큰이 대신). `html{background:var(--bg-0)}`, `body{overscroll-behavior-y:none}`(3-17), `body::before` 아침빛, `html[data-grain] body::after` 그레인(opt-in, overlay, 애니메이션 없음), `[hidden]{display:none!important}`(`.btn` 등 display 를 가진 요소에 `hidden` 이 지도록 — 발견한 버그), `.eyebrow` |
| `src/styles/app.css` | 전부 B 로 다시 씀. `.glass`(+`@supports not` 폴백, `html[data-perf=low]`에서 blur 끔), 카드 `r=22` 글래스 + `.plate`(스포트라이트 radial + 바닥 그림자 + drop-shadow), 기준 바 글래스 필 64px + 36px 원형 칩 앰버 링·글로우, 세그먼트 글래스 + `.seg__thumb`, 칩 56/62px `r=20` + `::after` 선택 링, 더 보기 앰버 글로우 버튼(2줄: 제목 + 부제), 카테고리 글래스 세그먼트, 탭 지시선 `.tabs::before`(`--tabs`·`--tab-i`), 시트 열림/닫힘, 토스트, 배너, 코치마크, 스켈레톤 맥동, ♥ 팝 + 링, 오늘 카드 세로선, 태그 칩, 온보딩 스트립, 설정, 메뉴, 공유, View Transitions 규칙(`html[data-nav=fwd|back]`, `bottom`, `base-swatch`), CSS 폴백 `main.is-entering-*`, keyframes 13개(전부 transform·opacity). 액센트는 화면당 3곳(기준 바 링 · 라벨 점/아이브로우 · 1차 버튼)으로 제한 |

### 1-2. 렌더러·자산 v2

| 파일 | 변경 |
|---|---|
| `src/ui/silhouette.js` | v2 계약: `import.meta.glob('../assets/v2/*.svg')`, `groupOf()` 가 `g[data-slot]` 을 importNode 해 캐시, `appendLayer()` = `<g>` 복제 → `[data-detail]` 정리 → 패턴 오버레이를 `path[data-part=main]:not([data-kind])` **바로 뒤**에 삽입(`data-part=mat`) → 기장 규칙을 `<g>` 에. z순서는 `index-v2.json.zOrder`(stage → base → cap → socks → shoes → bottom → belt → top → mid → outer → scarf → bag → watch). 벨트는 `top.tuck===true` 또는 벨트 아이템이 있을 때만 + 상의 `clip-top-tuck`, 양말은 바지 crop 일 때만, 아우터/미드가 있으면 상의는 regular 파일. 액세서리는 `items[]`(category) 또는 `opts.accessories[]`(CX `AccessoryPick.group`)에서 슬롯으로 정규화해 `--c-<slot>` 주입. 폴백 파일의 슬롯이 다르면(`mid`→`outer-regular`) 그 `<g>` 에 색 변수를 직접 넣는다. `opts.stage` → AS `stage-spotlight`/`stage-floor` 레이어 + `index.stage` 의 크기별 opacity·blur. `opts.grain` → `filter:url(#f-grain)`(S5 만). `serializeStandalone()` — 공유용: `var()`·`currentColor` 를 계산값으로 인라인 + defs 복사(foreignObject 없음) |
| `src/ui/typeToLayer.js` | **데이터 주도**: `AVAILABLE` = `index-v2.json.layers[].file`. 원하는 파일이 없을 때만 가장 가까운 **v2** 파일로(polo→shirt→tee, slim→tapered, running→sneaker, workboot·chukka→chelsea, sandal→loafer, longPuffer→`outer-long-puffer`→puffer, mid-*→mid-cardigan→outer-regular). AS 가 파일을 추가하면 index 재생성만으로 드롭인(현재 41 레이어 전부 직접 매핑). `accessorySlot()`(group/category/type 추론, 노쇼 양말은 숨김), 액세서리 type 변형(beanie·backpack·crossbody). `patternFor()` → `pat2-*`, `patternForPrint()`(breton·pinstripe·gingham·plaid·houndstooth, 소재보다 우선). `Z_ORDER`·`STAGE` export |
| `src/ui/patternDefs.js` | asset-system 5장 `pat2-*` 8종 그대로 + 무늬 자리표시 5종(`pat2-stripe/pinstripe/gingham/plaid/houndstooth` — AS 정식 타일이 오면 같은 id 로 교체) + v1 별칭 2종 + `clip-top-tuck` + `f-grain` 필터. `cloneDefs()` |

### 1-3. 모션·구조

| 파일 | 변경 |
|---|---|
| `src/ui/motion.js` (신규) | motion-spec 4-1 그대로 + `nextFrame()`(rAF 가 멈춘 백그라운드 탭에서도 1회 실행), `setNavHint/takeNavHint`(S2 칩 탭 → `nav.back('/result')` 를 앞으로로), `haptic()`, `durationMs()`. `viewTransition()` 에 **안전장치** 추가: 예산+600ms 뒤 `skipTransition()`(백그라운드로 가면 `finished` 가 영영 안 끝나 입력이 막히는 것을 실측해서 넣음), `ready`/`updateCallbackDone` 거부는 삼킨다(콘솔 AbortError 제거) |
| `src/ui/app.js` | motion-spec 4-2 렌더 구조: `compose(route)` → `{key, main, sheet}`. 키(`s1`·`s2/<cat>`·`s3`·`s4`·`s5/<ref>`·`st1`)가 같으면 **`main` 을 그대로 두고 시트만 추가·제거·교체**(`.is-closing` → 140ms/80ms 뒤 제거). 키가 다르면 `viewTransition(update, type)`; type = 힌트 > popstate(`back`) > 등급 비교. 폴백 `main.is-entering-fwd/back/fade`. `main.__update(route)` 로 S4 탭 제자리 전환. 라우트 추가: `result/menu`·`result/fav`·`outfit/:ref/share`·`settings`·`settings/reset`·`more/style`·`fav.<id>` ref |
| `src/ui/nav.js` | 1줄: popstate → `handler(parse(), { pop: true })` |
| `src/ui/components.js` | 카드 `div.card > button.card__main + button.card__fav`(♥ 48×48, `aria-pressed`, 인라인 SVG, 팝+링, 햅틱, 토스트 1.6초, 30개 상한 토스트), 라벨 줄 `⚑`·`자세히 ›`, 태그 칩(카드 1개 dominant + 이유, 이유 없으면 2개; 3개 이상 걸치면 숨김 — CX 9장), `segment()` 공용(썸 슬라이드, 화살표 키), `sheet()` 에 `close/cleanup` 노출, `toast()` 교체형 + 나감 모션, `styleTagsOf/styleShort` |
| `src/ui/state.js` | `getResult(opts)` — CX Query 객체 `{base, season, mode:'deep', accessories:true, style?, occasion?}` 단일 호출점 `callRecommend()`, 계산 시간 `mc.v1.perf` 기록, `wasSlow()`. `findCandidate` 에 `style.<id>.N`·`occ.<id>.N`·`fav.<outfitId>` 분기, `styleLabel/occasionLabel/favLabel`, `setTheme/setMotion/resetSeason` |
| `src/ui/storage.js` | KEYS `favorites/onboarded/hints/motion/perf`, `available()`, `clearAll()`(mc.v1.* 만) |
| `src/ui/today.js` (신규) | `fnv1a`·`dayNumber`·`todayIndex`·`dateLabel/dateStamp/dateSlug` |
| `src/ui/favorites.js` (신규) | ≤30 최신순, 중복 없음(at 갱신), 저장소 없으면 세션 메모리 + `stored:false`, 구독, `findInResult()` |
| `src/ui/share.js` (신규) | `shareLayout()`(순수)·`wrapCaption()`·`buildShareImage()`(1080×1350, `#0E0F12`, 아침빛·스포트라이트 캔버스 그라데이션, 실루엣 data-URL → drawImage, 색 점 72px, 캡션 44/60 ≤3줄, 라벨 28 앰버, 워드마크 32 + 날짜, 앱 아이콘)·`shareCapability()`(files→text→none)·`shareBlob()`·`downloadBlob()`·`fileName()` |
| `src/ui/coach.js` (신규) | `showCoach(key, target, {delay})` — role=status, 아무 탭·6초·대상 분리 시 사라짐, `hints` 1회성 |
| `src/ui/icons.js` (신규) | heart·share·more·gear·download·help·check·chevron 인라인 SVG(글리프 금지, R8) |
| `src/ui/screens/s1Category.js` | 아이브로우 + 30px 제목, 온보딩 스트립(첫 실행만, 장식, 건너뛰기 = 카테고리 탭), 글래스 타일·필 |
| `src/ui/screens/s2Color.js` | 아이브로우 "2 / 2 · 색 고르기" + 제목 + 보조문, 4열 칩 라벨 2줄, 탭한 칩에만 `view-transition-name: base-swatch`(다른 칩은 `none`), `setNavHint('fwd')` |
| `src/ui/screens/s3Result.js` | S3′: 날짜 제목(`10월 20일` + 380px 미만에서 `· 아침 코디` 숨김), ⋯ 메뉴, 기준 바 히어로(아이브로우 `하의 · 기준` + 17px 색 이름), 바로가기 줄(`♥ 저장 N` ≥1 + 최근 ≥2), **오늘 카드 맨 위**(표시 순서만, ref 는 원래 인덱스), 라이브 리전, 더 보기 부제, 제자리 갱신(`renderHead/renderCards` 만 교체 + 스태거, 전환 없음), 스켈레톤(지난 계산 > 80ms 일 때 틀 먼저 + `nextFrame` 에 계산), 높이 가드(배너 아래로 → 컴팩트 모드, 이유 줄 생략 뒤 두 프레임 뒤에 측정), 코치마크 A(2회차·배너 없는 날·첫 결과 아닐 때, +680ms), 첫 S3 에 `onboarded=true` |
| `src/ui/screens/s4More.js` | 4번째 탭 `스타일`(`result.byStyle` 없으면 탭 자체를 숨김, 있는데 비면 `disabled`+없음), 칩 줄 2개(sticky): 스타일(CX 순서·shortLabel) · 상황(`result.byOccasion`, 토글 해제 가능). 교집합 = byOccasion 그룹 ∪ `candidate.tags.occasion`; 비면 `이 조합은 아직 없어요` + `상황 해제`. 탭 전환 제자리(`__update`, 지시선 `--tab-i`, 패널 스태거) |
| `src/ui/screens/s5Detail.js` | 일러스트 `min(36dvh, 400px)` + `stage:true` + 그레인(저사양·투명도 줄이기면 끔), 태그 ≤2, **소품 줄**(`candidate.accessories[]` → 색 점 + `accessory.<id>` 라벨, 가로 스크롤), 하단 고정 `♥ 저장` · `공유`(각 48), 코치마크 B(첫 S5), fav ref 면 저장 당시 base·season |
| `src/ui/screens/s6Sheet.js` | 로직 불변(스타일만 B). 닫힘 모션은 app.js 구조 변경으로 자동 |
| `src/ui/screens/sheets.js` (신규) | O2 `menuSheet`(즐겨찾기 N · 설정 · 앱으로 두기(미설치·모바일) · 처음 안내), F1 `favSheet`(72dvh, 카드 탭 → S5 `fav.<id>`, ♥ 해제 → 제거, 못 찾는 항목 흐림, 빈 상태 2줄), SH1 `shareSheet`(그리는 동안 `--bg-2` 자리표시, `navigator.share` 없음 → 공유하기 숨김, canShare files 아니면 텍스트, iOS standalone 은 길게 눌러 저장 안내, 실패 시 `글로 공유`), ST1-r `resetSheet` |
| `src/ui/screens/settings.js` (신규) | 화면(다크·라이트·자동, 전환 모션 없음) · 움직임(시스템 따름·줄이기 + 현재 OS 값) · 계절(+자동으로 되돌리기) · 처음 안내 · 홈 화면(미설치·모바일) · 모든 저장 지우기 · 정보 2줄 |
| `src/main.js` | `applyPrefs()`: 테마·모션 속성, `data-perf=low`(`deviceMemory ≤ 2`), 그레인 opt-in(다크·저사양 아님·투명도 줄이기 아님) |
| `index.html` | theme-color `#0E0F12`/`#F3EFE6`, **첫 페인트 전** 배경·저장된 테마·모션 적용 인라인 3줄(흰 플래시 0) |
| `public/manifest.webmanifest` | theme/background `#0E0F12` |
| `tests/ui/*.test.js` (신규 5) | 아래 5절 |

---

## 2. motion-spec 상호작용 → 코드

| # | 상호작용 | 구현 위치 |
|---|---|---|
| 3-1 앞으로 | `app.js` type `fwd` → `html[data-nav=fwd]::view-transition-old/new(root)`(`vt-out-fwd` 200ms exit / `vt-in-fwd` 320ms emphasized), `.bottom { view-transition-name: bottom }` + 그룹 `animation:none` |
| 3-2 뒤로 | popstate → `{pop:true}` → `back` → 크로스페이드(`fade-out` 120 / `fade-in` 200) |
| 3-3 공유 요소 | `s2Color.js` 탭한 칩 `style.viewTransitionName='base-swatch'`(나머지 `none`), `.basebar .dot--base { view-transition-name: base-swatch }`, `::view-transition-image-pair(base-swatch){border-radius:50%}`, 역방향은 `.chip[aria-checked=true] .chip__swatch` |
| 3-4 카드 → S5 모프 | **미구현**(스펙: 실기기 60fps 통과 뒤 추가) |
| 3-5 카드 스태거 | `stagger(cards.children)` + `.cards.is-enter > * { animation: card-in; delay: calc(var(--i)*var(--stagger)) }`, 최대 5. 첫 프레임 규칙은 `animation-fill-mode: both`(첫 프레임부터 레이아웃 완성·측정 가능)로 근사 |
| 3-6 프레스 | `.chip:active { scale(var(--press)) }`, 버튼·카드 `--press-soft` |
| 3-7 선택 링 | `.chip__swatch::after` opacity/scale, `.chip__check` pop-in |
| 3-8 세그먼트 | `components.segment()` `.seg__thumb` `translateX/width`(`getBoundingClientRect` 대신 `offsetLeft/Width` 1회), 글자 `color` 전환만 비 transform |
| 3-9 시트 | `.sheet { animation: sheet-in spring }`, 닫힘 `app.js closeSheet()` → `.is-closing` → `sheet-out`/`fade-out` → 제거 |
| 3-10 탭 지시선 | `.tabs::before` `translateX(calc(var(--tab-i)*100%))`, `--tabs: 4` |
| 3-11 스켈레톤 | `state.wasSlow()`(`mc.v1.perf.computeMs > 80`) → `s3Result` 틀 + `.skeleton`×3(맥동 opacity .7↔1) → `nextFrame` 에 계산·교체 |
| 3-12 하트 팝 | `favButton()` `.is-pop` → `heart-pop`(1→.8→1.15→1) + `::after` 링, `haptic(10)` Android·저장만 |
| 3-13 토스트 | `toast()` 교체형, `toast-in` / `.is-out fade-out`, 저장 1.6초 |
| 3-14 배너 | `.banner { animation: banner-in; delay: 280ms }` |
| 3-15 코치마크 | `coach.js` `coach-in`, +680ms(스태거 280 + 400), `.is-out` |
| 3-16 오늘 카드 | `.card--today::before` `today-line scaleY(0→1)` |
| 3-17 당겨서 새로고침 | `body { overscroll-behavior-y: none }`, `.screen__body--scroll/.sheet__body { overscroll-behavior: contain }` |
| reduced 두 경로 | tokens.css 두 벌(값 0·linear·`--dur-fade` 80), `motion.prefersReducedMotion()` → VT 호출 안 함, `main.is-entering-fade` 80ms, 햅틱·링 생략. 설정 `줄이기` → `html[data-motion=reduce]`(index.html 에서 첫 페인트 전 적용) |
| 저사양 강등 | `viewTransition` 예산+120ms 초과 2회 → 세션 동안 CSS 폴백 |

---

## 3. 실측

### 3-1. S3 높이 (CSS px, 스크롤 0 = `screen__body.scrollHeight === clientHeight`)

| 뷰포트 | 조건 | 상단 바 | 기준 바 | 바로가기 줄 | 카드 3장 | 카드 bottom | `.bottom` top | 판정 |
|---|---|---|---|---|---|---|---|---|
| 390×844 (헤드리스, Android UA) | 배너 없음(dismissed), 즐겨찾기 1 + 최근 2 → 바로가기 줄 있음, 코치마크 A | 52 | 64 | 56 | 144·144·144 | **642** | **702** | 통과, 여유 60, 스크롤 0 |
| 375×812 (패널) | 설치 배너 **위**(52+50+8) | 52 | 64 | – | 144·144·144 | **642** | **670** | 통과, 여유 28, 스크롤 0 |
| 360×780 (패널) | 설치 배너 | 52 | 64 | – | 144·144·144 | 위에 두면 642 > 638 → 가드가 **카드 아래**로(584, 배너 584–634) | **638** | 통과(ux-enhancement 10-3 증명과 동일), 스크롤 0 |
| 360×780 | 배너 없음 + 바로가기 줄 | | | 56 | | 640 | 638 | 2px 초과 → 컴팩트 가드가 `is-compact`(카드 104) 로 전환. **바로가기 줄 + 배너** 동시엔 배너가 카드 아래(스크롤 영역) |

- 카드: `min-height 142` + 테두리 2 = **144**(ux-enhancement 142 예산 +2). 캡션 15/22 600 2줄 = 44, 3줄(4아이템)이면 이유 줄 생략(66 → 카드 134 → min 144). 태그 칩은 이유 줄 안(높이 0 추가), 카드엔 dominant 1개.
- 상단 바 52(세그먼트 42+6+2 = 50), 하단 고정 142(8 + 더 보기 56 + 8 + 카테고리 52 + 16), S5 일러스트 36dvh = 281 @780·304 @844. S5(소품 줄 포함) 360×780 에서 마지막 상세 줄 700 ≤ 하단 708, 본문 스크롤 0.
- 터치 타깃: 칩 88 / ♥ 48 / 세그먼트 42 + `::after` 48 / ⋯ 48 / 필 48 / 탭 56 / 상세 줄 48 / 메뉴 줄 48 / S5 하단 48 / 설정 버튼 48.
- 대비(계산값): 다크 `--text-1` 18:1(글래스 위 ≥ 15), `--text-2` 9.6, `--text-3` 5.6, 앰버 10.9. 라이트 본문 14.8, 보조 6.4, 캡션 4.7, 앰버 5.2(`#7E5F26`).

### 3-2. 번들 (gzip, `vite build`)

| | 이전(2271a7f) | 이후 | 차 |
|---|---|---|---|
| UI 청크(src/ui + 실루엣 자산) | 20.59 KB (v1 27파일) | **41.19 KB** (v2 41파일 ≈ 58 KB raw 포함) | **+20.60** |
| CSS | 4.60 KB | **8.14 KB** | **+3.54** |
| 엔진 청크 | 19.14 KB | 30.86 KB | +11.72 (CX) |
| 데이터 청크 | 30.10 KB | 43.74 KB | +13.64 (CX) |
| workbox-window | 2.36 KB | 2.36 KB | 0 |
| **JS 합계** | 72.19 KB | **118.15 KB** | +46.0 (FE +20.60, CX +25.36) |
| precache | 393 KiB | 665 KiB | |

FE 귀속 증가 ≈ **24.1 KB gzip**(예산 40 KB 안). 게이트 6 "gzip JS ≤ 120 KB" 는 **118.2 KB 로 여유 1.8 KB** — CX 데이터 확장이 주요인이라 PM 판단 필요(3-2 끝 참고). 새 의존성 0, package.json 변경 없음.

### 3-3. 검증

- 브라우저(패널, `npm run build && npm run preview`, 4173): S1 → S2 → S3′(360×780·375×812·390×844) → S4 톤별·색상별·변주·스타일(상황 교집합·빈 상태·상황 해제) → S5(소품 줄·♥·공유) → SH1(PNG 1080×1350, `navigator.share` 없음 → 공유하기 숨김 + 이미지 저장) → 시트 닫힘(`.is-closing` 관찰, `main` 유지) → ♥ 토글(토스트·팝·`mc.v1.favorites`) → O2 → F1(해석된 카드) → ST1(라이트·줄이기 → 토큰 전부 0ms/`--dur-fade` 80ms/`--press` 1, 저장 확인) → ST1-r(문구·취소). 콘솔 오류 0(헤드리스 전체 경로 포함).
- 헤드리스 Chrome(CDP, 390×844 ×2, Android UA, 실시간 대기로 애니메이션 정착 — `--virtual-time-budget` 은 CDP 가상 시간을 멈추면 페이지 타이머가 함께 멈춰 스크립트가 교착해 실시간 대기로 대체): `docs/phase6/shots-fe/` `s1.png` `s2.png` `s3-home.png` `s4-style.png` `s5.png` `f1.png` `sh1-preview.png` `st1.png` + `s3-light-reduce.png`(라이트 + 줄이기).
- 패널 한계: Claude 데스크톱 패널이 숨겨져 있으면 rAF·View Transitions 가 멈춘다 → 이 때문에 ① VT `skipTransition` 안전장치, ② `nextFrame()` 타임아웃 폴백을 넣었다(백그라운드 탭에서도 같은 이점).
- `localStorage` 없음: `storage.js` 전부 try/catch, `favorites` 세션 메모리 + 토스트 1회, index.html 인라인 스크립트 try/catch, 테스트로 확인.

---

## 4. CX 시그니처 통합

- 호출: `engine.recommend({ base, season, mode: 'deep', accessories: true, style?, occasion? })` — `state.callRecommend()` 한 곳. CX 가 위치 인자도 받으므로 둘 다 호환.
- 결과: `classic[].styleTags [{id,score}]`·`tags {style[], occasion[]}` → 태그 칩, `byStyle [{style, labelKey, candidates}]` → 스타일 탭, `byOccasion [{occasion, candidates(3)}]` → 상황 칩·교집합, `accessories [AccessoryPick{group,id,color,note,text}]` → S5 소품 줄 + 실루엣 레이어(`group` = 슬롯), 라벨 `labels.ko style.*/occasion.*/accessory.*`(shortLabel 우선).
- 미사용(UI 미정의): `applied`, `layering`(mid 후보 생성 토글), `patterns`, `styleExplain`, `rank`. `layering` 은 설정에 토글 자리가 없어 1.2 로.

---

## 5. 테스트 (`tests/ui/`, `node --test "tests/ui/*.test.js"` 33개 통과 · `npm test` 104/104)

| 파일 | 내용 |
|---|---|
| `motion.test.js` | reduced 두 경로 → VT 호출 0·즉시 교체, `data-nav` 세움/지움, type none, 예산 2회 초과 강등, stagger 0..4, navHint 1회, nextFrame 폴백 |
| `today.test.js` | fnv1a 결정성, 같은 날 같은 카드, 연속 6일 모두 다른 카드(3장 순환), 공식 일치, 1장/0장, dayNumber 자정, 날짜 문자열 |
| `favorites.test.js` | 중복 없음·at 갱신, 31번째 → 가장 오래된 제거(`evicted`), 토글, **localStorage 없음**(세션 메모리·`stored:false`·`available()` false), 잘못된 항목 필터, `findInResult`, `clearAll` 범위 |
| `share.test.js` | 1080×1350·`#0E0F12`, `wrapCaption` "·" 경계·3줄 말줄임, `shareLayout` 좌우 배치·점·워드마크·아이콘 범위, 파일명, `shareCapability`. 캔버스 PNG 생성은 DOM 필요 → 브라우저에서 확인(1080×1350, 412–822 KB) |
| `typeToLayer.test.js` | 품목 enum 전부 → index-v2 에 있는 파일(v1 폴백 없음), 태슬 detail, forceRegular, zOrder(stage·mid), 소재/무늬 → pat2-*, accessorySlot |

---

## 6. 알려진 공백 · 요청

### AS
1. 무늬 타일 `pat2-stripe/pinstripe/gingham/plaid/houndstooth` 는 FE 자리표시 — 같은 id 로 정식 타일 교체 요청(`patternDefs.js` 한 곳).
2. 온보딩 스트립 아이콘(현재 번호 원 3개), 빈 상태 그래픽 — 아이콘 세트가 오면 `s1Category.js` STEPS 에 끼움.
3. `acc-backpack` 스트랩이 반팔 티 위에서 멜빵처럼 읽힘(S5·공유 이미지) — 가방 레이어 z순서/형태 검토.
4. `index.stage` 의 `card120` 값은 카드 플레이트에 쓰지 않음(카드는 CSS radial 로 가볍게, 무대 레이어는 S5·공유만).

### CX
1. `byOccasion` 그룹이 3장이라 스타일×상황 교집합이 자주 빈다(인디고: 미니멀×출근 0) → FE 는 `tags.occasion` 도 합쳐 봄. 그룹을 ≤5 로 넓히거나 `occasion` 쿼리 결과를 쓰는 쪽으로 합의 필요.
2. deep 계산 93ms(Node 콜드) → 기기에서 80ms 를 넘기면 다음 렌더부터 스켈레톤 경로. QA 실측 뒤 임계(80) 조정 가능.
3. 소품 라벨은 `accessory.<id>` 로 잘 나옴. `text` 는 길어서 `title` 로만.

### PM / QA
1. gzip JS 118.2 / 120 KB — 데이터 청크 43.7 KB. v1 실루엣 폴더(`src/assets/silhouettes`, 번들엔 이미 없음) 삭제는 PM.
2. 3-4 카드 → S5 모프, Pretendard 셀프호스팅(결정 7), 저사양 Android·iOS 18.0 실기기 VT 측정, OLED 그레인 밝기(5%) — QA.
3. `.screen:has(> .screen__body--scroll)` 로 S3·S4·S5·ST1 을 뷰포트 높이에 고정(본문만 스크롤). `:has` 미지원(Safari < 15.4)은 이전처럼 페이지 스크롤.
4. 코치마크 A 조건: `install.visits ≥ 2`·배너 없는 날·첫 결과가 아닐 때. 첫 실행 → 재실행 2회째에 보임.
5. 스크립트 제안(선택): `"test:ui": "node --test \"tests/ui/*.test.js\""`. 새 의존성 없음.

---

## 7. Phase 6-B-3 · Fixer B (UI·번들) — 리뷰 반영 (2026-10-20)

입력: `docs/review/phase6-usability.md` U6-01…U6-18 + 4절 판정표, `phase6-content-check.md` C6-10 맥락. 소유 범위만 수정: `src/ui/**`, `src/styles/**`, `src/main.js`, `vite.config.js`, `tests/ui/**`, `src/data/expansion.js`(재수출 배럴만), `src/assets/silhouettes`(v1 삭제). 엔진·데이터·scripts·package.json 은 손대지 않음(Fixer A 와 병행). QA 실측은 `docs/review/phase6-qa.md`.

### 7-1. 반영 항목 → 코드

| ID | 결정 | 구현 |
|---|---|---|
| U6-01 | 오늘 카드 `오늘의 추천`, 나머지 `다른 클래식 1/2`·`2/2`, S5 제목·공유 라벨 동일(`오늘의 추천 · 봄가을`), ref 는 `classic.N` 그대로 | `today.js classicLabels(n, ti)`·`classicOrder()`(순수), `s3Result.js renderCards`, `state.js classicLabel(r, n)` → `findCandidate('classic.N').label` 이 같은 문자열. CSS `.card__detail { flex: 0 20 auto; min-width: 0 }` → "자세히 ›" 가 라벨보다 먼저 양보 |
| U6-02 | 카드(size < 240) 벨트+양말만, S5·공유(≥ 240) 전부 | `typeToLayer.js accessoriesForSize(list, size)`(순수, `CARD_ACC_SLOTS`), `silhouette.js renderOutfit` 이 `items[]` 안 액세서리·`opts.accessories` 둘 다 통과시킴. 백팩: z순서를 상의 아래로 내려 봤으나(단순 z 변경) 팩 상단(y 58–76)이 목 뒤 고리로 읽혀 **백팩 레이어는 모든 크기에서 그리지 않는다**(S5 소품 줄 텍스트 칩 `블랙 백팩` 으로만). 토트·크로스바디는 S5·공유에서 그대로 |
| U6-03 | 배너가 하단 뒤로 들어가면 **다음 방문으로 미룸**(겹침 0·스크롤 0) | `fit.js guardStep()`(순수): 배너 아래로 → tight → `defer-banner` → compact. `install.js deferBanner()` 가 `shownAt` 을 되돌리고 세션 플래그로 같은 세션 재노출 차단. 배너는 `.banner-slot` div 에 담아 슬롯을 잰다(`.banner` 는 banner-in translateY 애니메이션 중이라 rect 가 8px 어긋나 1차 실측에서 4px 겹침이 남았었음) |
| U6-04 | "처음 안내 다시 보기" → 실제 S1 온보딩 스트립 | `app.js compose default`: `st.base && read(KEYS.onboarded)` 일 때만 S3. 첫 S3 가 `onboarded=true` 를 다시 쓴다 |
| U6-05 | 칩 줄 가로 스크롤 + 가장자리 페이드, 선택 칩 아래 도움말 한 줄(스타일 + 상황) | `s4More.js scrollFade()` → `.pillrow[data-fade=l|r|lr]` CSS mask. `state.styleHelp/occasionHelp` → `styleText.js labelField()`: labels.ko `help` → 내장 폴백(4 스타일 + 5 상황). 스타일 라벨은 `shortLabel` 우선(U6-13 "아이비") |
| U6-05 축소 | 상황 칩 **출근·주말·데이트 + "더"(운동·격식)** | `styleText.js occasionChipIds()`(순수). 결정 근거: 5칩 + "상황" 키는 360/375 에서 넘쳐(368/328) 스크롤이 필요했고, 1차 3개 + "더" 는 375 에서 343px 한 줄에 들어감(실측). "더" 를 누르면 5개 전부, 고른 상황이 운동·격식이면 펼친 채 유지 |
| U6-06 | 클라이언트 교집합 제거 → 엔진 `recommend(base, season, 'deep', {style, occasion})` 의 `classic` 이 정본 | `s4More.js collect('style')`: 상황이 있으면 `getResult({style, occasion})` → ref `sx.<style>.<occ>.N`(`state.findCandidate` 분기 추가). `styleText.js styleOccasionCards()`: Fixer A 의 `result.shortfall`(또는 `applied.shortfall`) 우선, 없으면 `applied.relaxed` 또는 3장 미만을 부족으로 → `격식에 맞는 조합이 더 없어요 — 상황을 바꿔 보세요`(목록 위 `.s4__note` / 0장이면 빈 상태 + 상황 해제) |
| U6-07 | ♥ 를 카드 **오른쪽 아래**(엄지 영역), "자세히 ›" 는 라벨 줄 유지 → 간격 63px | CSS `.card__fav { bottom: 2px; right: 2px }`, `.card__reason { padding-right: 44px }`, 라벨·색 점 줄 padding 제거. 실측 375: 하트 중심 y 249·403·557(이전 217·371·525), 라벨 줄 "자세히" 아래 63px 분리 |
| U6-08 | 컴팩트 전 **여백 단계**(`is-tight`, −16px) | `.is-tight`: 카드 gap 10→6, 카드 위 12→8, 바로가기 줄 8→4, 기준 바 위 4→0. 360+바로가기 줄: tight 로 해결, 이유 줄·일러스트 유지 |
| U6-09 | S6 핏·소재·신발 설명에 `userReasons()` 필터 | `s6Sheet.js` 3곳 |
| U6-10 | S3 세 장 dominant 태그가 같으면 숨김, S4 스타일 탭은 그룹과 같은 태그 제거 | `outfitCard({ tags, hideTag })`, `s3Result` `sameTag`, `s4More` `hideTag: style` |
| U6-11 | 코치마크 B 제거(평생 1개) | `s5Detail.js` 호출 삭제, `coach.js TEXT.fav` 삭제 |
| U6-12 | 카드·S5·공유·aria 캡션 **한 어휘** | `components.captionParts()` 가 항상 `catalog.cardName`(색 shortLabel + 품목 정식 라벨: "오트밀 울 니트 · 브라운 페니 로퍼"), `captionOf()` 추가. 공유 이미지는 받는 사람이 보는 유일한 문장이라 긴 쪽 채택. `engine.caption/itemCaption` 은 더 안 씀(엔진 itemName 은 데이터 어휘라 둘이 어긋났음) |
| U6-13 | 스타일 라벨 shortLabel("아이비") | `state.styleLabel()` → `labelField(rows, 'style', id, 'shortLabel')` |
| U6-14 | 같은 문서 해시 딥링크(S3 → `#/result/top/white`) | `s3Result.__update`: 그려 둔 base 와 다르면 `refresh()` |
| U6-15 | 설정에서 계절 세그먼트·앱 행 제거 | `settings.js`: 계절은 `계절 자동으로 되돌리기` 버튼 + `지금 봄가을 · 이번 달 기준` 캡션(자동이면 버튼 비활성) |
| U6-16 | 카피 6건 | `버튼을 누르면 설치 창이 떠요`(마침표 제거) · 코치마크 `톤별·변주는 여기에` · `카드의 하트를 누르면 여기에 모여요` · `시스템은 줄이지 않음` · 색상별 칩 `무채색`(`hueLabel` 이 " 조합" 제거) · 하의 캡션 `차콜 울 슬랙스`(`catalog.js BOTTOM_NOUN`: wool→울 슬랙스, flannel→플란넬 슬랙스, corduroy→코듀로이 팬츠 …) |
| U6-17 | 온보딩 스트립을 spacer 아래(힌트 바로 위)로, 3단계 부제 `톤별·색상별·변주` | `s1Category.js`. 375 실측: 스트립 y 404–552, 힌트 568(이전 빈 216px → 16px) |
| U6-18 | SH1 프라이버시 한 줄 항상 | `sheets.js shareSheet`: `기기 안에서만 만들어요`(iOS 홈 화면 앱은 저장 안내 뒤에 이어 붙임) |
| QA 보정 | axe·fit 실측에서 나온 것 | `.pill__cat` 색 text-3→text-2(선택 pill 위 4.5:1 미달), S5 상세 줄 `button[role=listitem]` → `role=group` 컨테이너(aria-allowed-role), `.s5__acc` `tabindex=0`(scrollable-region-focusable), `.s5__why` 한 줄 고정 + 태그 있으면 이유 1개(두 줄이면 기장 행이 24px 밀림), `.s5__acc/.detail flex-shrink 0`(소품 줄 찌그러짐), SH1 미리보기 280→240px(프라이버시 줄이 72dvh 안에) |
| 그레인 | overlay 제거(식별 불가), S5 svg 그레인 필터도 끔, 무대 조명(stage) 유지 | `main.js applyPrefs` opt-in 삭제, `base.css` 규칙 삭제, `tokens.css --grain/--grain-opacity` 삭제, `s5Detail grain:false` |
| 번들 | 확장 데이터·공유 모듈 지연 청크, v1 실루엣 삭제, v2 SVG 문자열 trim | 7-2 |

### 7-2. 번들 분할 (게이트 6)

- `src/ui/dataCore.js`(핵심 16개 JSON) + `src/data/expansion.js`(확장 10개 JSON 재수출 배럴). `main.js loadEngine()` 은 핵심 엔진으로 먼저 S1/S3 를 그리고, 첫 페인트 뒤 `requestIdleCallback`(1.5s 상한)에 `state.ensureExpansion()` → `createEngine({...core, ...expansion})` 로 엔진·카탈로그 교체(`state.setEngine`, 메모 비움). `app.js render` 는 S4·S5·공유 라우트에서 `state.expanded` 가 아니면 `ensureExpansion()` 을 기다렸다 그린다(SW 캐시 ≈ 수 ms). 적재 실패 시 핵심 엔진으로 계속(스타일 탭·소품 OFF).
- 핵심 엔진만으로도 classic 3장은 동일(`pickClassic` 은 확장 데이터를 쓰지 않음) → `classic.N` ref 유지. 첫 S3 의 카드에는 태그·벨트가 없을 수 있다(확장 적재 전) — 재렌더하지 않는다(스태거 반복 회피). `tests/ui/fixB.test.js` 가 core ∪ expansion === `src/data/index.js` 를 고정한다 → Fixer A 가 `index.js` 에 파일을 더하면 `dataCore.js` 또는 `expansion.js` 에도 더해야 한다(테스트가 알려줌).
- `share.js`(캔버스 레이아웃)는 SH1 을 열 때 `import()`.
- `vite.config.js trimSvgRaw` 플러그인: `src/assets/v2/*.svg?raw` 에서 주석·`aria-label`·`viewBox`·줄바꿈 제거(`<svg xmlns>` 래퍼만 유지 — `DOMParser` 네임스페이스 때문에 필요). v2 문자열은 UI 청크에 **한 번만** 포함(`morning-coordi v2` 주석 0건, `data-slot` 41건).
- `src/assets/silhouettes`(v1 27파일) 삭제. `scripts/build-asset-demo.mjs` 는 v1 폴더를 읽는 데모 생성기라 그대로 두었다(이제 v1 경로가 없어 **실행하면 실패** — 데모 재생성이 필요하면 AS 가 v1 분기를 떼야 함).

| 청크 (gzip) | 이전 (6-B FE 로그) | 이후 | 비고 |
|---|---|---|---|
| UI (`index-*.js`, src/ui + v2 SVG) | 41.19 | **40.59** | +fit/styleText/s4 재작성·직접 SW 등록, −share −SVG trim |
| 엔진 | 30.86 | 32.99 | Fixer A 작업분(이 로그 시점) |
| 데이터 핵심 `dataCore-*.js` | 43.74 (전체) | **34.49** | 첫 화면 경로 |
| 데이터 확장 `expansion-*.js` | – | 11.49 (지연) | S3 첫 페인트 뒤 유휴 시간 |
| 공유 `share-*.js` | – | 2.21 (지연) | SH1 열 때 |
| workbox-window | 2.36 | **0** | `virtual:pwa-register` 대신 `navigator.serviceWorker.register` 직접(`main.js`, `injectRegister: null`). 동작 동일: 새 SW installed + 기존 controller → 토스트, SKIP_WAITING 안 보냄(다음 실행 적용) — 패널에서 실증 |
| **첫 화면 경로 JS 합계** | 118.15 | **108.07** | 게이트 ≤ 120, 여유 **11.9 KB** |
| 전체 JS(지연 포함) | 118.15 | 121.77 | 청크 분할 오버헤드 ≈ +0.9, 엔진 +2.1 은 Fixer A |
| CSS | 8.14 | 8.10 | |
| precache | 665 KiB · 11 | 675 KiB · 12 | |

(수치는 2026-10-20 빌드. Fixer A 가 엔진·데이터를 계속 바꾸고 있어 최종 수치는 `phase6-qa.md` 표를 본다.)

### 7-3. 테스트

`tests/ui/fixB.test.js` 13개: 액세서리 크기 게이트(118/120/239 → 벨트·양말만, 240/300/400/920 → 전부), 오늘 라벨(ti 0·1·2, n 1·2·3, ti<0, 0장) + `classicOrder`·`todayIndex` 일치, `bannerDecision`·`guardStep` 순서(배너 아래 → tight → 미루기 → 컴팩트 → give-up), `labelField` 폴백(4+5, 느낌표·반말 0), `shortfallText`, `styleOccasionCards`(엔진 플래그 우선), `occasionChipIds`(3 + 더), 데이터 분할 동일성. `node --test "tests/ui/*.test.js"` 46/46 · `npm test` 130/130.

### 7-4. Fixer A 에게

1. `recommend(base, season, 'deep', {style, occasion})` 결과에 `shortfall: boolean`(최상위 또는 `applied.shortfall`) — UI 는 둘 다 본다. 없을 때의 임시 판정(relaxed 또는 < 3장)은 아메카지×출근처럼 "3장은 채웠지만 스타일이 안 맞는" 경우를 못 잡는다(실측: 1·3번 카드가 미니멀 태그).
2. `labels.ko style.ivy.label` 을 "아이비(클래식)" 등으로 바꿔도 UI 는 `shortLabel` 을 쓴다. `help` 가 비면 내장 폴백이 나간다(`styleText.js STYLE_HELP/OCC_HELP` — 데이터와 같은 문장으로 맞춰 둠).
3. `explain.achromatic` 라벨에서 " 조합" 을 떼면 `hueLabel` 의 정규식은 무해하게 그대로 둔다.
4. 데이터 파일을 추가하면 `src/ui/dataCore.js`(핵심) 또는 `src/data/expansion.js`(확장) 에 import 를 더해야 한다 — `tests/ui/fixB.test.js` 마지막 테스트가 실패로 알려준다.
