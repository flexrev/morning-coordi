# UI · 설정 수정 로그 — Phase 4 (Fixer B)

- 수정일: 2026-10-19 · 담당: Fixer B (UI·설정) · 근거: `docs/review/morning-usability.md`(P1-01…P1-18), `docs/review/pwa-qa.md`(P2-01…P2-14)
- 범위: `src/ui/**`, `src/styles/**`, `src/main.js`, `public/**`, `vite.config.js`, `.gitignore`, `README.md`. 엔진·데이터·스크립트·테스트는 Fixer A.
- 검증: `npm run build` 통과(precache 11 entries · 392.7 KiB), `npm test` 39/39, 헤드리스 Chrome(CDP, Android UA, DPR 2) **375×812 / 360×780 / 430×932 (+320×568)** 실측. 콘솔 오류·경고 **0건**.
- 스크린샷·실측 JSON: `docs/review/shots-fix-b/` (`report.json` 에 모든 `getBoundingClientRect` 값)

## 1. 수정한 항목

| ID | 무엇을 바꿨나 (파일) | 어떻게 확인했나 |
|---|---|---|
| **P1-01** / **P2-11** | 설치 배너를 한 줄로: 문구 + [설치/설치 방법] + ✕ 한 row, 높이 50px (`src/ui/install.js installBanner`, `app.css .banner*`, `.btn--sm`). 그래도 `cards.bottom > bottom.top` 이면 렌더 뒤 rAF 에서 배너를 **카드 아래**(`.banner--below`, spacer 앞)로 내리는 가드 (`s3Result.js`) | visits=2 강제 후 S3: 375 배너 y70–120, 카드 188–630 < 하단 671 ✓ · 360 카드 188–630 < 639 ✓ · 430 ✓. 최근 선택 3개까지 있는 2회차 상태에선 375·360 에서 배너가 카드 아래(y638)로 내려가고 카드 3장은 그대로 하단 위 ✓ (`04-s3-banner-*.png`, `05-s3-banner-recents-*.png`). 문서 높이 812/780 → 스크롤 없음 |
| **P1-02** | `catalog.colorsFor(category, season)` 재작성 (`src/ui/catalog.js`): ① 베이스 규칙 있는 색(`engine.index.hasBaseRule`) 먼저 — 현재 계절 포함 색 우선, 그 안에서 `engine.index.baseColors(category)` 순서(클래식 조합 수 내림차순) ② 역참조 색은 계절 → 점수 → 톤 순. 엔진 헬퍼가 없으면 `data.colorRules` 에서 직접 셈(폴백). `createCatalog(data, engine)` 으로 엔진 전달 (`src/main.js`). **상한 = min(16, max(12, 베이스 규칙 색 수))** — 베이스 규칙 색은 절대 잘리지 않음 | 하의 봄가을: `올리브, 인디고, 네이비, 베이지, 화이트, 크림, 브라운, 미드그레이, 카키, 차콜, 블랙데님, 연청, 블랙` 13칩(연청=lightDenim 복귀, 인디고 2번째). 상의·아우터 12, 신발 8. 그리드 실측 360 폭: y 384–772, 높이 388px(4행, 칩 82px) = 화면 하단 51% (P1 이 수용한 값 그대로) |
| **P1-03** | 사용자용 설명 필터 한 함수 `userReasons()` (`src/ui/components.js`): `N/5`, `출처 N`, `규칙 없음`, `격식 차이`, `N단계`, 영문 키, 미치환 `{x}` 제거 + 끝의 `(+1)/(−1)` 삭제. `cardReason`(S3) · `detailReasons`(S5) 가 이것만 쓴다. S6 시트는 기술 설명 유지(지시대로) | S3 이유 줄: "누구나 안전한 기본 조합 / 네이비 베이스+어스톤 조합 / 톤온톤 (네이비 베이스)". S5 `.s5__why` "누구나 안전한 기본 조합". 점수 문자열 0건 |
| **P1-07** | S4 톤·색상 칩 (`s4More.js`): 데이터 있는 그룹만, `TONE_ORDER` 고정, **1개면 칩 줄 생략**, 0개면 `moreTab()` 이 색상별→변주로 기본 탭 전환(S3 '더 보기' 버튼·`app.js` 딥링크 모두). 빈 탭은 `disabled` + 흐림 + "없음" | 인디고 톤별: 칩 2개(네이비 베이스·포인트 컬러) 줄 표시, 카드 5장. 현재 엔진(Fixer A 수정 후)은 132 베이스 전부 톤 그룹 ≥1·클래식 3장이라 0개 경로는 코드로만 확인(런타임 재현 불가) |
| **P1-08** | 최근 선택 pill 항상 "카테고리 · 색"(`.pill__cat` 작은 글자) · 탭해도 순서 유지: `selectBase(r, { keepOrder: true })` (`state.js`, `s3Result.js`) | pill 3개 "하의 · 인디고 / 신발 · 화이트 / 상의 · 화이트", 3번째 탭 후에도 순서 동일, 기준 바만 교체 ✓ |
| **P1-09** | `.s5__ill { height: min(40dvh, 440px); width: auto; max-width: 60%; aspect-ratio: 1/2 }` (`app.css`) | 상세 4번째 줄(기장) 하단: 375→796/812, 360→764/780, 430→916/932. 문서 높이 = 뷰포트(스크롤 없음) (`09-s5-classic1-*.png`) |
| **P1-10** | `.chip__label` 말줄임 → 2줄 접기(`white-space: normal; line-clamp 2`), `.chip { min-width: 0 }` (`app.css`). 라벨 5자 이하 데이터는 Fixer A | 360·375·430 하의·상의 2줄 칩 0개(연청·멜란지 등 단축 라벨 적용됨). 320 폭에서만 라이트블루·라이트그레이 2줄, 말줄임 없음 |
| **P1-11** | 카드 캡션 `catalog.cardName()` 신설: 색 shortLabel + 품목 **정식 라벨(띄어쓰기 유지, 괄호 제거)**, 품목명이 색을 담으면 품목만("인디고 데님", "흰 스니커즈"). `captionParts(short)` 가 이것을 씀. `shortName` 은 테스트·검증용으로 그대로. `.card__cap` 3줄 허용, 3줄이면 이유 줄 숨김(rAF) (`catalog.js`, `components.js`, `app.css`) | 캡션 "화이트 티셔츠 · 인디고 데님 · 흰 스니커즈", "멜란지 맨투맨 · 인디고 데님 · 흰 스니커즈 · 네이비 셔츠 재킷"(2줄). 통합 테스트 `shortName === '흰스니커즈'` 유지 → 39/39 |
| **P1-12** | `.card__reason` 13px(`--fs-chip`) + `--text-2`(8:1) | 카드 높이 142 유지(이유 줄 18px) |
| **P1-13** | S4 탭 바를 하단 고정 `.bottom--tabs` 로 이동(S3 '더 보기'와 같은 자리), 선택 표시는 윗선 (`s4More.js`, `app.css`) | 탭 y 757–812(375) / 725–780(360) / 877–932(430), 칩 줄은 상단 y56 유지 (`06-s4-tone-*.png`). ※ ux-flow 3-1 "탭 바 상단"과 어긋나므로 D1 문서 갱신 필요 |
| **P1-14** | S1→S2 `nav.replace`, S2 칩 선택 → `nav.back('/result')`(S3 에서 열었으면 pop, 첫 실행이면 replace). 라우터가 `history.state.depth` 로 앱 항목 수를 세어 `history.length` 의존 제거 (`s1Category.js`, `s2Color.js`, `nav.js`) | 첫 실행 S1→하의→인디고 후 `history.state = {mc, depth:0}`, `#/result` 한 항목 → 시스템 뒤로 한 번에 앱 밖. S3→색 바꾸기→선택은 pop 으로 S3 복귀(항목 누적 없음) |
| **P1-15** | 배너가 `state.subscribe` 로 `installPrompt` 도착 시 버튼을 [설치]로 교체, 배너가 DOM 에서 빠지면 구독 해제 (`install.js`) | 헤드리스 Android 에서 배너 버튼 "설치"(이벤트가 렌더 전에 와도·뒤에 와도 동일) |
| **P1-16** (UI 몫) | S6 신발 시트 제목 "신발 스타일" 한 줄, 하의 정보는 본문 첫 줄 · 개발자 메모 fallback 문장 삭제 (`s6Sheet.js`) · S5 소재 "민무늬" → "소재 정보 없음" (`s5Detail.js`) · 색·품목 라벨의 괄호 보충("카키(베이지 계열)", "블루종(MA-1·해링턴)", "보색(탁한)")을 화면·aria 에서 제거하는 `catalog.plain()` (기준 바·pill·칩 aria·색 점 aria·S4 색상 칩) | S6 제목 "신발 스타일", 본문 1행 "인디고 데님 · 스트레이트 · 노브레이크". 조사 오류·avoid 문구·itemCaption("연청 워시드데님")은 엔진/데이터 → Fixer A |
| **P1-18** | 클래식 < 3 이면 변주(점수순, 중복 제외)로 채우고 라벨 "변주" (`s3Result.js`) | 현재 엔진은 전 베이스 클래식 3장이라 코드 경로만 확인. `#/result/top/beige` 카드 3장 ✓ |
| **P2-01** | `--chip-border` 라이트 `.14 → .42`(2곳), 다크 `.28 → .40` (`tokens.css`) | 라이트 S2 실측 `rgba(0,0,0,0.42)` — 화이트·크림 칩 테두리 보임 (`11-s2-light-*.png`, `12-s2-light-top-*.png`) |
| **P2-02** (manifest 몫) | `icon-192`·`icon-512` 에 `"purpose": "any"` 명시 (`public/manifest.webmanifest`) | `dist/manifest.webmanifest` 확인. 그림을 85% 로 키운 any 변형 래스터화는 `scripts/make-icons.mjs` → Fixer A |
| **P2-03** | `includeAssets` 삭제 (`vite.config.js`) | 빌드 로그 precache **16 → 11 entries** |
| **P2-04** | `.sheet__close { flex: 0 0 var(--tap-min) }`, `.sheet__title { min-width: 0 }` (`app.css`) | S6 신발 시트 ✕ 48×48 (375/360/430) |
| **P2-05** | `.seg__opt { min-height: 48px }` | 상단 계절 세그먼트 가시 높이 48 |
| **P2-06** | `topbar()` 제목을 기본 `h1` 로, S1 만 `heading:'div'`(히어로 h1 유지) (`components.js`, `s1Category.js`) | 각 화면 h1 정확히 1개: S1 "오늘 입을 옷…", S2 "하의 색은?", S3 "아침 코디", S4 "더 보기" |
| **P2-07** | `.chip { min-width: 0 }` | 320×568 상의 그리드 `scrollWidth 320 = innerWidth` (가로 스크롤 없음, `14-s2-top-320.png`) |
| **P2-08** | `sheet()`: 닫힘 경로 전부(스크림·✕·Esc·뒤로)에서 keydown 리스너 제거, Tab 포커스 트랩, 열었던 버튼(`data-focus-key`)으로 포커스 복귀(`takeFocusRequest` → `app.js render` 끝) (`components.js`, `app.js`, `s5Detail.js`, `install.js`) | 코드 검토 + Esc 닫기 경로 동작. 키보드 실기기 검증은 없음 |
| **P2-09** | `.gitignore` 에 `!.env.production` | `.env.production`(VITE_USE_MOCK=false) 이 무시 목록에서 제외됨 |
| **P2-10** | 결정: **저장소 `.claude/launch.json` 이 정본**(dev 5173 · preview 4173). 상위 `CODE/.claude/launch.json` 은 이 세션이 실제로 읽는 파일이라 삭제하지 않고 `npm --prefix morning-coordi …` 포인터로 유지. README 에 "설정은 저장소 것만 고친다" + preview 포트 이동 안내 추가 | `preview_start "preview"` 가 상위 설정으로 4176 포트 서버를 재사용함을 확인 |
| **P2-12** | `public/screenshots/s3-375.png`(375×812, DPR 1, **46.6 KB**) + manifest `screenshots[0]` `form_factor: "narrow"`. 스크린샷은 `globIgnores` 로 precache 에서 제외 (`vite.config.js`) | `dist/manifest.webmanifest` 항목 확인, `dist/sw.js` 에 screenshots 없음, precache 11 entries 유지 |
| **P2-13** | `.bottom` 이 없는 화면(S2·S5)에서는 `.toast--low`(하단 +8px) (`components.js toast`, `app.css`) | 코드 검토 |

