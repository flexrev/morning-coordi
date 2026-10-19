# Phase 6 — 모션 스펙 (v1.1)

작성일: 2026-10-19 · 담당: UX 경험 강화 · 구현: FE 모션/구현(6-B) · 검증: QA 성능/접근성
근거: `ux-enhancement.md` 1장(원칙)·2장(IA), `src/styles/tokens.css`(`--motion-fast 120`·`--motion-sheet 200`), `src/styles/app.css`(`.chip:active`·`.sheet` `sheet-up`·`.toast`), `src/ui/nav.js`(`go`/`replace`/`back`/popstate), `src/ui/app.js`(`render` → `root.replaceChildren`), `docs/design/ux-flow.md` 7장("결과 전환 100ms 이내, 애니메이션 150ms 이하, reduced-motion 시 전부 끔")
기존 규칙과의 차이: ux-flow 7장 "150ms 이하"를 **화면 전환 320ms·등장 400ms 까지** 완화한다. 단 **결과(첫 카드 캡션)가 보이는 시점은 여전히 100ms 안**이어야 한다 — 전환이 길어지는 게 아니라, 결과가 이미 그려진 **위에** 모션이 얹힌다(2-3절 "첫 프레임 규칙").

---

## 1. 모션 원칙

1. **설명하는 움직임만**: 방향(어디로 가는가), 출처(무엇에서 나왔는가), 변화(무엇이 바뀌었는가) 셋 중 하나를 말하지 않는 모션은 없다.
2. **결과가 먼저, 모션은 그 위에**: 새 화면의 내용은 첫 프레임에 완성된 상태로 존재한다. 모션은 `opacity`·`transform` 만 바꾼다. 중간에 레이아웃이 바뀌거나 글자가 나중에 나타나는 일이 없다.
3. **짧게, 감속으로**: 들어오는 것은 빠르게 시작해 천천히 멈추고(emphasized), 나가는 것은 더 짧고 가속한다(exit). 300ms 를 넘는 것은 화면 전환·공유 요소뿐.
4. **같은 자리면 같은 모션**: 하단 고정 영역(더 보기·탭 바·S5 버튼 줄)은 화면이 바뀌어도 **움직이지 않는다** — 손가락이 기억하는 자리를 지킨다.
5. **어두운 방 안전**: 흰 플래시·밝은 스크림·밝은 스켈레톤 금지. 전환의 모든 프레임이 `--bg-0` 톤.
6. **줄이기는 끄기가 아니다**: reduced motion 에서도 상태 변화는 80ms 불투명도로 알린다. 이동·크기·스태거·공유 요소·햅틱만 없앤다.
7. **GPU 에서만**: `transform`·`opacity` 외의 속성 애니메이션 금지(`height`·`top`·`box-shadow`·`filter` 포함). 유일한 예외는 View Transitions 의 그룹 박스(UA 가 합성 레이어에서 처리).

---

## 2. 토큰

`tokens.css` 의 `--motion-fast`·`--motion-sheet` 를 아래로 **대체**한다(기존 두 이름은 별칭으로 1버전 유지).

### 2-1. 토큰 표

| 토큰 | 값 | 쓰는 곳 | reduced-motion 값 |
|---|---|---|---|
| `--dur-fast` | 120ms | 칩·버튼 프레스, 하트 팝 1단, 토스트 나감 | 0ms |
| `--dur-base` | 200ms | 시트 열림, 세그먼트·탭 슬라이드, 선택 링 | 0ms (불투명도 전환은 `--dur-fade`) |
| `--dur-slow` | 320ms | 화면 전환(앞으로), 공유 요소 모프 | 0ms |
| `--dur-enter` | 400ms | 카드 등장(스태거 포함 총 길이), 배너 슬라이드 | 0ms |
| `--dur-fade` | 80ms | reduced-motion 에서 허용되는 유일한 전환(불투명도) | 80ms |
| `--ease-standard` | `cubic-bezier(.2, 0, 0, 1)` | 대부분의 상태 변화(링·탭·세그먼트) | `linear` |
| `--ease-emphasized` | `cubic-bezier(.05, .7, .1, 1)` | 들어오는 것(화면·카드·시트·토스트) | `linear` |
| `--ease-exit` | `cubic-bezier(.3, 0, .8, .15)` | 나가는 것(화면 나감·시트 닫힘·토스트 사라짐) | `linear` |
| `--ease-spring` | `cubic-bezier(.32, .72, 0, 1)` | 시트 열림, 하트 팝 2단(스프링 흉내, 오버슈트 없음) | `linear` |
| `--stagger` | 40ms | 카드·즐겨찾기 목록 등장 간격, **최대 5개**(6번째부터 간격 0) | 0ms |
| `--dist-sm` | 8px | 카드·토스트·코치마크 등장 이동 | 0px |
| `--dist-md` | 16px | 화면 전환 슬라이드, 시트 등장 | 0px |
| `--press` | `.96` | 칩 프레스 scale | `1` |
| `--press-soft` | `.98` | 버튼·카드 프레스 scale | `1` |

