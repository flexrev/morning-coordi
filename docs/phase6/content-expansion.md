# Phase 6 콘텐츠 확장 — 스타일 아키타입·상황·액세서리·패턴·레이어링 (CX)

작성일: 2026-10-19 · 작성: CX(콘텐츠 확장) · 단계: 6-A 컨셉·탐색 · 대상 독자: 총괄 PM(게이트 5 결정), C2(데이터·엔진 6-B), UX(화면), AS(자산 품목 확대)
입력: `docs/phase6/00-plan.md`, `docs/architecture/data-schema.md`, `docs/architecture/engine-spec.md`, `src/engine/constants.js`, `docs/research/style-rules.md` 0·5·7장, `docs/research/color-rules.md` 2·7장, `docs/review/gate-4-review.md` 4절
샘플 데이터 표: **`docs/phase6/content-expansion-data.md`** (표만, `scripts/build/*.mjs` 파싱용). 이 문서는 설계·근거·결정 사항.

---

## 0. 요약과 PM 결정 요청

현재 엔진은 "색 베이스 1개 → 클래식 3장 + 톤/색상/변주"로, 추천의 **축이 색 하나**다. 소유자 요청은 (1) 스타일 아키타입, (2) 상황, (3) 액세서리·패턴·레이어링까지 **확장 가능한 구조**. 설계 원칙:

| 원칙 | 내용 |
|---|---|
| Quick 불변 | 스타일·상황을 **명시적으로 고르지 않으면** Quick 3장은 지금과 바이트 단위로 같다. `scoreOutfit()`은 건드리지 않는다 |
| 데이터만 추가 | 새 JSON 6개는 전부 **없거나 빈 배열이면 기능 OFF**. 기존 파일의 필드 추가는 선택 필드만 |
| 태그는 계산 | `outfits.styles[]`·`occasions[]`는 손 태깅이 아니라 **빌드 타임에 friendly 함수로 계산** → 검증이 재계산과 일치해야 통과 |
| 가산, 차단 아님 | 스타일·상황 가중은 `final`에 **더하는 보정**이고 `blocked`·계절·포멀도 차단은 절대 뒤집지 않는다 |
| 깊은 경로에만 | 액세서리·미드 레이어·2패턴은 Deep + 옵션 ON에서만. Quick 카드 구조(top·bottom·shoes·outer)는 그대로 |

**PM이 확정해야 할 결정 3건** (상세는 각 절):

| # | 결정 | CX 제안 | 대안 |
|---|---|---|---|
| D-1 | 스타일 가중이 점수에 들어가는 **위치**와 1차 범위 | `recommend()` 단계에서 `final + K_STYLE × styleNorm[s]`(K_STYLE 0.5, ±0.5점)로 **재정렬만**. 1차 범위 4개: `minimal · bizcasual · ivy · amekaji`(+`cityboy`는 데이터만 준비) | 스타일 축을 `styleRaw`에 넣어 `scoreOutfit` 자체를 바꾸기(Quick 영향, 테스트 48건 재검) |
| D-2 | 상황 프리셋의 **격식 창** 처리 | 창 밖 아이템은 **감점**(−0.3/아이템), avoid 목록만 제외. 3장이 안 나오면 단계적 완화 → **항상 3장** 보장 | 창 밖은 전부 제외(격식 프리셋에서 1~2장만 나올 수 있음) |
| D-3 | **미드 레이어**를 5번째 카테고리(`mid`)로 추가할지 | 추가한다(`items`에 `category: "mid"` 0~1개, V-17 완화). Quick은 mid 없는 카드만 뽑는다 | 미드를 outer `layer: 0`으로 끼워 넣기(스키마 변경 없음, 의미 꼬임) |

부수 결정: 격식(결혼식·면접) 프리셋에 **수트 품목이 없다**(topTypes·outerTypes에 수트 없음). 1차는 블레이저+울 슬랙스+드레스 셔츠로 근사하고 2차에 `suitJacket`·`suitTrouser`를 추가할지 PM 판단.

---

## 1. 스타일 아키타입 (styles.json)

### 1-1. 8개 아키타입 정의

2025~2026 한국 남성복 매체(GQ·Vogue·Esquire·Allure·W Korea)와 해외 가이드에서 반복 등장하는 축을 8개로 고정했다. id는 camelCase, 라벨은 국내 통용어.

| id | 라벨 | 정의(3줄) | 시대·국내 맥락 | 출처 |
|---|---|---|---|---|
| `minimal` | 미니멀 | 장식·로고 없는 무채색·뉴트럴 기본템. 실루엣은 정돈된 레귤러~루즈, 롱 코트로 무게 중심. "정답이 아니라 의도"(Vogue Korea) — 오래 입는 좋은 기본. | 콰이어트 럭셔리가 2024~2026 미니멀 부활을 이끎. 2026 FW 슬릭 미니멀리즘(Esquire) | VKMIN, VKMIN2, ESQMIN, WKDENIM |
| `amekaji` | 아메카지 | 미국 워크웨어·밀리터리·아이비를 일본식으로 재해석. 인디고 데님·플란넬·데님 셔츠·워크 부츠, 스트레이트 실루엣. 질감과 빈티지 워시가 핵심, 포인트는 체크·러스트 한 점. | 2024~2025 국내 "작업복도 패션"(뉴스토마토), 카고·루즈 데님·포켓 베스트 | NTAME, STRUM, TRADEJP, KHSTYLE6 |
| `cityboy` | 시티보이 | 일본 Popeye가 정의한 "도시 소년": 아이비 뿌리 + 루즈·박시 실루엣, 와이드 치노·워시드 데님, 로퍼·스니커즈, 캔버스 토트. 어스·뉴트럴 저채도, 꾸민 듯 안 꾸민 느낌. | 2023~2025 국내 와이드 데님·오버핏 셔츠 흐름과 겹침(Vogue·W Korea) | YOKO, POPWIKI, SNKCITY, ESQCITY, VKWIDE |
| `bizcasual` | 비즈니스 캐주얼 | 수트와 캐주얼 사이. 타이 없는 드레스·옥스포드 셔츠 또는 니트 + 울 슬랙스·다크 치노 + 로퍼·더비 + 블레이저·트렌치. 포멀도 5~9 창. | 2025 Allure "슬랙스 출근룩", GQ "여름 출근 덜 입되 있어 보이게" | SUITBC, ALLWORK, ALLBLZ, GQKSUM |
| `street` | 스트릿 | 오버핏 후디·맨투맨, 와이드·풀 기장 데님 또는 스웻팬츠, 컬러·레트로 스니커즈, 코치 재킷·숏 패딩. 모노 베이스에 포인트 1개. | 2025 카고 팬츠 재부상(Vogue Korea), 뉴발란스 레트로 러닝 | VKCARGO, VKNB, R2 7(o05·o20) |
| `gorpcore` | 고프코어 | 아웃도어 기능복을 일상복으로: 플리스·셸·패딩, 카고·테크 팬츠, 트레일 러닝화, 백팩. 어스·블랙 베이스에 포인트 플리스 1개. 과하면 코스튬. | 2023 국내 정착(Vogue·경향), 2026 윈드브레이커가 하이패션으로 흡수. 러닝코어로 이동 중 | VKGORP, KHGORP, GQKGORP, HSSGORP, SNKGORP |
| `ivy` | 클래식·아이비 | 옥스포드 버튼다운·피케 폴로·코튼 니트 + 치노·코듀로이 + 페니 로퍼·척카 + 네이비 블레이저·가디건·더플. 네이비·화이트·카키·올리브, 깅엄·잔줄. 2026 "3세대 프레피"로 재점화. | GQ Korea 2026 봄 "반항적 프레피", Vogue Korea 2026 FW "3세대 프레피 룩" | OPUMOIVY, STUIVY, VOUIVY, GQK8, VKFW26 |
| `workwear` | 워크웨어 | 초어·셔츠 재킷, 데님 재킷, 헨리·데님 셔츠, 인디고·카키 트윌, 워크 부츠·더비. "패턴이 아니라 질감". 박시 핏 + 스트레이트. 아메카지와 겹치나 빈티지 감성 없이 담백. | 카하트 WIP FW25 스톤·베이지·브라운 팔레트, 국내 카키스 2025 SS | STRIDE, MRPWORK, MOMCHORE, DAZEDCW |

