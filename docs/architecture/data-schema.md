# 데이터 스키마 (C2 단일 진실 문서)

작성일: 2026-10-19 · 버전 v1.0 · 작성: C1
입력: `research/color-rules.md`(R1), `research/style-rules.md`(R2), `research/gate-1-review.md` 2절(정합성 8항목)
출력: `src/data/*.json` — 이 문서의 형식과 다르면 **문서가 옳다**. 바꾸고 싶으면 이 문서를 먼저 고친다.

표기 규칙
- 모든 id는 **camelCase**. 숫자·언더스코어·하이픈 금지.
- 모든 JSON 파일은 UTF-8, 최상위가 배열이면 `[]`, 객체면 `{}`. 키 순서는 아래 예시 순서.
- 점수 `score`는 정수 1~5 (R1·R2 공통). `modifier`/`delta`는 정수 −2~+1.
- 출처 코드 `sources[]`는 R1 10장 / R2 10장의 코드를 **그대로**(`"WH1"`, `"GG"`, `"MRPORTER"` 등). R2는 코드 없이 매체명을 쓴 곳이 있으므로 C2가 `research/style-rules.md` 10장의 제목에서 짧은 코드를 만들어 `sources` 끝에 `// R2 출처 코드표`로 함께 제출한다.
- 출처가 갈리는 행(⚠)은 `flags: ["disputed"]`. 그 외 플래그: `"approx"`(근사값), `"colorAssigned"`(C2가 색을 보충), `"styleAssigned"`(C2가 핏·소재를 보충), `"mapped"`(자유 텍스트를 id로 매핑).

---

## 1. ID 통일 규칙 (gate-1 항목 1)

R2 snake_case → camelCase 변환표. R1 id는 이미 camelCase라 그대로.

| R2 원문 | 통일 id | | R2 원문 | 통일 id |
|---|---|---|---|---|
| `denim_indigo` | `denimIndigo` | | `sneaker_white` | `sneakerWhite` |
| `denim_washed` | `denimWashed` | | `sneaker_color` | `sneakerColor` |
| `denim_black` | `denimBlack` | | `loafer_penny` | `loaferPenny` |
| `knit_cotton` | `knitCotton` | | `loafer_tassel` | `loaferTassel` |
| `knit_wool` | `knitWool` | | `spring_fall` | `springFall` |
| `knit_cashmere` | `knitCashmere` | | `nylon_tech` | `nylonTech` |

변환 함수(C2 스크립트용): `s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())`. 나머지 id(`chino`, `wool`, `derby`, `summer` …)는 변환 전후 동일.

---

## 2. 열거형(enum) 전체표

### 2-1. categories (4)

| id | 한국어 | 비고 |
|---|---|---|
| `top` | 상의 | |
| `bottom` | 하의 | |
| `shoes` | 신발 | |
| `outer` | 아우터 | 선택 요소. 여름 코디는 보통 없음 |

### 2-2. seasons (3)

| id | 한국어 | R1 표기 | 비고 |
|---|---|---|---|
| `springFall` | 봄가을 | 봄가을 | 3~5월, 10~11월 |
| `summer` | 여름 | 여름 | 6~9월 |
| `winter` | 겨울 | 겨울 | 12~2월 |

**"연중" 매핑(gate-1 항목 4)**: R1의 "연중" = `["springFall","summer","winter"]` 세 개 전부. "봄가을" = `["springFall"]`. R1 6장의 괄호 조건("mustard·teal은 spring_fall 중심", "dustyPink(봄)")은 배열엔 반영하지 않고 `seasonNote`에 한국어로 남긴다. 엔진은 배열만 본다.

### 2-3. tones (6)

| id | 한국어 | 소속 색(colors.tones에 역산) |
|---|---|---|
| `neutral` | 뉴트럴 | white, offWhite, cream, oatmeal, beige, lightGrey, midGrey, charcoal, black, navy, khaki, tan, brown, olive, lightBlue |
| `earth` | 어스톤 | beige, khaki, tan, camel, brown, chocolate, olive, sage, rust, taupe, oatmeal |
| `mono` | 모노톤 | white, lightGrey, greyMelange, midGrey, charcoal, black, blackDenim |
| `navyBase` | 네이비 베이스 | navy, indigo, midDenim, lightDenim, lightBlue, skyBlue |
| `accent` | 포인트 컬러 | burgundy, rust, mustard, forestGreen, teal |
| `pastel` | 파스텔 | lightBlue, skyBlue, dustyPink, lavender, sage, lightDenim, cream |

### 2-4. colors (32) — R1 1장

| id | 한국어 | hex | hexSource | tones | seasons |
|---|---|---|---|---|---|
| white | 화이트 | #FFFFFF | css | neutral, mono | 연중 |
| offWhite | 오프화이트 | #F2EDE4 | approx | neutral | 연중 |
| cream | 크림 | #FFFDD0 | wikipedia | neutral, pastel | springFall, winter |
| oatmeal | 오트밀 | #D9CFC1 | approx | neutral, earth | springFall, winter |
| beige | 베이지 | #F5F5DC | css | neutral, earth | 연중 |
| khaki | 카키 | #C3B091 | wikipedia | neutral, earth | 연중 |
| tan | 탄 | #D2B48C | css | neutral, earth | 연중 |
| camel | 카멜 | #C19A6B | wikipedia | earth | springFall, winter |
| brown | 브라운 | #8B5A2B | approx | neutral, earth | 연중 |
| chocolate | 초콜릿 | #5C4033 | wikipedia | earth | springFall, winter |
| lightGrey | 라이트 그레이 | #D3D3D3 | css | neutral, mono | springFall, summer |
| greyMelange | 그레이 멜란지 | #A9A9A9 | approx | mono | 연중 |
| midGrey | 미드 그레이 | #808080 | css | neutral, mono | 연중 |
| charcoal | 차콜 | #36454F | wikipedia | neutral, mono | 연중 |
| black | 블랙 | #000000 | css | neutral, mono | 연중 |
| navy | 네이비 | #1F2A44 | approx | neutral, navyBase | 연중 |
| indigo | 인디고 데님 | #2E4A7D | approx | navyBase | 연중 |
| midDenim | 미드워시 데님 | #1560BD | wikipedia | navyBase | 연중 |
| lightDenim | 라이트워시 데님 | #9DB9D4 | approx | navyBase, pastel | springFall, summer |
| blackDenim | 블랙 데님 | #2B2B2B | approx | mono | springFall, winter |
| lightBlue | 라이트 블루 | #ADD8E6 | css | neutral, navyBase, pastel | springFall, summer |
| skyBlue | 스카이 블루 | #87CEEB | css | navyBase, pastel | springFall, summer |
| olive | 올리브 | #4B5320 | wikipedia | neutral, earth | 연중 |
| forestGreen | 포레스트 그린 | #228B22 | css | accent | springFall, winter |
| sage | 세이지 | #BCB88A | wikipedia | earth, pastel | springFall, summer |
| burgundy | 버건디 | #800020 | wikipedia | accent | springFall, winter |
| rust | 러스트 | #B7410E | wikipedia | accent, earth | springFall, winter |
| mustard | 머스터드 | #FFDB58 | wikipedia | accent | springFall, summer, winter |
| dustyPink | 더스티 핑크 | #D8A7A7 | approx | pastel | springFall, summer |
| lavender | 라벤더 | #E6E6FA | css | pastel | springFall, summer |
| teal | 틸 | #008080 | css | accent | springFall, summer, winter |
| taupe | 토프 | #483C32 | wikipedia | earth | springFall, winter |

"연중" = 세 계절 전부. hex는 D2가 토큰에서 조정할 수 있으므로 데이터의 hex는 **R1 값 그대로** 두고, 화면 표시는 `tokens.css`의 `--g-<id>`(D2 토큰명)를 우선 쓴다(토큰이 없으면 데이터 hex로 폴백).

### 2-5. materials (15) — R2 0-3