### 2-2. reduced-motion 적용 규칙

```css
/* OS 또는 설정(ux-enhancement 8장) — 둘 중 하나면 줄임 */
@media (prefers-reduced-motion: reduce) { :root:not([data-motion="auto-full"]) { --rm: 1; } }
:root[data-motion="reduce"] { --rm: 1; }
```

실제로는 `--rm` 플래그 대신 **토큰을 통째로 덮는** 선택자 두 벌을 쓴다(아래 4-3). `base.css` 의 현재 전역 규칙 `* { animation: none !important; transition: none !important }` 은 **삭제**한다 — 불투명도 80ms 까지 죽여서 "상태가 바뀌었는지" 모르게 만들고, View Transitions 는 애초에 호출되지 않으므로 필요 없다.

### 2-3. 첫 프레임 규칙

- 화면 전환·카드 등장 중에도 **텍스트는 첫 프레임부터 DOM 에 있고 측정 가능**하다(`opacity: 0` 으로 시작하되 `visibility` 는 그대로).
- 스크린리더·검색·테스트는 모션 상태와 무관하게 내용을 본다.
- 카드 등장 스태거는 `requestAnimationFrame` 2번째 프레임에 시작한다(1번째 프레임은 완성된 레이아웃 페인트) — "첫 1초에 답" 은 모션이 없을 때와 같은 시점에 답이 **그려져** 있다는 뜻이다.

---

## 3. 상호작용별 스펙

표기: **트리거 / 무엇이 움직이나 / 길이·이징 / reduced / 성능** · "설명하는 것" = 원칙 1 근거.

### 3-1. 화면 전환 S1 → S2 → S3 (앞으로)

- 설명하는 것: 방향(한 단계 깊어짐).
- 트리거: `nav.go`·`nav.replace` 로 **화면 등급이 올라갈 때**. 등급: S1 0 · S2 1 · S3 2 · S4 3 · 설정 3 · S5 4. (S2 → S3 는 코드상 `nav.back('/result')` 지만 등급이 오르므로 **앞으로**로 취급 — 4-1.)
- 움직임: 나가는 화면 `opacity 1→0`, `translateX(0 → −8px)`; 들어오는 화면 `opacity 0→1`, `translateX(16px → 0)`. 하단 고정 영역(`.bottom`)은 **움직이지 않는다**(원칙 4): `view-transition-name: bottom` 을 주고 그룹 애니메이션을 끈다.
- 길이: 나감 `--dur-base` `--ease-exit` / 들어옴 `--dur-slow` `--ease-emphasized`. 둘이 동시에 시작(겹침), 총 320ms.
- reduced: View Transitions 호출 안 함 → 즉시 교체 + 새 `main` 에 `opacity 0→1` `--dur-fade`.
- 성능: View Transitions 는 스냅샷 두 장을 합성 레이어에서 움직인다 — 레이아웃 0. 폴백도 `transform/opacity` 만.

### 3-2. 화면 전환 뒤로 (S3 → S2, S4 → S3, S5 → S3 …)

- 설명하는 것: 방향(돌아감).
- 트리거: `popstate`(시스템 뒤로·‹ 버튼·시트 닫기 포함) 또는 등급이 내려가는 `replace`.
- 움직임: **크로스페이드만**(슬라이드 없음). 나가는 화면 `opacity 1→0` `--dur-fast` `--ease-exit`, 들어오는 화면 `opacity 0→1` `--dur-base` `--ease-emphasized`.
- 왜 슬라이드가 없나: iOS Safari(브라우저 모드)의 **가장자리 스와이프 뒤로**와 Chrome Android 의 **뒤로 제스처**는 OS 가 이미 화면을 끌어서 넘긴 뒤 `popstate` 를 보낸다. 거기에 앱이 또 슬라이드를 넣으면 두 번 움직인다. `popstate` 가 제스처에서 왔는지 버튼에서 왔는지 구분할 표준 API 가 없으므로(`navigation.navigate` 의 `userInitiated` 는 Chromium 만), 뒤로는 **항상** 짧은 크로스페이드로 통일한다.
- reduced: 즉시 교체 + `--dur-fade`.
- 성능: 동일.

### 3-3. 공유 요소: 고른 색 칩 → 기준 아이템 바 점 (S2 → S3)