## 2. 보류·이관

| ID | 이유 |
|---|---|
| P1-04 · P1-05 · P1-06 · P1-17 | 엔진 선정·그룹 로직 (`src/engine`) → Fixer A |
| P1-16 (엔진·데이터 몫) | "초콜릿는" 조사, avoid `reason` 동사형, "연청 워시드데님"·"네이비 컬러스니커즈" 캡션, "맨투맨/스웻셔츠" 라벨 → Fixer A (`explain.js`, 데이터, `labels.ko.json`) |
| P2-02 (아이콘 그림) | `scripts/make-icons.mjs` 소유 밖. manifest 쪽만 반영 |
| P2-11 (노출 규칙) | 결정: 사양을 "닫기 전까지 유지"로 확정(배너가 50px 한 줄·비모달이 되어 매 실행 노출이 방해가 되지 않음). `shouldShowBanner()` 로직은 바꾸지 않음. `install.test.js` 작성 시 이 기대값으로 고정 |
| P2-14 | 수용(CSS 19.6 KB, gzip 4.6 KB). 인라인 안 함 |
| P1-13 문서 | 탭 바 하단 이동으로 ux-flow 3-1 과 불일치 → D1 이 문서 갱신 |

## 3. 참고 수치 (report.json)

- S2 칩 상한: 12 기본, 베이스 규칙 색 수만큼 최대 16. 하의 13칩(4행) 그리드 높이 388px, 360×780 에서 y 384–772 (하단 51%), 375 에서 y 416–804, 430 에서 y 520–924.
- S3 (배너 없음): 카드 y 130–572 (375·360), 하단 영역 671/639 → 여유 99/67px.
- S3 (배너 2회차): 배너 50px, 카드 188–630 → 여유 41/9px (375/360). 최근 선택 줄까지 있으면 배너가 카드 아래로.
- 배너 ✕ 48×48, [설치] 40px 가시 + ::after 로 48px 탭 영역.