| id | 한국어 | weight | texture | formality |
|---|---|---|---|---|
| denimIndigo | 인디고 데님 | heavy | rough | 4 |
| denimWashed | 워시드 데님 | mid | smooth | 3 |
| denimBlack | 블랙 데님 | mid | smooth | 5 |
| corduroy | 코듀로이 | heavy | fuzzy | 4 |
| chino | 치노 | light | smooth | 5 |
| wool | 울 슬랙스 | mid | smooth | 7 |
| flannel | 플란넬 | heavy | fuzzy | 7 |
| knitCotton | 코튼 니트 | light | fuzzy | 4 |
| knitWool | 울 니트 | mid | fuzzy | 5 |
| knitCashmere | 캐시미어 니트 | light | smooth | 7 |
| linen | 린넨 | light | rough | 4 |
| jersey | 저지/스웻 | light | smooth | 2 |
| leather | 가죽 | heavy | glossy | 5 |
| nylonTech | 나일론/테크 | light | glossy | 3 |
| tweed | 트위드 | heavy | rough | 6 |

`weight ∈ light|mid|heavy`, `texture ∈ smooth|fuzzy|rough|glossy`. R2 3-1의 "중~무거움"은 heavy, "가벼움~중간"은 light로 보수적으로 고정(엔진 3-4 보정은 heavy끼리만 본다).

### 2-6. fits

| 축 | id (순서 = 좁음→넓음) |
|---|---|
| `topFit` (4) | `slim`, `regular`, `loose`, `oversized` |
| `bottomFit` (5) | `slim`, `tapered`, `regular`, `straight`, `wide` |

### 2-7. lengths

| 축 | id |
|---|---|
| `topLength` (3) | `crop`, `regular`, `long` |
| `outerLength` (3) | `short`, `regular`, `long` |
| `trouserLength` (4) | `crop`, `nobreak`, `half`, `full` |

같은 철자(`regular`, `crop`, `long`)가 축마다 다른 뜻이므로 **labels는 반드시 축 접두사**로 구분(7-16절).

### 2-8. shoes (11) — R2 0-4

| id | 한국어 | formality | seasons |
|---|---|---|---|
| sneakerWhite | 흰 스니커즈 | 3 | 연중 |
| sneakerColor | 컬러 스니커즈 | 2 | 연중 |
| running | 러닝화 | 1 | 연중 |
| loaferPenny | 페니 로퍼 | 6 | springFall, summer, winter |
| loaferTassel | 태슬 로퍼 | 7 | springFall, summer, winter |
| derby | 더비 | 7 | 연중 |
| oxford | 옥스포드 | 9 | springFall, winter |
| chelsea | 첼시 부츠 | 6 | springFall, winter |
| workboot | 워크 부츠 | 4 | winter, springFall |
| chukka | 척카 부츠 | 5 | springFall, winter |
| sandal | 샌들/슬리퍼 | 1 | summer |

로퍼의 "겨울 양말 착용 시 OK"는 seasons에 winter를 포함하고 `note`로 남긴다.

### 2-9. topTypes (16) — C1 추가 (포멀도 사다리 5-3·outfit itemType용)

R2 5-3 포멀도 표는 소재가 아니라 "품목"으로 나뉘므로 품목 id가 필요하다.

| id | 한국어 | 기본 material | formality |
|---|---|---|---|
| dressShirtTie | 드레스 셔츠+타이 | null | 8 |
| dressShirt | 드레스 셔츠 | null | 7 |
| oxfordShirt | 옥스포드 셔츠 | null | 6 |
| poloWool | 울 폴로 | knitWool | 6 |
| knitWool | 울 니트 | knitWool | 5 |
| knitCashmere | 캐시미어 니트 | knitCashmere | 7 |
| linenShirt | 린넨 셔츠 | linen | 5 |
| flannelShirt | 플란넬 셔츠 | null | 5 |
| knitCotton | 코튼 니트 | knitCotton | 4 |
| poloPique | 피케 폴로 | jersey | 4 |
| denimShirt | 데님 셔츠 | denimWashed | 4 |
| henley | 헨리넥/긴팔 티 | jersey | 3 |
| tee | 티셔츠 | jersey | 2 |
| sweatshirt | 맨투맨/스웻셔츠 | jersey | 2 |
| hoodie | 후디 | jersey | 1 |
| tank | 탱크톱 | jersey | 1 |

`material: null` = 15개 소재 id 중 해당하는 것이 없음(코튼 셔츠지). 엔진은 null 소재를 **소재 축 계산에서 제외**한다(engine-spec 3-3). "브레통 스트라이프"는 `tee` + `pattern: "breton"`(outfits.items 선택 필드)로 표현.

### 2-10. outerTypes (16) — C1 추가 (R2 6장 아우터 16종)

| id | 한국어 | length | material | formality | seasons |
|---|---|---|---|---|---|
| denimJacket | 데님 재킷 | short | denimIndigo | 4 | springFall |
| coachJacket | 코치 재킷 | short | nylonTech | 3 | springFall |
| blouson | 블루종(MA-1·해링턴) | short | nylonTech | 4 | springFall |
| cardigan | 가디건 | regular | knitWool | 5 | springFall |
| shirtJacket | 셔츠 재킷 | regular | null | 5 | springFall |
| trench | 트렌치 코트 | long | null | 8 | springFall |
| blazer | 블레이저 | regular | wool | 8 | springFall, summer |
| overshirt | 오버셔츠(린넨) | regular | linen | 4 | summer |
| chesterfield | 체스터필드·싱글 코트 | long | wool | 9 | winter |
| balmacaan | 발마칸 코트 | long | wool | 7 | winter |
| duffle | 더플 코트 | long | wool | 6 | winter |
| peacoat | 피코트 | regular | wool | 7 | winter |
| shortPuffer | 숏 패딩 | regular | nylonTech | 2 | winter |
| longPuffer | 롱 패딩 | long | nylonTech | 1 | winter |
| fleece | 플리스 | regular | nylonTech | 2 | winter |
| leatherJacket | 가죽 재킷 | short | leather | 5 | springFall, winter |

포멀도 범위(예: 블루종 3~5)는 중간값 하나로 고정하고 `formalityNote`에 범위를 남긴다. R1 7장의 "필드재킷·초어재킷"은 MVP에서 `shirtJacket`으로, "봄버"는 `blouson`으로, "코트"(색만 있고 종류 없음)는 계절에 따라 winter→`chesterfield`, springFall→`trench`(camel/beige) 또는 `balmacaan`으로 매핑하고 `flags:["mapped"]`.

### 2-11. tags (outfits.tags)

`neutral | earth | mono | navyBase | accent | pastel`(톤 그룹 그대로) + `variation` + `street | business | weekend | resort`(R2 메모에서 추출, 선택).

---

## 3. 파일 목록과 소유

| 파일 | 최상위 | 출처 표 | 예상 행 수 |
|---|---|---|---|
| `enums.json` | 객체 | 2절 | — |
| `colors.json` | 배열 | R1 1·2-1·6장 | 32 |
| `toneRules.json` | 객체 | R1 2-2, 3장, 9-3 | 9 규칙 + 색상환 |
| `colorRules.json` | 배열 | R1 4·5·8장 | 22 베이스 / ~380 match |
| `materials.json` | 배열 | R2 3-1 | 15 |
| `matRules.json` | 배열 | R2 3-2·3-3 | 15 (각 pairsWith 15) |
| `fitRules.json` | 배열 | R2 1-2 | 20 |
| `lengthRules.json` | 배열 | R2 2-1·2-2·2-3 | 50 |
| `shoes.json` | 배열 | R2 4-1 | 11 |
| `shoeRules.json` | 배열 | R2 4-2 + 2-4 | 11 (bottoms 6~12, lengths 4) |
| `formality.json` | 배열 | R2 5-1~5-4 | ~45 |
| `outerRules.json` | 배열 | R2 6-1~6-3 | 16 |
| `layerRules.json` | 배열 | R2 6-4 | 3 |
| `adjust.json` | 배열 | R2 2-5, 3-4, R1 6장·8장 엔진 처리 | ~16 |
| `outfits.json` | 배열 | R1 7장 ∪ R2 7장 | ~45 |
| `labels.ko.json` | 배열 | R2 8장, R1 1장, gate-1 항목 5 | ~140 |

