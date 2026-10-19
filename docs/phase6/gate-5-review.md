# Phase 6 게이트 5 검토 — 컨셉·탐색(6-A)

검토일: 2026-10-19 · 검토자: 총괄(PM)
대상: `ad-concepts.md` + `concept-{a,b,c}.html` + `concept-overview.html`, `asset-system.md` + `src/assets/v2/`(24 SVG) + `asset-demo.html`, `content-expansion.md` + `content-expansion-data.md`, `ux-enhancement.md` + `motion-spec.md` + `ux-wireframes-v2.html`

## 1. 게이트 기준 대비 결과

| 기준 | 결과 | 판정 |
|---|---|---|
| 비주얼 시안 2~3안 | 3안(A 에디토리얼 미니멀 / B 스튜디오 다크 / C 소프트 라이트). S3·S2 모두 844px 안, 다크 본문 대비 15~18:1, 터치 타깃 충족 | 통과 — **사용자 선택 대기** |
| 자산 v2 프로토타입 가독성 | 24 레이어·89 path·25.8KB(예산 120KB), 오류 0. 데모에서 v1 대비 비례·디테일·음영이 뚜렷이 개선, 120px에서도 판독 | 통과 |
| 확장 스키마 확정 | 스타일 8(1차 4), affinity 1,008 가중치, 상황 5, 액세서리 규칙 32, 패턴 규칙 19, 레이어링 18. 표가 기존 파서(`readTable`)로 파싱 확인. 검증 규칙 V-23~V-33, 테스트 E-21~E-32 설계 | 통과 (PM 결정 3건 아래) |
| UX·모션 스펙 | 새 표면 9개, Quick 2탭·홈 스크롤 0 유지 증명, 모션 토큰·상호작용 17개·reduced-motion, iOS 18+ View Transitions 지원 확인(폴백 포함) | 통과 |

**판정: 통과. 비주얼 방향 선택 후 6-B 구현 진입.**

## 2. PM 결정

| # | 결정 | 내용 |
|---|---|---|
| 1 | **비주얼 방향** | 사용자 선택. AD 권고 B(스튜디오 다크) + A의 타이포 위계·액센트 3곳 제한 차용. PM도 B 지지: 실루엣을 안 움직이고 "조명"으로 다이나믹을 만들고, 기존 토큰 값 조정만으로 전환 가능 |
| 2 | CX D-1 스타일 가중 위치 | **채택**: `scoreOutfit()` 불변, `recommend()`에서 `K_STYLE 0.5 × styleNorm`로 재정렬만. Quick은 스타일을 명시적으로 골랐을 때만 영향. 1차 범위 minimal·bizcasual·ivy·amekaji |
| 3 | CX D-2 상황 프리셋 | **채택**: 창 밖 감점(−0.3/아이템, 하한 −0.9) + avoid 제외, 3장 미만이면 단계 완화 → 항상 3장. 수트 품목은 2차 |
| 4 | CX D-3 미드 레이어 | **채택**: 5번째 카테고리 `mid`(0~1개), `layer` 축 0.7은 mid 있을 때만. Quick은 mid 없는 카드만 |
| 5 | 자산 v2 계약 변경 | **채택**: `<g data-slot …>` + `data-part=main/shade/detail/shadow`, 색 변수 `--c-hair/sole/metal/belt/…`. v1은 6-B 완료 후 삭제 |
| 6 | 실사/사진 자산 | **도입 안 함**(계획 4-3 기본안 유지). 벡터 v2로 충분한 수준 확인 |
| 7 | 폰트 | Pretendard Variable **셀프호스팅 서브셋**(OFL) 도입 검토를 6-B QA 항목으로. 프리캐시 증가분 ≤ 300KB면 채택 |

## 3. 교차 검토에서 발견한 것 — 6-B 착수 시 반영

| # | 문제 | 조치 |
|---|---|---|
| 1 | AS가 `.claude/launch.json`을 덮어씀 | git에서 복구 완료 |
| 2 | 자산 v2에 polo·slim 하의·running/workboot/chukka/sandal·v1 패턴 일부 미제작 → 임시 폴백 매핑 | 6-B AS가 누락 레이어 제작(2차 아님, 1.1 범위). 폴백은 제작 전까지만 |
| 3 | UX 스펙은 CX 문서 전에 작성 → 스타일/상황 데이터 계약(`result.byStyle/byOccasion`, `candidate.tags`)을 슬롯으로만 설계 | FE가 CX 7절 시그니처(`recommend(base, season, mode, {style, occasion, accessories})`)에 맞춰 통합. 불일치 시 CX 문서 우선 |
| 4 | 시안 HTML의 카드 등장 애니메이션 때문에 정적 캡처가 중간 프레임을 찍음 | 캡처 시 `--virtual-time-budget` 사용. 실제 앱에는 영향 없음 |
| 5 | 모션: `app.js` 렌더 구조를 "밑 화면 키 재사용 + 시트 추가/제거"로 바꿔야 시트 닫힘 모션 가능 | FE 첫 작업. `nav.back → 재렌더` 구조 변경은 회귀 위험 → 통합 테스트 먼저 보강 |
| 6 | 즐겨찾기·공유·설정 등 새 표면 + 스타일 탭 추가로 S4·S5 높이 증가 | P1-09 재발 방지: S5 일러스트 36dvh, QA 실측 항목 |

## 4. 6-B 투입 계획

```
6-B-1 (병렬)  AS 자산 v2 완성(누락 레이어·패턴·아이콘)  ∥  CX 데이터·엔진 확장(styles/occasions/accessories/patterns/mid, 빌드 파이프라인·검증·테스트)
6-B-2         FE 비주얼 리뉴얼(선택 시안 토큰·컴포넌트) + 모션(motion.js·View Transitions) + 새 표면(오늘의 추천·즐겨찾기·공유·온보딩·설정·스타일 탭) + 자산 v2 렌더러
6-B-3 (병렬)  QA 성능/접근성/reduced-motion/저사양  ∥  P3 콘텐츠 재확인(4기준 + 스타일 태그 분포)
게이트 6: Quick 2탭 · Lighthouse 성능 ≥95 · reduced-motion · 콘텐츠 4기준 PASS · gzip JS ≤120KB
```