### 1-2. 시그니처 품목 (type + material + fit + color 경향)

| id | 상의 | 하의 | 신발 | 아우터 | 톤 그룹 | 상의 핏 / 하의 핏 / 기장 | 계절 |
|---|---|---|---|---|---|---|---|
| minimal | knitWool·knitCashmere·tee·dressShirt | wool·denimBlack·chino | sneakerWhite(가죽)·derby·chelsea·loaferPenny | chesterfield·trench·balmacaan | mono, neutral | regular·loose / tapered·straight / nobreak | 연중(겨울 롱 코트가 정점) |
| amekaji | flannelShirt·denimShirt·henley·tee·sweatshirt | denimIndigo·chino·corduroy·denimWashed | workboot·chukka·sneakerColor | denimJacket·shirtJacket·blouson·leatherJacket | earth, navyBase | regular·loose / straight·wide / half·nobreak | 봄가을·겨울 중심 |
| cityboy | oxfordShirt·tee·sweatshirt·knitCotton·linenShirt | chino·denimWashed·wool(와이드)·linen | loaferPenny·sneakerWhite·sneakerColor·sandal | shirtJacket·cardigan·balmacaan·duffle·overshirt | neutral, earth, pastel | loose·oversized / wide·straight / crop·nobreak | 연중(여름 강함) |
| bizcasual | dressShirt·oxfordShirt·knitWool·poloWool·knitCashmere | wool·chino·flannel·denimBlack | loaferPenny·derby·loaferTassel·chelsea·oxford | blazer·trench·chesterfield·balmacaan | neutral, navyBase, mono | regular·slim / tapered·slim / nobreak·half | 연중 |
| street | hoodie·sweatshirt·tee | jersey·denimWashed·nylonTech·denimBlack | sneakerColor·running·sneakerWhite | coachJacket·shortPuffer·blouson·leatherJacket | mono, accent | oversized·loose / wide·straight / full·nobreak | 연중 |
| gorpcore | tee·hoodie·henley | nylonTech·jersey·chino | running·workboot·sandal | fleece·shortPuffer·longPuffer·coachJacket | earth, mono, accent | regular·loose / tapered·straight / nobreak·crop | 봄가을·겨울 |
| ivy | oxfordShirt·poloPique·knitCotton·knitWool·poloWool | chino·corduroy·flannel·wool | loaferPenny·chukka·loaferTassel·sneakerWhite | blazer·cardigan·duffle·peacoat·balmacaan | navyBase, neutral, earth | regular / tapered·regular / crop·nobreak | 연중 |
| workwear | tee·henley·denimShirt·flannelShirt | denimIndigo·chino·corduroy·denimWashed | workboot·chukka·derby | shirtJacket·denimJacket·duffle·blouson | earth, navyBase | regular·loose / straight·wide / half·nobreak | 봄가을·겨울 |

### 1-3. 피할 것 (스타일별 avoid)

| id | 피할 것 | 근거 |
|---|---|---|
| minimal | 포인트 컬러 2개 이상, 패턴 2개, 로고, 4색 이상 | WKDENIM(무채색으로 묶기), Vou1 3색 규칙 |
| amekaji | 울 슬랙스, 옥스포드 슈즈, 태슬 로퍼, 핀스트라이프, 블랙 아이템 2개 이상(원톤 코디의 블랙 소품은 '애매'해짐) | STRUM |
| cityboy | 슬림 핏, 옥스포드 슈즈, 셔츠+타이, 롱 패딩 | YOKO(박시), ESQCITY |
| bizcasual | 후디·맨투맨, 러닝화·샌들, 숏/롱 패딩, 카모 | SUITBC, R2 5-5 |
| street | 울 슬랙스, 태슬 로퍼, 옥스포드, 드레스 셔츠, 핀스트라이프 | R2 7(o05·o20 변주 메모) |
| gorpcore | 울·플란넬 하의, 로퍼·더비·옥스포드, 블레이저·트렌치. 기능템 3개 이상·네온 2개 이상은 코스튬 | HSSGORP, GQKGORP |
| ivy | 후디, 러닝화, 롱 패딩, 카모, 오버사이즈 | OPUMOIVY, STUIVY |
| workwear | 옥스포드, 태슬 로퍼, 핀스트라이프, 울 슬랙스, 캐시미어. 지퍼 후디를 초어 재킷 안에 | STRIDE |

### 1-4. styleAffinity 점수 설계

**데이터**: `styleAffinity.json` = `[{ kind, id, weights: { minimal, amekaji, … }, note }]`. `kind` 12종(상의 품목·아우터 품목·신발·하의 소재·상의 핏·하의 핏·바지 기장·상의 기장·아우터 기장·색·패턴·액세서리). 가중치 `w ∈ −2..+3` 정수. 표에 없는 (kind,id)는 0. 전체 126행은 data 파일 2-1.

**왜 품목·핏·색을 따로 보나**: 같은 "흰 티+인디고"도 straight·nobreak·흰 스니커즈면 미니멀, wide·full·컬러 스니커즈면 스트릿이다. 스타일은 품목 하나가 아니라 **품목×핏×색의 합**이므로 차원을 쪼개고 더한다. 아이템 하나가 두 번 세어지지 않게 차원을 품목(top·outer는 itemType, shoes는 shoeType, bottom은 material)과 속성(fit·length·color)으로 나눴다.

**계산** (`src/engine/style.js` 신설, 순수 함수):

```
lookups(outfit) =
  top:    topType, topFit, topLength, color
  bottom: material, bottomFit, trouserLength, color
  shoes:  shoeType, color × 0.5          // 신발 색은 면적이 작아 반 가중(R1 3장 '작은 뉴트럴')
  outer:  outerType, outerLength, color  // outer 2개면 바깥쪽(layer 2)만
  mid:    midType, color                 // D-3 채택 시
  pattern: 각 아이템의 pattern ≠ null → pattern
styleVec[s]  = Σ weights[kind|id][s] × 가중              // 8개 스타일 전부, Map 조회 ≤ 15회
styleNorm[s] = clamp(styleVec[s] / (3 × Σ가중), −1, 1)    // 아이템 수와 무관하게 −0.67..1
dominant     = argmax styleNorm (동점이면 styles.json 순서)
styleTags    = { s | styleNorm[s] ≥ STYLE_TAG_MIN(0.4) && styleNorm[s] ≥ STYLE_TAG_RATIO(0.8) × max }  // 보통 1~3개
```

**검산 예시** (data 2-1 값으로 수기 계산):

| 코디 | styleVec(top 3) | styleNorm max | styleTags | 해석 |
|---|---|---|---|---|
| o01 흰 티·인디고 straight·흰 스니커즈 | minimal 18.5 · amekaji 15.5 · workwear 15.5 (Σ가중 9.5 → 분모 28.5) | 0.65 | minimal, amekaji, workwear | 범용 기본이라 여러 스타일에 걸침 — 카드엔 상위 2개만 |
| o03 흰 옥스포드·네이비 블레이저·베이지 치노 tapered·브라운 페니 로퍼 | ivy 28.5 · bizcasual 27.5 · minimal 22.5 (분모 37.5) | 0.76 | ivy, bizcasual | 아이비·비즈캐주얼 경계 코디로 정확 |
| o05 멜란지 스웻 loose·코치 재킷·워시드 데님 straight·컬러 스니커즈 | street 우세, cityboy·amekaji 차순 | — | street, cityboy | R2 메모 "스트릿 기본"과 일치 |

**스타일 선택 시 보정**: `boost = K_STYLE × styleNorm[s]`, `K_STYLE = 0.5` → `final`에 **−0.33..+0.5** 가산 후 재정렬. `blocked`·`percent`의 원본은 보존하고 `score.styleBoost`와 `score.finalRanked`를 따로 둔다(설명 문구 "미니멀 +0.4"). 임계값·계수는 전부 `constants.js`에.