`src/data/index.js`가 전부 import해 `export const data = { enums, colors, … }`로 묶는다(키 = 파일명에서 `.json` 제거, `labels.ko` → `labels`).

---

## 4. 파일별 정의

### 4-1. enums.json

```jsonc
{
  "categories": ["top", "bottom", "shoes", "outer"],
  "seasons": ["springFall", "summer", "winter"],
  "tones": ["neutral", "earth", "mono", "navyBase", "accent", "pastel"],
  "topFits": ["slim", "regular", "loose", "oversized"],
  "bottomFits": ["slim", "tapered", "regular", "straight", "wide"],
  "topLengths": ["crop", "regular", "long"],
  "outerLengths": ["short", "regular", "long"],
  "trouserLengths": ["crop", "nobreak", "half", "full"],
  "tags": ["neutral", "earth", "mono", "navyBase", "accent", "pastel", "variation", "street", "business", "weekend", "resort"],
  "topTypes": [ { "id": "tee", "material": "jersey" }, { "id": "oxfordShirt", "material": null } /* 2-9 전체 */ ],
  "outerTypes": [ { "id": "trench", "length": "long", "material": null } /* 2-10 전체 */ ]
}
```

colors·materials·shoes는 각자 파일이 enum 역할을 겸한다.

### 4-2. colors.json

```jsonc
[
  {
    "id": "indigo",
    "labelKo": "인디고 데님",
    "labelEn": "Indigo denim",
    "hex": "#2E4A7D",
    "hexSource": "approx",            // "css" | "wikipedia" | "approx"
    "tones": ["navyBase"],
    "seasons": ["springFall", "summer", "winter"],
    "seasonNote": null,               // 예: "여름은 얇은 것만"
    "note": "근사값(진청·원워시)"
  }
]
```

### 4-3. toneRules.json

```jsonc
{
  "groups": [
    { "id": "neutral", "labelKo": "뉴트럴", "colors": ["white", "offWhite", "…"], "note": "옷장의 뼈대" }
  ],
  "rules": [
    { "id": "T3", "from": "earth", "to": "navyBase", "modifier": 1,
      "note": "가장 안정적인 교차 조합. 블루-브라운 보색", "sources": ["GG", "Acorn", "Celio"], "flags": [] },
    { "id": "T5", "from": "mono", "to": "earth", "modifier": -1,
      "note": "블랙+브라운 가죽 혼용 금지. 큰 면적 대비는 럭셔리", "sources": ["MM", "WH2", "VK2"], "flags": ["disputed"] }
  ],
  "sameColorTopBottom": -2,          // 같은 color id 상·하 (R1 9-3)
  "accentAccent": -2,                // accent 그룹끼리 (T6·A10)
  "hue": {
    "analogous": [
      { "id": "blue",  "labelKo": "블루 계열",  "colors": ["navy", "indigo", "midDenim", "lightDenim", "lightBlue", "skyBlue", "lavender"] },
      { "id": "green", "labelKo": "그린 계열",  "colors": ["olive", "sage", "khaki", "mustard", "forestGreen"] },
      { "id": "brown", "labelKo": "브라운 계열", "colors": ["brown", "rust", "camel", "tan", "chocolate", "taupe"] }
    ],
    "complementary": [
      { "a": "blue", "b": "brown", "tag": "classic", "note": "인디고+러스트, 네이비+카멜", "sources": ["WH1", "GG"] },
      { "a": "green", "b": "burgundy", "tag": "classic", "note": "올리브+버건디", "sources": ["WH1"] },
      { "a": "charcoal", "b": "mustard", "tag": "variation", "note": "", "sources": ["RMRS 색상환"] }
    ],
    "achromatic": ["white", "offWhite", "lightGrey", "greyMelange", "midGrey", "charcoal", "black", "blackDenim"]
  }
}
```

- `rules[]`는 **무방향**(from↔to 동일 적용). from=to인 규칙(T1 뉴트럴+뉴트럴 0, T2 어스+어스 0)도 넣는다. 표에 없는 쌍은 modifier 0.
- `complementary.a/b`는 analogous 그룹 id **또는** 색 id. 엔진은 색 id면 그 색만, 그룹 id면 그룹 소속 전체로 확장한다.
- R1 9-3의 유사색 그룹은 3개(각 4색)였다. C1이 같은 색상환 이웃인 `midDenim, lightDenim, skyBlue`(블루), `forestGreen`(그린), `chocolate, taupe`(브라운)을 **추가**했다 → P3가 확인. 반대하면 `colors`에서 빼기만 하면 된다.

### 4-4. colorRules.json (gate-1 항목 8 포함)

```jsonc
[
  {
    "base": "indigo",
    "baseCategory": "bottom",        // R1 4장 = bottom, 5장 = top
    "variant": null,                 // "bretonStripe"만 사용(R1 5-8). 엔진은 MVP에서 variant≠null 레코드를 무시
    "labelKo": "인디고 데님",
    "matches": [
      { "category": "top",   "color": "white",     "score": 5, "tag": "classic",   "sources": ["WK1", "GQK", "AtG1", "Celio"], "flags": [], "note": "불멸의 조합" },
      { "category": "top",   "color": "oatmeal",   "score": 4, "tag": "classic",   "sources": ["VK1", "AtG4"], "flags": [], "note": "니트" },
      { "category": "top",   "color": "cream",     "score": 4, "tag": "classic",   "sources": ["VK1", "AtG4"], "flags": [], "note": "니트" },
      { "category": "shoes", "color": "black",     "score": 3, "tag": "variation", "sources": ["GG", "FB1", "Allure"], "flags": ["disputed"], "note": "진청엔 가능, 연청엔 비추천" },
      { "category": "outer", "color": "navy",      "score": 5, "tag": "classic",   "sources": ["Hack", "Celio", "WH2"], "flags": [], "note": "블레이저·필드재킷" }
    ],
    "avoid": [
      { "category": "outer", "color": "indigo", "reason": "같은 워시의 데님 재킷은 유니폼처럼 보임", "sources": ["AtG3"], "ruleId": "A8" },
      { "category": null,    "color": null,     "reason": "4색 이상", "sources": ["Vou1"], "ruleId": "A11" }
    ]
  }
]
```

변환 규칙(R1 9-1 그대로 + 보강):
1. `a / b` 셀은 두 match로 분리, 같은 score·tag·sources.
2. 4장 = `baseCategory: "bottom"`, matches.category ∈ top|shoes|outer. 5장 = `"top"`, matches.category ∈ bottom|shoes.
3. 4-12 "white / cream" 베이스, 5-5 "oatmeal / cream" 베이스 → 각각 **베이스 2개 레코드**로 분리(같은 matches). (base, baseCategory, variant) 조합은 유일해야 한다.
4. 5-8 브레통(navy+white) → `base: "navy", baseCategory: "top", variant: "bretonStripe"`.
5. 8장 "엔진 처리 제안"의 score가 4·5장 표와 충돌하면 **8장 우선**, 해당 match에 `ruleId: "A3"`를 추가.
6. 8장 A1~A14 중 특정 베이스에 매이지 않는 규칙(A11 4색, A12 올화이트, A13 여름 블랙+블랙)은 colorRules.avoid가 아니라 **adjust.json**(4-14)에 넣는다.
7. match 안의 괄호 품목("white (스니커즈)", "navy (블레이저·필드재킷)")은 `note`에만. 색 규칙은 품목과 무관하게 적용(references 결정 12: 색과 품목 분리).