- 설명하는 것: 출처("당신이 고른 그 색이 여기 있다").
- 트리거: S2 칩 탭 직후 S3 렌더(앞으로 전환 안에서 함께 실행).
- 움직임: 탭한 `.chip__swatch`(52×52, 모서리 12px, 그리드 안)가 S3 `.basebar .dot--base`(24×24 원, 상단)로 **위치·크기 모프**. 동시에 화면 전환(3-1)이 뒤에서 진행. 모프 길이 `--dur-slow` `--ease-emphasized`.
- 구현(View Transitions):
  ```js
  // s2Color.js 칩 onClick — 이름은 탭한 칩 하나에만 (같은 이름이 둘이면 전환이 통째로 건너뛰어진다)
  sw.style.viewTransitionName = 'base-swatch';
  selectBase({ category, color: id }); nav.back('/result');
  ```
  ```css
  .basebar .dot--base { view-transition-name: base-swatch; }           /* S3 에서 유일 — 카드 안 .dot--base 는 제외 */
  .chip[aria-checked="true"] .chip__swatch { view-transition-name: base-swatch; } /* S3 → S2(색 바꾸기) 역방향 모프 */
  ::view-transition-group(base-swatch) { animation-duration: var(--dur-slow); animation-timing-function: var(--ease-emphasized); }
  ::view-transition-old(base-swatch), ::view-transition-new(base-swatch) { animation: none; mix-blend-mode: normal; height: 100%; }
  ::view-transition-image-pair(base-swatch) { border-radius: 50%; overflow: clip; }  /* 네모 칩이 원으로 "둥글어지며" 이동 — 모서리 12px→50% 를 흉내 */
  ```
  old/new 스냅샷의 크로스페이드를 끈 이유: 색이 같아 페이드가 보이지 않고, 두 장을 겹치면 테두리가 두 번 보인다.
- 구현(CSS 폴백, `document.startViewTransition` 없음): 모프 없음. S3 기준 바의 점만 `scale(.6)→1` + `opacity 0→1` `--dur-base` `--ease-emphasized` (`.basebar .dot--base.is-new` 클래스를 렌더 직후 한 번). 색 자체가 "출처"를 충분히 말하므로 정보 손실 없음.
- 뒤로(S3 → S2 색 바꾸기): 같은 이름이 양쪽에 있으므로 **역방향 모프가 자동**. 단 3-2 규칙상 화면은 크로스페이드, 점만 모프.
- reduced: 이름을 붙이지 않음(모프 없음), 점 즉시 표시.
- 성능: UA 가 스냅샷을 `transform` 으로 보간. 주의 — S2 그리드가 `overflow` 스크롤 안이 아니므로(S2 는 `.screen__body` 비스크롤) Safari 18.0 의 스크롤 컨테이너 캡처 이슈(6장)에 걸리지 않는다. S3 쪽 `.basebar` 는 `.screen__body--scroll` 안이지만 스크롤 위치 0 에서 렌더되므로 안전. QA 가 실기기에서 확인.

### 3-4. 공유 요소 2단계(선택): 카드 일러스트 → S5 히어로

- 설명하는 것: 출처(이 상세가 그 카드다).
- `.card__ill` 에 `view-transition-name: ill-${ref}`, S5 `.s5__ill` 에 같은 이름(라우트 `ref` 로 결정). 60×104 → 폭 60% 모프, `--dur-slow`.
- 조건: 3-1~3-3 이 실기기 60fps 를 통과한 뒤 **추가**. 통과 못 하면 넣지 않는다(예산 밖). 폴백·reduced 는 3-3 과 같은 규칙.

### 3-5. S3 카드 등장 스태거

- 설명하는 것: 변화("새 결과 3장이 왔다"). 첫 실행 S3·기준 아이템 변경·계절 토글·바로가기 pill 때. **재방문 홈의 첫 렌더에도** 적용(오늘 카드가 가장 먼저 나타나 "오늘" 을 강조).
- 움직임: 카드 i(0..2) `opacity 0→1`, `translateY(8px → 0)`, 시작 지연 `i × 40ms`. 각 카드 `--dur-base` `--ease-emphasized`. 총 200 + 80 = 280ms ≤ `--dur-enter`.
- 첫 프레임 규칙: 카드는 DOM 완성 뒤 rAF 2번째 프레임부터 움직인다. 전환(3-1) 과 겹칠 때는 전환이 들어오는 화면 안에서 카드가 스태거된다(둘 다 `opacity` 라 곱셈, 어색하지 않음).
- 계절 토글·pill 처럼 **제자리 갱신**일 때는 나가는 카드 없음: 새 카드가 바로 스태거. (나가는 카드를 페이드하면 60ms 가 비는데, 아침에 그 60ms 가 "깜빡임"으로 읽힌다.)
- 즐겨찾기 시트(F1) 목록·S4 카드 목록도 같은 스태거, 최대 5개까지만 지연(6번째부터 즉시).
- reduced: 지연 0, 이동 0, `opacity` `--dur-fade` 만.
- 성능: `transform/opacity`. `will-change` 금지(3장뿐, 레이어 승격 비용이 더 큼). 스태거 변수는 `style="--i:1"` 인라인.

### 3-6. 칩 프레스 (S2 색 칩·톤/색상/스타일 칩·pill·카테고리 버튼)

