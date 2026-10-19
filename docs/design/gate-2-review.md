# Phase 2 게이트 검토 — 설계 산출물

검토일: 2026-10-19 · 검토자: 총괄(PM)
대상: `design/ux-flow.md` + `wireframes.html`, `design/design-tokens.md` + `src/assets/silhouettes/`(27 SVG) + `silhouette-demo.html` + `app-icon.svg`, `architecture/tech-stack.md` + `data-schema.md` + `engine-spec.md` + 프로젝트 뼈대

## 1. 게이트 기준 대비 결과

| 기준 | 목표 | 실제 | 판정 |
|---|---|---|---|
| Quick 경로 탭 수 | ≤ 3 (목표 2) | 2 (첫 실행) / 0 (재방문 같은 아이템) | 통과 |
| Deep 경로 탭 수 | ≤ 6 | 최대 5 (화면 전환 체인 S3→S4→S5→S6 = 4) | 통과 |
| 데이터 스키마 확정 | 확정 | 16개 JSON 정의 + 예시 레코드 + 검증 규칙 V-01~V-22, gate-1의 정합성 항목 2·3·4 해결 | 통과 |
| 디자인 토큰 확정 | 확정 | 다크/라이트 토큰(대비비 계산 포함), 타이포, 32색 조정표, 칩 스펙, 소재 패턴 6종 | 통과 |
| 일러스트 자산 | path ≤ 35 | 27 파일 / path 28, 데모에서 120px·60px 가독 확인 | 통과 |
| 뼈대 빌드 | 빌드 성공 | PM이 직접 재확인: `npm run build` 성공(precache 14항목 16.8KiB), `npm test` 1 pass | 통과 |

**판정: 통과. Phase 3(MVP 구현) 진입 가능.**

## 2. 교차 검토에서 발견한 불일치 — Phase 3 착수 시 바로 맞출 것

| # | 문제 | 결정 | 담당 |
|---|---|---|---|
| 1 | **CSS 변수명 불일치**: C1 뼈대 `tokens.css`는 `--bg`, `--surface-1`, `--text-muted`, `--space-N`, `--color-<id>`; D2 확정 토큰은 `--bg-0/1/2`, `--text-1/2/3`, `--sp-N`, `--g-<색id>`, `--c-top/bottom/shoes/outer` | **D2 이름이 정본.** `tokens.css`를 design-tokens.md 값으로 통째 교체. data-schema.md의 폴백 참조는 `--g-<id>`로 수정 완료 | C3 (Phase 3 첫 작업) |
| 2 | **실루엣 파일 ↔ 품목 id 매핑 없음**: 신발 SVG 8종 vs shoes enum 11종(sneakerWhite·sneakerColor→sneaker, loaferPenny·loaferTassel→loafer(+tassel detail), derby·oxford→derby), topTypes 16 → 상의 실루엣 5종, outerTypes 16 → 아우터 4종. `index.json`에 매핑 없음 | `src/engine/constants.js` 또는 `silhouettes/index.json`에 `typeToLayer` 표 추가. 매핑 없는 품목은 가장 가까운 형태로 폴백(예: 탱크→tee, 가디건→knit) | C3 |
| 3 | **localStorage 키 이름**: D1 제안(`lastSelection`, `recents`, `visitCount`…) vs C1 확정(`mc.v1.last`, `mc.v1.recent`, `mc.v1.install{visits,dismissedAt}`) | **C1 키가 정본.** D1 문서의 이름은 개념명으로 간주 | C3 |
| 4 | **폰트**: D2는 Pretendard를 jsDelivr CDN 동적 서브셋으로 1순위 → 오프라인 PWA 원칙과 충돌 | MVP는 **시스템 폰트 스택만**(`-apple-system, system-ui, Roboto, "Noto Sans KR"`). Pretendard는 2차에 셀프호스팅 서브셋으로 검토 | C3 |
| 5 | **아이콘**: `public/icons/*.png`는 C1의 단색 임시본, D2의 `app-icon.svg`는 래스터화 안 됨 | Phase 3에서 sharp로 192/512/maskable/180 PNG 생성 (`scripts/make-placeholder-icons.mjs` 확장) | C1 |
| 6 | **색 hex 이중 관리**: 데이터 `colors.json`은 R1 원본 hex, 화면은 D2 조정 hex(`--g-<id>`) | 의도된 설계(출처 보존 + 표시 조정). 단, `silhouette-demo.html`·칩은 반드시 토큰값 사용. P3 검토 시 두 값을 나란히 보는 표 제공 | C2·P3 |