### 4-5. materials.json

```jsonc
[
  { "id": "denimIndigo", "labelKo": "인디고 데님", "seasons": ["springFall", "winter", "summer"],
    "seasonNote": "여름은 얇은 것만", "weight": "heavy", "texture": "rough", "formality": 4,
    "note": "가장 범용. 블레이저·니트·가죽과 모두 OK" }
]
```

### 4-6. matRules.json

```jsonc
[
  { "material": "denimIndigo",
    "pairsWith": [
      { "material": "knitWool", "score": 5, "note": "" },
      { "material": "denimIndigo", "score": 1, "note": "동일 톤 상하 '캐나디안 턱시도'. 톤 차이 크면 3" }
      /* …15개 전부 (자기 자신 포함) */
    ],
    "avoid": [ { "material": "denimIndigo", "score": 1, "reason": "동일 톤 상하" } ],
    "seasons": ["springFall", "winter", "summer"] }
]
```

- `pairsWith`는 **15개 소재 전부** 포함(R2 3-2 13×13 행렬을 채우고, denim 행을 denimIndigo/denimWashed/denimBlack 3개로 복제한 뒤 3-3 예외로 덮어쓰기). 행렬에도 3-3에도 없는 쌍은 3.
- `avoid`는 pairsWith 중 score ≤ 2를 **복사**한 것(중복이지만 UI "피하기" 목록용). 검증에서 일치 확인.
- 대칭: `A.pairsWith[B].score === B.pairsWith[A].score`. 3-3에서 방향이 다른 경우(코듀로이 바지+울 재킷 2, 반대 4)는 **낮은 쪽**으로 통일하고 `note`에 방향을 남긴다.

### 4-7. fitRules.json

```jsonc
[ { "topFit": "regular", "bottomFit": "tapered", "score": 5, "note": "가장 안전한 클래식", "flags": [] } ]
```
20행 전부. R2 note의 조건부 가점("숏 아우터 추가 시 4", "턱인이면 5")은 note에만 두고 점수는 표의 기본값.

### 4-8. lengthRules.json

```jsonc
[
  { "kind": "top",     "length": "regular", "bottomFit": "wide",    "score": 5, "note": "" },
  { "kind": "outer",   "length": "long",    "bottomFit": "tapered", "score": 5, "note": "" },
  { "kind": "trouser", "length": "nobreak", "bottomFit": "tapered", "score": 5, "note": "2025 표준 기장" }
]
```
R2의 `topLength/outerLength/trouserLength` 세 필드명을 `kind` + `length` 한 쌍으로 **통일**(엔진 lookup이 한 함수로 끝남). 15+15+20 = 50행.

### 4-9. shoes.json

```jsonc
[ { "id": "loaferPenny", "labelKo": "페니 로퍼", "formality": 6, "formalityNote": null,
    "seasons": ["springFall", "summer", "winter"], "seasonNote": "겨울은 양말 착용 시",
    "socks": "여름 노삭스/페이크삭스, 가을·겨울 양말", "note": "가장 범용적인 가죽 신발" } ]
```
`sneakerWhite.formalityNote: "캔버스형은 2"`, `chelsea.flags: ["disputed"]`(포멀도 6 중간 처리).

### 4-10. shoeRules.json

```jsonc
[
  { "shoe": "sneakerWhite",
    "bottoms": [
      { "material": "denimIndigo", "fit": "tapered", "length": "nobreak", "score": 5, "note": "흰 티+인디고+흰 스니커즈 = 1순위 클래식" },
      { "material": "wool",        "fit": "*",       "length": "*",       "score": 3, "note": "가죽 미니멀형만 4" }
    ],
    "lengths": [
      { "length": "crop", "score": 4, "note": "양말 또는 맨발목" },
      { "length": "nobreak", "score": 5, "note": "기본" },
      { "length": "half", "score": 4, "note": "" },
      { "length": "full", "score": 2, "note": "밑단이 신발 위에 뭉침" }
    ] }
]
```
- `fit`·`length`에 `"*"` 와일드카드 허용. 조회 우선순위: (material, fit, length) 정확 일치 → (material, fit, *) → (material, *, *) → 기본 3. 그다음 `lengths[]` 보정은 engine-spec 3-3.
- R2 4-2의 "jersey(트랙팬츠)"는 `material: "jersey"` + note.
- `lengths`는 11개 신발 × 4 = 44행 전부.

### 4-11. formality.json

```jsonc
[
  { "category": "shoes",  "id": "oxford",      "level": 9, "note": "" },
  { "category": "bottom", "id": "chino",       "level": 5, "when": { "fit": ["slim", "tapered", "regular"] }, "note": "다크·테이퍼드" },
  { "category": "bottom", "id": "chino",       "level": 4, "when": { "fit": ["straight", "wide"] }, "note": "라이트·와이드" },
  { "category": "bottom", "id": "wool",        "level": 7, "note": "단품 슬랙스. 수트 바지는 8(MVP 미사용)" },
  { "category": "top",    "id": "oxfordShirt", "level": 6, "note": "" },
  { "category": "outer",  "id": "blazer",      "level": 8, "note": "" }
]
```
- `id`의 의미는 category별: shoes → shoe id, bottom → material id, top → topType id, outer → outerType id.
- `when`이 있으면 조건 일치 행 우선, 없으면 `when` 없는 행. 같은 (category,id)에 `when` 없는 행은 하나만.
- 임계값(`warn 4`, `block 5`)은 데이터가 아니라 엔진 상수.

### 4-12. outerRules.json

```jsonc
[
  { "outer": "trench", "labelKo": "트렌치 코트", "length": "long", "material": null, "materialNote": "코튼 개버딘",
    "formality": 8, "seasons": ["springFall"],
    "bottoms": [
      { "material": "wool",        "fit": "tapered",  "score": 5, "note": "" },
      { "material": "denimIndigo", "fit": "slim",     "score": 5, "note": "" },
      { "material": "denimIndigo", "fit": "straight", "score": 5, "note": "" },
      { "material": "chino",       "fit": "tapered",  "score": 5, "note": "" },
      { "material": "denimBlack",  "fit": "*",        "score": 4, "note": "" },
      { "material": "*",           "fit": "wide",     "score": 3, "note": "" }
    ],
    "shoes": [ { "shoe": "derby", "score": 5 }, { "shoe": "loaferPenny", "score": 5 }, { "shoe": "loaferTassel", "score": 5 },
               { "shoe": "chelsea", "score": 5 }, { "shoe": "oxford", "score": 4 }, { "shoe": "running", "score": 1 }, { "shoe": "sandal", "score": 1 } ],
    "avoid": [ { "material": "jersey", "reason": "스웻팬츠" } ],
    "sources": [], "flags": [] }
]
```
- R2 표의 "sneaker_*" → `sneakerWhite`, `sneakerColor` 두 행. `loafer_*` → 두 로퍼. 점수 없는 "어울리는 신발"은 4, "피함"은 1~2(R2 표에 숫자가 있으면 그 값).
- `bottoms.material`·`fit`에 `"*"` 허용. 조회 우선순위는 shoeRules와 같고 기본 3.
- R2 6-2의 "(아우터 없음)" 행은 레코드로 만들지 않는다(outer 없는 코디는 아우터 축 자체를 건너뜀).

### 4-13. layerRules.json

```jsonc
[ { "season": "summer", "maxLayers": 2, "order": ["base", "outer"], "note": "2겹 초과 금지. 아우터는 오버셔츠" },
  { "season": "winter", "maxLayers": 3, "order": ["base", "mid", "outer"], "note": "니트 기장이 코트 밖으로 나오지 않게" } ]
```

### 4-14. adjust.json