**1차 범위 제안**: `minimal · bizcasual · ivy · amekaji` 4개(00-plan 4절 "3~4개"). 근거 — 기존 52개 outfits를 위 함수로 돌리면 이 4개가 태그의 대부분을 차지할 것으로 예상(미니멀·아이비·비즈캐주얼은 클래식 데이터와 겹치고 아메카지는 데님·플란넬 행이 많음). `street·gorpcore·workwear·cityboy`는 데이터는 넣되 UI 칩은 2차(`phase: 2`). 실제 분포는 C2가 `scripts/build/styles.mjs`로 돌려 게이트 5에 숫자로 보고.

---

## 2. 상황 프리셋 (occasions.json)

| id | 라벨 | 포멀도 창(아이템) | 목표 평균 | 스타일 부스트 | 핵심 avoid | 선호 | 근거 |
|---|---|---|---|---|---|---|---|
| `work` | 출근(오피스 캐주얼) | 3~9 | 5~8 | bizcasual +2, minimal +1, ivy +1 | 후디·탱크·맨투맨·롱패딩·플리스, 러닝화·샌들·컬러 스니커즈, 저지, 카모·플란넬 체크·브레통 | 옥스포드·드레스 셔츠·울 니트·울 폴로, 블레이저·트렌치·체스터필드, 로퍼·더비·흰 스니커즈(가죽) | SUITBC(타이 생략, 정돈), ALLWORK, GQKSUM, R2 5-5(흰 스니커즈+슬랙스 가죽형) |
| `weekend` | 주말 | 1~7 | 2~6 | amekaji·cityboy·street·workwear 각 +1 | 셔츠+타이·드레스 셔츠, 옥스포드·태슬 로퍼, 핀스트라이프 | 티·맨투맨·플란넬·데님 셔츠·코튼 니트, 데님·셔츠 재킷·플리스, 스니커즈·척카·워크 부츠 | KHSTYLE6, VKCARGO, R2 7(o21 "겨울 주말") |
| `date` | 데이트 | 3~8 | 4~7 | minimal +2, cityboy +1, ivy +1 | 후디·탱크·맨투맨·롱패딩·플리스, 러닝화·샌들, 카모·큰 체크 | 니트·옥스포드·린넨 셔츠·피케 폴로, 가디건·블레이저·발마칸, 페니 로퍼·흰 스니커즈·첼시 | GQKDATE(셔츠 단추 2개·치노·튀지 않는 로퍼), ESQDATE(여유 핏, 각 잡힌 블레이저는 면접), ALLDATE(소품은 벨트·시계) |
| `active` | 운동·산책 | 1~4 | 1~4 | gorpcore +3, street +1 | 셔츠류·울 폴로·캐시미어, 테일러링 아우터 전부, 가죽 신발 전부(척카 포함), 울·플란넬·트위드·가죽 | 티·후디·맨투맨·헨리, 플리스·숏 패딩·코치 재킷, 러닝화·스니커즈·샌들 | VKGORP, HSSGORP(쓸 수 있는 신발), KHGORP |
| `formal` | 격식(결혼식·면접) | 6~10 | 7~9 | bizcasual +3, minimal +1 | 캐주얼 상의·아우터 전부, 스니커즈·러닝화·샌들·워크/척카 부츠, 데님·저지·나일론·코듀로이·린넨, 브레통·체크·카모 | 드레스 셔츠(+타이)·캐시미어, 블레이저·체스터필드·트렌치, 옥스포드·더비·로퍼 | GQKWED(다크 네이비·차콜 수트+흰 셔츠+무지 타이+검정 더비 = 가족 결혼식 안전; 짙은 블랙은 피함), GQKSUIT, BOSSWED(겨울: 네이비·그레이·차콜), CMTINT·HKINT(면접: 네이비>차콜, 올블랙은 딱딱, 셔츠는 무지·잔줄) |

**처리 규칙** (D-2):
1. `avoid*` 목록에 걸리는 후보는 풀에서 **제외**. 3장이 안 되면 avoidPatterns → avoidMaterials → avoidItemTypes 순으로 완화(신발 avoid는 끝까지 유지 — 격식에 샌들이 나오면 신뢰 붕괴).
2. 아이템 포멀도가 창 밖이면 아이템당 **−0.3**(상한 −0.9), 코디 평균이 목표 안이면 **+0.2**. 포멀도 레벨은 기존 `formality.json` 그대로 쓴다(새 데이터 없음).
3. `styleBoost`는 `Σ boost[s] × styleNorm[s] / Σ boost × K_OCC(0.4)`로 1-4의 스타일 보정과 같은 자리에 더한다.
4. `patternMax` 초과 후보 제외(패턴 데이터 없는 1차에서는 무시).
5. 액세서리 기본값 `accessories[]`는 Deep 액세서리 ON일 때 추천 1순위 후보로만 쓴다.

**격식 프리셋의 한계**: 수트 품목이 없어 "네이비 수트"를 못 만든다. 1차는 `blazer(8) + wool(7) + dressShirt(7) + derby/oxford` = 평균 7.5~8로 근사. 결혼식 하객에서 **올블랙 수트·화이트/크림 수트 회피**는 GQKWED·CMTINT에서 "짙은 블랙 피함"만 확인됐고 흰 수트 금기는 통념(`flags: ["approx"]`).

---

## 3. 액세서리 레이어 (accessoryRules.json)

Deep에서 `accessories: true`일 때만 계산. **카드의 아이템이 아니라 카드 아래 "소품 제안" 줄**로 나간다(점수 영향 없음, 설명만) — 따라서 Quick과 기존 점수에 0 영향. 2차에 점수 반영을 원하면 `delta`를 `K_ACC`로 가중해 `final`에 더할 수 있게 `delta`를 이미 넣어 뒀다.

### 3-1. 소품 종류 19개 (data 4-1)

벨트 3(가죽·브레이디드·웨빙) · 시계줄 3(가죽·메탈·나토) · 양말 5(바지색·뉴트럴·페이크삭스·흰 운동양말·패턴) · 가방 4(토트·백팩·크로스바디·브리프케이스) · 모자 3(볼캡·비니·버킷햇) · 머플러 1. 각 종류에 `formalityMin/Max`·`seasons`·`colorFrom`(색을 어디서 가져오나: shoes / bottom / outfit / neutral / free).

### 3-2. 핵심 규칙 요약 (전체 32행은 data 4-2)

| 영역 | 규칙 | 출처 |
|---|---|---|
| 벨트 | 가죽 신발일 때만 벨트 매칭 규칙 적용. 같은 색 **계열**(복제 아님) + 같은 마감(스웨이드↔스웨이드). 블랙 벨트+브라운 구두 −2. 드레시할수록 25~32mm 좁은 벨트, 브레이디드는 수트에 −1. 스니커즈면 웨빙·브레이디드 자유. 상의가 벨트를 가리면 제안 생략 | MYRQ, TMMBELT, WH2·MM(T8) |
| 시계줄 | 가죽 스트랩은 벨트·신발 가죽과 한 색(T8). 나토·러버는 포멀도 ≤5. 버클 금속 = 시계 금속 | MYRQ, Vou1 |
| 양말 | 울·플란넬 + 가죽 구두 → 바지색보다 한 톤 어둡게(다리 길어 보임). 여름 로퍼·스니커즈 → 페이크삭스(맨발 금지). 겨울 로퍼 → 양말 노출(바지색·네이비·차콜). 흰 운동양말은 스니커즈·러닝화에만, 가죽 구두엔 −2. 패턴 양말은 코디에 패턴이 없을 때 작은 패턴만 | EGSOCK, EGNOSHOW, WHSOCK, R2 4-1 |
| 가방 | 포멀도 ≥7 → 가죽 브리프케이스·토트, 신발 계열 색. ≤4 → 나일론·캔버스 백팩·크로스바디, 블랙·올리브·네이비·차콜. 백팩+코트·블레이저 −1. 캔버스 토트는 시티보이·워크웨어·아이비 시그니처. 가죽 가방 = 신발 가죽 색 계열 | MOMBAG, FASHBAG, YOKO |
| 모자 | 포멀도 ≥7엔 볼캡·비니·버킷햇 생략(−1). 색은 아우터와 2~3톤 이내 또는 코디 안의 색(4번째 색 금지). 캐주얼 겨울 아우터(패딩·플리스·더플·피코트)엔 비니 +1, 체스터필드엔 변주 | LAIRD1, Vou1 |
| 머플러 | 무지 코트 → 어떤 색·패턴도 OK. 패턴 코트 → 무지 머플러, 코트 패턴 속 한 색. 코디에 포인트 컬러가 이미 있으면 머플러는 뉴트럴(3색 규칙). 드레시 코디엔 얇은 울·캐시미어 | ANSIN, ASOSSCARF, Vou1·WH1 |
| 공통 | 가죽(신발·벨트·시계줄·가방) 한 색, 금속(버클·시계) 한 색 | WH2, MM, MYRQ |

