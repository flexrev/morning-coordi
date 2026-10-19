# 디자인 토큰 · 색 칩 · 실루엣 시스템 (D2 비주얼/UI)

작성일: 2026-10-19 · 담당: D2
입력: `00-team-and-plan.md` 1·5·9절, `research/gate-1-review.md` 2(7)·3절, `research/references.md` 4절·결정 제안 6~8, `research/color-rules.md` 1·6장, `research/style-rules.md` 0·8장
산출물: 이 문서, `src/assets/silhouettes/*.svg` (27파일, path 28개), `docs/design/silhouette-demo.html`, `docs/design/app-icon.svg`

> 원칙
> - 다크 모드 기본, 순흑(#000000) 금지. 배경은 #121212 계열 + 상승면 2단.
> - 본문 글자 대비 ≥ 7:1(다크), 보조 글자 ≥ 4.5:1. 액센트는 저채도 밝은 톤.
> - 그라데이션 금지(토큰·칩·실루엣·아이콘 전부). 단색 fill + currentColor 저투명도 선만.
> - 모든 id는 camelCase(게이트 검토 2-1). 색 id는 color-rules 1장 그대로.

---

## 1. 테마 토큰

### 1-1. 다크 (기본, `:root` / `[data-theme="dark"]`)

| 토큰 | 값 | 용도 | 대비(대 bg-0 / bg-1 / bg-2) |
|---|---|---|---|
| `--bg-0` | `#121212` | 페이지 배경 (base) | — |
| `--bg-1` | `#1C1C1E` | 카드·시트 (elevation 1) | — |
| `--bg-2` | `#262629` | 카드 안 그림 영역·눌린 상태·팝오버 (elevation 2) | — |
| `--text-1` | `#F2F1EE` | 본문·제목 (살짝 따뜻한 흰색, 순백 아님) | 16.6 / 15.1 / 13.4 |
| `--text-2` | `#B4B2AD` | 보조 설명·칩 라벨 | 8.8 / 8.0 / 7.1 |
| `--text-3` | `#94928D` | 캡션·비활성·placeholder (≥4.5 유지) | 6.0 / 5.5 / 4.9 |
| `--accent` | `#E0BE7E` | 선택 링·주요 버튼·"클래식" 배지. 저채도 앰버(아침 해) | 10.6 (글자로 써도 OK) |
| `--on-accent` | `#121212` | 액센트 위 글자 | 10.6 |
| `--accent-soft` | `rgba(224,190,126,.16)` | 선택 칩 배경·토글 on 배경 | — |
| `--link` | `#9DB8D9` | 링크·정보성 강조 (저채도 블루) | 9.2 / 8.3 / 7.4 |
| `--warn` | `#E3C56B` | "출처 갈림(disputed)" 표시 | 11.1 |
| `--danger` | `#E88A80` | "피하기(avoid)" 표시 | 7.5 / 6.8 / 6.0 |
| `--border` | `#33333A` | 카드 테두리·구분선 (장식용, 대비 요구 없음) | — |
| `--border-strong` | `#4A4A52` | 입력 필드·포커스 전 버튼 테두리 | — |
| `--chip-border` | `rgba(255,255,255,.28)` | **색 칩 1px 테두리** (어두운 칩이 배경에 묻히지 않게) | — |
| `--focus` | `#E0BE7E` | 키보드 포커스 링 2px | — |
| `--c-skin` | `#C9A98C` | 실루엣 머리·목·발목 | — |
| `--shadow-1` | `0 1px 2px rgba(0,0,0,.5)` | 다크에서는 그림자보다 bg 단계로 높이 표현. 시트에만 | — |
| `--shadow-2` | `0 8px 24px rgba(0,0,0,.6)` | 바텀시트·모달 | — |
| `theme-color` (meta) | `#121212` | `<meta name="theme-color" media="(prefers-color-scheme: dark)">` | — |

### 1-2. 라이트 (`[data-theme="light"]`, 사용자가 명시 전환했을 때만)

| 토큰 | 값 | 대비(대 bg-0 / bg-1) |
|---|---|---|
| `--bg-0` | `#F6F5F1` (따뜻한 오프화이트, 순백 아님) | — |
| `--bg-1` | `#FFFFFF` | — |
| `--bg-2` | `#FFFFFF` + `--shadow-1` (라이트는 그림자로 높이 표현) | — |
| `--text-1` | `#1B1B1A` | 15.8 / 17.2 |
| `--text-2` | `#5A5955` | 6.4 / 7.0 |
| `--text-3` | `#6B6963` | 5.0 / 5.5 |
| `--accent` | `#8A6A2E` (같은 앰버 계열, 어둡게) | 4.6 / 5.0 |
| `--on-accent` | `#FFFFFF` | 5.0 |
| `--accent-soft` | `rgba(138,106,46,.12)` | — |
| `--link` | `#3B5F8A` | ≥ 6 |
| `--warn` | `#7A5A10` | 5.8 |
| `--danger` | `#A3372C` | 6.1 |
| `--border` | `#E1DED7` | — |
| `--border-strong` | `#C9C6BE` | — |
| `--chip-border` | `rgba(0,0,0,.14)` | 흰 칩(white/offWhite/cream)이 흰 카드에 묻히지 않게 |
| `--focus` | `#8A6A2E` | — |
| `--shadow-1` | `0 1px 2px rgba(0,0,0,.08)` | — |
| `--shadow-2` | `0 8px 24px rgba(0,0,0,.14)` | — |
| `theme-color` (meta) | `#F6F5F1` | — |

테마 결정 순서: `localStorage.theme` → 없으면 **다크**(prefers-color-scheme가 light여도 첫 실행은 다크. 계획서 원칙 "어두운 아침"). 설정에서 "시스템 따르기"를 켜면 `prefers-color-scheme`를 따른다. `<html data-theme>`에 반영하고 `color-scheme` 속성도 같이 바꿔 스크롤바·폼 컨트롤이 따라오게 한다.

### 1-3. CSS 토큰 블록 (C1 `src/styles/tokens.css`로 복사)

```css
:root, [data-theme="dark"] {
  color-scheme: dark;
  --bg-0:#121212; --bg-1:#1C1C1E; --bg-2:#262629;
  --text-1:#F2F1EE; --text-2:#B4B2AD; --text-3:#94928D;
  --accent:#E0BE7E; --on-accent:#121212; --accent-soft:rgba(224,190,126,.16);
  --link:#9DB8D9; --warn:#E3C56B; --danger:#E88A80;
  --border:#33333A; --border-strong:#4A4A52; --chip-border:rgba(255,255,255,.28);
  --focus:#E0BE7E; --c-skin:#C9A98C;
  --shadow-1:0 1px 2px rgba(0,0,0,.5); --shadow-2:0 8px 24px rgba(0,0,0,.6);
}
[data-theme="light"] {
  color-scheme: light;
  --bg-0:#F6F5F1; --bg-1:#FFFFFF; --bg-2:#FFFFFF;
  --text-1:#1B1B1A; --text-2:#5A5955; --text-3:#6B6963;
  --accent:#8A6A2E; --on-accent:#FFFFFF; --accent-soft:rgba(138,106,46,.12);
  --link:#3B5F8A; --warn:#7A5A10; --danger:#A3372C;
  --border:#E1DED7; --border-strong:#C9C6BE; --chip-border:rgba(0,0,0,.14);
  --focus:#8A6A2E;
  --shadow-1:0 1px 2px rgba(0,0,0,.08); --shadow-2:0 8px 24px rgba(0,0,0,.14);
}
/* 타이포 */
:root {
  --font-sans:"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,Roboto,
              "Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic","Helvetica Neue",Arial,sans-serif;
  --fs-display:28px; --lh-display:36px;
  --fs-title:22px;   --lh-title:30px;
  --fs-section:18px; --lh-section:26px;
  --fs-body:16px;    --lh-body:24px;
  --fs-label:14px;   --lh-label:20px;
  --fs-chip:13px;    --lh-chip:18px;
  --fs-caption:12px; --lh-caption:16px;
  /* 간격·반경·터치 */
  --sp-1:4px; --sp-2:8px; --sp-3:12px; --sp-4:16px; --sp-5:24px; --sp-6:32px; --sp-7:48px;
  --r-sm:8px; --r-md:12px; --r-lg:16px; --r-pill:999px;
  --tap-min:48px; --tap-primary:56px;
  --safe-top:max(env(safe-area-inset-top), 0px);
  --safe-bottom:max(env(safe-area-inset-bottom), 0px);
  /* 실루엣 색 슬롯 (OutfitCard가 인라인 style로 덮어씀) */
  --c-top:#BBBBBB; --c-bottom:#444444; --c-shoes:#222222; --c-outer:#555555;
}
```

---

## 2. 타이포그래피 (한국어)

| 역할 | 크기/행간 | 굵기 | 자간 | 사용처 |
|---|---|---|---|---|
| display | 28 / 36 | 700 | -0.02em | 첫 실행 "오늘 뭐 입지?" 한 줄만 |
| title | 22 / 30 | 700 | -0.01em | 화면 제목 ("하의 고르기") |
| section | 18 / 26 | 600 | -0.01em | 섹션 제목 ("클래식 조합", "더 보기 · 톤별") |
| body | 16 / 24 | 400 | 0 | 설명·도움말. 다크 본문은 `--text-1`만 (≥ 7:1) |
| label | 14 / 20 | 600 | 0 | 버튼·탭·카드 제목 |
| chip | 13 / 18 | 500 | 0 | **칩 라벨**(색 이름) — 그리드 칩 아래, 카드 칩 옆 |
| caption | 12 / 16 | 400 | 0 | **카드 캡션**("클래식 1/3", 소재·핏 보조), 출처 표시 |

- 폰트: **Pretendard Variable**을 1순위. 로드는 jsDelivr CDN 동적 서브셋  
  `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css`  
  오프라인 원칙 때문에 CDN은 **있으면 쓰고 없으면 폰트 스택으로 폴백**(`font-display: swap`). C1 판단으로 `woff2` 서브셋(≈ 300KB)을 `public/fonts`에 자체 호스팅하고 SW precache에 넣는 쪽을 권장. 폴백 순서: `-apple-system`(iOS 산돌/Apple SD Gothic Neo) → `system-ui` → `Noto Sans KR` → `Malgun Gothic`.
- 행간 1.5 기본(한글 본문), 제목 1.35. `word-break: keep-all; overflow-wrap: anywhere;` 로 한글 단어 중간 줄바꿈 방지.
- 숫자 혼용 시 `font-variant-numeric: tabular-nums` (점수·탭 수 표시).
- 최소 글자 크기 12px. 칩 라벨 13px은 한 손·어두운 방 기준에서 읽히는 하한(P1 검토 시 14px 상향 가능).

---

## 3. 간격 · 반경 · 높이 · 터치 · 세이프에어리어

| 항목 | 값 | 비고 |
|---|---|---|
| 간격 스케일 | 4 / 8 / 12 / 16 / 24 / 32 / 48 | 4px 베이스. 화면 좌우 패딩 16, 카드 안 12, 칩 사이 8(그리드) / 6(카드 안) |
| 반경 | sm 8 (칩·작은 버튼) / md 12 (카드·버튼) / lg 16 (바텀시트 상단) / pill 999 (토글·배지) | 칩 그리드는 12, 카드 안 칩은 원(50%) |
| 높이(elevation) | 0 = `--bg-0` / 1 = `--bg-1` / 2 = `--bg-2` | 다크는 밝기 단계, 라이트는 `--shadow-1/2`로 표현. 3단 이상 금지 |
| 터치 타깃 | **최소 48×48**, 주요 버튼(카테고리 2×2, 결과 카드) 56 | 시각 크기가 작아도 hit area는 48 확보(`padding` 또는 `::after`) |
| 엄지 영역 | 주요 액션은 화면 하단 1/3, 하단 탭바 높이 56 + safe-bottom | D1 와이어프레임과 공유 |
| 세이프에어리어 | `viewport-fit=cover`; 상단 `padding-top: max(env(safe-area-inset-top), 44px)`(standalone일 때), 하단 `padding-bottom: max(env(safe-area-inset-bottom), 16px)` | iOS 26.1 회귀(gate-1 3-4) 대비해 `max()` 폴백 필수 |
| 포커스 | `outline: 2px solid var(--focus); outline-offset: 2px` | `:focus-visible`만 |
| 모션 | 120ms ease-out(칩 선택), 200ms(시트). `prefers-reduced-motion`이면 0 | |

---

## 4. 의류 32색 토큰

### 4-1. 조정 원칙

1. **화면은 다크 배경이 기본** → CSS/X11 값 중 채도·명도가 "페인트 칩"처럼 보이는 것은 실제 원단 톤으로 낮춤. 뉴트럴·어스 대부분은 유지.
2. 서로 이웃한 색(beige/oatmeal/tan/khaki, black/blackDenim/charcoal/navy)은 **색상(hue)으로 구분**되게 조정. 명도만으로는 다크 배경에서 구분이 안 되므로 1px 칩 테두리(5장)를 병행.
3. **표시용 블랙 규칙**: `black`의 표시값은 `#141414`. 데이터(JSON) 원본 hex는 `#000000`을 유지해도 되지만, 칩·실루엣·아이콘 등 **화면에 칠하는 값은 반드시 토큰(`--g-black`)을 사용**해 순흑이 배경에 녹지 않게 한다. 같은 이유로 `white`는 칩 테두리와 함께만 쓴다.
4. 원본 hex의 출처 플래그(`hexSource: css|wikipedia|approx`)는 C2 JSON에 유지. 아래 "조정 hex"가 UI 토큰이며, C2 `colors.json`의 `hex` 필드 값으로 이 열을 쓴다.

### 4-2. 표

| id | 한국어 | 원본 hex | 조정 hex | 변경 | 이유 |
|---|---|---|---|---|---|
| white | 화이트 | #FFFFFF | **#FFFFFF** | 유지 | 칩 테두리로 흰 카드에서 구분 |
| offWhite | 오프화이트 | #F2EDE4 | **#F2EDE4** | 유지 | 이미 원단 톤 |
| cream | 크림 | #FFFDD0 | **#F4ECC9** | 조정 | CSS 크림은 형광 연노랑에 가까움. 오프화이트와 색상 차(노란기)가 나도록 살짝 어둡고 탁하게 |
| oatmeal | 오트밀 | #D9CFC1 (근사) | **#CFC4B4** | 조정 | 니트 오트밀은 회색기 섞인 베이지. beige와 1.09:1로 붙어 있어 회색 쪽으로 분리 |
| beige | 베이지 | #F5F5DC | **#E3D5B5** | 조정 | CSS beige는 거의 흰색. 치노 베이지(모래빛)로 어둡게 (R1 권고) |
| khaki | 카키 | #C3B091 | **#BFAE8A** | 미세 | 탄과 분리되도록 살짝 녹기·회색기 |
| tan | 탄 | #D2B48C | **#D2B48C** | 유지 | 스웨이드 탄으로 적절 |
| camel | 카멜 | #C19A6B | **#C19A6B** | 유지 | |
| brown | 브라운 | #8B5A2B (근사) | **#8B5A2B** | 유지 | 코듀로이·가죽 중간 갈색으로 적절 |
| chocolate | 초콜릿 | #5C4033 | **#5C4033** | 유지 | |
| lightGrey | 라이트 그레이 | #D3D3D3 | **#D3D3D3** | 유지 | |
| greyMelange | 그레이 멜란지 | #A9A9A9 (근사) | **#A6A7AB** | 조정 | 멜란지는 약간 차가운 중회색. 라이트그레이(1.6:1)와 미드그레이 사이에 두고 푸른기 1단계 |
| midGrey | 미드 그레이 | #808080 | **#808080** | 유지 | |
| charcoal | 차콜 | #36454F | **#36454F** | 유지 | 푸른기 있는 차콜이 다크 배경에서 블랙과 구분에 유리 |
| black | 블랙 | #000000 | **#141414** | 표시용 | 순흑 금지. 데이터는 #000000 유지 가능(4-1 ③) |
| navy | 네이비 | #1F2A44 (근사) | **#1F2E50** | 조정 | 다크 배경에서 차콜·블랙과 구분되도록 파란기 1단계 ↑ (채도는 CSS navy의 절반 이하) |
| indigo | 인디고 데님 | #2E4A7D (근사) | **#2C4270** | 조정 | 원워시 진청은 더 탁함. 네이비와 명도 차 유지(1.35:1)하면서 채도 ↓ |
| midDenim | 미드워시 데님 | #1560BD | **#3E6AA6** | 조정 | Wikipedia 'Denim'은 염료색. 입은 중청은 밝고 회색기 |
| lightDenim | 라이트워시 데님 | #9DB9D4 (근사) | **#A3B9CF** | 미세 | 연청은 하늘색보다 회색기. skyBlue와 분리 |
| blackDenim | 블랙 데님 | #2B2B2B (근사) | **#2E2F33** | 조정 | 워시드 블랙은 살짝 푸른 회색. 표시용 블랙(#141414)과 1.38:1 분리 |
| lightBlue | 라이트 블루 | #ADD8E6 | **#B7CDE3** | 조정 | CSS lightblue는 시안기. 옥스포드 셔츠의 연한 파랑으로 |
| skyBlue | 스카이 블루 | #87CEEB | **#8CBDE0** | 조정 | 시안 → 파랑 쪽, 채도 ↓ |
| olive | 올리브 | #4B5320 | **#4B5320** | 유지 | 올리브 드랩 그대로 |
| forestGreen | 포레스트 그린 | #228B22 | **#1F4D2B** | 조정 | CSS forestgreen은 잔디색. R1 권고값(의류 보틀그린) 채택 |
| sage | 세이지 | #BCB88A | **#BCB88A** | 유지 | |
| burgundy | 버건디 | #800020 | **#722F37** | 조정 | 순색 와인은 다크 배경에서 진동. 와인/클라렛 원단 톤 |
| rust | 러스트 | #B7410E | **#A94E2B** | 조정 | 번트오렌지 채도 ↓, 갈색기 ↑ |
| mustard | 머스터드 | #FFDB58 | **#D4A12A** | 조정 | Wikipedia 머스터드는 형광 노랑. 니트·코듀로이 머스터드는 황토 쪽 |
| dustyPink | 더스티 핑크 | #D8A7A7 (근사) | **#D1A3A3** | 미세 | 살짝 탁하게 |
| lavender | 라벤더 | #E6E6FA | **#C7C1E0** | 조정 | CSS lavender는 거의 흰색이라 다크 배경에서 white와 구분 불가. 보라기 보이게 |
| teal | 틸 | #008080 | **#2A6F6F** | 조정 | 순색 틸 → 탁한 틸 |
| taupe | 토프 | #483C32 | **#483C32** | 유지 | |

조정 요약: 근사값 7개 전부(oatmeal, greyMelange, navy, indigo, lightDenim, blackDenim, dustyPink) + CSS/위키 과채도 13개(cream, beige, khaki, midDenim, lightBlue, skyBlue, forestGreen, burgundy, rust, mustard, lavender, teal, black 표시값) = **20개 조정, 12개 유지**.

### 4-3. 색 토큰 CSS

```css
:root {
  --g-white:#FFFFFF; --g-offWhite:#F2EDE4; --g-cream:#F4ECC9; --g-oatmeal:#CFC4B4; --g-beige:#E3D5B5;
  --g-khaki:#BFAE8A; --g-tan:#D2B48C; --g-camel:#C19A6B; --g-brown:#8B5A2B; --g-chocolate:#5C4033;
  --g-lightGrey:#D3D3D3; --g-greyMelange:#A6A7AB; --g-midGrey:#808080; --g-charcoal:#36454F; --g-black:#141414;
  --g-navy:#1F2E50; --g-indigo:#2C4270; --g-midDenim:#3E6AA6; --g-lightDenim:#A3B9CF; --g-blackDenim:#2E2F33;
  --g-lightBlue:#B7CDE3; --g-skyBlue:#8CBDE0; --g-olive:#4B5320; --g-forestGreen:#1F4D2B; --g-sage:#BCB88A;
  --g-burgundy:#722F37; --g-rust:#A94E2B; --g-mustard:#D4A12A; --g-dustyPink:#D1A3A3; --g-lavender:#C7C1E0;
  --g-teal:#2A6F6F; --g-taupe:#483C32;
}
```

라이트/다크에서 **의류 색은 바뀌지 않는다**(옷 색은 사실 정보). 바뀌는 건 칩 테두리와 배경뿐.

### 4-4. 계절 팔레트와의 연결 (color-rules 6장)

계절 토글은 색을 숨기지 않고 **순서와 강조**만 바꾼다: 계절 `seasons[]`에 있는 색을 칩 그리드 앞쪽에, 없는 색은 뒤쪽에 `opacity:.6`으로. (R1 엔진 규칙 "score −1"과 일치, 색 자체 금지는 안 함.)

---

## 5. 색 칩 스펙

| 항목 | 그리드 칩 (Quick 2탭 "색 고르기") | 카드 칩 (결과 카드) |
|---|---|---|
| 크기 | **56×56** (화면 폭 360 기준 4열, ≥ 400이면 64) | **24px 원** (카드 본문) / 28px (카드 확대·상세 시트) |
| 모양 | 둥근 사각 r=12 | 원 |
| 테두리 | 1px `--chip-border` (다크: 흰 28%, 라이트: 검정 14%) | 동일 |
| 라벨 | 칩 **아래** 중앙, chip 13/18, `--text-2`, 한 줄(두 줄 허용 최대) | 칩 **오른쪽** 6px 간격, chip 13/18. 어순 "색·소재·품목" (예: "인디고 데님 스트레이트") |
| 순서 | 계절 우선순위 → 톤 그룹(뉴트럴 → 어스 → 모노 → 네이비 → 파스텔 → 포인트) | 상의 → 하의 → 신발 → 아우터 (아우터 없으면 3개) |
| 터치 영역 | 칩 56 + 라벨 포함 세로 ≥ 80, 가로 ≥ 72 | 칩+라벨 전체가 탭 영역(≥ 48 높이), 탭하면 상세 시트 |
| 선택 상태 | 2px `--accent` 링(`outline`) + `outline-offset:2px`, 우상단 16px 체크 배지(`--accent` 바탕, `--on-accent` 체크) | 적용 안 함(카드 칩은 선택 불가) |
| 눌림 | `transform:scale(.96)` 120ms | — |
| **disputed** (출처 갈림) | 칩 우상단 14px 원형 배지 `?` (`--warn` 바탕, `#121212` 글자) + 라벨 끝에 "·이견" | 동일 배지 12px. 탭 시 시트에 이견 요약 |
| **피하기** (avoid, score ≤ 2) | 칩 `opacity:.45` + 좌상→우하 대각선 1.5px `--danger` + 라벨 `--danger` "피하기" 접두 | 카드엔 원래 안 나옴. "변주" 시트의 비교 행에서만: 칩 위 대각선 + "피하기" 캡션 |
| 변주(variation, score 3) | 라벨 앞 점(`•`) 없음, 섹션 헤더 "변주"로 구분 | 카드 헤더 캡션 "변주" (`--text-3`) |
| 접근성 | `role="radio"` + `aria-checked`, `aria-label="인디고, 네이비 베이스"` | `aria-label="상의: 화이트"` |

흰색 계열(white/offWhite/cream) 칩은 라이트 테마에서 테두리 `rgba(0,0,0,.14)`만으로 충분(검증: 데모 스와치). 검정 계열(black/blackDenim/charcoal/navy)은 다크 테마에서 테두리 없이는 배경 대비 1.1~1.4:1이라 **테두리를 끌 수 있는 옵션을 두지 않는다**.

---

## 6. 소재 패턴 오버레이 (SVG `<pattern>`)

### 6-1. 적용 방식 (C3)

1. 실루엣 path를 색으로 한 번 그린다: `<path d=… fill="var(--c-bottom)" …>`
2. **같은 d를 한 번 더** 그려 패턴으로 덮는다: `<path d=… fill="url(#pat-denim)" stroke="none" data-mat="denim">`
3. `<pattern>`은 앱 루트의 숨은 `<svg width="0" height="0"><defs>`에 한 번만 정의. 인라인 SVG끼리는 같은 문서라 `url(#id)` 참조가 된다. (`<img src=…svg>`로 쓰면 참조가 안 되므로 **실루엣은 반드시 인라인**.)
4. 선 색은 `currentColor` → 숨은 `<svg>`에 `color: var(--text-1)` 을 주면 다크(밝은 선)/라이트(어두운 선) 자동 대응. 투명도는 0.08~0.18로 묶어 색 칩과 어긋나 보이지 않게 한다.
5. 그라데이션 없음. 가죽 "광택"도 단색 사선 띠 2개로만.
6. 소재 id ↔ 패턴: `denim_indigo|denim_washed|denim_black → pat-denim`, `corduroy → pat-corduroy`, `knit_cotton|knit_wool|knit_cashmere → pat-knit`, `flannel|tweed → pat-flannel`, `linen → pat-linen`, `leather → pat-leather`. `chino|wool|jersey|nylon_tech` 은 패턴 없음(민무늬).
7. 크롭 기장일 때 패턴 레이어에도 같은 `clip-path`를 건다(7-3).

### 6-2. 스니펫 (그대로 복사)

```svg
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
  <!-- 데님 트윌: 45° 사선 -->
  <pattern id="pat-denim" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <line x1="1" y1="0" x2="1" y2="6" stroke="currentColor" stroke-opacity="0.18" stroke-width="1.2"/>
  </pattern>

  <!-- 코듀로이: 세로 골(웨일) -->
  <pattern id="pat-corduroy" width="5" height="5" patternUnits="userSpaceOnUse">
    <line x1="1" y1="0" x2="1" y2="5" stroke="currentColor" stroke-opacity="0.16" stroke-width="2"/>
  </pattern>

  <!-- 니트: V자 짜임(저지 스티치) -->
  <pattern id="pat-knit" width="6" height="4" patternUnits="userSpaceOnUse">
    <path d="M0 0 L3 3 L6 0" fill="none" stroke="currentColor" stroke-opacity="0.18" stroke-width="0.9" stroke-linejoin="round"/>
  </pattern>

  <!-- 플란넬: 굵고 흐린 체크 -->
  <pattern id="pat-flannel" width="18" height="18" patternUnits="userSpaceOnUse">
    <rect x="0" y="0" width="18" height="18" fill="currentColor" fill-opacity="0.04"/>
    <line x1="9" y1="0" x2="9" y2="18" stroke="currentColor" stroke-opacity="0.10" stroke-width="5"/>
    <line x1="0" y1="9" x2="18" y2="9" stroke="currentColor" stroke-opacity="0.10" stroke-width="5"/>
  </pattern>

  <!-- 린넨: 가로 결 + 끊어진 슬럽 -->
  <pattern id="pat-linen" width="10" height="8" patternUnits="userSpaceOnUse">
    <line x1="0" y1="2" x2="10" y2="2" stroke="currentColor" stroke-opacity="0.10" stroke-width="0.8"/>
    <line x1="0" y1="6" x2="10" y2="6" stroke="currentColor" stroke-opacity="0.14" stroke-width="0.8" stroke-dasharray="3 4"/>
    <line x1="4" y1="0" x2="4" y2="8" stroke="currentColor" stroke-opacity="0.08" stroke-width="0.6" stroke-dasharray="2 3"/>
  </pattern>

  <!-- 가죽: 단색 광택 띠 2개 (bounding box 기준, 반복 없음, 그라데이션 아님) -->
  <pattern id="pat-leather" width="1" height="1" patternContentUnits="objectBoundingBox">
    <path d="M0.18 0 L0.42 0 L0.30 1 L0.06 1 Z" fill="currentColor" fill-opacity="0.08"/>
    <path d="M0.62 0 L0.70 0 L0.58 1 L0.50 1 Z" fill="currentColor" fill-opacity="0.05"/>
  </pattern>

  <!-- 크롭 기장 클립 (7-3): 바지 / 상의 -->
  <clipPath id="clip-crop"><rect x="0" y="0" width="200" height="338"/></clipPath>
  <clipPath id="clip-top-crop"><rect x="0" y="0" width="200" height="184"/></clipPath>
</defs>
</svg>
```

패턴 타일은 viewBox 단위(200×400)이므로 그림을 60px로 줄이면 사선 간격이 ≈1.8px — 작은 썸네일에서는 "질감"으로만 남고 120px 이상에서 결이 보인다. 의도된 동작.

---

## 7. 실루엣 레이어 시스템 (`src/assets/silhouettes/`)

### 7-1. 규약

- 모든 파일 `viewBox="0 0 200 400"`, 한 파일 = 한 레이어 = `<path>` 1개(로퍼만 태슬 디테일 path 1개 추가). **총 27파일, path 28개** (상한 35).
- path 속성: `data-slot="base|top|bottom|shoes|outer"`, `data-fit`, `data-length`, `fill="var(--c-top, 폴백)"`, `stroke="currentColor" stroke-opacity="0.35" stroke-width="1" vector-effect="non-scaling-stroke"` → 어느 크기로 줄여도 선은 1px.
- 내부 솔기·주머니·끈은 **같은 path 안의 직선 서브패스**(면적 0 → fill 영향 없음, stroke만 보임). 곡선 서브패스는 넣지 않는다(nonzero 채움에 구멍이 생김).
- 쌓는 순서(z): `base → shoes → bottom → top → outer`. 하의 허리(y=176)는 상의 밑단(192/204) 아래, 바지 밑단(y=362)은 신발 윗선 위. 아우터는 앞이 V로 열려 상의가 비친다.
- `figure-base.svg`(머리·목·발목, `--c-skin`)는 선택. 카드에서는 켜고, 아이콘 크기 썸네일에서는 꺼도 된다.
- 폴백 fill(예: `#BBBBBB`)은 CSS 변수가 없을 때만 쓰이는 값.

### 7-2. 파일 목록

| slot | 파일 | data-fit | data-length | 한국어 |
|---|---|---|---|---|
| base | figure-base | — | — | 기본 몸 |
| top | top-tee-regular / top-tee-loose | regular / loose | regular | 티셔츠 |
| top | top-shirt-regular / top-shirt-loose | regular / loose | regular | 셔츠 |
| top | top-knit-regular / top-knit-loose | regular / loose | regular | 니트 |
| top | top-hoodie-regular / top-hoodie-loose | regular / loose | regular | 후디 |
| top | top-polo-regular / top-polo-loose | regular / loose | regular | 폴로 |
| bottom | bottom-straight | straight | regular | 데님·치노·슬랙스 공용 (소재는 패턴) |
| bottom | bottom-tapered | tapered | regular | |
| bottom | bottom-wide | wide | regular | |
| bottom | bottom-slim | slim | regular | |
| shoes | shoes-sneaker | — | — | sneakerWhite / sneakerColor 공용 (색만 다름) |
| shoes | shoes-running | — | — | 러닝화 |
| shoes | shoes-loafer (+ `data-detail="tassel"`) | — | — | loaferPenny = 기본 path만, loaferTassel = 태슬 path 표시 |
| shoes | shoes-derby | — | — | derby / oxford 공용 |
| shoes | shoes-chelsea / shoes-workboot / shoes-chukka / shoes-sandal | — | — | |
| outer | outer-short | regular | short | 블루종·데님 재킷 |
| outer | outer-regular | regular | regular | 블레이저·셔츠 재킷 |
| outer | outer-long | regular | long | 코트·트렌치 |
| outer | outer-puffer | regular | regular | 패딩 |

상의 핏 매핑: `slim → regular 파일`(실루엣 차이가 120px에서 안 보임), `oversized → loose 파일`. 하의 `regular → straight 파일`. 상의 기장 `crop/long`과 아우터 `short/regular/long`은 **별도 path 없이** 아래 clip/transform 규칙으로 처리한다.

### 7-3. 기장(`data-length`) 규칙

```css
/* 바지 크롭: 복사뼈 위에서 자르고 발목(base)을 보이게 */
[data-slot="bottom"][data-length="crop"],
[data-mat][data-length="crop"] { clip-path: url(#clip-crop); }   /* rect 0 0 200 338 */

/* 상의 크롭/롱: 밑단만 올리거나 내림 (허리 y≈176 기준) */
[data-slot="top"][data-length="crop"] { clip-path: url(#clip-top-crop); }               /* rect 0 0 200 184 → 밑단 y 184 */
[data-slot="top"][data-length="long"] { transform: scaleY(1.06); transform-origin: 50% 70px; } /* 밑단 ≈ y 199~212 */
```

- 바지 크롭은 **clipPath 고정 사각형**(y < 338)로 자른다. 모든 하의 밑단이 y=362라 핏과 무관하게 같은 위치에서 잘리고, 신발 윗선(338~356)과 발목이 드러난다. `data-mat` 패턴 레이어에도 같은 선택자를 건다.
- 상의 크롭도 같은 방식의 고정 사각형(y < 184)으로 자른다. `clip-path: inset(%)`는 SVG path에서 **path 자체의 bounding box 기준**이라 핏마다 잘리는 높이가 달라지므로 쓰지 않는다.
- 상의 `long`은 scaleY로 소매도 같이 늘어나지만 6%라 눈에 띄지 않는다. 더 정확히 하려면 2차에서 `-long` path 추가.
- 아우터 기장은 파일 자체가 다르므로 규칙 불필요. 바지 `nobreak/half/full`은 그림에 반영하지 않는다(캡션으로만).

### 7-4. 렌더 예 (C3 OutfitCard)

```html
<svg viewBox="0 0 200 400" width="120" height="240" role="img" aria-label="화이트 티셔츠, 인디고 데님 스트레이트, 흰 스니커즈"
     style="--c-top:var(--g-white);--c-bottom:var(--g-indigo);--c-shoes:var(--g-white);color:var(--text-1)">
  <!-- figure-base, shoes-sneaker, bottom-straight(+pat-denim 오버레이), top-tee-regular 의 path를 이 순서로 인라인 -->
</svg>
```

카드 그림 영역 배경은 `--bg-2`(한 단계 밝은 면)로 두어 블랙·네이비 옷이 카드에 묻지 않게 한다. 데모 파일 `silhouette-demo.html`에서 6개 조합·전 레이어 카탈로그·패턴·32색 칩을 다크/라이트로 확인할 수 있다.

---

## 8. 앱 아이콘 (`docs/design/app-icon.svg`)

- 512×512, maskable. 배경 `#1C1C1E` 전면, 앰버 해(`--accent`) + 오프화이트 티셔츠(실루엣과 같은 외곽선) + 인디고 띠. 모든 요소가 중심 반지름 204.8px 안전 원 안.
- manifest: `icons: [{src:'icon-192.png',sizes:'192x192',type:'image/png',purpose:'any maskable'},{src:'icon-512.png',sizes:'512x512',…}]`
- **apple-touch-icon 180×180 PNG**: 투명 없음, 모서리 각지게(iOS가 스쿼클 마스크를 씌움). `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`. 변환: `npx sharp-cli -i docs/design/app-icon.svg -o public/apple-touch-icon.png resize 180 180` 또는 Inkscape `-w 180 -h 180`.
- 스플래시(iOS): 배경 `#121212`, 가운데 아이콘 — C1이 `apple-touch-startup-image` 생성 시 같은 SVG 사용.

---

## 9. 다른 팀에 넘기는 것

| 받는 팀 | 항목 |
|---|---|
| C1 | 1-3 토큰 CSS, 4-3 색 CSS, 2장 폰트 로드 전략(자체 호스팅 권장), 3장 safe-area, 8장 아이콘 내보내기 |
| C2 | 4-2 "조정 hex" 열을 `colors.json.hex`로. `displayHex` 별도 필드 불필요(조정값이 곧 표시값). `hexSource` 플래그 유지 |
| C3 | 6장 패턴 defs, 7장 레이어 규약·z순서·크롭 clip, `src/assets/silhouettes/index.json`(레이어 색인) |
| D1 | 5장 칩 크기·라벨 위치·선택/이견/피하기 상태, 3장 터치 타깃 |
| 팀5 | 4-2 한국어 색 이름(= color-rules 1장), 신발·아우터 표기는 style-rules 8장 따름 |
| P2 | 1장 대비 수치(WCAG 계산값), 3장 터치 48px, 다크 기본 + 라이트 전환 |

미결: 액센트 색(앰버)은 가안. 팀 전체 취향 확인 후 바꿔도 되지만 **채도는 지금 수준 이하**로 유지(다크 배경 진동 방지).