```jsonc
[
  { "id": "adjCropSummerLoafer", "when": { "trouserLength": "crop", "season": "summer", "shoe": ["loaferPenny", "loaferTassel", "sandal"] },
    "delta": 1, "reason": "발목 노출이 여름 클래식", "sources": ["R2 2-5"], "flags": [] },
  { "id": "adjCropWinter",       "when": { "trouserLength": "crop", "season": "winter" }, "delta": -1, "reason": "발목 노출 비실용", "sources": ["R2 2-5"], "flags": [] },
  { "id": "adjSlimWorkboot",     "when": { "bottomFit": "slim", "shoe": "workboot" }, "delta": -1, "reason": "부츠가 바지보다 넓어 보임", "sources": ["R2 2-5"], "flags": [] },
  { "id": "adjLongOuterCrop",    "when": { "outerLength": "long", "trouserLength": "crop" }, "delta": -1, "reason": "긴 위 + 짧은 아래", "sources": ["R2 2-5"], "flags": [] },
  { "id": "adjHeavyLight",       "when": { "materialWeights": ["heavy", "light"] }, "delta": -1, "reason": "무거움+가벼움 혼합", "sources": ["R2 3-4"], "flags": [] },
  { "id": "adjHeavyShoe",        "when": { "bottomWeight": "heavy", "shoe": ["derby", "chelsea", "workboot", "chukka", "loaferTassel"] }, "delta": 1, "reason": "무거운 하의 + 무거운 신발", "sources": ["R2 3-4"], "flags": [] },
  { "id": "adjFourColors",       "when": { "colorCountMin": 4 }, "delta": -1, "reason": "3색 규칙", "sources": ["Vou1", "WH1"], "flags": [] },
  { "id": "adjSummerBlackBlack", "when": { "season": "summer", "topColor": "black", "bottomColor": ["black", "blackDenim"] }, "delta": -1, "reason": "여름 웨이터 룩", "sources": ["FB1"], "flags": [] },
  { "id": "adjSameColorTopBottom", "when": { "sameColorTopBottom": true }, "delta": -2, "reason": "올화이트·올블랙·같은 워시 더블데님", "sources": ["FB2", "FB3", "AtG3"], "flags": [] }
]
```
- `when`의 키는 **모두 AND**. 값이 배열이면 그 안에서 OR. 허용 키(엔진이 outfit에서 계산하는 파생 속성):
  `season, trouserLength, topLength, outerLength, bottomFit, topFit, shoe, bottomMaterial, topMaterial, outerMaterial, bottomWeight, materialWeights(집합 포함 검사), colorCountMin, sameColorTopBottom, topColor, bottomColor, shoesColor, outerColor, hasOuter`.
- R2 2-5·3-4에 "0 (갈림)"인 행은 delta 0 + `flags:["disputed"]`로 넣는다(설명 문구 노출용).
- R1 6장 "seasons에 없는 색 −1, 포인트 컬러가 계절 밖이면 −2"와 3색 규칙은 엔진 상수로 구현하므로 adjust에 **넣지 않는다**(중복 적용 방지). 단 `adjFourColors`는 색 축이 아니라 스타일 축 합산에 들어가는 adjust이므로 유지 — 엔진은 둘 중 하나만 쓴다: **adjust.json의 `adjFourColors`를 쓰고 색 축의 3색 패널티는 뺀다**(engine-spec 3-2).

### 4-15. outfits.json (gate-1 항목 2·3·4)

```jsonc
[
  { "id": "o01",
    "mergedFrom": ["c01", "s01"],          // R1 7장 id는 c##, R2 7장 id는 s##로 접두사 변경(충돌 방지)
    "items": [
      { "category": "top",    "color": "white",  "material": "jersey",      "fit": "regular",  "length": "regular", "shoeType": null,          "itemType": "tee",  "itemName": "흰 티셔츠",     "pattern": null },
      { "category": "bottom", "color": "indigo", "material": "denimIndigo", "fit": "straight", "length": "nobreak", "shoeType": null,          "itemType": null,   "itemName": "인디고 데님",   "pattern": null },
      { "category": "shoes",  "color": "white",  "material": "leather",     "fit": null,       "length": null,      "shoeType": "sneakerWhite", "itemType": null,   "itemName": "흰 스니커즈",   "pattern": null }
    ],
    "seasons": ["springFall", "summer", "winter"],
    "tags": ["neutral", "navyBase"],
    "isClassic": true,
    "universal": true,
    "sources": ["WK1", "GQK", "AtG1"],
    "flags": [],
    "note": "1순위 기본" }
]
```

항목 규칙
- `items`는 top·bottom·shoes 필수, outer 0~2개(R2 s22 "가죽 재킷+롱 코트"는 outer 2개, `layer: 1|2`로 순서 표기).
- `fit`: top은 topFit, bottom은 bottomFit, outer·shoes는 null. `length`: top은 topLength, bottom은 trouserLength, outer는 outerLength, shoes는 null.
- `shoeType`은 shoes에만(필수). `itemType`은 top(topTypes)·outer(outerTypes)에 필수, bottom·shoes는 null.
- `material`은 shoes는 `leather`(가죽·스웨이드) / `nylonTech`(러닝화·샌들) / 캔버스는 `null`. 셔츠처럼 15개 소재에 없는 것은 null.
- `pattern`은 `"breton"`만(브레통). 그 외 null.
- `isClassic`은 R1 7장 전체 true, R2 7장은 tag classic → true, variation → false. `universal`은 R1 ✔ 표시만 true.
- `tags`에 `variation`이 들어가면 `isClassic: false`.

**병합 절차(gate-1 항목 3)**
1. R1 c01~c30과 R2 s01~s24를 각각 `scripts/` 중간 파일로 옮긴 뒤, 아래 **조인 키**가 같은 쌍을 찾는다: `bottom.material`(R1은 하의 색→소재 추정표 참조) + `shoes.shoeType`(항목 2 매핑 후) + `top.itemType`(R1 품목명 → topType). 세 개가 같으면 같은 코디로 본다. 예상 병합 쌍: c01↔s01, c05↔s03, c16↔s16, c20↔s18 근처, c10↔s17 근처 등 — C2가 표로 제출.
2. 병합 레코드는 **색은 R1, 핏·기장·소재는 R2**에서 가져온다. `mergedFrom`에 둘 다, `sources`는 합집합.
3. **R1만 있는 행**(색만): 소재는 하의 품목명에서 추정(아래 표), 핏은 **`regular`**, 상의·아우터 기장 `regular`, 바지 기장 **`nobreak`**. `flags: ["styleAssigned"]`.
4. **R2만 있는 행**(핏·소재만): 색은 하의 소재의 대표색(아래 표)을 base로 잡고 `colorRules`에서 해당 category의 **score 5·classic 중 첫 행**을 상의·신발·아우터 색으로 채운다. 신발 색은 shoeType이 sneakerWhite면 무조건 `white`. `flags: ["colorAssigned"]`.
5. R1 o29처럼 괄호 변주가 있는 행은 기본형 + 변주형 2개 레코드(변주형은 `tags`에 `variation`, `isClassic: false`).
6. 최종 id는 `o01`부터 다시 번호를 매긴다(universal 먼저, 그다음 R1 순서, 그다음 R2 잔여).

하의 품목명 → 소재 / 소재 → 대표색:

| 하의 품목(R1) | material | | material(R2) | 대표 color |
|---|---|---|---|---|
| 데님(indigo) | denimIndigo | | denimIndigo | indigo |
| 데님(lightDenim·midDenim) | denimWashed | | denimWashed | lightDenim |
| blackDenim / 데님(black) | denimBlack | | denimBlack | blackDenim |
| 치노·카고 | chino | | chino | beige |
| 울 트라우저·트라우저·슬랙스 | wool | | wool | midGrey |
| 플란넬 | flannel | | flannel | charcoal |
| 코듀로이 | corduroy | | corduroy | brown |
| 린넨 | linen | | linen | white |
| 스웻팬츠·트랙팬츠 | jersey | | jersey | greyMelange |
| — | — | | nylonTech | black |