### 3-3. 데이터 형태

```jsonc
// accessoryRules.json
{ "id": "acBeltBrownShoes", "accessory": ["beltLeather"],
  "when": { "shoesMaterial": "leather", "shoesColor": ["brown", "chocolate", "tan", "camel"] },   // adjust.when과 같은 AND/OR 규약
  "pick": { "color": "shoesFamily", "finish": "shoes" },                                           // 색·마감을 코디에서 파생
  "delta": 1, "severity": "info", "note": "…", "sources": ["MYRQ", "TMMBELT"], "flags": [] }
```
`when` 허용 키는 adjust 허용 키 + `shoesMaterial, shoesFinish, outerPattern, formalityMin/Max, patternCount, accentCount, style, tuckIn, belt, watch, beltColor`(data 4-2 아래 목록). `pick.color`의 파생값(`shoesFamily`=신발 색의 `hue.analogous` 그룹, `bottomDarker`, `outerTone2`=아우터와 같은 톤 그룹…)은 `style.js`의 `deriveAccessoryColor()`가 계산.

**엔진 출력**: `Candidate.accessories?: [{ kind, id, color, note, severity }]` (소품 그룹별 1개, 최대 4줄: 벨트·양말·가방·모자/머플러). 규칙 2개 이상이 같은 그룹에 걸리면 delta 큰 것 → 출처 수 → id 순.

---

## 4. 패턴 (patterns.json · patternRules.json)

### 4-1. 패턴 9종 (data 5-1)

| id | 계열 | 크기 | 허용 품목 | 포멀도 | 계절 | 비고 |
|---|---|---|---|---|---|---|
| breton | stripe | mid | tee·knitCotton | 3 | 여름·봄가을 | 기존 `pattern: "breton"` 그대로. 상의만 |
| stripeShirt | stripe | small | oxfordShirt·dressShirt·linenShirt | 6 | 연중 | 펜슬·캔디. 블레이저 안 OK |
| pinstripe | stripe | small | wool(하의)·blazer | 8 | 봄가을·겨울 | 포멀도 ≥6 코디만 |
| gingham | check | small | oxfordShirt·linenShirt | 5 | 봄가을·여름 | 아이비 시그니처 |
| plaid | check | large | flannelShirt·shirtJacket·duffle | 3 | 봄가을·겨울 | 아메카지·워크웨어. 2026 FW "숲으로 간다"(버팔로 체크) |
| windowpane | check | large | blazer·chesterfield·balmacaan | 7 | 봄가을·겨울 | 테일러링 아우터만 |
| houndstooth | check | small | blazer·chesterfield·balmacaan·knitWool | 7 | 겨울·봄가을 | 모노 팔레트와 |
| herringbone | texture | small | blazer·chesterfield·balmacaan·tweed | 6 | 겨울·봄가을 | **질감**: 패턴 수에 세지 않음 |
| camo | print | large | shirtJacket·coachJacket(+카고 하의) | 2 | 봄가을·겨울 | 스트릿·고프코어, 단독 |

### 4-2. 혼합 규칙 (전체 19행은 data 5-2)

| 규칙 | 근거 |
|---|---|
| Quick: 패턴 아이템 **최대 1개**. Deep: 최대 2개, 3개는 차단(세 번째는 액세서리만) | FBPAT, BLPAT, WKCHECK(미니멀 룩의 체크는 포인트 1개) |
| 같은 계열(줄+줄, 체크+체크)은 **크기가 달라야** 함(작은+큰 OK, 같으면 −2). 다른 계열(줄+체크)은 비슷한 크기 OK | BLPAT(rule of scale), FBPAT, MRPPAT |
| 두 패턴은 색을 하나 이상 공유(아니면 −1). 패턴 1개 + 나머지 무지가 기본(+1) | FBPAT, WHPAT, AOSPAT |
| 브레통은 상의만, 네이비·인디고·베이지·화이트·미드데님 하의와 +1. 잔줄 셔츠는 테일러링 아우터 안에서 +1. 핀스트라이프는 포멀도 ≤5 코디에 −2 | R1 5-8, Dalm, FBPAT |
| 큰 체크(플란넬)엔 무지 하의 +1, 다른 체크와는 피함. 하운드투스는 모노 팔레트 +1. 카모는 단독·포멀 금지 | STRIDE, PRIMER, SSHOUND, HSSGORP |
| 패턴 + 포인트 컬러가 색을 공유하지 않으면 −1('시끄러움'). 신발·벨트는 항상 무지 | FBPAT, Vou1(T9) |

### 4-3. 데이터 표현

- `OutfitItem.pattern: string|null` — 기존 필드 그대로, 허용값을 `"breton"` 1개에서 `patterns.json`의 id 9개로 확장(V-17 수정). `enums.patterns`에 id 목록.
- `patterns.json`: `{ id, labelKo, family, scale, categories, itemTypes, formality, seasons, colorsTypical, note, sources }`.
- `patternRules.json`: `{ id, when, effect: "exclude"|"penalty"|"bonus"|"countAs", delta, severity, note, sources }`. `when`은 adjust 규약, 파생 키 `patternCount, sameFamily, scaleDiff, sharedColor, otherPattern, bottomPattern, outerPattern, outfitTones, accentCount`.
- 점수 위치: `delta`는 **adjust 축과 같은 자리**(`K_ADJ` 적용, `style.adjust.reasons`에 `explain.pattern {id}`). `exclude`는 후보 생성에서 뺀다. 패턴 아이템이 하나도 없는 코디는 규칙 평가를 건너뛰므로 기존 점수 불변.
- 후보 생성: Deep에서 `patternize` 단계를 추가 — 상의가 `stripeShirt/gingham/breton` 허용 품목이고 색이 허용색이면 패턴 변주 1장을 `variations`에 끼운다(카드당 ≤1). 자산팀(AS)이 패턴 SVG 채움(stripe·check·houndstooth 3종 텍스처면 9패턴 표현 가능)을 만들어야 화면에 보인다.

---

## 5. 레이어링 — 미드 레이어·2겹 아우터

### 5-1. 미드 타입 5종 (data 6-1)

`cardigan`(아우터 밑에 들어가면 mid) · `knitVest` · `quiltedVest` · `overshirtMid`(셔츠 재킷·오버셔츠가 코트 안으로) · `knitOverShirt`(셔츠 위 니트 = 겨울 기본 3겹). 각각 material·formality·length·weight·seasons.

### 5-2. 규칙 (data 6-2 12행 · 6-3 6행)

