# 자산 시스템 v2 — 일러스트 언어·소재·액세서리·제작 파이프라인 (Phase 6-A/6-B · AS)

작성일: 2026-10-19 (6-A) · 갱신 2026-10-20 (6-B) · 담당: AS 자산 시스템
입력: `docs/phase6/00-plan.md`, `docs/design/design-tokens.md` 6·7장, `src/assets/silhouettes/` (v1 27파일), `src/ui/silhouette.js`·`typeToLayer.js`, `docs/architecture/data-schema.md` 2-5·2-8·2-9·2-10, 6-B: `docs/phase6/gate-5-review.md` 3-2, `docs/phase6/ad-concepts.md` 2장(시안 B)·`concept-b.html`, `docs/phase6/content-expansion.md` 3·4·5장
산출물: 이 문서, `src/assets/v2/*.svg` (**41 레이어**) + `src/assets/v2/index-v2.json`, `docs/phase6/asset-demo.html`, `scripts/check-assets.mjs`, `scripts/build-asset-demo.mjs`, `docs/design/app-icon.svg` + `public/icons/*.png`

> 한 줄 요약: v1의 계약(viewBox 200×400, `--c-*` 변수 채색, 허리 176 · 상의 밑단 192 · 바지 밑단 362 · crop 클립 338)은 그대로 두고, **몸(비례·팔·손·머리카락·그림자) → 선 → 음영 → 질감 → 액세서리**의 다섯 켜를 추가했다. 6-B 에서 **v1 폴백이 남아 있던 품목 9개(폴로 2핏·루즈 셔츠·루즈 후디·슬림·러닝·워크부츠·척카·샌들), 미드 레이어 3(가디건·베스트·오버셔츠, 새 슬롯 `mid`), 액세서리 변형 3(비니·크로스바디·백팩), 스튜디오 다크 연출 레이어 2(`stage-spotlight`·`stage-floor`), 무늬 패턴 5(스트라이프·핀스트라이프·깅엄·플레이드·하운드투스)** 를 더해 41 레이어 · 160 path · **45.0 KB**(예산 120 KB), 파일당 최대 1,490 B(예산 1,536 B). 전부 자체 제작 벡터, 옷에는 그라데이션·래스터·외부 참조 없음. 6-B 추가분은 **11장(스테이지)·12장(아이콘)·13장(FE 통합 메모)** 에 있다.

---

## 0. v1에서 무엇이 부족했나

| 항목 | v1 | v2 |
|---|---|---|
| 몸 | 머리 원 + 목 + 발목 사각형. 팔 없음 → 반팔이 "소매 끝에서 잘린" 느낌 | 8등신 크로키. 머리·머리카락·목·몸통·팔·손·발목 + 바닥 그림자. 반팔이면 팔뚝·손이, 긴팔이면 손만 보인다 |
| 선 | 외곽 1px .35 + 직선 솔기 몇 개 | 외곽 1.2px .45 + 디테일 1px .40(칼라·플래킷·커프·밑단·주머니·라펠) + 립 틱 + 단추 점 |
| 깊이 | 없음 (단색) | 옷마다 검정 18% **shade 서브패스**(오른쪽 면·칼라 아래·소매 안쪽) + 옷이 아래 옷에 드리우는 **cast shadow 띠** + 바닥 타원 그림자 + 선택 그레인 |
| 질감 | 6 패턴, 타일이 작아 120px에선 노이즈 | 8 패턴. 타일을 키우고 두 굵기 선·점을 섞어 300px에서 짜임이, 120px에서 결이 보임 |
| 품목 | 상의 5형 × 2핏, 하의 4, 신발 8, 아우터 4 | 프로토타입 17 의류 + **액세서리 6**(벨트·시계·양말·토트·캡·머플러). 슬롯·z순서·클립 규칙으로 더 늘릴 수 있음 |
| 검증 | 없음 | `scripts/check-assets.mjs` 가 viewBox·data-attr·fill 규약·금지 요소·바이트 예산을 검사하고 index를 생성 |

---

## 1. 마스터 그리드와 비례

### 1-1. 8등신 크로키 (7.5가 아닌 이유)

패션 크로키 8등신(머리 1H = 48 유닛)을 쓴다. 7.5등신은 "실제 사람"에 가깝지만 120px 썸네일에서 다리가 짧아 보이고, 바지 핏(스트레이트/테이퍼드/와이드)의 차이가 드러날 길이가 부족하다. 8등신은 가랑이~밑단 148 유닛을 확보해 핏 차이가 1px 선이 아니라 면으로 읽힌다. 9등신 이상은 "런웨이 과장"이라 아침 코디 앱의 중립성과 맞지 않는다.

### 1-2. 그리드 (viewBox 0 0 200 400, 중심 x=100)