- 설명하는 것: 변화(눌렸다).
- 트리거: `:active`(포인터 다운). 현재 `.chip:active { transform: scale(.96) }` 120ms 유지.
- 움직임: `scale(1 → var(--press))` `--dur-fast` `--ease-standard`, 떼면 같은 길이로 복귀. 버튼·카드는 `--press-soft`.
- 주의: 눌림 → 즉시 라우팅이라 복귀 모션은 보통 전환에 묻힌다. 괜찮다 — 다운 순간의 .96 이 "눌렸다"를 말한다.
- reduced: `--press: 1` → 변화 없음. 대신 `:active { background: var(--bg-2) }` 는 유지(색 변화는 모션이 아님).
- 성능: `transform` 만.

### 3-7. 칩 선택 링 (S2 현재 색 · S4 칩 · 세그먼트 옵션)

- 설명하는 것: 변화(선택됨).
- 움직임: `outline`(2px 앰버, offset 2)은 애니메이션하지 않는다(`outline` 은 페인트 속성). 대신 `.chip__swatch::after` 에 `inset:-4px; border:2px solid var(--accent); border-radius: inherit; opacity:0; transform: scale(.9)` 를 두고 선택 시 `opacity 1, scale 1` `--dur-base` `--ease-standard`. 체크 배지 `.chip__check` 는 `scale(0 → 1)` `--dur-fast` `--ease-spring`.
- S2 는 선택 즉시 화면을 떠나므로 이 링은 사실상 **S3 → S2 로 돌아왔을 때 이미 켜진 상태**로 보인다 → 등장 모션은 재방문 S2 의 첫 렌더에서만 1회.
- reduced: 링 즉시, 체크 즉시.
- 성능: `opacity/transform`.

### 3-8. 계절 세그먼트 슬라이드

- 설명하는 것: 변화(선택이 옆 칸으로 옮겨감).
- 현재: 선택 옵션에 배경색만. v1.1: `.seg` 안에 `.seg__thumb`(absolute, `--accent-soft` 배경 + 1px 앰버 inset) 1개를 두고 선택 옵션의 `offsetLeft/width` 로 `transform: translateX(…) scaleX(…)` 를 갱신. `--dur-base` `--ease-standard`.
- 옵션 글자색 변화는 `color` 전환 `--dur-fast`(글자색 전환은 페인트지만 3개 작은 텍스트라 허용 — 유일한 비 transform 전환, 측정 후 문제면 제거).
- 결과 카드는 3-5 제자리 스태거. 세그먼트 슬라이드(200ms)와 카드 등장(280ms)이 동시에 시작.
- 설정 화면의 세그먼트(화면·움직임)도 같은 컴포넌트.
- reduced: 썸 즉시 이동(전환 0).
- 성능: 썸 크기 계산은 `getBoundingClientRect` 1회(렌더 직후·토글 시), 레이아웃 읽기 1회뿐. 폰트 로드로 폭이 바뀔 일 없음(시스템 글꼴).

### 3-9. 시트 열림·닫힘 (S6 · O1 · O2 메뉴 · F1 즐겨찾기 · SH1 공유 · ST1-r)

- 설명하는 것: 출처(아래에서 올라옴, 밑 화면은 그대로).
- 열림: 패널 `translateY(16px → 0)` + `opacity 0→1` `--dur-base` `--ease-spring`; 스크림 `opacity 0→1` `--dur-base` `--ease-standard`. 현재 `sheet-up`(24px, ease-out)을 대체.
- 닫힘: 패널 `translateY(0 → 16px)` + `opacity 1→0` `--dur-fast` `--ease-exit`; 스크림 페이드 `--dur-fast`. 닫힘은 `nav.back()` → `popstate` → 재렌더라 **지금 구조에선 닫힘 모션이 불가능**(시트 노드가 즉시 사라짐). 4-2 의 "밑 화면 노드 재사용 + 시트만 제거" 로 바꾸고, 제거 전에 `.is-closing` 클래스 → `animationend` 또는 120ms 타임아웃 후 `remove()`.
- 아래로 끌기: 현재 `touchend` 에서 80px 넘으면 닫기. v1.1 도 **따라오는 드래그는 넣지 않는다**(스크롤 충돌·iOS 바운스와 싸우게 됨). 끌기 임계 넘으면 닫힘 모션만.
- 스크림: `--scrim`(다크 .55 / 라이트 .35). 밝은 스크림·블러(`backdrop-filter`) 금지(원칙 5·7).
- 시트는 `position: fixed` 라 View Transitions 레이어(`::view-transition`, 최상단) 아래에 깔린다 → 시트 열고 닫을 때 **View Transitions 를 호출하지 않는다**(4-1).
- reduced: 패널·스크림 `opacity` `--dur-fade` 만, 이동 0.
- 성능: `transform/opacity`. 패널 `box-shadow` 는 정적(애니메이션 안 함).

### 3-10. 탭 밑줄(윗선) 슬라이드 (S4 하단 탭 바)