| 계절 | 베이스 → 미드 → 아우터 | 점수 | 근거 |
|---|---|---|---|
| 봄가을 | 티·옥스포드·헨리 → 가디건 → 셔츠 재킷·트렌치·발마칸 | 5 | R2 6-4, ESQLAY, ALLCARD |
| 봄가을 | 옥스포드·드레스 셔츠 → 니트 베스트 → 블레이저·발마칸 | 5 | OPUMOIVY, STUIVY(아이비 정석) |
| 봄가을 | 셔츠·코튼 니트·티 → 퀼팅 베스트 → (없음)·셔츠 재킷 | 4 | PTOMID(팔 부피 없음), OPUMOLAY |
| 봄가을 | 티·헨리 → 오버셔츠 → 트렌치·발마칸 | 4 | OPUMOLAY, IHLAY |
| 겨울 | 옥스포드·드레스 셔츠 → 셔츠 위 니트 → 코트 4종 | 5 | R2 6-4, KHLAY |
| 겨울 | 티·옥스포드 → 가디건 → 피코트·더플·발마칸 (체스터필드는 4) | 5 / 4 | ESQLAY, OPUMOLAY |
| 겨울 | 니트 → 퀼팅 베스트 → 롱 코트 = 부피 과다 → 변주 3 | 3 | PTOMID |
| 겨울 | 후디 → (없음) → 숏/롱 패딩·코치 재킷 (후드 밖으로) 5 / 후디+롱 코트 변주 3 | 5 / 3 | VKNB, HSSGORP, R2 5-5 |
| 여름 | 미드 없음. 티·린넨·폴로 → 오버셔츠만. 미드 레이어는 차단(1) | 5 / 1 | R2 6-2·6-4 |
| 2겹 아우터(겨울) | 가죽 재킷·블루종(short) + 체스터필드·발마칸(long) = 변주 3 · 데님 재킷 + 더플·발마칸 = 클래식 4 · 플리스 + 패딩 = 4 | 3~4 | R2 7(s22), YOKO, HSSGORP |
| 2겹 아우터(봄가을·여름) | 봄가을 변주 2(데님 재킷+트렌치 정도), 여름 차단 1 | 2 / 1 | R2 6-4 |

**공통 규칙**(엔진 상수): 미드 포멀도는 베이스와 아우터 사이 ±2 아니면 warn · 미드 기장 < 아우터 기장(regular 미드 + short 아우터 = block) · 미드 weight ≤ 아우터 weight(울 니트 + 나일론 코치 재킷 = 2) · 안쪽 아우터 length < 바깥 length 아니면 −2(같으면 −1).

### 5-3. 데이터 형태

- `layerRules.json`(기존 3행) 각 레코드에 선택 필드 추가: `"midAllowed": true|false`, `"midTypes": [...]`, `"twoOuter": "classic"|"variation"|"block"`. 엔진은 없으면 지금처럼 `maxLayers`만 본다.
- `midLayerRules.json`(신규): `{ id, season, base: topType[]|"any", mid: midType|"none", outer: outerType[]|"none"|"any", score, tag, note, sources }`.
- `twoOuterRules.json`(신규): `{ id, season, inner: outerType|"any", outer: outerType[]|"any", score, tag, note, sources }`.
- `enums.midTypes` 추가. **outfits.items에 `category: "mid"` 0~1개 허용**(D-3). `mid` 아이템은 `itemType`(midType)·`material`·`color`·`length`를 가지며 fit은 null.
- 점수: 새 축 `layer`(가중 0.7, 아우터 축처럼 **mid가 있을 때만** ΣW에 포함). `mid` 없는 코디는 축 자체가 없으므로 기존 점수 불변. 색 축에는 `top↔mid`(0.5), `mid↔outer`(0.5) 쌍을 추가하되 mid가 있을 때만.

---

## 6. 데이터 스키마 확장 제안

### 6-1. 파일 목록

| 파일 | 최상위 | 행 수(샘플) | 소유 | 비고 |
|---|---|---|---|---|
| `styles.json` | 배열 | 8 | CX→C2 | 1-1·1-2. `phase` 필드로 1차/2차 구분 |
| `styleAffinity.json` | 배열 | 126 | CX→C2 | `{ kind, id, weights:{8}, note }` |
| `occasions.json` | 배열 | 5 | CX→C2 | 2절 |
| `accessoryTypes.json` | 배열 | 19 | CX→C2 · AS(실루엣) | 3-1 |
| `accessoryRules.json` | 배열 | 32 | CX→C2 | 3-3 |
| `patterns.json` | 배열 | 9 | CX→C2 · AS(텍스처) | 4-1 |
| `patternRules.json` | 배열 | 19 | CX→C2 | 4-3 |
| `midLayerRules.json` | 배열 | 12 | CX→C2 | 5-3 |
| `twoOuterRules.json` | 배열 | 6 | CX→C2 | 5-3 |
| `layerRules.json` (기존) | 배열 | 3 | 선택 필드 3개 추가 | 5-3 |
| `enums.json` (기존) | 객체 | — | `styles`, `occasions`, `patterns`, `midTypes`, `accessoryTypes`, `accessoryGroups` 키 추가 | |
| `outfits.json` (기존) | 배열 | 52 | 레코드에 `styles: []`, `occasions: []` **계산 필드** 추가. `items`에 `mid` 0~1 허용 | 6-4 |
| `labels.ko.json` (기존) | 배열 | +~70 | `style.` `occasion.` `pattern.` `midType.` `accessory.` 네임스페이스 | V-12 확장 |

### 6-2. JSON 예시

```jsonc
// styles.json
{ "id": "ivy", "labelKo": "클래식·아이비", "labelEn": "Classic Ivy", "phase": 1,
  "formality": { "min": 4, "max": 8 }, "tones": ["navyBase", "neutral", "earth"], "seasons": ["springFall", "summer", "winter"],
  "fits": { "top": ["regular"], "bottom": ["tapered", "regular"], "trouserLength": ["crop", "nobreak"] },
  "signature": { "top": ["oxfordShirt", "poloPique", "knitCotton", "knitWool", "poloWool"], "bottom": ["chino", "corduroy", "flannel", "wool"],
                 "shoes": ["loaferPenny", "chukka", "loaferTassel", "sneakerWhite"], "outer": ["blazer", "cardigan", "duffle", "peacoat", "balmacaan"] },
  "avoid": ["hoodie", "running", "longPuffer", "camo", "oversized"],
  "sources": ["OPUMOIVY", "STUIVY", "VOUIVY", "GQK8", "VKFW26"], "flags": [], "note": "2026 '3세대 프레피'" }

// styleAffinity.json
{ "kind": "shoeType", "id": "loaferPenny",
  "weights": { "minimal": 2, "amekaji": 0, "cityboy": 2, "bizcasual": 3, "street": -1, "gorpcore": -2, "ivy": 3, "workwear": -1 }, "note": "" }

// occasions.json
{ "id": "work", "labelKo": "출근(오피스 캐주얼)",
  "formality": { "min": 3, "max": 9, "targetLo": 5, "targetHi": 8 },
  "styleBoost": { "bizcasual": 2, "minimal": 1, "ivy": 1 },
  "avoid": { "itemTypes": ["hoodie", "tank", "sweatshirt", "longPuffer", "fleece"], "shoeTypes": ["running", "sandal", "sneakerColor"], "materials": ["jersey"], "patterns": ["camo", "plaid", "breton"] },
  "prefer": { "itemTypes": ["oxfordShirt", "dressShirt", "knitWool", "poloWool", "blazer", "trench", "chesterfield"], "shoeTypes": ["loaferPenny", "derby", "sneakerWhite", "chelsea"] },
  "patternMax": 1, "accessories": ["beltLeather", "bagBriefcase", "bagTote", "watchLeather"],
  "sources": ["SUITBC", "ALLWORK", "GQKSUM", "R2 5-5"], "flags": [], "note": "흰 스니커즈는 가죽 미니멀형만" }

// outfits.json (계산 필드 추가)
{ "id": "o03", "items": [ /* … */ ], "tags": ["neutral", "navyBase"], "isClassic": true, "universal": true,
  "styles": ["ivy", "bizcasual"],          // 빌드 타임 계산(6-4). 손으로 고치지 않는다
  "occasions": ["work", "date"],            // 빌드 타임 계산
  "sources": [ /* … */ ], "flags": [] }
```

### 6-3. 하위 호환