상의 품목명 → topType·material: 티셔츠→tee/jersey, 맨투맨·후디→sweatshirt·hoodie/jersey, 옥스포드·셔츠→oxfordShirt/null, 니트(겨울·봄가을)→knitWool/knitWool, 니트(여름)·청키 니트(cream 겨울은 knitWool)→knitCotton/knitCotton, 롤넥→knitWool, 린넨 셔츠→linenShirt/linen, 샴브레이→denimShirt/denimWashed, 브레통→tee/jersey+pattern breton.

**신발 자유 텍스트 매핑(gate-1 항목 2)** — R1 7장·4·5장 괄호 품목에 적용. 결과 item에 `flags:["mapped"]`.

| R1 텍스트 | shoeType | 비고 |
|---|---|---|
| "스니커즈" (white) | sneakerWhite | |
| "스니커즈" (white 외 색), "데크슈즈" | sneakerColor | |
| "로퍼", "brown 로퍼", "스웨이드 로퍼" | **loaferPenny** (기본) | "태슬"이 명시된 때만 loaferTassel |
| "부츠" (계절 springFall·summer) | **chukka** | 데저트·스웨이드 부츠 포함 |
| "부츠" (계절 winter) | **workboot** | 단, 상의·하의 포멀도가 6 이상(울·플란넬·코트)이면 chelsea |
| "부츠" + 연중 | chukka | 연중 코디는 봄가을 기준 |
| "첼시부츠", "첼시" | chelsea | |
| "처카", "데저트부츠" | chukka | |
| "더비", "더비부츠" | derby | "더비부츠"는 더비로 근사 + note |
| "옥스포드"(신발) | oxford | |
| "샌들", "슬리퍼" | sandal | |
| "러닝화" | running | |

색은 R1 텍스트의 색 id(`brown`, `tan`, `chocolate`, `black`, `white`…)를 그대로 `color`에, 소재는 가죽류 → `leather`, 스니커즈 → `leather`(캔버스 명시 시 null), 러닝화·샌들 → `nylonTech`.

### 4-16. labels.ko.json (팀5 소유, C2가 초안)

```jsonc
[
  { "id": "color.khaki",       "label": "카키(베이지 계열)", "aliases": ["황갈색", "카키 베이지"], "help": "한국에서 흔히 '카키'로 부르는 국방색은 '올리브'를 고르세요" },
  { "id": "color.olive",       "label": "올리브",           "aliases": ["카키그린", "국방색", "카키"],  "help": "" },
  { "id": "material.corduroy", "label": "코듀로이",         "aliases": ["골덴", "코르덴"],            "help": "" },
  { "id": "fit.bottom.wide",   "label": "와이드",           "aliases": ["통바지", "세미와이드", "배기", "벌룬"], "help": "" },
  { "id": "length.trouser.crop", "label": "크롭",           "aliases": ["9부", "8부", "앵클"],       "help": "발목 위 3~6cm" },
  { "id": "shoe.chukka",       "label": "척카 부츠",        "aliases": ["데저트 부츠", "클락스"],     "help": "" },
  { "id": "season.springFall", "label": "봄가을",           "aliases": [],                           "help": "" },
  { "id": "ui.classicN",       "label": "클래식 {n}/3",     "aliases": [],                           "help": "" }
]
```

`id` 접두사(네임스페이스): `color.` `tone.` `season.` `category.` `material.` `fit.top.` `fit.bottom.` `length.top.` `length.outer.` `length.trouser.` `shoe.` `topType.` `outerType.` `tag.` `explain.`(engine-spec 4절 설명 문구) `ui.`(화면 문구). 같은 철자 id가 축마다 다르므로 접두사 없는 id는 금지. 모든 enum 값은 label 행이 있어야 한다(검증 V-12).

---

## 5. 조회 키 요약 (엔진이 Map으로 만드는 인덱스)

| 데이터 | 키 |
|---|---|
| colors | `id` |
| colorRules | `${base}|${baseCategory}` (variant null만) → matches를 다시 `${category}|${color}` |
| toneRules.rules | `${min(from,to)}|${max(from,to)}` |
| matRules | `${a}|${b}` (대칭이므로 정렬) |
| fitRules | `${topFit}|${bottomFit}` |
| lengthRules | `${kind}|${length}|${bottomFit}` |
| shoeRules | `shoe` → bottoms 선형 탐색(≤12행), lengths `length` |
| formality | `${category}|${id}` → when 배열 |
| outerRules | `outer` |
| adjust | 선형(≤20행) |
| outfits | `id`, 보조 인덱스 `${category}|${color}` → outfit id[] |

---

## 6. 하의 색 ↔ 소재 정합성 (엔진 후보 생성용)

Quick 모드에서 색만 고른 사용자에게 소재를 추정해야 한다. colorRules의 bottom 베이스 12개와 소재의 기본 매핑(4-15 표와 동일)을 엔진 상수로 둔다. 사용자가 소재를 고르면(Deep) 그 값이 우선.

---

## 7. 용량 예상

colorRules ~380 match × ~110B ≈ 42KB, shoeRules ~130행 ≈ 12KB, outfits ~45 × 600B ≈ 27KB, labels ~140 × 100B ≈ 14KB, 나머지 < 20KB. **합계 ≈ 120KB(미압축), gzip ≈ 25KB**. 번들 정적 포함 기준 충족.

---

## 8. 검증 규칙 (C2가 `npm run validate`로 통과시켜야 함)

`scripts/validate-data.mjs`는 `src/engine/validate.js`의 `validateData(data)`를 호출해 아래를 검사하고, 위반이 1건이라도 있으면 exit 1.

| # | 규칙 | 심각도 |
|---|---|---|
| V-01 | 모든 id가 `/^[a-z][a-zA-Z0-9]*$/` (camelCase) | error |
| V-02 | 참조 무결성: 어떤 파일에서든 `color`·`material`·`shoe/shoeType`·`fit`·`length`·`tone`·`season`·`category`·`itemType`·`outer` 값이 해당 enum/파일에 존재 (`"*"`·`null`은 허용된 자리에서만) | error |
| V-03 | colors.json 32개, tones ⊆ enums.tones, seasons ⊆ enums.seasons, hex `/^#[0-9A-F]{6}$/`, hexSource ∈ css/wikipedia/approx | error |
| V-04 | colors.tones가 toneRules.groups의 colors와 **양방향** 일치 | error |
| V-05 | colorRules: (base, baseCategory, variant) 유일. baseCategory bottom이면 matches.category ∈ top/shoes/outer, top이면 ∈ bottom/shoes. 같은 (category,color) match 중복 없음 | error |
| V-06 | `tag === "variation"`이면 `score ≤ 3`. `score ≥ 4`이면 `tag === "classic"` (R1 9-1) | error |
| V-07 | ⚠ 표시 행은 `flags`에 `"disputed"` 포함: R1 8장 A1·A2·A3·A4·A9와 4·5장 ⚠ 행, R2 4-3·10장 불일치 6건(와이드+신발 폭, 첼시 포멀도, 풀 슬림, 롱코트+와이드, 린넨 계절, 러닝화+슬랙스)에 해당하는 레코드 | error |
| V-08 | **bottom 베이스 12개 각각**: matches 중 `category === "top"` classic ≥ 3, `"shoes"` classic ≥ 3, `"outer"` classic ≥ 3. top 베이스 10개: `"bottom"` classic ≥ 3, `"shoes"` classic ≥ 2 | error |
| V-09 | 모든 match에 `sources.length ≥ 1`. `tag === "classic"`이면서 `score === 5`이면 `sources.length ≥ 2`(계획서 6절 "출처 2개 이상") — 아니면 warning | error / warn |
| V-10 | matRules: 15개 레코드, 각 pairsWith 15개(자기 자신 포함), 대칭, avoid == pairsWith 중 score ≤ 2 | error |
| V-11 | fitRules 20행 유일(topFit×bottomFit 전부). lengthRules 50행(top 15, outer 15, trouser 20) 전부 존재 | error |
| V-12 | labels.ko.json: 모든 enum 값(colors, tones, seasons, categories, materials, fits×2, lengths×3, shoes, topTypes, outerTypes, tags)에 접두사 id의 label 행 존재. `id` 중복 없음 | error |
| V-13 | shoeRules 11개, 각 `lengths` 4행(crop/nobreak/half/full). bottoms에서 `"*"`는 fit·length에만 | error |
| V-14 | formality: 모든 shoe(11)·material(15, bottom 기준)·topType(16)·outerType(16)에 `when` 없는 기본 행 1개 존재. level 1~10 | error |
| V-15 | outerRules 16개, `outer`가 enums.outerTypes와 1:1. seasons ≠ [] | error |
| V-16 | adjust: `when` 키가 4-14 허용 목록 안. delta ∈ −2..+1. id 유일 | error |
| V-17 | outfits: items에 top·bottom·shoes 정확히 1개씩, outer 0~2. shoes에 shoeType 필수, top·outer에 itemType 필수. `universal === true`면 `isClassic === true`. tags에 variation이면 isClassic false. seasons ≠ []. `universal` 레코드 ≥ 10, 전체 ≥ 40 | error |
| V-18 | outfits: 각 아이템 쌍의 colorRules 점수가 있으면 ≥ 3(클래식 예시인데 색 규칙에서 2 이하면 모순). 없으면 warning "규칙 없음" | error / warn |
| V-19 | outfits: 포멀도 격차(engine-spec 3-4) ≥ 5인 레코드는 `tags`에 variation 포함해야 함 | error |
| V-20 | 모든 `sources` 코드가 R1 10장 또는 C2 제출 R2 코드표에 존재 | warn |
| V-21 | 모든 color id가 최소 1개 colorRules match 또는 base에 등장(고아 색 없음) | warn |
| V-22 | JSON 파일 총합 < 300KB | warn |