- 설명하는 것: 변화(탭이 옆으로 옮겨감).
- 현재: 선택 탭의 `border-top-color` 만 바뀜(P1-13 후 윗선). v1.1: `.tabs::before` 지시선 1개(3px, 앰버, `width: calc(100%/N)`)를 `translateX(index × 100%)` 로 이동 `--dur-base` `--ease-standard`. 탭 수 N 은 3 또는 4(스타일 탭) — `--tabs: 4` 변수.
- 패널 내용(카드 목록)은 3-5 제자리 스태거. 탭 패널 가로 스와이프 전환은 **넣지 않는다**(가로 스크롤 칩 줄과 충돌).
- reduced: 지시선 즉시.
- 성능: `transform` 만. 탭 폭이 같다는 전제(`flex: 1 1 0`) 라 측정 없음.

### 3-11. 스켈레톤 (계산 > 80ms 일 때만)

- 설명하는 것: 변화(곧 온다).
- 사실: 엔진 deep 모드 평균 11ms(usability 1절). 저사양 기기에서도 80ms 를 넘기 어렵다. 그러나 `getResult()` 는 **동기**라 "80ms 가 지나면 보여준다"가 불가능하다(계산 중엔 아무것도 그릴 수 없다).
- 규칙: 지난번 계산 시간을 저장(`mc.v1.perf.computeMs`, `performance.now()` 차). **다음** 렌더에서 그 값이 80ms 를 넘으면 ① 화면 틀(상단·기준 바·하단 고정)과 스켈레톤 3장을 먼저 그리고 ② `requestAnimationFrame` 다음 프레임에 계산·카드 교체. 80ms 이하면 지금처럼 한 번에 그린다(스켈레톤 0프레임).
- 모양: `.skeleton`(이미 있음, `--bg-2`, 128px) 3장. 맥동은 `opacity .7 ↔ 1` 1.2초 `ease-in-out` 무한 — 밝은 하이라이트가 지나가는 "shimmer" 는 **금지**(어두운 방에서 플래시, 원칙 5).
- 교체: 스켈레톤 → 카드는 3-5 스태거 그대로(스켈레톤 페이드아웃 없음, 즉시 교체).
- reduced: 맥동 없음(정지).
- 성능: `opacity` 만. 스켈레톤이 보일 기기에서 맥동 애니메이션 3개는 무시 가능.

### 3-12. 즐겨찾기 하트 팝

- 설명하는 것: 변화(저장됨).
- 저장: 아이콘 `scale(1 → .8)` `--dur-fast` `--ease-exit` → `scale(.8 → 1.15 → 1)` 총 `--dur-base` `--ease-spring`(keyframes 3단, 오버슈트는 1.15 한 번만). 색은 `--text-2` → `--accent` 를 첫 단에서 즉시. 하트 둘레 작은 링(`::after`, 2px 앰버, `scale(.6→1.6)` + `opacity .6→0`) `--dur-base` — 손가락에 가려지는 아이콘을 보완.
- 해제: 색만 즉시 되돌림. 모션 없음(없어지는 것은 조용히).
- 햅틱: Android `navigator.vibrate(10)` 저장 때만(ux-enhancement 4-2).
- 토스트 3-13 동반.
- reduced: 색 변화만, 링 없음, 햅틱 없음.
- 성능: `transform/opacity`, 아이콘은 인라인 SVG 1개(폰트 글리프 아님 — `♥` 글리프는 플랫폼마다 모양이 달라 팝 때 베이스라인이 튄다).

### 3-13. 토스트

- 설명하는 것: 변화(앱이 한 일).
- 등장: `translateY(8px → 0)` + `opacity 0→1` `--dur-base` `--ease-emphasized`. 사라짐: `opacity 1→0` `--dur-fast` `--ease-exit`(이동 없음). 표시 길이: 저장·해제 1.6초, 그 외 기존 2.6초.
- 자리: 기존 규칙(하단 고정 영역 위 120px / `.toast--low`). 연속 토스트는 **교체**(겹쳐 쌓지 않음) — 이전 토스트 즉시 제거.
- reduced: `opacity` `--dur-fade`.
- 성능: `transform/opacity`.

### 3-14. 설치 배너 슬라이드

- 설명하는 것: 출처(결과 뒤에 조용히 덧붙음, P1-01 "카드가 먼저").
- 등장: 카드 스태거가 **끝난 뒤**(+280ms) `opacity 0→1` + `translateY(−8px → 0)` `--dur-enter` `--ease-emphasized`. 배너가 카드 아래로 내려간 경우(`.banner--below`) 도 같은 모션.
- 닫기(✕): `opacity 1→0` `--dur-fast` 후 제거. **높이 접힘 애니메이션 없음**(`height` 는 레이아웃) — 자리가 비면 카드가 한 번에 올라온다. 이것이 거슬리면 FE 가 View Transitions `root` 크로스페이드로 감싸도 된다(선택).
- reduced: `opacity` `--dur-fade`.