| y | 의미 | 비고 |
|---|---|---|
| 8 / 55 | 머리 위 / 턱 | 머리 폭 38(x 81~119), 1H ≈ 48 |
| 7 ~ 31 | 머리카락 | `--c-hair` (기본 #2B2420). 옆머리가 31까지 |
| 50 ~ 84 | 목 | x 92~108. 상·하단 선은 머리·상의가 가린다 |
| 78 | **어깨선** | 어깨점 x 58 / 142 (의류), 팔 시작 x 60 / 140 (몸) |
| 82 ~ 180 | 몸통 | x 70~130. 항상 상의가 가린다 (상의 없는 조합 없음) |
| 80 → 168 → 216 | 팔: 어깨 → 팔꿈치 → 손목 | 바깥선 x 60→46→43, 안쪽선 66→62→58. 손 216~247 (폭 18) |
| 102 | 가슴 | 반팔 소매 끝 118~126 |
| 168 | 자연 허리 | 상의 밑단은 여기보다 아래 |
| **176** | 바지 허리선 (계약) | 벨트 176~186, tuck 클립 y<176 |
| **192** | 상의 밑단 regular (계약) | loose 204, 상의 crop 클립 y<184 |
| 214 | 가랑이 | 긴팔 커프 214(상의) / 218~220(아우터) |
| 212 ~ 220 | 아우터 밑단 (regular) | 블레이저 214, 패딩 212, 숏 198, 롱 300 |
| 292 | 무릎 | 테이퍼드는 여기서 꺾인다 |
| **338** | 바지 crop 클립 (계약) | 양말 334~358이 이 아래로 드러남 |
| 330 ~ 366 | 발목 (몸) | x 76~96 / 104~124 |
| **356** | 신발 윗선 (계약) | 첼시 338, 로퍼 362, 더비 360 |
| **362** | 바지 밑단 (계약) | 신발과 6 겹침 |
| 392 | 바닥 | 밑창 392, 그림자 타원 중심 392 |

굵게 표시한 다섯 값이 v1과 같은 **계약선**이다. v1 레이어와 v2 레이어를 섞어도 허리·밑단·신발이 맞물린다(데모 1장에서 확인).

### 1-3. 포즈 — 왜 "정면·A포즈·무게 중립"인가

- 정면, 두 발 평행(간격 6), 팔은 몸에서 살짝 벌려 내린다(손목에서 몸통까지 12). 좌우 대칭 ±1 유닛 이내.
- **레이어링이 포즈를 결정한다.** 한쪽 다리에 무게를 싣거나 팔을 접으면 바지·소매가 레이어마다 다른 각도로 그려져야 하고, 아우터가 상의를 덮는 영역이 조합마다 달라진다. 중립 포즈는 "모든 상의가 같은 어깨점(58,78)에서 시작하고, 모든 하의가 같은 허리(68~132, y176)에서 시작한다"는 단순한 규칙으로 24개 레이어가 어떤 조합이든 맞물리게 한다.
- 빛은 **왼쪽 위**에서 온다(고정). 음영은 항상 그림의 오른쪽 면과 겹침 아래에 둔다. 포즈가 고정이라 음영 방향도 고정할 수 있다.
- 머리는 얼굴 이목구비 없음(중립). 머리카락은 짧은 투블럭 실루엣 한 가지. 피부·머리색은 변수(`--c-skin`, `--c-hair`)라 테마/사용자 설정으로 바꿀 수 있다.

---

## 2. 선 시스템

| 종류 | 속성 | 어디에 |
|---|---|---|
| 외곽 | `stroke="currentColor" stroke-opacity=".45" stroke-width="1.2"` + `vector-effect="non-scaling-stroke"` | main 파트. 크기와 무관하게 1.2px. `<g>`에 두고 상속 |
| 디테일 | `stroke-opacity=".4" stroke-width="1"` non-scaling | 칼라 잎, 플래킷 2줄, 커프 선, 밑단 스티치, 주머니, 라펠·노치, 암홀 솔기, 바지 요크·플라이·주머니 곡선, 신발 끈·토캡·굽 |
| 립 틱 | `stroke-width="5" stroke-dasharray="1 2.5" stroke-opacity=".22"` (scaling) | 니트·후디·양말·머플러 끝단. 굵은 선에 짧은 대시를 주면 세로 틱이 된다. non-scaling을 **쓰지 않아** 300px에서만 또렷 |
| 단추 점 | `stroke-width="3" stroke-dasharray="0.1 14" stroke-linecap="round"` (scaling) | 셔츠·재킷·코트. 길이 0.1 대시 + 둥근 캡 = 점. Chrome·Safari·librsvg 모두 렌더 확인 |

- `currentColor`는 렌더러가 `color: var(--text-1)`로 주므로 다크에서 밝은 선, 라이트에서 어두운 선이 된다(v1과 동일).
- 디테일 선은 **면적이 없는 열린 서브패스**다. 닫힌 사각형(주머니)은 `fill="none"` 파트에만 둔다. main 파트의 d 안에 곡선 서브패스를 넣으면 nonzero 채움에 구멍이 생기므로 금지(v1 규칙 유지).
- 120px(뷰박스 0.3배)에서는 디테일 선이 0.3 유닛 간격으로 뭉치지 않도록 **선 사이 최소 간격 6 유닛**(= 1.8px). 플래킷 2줄(97/103)·립 밴드(184/192)가 이 기준.

---

## 3. 깊이

### 3-1. shade 서브패스 (옷마다 1 path)

- `<path data-part="shade" fill="rgba(0,0,0,.18)" stroke="none">`. **검정 반투명**이라 `--c-*`가 바뀌어도 색상은 유지되고 명도만 18% 내려간다. `currentColor`로 하면 다크 테마에서 밝아지므로 쓰지 않는다. 신발 밑창·시계 다이얼은 .25~.40.
- 배치 규칙 (빛 왼쪽 위 고정)
  1. **오른쪽 면 띠**: 몸통 오른쪽 10~12 유닛, 오른 소매 안쪽 6 유닛, 오른 다리 바깥 6 유닛. 다리 사이(왼 다리 안쪽)도 6 유닛.
  2. **겹침 아래 초승달**: 목 립 아래, 칼라 잎 아래, 후드 앞쪽 아래, 패딩 배플 사이.
  3. **cast shadow 띠**: 옷의 밑단 바로 아래 6 유닛(상의 밑단 192→198, 아우터 214→220, 트렌치 300→306, 반팔 소매 끝 아래 5). 이 띠는 **자기 레이어 밖**(아래 옷 위)에 그려지므로 레이어 순서가 곧 그림자 순서가 된다. crop 클립이 걸리면 함께 잘린다.
- 검정 옷(#141414)에서는 18% 음영이 거의 안 보인다. 의도된 동작 — 실제 검정 옷이 그렇다. 라이트 테마에서는 외곽선이 그 역할을 한다.

### 3-2. 바닥 그림자

`figure-base`에 타원 두 장(`data-part="shadow"`, rx 62/44, 검정 .10/.14)을 겹쳐 가장자리를 부드럽게 한다. 필터(feGaussianBlur)를 쓰지 않는 이유: 레이어 파일이 외부 `<filter id>`를 참조하면 defs가 없는 환경(테스트·스토리북·`<img>`)에서 요소 자체가 안 그려진다. 두 겹 평면 타원은 의존성이 없다.

### 3-3. 그레인 (선택, 2~3%)

- 레이어 파일에는 **넣지 않는다**. 렌더러가 전체 `<g>`에 `filter="url(#f-grain)"`을 거는 방식(데모 defs 참조): `feTurbulence(fractalNoise .9)` → 알파만 남긴 검정 → `SourceAlpha`로 마스크 → 원본 위에 합성. 그림 알파 안에서만 2~3% 어두워져 "종이 인쇄" 느낌이 난다.
- Chrome·Safari에서 렌더 확인. 비용이 있으므로 **300px 상세 카드에서만, 화면당 ≤ 3개**. 120px 썸네일·리스트에는 끄고, `prefers-reduced-motion`과 무관하지만 `prefers-reduced-transparency`/저사양이면 끈다. 데모에서 그레인을 켜면 40개 그림에 동시에 걸려 느려지는 것이 그 증거다.
- 라이트 테마에서는 흰 옷 위에서 더 눈에 띈다. 알파 상한 .12(데모 값)를 넘기지 않는다.

### 3-4. 그라데이션

쓰지 않는다. 평면 shade 서브패스로 충분히 입체감이 나고, 토큰 원칙(그라데이션 금지)과도 맞는다. 꼭 필요하면 `<g data-gradient="ok">` 플래그를 달아야 검증기가 통과시키지만, 현재 0개.

---

## 4. 레이어 파일 규약 v2 (contract)

### 4-1. 구조

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" aria-label="셔츠 (레귤러)">
<!-- morning-coordi v2 / original artwork -->
<g data-slot="top" data-type="shirt" data-fit="regular" data-length="regular"
   stroke="currentColor" stroke-opacity=".45" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round">
  <path data-part="main"   fill="var(--c-top,#BBBBBB)" vector-effect="non-scaling-stroke" d="…"/>
  <path data-part="shade"  fill="rgba(0,0,0,.18)" stroke="none" d="…"/>
  <path data-part="detail" fill="none" stroke-opacity=".4" stroke-width="1" vector-effect="non-scaling-stroke" d="…"/>
  <path data-part="detail" data-kind="buttons" fill="none" stroke-opacity=".5" stroke-width="3" stroke-dasharray="0.1 14" d="…"/>
</g>
</svg>
```

- **한 파일 = `<g>` 하나 = 레이어 하나.** 속성은 `<g>`에: `data-slot`(필수), `data-type`(필수), `data-fit`/`data-length`(top·bottom·outer 필수). v1은 `<path>`에 있었다 → 렌더러가 `g[data-slot]`을 통째로 복제한다(4-4).
- `data-part`: `main`(색 변수 채움, 여러 개 가능) · `shade` · `detail` · `shadow`(base만). `data-kind`는 main의 부속 색(`hair`, `sole`, `metal`)과 detail의 종류(`rib`, `buttons`)를 표시. **패턴 오버레이는 `data-kind`가 없는 main에만** 건다(밑창·버클·머리카락에 데님 결이 생기지 않게).
- `data-detail="tassel"` 같은 **선택 파트**는 렌더러가 `layer.detail`과 일치할 때만 남긴다(v1 로퍼 규칙 그대로).
- 금지: `id`, `<linearGradient|radialGradient>`(플래그 없이), `<image|filter|foreignObject|text|style|script>`, `href`. XML 선언·`role` 생략(바이트).
- 색 변수와 폴백: `--c-skin #C9A98C` · `--c-hair #2B2420` · `--c-top` · `--c-bottom` · `--c-shoes` · `--c-sole #ECE9E2` · `--c-outer` · **`--c-mid #999999`**(6-B) · `--c-belt #3B2F26` · `--c-watch #2A2622` · `--c-metal #C8C6C0` · `--c-socks #D9D5CC` · `--c-bag #CFC4B4` · `--c-cap #1F2E50` · `--c-scarf #722F37` · **`--stage-glow #FFE6BE`**(6-B, stage 전용 — 시안 B `--spot` 의 색 성분). `--c-sole`·`--c-metal`·`--c-hair`는 tokens.css에 추가(다크/라이트 동일, metal은 라이트에서 #A8A6A0 권장). `--c-skin` 은 base 외에 `shoes-sandal`(맨발 파트, `data-kind="skin"`)도 쓴다.
- 6-B 에 추가된 `data-kind`: `skin`(샌들 발). 선택 파트 추가: `mid-vest` 의 `data-detail="quilt"`(퀼팅 베스트일 때만 가로 누빔선).

### 4-2. 네이밍

`<slot>-<type>[-<fit>].svg` — `figure-base`, `top-tee-regular`, `top-knit-loose`, `bottom-wide`, `shoes-chelsea`, `outer-long`, `acc-belt`, `mid-cardigan`, `stage-spotlight`. 액세서리는 전부 `acc-` 접두사(슬롯은 `data-slot`으로 구분), 미드 레이어는 `mid-`, 연출 레이어는 `stage-`. **상의 기장 파일은 만들지 않는다** — crop 은 클립(y<184), long 은 transform(4-3)으로 어떤 상의 파일에나 걸린다(tee·knit·polo·shirt·hoodie 전부). 검증기가 접두사↔슬롯을 대조한다.

### 4-3. z순서 · 클립 · 가시성 규칙

```
stage → base → cap → socks → shoes → bottom → belt → top → mid → outer → scarf → bag → watch
```

(6-B: `stage` 가 맨 앞, `mid` 가 top 과 outer 사이. `index-v2.json.zOrder` 가 원본.)

| 규칙 | CSS/속성 | 설명 |
|---|---|---|
| 바지 crop | `g[data-slot=bottom]` `clip-path:url(#clip-crop)` (y<338) | 발목·양말 노출 (v1 동일) |
| 상의 crop | `clip-path:url(#clip-top-crop)` (y<184) | v1 동일. tee·knit·polo·shirt·hoodie 어느 파일에나 적용 — 별도 crop 파일 없음 |
| 상의 tuck | `clip-path:url(#clip-top-tuck)` (y<176) | **신설.** 벨트를 보이려면 상의를 허리선에서 자른다. `outfit.items[top].tuck === true` 또는 벨트 아이템이 있으면 자동 |
| 상의 long | `transform: translate(0 70) scale(1 1.06) translate(0 -70)` | v1 동일 |
| 벨트 | bottom 뒤, top 앞 | tuck이 아니면 상의 밑단에 가려 안 보임 → 렌더러는 tuck일 때만 그린다 |
| 양말 | base 뒤, shoes 앞 | 바지가 crop일 때만 그린다(아니면 바지에 가려짐) |
| 캡 | base 바로 뒤 | 머리카락 위. 후드 로브(y≥56)와 겹치지 않음 |
| 머플러 | outer 뒤 | 목(y 54~80)과 가슴 위 꼬리(80~142). 아우터 칼라 위에 두른 모습 |
| 토트백 | scarf 뒤 | 그림 왼쪽(인물 오른 어깨). 손을 덮는다 |
| 시계 | 맨 마지막 | 그림 오른쪽(인물 왼 손목) y 214~225. 긴팔 커프(214~220)에 살짝 걸친다 |
| 아우터 + 루즈 상의 | 매핑 규칙 | 루즈 상의 소매(x 34)가 아우터 소매(x 36)보다 넓어 어깨 옆으로 1~3 유닛 비친다. **아우터가 있으면 상의는 regular 파일**을 쓴다(아우터가 핏을 가리므로 정보 손실 없음). 미드가 있을 때도 같다(미드 몸통 x 38~162) |
| 미드 (6-B) | top 뒤, outer 앞 | `items[].category === "mid"` 0~1개. 색 변수 `--c-mid`. 밑단 198~204(상의 192 아래, 아우터 regular 214 위). `outer-short`(밑단 198)와 겹치면 미드 밑단이 2~6 유닛 비친다 — 의도(블루종 아래 가디건). 베스트는 소매가 없어 상의 소매가 그대로 보인다 |
| 모자 변형 (6-B) | cap 슬롯 | `acc-cap`(볼캡) 또는 `acc-beanie`(비니, y 2~37). 둘 다 머리카락 위, 후드 로브(y≥56)와 안 겹침 |
| 가방 변형 (6-B) | bag 슬롯 | `acc-bag`(토트, 그림 왼쪽) · `acc-crossbody`(어깨 (60,84) → 허리 (160,206) 대각 스트랩 + 파우치) · `acc-backpack`(가슴 어깨끈 2 + 가슴 스트랩 + 목 뒤로 비치는 팩 상단 y 64~76). 한 번에 하나 |
| 스테이지 (6-B) | base 앞 | `stage-spotlight` → `stage-floor` 순. 옷 조합과 무관, 렌더러 옵션(`opts.stage`)으로 켠다. 11장 |

### 4-4. 렌더러 변경안 (FE 팀, `src/ui/silhouette.js`) — 이 문서는 src/ui를 수정하지 않는다

1. `RAW` glob을 `../assets/v2/*.svg`로(또는 플래그로 v1/v2 전환). `pathsOf()` 대신 `groupOf(file)`: `doc.querySelector('g')`를 importNode 해 캐시.
2. `appendPaths` → `appendLayer(svg, g, item, patternId)`: `g.cloneNode(true)`; `[data-detail]` 중 `layer.detail`과 다른 것 제거; 패턴이 있으면 `path[data-part="main"]:not([data-kind])` 각각 뒤에 `fill="url(#pat2-x)" stroke="none" data-part="mat"` 복제를 **main 바로 뒤**(shade·detail 앞)에 삽입; `applyLength`는 `<g>`에 건다.
3. `Z_ORDER`를 `index-v2.json.zOrder`로. 액세서리는 `items[].category ∈ belt|watch|socks|bag|cap|scarf`로 받고 색 변수 `--c-<slot>` 주입. 벨트·양말 가시성 규칙(4-3)을 렌더러가 적용.
4. `patternDefs.js`에 5장의 v2 defs와 `clip-top-tuck` 추가. 그레인 필터는 `opts.grain`일 때만 스택 `<g>`에 건다.
5. `typeToLayer.js`: ~~polo·slim·running·workboot·chukka·sandal 임시 폴백~~ → **6-B 에서 전부 제작됐으므로 폴백 삭제.** 완전한 type → file 표는 13장(FE 통합 메모).
6. `aria-label`은 v1처럼 svg 루트에 조합 문장으로. 레이어 파일의 `aria-label`은 index의 `labelKo` 원본일 뿐이다.

---

## 5. 소재 패턴 v2

전부 `currentColor` 저투명도 선·점. id는 `pat2-*`로 v1과 공존. 데모 3장에서 스와치와 적용 예 확인. 소재 id 매핑: `denimIndigo|denimWashed|denimBlack → pat2-denim`, `corduroy → pat2-corduroy`, `knitCotton|knitWool → pat2-knit` (knitCashmere는 민무늬), `flannel → pat2-flannel`, `tweed → pat2-tweed`, `linen → pat2-linen`, `leather → pat2-leather`, `nylonTech → pat2-ripstop`, `chino|wool|jersey` 민무늬.

```svg
<pattern id="pat2-denim" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(62)">
  <line x1="2" y1="0" x2="2" y2="8" stroke="currentColor" stroke-opacity=".15" stroke-width="1.4"/>
  <line x1="6" y1="0" x2="6" y2="8" stroke="currentColor" stroke-opacity=".07" stroke-width=".7"/>
</pattern>  <!-- 트윌은 45°가 아니라 ~62°. 굵은 선+가는 선 = 능직 -->
<pattern id="pat2-corduroy" width="6" height="6" patternUnits="userSpaceOnUse">
  <rect width="2.6" height="6" fill="currentColor" fill-opacity=".13"/>
  <line x1="4.2" y1="0" x2="4.2" y2="6" stroke="currentColor" stroke-opacity=".05" stroke-width=".6"/>
</pattern>  <!-- 웨일(골) 2.6 + 하이라이트 -->
<pattern id="pat2-knit" width="12" height="10" patternUnits="userSpaceOnUse">
  <line x1="1" y1="0" x2="1" y2="10" stroke="currentColor" stroke-opacity=".12"/>
  <line x1="11" y1="0" x2="11" y2="10" stroke="currentColor" stroke-opacity=".12"/>
  <path d="M3 0 L9 5 L3 10 M9 0 L3 5 L9 10" fill="none" stroke="currentColor" stroke-opacity=".14" stroke-linejoin="round"/>
</pattern>  <!-- 립 2줄 사이 케이블 X -->
<pattern id="pat2-flannel" width="24" height="24" patternUnits="userSpaceOnUse">
  <rect width="24" height="24" fill="currentColor" fill-opacity=".03"/>
  <line x1="12" y1="0" x2="12" y2="24" stroke="currentColor" stroke-opacity=".09" stroke-width="8"/>
  <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" stroke-opacity=".09" stroke-width="8"/>
  <line x1=".6" y1="0" x2=".6" y2="24" stroke="currentColor" stroke-opacity=".14" stroke-width="1.2"/>
  <line x1="0" y1=".6" x2="24" y2=".6" stroke="currentColor" stroke-opacity=".14" stroke-width="1.2"/>
</pattern>  <!-- 굵은 띠 + 가는 오버체크 = 타탄 -->
<pattern id="pat2-linen" width="12" height="9" patternUnits="userSpaceOnUse">
  <line x1="0" y1="2.5" x2="12" y2="2.5" stroke="currentColor" stroke-opacity=".10" stroke-width=".8"/>
  <line x1="0" y1="6.5" x2="12" y2="6.5" stroke="currentColor" stroke-opacity=".10" stroke-width=".8"/>
  <line x1="0" y1="4.5" x2="12" y2="4.5" stroke="currentColor" stroke-opacity=".16" stroke-width="1.6" stroke-dasharray="3 9"/>
  <line x1="0" y1="8.5" x2="12" y2="8.5" stroke="currentColor" stroke-opacity=".14" stroke-width="1.4" stroke-dasharray="2 10" stroke-dashoffset="5"/>
  <line x1="5" y1="0" x2="5" y2="9" stroke="currentColor" stroke-opacity=".06" stroke-width=".6" stroke-dasharray="2 3"/>
</pattern>  <!-- 가로 결 + 굵은 슬럽 2단 -->
<pattern id="pat2-leather" width="1" height="1" patternContentUnits="objectBoundingBox">
  <path d="M.14 0 L.40 0 L.26 1 L0 1 Z" fill="currentColor" fill-opacity=".09"/>
  <path d="M.60 0 L.68 0 L.56 1 L.48 1 Z" fill="currentColor" fill-opacity=".06"/>
  <path d="M.78 0 L.82 0 L.74 1 L.70 1 Z" fill="currentColor" fill-opacity=".04"/>
</pattern>  <!-- 광택 띠 3개 (bbox 기준, 그라데이션 아님) -->
<pattern id="pat2-ripstop" width="8" height="8" patternUnits="userSpaceOnUse">
  <line x1=".5" y1="0" x2=".5" y2="8" stroke="currentColor" stroke-opacity=".10" stroke-width=".8"/>
  <line x1="0" y1=".5" x2="8" y2=".5" stroke="currentColor" stroke-opacity=".10" stroke-width=".8"/>
  <line x1="4.5" y1="0" x2="4.5" y2="8" stroke="currentColor" stroke-opacity=".04" stroke-width=".5"/>
  <line x1="0" y1="4.5" x2="8" y2="4.5" stroke="currentColor" stroke-opacity=".04" stroke-width=".5"/>
</pattern>  <!-- 굵은 격자 + 가는 보조 격자 -->
<pattern id="pat2-tweed" width="10" height="10" patternUnits="userSpaceOnUse">
  <path d="M0 10 L10 0" fill="none" stroke="currentColor" stroke-opacity=".06"/>
  <circle cx="2" cy="2" r=".9" fill="currentColor" fill-opacity=".18"/>
  <circle cx="7" cy="6" r="1.1" fill="currentColor" fill-opacity=".12"/>
  <circle cx="4" cy="8" r=".7" fill="currentColor" fill-opacity=".08"/>
  <circle cx="8.5" cy="1" r=".8" fill="currentColor" fill-opacity=".10"/>
</pattern>  <!-- 헤링본 힌트 + 플렉 4점 -->
<clipPath id="clip-top-tuck"><rect x="0" y="0" width="200" height="176"/></clipPath>
```

스케일 원칙: 타일은 viewBox 유닛. 120px(0.3배)에서 8유닛 타일 = 2.4px → 결로만 보이고, 300px(0.75배)에서 6px → 짜임이 보인다. 투명도 합계는 한 지점에서 .20을 넘지 않게(색 칩과 어긋나 보이지 않도록). 패턴 복제 path는 **main 바로 뒤**에 넣어 shade·선이 질감 위에 오게 한다(v1은 선 위에 패턴이 올라 흐려졌다).

### 5-1. 무늬 패턴 (6-B) — `pat2-stripe` · `pat2-pinstripe` · `pat2-gingham` · `pat2-plaid` · `pat2-houndstooth`

소재 결(5장)과 달리 **두 번째 색**이다. `OutfitItem.pattern`(content-expansion 4-1: breton·stripeShirt·pinstripe·gingham·plaid·houndstooth…)에서 온다. 전부 `currentColor` 이므로 렌더러가 오버레이 path 에 `style.color = <패턴 색>` 을 준다(소재 결은 `color: var(--text-1)` 상속 그대로). 소재 결과 **동시에** 걸 수 있다(예: 데님 + 핀스트라이프는 아니지만, 린넨 + 깅엄). 아래 블록은 `scripts/build-asset-demo.mjs` 의 `PATTERN_DEFS_V2` 와 바이트 단위로 같다 — FE 는 이 블록을 `patternDefs.js` 로 복사한다.

```svg
<pattern id="pat2-stripe" width="4" height="14" patternUnits="userSpaceOnUse">
  <rect x="0" y="0" width="4" height="5" fill="currentColor" fill-opacity=".85"/>
</pattern>  <!-- 브레통: 가로 띠 5 / 간격 9. 120px 에서 4.2px 주기, 300px 에서 10.5px -->
<pattern id="pat2-pinstripe" width="8" height="8" patternUnits="userSpaceOnUse">
  <line x1="1" y1="0" x2="1" y2="8" stroke="currentColor" stroke-opacity=".55" stroke-width=".9"/>
</pattern>  <!-- 핀스트라이프: 세로 .9 / 8. 120px 에선 결, 300px 에서 선 -->
<pattern id="pat2-gingham" width="12" height="12" patternUnits="userSpaceOnUse">
  <rect x="0" y="0" width="6" height="12" fill="currentColor" fill-opacity=".36"/>
  <rect x="0" y="0" width="12" height="6" fill="currentColor" fill-opacity=".36"/>
</pattern>  <!-- 깅엄: 세로띠 × 가로띠 겹침 = 3단(바탕 / .36 / .59) -->
<pattern id="pat2-plaid" width="32" height="32" patternUnits="userSpaceOnUse">
  <rect x="0" y="0" width="14" height="32" fill="currentColor" fill-opacity=".30"/>
  <rect x="0" y="0" width="32" height="14" fill="currentColor" fill-opacity=".30"/>
  <line x1="23" y1="0" x2="23" y2="32" stroke="currentColor" stroke-opacity=".45" stroke-width="1.6"/>
  <line x1="0" y1="23" x2="32" y2="23" stroke="currentColor" stroke-opacity=".45" stroke-width="1.6"/>
</pattern>  <!-- 플레이드(버팔로+오버체크): 굵은 띠 14 + 가는 선 -->
<pattern id="pat2-houndstooth" width="16" height="16" patternUnits="userSpaceOnUse">
  <path d="M0 0h8v2h-8zM12 0h4v2h-4zM0 2h10v2h-10zM14 2h2v2h-2zM0 4h12v2h-12zM0 6h8v2h-8zM10 6h4v2h-4zM0 8h4v2h-4zM2 10h4v2h-4zM4 12h4v2h-4zM0 14h2v2h-2zM6 14h2v2h-2z" fill="currentColor" fill-opacity=".8"/>
</pattern>  <!-- 하운드투스: 2/2 능직 × 4올 체크를 실제로 시뮬레이션한 8×8 비트맵(셀 2). 120px 4.8px 타일 = 질감, 300px 12px = 이빨이 보임 -->
```

| `pattern` id (CX 4-1) | defs | 기본 패턴 색 (옷 색 기준) | 비고 |
|---|---|---|---|
| breton | pat2-stripe | 바탕 white/offWhite → navy · 바탕 navy → offWhite | 상의만 |
| stripeShirt | pat2-pinstripe | 셔츠 바탕 → midDenim/navy | 잔줄 셔츠. 핀스트라이프와 defs 공유(색만 다름) |
| pinstripe | pat2-pinstripe | charcoal/navy 바탕 → offWhite | 하의·블레이저 |
| gingham | pat2-gingham | white → midDenim/navy/forestGreen/burgundy | |
| plaid | pat2-plaid | burgundy/forestGreen/navy 바탕 → black | 버팔로 체크 |
| windowpane | pat2-plaid 의 line 2개만(FE 가 rect 없이 쓰거나 opacity .3 rect 를 0 으로) | 바탕 → offWhite | 별도 defs 없이 대응 가능. 필요하면 2차에 `pat2-windowpane` |
| houndstooth | pat2-houndstooth | offWhite 바탕 → black (모노) | |
| herringbone | pat2-tweed(소재 결) | — | "질감"이라 패턴 수에 안 세는 것과 일치 |
| camo | — | — | 6-B 범위 밖(점수 규칙에만 존재). 민무늬로 그린다 |

렌더러 규칙: 패턴 오버레이 색은 데모의 `contrastOf(옷 색)`(명도 > 140 → navy, 아니면 offWhite)을 기본으로 두고, CX `patterns.json.colorsTypical` 이 오면 그것을 우선한다. 신발·벨트에는 걸지 않는다(CX 규칙 "신발·벨트는 항상 무지"). 데모 3장에서 120px/300px 모두 확인.

---

## 6. 액세서리 슬롯

| slot | 파일 | 색 변수 | 위치(y) | 노출 조건 | 데이터 연결(CX 팀) |
|---|---|---|---|---|---|
| belt | acc-belt | `--c-belt` + `--c-metal` 버클 | 176~186 (+그림자 190) | 상의 tuck | `items[].category:"belt"`, color, `top.tuck` |
| watch | acc-watch | `--c-watch` 스트랩 + `--c-metal` 케이스 | 214~225, x 141~159 | 항상 | category `watch` |
| socks | acc-socks | `--c-socks` | 334~358 | 바지 crop | category `socks` |
| bag | acc-bag (tote) · **acc-crossbody** · **acc-backpack** (6-B) | `--c-bag` | 토트: 어깨 82 → 178~242, x 26~68 · 크로스바디: 스트랩 (60,84)→(140,176) + 파우치 x 126~162, y 176~206 · 백팩: 어깨끈 x 66~80 / 120~134, y 80~160 + 팩 상단 y 64~76 | 항상 | category `bag`, `accessoryTypes` bagTote·bagBriefcase → tote, bagCrossbody → crossbody, bagBackpack → backpack |
| cap | acc-cap · **acc-beanie** (6-B) | `--c-cap` | 캡 5~46 · 비니 2~37 | 항상 | category `hat`(CX group) → cap 슬롯. cap → acc-cap, beanie → acc-beanie, bucketHat → acc-cap(임시) |
| scarf | acc-scarf | `--c-scarf` | 54~142 | 항상 (겨울) | category `scarf` |

### 6-1. 미드 슬롯 (6-B) — content-expansion 5장 `midTypes` 5종 → 파일 3

| 파일 | data-type | 덮는 midType | 모양 |
|---|---|---|---|
| mid-cardigan | cardigan | cardigan, knitOverShirt | V 오픈(y 72→130) + 단추 5 + 주머니 2 + 립 밑단 200·커프. 소매 x 38~162 |
| mid-vest | vest | knitVest, quiltedVest(`detail:"quilt"`) | 민소매 V넥, 암홀 곡선, 밑단 198. quilt 디테일은 가로 누빔선 4 + 중앙선 |
| mid-overshirt | overshirt | overshirtMid | 칼라 + 플래킷 + 가슴 주머니 2, 밑단 204(outer-short 198 보다 아래, outer-regular 214 보다 위) |

`knitOverShirt`(셔츠 위 니트)는 품목이 "니트"지만 미드 자리에 들어가므로 `mid-cardigan` 이 아니라 **`top-knit-regular` 를 mid 슬롯에 그려도 된다** — 다만 `--c-top` 변수를 쓰므로 렌더러가 `--c-mid` 로 치환해야 한다. 단순함을 위해 1차 매핑은 `mid-cardigan`.

확장 후보(같은 규칙으로 추가 가능): 선글라스(cap 뒤, y 28~36), 안경, 넥타이(top 뒤·outer 앞, 플래킷 위 y 96~190, `dressShirtTie`와 연결), 버킷햇(cap 슬롯), 브리프케이스(bag, 손에 드는 형태).

---

## 7. 바이트 예산

| 항목 | 목표 | 현재 |
|---|---|---|
| 레이어 1개 | ≤ 1,536 B (1.5 KB) | 최대 1,490 B (figure-base), 6-B 신규 최대 1,400 B (top-polo-loose), 중앙값 ≈ 1,160 B |
| v2 전체 | ≤ 120 KB | 6-A 24 파일 26,369 B → **6-B 41 파일 46,071 B (45.0 KB)**. 신규 17 파일 19,702 B |
| 번들 영향 | gzip JS 예산 120 KB 안 | SVG 문자열은 gzip에서 ~1/4로 줄어 ≈ 12 KB. v1(≈ 21 KB raw, ≈ 5 KB gzip)을 지우면 순증 ≈ 7 KB gzip |

바이트를 줄인 기법: 선 속성을 `<g>`에 올려 상속, 정수 좌표, 명령 사이 공백 제거, Q 곡선 우선(C는 머리에만), 주석 한 줄, XML 선언·role 생략, 대칭이어도 좌우를 따로 쓰되 서브패스 하나로.

---

## 8. 제작 파이프라인

1. **마스터 그리드로 손 제작**: 1-2 표의 y값과 x 대칭(x' = 200 − x)을 지키며 path d를 직접 쓴다(또는 Figma/Illustrator에서 200×400 아트보드 + 가이드 → SVG 내보내기 → 정리). 새 의류는 가장 가까운 기존 파일을 복제해 main → shade → detail 순으로 고친다.
2. **4-1 구조로 정리**: `<g data-*>` + 파트 3종. id·그라데이션·필터 금지.
3. **검증**: `node scripts/check-assets.mjs` — viewBox, 슬롯별 필수 data-attr, main fill 형식, shade fill 형식, detail fill none, 금지 요소, id, 파일·총 바이트, path·명령 수를 표로 출력. 오류면 종료 코드 1(CI에 넣는다).
4. **index 생성**: `node scripts/check-assets.mjs --write-index` → `src/assets/v2/index-v2.json`(v1 index와 같은 모양 + `type`, `bytes`, `shade`, `details`, `optionalDetails`, `zOrder`, `colorVars`, `parts`).
5. **데모 재생성·육안 확인**: `node scripts/build-asset-demo.mjs` → `docs/phase6/asset-demo.html`(v1·v2 소스 인라인, 디스크에서 열림). 120px·300px, 다크·라이트, 그레인, 마스터 그리드를 토글하며 본다. 래스터 확인이 필요하면 `sharp`(devDependency)로 SVG→PNG.
6. **package.json 제안**: `"assets:check": "node scripts/check-assets.mjs"`, `"assets:index": "node scripts/check-assets.mjs --write-index"`, `"assets:demo": "node scripts/build-asset-demo.mjs"`.

### 8-1. `check-assets.mjs` 출력 (2026-10-20, 6-B)

```
file                   slot    type     fit      len      paths   m/s/d  cmds  bytes  status
--------------------------------------------------------------------------------------------
stage-spotlight.svg    stage   spotlight -        -            8   8/0/0    32   1376  ok
stage-floor.svg        stage   floor    -        -            4   0/4/0    16    678  ok
figure-base.svg        base    figure   -        -            6   3/3/0    69   1490  ok
acc-beanie.svg         cap     beanie   -        -            4   1/1/2    27    944  ok
acc-cap.svg            cap     cap      -        -            3   1/1/1    23    767  ok
acc-socks.svg          socks   socks    -        -            4   1/1/2    28    914  ok
shoes-chelsea.svg      shoes   chelsea  -        -            3   1/1/1    64   1061  ok
shoes-chukka.svg       shoes   chukka   -        -            3   1/1/1    57   1053  ok
shoes-derby.svg        shoes   derby    -        -            3   1/1/1    52   1025  ok
shoes-loafer.svg       shoes   loafer   -        -            4   2/1/1    64   1192  ok
shoes-running.svg      shoes   running  -        -            4   2/1/1    77   1322  ok
shoes-sandal.svg       shoes   sandal   -        -            4   2/1/1    65   1160  ok
shoes-sneaker.svg      shoes   sneaker  -        -            4   2/1/1    61   1213  ok
shoes-workboot.svg     shoes   workboot -        -            3   1/1/1    69   1158  ok
bottom-slim.svg        bottom  trouser  slim     regular      3   1/1/1    40    928  ok
bottom-straight.svg    bottom  trouser  straight regular      3   1/1/1    36    910  ok
bottom-tapered.svg     bottom  trouser  tapered  regular      3   1/1/1    40    937  ok
bottom-wide.svg        bottom  trouser  wide     regular      3   1/1/1    36    900  ok
acc-belt.svg           belt    belt     -        -            5   2/1/2    24    963  ok
top-hoodie-loose.svg   top     hoodie   loose    regular      4   1/1/2    79   1376  ok
top-hoodie-regular.svg top     hoodie   regular  regular      4   1/1/2    79   1367  ok
top-knit-loose.svg     top     knit     loose    regular      4   1/1/2    56   1208  ok
top-knit-regular.svg   top     knit     regular  regular      4   1/1/2    56   1199  ok
top-polo-loose.svg     top     polo     loose    regular      5   1/1/3    72   1400  ok
top-polo-regular.svg   top     polo     regular  regular      5   1/1/3    72   1389  ok
top-shirt-loose.svg    top     shirt    loose    regular      4   1/1/2    66   1256  ok
top-shirt-regular.svg  top     shirt    regular  regular      4   1/1/2    66   1247  ok
top-tee-loose.svg      top     tee      loose    regular      3   1/1/1    53   1015  ok
top-tee-regular.svg    top     tee      regular  regular      3   1/1/1    53   1018  ok
mid-cardigan.svg       mid     cardigan regular  regular      5   1/1/3    65   1383  ok
mid-overshirt.svg      mid     overshirt regular  regular      4   1/1/2    71   1278  ok
mid-vest.svg           mid     vest     regular  regular      5   1/1/3    47   1279  ok
outer-long.svg         outer   coat     regular  long         4   1/1/2    89   1379  ok
outer-puffer.svg       outer   puffer   regular  regular      3   1/1/1    88   1350  ok
outer-regular.svg      outer   blazer   regular  regular      4   1/1/2    71   1282  ok
outer-short.svg        outer   jacket   regular  short        4   1/1/2    80   1339  ok
acc-scarf.svg          scarf   scarf    -        -            4   1/1/2    31    920  ok
acc-backpack.svg       bag     backpack -        -            3   1/1/1    41    887  ok
acc-bag.svg            bag     tote     -        -            3   1/1/1    24    774  ok
acc-crossbody.svg      bag     crossbody -        -            3   1/1/1    30    828  ok
acc-watch.svg          watch   watch    -        -            4   2/1/1    22    906  ok
--------------------------------------------------------------------------------------------
layers 41 · paths 160 · total 46071 B (45.0 KB, budget 120 KB) · max file 1490 B (budget 1536 B) · errors 0 · warnings 0
```

(`m/s/d` = main / shade+shadow / detail path 수, `cmds` = path 명령 수. 6-A 대비 `bottom-tapered` 가 930 → 937 B: 왼 다리 바깥 밑단점 (76,362) 누락 수정.)

검증기 6-B 변경: 슬롯 `mid`(`--c-mid`, fit·length 필수)·`stage`(`<g stroke="none">` 필수, main fill 은 `var(--stage-*,#hex)`, shadow 만으로도 통과) 등록, z순서에 stage·mid 추가, stage 안 정렬(spotlight → floor), `index-v2.json` 에 `stage`(권장 불투명도) 블록과 `colorVars` 에 `--c-mid`·`--stage-glow` 추가.

---

## 9. 프로토타입 목록과 품목 매핑

| v2 파일 | 덮는 데이터 enum | 비고 |
|---|---|---|
| figure-base | — | 머리·머리카락·목·몸통·팔·손·발목·그림자. `--c-skin`, `--c-hair` |
| top-tee-regular / -loose | tee, tank, henley | 크루넥 립, 소매 스티치, 밑단 스티치. loose는 드롭숄더 |
| top-shirt-regular / **-loose** | oxfordShirt, dressShirt, dressShirtTie, linenShirt, flannelShirt, denimShirt | 칼라 잎 + V 트임(피부), 플래킷 2줄 + 단추, 가슴 주머니, 커프, 셔츠테일 곡선. loose(6-B)는 드롭숄더 + 밑단 204 + 소매 218 |
| top-knit-regular / -loose | knitWool, knitCotton, knitCashmere, sweatshirt | 립 밴드 틱(목·밑단·커프). loose는 드롭숄더 |
| **top-polo-regular / -loose** (6-B) | poloPique, poloWool | 셔츠 칼라(y 62~94) + 짧은 플래킷(94~122) + 단추 2 + 반팔 립 커프. 몸은 tee 와 같은 어깨·밑단(192 / 204) |
| top-hoodie-regular / **-loose** | hoodie | 후드 로브가 목 뒤에 접힌 모습(머리를 가리지 않음), 드로스트링, 캥거루 주머니, 립. loose(6-B)는 드롭숄더 + 밑단 206 + 소매 220 |
| bottom-slim / -straight / -tapered / -wide | bottomFit **slim**(6-B) / straight·regular / tapered / wide | 요크, 플라이 곡선, 앞주머니 곡선, 벨트 루프 3, 밑단 선. slim 은 허벅지 133·무릎 127·밑단 121(테이퍼드 135·129·124) |
| shoes-sneaker | sneakerWhite, sneakerColor | 흰 밑창 파트(`--c-sole`), 끈 3, 토캡, 설포 선 |
| **shoes-running** (6-B) | running | 두꺼운 미드솔(378~392, `--c-sole`) + 어두운 아웃솔 띠, 측면 곡선, 힐 카운터, 끈 3 |
| shoes-loafer | loaferPenny, loaferTassel(`detail:"tassel"`) | 모카 솔기, 페니 스트랩, 태슬 선택 |
| shoes-chelsea | chelsea | y 338부터 — 발목을 덮음. 고무 거싯(음영) + 풀탭 |
| **shoes-workboot** (6-B) | workboot | y 336부터, 레이스 4단 + 웰트 선 + 러그솔 띠(.25) |
| **shoes-chukka** (6-B) | chukka | y 346부터, 2아일릿 레이스 + 쿼터 곡선 |
| **shoes-sandal** (6-B) | sandal | 풋베드 382~392 + X 스트랩 2 + **맨발 파트**(`data-kind="skin"`, `--c-skin`, 364~382). 바지 regular(밑단 362)와도 맞물림 |
| shoes-derby | derby, oxford | 토캡, 쿼터, 오픈 레이싱 2줄 |
| **mid-cardigan / mid-vest / mid-overshirt** (6-B) | midTypes 5종 (6-1) | top 뒤·outer 앞. `--c-mid` |
| **acc-beanie / acc-crossbody / acc-backpack** (6-B) | hat beanie / bagCrossbody / bagBackpack | cap · bag 슬롯 변형 |
| **stage-spotlight / stage-floor** (6-B) | — (렌더러 옵션) | 11장 |
| outer-short | denimJacket, coachJacket, blouson, leatherJacket | 칼라 잎, 단추 플래킷, 가슴 플랩 주머니 2, 요크, 립 밑단 198 |
| outer-regular | blazer, shirtJacket, cardigan, overshirt, peacoat, fleece | 노치 라펠, 단추 2, 가슴 웰트, 플랩 주머니 2, 밑단 214 |
| outer-long | trench, chesterfield, balmacaan, duffle, longPuffer(임시) | 라펠, 더블 단추 2열, 벨트+버클, 견장, 플랩 주머니, 밑단 300 |
| outer-puffer | shortPuffer | 스탠드 칼라, 가로 배플 4 + 소매 배플 4, 배플 사이 음영 |
| acc-belt / -watch / -socks / -bag / -cap / -scarf | (CX 확장 스키마) | 6장 |

**2차 제작 목록**: ~~① top-polo ② bottom-slim ③ shoes-running·workboot·chukka·sandal ④ top-hoodie-loose·top-shirt-loose ⑥ 비니·크로스바디~~ (6-B 완료). 남은 것: ⑤ outer-long-puffer(배플 + 300, 현재 longPuffer → outer-puffer) · 넥타이·선글라스·버킷햇·브리프케이스 · `pat2-windowpane`·camo · 히어로/빈 상태 그래픽·아이콘 세트(같은 선 시스템: 1.2px 외곽 + .18 shade, 24px 그리드) — 별도 문서.

---

## 10. 알려진 한계 · 결정 필요

1. **루즈 상의 + 아우터**: 4-3 규칙(아우터가 있으면 regular 파일)으로 피한다. 루즈 전용 아우터(oversized outer)를 만들면 해제 가능.
2. **후드 표현**: 후드를 머리 뒤에 그릴 수 없어(머리가 먼저 그려짐) 목 뒤에 접힌 로브로 표현했다. 머리를 top 뒤로 옮기는 대안은 캡·머플러 z순서를 흔들어 채택하지 않았다.
3. **피부·머리색**: 변수라 사용자 설정(온보딩 "나와 비슷하게")으로 확장 가능하지만 UX 팀 결정 사항.
4. **그레인·필터**: 300px 카드 ≤ 3개 제한. QA 팀이 저사양 기기에서 확인.
5. **왼손목 시계·오른어깨 가방**: 인물 기준 왼손목(그림 오른쪽), 오른어깨(그림 왼쪽)로 고정. 크로스바디는 반대(인물 왼어깨 → 오른쪽 허리). 좌우 옵션은 2차.
6. `.claude/launch.json`은 데모 확인용 Vite 항목(`dev`, 5173)으로 갱신했다. 이전 내용이 필요하면 복구. 데모는 `http://localhost:5173/docs/phase6/asset-demo.html` 로도 열린다.
7. (6-B) **백팩 + 셔츠 칼라**: 팩 상단(y 64~76)이 셔츠·후디 칼라 위에 그려진다(bag 이 outer 뒤라서). 120px 에서는 안 보이고 300px 에서 2~3px. 신경 쓰이면 렌더러가 `acc-backpack` 의 세 번째 서브패스를 빼도 된다(단일 main path 라 현재는 불가 → 필요 시 `data-detail="top"` 으로 분리).
8. (6-B) **샌들 + 긴 바지**: 바지 밑단 362 아래로 발(364~382)이 보인다 — 실제와 같음. crop·nobreak 과 조합이 자연스럽다.
9. (6-B) **미드 + outer-short**: 미드 밑단(198~204)이 숏 아우터(198) 아래로 비친다. CX 규칙 "regular 미드 + short 아우터 = block" 과 일치하므로 추천에 안 나온다.
10. (6-B) **stage 와 필터**: `stage-spotlight` 는 평면 타원 8겹이라 300px 에서 블러 없이 보면 테가 살짝 보인다(데모 6장 가운데 카드). 11장의 CSS `filter: blur(6px)` 를 300px 에서 켜면 사라진다. 120px 에서는 블러 없이도 안 보인다.

---

## 11. 스튜디오 다크 스테이지 레이어 (6-B) — `stage-spotlight` · `stage-floor`

시안 B(`ad-concepts.md` 2장, `concept-b.html` `.plate`)의 "인물 뒤 타원 스포트라이트 + 바닥 그림자"를 **레이어 파일**로 옮긴 것. 플레이트 CSS(`radial-gradient` + `::after` blur)로도 같은 그림이 나오지만, 레이어로 두면 (1) 실루엣 svg 하나에 조명이 들어가 `<img>`·공유 카드·스토리북에서도 같은 룩이고, (2) 스포트라이트가 옷 바로 뒤에 붙어 `drop-shadow` 와 함께 "서 있는 사람"으로 읽히며, (3) 모션 스펙의 "조명이 600ms 늦게 켜짐"을 `g[data-slot=stage]` 의 opacity 트랜지션 하나로 구현할 수 있다.

| 파일 | data-type | 구성 | 색 | 누적 중심 알파(불투명도 1일 때) |
|---|---|---|---|---|
| stage-spotlight | spotlight | 타원 8겹, 중심 (100,140)(가슴), rx 98→28 · ry 160→48, 각 fill-opacity .035 | `var(--stage-glow,#FFE6BE)` = 시안 B `--spot` 의 색 성분 | ≈ .25 |
| stage-floor | floor | 타원 4겹 `data-part="shadow"`, 중심 (100,390), rx 88→34 · ry 10→4, .12/.14/.16/.18 | 검정 | ≈ .48 |

규약: `<g data-slot="stage" data-type stroke="none">`, 선·디테일 없음, 그라데이션 없음(id 금지 규칙 때문에 레이어 파일에서는 radialGradient 를 참조할 수 없다 → 계단 타원). 두 파일 모두 figure-base 의 바닥 타원(.10/.14, rx 62/44)과 **같이** 쓴다 — figure-base 쪽이 발 바로 아래 접지 그림자, stage-floor 가 플레이트의 넓은 그림자.

### 11-1. 권장 불투명도 (index-v2.json `stage` 블록과 동일)

| 크기 | spotlight opacity | spotlight blur | floor opacity | floor blur | 결과 |
|---|---|---|---|---|---|
| 120px 카드 (플레이트 92×130) | **.55** | 없음 | **.8** | 없음 | 중심 ≈ 14% 따뜻한 백색(시안 B 17% 와 플레이트 `rgba(0,0,0,.28)` 합산 시 동등). 계단 안 보임 |
| 300px 상세 | **.75** | `filter: blur(6px)` | **1** | `filter: blur(3px)` | 중심 ≈ 19%. 블러로 테 제거. 블러는 `g[data-slot=stage]` 에만 — 옷에 걸지 않는다 |
| 라이트 테마 | 0 (끔) | — | .5 | — | 밝은 바탕에서 글로우는 의미 없음. 바닥 그림자만 |
| `prefers-reduced-transparency` / `data-perf="low"` | .55 / .75 그대로 | **없음** | 그대로 | **없음** | 블러 필터만 끈다 |

렌더러(FE) 규칙:

```js
// silhouette.js — opts.stage: false | 'card' | 'detail'
if (opts.stage) for (const s of ['spotlight', 'floor']) {
  const g = groupOf(`stage-${s}`).cloneNode(true);
  const k = opts.stage === 'detail' ? 'detail300' : 'card120';
  g.style.opacity = index.stage[s].opacity[k];
  if (index.stage[s].blur[k] !== '0' && !lowPerf) g.style.filter = `blur(${index.stage[s].blur[k]})`;
  stack.prepend(g);            // base 보다 먼저 → zOrder[0] === 'stage'
}
```

- 그레인 필터(`#f-grain`)는 `SourceAlpha` 마스크라 스테이지 알파 안에도 노이즈가 생긴다 — 시안 B 의 "화면 전체 7% 그레인"과 겹치므로 상세에서 둘 중 하나만 켠다(권장: 화면 그레인만).
- 스포트라이트 위쪽(y −20)은 viewBox 밖이라 잘린다 — 의도(탑라이트). svg 에 `overflow:visible` 을 주지 않는다.
- 색 변수 `--stage-glow` 는 tokens.css 에 `#FFE6BE`(다크) 로 추가. 라이트는 사용 안 함.
- 데모 6장: 시안 B CSS 플레이트 / stage 레이어 / stage + 그레인 세 카드를 나란히, 300px 상세 3개.

---

## 12. 앱 아이콘 (6-B, 시안 B 언어) — `docs/design/app-icon.svg` → `public/icons/`

| 요소 | 값 | 안전 영역(중심 256, r 204.8) |
|---|---|---|
| 배경 | `#0E0F12` 전면 + 좌상단 아침빛 radial 11% + 인물 뒤 스포트라이트 radial 20% (따뜻한 백색 #FFE6BE) | 가장자리까지 채움(maskable) |
| 해 | 앰버 `#E8B964` r 118, 중심 (256,214) + 글로우 링 .30 | 최상단 y 96 → 거리 160 ✓ |
| 티셔츠 | `#F4F2ED`, 외곽 `#0E0F12` 2.5, 오른쪽 면 음영 .10, 솔기 .35 (top-tee-regular 외곽선 ×2.2) | 모서리 (139,400) → 거리 186 ✓ |
| 바닥 그림자 | 타원 rx 112 ry 11 검정 .55 + feGaussianBlur 7 | |

그라데이션은 배경·조명에만(원칙 유지), 티셔츠는 단색. 6-A 아이콘(#1C1C1E 바탕, 인디고 띠)과의 차이: 바탕이 깊은 차콜, 해가 더 따뜻·진한 앰버, 스포트라이트·바닥 그림자로 "스튜디오" 깊이, 인디고 띠 제거(아이콘 크기에서 노이즈).

`npm run icons` 결과 (2026-10-20): `icon-192.png` 192×192 opaque 12.0 KB · `icon-512.png` 512×512 opaque 43.6 KB · `icon-512-maskable.png` 512×512 opaque 43.6 KB · `apple-touch-icon.png` 180×180 opaque 11.1 KB. 원형 마스크·안전 영역 원을 씌워 확인(해·티셔츠 모두 안). `scripts/make-icons.mjs` 의 `BG='#1C1C1E'` 플래튼 색은 SVG 배경이 불투명이라 결과에 영향 없음 — 원하면 `#0E0F12` 로 맞추면 된다(AS 소유 아님). `manifest.webmanifest`·`index.html` 의 `theme-color` 다크 값을 `#0E0F12` 로 바꾸는 것은 FE 몫.

---

## 13. FE 통합 메모 (6-B) — 임시 폴백 제거용

### 13-1. 신규 레이어 id 17

`top-polo-regular` `top-polo-loose` `top-shirt-loose` `top-hoodie-loose` `bottom-slim` `shoes-running` `shoes-workboot` `shoes-chukka` `shoes-sandal` `mid-cardigan` `mid-vest` `mid-overshirt` `acc-beanie` `acc-crossbody` `acc-backpack` `stage-spotlight` `stage-floor`
(수정: `bottom-tapered` 밑단점. 나머지 24 는 6-A 그대로.)

### 13-2. `typeToLayer.js` 기대 매핑 (type id → 파일, 확장자 제외)

**top** — `top-<shape>-<fit>`. shape: tee·shirt·knit·polo·hoodie (5), fit: regular·loose (2) → 10 파일 전부 존재. `TOP_FIT = { slim:'regular', regular:'regular', loose:'loose', oversized:'loose' }` 유지. 기장은 파일이 아니라 클립/transform(crop → `#clip-top-crop`, long → `translate(0 70) scale(1 1.06) translate(0 -70)`, tuck → `#clip-top-tuck`).

| topType | shape | 파일 (regular / loose) |
|---|---|---|
| tee, tank, henley | tee | top-tee-regular / top-tee-loose |
| sweatshirt, knitWool, knitCotton, knitCashmere | knit | top-knit-regular / top-knit-loose |
| poloPique, poloWool | **polo** | **top-polo-regular / top-polo-loose** |
| oxfordShirt, dressShirt, dressShirtTie, linenShirt, flannelShirt, denimShirt | shirt | top-shirt-regular / **top-shirt-loose** |
| hoodie | hoodie | top-hoodie-regular / **top-hoodie-loose** |

**bottom** — `BOTTOM_FIT = { slim:'bottom-slim', tapered:'bottom-tapered', regular:'bottom-straight', straight:'bottom-straight', wide:'bottom-wide' }` (slim 폴백 제거). 기장 crop → `#clip-crop`, nobreak/half/full 은 파일 동일.

**shoes** — `SHOE_LAYER`:

| shoeType | 파일 | detail |
|---|---|---|
| sneakerWhite, sneakerColor | shoes-sneaker | |
| running | **shoes-running** | |
| loaferPenny | shoes-loafer | |
| loaferTassel | shoes-loafer | `tassel` |
| derby, oxford | shoes-derby | |
| chelsea | shoes-chelsea | |
| workboot | **shoes-workboot** | |
| chukka | **shoes-chukka** | |
| sandal | **shoes-sandal** | (맨발 파트가 `--c-skin` 을 읽는다 — svg 루트에 변수가 있어야 함) |

**outer** — 변경 없음: denimJacket·coachJacket·blouson·leatherJacket → outer-short · cardigan·shirtJacket·blazer·overshirt·peacoat·fleece → outer-regular · trench·chesterfield·balmacaan·duffle → outer-long · shortPuffer·longPuffer → outer-puffer.

**mid** (신규, `item.category === 'mid'`, `item.itemType` = midType) — 색 변수 `--c-mid`:

| midType | 파일 | detail |
|---|---|---|
| cardigan | mid-cardigan | |
| knitOverShirt | mid-cardigan | (6-1 참조: 2차에 `top-knit-regular` 재사용 가능) |
| knitVest | mid-vest | |
| quiltedVest | mid-vest | `quilt` |
| overshirtMid | mid-overshirt | |

**accessories** (`item.category` = CX group → 슬롯, `item.itemType` = accessoryTypes id) — 색 변수 `--c-<slot>`:

| accessoryTypes id | slot | 파일 | 가시성 |
|---|---|---|---|
| beltLeather, beltBraided, beltWebbing | belt | acc-belt | 상의 tuck 일 때만 |
| watchLeather, watchMetal, watchNato | watch | acc-watch | 항상 |
| socksMatch, socksNeutral, socksPattern, socksWhite | socks | acc-socks | 바지 crop 일 때만 |
| socksNoShow | socks | — (그리지 않음) | |
| bagTote, bagBriefcase | bag | acc-bag | 항상 |
| bagCrossbody | bag | **acc-crossbody** | 항상 |
| bagBackpack | bag | **acc-backpack** | 항상 |
| cap, bucketHat | cap | acc-cap | 항상 |
| beanie | cap | **acc-beanie** | 항상 |
| scarf | scarf | acc-scarf | 항상 |

**stage** — 아이템이 아니라 렌더 옵션(`opts.stage: 'card' | 'detail'`): `stage-spotlight`, `stage-floor` (11장).

**pattern** (`item.pattern` → defs id, 5-1): breton → pat2-stripe · stripeShirt, pinstripe → pat2-pinstripe · gingham → pat2-gingham · plaid, windowpane → pat2-plaid · houndstooth → pat2-houndstooth · herringbone → pat2-tweed · camo → null. 오버레이 path 에 `style.color = 패턴 색`.

### 13-3. 렌더러 체크리스트

1. `Z_ORDER` → `index.zOrder` (stage, mid 포함). `groups[slot]` 을 배열로(stage 2개).
2. `--c-mid`, `--stage-glow` 변수 주입. `--c-skin` 은 항상(샌들).
3. `patternDefs.js` 에 5-1 의 5 패턴 추가(이 문서 블록 = `build-asset-demo.mjs` `PATTERN_DEFS_V2`).
4. `typeToLayer.js` 폴백 6개 삭제, `MID_LAYER`·`ACC_LAYER` 추가(13-2).
5. `layer.detail` 매칭: `tassel`(로퍼) 에 `quilt`(베스트) 추가 — 로직은 동일.
6. v1 `src/assets/silhouettes/` 삭제는 게이트 5 결정대로 6-B 완료 후.