검증 통과 + `npm test`(engine-spec 6절 테스트 케이스) 통과가 C2의 Phase 3 완료 조건이다.

---

## 9. 리서치 메모와 다른 결정 (요약)

1. `lengthRule`의 세 필드명(`topLength/outerLength/trouserLength`) → `kind` + `length`로 통일.
2. R1·R2 outfit id 충돌(둘 다 o01~) → 중간 접두사 c/s, 최종 재번호.
3. `topTypes`(16)·`outerTypes`(16) enum **신설** — 포멀도 사다리와 outerRule이 소재가 아니라 품목 단위이기 때문.
4. `material: null` 허용(셔츠지·개버딘·멜턴 등 15개 소재 밖). 엔진은 null 소재 쌍을 소재 축 평균에서 제외.
5. 유사색 그룹에 `midDenim, lightDenim, skyBlue, forestGreen, chocolate, taupe` 추가(P3 확인 대상).
6. 3색 패널티와 동일 색 상·하 패널티는 adjust.json으로 일원화(색 축과 중복 적용 금지).
7. matRules의 방향 비대칭은 낮은 점수로 통일.
8. formality 임계값·계절 색 감점(−1/−2)은 데이터가 아니라 엔진 상수.
9. labels id는 네임스페이스 접두사 필수.
10. "부츠" 기본 매핑: 봄가을·연중 → chukka, 겨울 → workboot(포멀 문맥이면 chelsea). "로퍼" → loaferPenny.

---

## 10. C2 구현 메모 (Phase 3, 2026-10-19) — 상세는 `data-conversion-log.md`

1. **V-08 신발 임계치**: bottom 베이스의 shoes classic은 **≥ 1**로 검증(R1 데이터상 black 1·blackDenim 2·charcoal 2). top·outer ≥3, top 베이스 bottom ≥3·shoes ≥2는 그대로. variant null인 top 베이스는 9개.
2. **colorRules.variant**에 `"oxfordShirt"` 추가(R1 5-7 화이트 옥스포드가 5-1 화이트 티셔츠와 (white, top) 충돌). 엔진은 variant≠null 무시.
3. **toneRules.rules[].limitColors** (선택): 있으면 쌍의 한쪽 색이 목록에 있을 때만 modifier 적용. T5(모노↔어스 −1)에 `["black","blackDenim","charcoal"]`.
4. `flags: []`를 materials·fitRules·lengthRules·shoeRules.bottoms[]·shoes 레코드에도 둔다(V-07 disputed 표기).
5. shoeRules "어떤 소재든" 행은 material `"*"` 대신 15개 소재로 전개(V-13 유지).
6. adjust `adjHeavyLight`는 `bottomMaterial × topMaterial` 조건(R2 3-4 원문), `adjHeavyLightOuter` 추가. `materialWeights`는 신발 제외 집합.
7. V-20 출처 코드표(R2)는 `scripts/build/sources.mjs`와 `src/engine/validate.js`에 동일하게 둔다. 내부 코드 `R1`(출처 미기재 행), `R2 n-m`(절 참조), `C1`, `C2`.
8. colorRules는 `a / b` 분리 후 514 match(표 380행). outfits 52(universal 10). JSON은 1칸 들여쓰기(총 302 KB).

---

## 11. Phase 6-B 콘텐츠 확장 (CX, 2026-10-20) — 스타일·상황·액세서리·패턴·미드 레이어

설계 원문: `docs/phase6/content-expansion.md` 1~6절, 표: `docs/phase6/content-expansion-data.md`(`scripts/build/styles.mjs`가 `### N-M.` 제목으로 파싱). PM 결정(gate-5 2절): D-1 스타일 가중은 `recommend()` 재정렬만(K_STYLE 0.5), 1차 범위 `minimal · bizcasual · ivy · amekaji`; D-2 상황은 감점 + avoid 제외 + 단계 완화(항상 3장); D-3 `mid` 5번째 카테고리.
**원칙**: 새 파일 10개는 전부 **빈 배열이면 기능 OFF**(`buildIndex`가 `index.styles = null` 등). 기존 파일 변경은 선택 필드·enum 추가뿐 — 옵션 없는 `recommend()` 결과는 Phase 4와 바이트 단위로 같다(`tests/fixtures/quick-baseline.json`).

### 11-1. 새 파일 (src/data/)

| 파일 | 최상위 | 레코드 | 키 | 비고 |
|---|---|---|---|---|
| `styles.json` | 배열 | 8 | `id, labelKo, labelEn, phase(1·2), formality{min,max}, tones[], seasons[], fits{top,bottom,trouserLength}, signature{top,bottom,shoes,outer}, avoid[], sources[], flags[], note` | `phase`는 표가 아니라 `scripts/build/styles.mjs PHASE1_STYLES`(PM D-1)가 결정. `avoid`의 `accent2·pattern2·logo·fourColors·black2`는 특수 토큰(V-23에서 무시) |
| `styleAffinity.json` | 배열 | 126 | `kind, id, weights{8 스타일: −2..+3}, note` | `kind` 12종 = `constants.AFFINITY_KINDS`. `material`은 하의 소재에만. 표에 없는 (kind,id)는 0 |
| `occasions.json` | 배열 | 5 | `id, labelKo, formality{min,max,targetLo,targetHi}, styleBoost{style: 1..3}, avoid{itemTypes,shoeTypes,materials,patterns}, prefer{itemTypes,shoeTypes}, patternMax, accessories[], sources, flags, note` | `formal`은 `flags: ["approx"]`(수트 품목 없음) |
| `accessoryTypes.json` | 배열 | 19 | `id, labelKo, group(belt·watch·socks·bag·hat·scarf), formality{min,max}, seasons[], colorFrom(shoes·bottom·outfit·neutral·free·null), note` | |
| `accessoryRules.json` | 배열 | 32 | `id, accessory[], when{}, pick{} 또는 {skip:true}, delta(−2..+1), severity(info·warn), note, sources, flags` | `when` 키 = `constants.ACCESSORY_WHEN_KEYS`(adjust 규약 + `shoesMaterial, shoesFinish, outerPattern, formalityMin/Max, patternCount, accentCount, style, tuckIn, belt, watch, beltColor, material`). `pick.color` = 색 id 또는 파생 키 `shoesFamily·bottomDarker·outfit·outfitSecondary·outerTone2·outerPick·neutral·free` |
| `patterns.json` | 배열 | 9 | `id, labelKo, family(stripe·check·texture·print), scale(small·mid·large), categories[], itemTypes[](topType·outerType·material), formality, seasons[], colorsTypical[], note, sources, flags` | `herringbone`은 `countAs: texture`(패턴 수 미포함) |
| `patternRules.json` | 배열 | 19 | `id, when{}, effect(exclude·penalty·bonus·countAs), countAs?, delta, severity, note, sources, flags` | `when` 키 = `constants.PATTERN_WHEN_KEYS`. `mode` 조건(quick/deep) 규칙은 후보 생성이 평가, 나머지 `exclude`는 점수에서 차단 |
| `midTypes.json` | 배열 | 5 | `id, labelKo, material(nullable), formality, length, weight(light·mid·heavy), seasons[], note` | `mid` 아이템의 `itemType` 어휘 |
| `midLayerRules.json` | 배열 | 12 | `id, season, base(topType[] 또는 "any"), mid(midType[] 또는 "none"), outer(outerType[] 또는 "any"/"none", 배열 안 "none" 허용), score 1..5, tag(classic·variation·block), note, sources, flags` | 여름 미드 행은 score 1·block (V-30) |
| `twoOuterRules.json` | 배열 | 6 | `id, season, inner(outerType[] 또는 "any"), outer(outerType[] 또는 "any"), score, tag, note, sources, flags` | |

