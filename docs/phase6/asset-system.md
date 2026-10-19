# 자산 시스템 v2 — 일러스트 언어·소재·액세서리·제작 파이프라인 (Phase 6-A · AS)

작성일: 2026-10-19 · 담당: AS 자산 시스템
입력: `docs/phase6/00-plan.md`, `docs/design/design-tokens.md` 6·7장, `src/assets/silhouettes/` (v1 27파일), `src/ui/silhouette.js`·`typeToLayer.js`, `docs/architecture/data-schema.md` 2-5·2-8·2-9·2-10
산출물: 이 문서, `src/assets/v2/*.svg` (24 레이어) + `src/assets/v2/index-v2.json`, `docs/phase6/asset-demo.html`, `scripts/check-assets.mjs`, `scripts/build-asset-demo.mjs`

> 한 줄 요약: v1의 계약(viewBox 200×400, `--c-*` 변수 채색, 허리 176 · 상의 밑단 192 · 바지 밑단 362 · crop 클립 338)은 그대로 두고, **몸(비례·팔·손·머리카락·그림자) → 선 → 음영 → 질감 → 액세서리**의 다섯 켜를 추가했다. 24 레이어 · 89 path · **25.8 KB**(예산 120 KB), 파일당 최대 1,490 B(예산 1,536 B). 전부 자체 제작 벡터, 그라데이션·래스터·외부 참조 없음.

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
- 색 변수와 폴백: `--c-skin #C9A98C` · `--c-hair #2B2420` · `--c-top` · `--c-bottom` · `--c-shoes` · `--c-sole #ECE9E2` · `--c-outer` · `--c-belt #3B2F26` · `--c-watch #2A2622` · `--c-metal #C8C6C0` · `--c-socks #D9D5CC` · `--c-bag #CFC4B4` · `--c-cap #1F2E50` · `--c-scarf #722F37`. `--c-sole`·`--c-metal`·`--c-hair`는 tokens.css에 추가(다크/라이트 동일, metal은 라이트에서 #A8A6A0 권장).

### 4-2. 네이밍

`<slot>-<type>[-<fit>].svg` — `figure-base`, `top-tee-regular`, `top-knit-loose`, `bottom-wide`, `shoes-chelsea`, `outer-long`, `acc-belt`. 액세서리는 전부 `acc-` 접두사(슬롯은 `data-slot`으로 구분). 길이 변형이 필요한 상의(`-long`)는 2차에 `top-shirt-regular-long`처럼 뒤에 붙인다. 검증기가 접두사↔슬롯을 대조한다.

### 4-3. z순서 · 클립 · 가시성 규칙

```
base → cap → socks → shoes → bottom → belt → top → outer → scarf → bag → watch
```

| 규칙 | CSS/속성 | 설명 |
|---|---|---|
| 바지 crop | `g[data-slot=bottom]` `clip-path:url(#clip-crop)` (y<338) | 발목·양말 노출 (v1 동일) |
| 상의 crop | `clip-path:url(#clip-top-crop)` (y<184) | v1 동일 |
| 상의 tuck | `clip-path:url(#clip-top-tuck)` (y<176) | **신설.** 벨트를 보이려면 상의를 허리선에서 자른다. `outfit.items[top].tuck === true` 또는 벨트 아이템이 있으면 자동 |
| 상의 long | `transform: translate(0 70) scale(1 1.06) translate(0 -70)` | v1 동일 |
| 벨트 | bottom 뒤, top 앞 | tuck이 아니면 상의 밑단에 가려 안 보임 → 렌더러는 tuck일 때만 그린다 |
| 양말 | base 뒤, shoes 앞 | 바지가 crop일 때만 그린다(아니면 바지에 가려짐) |
| 캡 | base 바로 뒤 | 머리카락 위. 후드 로브(y≥56)와 겹치지 않음 |
| 머플러 | outer 뒤 | 목(y 54~80)과 가슴 위 꼬리(80~142). 아우터 칼라 위에 두른 모습 |
| 토트백 | scarf 뒤 | 그림 왼쪽(인물 오른 어깨). 손을 덮는다 |
| 시계 | 맨 마지막 | 그림 오른쪽(인물 왼 손목) y 214~225. 긴팔 커프(214~220)에 살짝 걸친다 |
| 아우터 + 루즈 상의 | 매핑 규칙 | 루즈 상의 소매(x 34)가 아우터 소매(x 36)보다 넓어 어깨 옆으로 1~3 유닛 비친다. **아우터가 있으면 상의는 regular 파일**을 쓴다(아우터가 핏을 가리므로 정보 손실 없음) |

### 4-4. 렌더러 변경안 (FE 팀, `src/ui/silhouette.js`) — 이 문서는 src/ui를 수정하지 않는다

1. `RAW` glob을 `../assets/v2/*.svg`로(또는 플래그로 v1/v2 전환). `pathsOf()` 대신 `groupOf(file)`: `doc.querySelector('g')`를 importNode 해 캐시.
2. `appendPaths` → `appendLayer(svg, g, item, patternId)`: `g.cloneNode(true)`; `[data-detail]` 중 `layer.detail`과 다른 것 제거; 패턴이 있으면 `path[data-part="main"]:not([data-kind])` 각각 뒤에 `fill="url(#pat2-x)" stroke="none" data-part="mat"` 복제를 **main 바로 뒤**(shade·detail 앞)에 삽입; `applyLength`는 `<g>`에 건다.
3. `Z_ORDER`를 `index-v2.json.zOrder`로. 액세서리는 `items[].category ∈ belt|watch|socks|bag|cap|scarf`로 받고 색 변수 `--c-<slot>` 주입. 벨트·양말 가시성 규칙(4-3)을 렌더러가 적용.
4. `patternDefs.js`에 5장의 v2 defs와 `clip-top-tuck` 추가. 그레인 필터는 `opts.grain`일 때만 스택 `<g>`에 건다.
5. `typeToLayer.js`: `TOP_SHAPE`에서 polo → 2차 전까지 `shirt`로 폴백(v2에 polo 없음), `BOTTOM_FIT.slim → bottom-tapered` 폴백, `SHOE_LAYER`에서 running/workboot/chukka/sandal → sneaker/chelsea/derby/loafer 폴백(2차 제작 전까지). 아우터는 v1과 동일 4형.
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

---

## 6. 액세서리 슬롯

| slot | 파일 | 색 변수 | 위치(y) | 노출 조건 | 데이터 연결(CX 팀) |
|---|---|---|---|---|---|
| belt | acc-belt | `--c-belt` + `--c-metal` 버클 | 176~186 (+그림자 190) | 상의 tuck | `items[].category:"belt"`, color, `top.tuck` |
| watch | acc-watch | `--c-watch` 스트랩 + `--c-metal` 케이스 | 214~225, x 141~159 | 항상 | category `watch` |
| socks | acc-socks | `--c-socks` | 334~358 | 바지 crop | category `socks` |
| bag | acc-bag (tote) | `--c-bag` | 어깨 82 → 178~242, x 26~68 | 항상 | category `bag`, type `tote` (2차: crossbody, backpack) |
| cap | acc-cap | `--c-cap` | 5~46 | 항상 | category `cap` |
| scarf | acc-scarf | `--c-scarf` | 54~142 | 항상 (겨울) | category `scarf` |

확장 후보(같은 규칙으로 추가 가능): 선글라스(cap 뒤, y 28~36), 안경, 넥타이(top 뒤·outer 앞, 플래킷 위 y 96~190, `dressShirtTie`와 연결), 크로스바디·백팩 스트랩(bag), 비니(cap 슬롯·다른 type), 브레통 스트라이프(패턴 `pat2-breton`: 가로 띠 — 소재가 아닌 `pattern` 필드).

---

## 7. 바이트 예산

| 항목 | 목표 | 현재 |
|---|---|---|
| 레이어 1개 | ≤ 1,536 B (1.5 KB) | 최대 1,490 B (figure-base), 중앙값 ≈ 1,060 B |
| v2 전체 | ≤ 120 KB | 24 파일 **26,369 B (25.8 KB)**. 2차에 폴로·슬림·러닝·워크부츠·척카·샌들·후디 루즈·셔츠 루즈·상의 long 3·액세서리 6을 더해도 ≈ 50 KB |
| 번들 영향 | gzip JS 예산 120 KB 안 | SVG 문자열은 gzip에서 ~1/4로 줄어 ≈ 7 KB. v1(≈ 21 KB raw)을 지우면 순증 ≈ 1.5 KB gzip |

바이트를 줄인 기법: 선 속성을 `<g>`에 올려 상속, 정수 좌표, 명령 사이 공백 제거, Q 곡선 우선(C는 머리에만), 주석 한 줄, XML 선언·role 생략, 대칭이어도 좌우를 따로 쓰되 서브패스 하나로.

---

## 8. 제작 파이프라인

1. **마스터 그리드로 손 제작**: 1-2 표의 y값과 x 대칭(x' = 200 − x)을 지키며 path d를 직접 쓴다(또는 Figma/Illustrator에서 200×400 아트보드 + 가이드 → SVG 내보내기 → 정리). 새 의류는 가장 가까운 기존 파일을 복제해 main → shade → detail 순으로 고친다.
2. **4-1 구조로 정리**: `<g data-*>` + 파트 3종. id·그라데이션·필터 금지.
3. **검증**: `node scripts/check-assets.mjs` — viewBox, 슬롯별 필수 data-attr, main fill 형식, shade fill 형식, detail fill none, 금지 요소, id, 파일·총 바이트, path·명령 수를 표로 출력. 오류면 종료 코드 1(CI에 넣는다).
4. **index 생성**: `node scripts/check-assets.mjs --write-index` → `src/assets/v2/index-v2.json`(v1 index와 같은 모양 + `type`, `bytes`, `shade`, `details`, `optionalDetails`, `zOrder`, `colorVars`, `parts`).
5. **데모 재생성·육안 확인**: `node scripts/build-asset-demo.mjs` → `docs/phase6/asset-demo.html`(v1·v2 소스 인라인, 디스크에서 열림). 120px·300px, 다크·라이트, 그레인, 마스터 그리드를 토글하며 본다. 래스터 확인이 필요하면 `sharp`(devDependency)로 SVG→PNG.
6. **package.json 제안**: `"assets:check": "node scripts/check-assets.mjs"`, `"assets:index": "node scripts/check-assets.mjs --write-index"`, `"assets:demo": "node scripts/build-asset-demo.mjs"`.

### 8-1. `check-assets.mjs` 출력 (2026-10-19)

```
file                   slot    type     fit      len      paths   m/s/d  cmds  bytes  status
--------------------------------------------------------------------------------------------
figure-base.svg        base    figure   -        -            6   3/3/0    69   1490  ok
acc-cap.svg            cap     cap      -        -            3   1/1/1    23    767  ok
acc-socks.svg          socks   socks    -        -            4   1/1/2    28    914  ok
shoes-chelsea.svg      shoes   chelsea  -        -            3   1/1/1    64   1061  ok
shoes-derby.svg        shoes   derby    -        -            3   1/1/1    52   1025  ok
shoes-loafer.svg       shoes   loafer   -        -            4   2/1/1    64   1192  ok
shoes-sneaker.svg      shoes   sneaker  -        -            4   2/1/1    61   1213  ok
bottom-straight.svg    bottom  trouser  straight regular      3   1/1/1    36    910  ok
bottom-tapered.svg     bottom  trouser  tapered  regular      3   1/1/1    39    930  ok
bottom-wide.svg        bottom  trouser  wide     regular      3   1/1/1    36    900  ok
acc-belt.svg           belt    belt     -        -            5   2/1/2    24    963  ok
top-hoodie-regular.svg top     hoodie   regular  regular      4   1/1/2    79   1367  ok
top-knit-loose.svg     top     knit     loose    regular      4   1/1/2    56   1208  ok
top-knit-regular.svg   top     knit     regular  regular      4   1/1/2    56   1199  ok
top-shirt-regular.svg  top     shirt    regular  regular      4   1/1/2    66   1247  ok
top-tee-loose.svg      top     tee      loose    regular      3   1/1/1    53   1015  ok
top-tee-regular.svg    top     tee      regular  regular      3   1/1/1    53   1018  ok
outer-long.svg         outer   coat     regular  long         4   1/1/2    89   1379  ok
outer-puffer.svg       outer   puffer   regular  regular      3   1/1/1    88   1350  ok
outer-regular.svg      outer   blazer   regular  regular      4   1/1/2    71   1282  ok
outer-short.svg        outer   jacket   regular  short        4   1/1/2    80   1339  ok
acc-scarf.svg          scarf   scarf    -        -            4   1/1/2    31    920  ok
acc-bag.svg            bag     tote     -        -            3   1/1/1    24    774  ok
acc-watch.svg          watch   watch    -        -            4   2/1/1    22    906  ok
--------------------------------------------------------------------------------------------
layers 24 · paths 89 · total 26369 B (25.8 KB, budget 120 KB) · max file 1490 B (budget 1536 B) · errors 0 · warnings 0
```

(`m/s/d` = main / shade+shadow / detail path 수, `cmds` = path 명령 수.)

---

## 9. 프로토타입 목록과 품목 매핑

| v2 파일 | 덮는 데이터 enum | 비고 |
|---|---|---|
| figure-base | — | 머리·머리카락·목·몸통·팔·손·발목·그림자. `--c-skin`, `--c-hair` |
| top-tee-regular / -loose | tee, tank, henley (+ sweatshirt → knit) | 크루넥 립, 소매 스티치, 밑단 스티치. loose는 드롭숄더 |
| top-shirt-regular | oxfordShirt, dressShirt, dressShirtTie, linenShirt, flannelShirt, denimShirt | 칼라 잎 + V 트임(피부), 플래킷 2줄 + 단추 6, 가슴 주머니, 커프, 셔츠테일 곡선 |
| top-knit-regular / -loose | knitWool, knitCotton, knitCashmere, sweatshirt, poloWool(임시) | 립 밴드 틱(목·밑단·커프). loose는 드롭숄더 |
| top-hoodie-regular | hoodie | 후드 로브가 목 뒤에 접힌 모습(머리를 가리지 않음), 드로스트링, 캥거루 주머니, 립 |
| bottom-straight / -tapered / -wide | bottomFit straight·regular / tapered·slim(임시) / wide | 요크, 플라이 곡선, 앞주머니 곡선, 벨트 루프 3, 밑단 선. 다리 사이 음영 |
| shoes-sneaker | sneakerWhite, sneakerColor, running(임시) | 흰 밑창 파트(`--c-sole`), 끈 3, 토캡, 설포 선 |
| shoes-loafer | loaferPenny, loaferTassel(`detail:"tassel"`) | 모카 솔기, 페니 스트랩, 태슬 선택 |
| shoes-chelsea | chelsea, workboot·chukka(임시) | y 338부터 — 발목을 덮음. 고무 거싯(음영) + 풀탭 |
| shoes-derby | derby, oxford | 토캡, 쿼터, 오픈 레이싱 2줄 |
| outer-short | denimJacket, coachJacket, blouson, leatherJacket | 칼라 잎, 단추 플래킷, 가슴 플랩 주머니 2, 요크, 립 밑단 198 |
| outer-regular | blazer, shirtJacket, cardigan, overshirt, peacoat, fleece | 노치 라펠, 단추 2, 가슴 웰트, 플랩 주머니 2, 밑단 214 |
| outer-long | trench, chesterfield, balmacaan, duffle, longPuffer(임시) | 라펠, 더블 단추 2열, 벨트+버클, 견장, 플랩 주머니, 밑단 300 |
| outer-puffer | shortPuffer | 스탠드 칼라, 가로 배플 4 + 소매 배플 4, 배플 사이 음영 |
| acc-belt / -watch / -socks / -bag / -cap / -scarf | (CX 확장 스키마) | 6장 |

**2차 제작 목록(우선순위)**: ① top-polo(칼라+플래킷 짧게) regular/loose ② bottom-slim ③ shoes-running·workboot·chukka·sandal ④ top-hoodie-loose·top-shirt-loose ⑤ outer-long-puffer(배플 + 300) ⑥ 넥타이·선글라스·비니·크로스바디 ⑦ 히어로/빈 상태 그래픽·아이콘 세트(같은 선 시스템: 1.2px 외곽 + .18 shade, 24px 그리드) — 별도 문서.

---

## 10. 알려진 한계 · 결정 필요

1. **루즈 상의 + 아우터**: 4-3 규칙(아우터가 있으면 regular 파일)으로 피한다. 루즈 전용 아우터(oversized outer)를 만들면 해제 가능.
2. **후드 표현**: 후드를 머리 뒤에 그릴 수 없어(머리가 먼저 그려짐) 목 뒤에 접힌 로브로 표현했다. 머리를 top 뒤로 옮기는 대안은 캡·머플러 z순서를 흔들어 채택하지 않았다.
3. **피부·머리색**: 변수라 사용자 설정(온보딩 "나와 비슷하게")으로 확장 가능하지만 UX 팀 결정 사항.
4. **그레인·필터**: 300px 카드 ≤ 3개 제한. QA 팀이 저사양 기기에서 확인.
5. **왼손목 시계·오른어깨 가방**: 인물 기준 왼손목(그림 오른쪽), 오른어깨(그림 왼쪽)로 고정. 좌우 옵션은 2차.
6. `.claude/launch.json`은 데모 확인용 Vite 항목(`dev`, 5173)으로 갱신했다. 이전 내용이 필요하면 복구.