### 3-15. 코치마크

- 등장: 대상 위 `translateY(8px → 0)` + `opacity 0→1` `--dur-base` `--ease-emphasized`, 카드 스태거 뒤 +400ms(결과를 먼저 읽게). 사라짐 `opacity` `--dur-fast`. 꼬리는 CSS 삼각형, 움직이지 않음. 맥동·흔들림 없음.
- reduced: `opacity` `--dur-fade`.

### 3-16. 오늘 카드 강조

- 재방문 홈 첫 렌더: 오늘 카드의 앰버 세로선 `scaleY(0 → 1)` `--dur-base` `--ease-emphasized`, 카드 스태거 i=0 와 동시에. 그 외 상황에선 정적. reduced: 즉시.

### 3-17. 당겨서 새로고침 — **하지 않는다**

- 새로고침할 것이 없다. 데이터는 전부 로컬·결정적이고, "오늘의 추천"은 날짜가 바꾼다(ux-enhancement 3-2, 자정 제자리 갱신도 하지 않음).
- 당기기 제스처는 `.screen__body--scroll` 의 스크롤 시작과 겹친다. iOS 의 러버밴드·Chrome Android 의 **브라우저 자체 당겨서 새로고침**(PWA 를 통째로 리로드 → 1초 공백 + 상태 재구성)과 충돌한다.
- 오히려 막는다: `body { overscroll-behavior-y: none }`(standalone·브라우저 모두) 로 Chrome Android 의 네이티브 새로고침을 끄고, `.screen__body--scroll { overscroll-behavior: contain }` 으로 시트 안 스크롤이 밑 화면으로 새지 않게 한다.
- "새 버전" 적용은 기존 SW 정책(다음 실행) 그대로.

---

## 4. FE 구현 계획

### 4-1. View Transitions 사용 규칙

```js
// src/ui/motion.js (gzip ≈ 0.9 KB)
const root = document.documentElement;
let degraded = false;                 // 세션 안에서 두 번 느리면 CSS 폴백으로 고정
let slowCount = 0;

export function prefersReducedMotion() {
  if (root.dataset.motion === 'reduce') return true;
  try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
}

export function supportsVT() {
  return typeof document.startViewTransition === 'function' && !degraded && !prefersReducedMotion();
}

/** update() 가 DOM 을 바꾼다. type: 'fwd' | 'back' | 'none'. 반환: 전환이 끝나는 Promise(없으면 resolved). */
export function viewTransition(update, type = 'none') {
  if (!supportsVT() || type === 'none') { update(); return Promise.resolve(); }
  root.dataset.nav = type;
  const t0 = performance.now();
  let vt;
  try { vt = document.startViewTransition(update); } catch { update(); delete root.dataset.nav; return Promise.resolve(); }
  return vt.finished.catch(() => {}).finally(() => {
    delete root.dataset.nav;
    const budget = type === 'fwd' ? 320 : 200;
    if (performance.now() - t0 > budget + 120 && ++slowCount >= 2) degraded = true;   // 저사양 보호 (6장)
  });
}

/** 목록 등장 스태거: --i 를 0..max-1 로 (6번째부터 max-1 = 즉시 취급은 CSS 에서) */
export function stagger(els, max = 5) {
  els.forEach((el, i) => el.style.setProperty('--i', String(Math.min(i, max - 1))));
}

/** 설정·OS 변화 반영 (설정 화면·부트 시) */
export function applyMotionPref(pref /* 'auto' | 'reduce' */) {
  root.dataset.motion = pref === 'reduce' ? 'reduce' : 'auto';
}
```

- **기능 감지만** 쓴다(UA 스니핑 없음). `startViewTransition` 이 없으면 전부 CSS 폴백.
- `view-transition-class`(Safari 18.2+ / Chrome 125+)·`types`·중첩 그룹은 **쓰지 않는다** — 이름 4개(`root`, `bottom`, `base-swatch`, 선택 `ill-*`)로 충분하고, 18.0 기기까지 같은 코드.
- 전환 중 `::view-transition` 이 화면 전체를 덮어 **탭이 320ms 동안 막힌다**. 그래서 앞으로 전환만 320ms, 뒤로는 200ms 이하. Quick 경로에서 사용자가 연타할 수 있는 S1→S2→S3 는 전환 중 탭이 큐잉되지 않아도 괜찮다(칩 탭 자체가 결과를 만들고, 전환은 그 위에 얹힘). 단 **S2 칩 탭 → S3 결과는 전환 없이도 100ms 안에 DOM 에 있어야** 한다(2-3).
- 방향 판정은 `app.js render` 에서 **이전 라우트와 새 라우트의 화면 등급**으로 — `nav.js` 는 손대지 않는다.
  ```js
  const RANK = { home: 2, pick: 1, result: 2, more: 3, settings: 3, outfit: 4 };   // home 은 S1(0)/S3(2) 를 st.base 로 분기
  const type = prev == null ? 'none' : rank(next) > rank(prev) ? 'fwd' : rank(next) < rank(prev) ? 'back' : 'none';
  ```
  `popstate` 로 들어온 렌더는 등급과 무관하게 `'back'`(3-2) — `nav.start` 의 popstate 리스너에서 `handler(parse(), { pop: true })` 로 플래그 하나만 추가(`nav.js` 1줄).