## 3. D1의 질문 8개에 대한 결정

| # | 질문 | 결정 |
|---|---|---|
| 1 | 신발·아우터 기준 데이터가 없음 (R1은 하의 12·상의 10 베이스만) | **역참조로 활성.** 엔진이 colorRules를 뒤집어 "신발 색 X가 match인 베이스" 인덱스를 만든다(engine-spec 조회 인덱스 확장). P3 검토에서 품질 미달이면 두 버튼을 "곧 추가"로 비활성 |
| 2 | 클래식 3개 선정 규칙 | score 5 → universal 우선 → **서로 다른 톤 그룹** → **신발 색 최소 2종** (셋 다 흰 스니커즈 방지). engine-spec Quick 모드에 조건 추가 |
| 3 | 계절 기본값·저장 키 | 현재 월 자동 + 사용자 변경 우선 수용. 키는 C1 `mc.v1.*` 사용 |
| 4 | 라우터 없이 시스템 뒤로가기 | 가능. `history.pushState` + `popstate` 핸들러로 S2/S4/S5/S6를 스택에 쌓고 뒤로가기로 시트·탭 닫기. 라우터 라이브러리 불필요 |
| 5 | 96×120 컴팩트 카드 가독성 | D2 데모에서 120px·60px 모두 판독 확인 → **가로 카드 유지**, 스크롤 없이 클래식 3개 노출 |
| 6 | 색 칩 그리드가 하단 40%에 안 들어감 | **4열 × 52px 칩 + 이름 1줄(짧은 이름 ≤ 6자)**. 12칩 = 3줄 ≈ 230px로 하단 40%(약 337px) 안에 들어감. `labels.ko.json`에 `shortLabel` 필드 추가(팀5) |
| 7 | 출처 갈림 표시 | D2 토큰 따름: `⚑` 글리프 + `--warn`(저채도 황색), 피하기는 `--danger`. 접근성 라벨 "의견 갈림" |
| 8 | 캡션 길이 | 허용. 품목명에 소재가 이미 있으면(옥스포드·치노·데님) 소재 생략. 예: "흰 티 · 인디고 데님 · 흰 스니커즈". 규칙은 `explain.js` 캡션 생성기에 반영 |

## 4. C1의 스키마 이탈 결정 13건 — 전부 수용

특히 영향이 큰 것: `topTypes`/`outerTypes` enum 신설(포멀도·아우터 규칙이 품목 단위), outfit id 충돌 해소(`c##`/`s##` → 병합 후 `o##`), `material: null` 허용, labels id 네임스페이스(`fit.bottom.regular`), 3색 패널티를 `adjust.json`으로 일원화, 엔진 상수는 `constants.js`. 유사색 그룹 확장(5번)은 P3 확인 대상으로 플래그 유지.

## 5. Phase 3 투입 계획

순서가 있는 작업이라 **직렬 2단 + 병렬 1**:

```
3-A  C2 데이터 엔진 ──── 리서치 표 → 16개 JSON + validate 통과 + 엔진 함수 구현(스텁 교체) + 테스트 E-01~E-20
3-B  C3 UI/일러스트 ─── (3-A와 병렬 시작 가능) tokens.css 교체, 실루엣 렌더러(typeToLayer), 화면 S1~S6+O1, 더미 데이터로 먼저 조립
3-C  C1 통합·PWA ────── 3-A·3-B 합류 후: 실데이터 연결, pushState 내비, 설치 배너, 아이콘 래스터, PWA DoD 15항목 체크
```

게이트: 핸드폰에서 홈화면 추가 후 오프라인으로 열리고, 인디고 데님 → 클래식 3 조합이 그림과 함께 2탭 안에 나오는가.
