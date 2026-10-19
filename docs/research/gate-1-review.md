# Phase 1 게이트 검토 — 리서치 산출물

검토일: 2026-10-19 · 검토자: 총괄(PM)
대상: `color-rules.md`(960줄), `style-rules.md`(879줄), `references.md`(459줄)

## 1. 게이트 기준 대비 결과

| 기준 (계획서 4절) | 목표 | 실제 | 판정 |
|---|---|---|---|
| 색 조합 페어링 수 | ≥ 60 | 380 (하의 기준 255 + 상의 기준 125), 전부 score·tag·출처 코드 포함 | 통과 |
| 소재 매트릭스 | 완성 | 13×13 대칭 행렬 + 소재 15종 상세(pairsWith/avoid/seasons) | 통과 |
| 신발 규칙 | ≥ 7종 | 11종, 신발별 6~12행 + 바지 기장 44행 | 통과 |
| JSON으로 옮길 수 있는 구체성 | — | 두 문서 모두 "데이터 변환 메모" 절에서 표→스키마 매핑과 점수 합산식까지 제시 | 통과 |
| 레퍼런스 | — | 앱/사이트 12개 비교, 일러스트 방식 비교, PWA 체크리스트 15항목, 결정 제안 12개 | 통과 |

**판정: 통과. Phase 2(설계) 진입 가능.**

## 2. 문서 간 정합성 — Phase 2에서 반드시 맞출 것

| # | 문제 | 어디서 | 조치 담당 |
|---|---|---|---|
| 1 | **ID 표기법 불일치**: R1 색 id는 camelCase(`lightGrey`, `greyMelange`), R2 소재·신발 id는 snake_case(`denim_indigo`, `sneaker_white`) | color-rules 1장 vs style-rules 0장 | C1이 스키마 확정 시 한 가지로 통일. 기본안: **camelCase** (JS 친화) → R2 id를 `denimIndigo`, `sneakerWhite`로 변환 |
| 2 | **R1 코디 예시의 신발이 자유 텍스트** ("brown 부츠", "brown 로퍼") → R2 신발 id(`workboot`/`chelsea`/`chukka`, `loafer_penny`/`loafer_tassel`)로 매핑 필요 | color-rules 7장 | C2가 변환 시 수동 매핑. "부츠"는 문맥상 chukka(데저트)·chelsea 우선, 겨울은 workboot |
| 3 | **R1 예시는 색만, R2 예시는 핏·소재만** → 두 예시 세트를 하나의 `outfit` 레코드로 합치려면 조인 작업 필요 | 양쪽 7장 | C2. 겹치는 조합(흰 티+인디고+흰 스니커즈 등)은 하나로 병합, 나머지는 기본값(regular 핏, nobreak) 보충 |
| 4 | **계절 표기**: R1은 "연중/봄가을/여름/겨울" 한글, R2는 `spring_fall/summer/winter` id. "연중" = 세 계절 전부 | color-rules 6·7장 | C2 변환 시 매핑 |
| 5 | **"카키" 용어 혼동**: 한국어 카키는 올리브를 뜻하는 경우가 많음. R1은 khaki=황갈색 치노색으로 고정 | color-rules 1장 | 팀5 labels에서 UI 표기를 "카키(베이지 계열)"로 보조 설명, 올리브는 "올리브/카키그린" 병기 |
| 6 | **스키마 추가 필요**: R2가 계획서에 없던 `lengthRule`, `outerRule`, `formality`, `adjust[]`, `layerRule` 제안 | style-rules 9장 | 계획서 5절 스키마에 반영(아래 3절). C1이 최종 확정 |
| 7 | **hex 근사값** 7개(오트밀, 그레이멜란지, 인디고, 라이트워시, 네이비, 블랙데님, 더스티핑크)는 표준 없음 | color-rules 1장 | D2 토큰 단계에서 실제 의류 톤에 맞게 조정. `hexSource: approx` 플래그 유지 |
| 8 | **출처 갈림 항목** R1 8장 15건, R2 4-3·10장 6건 (네이비+블랙, 데님+블랙구두, 와이드+신발 폭, 린넨 계절 등) | 양쪽 | JSON에 `flags:["disputed"]` → P3 콘텐츠 검토 때 재확인 |

## 3. 계획서에 반영하는 수정

1. **일러스트 방식 확정**: 플랫 SVG 단일 토르소 실루엣 + CSS 변수 색 주입, 단색 fill만, 소재는 `<pattern>` 오버레이, path 35개 이내. (R3 4-3절) → 미결정 사항 3번 해소
2. **Quick 경로 2탭으로 고정**: 카테고리 → 색 칩 → 결과. 홈 = 마지막 선택의 결과 화면. (R3 결정 제안 1~2)
3. **Lighthouse PWA 카테고리는 11.2/12.0에서 삭제됨** → Phase 4 게이트의 "Lighthouse PWA 통과"를 "DevTools Application 패널 체크 + 실기기 오프라인 실행"으로 교체. R3 5절 체크리스트 15항목을 C1 완료 기준(DoD)으로 채택
4. **iOS 방어 규칙** 추가: apple-touch-icon 180px, `viewport-fit=cover`, safe-area-inset 폴백(iOS 26.1 회귀), 설치 안내 배너(공유 → 홈 화면에 추가 3단계 그림)
5. **호스팅**: 빌드는 호스팅 비의존(Vite 정적). R3 권장은 Cloudflare Pages, 계획서 기본안은 GitHub Pages. Phase 5에서 결정해도 늦지 않으므로 **미결정 유지(비차단)**. 저장소는 GitHub
6. **점수 엔진**: R1 9-4(색) + R2 9장(스타일) 합산식을 C2가 하나로 통합. 권장 가중치 w_fit 1.0 / w_len 0.7 / w_mat 1.0 / w_shoe 1.0 / w_season 1.5 + 색 점수. 포멀도 격차 ≥5 차단, 4 경고
7. **MVP 제외 확정**: 체형 보정(R2 1-3), 퍼스널컬러(R1 갭 6), 배기/벌룬 핏(R2 갭 2) → 2차

## 4. 리서치 갭 (수용, 비차단)

- Permanent Style·MR PORTER·Lookastic 본문은 봇 차단으로 직접 못 읽음. 핵심 주장은 복수 검색 결과로 교차 확인됨
- 국내 남성 바지 기장 cm 수치, 아침 옷 고르는 시간 정량 자료 없음 → UI에 수치 노출 안 하므로 영향 없음
- Noun Project·Figma Community 자산 라이선스 미확인 → 외부 자산 안 쓰고 자체 제작하므로 영향 없음

## 5. Phase 2 투입 계획

병렬 3개:
- **D1 UX 설계** ← references.md 3절·결정 제안 1~5, 계획서 2-1
- **D2 비주얼/UI** ← references.md 4절(일러스트), color-rules.md 1장(32색 hex), 결정 제안 6~8
- **C1 아키텍트** ← 양쪽 "데이터 변환 메모", 본 문서 2·3절(ID 통일, 스키마 추가), references.md 5~6절(PWA·호스팅)

게이트: Quick 경로 ≤ 3탭(목표 2탭), Deep ≤ 6탭, 스키마 확정, 디자인 토큰 확정.