### 4-2. 렌더 구조 변경 (`app.js`)

현재 `render` 는 매번 모든 노드를 새로 만들어 `root.replaceChildren` 한다. v1.1:

1. **밑 화면 키**: `${screen}/${a}` (시트 세그먼트 `b`·`install`·`menu`·`fav`·`share` 제외). 키가 같으면 기존 `main` 노드를 **그대로 두고** 시트 노드만 추가·제거한다 → 시트 닫힘 모션(3-9) 가능, S3 의 스크롤 위치·코치마크·라이브 리전 유지.
2. 키가 다르면 `viewTransition(() => root.replaceChildren(...nodes), type)`.
3. 제자리 갱신(`rerender`: 계절·pill·♥)은 전환 없이 카드 영역만 교체 + `stagger`.
4. 시트 닫힘: `.is-closing` → 120ms 후 `remove()`. `popstate` 가 먼저 도착하므로 "제거 예약" 후 재렌더 — 키가 같아 밑 화면은 안 건드린다.

### 4-3. CSS 변경 (`tokens.css` · `app.css` · `base.css`)

| 파일 | 변경 | 크기(gzip 추정) |
|---|---|---|
| `tokens.css` | 2-1 토큰 15개 추가, `--motion-fast`·`--motion-sheet` 를 별칭으로. reduced 덮어쓰기 두 벌: `@media (prefers-reduced-motion: reduce) { :root:not([data-motion="auto-full"]) {…} }` + `:root[data-motion="reduce"] {…}` (값은 2-1 "reduced 열") | +0.5 KB |
| `base.css` | 전역 `animation: none !important` 규칙 **삭제**(토큰이 대신). `body { overscroll-behavior-y: none }` | −0.1 KB |
| `app.css` 전환 | `::view-transition-old(root)`/`new(root)` 앞·뒤 keyframes(`html[data-nav="fwd"]`·`"back"` 선택자로 분기), `.bottom { view-transition-name: bottom }` + 그룹 애니메이션 끔, `base-swatch` 규칙(3-3), 폴백 `main.is-entering` | +0.9 KB |
| `app.css` 카드·목록 | `.cards > * { animation: card-in var(--dur-base) var(--ease-emphasized) both; animation-delay: calc(var(--i, 0) * var(--stagger)); }` + `@keyframes card-in`. `.card--today::before` 세로선 | +0.3 KB |
| `app.css` 칩·세그·탭 | `.chip__swatch::after` 링, `.seg__thumb`, `.tabs::before` 지시선(`--tabs`) | +0.4 KB |
| `app.css` 시트·토스트·배너·코치 | `.sheet`/`.sheet-root__scrim` 열림·`.is-closing`, `.toast` 등장·사라짐, `.banner` 등장, `.coach` | +0.5 KB |
| `app.css` 하트·스켈레톤 | `.card__fav` 팝 keyframes + 링, `.skeleton` 맥동 | +0.3 KB |
| `motion.js` | 4-1 | +0.9 KB |
| 합계 | | **≈ 3.7 KB gzip** (예산 6 KB, 여유 2.3 KB — 3-4 공유 요소 2단계·배너 크로스페이드는 이 여유 안에서) |

즐겨찾기·공유·설정·온보딩 **기능** 코드(캔버스 포함 ≈ 5–6 KB gzip)는 모션 예산 밖이며 전체 JS 예산 120 KB 안(현재 번들 392.7 KiB precache 중 JS gzip 은 별도 측정 — QA).

### 4-4. 순서

1. 토큰 + `base.css` 전역 규칙 교체 + `motion.js` (reduced 동작부터 확정).
2. `app.js` 렌더 키·시트 분리(4-2) — 모션 없이도 동작 확인(테스트 39개 통과).
3. 화면 전환 앞·뒤 + `bottom` 고정(3-1·3-2).
4. 카드 스태거·오늘 카드·토스트·배너(3-5·3-13·3-14·3-16).
5. 공유 요소 `base-swatch`(3-3) — 실기기 iOS 18/26·Android 저사양 측정.
6. 칩 링·세그먼트 썸·탭 지시선·시트·하트·스켈레톤·코치(3-6~3-12·3-15).
7. (여유 있으면) 3-4.

QA 게이트 6 항목에 추가: reduced 두 경로(OS·설정) 각각에서 이동 0 확인, 전환 중 어느 프레임도 `--bg-0` 보다 밝지 않음(다크), Quick 경로에서 S2 칩 탭 → S3 캡션 DOM 존재까지 100ms 이내, 저사양에서 `degraded` 전환이 2회 안에 발동.