| 상황 | 동작 |
|---|---|
| 새 파일이 없거나 `[]` | `buildIndex`가 `index.styles = null` 등으로 두고 `recommend()`는 `style/occasion/accessories` 옵션을 무시(결과에 `byStyle`·`styleTags` 없음). `data/index.js`는 정적 import라 파일 자체는 **항상 존재**시키되 빈 배열 허용 |
| `outfits.styles` 없음 | 런타임에 `styleVector()`로 계산(캐시). 빌드 필드는 검증·UI 필터·"오늘의 추천" 사전 계산용일 뿐 |
| `items.pattern` 값이 `"breton"`만 | 그대로 유효. V-17이 `enums.patterns`를 참조하도록 바뀔 뿐 |
| `category: "mid"` 없음 | 전 코디 기존 구조. `mid`가 있는 코디만 `layer` 축 추가 |
| 기존 테스트 E-01~E-20·Phase 4 48건 | 옵션 미지정 호출은 코드 경로가 동일 → 그대로 통과해야 한다(게이트 6 기준) |

### 6-4. `outfits.styles[]`·`occasions[]` 빌드 타임 계산

- `scripts/build/styles.mjs`: `src/engine/style.js`의 `styleVector(index, outfit)`·`styleTags(vec)`·`occasionFit(index, outfit)`을 **그대로 import**해(validate.js와 같은 방식) 52개 코디에 `styles[]`·`occasions[]`를 써 넣는다. 손 태깅 금지 — 리서치 표의 "스트릿 기본" 같은 메모는 `note`에만 남고 태그는 함수가 결정한다.
- `occasions[]` 기준: avoid에 안 걸리고, 아이템 전부가 포멀도 창 안이며, 평균이 목표 창 안인 occasion id.
- 재현성: 같은 입력이면 같은 출력(결정적). affinity 표를 고치면 `npm run build:data`가 태그를 다시 쓴다.
- 결과 보고: 빌드 로그에 스타일별 코디 수·태그 없는 코디 수(목표 0)·occasion별 수를 찍어 게이트 5 자료로.

### 6-5. 검증 규칙 추가 (V-23 ~ V-32)

| # | 규칙 | 심각도 |
|---|---|---|
| V-23 | styles: id 유일·camelCase, `formality.min ≤ max`, signature·avoid의 id가 enum에 존재, `phase ∈ 1,2`, sources ≥ 2 | error |
| V-24 | styleAffinity: (kind,id) 유일, kind ∈ 12종, id가 해당 enum에 존재, weights 키가 styles 전체와 1:1, 값 정수 −2..+3 | error |
| V-25 | styleAffinity 커버리지: topTypes 16·outerTypes 16·shoes 11·bottom materials 11·fits 9·lengths 10·colors 32 전부 행 존재 | error |
| V-26 | 스타일별 "시그니처 품목"은 그 스타일 열이 ≥ +2(정의와 affinity 불일치 방지). 스타일별 avoid 품목은 ≤ 0 | error |
| V-27 | occasions: 5개 이상, formality·target 창 정합, styleBoost 키가 styles에 존재, avoid/prefer id 존재, 같은 id가 avoid와 prefer에 동시 등장 금지 | error |
| V-28 | accessoryRules: `when` 키 허용 목록, `accessory`가 accessoryTypes에 존재, delta −2..+1, `pick.color` 값이 색 id 또는 파생 키 | error |
| V-29 | patterns 9·patternRules: `pattern`·`itemTypes` 참조 무결, effect enum, `exclude`면 severity block | error |
| V-30 | midLayerRules·twoOuterRules: id 참조 무결, 여름 미드 행은 score 1·block, score 1~5 | error |
| V-31 | outfits: `styles[]`·`occasions[]`가 `styleTags()`·`occasionFit()` 재계산과 **동일**(손 태깅 탐지). `mid` 0~1, `pattern ∈ enums.patterns`, 패턴 아이템 ≤ 2 | error |
| V-32 | labels: `style.*` `occasion.*` `pattern.*` `midType.*` `accessory.*` 전부 존재. 각 스타일에 `explain.style.<id>` 한 줄 설명 | error |
| V-33 | 전체 JSON 합 < 360KB(기존 302KB + 신규 ≈ 40KB) | warn |

### 6-6. 용량

styleAffinity 126 × ~130B ≈ 16KB, styles 8 × 700B ≈ 6KB, occasions 5 × 600B ≈ 3KB, accessoryTypes+Rules 51 × 220B ≈ 11KB, patterns+Rules 28 × 200B ≈ 6KB, 레이어 18 × 180B ≈ 3KB, labels +70 × 100B ≈ 7KB → **≈ 52KB 미압축, gzip ≈ 10KB**. 번들 예산(gzip JS ≤ 120KB) 안. 엔진 코드 `style.js` ≈ 4KB.

---

## 7. 엔진 확장 설계

### 7-1. 시그니처

```ts
Query {
  base: BaseItem, season: Season, mode: "quick"|"deep",
  style?: StyleId | null,          // 명시적 선택. null/undefined = 지금과 동일
  occasion?: OccasionId | null,
  accessories?: boolean,           // Deep에서만 의미. 기본 false
  layering?: boolean               // Deep에서만. mid 레이어 후보 생성 ON. 기본 false
}
RecommendResult {
  …기존 필드 전부 동일…,
  byStyle?: StyleGroup[],          // Deep만. 선택 스타일이 있으면 그 스타일 + 근접 스타일 1개, 없으면 태그 상위 ≤4 스타일
  applied?: { style: StyleId|null, occasion: OccasionId|null }   // 무엇이 적용됐는지 UI 표시용
}
Candidate { outfit, score, explain, styleTags?: StyleId[] /* ≤3, dominant 먼저 */, accessories?: AccessoryPick[] }
OutfitScore { …기존…, styleVec?: Record<StyleId, number>, styleNorm?: Record<StyleId, number>, styleBoost?: number, occasionAdj?: number, finalRanked?: number }
StyleGroup { style: StyleId, labelKey: "style.<id>", candidates: Candidate[] }   // 각 ≤ 5, fillDiverse 적용
```

`createEngine(data)`는 추가로 `styles()`(1차 범위·라벨)·`occasions()`를 노출해 UI가 칩을 그린다.

### 7-2. 점수 어디에 들어가나 (D-1)

```
scoreOutfit(index, outfit, season)                 // 변경 없음. final·blocked·percent 그대로
styleVector(index, outfit) → styleVec/styleNorm    // 항상 계산(≤15 Map 조회), score.styleVec에 첨부. Quick 카드의 styleTags도 여기서
rank(candidates, { style, occasion }):
  boost     = style    ? K_STYLE × styleNorm[style] : 0                     // −0.33..+0.5
  occAdj    = occasion ? K_OCC × Σ(boost_s × styleNorm[s]) / Σboost_s       // ≤ ±0.4
                         + windowPenalty(−0.3/아이템, 하한 −0.9) + targetBonus(+0.2) : 0
  finalRanked = final + boost + occAdj                                       // 정렬에만 쓴다
  blocked는 그대로 — 스타일·상황은 차단을 만들지도 풀지도 않는다
정렬: blocked 제외 → finalRanked 내림차순 → 기존 동점 규칙(universal → isClassic → sources → id)
```

- 패턴 규칙의 `delta`만 예외로 **adjust 축**에 들어간다(4-3). 패턴 아이템이 없으면 무영향.
- `percent`(안전도)는 `final` 기준 그대로 둔다. 스타일 보정은 "미니멀 +0.4" 같은 **별도 설명 줄**(`explain.styleBoost {style, delta}`)로만 보인다 — 안전도 숫자가 스타일 선택으로 흔들리면 사용자가 혼란.
- 상수(`constants.js`): `K_STYLE = 0.5`, `K_OCC = 0.4`, `OCC_WINDOW_PENALTY = -0.3`, `OCC_WINDOW_FLOOR = -0.9`, `OCC_TARGET_BONUS = 0.2`, `STYLE_TAG_MIN = 0.4`, `STYLE_TAG_RATIO = 0.8`, `STYLE_TAGS_MAX = 3`, `STYLE_SHOES_COLOR_WEIGHT = 0.5`, `BY_STYLE_MAX_GROUPS = 4`, `W_LAYER = 0.7`.

### 7-3. 모드별 동작