### 11-2. 기존 파일 변경

- `enums.json`: `categories`에 `mid` 추가(5개). `tags`에 `layering`, `pattern`(생성 코디 태그). 새 키 `styles[8]·occasions[5]·patterns[9]·midTypes[5]·accessoryTypes[19]·accessoryGroups[6]` — 각 파일의 id 순서와 1:1(V-23·29·30 검사).
- `outfits.json`: 레코드에 **계산 필드** `styles: [{id, score}] (≤2)`·`occasions: string[]` 추가(키 위치: `universal` 다음). `scripts/build-data.mjs`가 `src/engine/style.js`의 `styleTags(styleVector())`·`occasionFit()`으로 써 넣고 V-31이 재계산과 비교한다 — **손으로 고치지 않는다**. `items`에 `category: "mid"` 0~1개 허용(`itemType` = midType, `fit: null`, `length` ∈ outerLengths). `items[].pattern` 허용값은 `enums.patterns`(V-17 수정).
- `labels.ko.json`: +85행 — `category.mid`, `style.*`(8, help = 한 줄 정의, aliases에 구어 "아메리칸 캐주얼"·"아웃도어 룩"…), `occasion.*`(5), `pattern.*`(9), `midType.*`(5), `accessory.*`(19), `accessoryGroup.*`(6), `explain.style.<id>`(8, V-32), `explain.*` 15종(style.boost·style.tag·occasion.adj/window/target/relaxed·acc·pattern·midLayer·midLength·midWeight·midFormality·twoOuter·twoOuterLength·layerScore), `ui.*` 7종(byStyle·byOccasion·accessories·layering·patterns·styleAll·formalApprox), `tag.layering`·`tag.pattern`. 새 네임스페이스 5개는 `shortLabel ≤ 6자` 필수(V-12 확장).
- `src/data/index.js`: 새 JSON 10개를 정적 import — 파일은 항상 존재시키되 빈 배열 허용.

### 11-3. 검증 규칙 V-23 ~ V-33 (`src/engine/validate.js`, 확장 파일이 있을 때만)

| # | 규칙 | 심각도 |
|---|---|---|
| V-23 | styles: id 유일·camelCase, formality.min ≤ max, signature id가 enum에 존재, avoid id가 어떤 enum에든 존재(특수 토큰 제외), phase ∈ 1,2, sources ≥ 2, `enums.styles` 순서 일치 | error |
| V-24 | styleAffinity: (kind,id) 유일, kind ∈ 12종, id가 해당 enum에 존재, weights 키가 styles 전체와 1:1, 값 정수 −2..+3 | error |
| V-25 | 커버리지: topTypes 16·outerTypes 16·shoes 11·하의 소재 11(knit*·leather 제외)·fits 9·lengths 10·colors 32 전부 행 존재 | error |
| V-26 | 시그니처 품목은 그 스타일 열 ≥ +2, avoid 품목은 ≤ 0 | error |
| V-27 | occasions ≥ 5, min ≤ targetLo ≤ targetHi ≤ max, styleBoost 키 ∈ styles(1..3), avoid/prefer/accessories 참조 무결, avoid∩prefer = ∅, patternMax 0..3 | error |
| V-28 | accessoryTypes 창·계절·colorFrom, accessoryRules: id 유일, when 키 허용 목록, accessory ∈ types, delta −2..+1, severity, pick 키 허용 목록, pick.color = 색 id 또는 파생 키, when 안 참조 무결 | error |
| V-29 | patterns 9, family·scale enum, itemTypes ∈ topTypes∪outerTypes∪materials, patternRules: when 키 허용, effect enum, exclude → severity block, 참조 무결 | error |
| V-30 | midTypes 필드·enum, midLayerRules·twoOuterRules 참조 무결(any/none 규약), score 1..5, 여름 미드 행은 score 1·block | error |
| V-31 | outfits: `styles[]`·`occasions[]`가 `styleTags(styleVector())`·`occasionFit()` 재계산과 동일, mid 0~1(fit null), 패턴 아이템 ≤ 2 | error |
| V-32 | labels: `style.*` `occasion.*` `pattern.*` `midType.*` `accessory.*` `category.mid` 전부 + 각 스타일 `explain.style.<id>` | error |
| V-33 | 전체 JSON 합(JSON.stringify, 들여쓰기 없음) < 360KB. V-22는 기존 16개 파일 < 300KB로 범위 조정 | warn |

V-20 출처 코드표에 CX 코드 68개(`content-expansion-data.md` 7-1) + 내부 참조 `CX, R1 5-8, R2 5-5, R2 6-2, R2 6-3, R2 6-4, T8, T9`를 합쳤다(`validate.js CX_CODES` = `scripts/build/sources.mjs CX_CODES`).

### 11-4. 데이터 결정·조정 (2026-10-20)

1. **V-26 정합 19셀**: 시그니처 품목인데 가중 < +2였던 셀을 +2로(표 2-1): minimal dressShirt · amekaji sneakerColor · cityboy wool·sandal · bizcasual denimBlack · street sneakerWhite · gorpcore tee·henley·jersey·chino·workboot·sandal·coachJacket · ivy wool·sneakerWhite · workwear chukka·derby·duffle·blouson.
2. **분포 조정 1셀**: `color white` minimal 3 → 2. 조정 전 minimal 태그 34/52(65%) > 60%. 후보 8안을 시뮬레이션해 가장 작은 변경을 택했다. 결과(태그 = 상위 2): minimal 29(56%) · ivy 26(50%) · bizcasual 21(40%) · amekaji 8(15%) · cityboy 5(10%) · workwear 3(6%) · street 2(4%) · gorpcore 2(4%), 태그 없는 코디 0.
3. `cityboy` phase 1 → 2 (PM D-1 1차 범위 4개). 표 1-1도 같이 고쳤다.
4. 상황 avoid의 `materials`는 top·bottom·outer·mid에만 적용, 신발 소재는 보지 않는다(`sneakerWhite`는 가죽이지만 `active`의 선호 신발) — 신발은 `shoeTypes`로만 거른다.
5. 상황별 코디 수(`occasions[]`): work 22 · weekend 38 · date 29 · active 10 · formal 1(수트 없음, 예상대로), 상황 없는 코디 4.