---

## 5. 성능 노트 (공통)

- 애니메이션 속성: `transform`·`opacity` 만. 예외: 세그먼트 글자 `color`(3-8, 측정 후 제거 가능), View Transitions 그룹 박스(UA).
- `will-change` 금지. 레이어는 UA 가 전환 중에만 만든다.
- 레이아웃 읽기: 세그먼트 썸(1회/토글), 배너·컴팩트 가드(기존 rAF 1회), 코치마크 위치(1회). 애니메이션 프레임 안에서 읽지 않는다.
- SVG 실루엣 3장이 스냅샷에 포함되지만 정적이다(필터·그림자 없음).
- 스태거 최대 5 — 즐겨찾기 30장·변주 13장도 6번째부터는 즉시.
- 전환 중 입력 차단 320ms 는 "앞으로" 만. 뒤로·제자리·시트는 ≤ 200ms.

---

## 6. 위험 목록

| # | 위험 | 근거·검증 | 완화 |
|---|---|---|---|
| R1 | **iOS Safari View Transitions 지원 — 판정: 쓸 수 있다, 단 폴백 필수** | WebKit 공식 블로그: 같은 문서 View Transitions(`document.startViewTransition`, CSS View Transitions Level 1)는 **Safari 18.0**(iOS 18, 2024-09)에서 출시, 교차 문서(`@view-transition`)는 **18.2**. Safari 26(iOS 26, 2025-09)에서도 유지. 2026-10 현재 iOS 18 이상을 못 받는 iPhone(8·X 이하, iOS 16 까지)만 폴백 대상이며 소수. 홈 화면 앱(standalone)도 같은 WebKit 이라 동일. 검색으로 확인한 출처: [WebKit Features in Safari 18.0](https://webkit.org/blog/15865/webkit-features-in-safari-18/), [WebKit Features in Safari 18.2](https://webkit.org/blog/16301/webkit-features-in-safari-18-2/), [Chrome: View Transition API 지원표(Safari 18 / 18.2)](https://developer.chrome.com/docs/web-platform/view-transitions). 주의 1: 18.0~18.1 에서 스크롤 컨테이너·`position: fixed` 안의 이름 붙은 요소 캡처 어긋남 보고가 있었음 — 3-3 은 스크롤 0 상태에서만 모프하므로 영향 적음. 주의 2: `view-transition-class`·types 는 18.2+ → 쓰지 않음(4-1). 주의 3: 같은 이름 중복 시 전환이 통째로 건너뛰어짐 → 이름은 항상 1개(테스트로 보장) | 기능 감지 + CSS 폴백(3-1·3-3), 이름 4개 이하, QA 실기기 iOS 18.0 / 26 각 1대 |
| R2 | **저사양 Android 스크롤·전환 잭** | 전환은 전체 화면 스냅샷 2장 합성 → 2–4GB 기기에서 첫 전환 프레임 드롭 가능. 카드 스태거는 3장이라 가벼움 | `degraded` 자동 강등(4-1, 2회 초과 시 세션 동안 CSS 폴백), `will-change` 금지, 뒤로는 200ms 크로스페이드, 저사양 1대(QA) 에서 S1→S2→S3 10회 평균 프레임 시간 측정 |
| R3 | **어두운 방 플래시** | 라이트 테마 전환(크로스페이드 중간 프레임), 밝은 스켈레톤 shimmer, 밝은 스크림, 공유 미리보기 흰 캔버스 | 테마 전환 모션 없음(ux-enhancement 8장), 스켈레톤 `opacity` 맥동만, 스크림 `--scrim` 유지, 공유 캔버스 배경 `#121212` 고정·그리는 동안 `--bg-2` 자리표시, QA 프레임 샘플링 |
| R4 | 뒤로 제스처 이중 애니메이션 | iOS 스와이프·Android 제스처 뒤 `popstate` | 뒤로는 슬라이드 없이 크로스페이드(3-2) |
| R5 | 시트 닫힘 모션이 현재 렌더 구조와 충돌 | `nav.back` → 재렌더가 시트를 즉시 지움 | 4-2 밑 화면 키 재사용 |
| R6 | `base.css` 전역 `!important` 규칙 제거로 reduced 누락 | 새 컴포넌트가 토큰을 안 쓰면 reduced 에서 움직임 | 린트 규칙: `animation`·`transition` 값은 반드시 `var(--dur-*)`·`var(--ease-*)`; QA reduced 두 경로 체크리스트 |
| R7 | 전환 중 입력 차단(320ms) 이 Quick 10초를 갉아먹음 | 연타 사용자 | 앞으로만 320ms, 결과 DOM 은 전환 전 완성(2-3), 체감 측정은 QA "칩 탭 → 캡션 가시"로 |
| R8 | `♥` 글리프 베이스라인 튐·플랫폼 차이 | 폰트 글리프 팝 | 인라인 SVG 아이콘(3-12) |