| 모드 | style/occasion 없음 | style 또는 occasion 있음 |
|---|---|---|
| Quick | **지금과 동일한 3장**(pickClassic 풀·정렬 불변). 각 카드에 `styleTags`만 첨부(표시 여부는 UX) | pickClassic의 각 티어 안에서 `finalRanked`로 정렬. 풀 자체(universal 히트 → 5·classic → 4·classic)는 불변 → 여전히 3장·결정적. occasion의 avoid는 풀에서 제외(완화 규칙 2절) |
| Deep | 기존 classic·byTone·byHue·variations 동일 + `byStyle`(태그 상위 ≤4 스타일, 각 5장, fillDiverse) | classic 재정렬 + `byStyle = [선택 스타일(≤5), 근접 스타일 1개]` + byTone·byHue·variations도 `finalRanked`로 정렬(집합은 동일) |
| Deep + accessories | — | 각 Candidate에 `accessories[]` 첨부(점수 무영향) |
| Deep + layering | — | generateCandidates가 미드 레이어 변형(mid 1개 삽입)을 후보에 추가(상한 +100). Quick에는 절대 안 나옴 |

### 7-4. 성능

- `styleVector`: 아이템당 3~4회 Map 조회 × ≤5 아이템 = ≤20회, 8개 스타일 덧셈 → **< 2µs/코디**. Deep 후보 300개 × 2µs = 0.6ms. 기존 15~27ms에 묻힌다.
- 액세서리 32규칙 × 선형 평가 = 카드당 ~5µs. Deep 결과 카드(≤ 3+30+15+15+20 ≈ 85장)만 계산 → < 1ms.
- 메모 키를 `(base 시그니처, season, mode, style, occasion, accessories, layering)`으로 확장. LRU 20 유지(스타일 칩을 바꿔 가며 눌러도 8×20이 아니라 최근 20개).
- 빌드 타임 사전 계산은 여전히 불필요. `outfits.styles[]`는 검증·필터용이지 런타임 지름길이 아니다.

### 7-5. 테스트 케이스 추가 (E-21 ~ E-32)

| # | 입력 | 기대 |
|---|---|---|
| E-21 | 기존 E-01~E-20 전부, 옵션 미지정 | 결과 deep-equal(스타일 데이터 유무와 무관) |
| E-22 | o01 `styleVector` | dominant = minimal, styleTags ⊇ {minimal, amekaji} |
| E-23 | o03(옥스포드+블레이저+치노+페니 로퍼) | styleTags = [ivy, bizcasual] 순 |
| E-24 | indigo quick, `style: "amekaji"` | 3장·blocked 0·결정적. 첫 장 styleTags ∋ amekaji |
| E-25 | indigo quick, `style: "bizcasual"` vs 미지정 | 3장의 `final`·`percent` 값은 동일 집합에서 재정렬만(새 카드가 들어와도 풀 밖은 없음) |
| E-26 | charcoal(울) deep, `occasion: "active"` | classic에 가죽 신발 0, 3장 보장(완화 로그 존재) |
| E-27 | beige deep, `occasion: "formal"` | 스니커즈·데님 0, 평균 포멀도 ≥ 7 |
| E-28 | deep, `accessories: true`, 브라운 로퍼 카드 | accessories에 beltLeather color ∈ brown 계열, 여름이면 socksNoShow |
| E-29 | 검정 더비 + 브라운 벨트 강제 코디 | acBeltBrownBlack warn −2 |
| E-30 | 패턴 2개(breton + plaid) | ptSameFamily 아님·sharedColor false → warn; Quick 풀에서는 exclude |
| E-31 | 여름 + mid(cardigan) | mlSuMidBlock → blocked |
| E-32 | `validateData(data)` | V-23~V-33 error 0, `outfits.styles` 재계산 일치 |

---

## 8. 샘플 데이터 요약 (`content-expansion-data.md`)

| 표 | 행 수 | 비고 |
|---|---|---|
| 1-1 styles | **8** (1차 4 + 2차 4) | 전부 정의·시그니처·avoid·출처 채움 |
| 2-1 styleAffinity | **126** × 8 스타일 = 1,008 가중치 | topType 16 · outerType 16 · shoeType 11 · material 11 · fit 9 · length 10 · color 32 · pattern 9 · accessory 12 |
| 3-1 occasions | **5** | work · weekend · date · active · formal |
| 4-1 accessoryTypes | 19 | |
| 4-2 accessoryRules | **32** | 벨트 8 · 시계 3 · 양말 8 · 가방 5 · 모자 3 · 머플러 4 · 공통 1 |
| 5-1 patterns | 9 | |
| 5-2 patternRules | **19** | |
| 6-1 midTypes | 5 | |
| 6-2 midLayerRules | 12 | |
| 6-3 twoOuterRules | 6 | |
| 7-1 출처 코드(CX) | 68 | V-20 코드표에 합칠 것 |

표 규약은 `docs/research`와 동일(`### N-M.` 제목 + 헤더 + 구분선, `readTable()`로 읽힘). 다중 값은 `,`, 조건은 `키=값;키=값`.

---

## 9. UI 시사점 (UX 팀용)

| 항목 | 제안 | Quick 2탭 영향 |
|---|---|---|
| 스타일 선택 위치 | **Deep(S4) 상단 가로 스크롤 칩** "전체 · 미니멀 · 아이비 · 비즈캐주얼 · 아메카지"(1차 4개). 선택 시 `byStyle` 탭이 첫 탭으로 오고 classic 재정렬. 설정 화면 "내 스타일(선택)"에 **기본값 저장** 가능하되, 저장값은 **Deep에만** 자동 적용 — Quick 3장은 사용자가 결과 화면에서 명시적으로 칩을 눌렀을 때만 바뀐다 | 없음 |
| 카드의 스타일 태그 | 카드 하단 캡션 줄 왼쪽에 **1개**(dominant) 작은 칩, 예 "아이비". 상세(S6)에서 ≤3개 + "미니멀 +0.4" 설명. universal 카드처럼 태그가 3개 걸치면 "기본"으로 표기(태그 숨김) — 범용 코디를 특정 스타일로 못 박지 않기 | 없음(캡션 1줄 안) |
| 상황 프리셋 | 결과 화면(S3) 3장 **아래** 칩 한 줄 "출근 · 주말 · 데이트 · 운동 · 격식". 한 번 탭 = 같은 베이스·계절로 `occasion` 재호출(메모이즈로 즉시). 선택 상태는 세션만 유지(아침마다 리셋). "오늘의 추천"(UX팀)이 요일로 work/weekend를 **제안만** 하고 자동 적용은 하지 않는 것을 권장 | 선택 사항이라 기본 경로 2탭 유지 |
| 격식 프리셋 안내 | 수트 없음 → 카드 위 한 줄 "재킷+슬랙스 기준. 수트는 2차" | — |
| 액세서리 | Deep 카드 상세(S6) 하단 "소품" 접힘 섹션, 토글 "소품 제안 보기"(기본 OFF, 설정에서 기본 ON 가능). 벨트·양말·가방·모자/머플러 4줄, 각 줄 = 아이콘 + 색 스와치 + 한 문장 | 없음 |
| 패턴 | 변주 탭에 "패턴 변주" 카드(브레통·잔줄·깅엄)가 섞임. AS 팀의 패턴 텍스처 자산이 선행 조건 | 없음 |
| 레이어링 | Deep 설정 토글 "겹쳐 입기"(봄가을·겨울만 노출). 카드 실루엣이 4~5겹이 되므로 AS 실루엣 v2의 mid 슬롯 필요 | 없음 |
| 라벨 | `labels.ko.json`에 `style.*`(라벨+한 줄 help: "미니멀 — 무채색·뉴트럴, 장식 없는 기본템"), `occasion.*`, `accessory.*`. 구어 alias: 아메카지=아메리칸 캐주얼, 고프코어=아웃도어 룩, 시티보이=시티보이 룩 | — |
| 접근성 | 스타일·상황 칩은 `role="radio"` 그룹, 선택 해제 가능("전체"). reduced-motion 시 재정렬 애니메이션 생략 | — |

---

## 10. 출처

전체 코드표(68개, URL 포함)는 `content-expansion-data.md` 7-1. 스타일 정의에 쓴 핵심 출처:

| 주제 | 국내 | 해외 |
|---|---|---|
| 트렌드 2025~2026 | GQ Korea 2026 봄 8대 트렌드(GQK8), Vogue Korea 2026 FW 12(VKFW26), Esquire Korea 슬릭 미니멀리즘(ESQMIN) | — |
| 미니멀 | Vogue Korea 미니멀리스트 아이템 10(VKMIN)·룩 5(VKMIN2), W Korea 무채색 데님(WKDENIM)·체크 킥(WKCHECK) | — |
| 아메카지 | 뉴스토마토(NTAME), 경향 6 스타일(KHSTYLE6) | STRUM, trade.gov(TRADEJP) |
| 시티보이 | Esquire Korea(ESQCITY), Vogue Korea 와이드 데님(VKWIDE), W Korea 오버핏 셔츠(WKOVER) | Yokogao(YOKO), Wikipedia Popeye(POPWIKI), SNKRDUNK(SNKCITY) |
| 비즈캐주얼·출근 | Allure Korea(ALLWORK·ALLBLZ), GQ Korea 여름 출근(GQKSUM) | Suitsupply(SUITBC) |
| 스트릿 | Vogue Korea 카고(VKCARGO)·뉴발란스(VKNB) | — |
| 고프코어 | Vogue Korea(VKGORP), 경향(KHGORP), GQ Korea(GQKGORP) | He Spoke Style(HSSGORP), SNKRDUNK(SNKGORP) |
| 아이비 | GQK8·VKFW26(3세대 프레피) | Opumo(OPUMOIVY), Stuarts(STUIVY), The VOU(VOUIVY) |
| 워크웨어 | — | Stridewise(STRIDE), MR PORTER(MRPWORK, 검색 요약), Man of Many(MOMCHORE), Dazed Carhartt WIP(DAZEDCW) |
| 격식·데이트 | GQ Korea 하객룩(GQKWED)·수트(GQKSUIT), Hugo Boss KR(BOSSWED), 코멘토·한국경제 면접(CMTINT·HKINT), GQ·Esquire·Allure 데이트(GQKDATE·ESQDATE·ALLDATE) | — |
| 액세서리 | — | Myrqvist 벨트(MYRQ), The Modest Man(TMMBELT), Effortless Gent 양말(EGSOCK·EGNOSHOW), Westwood Hart(WHSOCK), Man of Many 가방(MOMBAG), Fashionisto(FASHBAG), Laird 모자(LAIRD1), Ansin·ASOS 머플러(ANSIN·ASOSSCARF) |
| 패턴 | W Korea(WKCHECK) | FashionBeans(FBPAT), Black Lapel(BLPAT), MR PORTER(MRPPAT), Articles of Style(AOSPAT), Westwood Hart(WHPAT), Primer(PRIMER), StudioSuits(SSHOUND) |
| 레이어링 | Esquire Korea(ESQLAY), Allure Korea(ALLCARD), 경향(KHLAY) | Put This On(PTOMID), Opumo(OPUMOLAY), InsideHook(IHLAY) |

## 11. 갭과 한계

1. **MR PORTER 본문 3건(워크웨어·가방·양말)은 403**으로 검색 요약만 반영. 핵심 주장(워크웨어는 질감 중심, 가방은 코디 비례, 양말은 바지색)은 다른 출처와 일치.
2. **국내 시티보이·아메카지 정의 기사**가 검색에 거의 안 잡힘(무신사 매거진·디젤매니아 미노출). 해외·일본 출처 + 국내 와이드 데님/오버핏 기사로 보강. 국내 통용 정의는 P3 콘텐츠 검토에서 재확인 필요.
3. 비니·버킷햇 규칙은 출처 품질이 낮아 `CX` 통념 표기. 하객룩 "흰 수트 금기"도 통념(`approx`).
4. 스타일 affinity 가중치 1,008개는 CX 단독 판단 — 리서치 출처는 품목 수준까지만 말하고 핏·색 × 스타일 수치는 없다. 게이트 5에서 **52개 코디의 자동 태그 결과**를 보고 가중치를 조정하는 반복이 필요(V-26이 정의↔가중치 모순을 잡아준다).
5. 수트·카고 팬츠·반팔 셔츠·터틀넥·버킷햇·니트 베스트 등 **품목 enum 부재**로 스트릿·고프코어·격식이 근사치. 2차에 `topTypes`·`outerTypes`·`bottomTypes`(현재는 소재만) 확대 제안.
6. 고프코어는 국내 매체 기준 2026년 "러닝코어"로 이동 중 — 2차 범위로 둔 이유.

## 12. 6-B 구현 메모 (CX, 2026-10-20) — 설계와 달라진 점

구현 상세는 `docs/architecture/data-schema.md` 11절·`engine-spec.md` 12절·`data-conversion-log.md` 9절. 이 문서의 설계와 다른 점만 적는다.

| 절 | 설계 | 구현 | 이유 |
|---|---|---|---|
| 1-4 | `STYLE_TAGS_MAX = 3` | **2** (`styleTags()` = 상위 2, 임계 못 넘으면 dominant 1개) | 게이트 5 지시 "top-2". 태그 없는 코디 0 유지 |
| 1-4 검산 | o01 minimal 18.5 / 분모 28.5 = 0.65 | minimal 17 / 28.5 = **0.60** (amekaji 0.54) | 분포 조정으로 `color white` minimal 3 → 2 (data 2-1). 태그는 그대로 minimal·amekaji |
| 1-4 1차 범위 | 표 1-1 cityboy phase 1 | **phase 2** (`scripts/build/styles.mjs PHASE1_STYLES`가 phase를 결정, 표도 수정) | PM D-1: minimal·bizcasual·ivy·amekaji 4개 |
| 2-1 표 2-1 | — | 시그니처 품목 19셀을 +2로 올림 | V-26(시그니처 ≥ +2) 통과. 목록은 data-schema 11-4 |
| 2 처리 규칙 1 | avoidMaterials | 신발 소재에는 적용 안 함(shoeTypes로만) | sneakerWhite가 가죽이라 `active` 선호 신발이 걸림 |
| 2 처리 규칙 1 | 신발 avoid는 끝까지 유지 | 4단계(최후)에서 신발 avoid도 해제 | "항상 3장" 보장이 우선. `applied.relaxed`에 `shoeTypes`가 남으면 UI가 알 수 있다 |
| 4-3 | Deep에서 patternize 자동 | **opt-in** `patterns: true` | 7-3 "옵션 없는 Deep은 byTone·byHue·variations 동일" 원칙 |
| 4-3 | 패턴 delta = adjust 축 | 같되 합을 −2..+1로 클램프 | +1+1 중첩으로 변주가 클래식을 앞지르는 폭 제한 |
| 7-1 | `Query.style/occasion/accessories/layering` | + `patterns`, 그리고 `recommend(base, season, mode, opts)` 위치 인자 형태도 허용 | FE가 gate-5 3절 3항의 형태로 호출 |
| 7-1 | `Candidate.styleTags: StyleId[]` | `[{ id, score }]` + `tags: { style, occasion }` + `tagLabels` | UX 7-5 계약(`candidate.tags.style`)도 같이 제공 |
| 7-2 | 설명 `explain.styleBoost` | `candidate.styleReasons`/`styleExplain`(키 `explain.style.*`·`explain.occasion.*`·`explain.acc.*`)로 분리, `candidate.explain`은 불변 | S3 카드 줄에 스타일·상황 문구가 섞이지 않게 |
| 7-3 Deep+accessories | 옵션 ON일 때만 | Deep은 기본 ON, Quick은 요청 시만. 결과에 실리는 카드에만 계산 | UI가 S6 소품 섹션을 바로 그릴 수 있게. 300장 전부 계산은 낭비 |
| 7-5 E-27 | 평균 포멀도 ≥ 7 | ≥ 6 | 베이지 치노(5) 베이스로는 최대 6.75. 수트 품목(2차) 전까지 불가 |
| 5-2 | 미드 weight > 아우터 weight = 2 | 동일 + regular 미드 + short 아우터 = block, 포멀도 ±2 밖 = warn | 설계 공통 규칙 그대로. `midType` affinity 행은 없어 스타일 벡터엔 색만 기여 |
