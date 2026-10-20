# Phase 6 콘텐츠 확장 — 샘플 데이터 표 (CX)

작성일: 2026-10-19 · 작성: CX(콘텐츠 확장) · 설명·근거는 `content-expansion.md`
규칙: 이 파일은 **표만** 둔다(`scripts/build/*.mjs`가 `### N-M.` 제목으로 표를 찾아 `readTable()`로 읽는다). 셀 안에 `|` 금지. 빈 값은 `-`. 다중 값은 `,`로 구분(공백 없음). 조건(`when`)은 `키=값;키=값` (세미콜론 = AND, 쉼표 = OR). 모든 id는 camelCase. 가중치 `w`는 정수 −2..+3, `delta`는 정수 −2..+1, `score`는 1~5.

---

## 1. 스타일 아키타입 (styles.json)

### 1-1. styles (8행)

| id | labelKo | labelEn | formalityMin | formalityMax | tones | seasons | topFit | bottomFit | trouserLength | signatureTop | signatureBottom | signatureShoes | signatureOuter | avoid | phase | sources |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| minimal | 미니멀 | Minimal | 3 | 9 | mono,neutral | springFall,summer,winter | regular,loose | tapered,straight | nobreak | knitWool,knitCashmere,tee,dressShirt | wool,denimBlack,chino | sneakerWhite,derby,chelsea,loaferPenny | chesterfield,trench,balmacaan | accent2,pattern2,logo,fourColors | 1 | VKMIN,ESQMIN,WKDENIM,VKMIN2 |
| amekaji | 아메카지 | Amekaji | 2 | 5 | earth,navyBase | springFall,winter,summer | regular,loose | straight,wide | half,nobreak | flannelShirt,denimShirt,henley,tee | denimIndigo,chino,corduroy,denimWashed | workboot,chukka,sneakerColor | denimJacket,shirtJacket,blouson,leatherJacket | wool,oxford,loaferTassel,pinstripe,black2 | 1 | NTAME,STRUM,TRADEJP,KHSTYLE6 |
| cityboy | 시티보이 | City boy | 2 | 6 | neutral,earth,pastel | springFall,summer,winter | loose,oversized | wide,straight | crop,nobreak | oxfordShirt,tee,sweatshirt,knitCotton,linenShirt | chino,denimWashed,wool,linen | loaferPenny,sneakerWhite,sneakerColor,sandal | shirtJacket,cardigan,balmacaan,duffle,overshirt | slim,oxford,dressShirtTie,longPuffer | 2 | YOKO,POPWIKI,SNKCITY,ESQCITY,VKWIDE |
| bizcasual | 비즈캐주얼 | Business casual | 5 | 9 | neutral,navyBase,mono | springFall,summer,winter | regular,slim | tapered,slim | nobreak,half | dressShirt,oxfordShirt,knitWool,poloWool,knitCashmere | wool,chino,flannel,denimBlack | loaferPenny,derby,loaferTassel,chelsea,oxford | blazer,trench,chesterfield,balmacaan | hoodie,sweatshirt,running,sandal,shortPuffer,longPuffer,camo | 1 | SUITBC,ALLWORK,ALLBLZ,GQKSUM |
| street | 스트릿 | Street | 1 | 4 | mono,accent | springFall,summer,winter | oversized,loose | wide,straight | full,nobreak | hoodie,sweatshirt,tee | jersey,denimWashed,nylonTech,denimBlack | sneakerColor,running,sneakerWhite | coachJacket,shortPuffer,blouson,leatherJacket | wool,loaferTassel,oxford,dressShirt,pinstripe | 2 | VKCARGO,VKNB,R2 7 |
| gorpcore | 고프코어 | Gorpcore | 1 | 4 | earth,mono,accent | springFall,winter,summer | regular,loose | tapered,straight | nobreak,crop | tee,hoodie,henley | nylonTech,jersey,chino | running,workboot,sandal | fleece,shortPuffer,longPuffer,coachJacket | wool,flannel,loaferPenny,derby,oxford,blazer,trench | 2 | VKGORP,KHGORP,GQKGORP,HSSGORP,SNKGORP |
| ivy | 아이비 | Classic Ivy | 4 | 8 | navyBase,neutral,earth | springFall,summer,winter | regular | tapered,regular | crop,nobreak | oxfordShirt,poloPique,knitCotton,knitWool,poloWool | chino,corduroy,flannel,wool | loaferPenny,chukka,loaferTassel,sneakerWhite | blazer,cardigan,duffle,peacoat,balmacaan | hoodie,running,longPuffer,camo,oversized | 1 | OPUMOIVY,STUIVY,VOUIVY,GQK8,VKFW26 |
| workwear | 워크웨어 | Workwear | 2 | 5 | earth,navyBase | springFall,winter,summer | regular,loose | straight,wide | half,nobreak | tee,henley,denimShirt,flannelShirt | denimIndigo,chino,corduroy,denimWashed | workboot,chukka,derby | shirtJacket,denimJacket,duffle,blouson | oxford,loaferTassel,pinstripe,wool,knitCashmere | 2 | STRIDE,MRPWORK,MOMCHORE,DAZEDCW |

`phase` = MVP 1.1 1차 범위 제안(1) / 2차(2). `avoid`의 `accent2` = 포인트 컬러 2개 이상, `pattern2` = 패턴 2개 이상, `black2` = 블랙 아이템 2개 이상, `logo` = 로고 노출(자산 레벨), `fourColors` = 4색 이상.

---

## 2. 스타일 친화도 (styleAffinity.json)

### 2-1. styleAffinity (126행 × 8 스타일)

`kind` ∈ topType(상의 품목) · outerType(아우터 품목) · shoeType(신발) · material(**하의 소재에만** 적용) · topFit · bottomFit · trouserLength · topLength · outerLength · color(모든 아이템 색, 신발은 0.5 가중) · pattern · accessory. 표에 없는 (kind,id)는 0.

| kind | id | minimal | amekaji | cityboy | bizcasual | street | gorpcore | ivy | workwear | note |
|---|---|---|---|---|---|---|---|---|---|---|
| topType | dressShirtTie | 0 | -2 | -1 | 2 | -2 | -2 | 2 | -2 | 격식 전용 |
| topType | dressShirt | 2 | -1 | 0 | 3 | -2 | -2 | 1 | -1 | |
| topType | oxfordShirt | 1 | 1 | 2 | 2 | -1 | -1 | 3 | 0 | 아이비 1순위 셔츠 |
| topType | poloWool | 1 | 0 | 1 | 2 | -1 | -1 | 2 | -1 | |
| topType | knitWool | 2 | 1 | 2 | 2 | 0 | 0 | 2 | 1 | |
| topType | knitCashmere | 2 | -1 | 0 | 2 | -1 | -1 | 1 | -1 | |
| topType | linenShirt | 1 | 0 | 2 | 1 | -1 | -1 | 1 | 0 | 여름 시티보이 |
| topType | flannelShirt | -1 | 3 | 1 | -1 | 1 | 1 | 0 | 3 | 아메카지·워크웨어 시그니처 |
| topType | knitCotton | 2 | 1 | 2 | 1 | 0 | 0 | 2 | 0 | |
| topType | poloPique | 1 | 1 | 1 | 1 | 0 | -1 | 3 | -1 | |
| topType | denimShirt | 0 | 3 | 1 | -1 | 0 | 0 | 1 | 3 | 샴브레이 포함 |
| topType | henley | 1 | 2 | 0 | -1 | 0 | 2 | 0 | 2 | |
| topType | tee | 2 | 2 | 2 | -2 | 2 | 2 | 1 | 2 | 무지 기준. bizcasual −2(C6-05) |
| topType | sweatshirt | 1 | 1 | 2 | -2 | 3 | 1 | 0 | 1 | 맨투맨은 스트릿·시티보이(C6-05: amekaji 1, ivy 0) |
| topType | hoodie | -1 | 1 | 1 | -2 | 3 | 2 | -2 | 0 | ivy avoid 1순위(C6-05) |
| topType | tank | 0 | 0 | 0 | -2 | 1 | 0 | -1 | 0 | |
| outerType | denimJacket | 0 | 3 | 1 | -2 | 1 | 0 | 0 | 3 | |
| outerType | coachJacket | 0 | 1 | 1 | -2 | 3 | 2 | -1 | 0 | |
| outerType | blouson | 1 | 2 | 1 | 0 | 2 | 1 | 1 | 2 | 해링턴은 아이비 +1 |
| outerType | cardigan | 1 | 0 | 2 | 1 | 0 | -1 | 3 | 0 | |
| outerType | shirtJacket | 1 | 2 | 2 | 0 | 0 | 0 | -1 | 3 | 초어 재킷 포함. 워크웨어·아메카지(C6-05: ivy −1) |
| outerType | trench | 2 | -1 | 1 | 3 | -1 | -2 | 1 | -1 | |
| outerType | blazer | 1 | -2 | 1 | 3 | -1 | -2 | 3 | -2 | |
| outerType | overshirt | 1 | 1 | 2 | 0 | 0 | 0 | 1 | 1 | |
| outerType | chesterfield | 3 | -2 | 0 | 3 | -1 | -2 | 1 | -2 | 미니멀 시그니처 |
| outerType | balmacaan | 2 | 0 | 2 | 2 | 0 | -1 | 2 | 0 | |
| outerType | duffle | 0 | 1 | 2 | 0 | 0 | 0 | 3 | 2 | |
| outerType | peacoat | 1 | 1 | 1 | 1 | 0 | -1 | 2 | 1 | |
| outerType | shortPuffer | 0 | 0 | 1 | -2 | 2 | 3 | -1 | 0 | |
| outerType | longPuffer | -1 | -1 | 0 | -2 | 1 | 2 | -2 | -1 | |
| outerType | fleece | -1 | 1 | 1 | -2 | 1 | 3 | -2 | 1 | 고프코어 시그니처(C6-05: ivy −2) |
| outerType | leatherJacket | 1 | 2 | 0 | -2 | 2 | -1 | -1 | 1 | 비즈캐주얼 아우터 밖(C6-05) |
| shoeType | sneakerWhite | 3 | 0 | 2 | 1 | 2 | 0 | 2 | 0 | 가죽 미니멀형 기준 |
| shoeType | sneakerColor | -1 | 2 | 2 | -2 | 3 | 1 | 0 | 0 | 레트로 러닝 포함 |
| shoeType | running | 0 | 0 | 1 | -2 | 2 | 3 | -1 | -1 | 트레일화 포함 |
| shoeType | loaferPenny | 2 | 0 | 2 | 3 | -1 | -2 | 3 | -1 | |
| shoeType | loaferTassel | 1 | -1 | 0 | 2 | -2 | -2 | 2 | -2 | |
| shoeType | derby | 2 | 0 | 1 | 3 | -1 | -2 | 1 | 2 | 플레인토 기준 |
| shoeType | oxford | 1 | -2 | -1 | 2 | -2 | -2 | 1 | -2 | |
| shoeType | chelsea | 2 | 0 | 0 | 2 | 0 | -1 | 0 | 1 | |
| shoeType | workboot | -1 | 3 | 0 | -2 | 0 | 2 | -1 | 3 | |
| shoeType | chukka | 1 | 2 | 1 | 1 | -1 | 0 | 2 | 2 | 데저트 부츠 |
| shoeType | sandal | 0 | 0 | 2 | -2 | 0 | 2 | 0 | -1 | |
| material | denimIndigo | 1 | 3 | 1 | 0 | 1 | 0 | 1 | 3 | 하의만 |
| material | denimWashed | 0 | 2 | 2 | -2 | 2 | 1 | 0 | 2 | 하의만 |
| material | denimBlack | 2 | 0 | 0 | 2 | 2 | 0 | -1 | 0 | 하의만 |
| material | corduroy | 0 | 2 | 1 | 0 | 0 | 0 | 2 | 2 | 하의만 |
| material | chino | 2 | 2 | 2 | 2 | 0 | 2 | 3 | 2 | 하의만 |
| material | wool | 2 | -2 | 2 | 3 | -1 | -2 | 2 | -2 | 하의만 |
| material | flannel | 1 | -1 | 1 | 2 | -1 | -2 | 2 | -1 | 하의만 |
| material | linen | 1 | 0 | 2 | 1 | -1 | -1 | 1 | 0 | 하의만 |
| material | jersey | 0 | 1 | 1 | -2 | 3 | 2 | 0 | 0 | 하의만(스웻팬츠) |
| material | nylonTech | 0 | 0 | 1 | -2 | 2 | 3 | -1 | 0 | 하의만(테크 팬츠) |
| material | tweed | 0 | 0 | 0 | 1 | -2 | -2 | 3 | 0 | 하의만 |
| topFit | slim | 1 | -1 | -2 | 1 | -2 | -1 | 0 | -1 | |
| topFit | regular | 2 | 1 | 0 | 2 | 0 | 0 | 2 | 1 | |
| topFit | loose | 1 | 2 | 3 | 0 | 2 | 2 | 1 | 2 | |
| topFit | oversized | -1 | 1 | 2 | -2 | 3 | 1 | -1 | 1 | |
| bottomFit | slim | 1 | -1 | -2 | 1 | -2 | -1 | 0 | -1 | |
| bottomFit | tapered | 2 | 0 | 0 | 3 | 0 | 1 | 2 | 0 | |
| bottomFit | regular | 1 | 1 | 1 | 1 | 0 | 1 | 2 | 1 | |
| bottomFit | straight | 1 | 3 | 2 | 0 | 1 | 1 | 1 | 3 | |
| bottomFit | wide | 1 | 1 | 3 | -1 | 3 | 1 | 0 | 1 | |
| trouserLength | crop | 1 | 0 | 2 | 0 | 0 | 0 | 2 | -1 | |
| trouserLength | nobreak | 2 | 1 | 1 | 2 | 0 | 1 | 1 | 1 | |
| trouserLength | half | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 1 | |
| trouserLength | full | -1 | 1 | 0 | -1 | 2 | 0 | -1 | 1 | |
| topLength | crop | 0 | 0 | 1 | -2 | 1 | 0 | -1 | 0 | |
| topLength | regular | 2 | 1 | 1 | 2 | 1 | 1 | 1 | 1 | 기장은 저신호(C6-05: ivy 1) |
| topLength | long | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | |
| outerLength | short | 0 | 2 | 1 | -1 | 2 | 1 | 0 | 2 | |
| outerLength | regular | 1 | 1 | 1 | 1 | 0 | 1 | 1 | 1 | 기장은 저신호(C6-05: ivy 1) |
| outerLength | long | 2 | -1 | 1 | 2 | 0 | 0 | 1 | -1 | |
| color | white | 2 | 1 | 2 | 2 | 1 | 0 | 2 | 1 | |
| color | offWhite | 2 | 1 | 2 | 1 | 0 | 0 | 2 | 1 | |
| color | cream | 2 | 1 | 2 | 1 | 0 | 0 | 2 | 0 | |
| color | oatmeal | 2 | 1 | 2 | 1 | 0 | 0 | 1 | 1 | |
| color | beige | 2 | 2 | 2 | 2 | 0 | 1 | 2 | 2 | |
| color | khaki | 1 | 2 | 1 | 1 | 0 | 2 | 2 | 2 | |
| color | tan | 1 | 2 | 1 | 1 | 0 | 1 | 2 | 2 | |
| color | camel | 2 | 1 | 1 | 2 | -1 | 0 | 1 | 0 | |
| color | brown | 1 | 2 | 1 | 1 | 0 | 1 | 1 | 2 | |
| color | chocolate | 1 | 2 | 0 | 1 | 0 | 1 | 1 | 2 | |
| color | lightGrey | 2 | 0 | 1 | 1 | 1 | 0 | 1 | 0 | |
| color | greyMelange | 1 | 1 | 1 | -1 | 2 | 1 | 1 | 1 | |
| color | midGrey | 2 | 0 | 1 | 2 | 1 | 0 | 1 | 0 | |
| color | charcoal | 3 | 0 | 1 | 3 | 1 | 0 | 1 | 0 | |
| color | black | 3 | 0 | 0 | 1 | 3 | 2 | -1 | 1 | |
| color | navy | 2 | 1 | 1 | 3 | 1 | 0 | 3 | 1 | 네이비 코치 재킷·스니커즈는 스트릿 안전색(C6-05) |
| color | indigo | 1 | 3 | 1 | 0 | 1 | 0 | 1 | 3 | |
| color | midDenim | 0 | 2 | 2 | -1 | 1 | 0 | 1 | 2 | |
| color | lightDenim | 0 | 2 | 2 | -2 | 2 | 0 | 0 | 1 | |
| color | blackDenim | 2 | 0 | 0 | 1 | 2 | 0 | -1 | 1 | |
| color | lightBlue | 1 | 0 | 2 | 2 | 0 | 0 | 3 | 0 | |
| color | skyBlue | 0 | 0 | 2 | 1 | 0 | 0 | 2 | 0 | |
| color | olive | 1 | 3 | 1 | 0 | 1 | 3 | 1 | 3 | |
| color | forestGreen | 0 | 1 | 0 | 0 | 0 | 2 | 2 | 1 | |
| color | sage | 1 | 0 | 2 | 0 | 0 | 1 | 1 | 0 | |
| color | burgundy | 0 | 0 | 0 | 1 | 0 | -1 | 2 | 0 | |
| color | rust | 0 | 2 | 1 | 0 | 0 | 1 | 0 | 2 | |
| color | mustard | -1 | 1 | 1 | -1 | 0 | 1 | 1 | 1 | |
| color | dustyPink | 0 | -1 | 1 | 0 | 0 | -1 | 2 | -1 | |
| color | lavender | 0 | -1 | 1 | 0 | 0 | -1 | 1 | -1 | |
| color | teal | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 예비 색 |
| color | taupe | 2 | 1 | 1 | 1 | 0 | 1 | 0 | 1 | 예비 색 |
| pattern | breton | 0 | 1 | 2 | -1 | 0 | -1 | 2 | 0 | |
| pattern | stripeShirt | 1 | 0 | 2 | 2 | -1 | -2 | 2 | 0 | |
| pattern | pinstripe | 0 | -2 | -1 | 2 | -1 | -2 | 0 | -2 | |
| pattern | gingham | 0 | 0 | 1 | 1 | -1 | -2 | 3 | 0 | |
| pattern | plaid | -1 | 3 | 1 | -2 | 1 | 1 | 0 | 3 | |
| pattern | windowpane | 0 | -1 | 0 | 2 | -1 | -2 | 1 | -1 | |
| pattern | houndstooth | 1 | -1 | 0 | 2 | -1 | -2 | 2 | -1 | |
| pattern | herringbone | 1 | 0 | 0 | 2 | -1 | -1 | 3 | 0 | 질감으로 취급 |
| pattern | camo | -2 | 1 | 0 | -2 | 2 | 1 | -2 | 1 | |
| accessory | beltLeather | 1 | 0 | 0 | 2 | -1 | -1 | 2 | 0 | |
| accessory | beltBraided | 0 | 1 | 1 | 0 | -1 | -1 | 3 | 0 | |
| accessory | beltWebbing | 0 | 2 | 1 | -2 | 1 | 2 | 0 | 2 | |
| accessory | bagTote | 1 | 0 | 3 | 1 | 0 | 0 | 2 | 0 | 시티보이 시그니처 |
| accessory | bagBackpack | 0 | 1 | 1 | -1 | 2 | 3 | 0 | 1 | |
| accessory | bagCrossbody | 0 | 1 | 2 | -1 | 3 | 2 | 0 | 1 | |
| accessory | bagBriefcase | 1 | -2 | -1 | 3 | -2 | -2 | 1 | -2 | |
| accessory | cap | 0 | 2 | 2 | -2 | 2 | 1 | 1 | 2 | |
| accessory | beanie | 0 | 1 | 2 | -2 | 2 | 2 | 0 | 2 | |
| accessory | bucketHat | -1 | 1 | 1 | -2 | 1 | 2 | -1 | 0 | |
| accessory | scarf | 2 | 0 | 1 | 2 | 0 | 0 | 2 | 0 | |
| accessory | watchNato | -1 | 1 | 1 | -1 | 0 | 1 | 2 | 1 | |

---

## 3. 상황 프리셋 (occasions.json)

### 3-1. occasions (5행)

| id | labelKo | formalityMin | formalityMax | targetLo | targetHi | styleBoost | avoidItemTypes | avoidShoeTypes | avoidMaterials | avoidPatterns | preferItemTypes | preferShoeTypes | patternMax | accessories | note | sources |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| work | 출근(오피스 캐주얼) | 3 | 9 | 5 | 8 | bizcasual=2,minimal=1,ivy=1 | hoodie,tank,sweatshirt,longPuffer,fleece | running,sandal,sneakerColor | jersey | camo,plaid,breton | oxfordShirt,dressShirt,knitWool,poloWool,blazer,trench,chesterfield | loaferPenny,derby,sneakerWhite,chelsea | 1 | beltLeather,bagBriefcase,bagTote,watchLeather | 흰 스니커즈는 가죽 미니멀형만. 격차 ≥4 카드는 제외 | SUITBC,ALLWORK,GQKSUM,R2 5-5 |
| weekend | 주말 | 1 | 7 | 2 | 6 | amekaji=1,cityboy=1,street=1,workwear=1 | dressShirtTie,dressShirt | oxford,loaferTassel | - | pinstripe | tee,sweatshirt,flannelShirt,denimShirt,knitCotton,denimJacket,shirtJacket,fleece | sneakerWhite,sneakerColor,chukka,workboot | 2 | cap,bagCrossbody,bagBackpack,beltWebbing | 포멀도 상한을 낮춰 캐주얼 카드가 먼저 오게 | KHSTYLE6,VKCARGO,R2 7 |
| date | 데이트 | 3 | 8 | 4 | 7 | minimal=3,cityboy=1,ivy=1 | hoodie,tank,sweatshirt,longPuffer,fleece,dressShirt | running,sandal | jersey | camo,plaid | knitWool,knitCotton,oxfordShirt,linenShirt,poloPique,cardigan,balmacaan | loaferPenny,sneakerWhite,chelsea,derby | 1 | scarf,beltLeather,watchLeather | 여유 있는 핏, 소품은 벨트·시계 정도. 각 잡힌 블레이저는 면접처럼 보임 | GQKDATE,ESQDATE,ALLDATE |
| active | 운동·산책 | 1 | 4 | 1 | 4 | gorpcore=3,street=1 | dressShirtTie,dressShirt,oxfordShirt,poloWool,knitCashmere,blazer,trench,chesterfield,balmacaan,peacoat,leatherJacket | loaferPenny,loaferTassel,derby,oxford,chelsea,chukka | wool,flannel,tweed,knitCashmere,leather | pinstripe,houndstooth,windowpane,gingham | tee,hoodie,sweatshirt,henley,fleece,shortPuffer,coachJacket | running,sneakerColor,sneakerWhite,sandal | 1 | cap,bagBackpack,bagCrossbody,beltWebbing | 저지·나일론·러닝화 우선. 가죽 신발 전부 제외 | VKGORP,HSSGORP,SNKGORP,KHGORP |
| formal | 격식(결혼식·면접) | 6 | 10 | 7 | 9 | bizcasual=3,minimal=1 | tee,hoodie,sweatshirt,tank,henley,denimShirt,flannelShirt,knitCotton,denimJacket,coachJacket,blouson,shirtJacket,overshirt,shortPuffer,longPuffer,fleece,leatherJacket,duffle | sneakerWhite,sneakerColor,running,sandal,workboot,chukka | denimWashed,denimIndigo,jersey,nylonTech,corduroy,linen | breton,plaid,gingham,camo,windowpane | dressShirtTie,dressShirt,knitCashmere,blazer,chesterfield,trench | oxford,derby,loaferTassel,loaferPenny | 1 | beltLeather,watchLeather,socksMatch | 네이비·차콜 우선, 올블랙 수트 피함(하객·면접 공통). 수트 품목은 MVP 범위 밖 → 블레이저+울 슬랙스로 근사 | GQKWED,GQKSUIT,BOSSWED,CMTINT,HKINT |

`formalityMin/Max` = 아이템별 포멀도 허용 창(밖이면 창 경계까지 거리 × −0.3, 하한 −1.5 — C6-01). `prefer`는 아이템당 +0.1(최대 +0.3, C6-09). 완화 상한: 격식·운동은 2단계(patterns→materials)까지만, 3장 미만 허용(`OCC_RELAX_MAX_STAGE`). 격식 avoid에서 linenShirt·poloPique 제외(여름 격식 근사, 창 감점만). `targetLo/Hi` = 코디 평균 포멀도 목표(안이면 +1 보너스). `patternMax` = 코디 내 패턴 아이템 상한. `accessories`의 `watchLeather`·`socksMatch`는 4-1 accessoryTypes id.

---

## 4. 액세서리 (accessoryRules.json)

### 4-1. accessoryTypes (19행)

| id | labelKo | group | formalityMin | formalityMax | seasons | colorFrom | note |
|---|---|---|---|---|---|---|---|
| beltLeather | 가죽 벨트 | belt | 4 | 10 | springFall,summer,winter | shoes | 신발 가죽 색·마감과 같은 계열 |
| beltBraided | 브레이디드 벨트 | belt | 3 | 6 | springFall,summer | shoes | 치노·린넨·로퍼. 수트 금지 |
| beltWebbing | 웨빙·캔버스 벨트 | belt | 1 | 4 | springFall,summer,winter | free | 스니커즈·부츠·카고 |
| watchLeather | 가죽 스트랩 시계 | watch | 4 | 10 | springFall,summer,winter | shoes | 벨트·신발과 가죽 통일(T8) |
| watchMetal | 메탈 시계 | watch | 3 | 10 | springFall,summer,winter | free | 버클 금속과 통일 |
| watchNato | 나토·러버 시계 | watch | 1 | 5 | springFall,summer,winter | outfit | 캐주얼만 |
| socksMatch | 바지색 양말 | socks | 6 | 10 | springFall,summer,winter | bottom | 바지보다 한 톤 어둡게 |
| socksNeutral | 뉴트럴 양말 | socks | 3 | 8 | springFall,summer,winter | neutral | 네이비·차콜·그레이 |
| socksNoShow | 페이크삭스 | socks | 1 | 6 | summer,springFall | - | 로퍼·스니커즈 여름 |
| socksWhite | 흰 운동 양말 | socks | 1 | 3 | springFall,summer,winter | - | 스니커즈·러닝화만 |
| socksPattern | 패턴 양말 | socks | 3 | 7 | springFall,winter | outfit | 작은 패턴만. 코디 패턴 0개일 때 |
| bagTote | 토트백 | bag | 2 | 8 | springFall,summer,winter | shoes | 가죽은 신발 계열, 캔버스는 자유 |
| bagBackpack | 백팩 | bag | 1 | 5 | springFall,summer,winter | neutral | 블랙·올리브·네이비·차콜 |
| bagCrossbody | 크로스바디 | bag | 1 | 5 | springFall,summer,winter | neutral | 나일론·캔버스 |
| bagBriefcase | 브리프케이스 | bag | 6 | 10 | springFall,summer,winter | shoes | 가죽, 신발 계열 |
| cap | 볼캡 | hat | 1 | 5 | springFall,summer,winter | outfit | 아우터와 2~3톤 이내 |
| beanie | 비니 | hat | 1 | 5 | winter,springFall | outfit | 캐주얼 아우터와 |
| bucketHat | 버킷햇 | hat | 1 | 4 | summer,springFall | outfit | 고프코어·스트릿 |
| scarf | 머플러 | scarf | 3 | 10 | winter,springFall | outfit | 포인트 컬러 1개로 계산 |

### 4-2. accessoryRules (36행)

| id | accessory | when | pick | delta | severity | note | sources |
|---|---|---|---|---|---|---|---|
| acBeltBrownShoes | beltLeather | shoesMaterial=leather;shoesColor=brown,chocolate,tan,camel | color=shoesFamily;finish=shoes | 1 | info | 브라운 계열끼리. 탄+에스프레소처럼 명도 차 크면 −1 | MYRQ,TMMBELT |
| acBeltBlackShoes | beltLeather | shoesMaterial=leather;shoesColor=black | color=black | 1 | info | 블랙 신발엔 블랙 벨트만 | MYRQ,TMMBELT |
| acBeltBurgundyShoes | beltLeather | shoesMaterial=leather;shoesColor=burgundy | color=chocolate;finish=shoes | 1 | info | 버건디·옥스블러드 구두엔 다크 브라운 또는 같은 버건디 벨트(C6-14) | MYRQ |
| acBeltBrownBlack | beltLeather | shoesMaterial=leather;beltColor=black;shoesColor=brown,chocolate,tan,camel | - | -2 | warn | 블랙 벨트+브라운 구두 금지(에스프레소 예외) | MYRQ,WH2,MM |
| acBeltSneaker | beltWebbing,beltBraided | shoeType=sneakerWhite,sneakerColor,running | color=free | 0 | info | 비가죽 신발엔 벨트 매칭 규칙 없음. 캔버스·브레이디드 권장 | MYRQ |
| acBeltSuede | beltLeather | shoesFinish=suede | finish=suede | 1 | info | 스웨이드엔 스웨이드. 매끈 가죽도 같은 계열이면 OK | MYRQ |
| acBeltFormalWidth | beltLeather | formalityMin=7 | width=25-32;finish=smooth | 1 | info | 드레시할수록 좁은 벨트. 브레이디드는 수트에 −1 | MYRQ |
| acBeltHiddenTee | beltLeather,beltBraided,beltWebbing | topType=tee,sweatshirt,hoodie,tank;tuckIn=false | skip | 0 | info | 상의가 벨트를 가리면 추천 생략 | CX |
| acBeltBuckleMetal | beltLeather | watch=watchMetal | metal=watch | 0 | info | 버클 금속 = 시계 금속(실버·골드 통일) | MYRQ |
| acWatchLeatherUnify | watchLeather | shoesMaterial=leather;shoesColor=brown,chocolate,tan,camel,black,burgundy;belt=beltLeather | color=shoesFamily | 1 | info | 신발·벨트·시계줄 가죽 한 색(T8) | WH2,MM |
| acWatchNatoCasual | watchNato | formalityMax=5 | color=outfitSecondary | 0 | info | 나토·러버는 포멀도 5 이하 코디만 | CX,OPUMOIVY |
| acWatchNatoFormal | watchNato | formalityMin=7 | - | -1 | warn | 드레스 코디에 나토 스트랩은 격차 | CX |
| acSocksMatchTrousers | socksMatch | season=springFall,winter;bottomMaterial=wool,flannel;shoeType=derby,oxford,loaferTassel,loaferPenny,chelsea | color=bottomDarker | 1 | info | 바지색 양말이 다리를 길어 보이게. 포멀웨어 기본(여름 로퍼는 페이크삭스, C6-18) | EGSOCK,WHSOCK |
| acSocksNoShowSummerLoafer | socksNoShow | season=summer;shoeType=loaferPenny,loaferTassel,sneakerWhite | - | 1 | info | 여름 로퍼는 페이크삭스(맨발 금지) | EGNOSHOW,R2 4-1 |
| acSocksWinterLoafer | socksMatch,socksNeutral | season=winter;shoeType=loaferPenny,loaferTassel | color=bottomDarker,navy,charcoal | 1 | info | 겨울 로퍼는 양말 노출. 바지색 또는 네이비·차콜 | R2 4-1,EGSOCK |
| acSocksWhiteSneakerOnly | socksWhite | shoeType=sneakerWhite,sneakerColor,running | color=white | 0 | info | 흰 운동 양말은 스니커즈·러닝화에만 | EGSOCK |
| acSocksWhiteDress | socksWhite | shoeType=derby,oxford,loaferPenny,loaferTassel,chelsea,chukka | - | -2 | warn | 가죽 구두에 흰 운동 양말 금지 | EGSOCK |
| acSocksCropSneaker | socksNoShow,socksWhite | trouserLength=crop;shoeType=sneakerWhite,sneakerColor | - | 0 | info | 크롭+스니커즈는 페이크삭스 또는 흰 크루(시티보이·스트릿) | EGSOCK,YOKO |
| acSocksPlainDefault | socksNeutral | shoeType=derby,oxford,loaferPenny,loaferTassel,chelsea,chukka,workboot;season=springFall,winter | color=bottomDarker,navy,charcoal | 0 | info | 구두·부츠의 기본은 바지보다 한 톤 어두운 무지 양말(C6-07) | EGSOCK,R2 4-1 |
| acSocksPatternOnce | socksPattern | patternCount=0;formalityMax=5;season=springFall;shoeType=sneakerWhite,sneakerColor | scale=small;color=bottomDarker | 0 | info | 패턴 양말은 봄가을 스니커즈에, 코디에 패턴이 없을 때만 작은 패턴(C6-07) | EGSOCK,FBPAT |
| acSocksSandal | socksNoShow | shoeType=sandal | skip | 0 | info | 샌들은 양말 없음. 양말+샌들은 스트릿 변주 | CX |
| acBagFormalLeather | bagBriefcase,bagTote | formalityMin=7 | material=leather;color=shoesFamily | 1 | info | 드레시 코디엔 가죽 브리프케이스·토트, 신발 계열 색 | MOMBAG,FASHBAG |
| acBagCasualNylon | bagBackpack,bagCrossbody | formalityMax=4 | material=nylon,canvas;color=black,olive,navy,charcoal | 1 | info | 캐주얼엔 나일론·캔버스. 안전색 4개 | MOMBAG |
| acBagBackpackFormal | bagBackpack | formalityMin=7 | - | -1 | warn | 백팩+코트·블레이저는 격차(가죽 백팩만 0) | MOMBAG,FASHBAG |
| acBagCanvasTote | bagTote | style=cityboy,workwear,ivy;formalityMax=6 | material=canvas;color=offWhite,navy,olive | 1 | info | 캔버스 토트는 시티보이·워크웨어·아이비 시그니처 | YOKO,MOMBAG |
| acBagLeatherUnify | bagTote,bagBriefcase | material=leather;shoesMaterial=leather;shoesColor=brown,chocolate,tan,camel,black,burgundy | color=shoesFamily | 1 | info | 가죽 가방은 신발 가죽 색 계열(T8). 흰 스니커즈엔 발화 안 함(C6-06) | WH2,MOMBAG |
| acHatFormalNone | cap,beanie,bucketHat | formalityMin=7 | skip | -1 | warn | 포멀도 7 이상엔 볼캡·비니·버킷햇 생략 | LAIRD1,CX |
| acHatTailoredNone | cap,bucketHat | outerType=blazer,trench,chesterfield,balmacaan,peacoat | skip | 0 | info | 테일러드 아우터엔 볼캡·버킷햇 생략(C6-08) | LAIRD1,CX |
| acCapColorRange | cap,beanie | hasOuter=true | color=outerTone2 | 0 | info | 아우터와 2~3톤 이내 또는 코디 안의 색. 4번째 색 금지 | LAIRD1,Vou1 |
| acBeanieCasualOuter | beanie | season=winter;outerType=shortPuffer,longPuffer,fleece,duffle,peacoat,denimJacket | color=outfit | 1 | info | 캐주얼 겨울 아우터엔 비니 +1. 체스터필드엔 변주 | LAIRD1,CX |
| acScarfSolidCoat | scarf | outerPattern=null;season=winter | color=free;pattern=allowed | 1 | info | 무지 코트엔 어떤 색·패턴 머플러도 OK | ANSIN,ASOSSCARF |
| acScarfSfCoat | scarf | outerPattern=null;season=springFall;outerType=trench,balmacaan,chesterfield | color=free;pattern=allowed | 1 | info | 봄가을 머플러는 코트(트렌치·발마칸·체스터필드)에만(C6-15) | ANSIN,ASOSSCARF |
| acScarfPatternCoat | scarf | outerPattern=houndstooth,plaid,herringbone,windowpane | pattern=solid;color=outerPick | 0 | info | 패턴 코트엔 무지 머플러, 코트 패턴에서 한 색 | ANSIN |
| acScarfAccentOnce | scarf | accentCount=1;hasOuter=true;season=winter,springFall | color=neutral | 0 | info | 코디에 포인트 컬러가 이미 있으면 머플러는 뉴트럴(3색 규칙) | Vou1,WH1 |
| acScarfFormalMaterial | scarf | formalityMin=6;hasOuter=true;season=winter,springFall | material=wool,cashmere;knit=fine | 0 | info | 드레시 코디엔 얇은 울·캐시미어. 청키 니트 머플러는 5 이하 | CX,ASOSSCARF |
| acMetalUnify | watchMetal,beltLeather | watch=watchMetal;belt=beltLeather | metal=unify | 0 | info | 금속(실버·골드) 통일 | MYRQ |

`when` 허용 키: `season, shoeType, shoesColor, shoesMaterial, shoesFinish, bottomMaterial, topType, outerType, outerPattern, trouserLength, hasOuter, formalityMin, formalityMax, patternCount, accentCount, style, tuckIn, belt, watch, beltColor, material`(가방 소재 — null이면 불일치, C6-06). 규칙 경로에서도 4-1 `formalityMin/Max`·`seasons`를 지킨다(C6-08). `shoesFamily`는 신발 색이 가죽 계열(brown·chocolate·tan·camel·black·burgundy)일 때만 색을 내고 버건디는 초콜릿(C6-06·14). 사용자 문장은 `labels.ko explain.acc.<id>`(scripts/build/labels.mjs ACC_RULE_TEXT). `pick` 허용 키: `color, finish, material, width, metal, pattern, scale, knit, skip`. `color` 값: 색 id 또는 `shoesFamily`(신발 색의 유사색 그룹) · `bottomDarker` · `outfit`(코디 안의 색) · `outfitSecondary` · `outerTone2`(아우터와 같은 톤 그룹) · `outerPick`(아우터 패턴 속 한 색) · `neutral` · `free`.

---

## 5. 패턴 (patterns.json · patternRules.json)

### 5-1. patterns (9행)

| id | labelKo | family | scale | categories | itemTypes | formality | seasons | colorsTypical | note | sources |
|---|---|---|---|---|---|---|---|---|---|---|
| breton | 브레통 스트라이프 | stripe | mid | top | tee,knitCotton | 3 | summer,springFall | navy,white | 가로 줄무늬. 하의는 무지 | R1 5-8,Dalm,FBPAT |
| stripeShirt | 펜슬·캔디 스트라이프 셔츠 | stripe | small | top | oxfordShirt,dressShirt,linenShirt | 6 | springFall,summer,winter | white,lightBlue,navy | 세로 잔줄. 블레이저 안 OK | FBPAT,PRIMER |
| pinstripe | 핀스트라이프 | stripe | small | bottom,outer | blazer | 8 | springFall,winter | charcoal,navy | 울 슬랙스·블레이저만 | FBPAT,BLPAT |
| gingham | 깅엄 체크 | check | small | top | oxfordShirt,linenShirt | 5 | springFall,summer | lightBlue,navy,black | 2색 체크. 아이비 시그니처 | PRIMER,FBPAT |
| plaid | 플란넬·타탄 체크 | check | large | top,outer | flannelShirt,shirtJacket,duffle | 3 | springFall,winter | rust,forestGreen,navy,black | 아메카지·워크웨어. 하의는 무지 | VKFW26,PRIMER,STRIDE |
| windowpane | 윈도페인 체크 | check | large | outer | blazer,chesterfield,balmacaan | 7 | springFall,winter | midGrey,charcoal,navy | 테일러링 아우터만 | FBPAT,BLPAT |
| houndstooth | 하운드투스 | check | small | outer,top | blazer,chesterfield,balmacaan,knitWool | 7 | winter,springFall | black,white,midGrey | 모노 팔레트와. 테일러링 | FBPAT,SSHOUND |
| herringbone | 헤링본 | texture | small | outer,bottom | blazer,chesterfield,balmacaan,tweed | 6 | winter,springFall | midGrey,charcoal,brown | 질감으로 취급(패턴 수에 세지 않음) | FBPAT,OPUMOIVY |
| camo | 카모 | print | large | bottom,outer | shirtJacket,coachJacket | 2 | springFall,winter | olive,khaki,brown | 스트릿·고프코어. 1개만 | VKFW26,HSSGORP |

### 5-2. patternRules (21행)

| id | when | effect | delta | severity | note | sources |
|---|---|---|---|---|---|---|
| ptQuickMaxOne | mode=quick;patternCount=2 | exclude | -2 | block | Quick 3장엔 패턴 아이템 최대 1개 | FBPAT,WKCHECK |
| ptDeepMaxTwo | mode=deep;patternCount=3 | exclude | -2 | block | Deep에서도 3개 이상 금지(세 번째는 액세서리만) | FBPAT,BLPAT |
| ptSameFamilyScale | patternCount=2;sameFamily=true;scaleDiff=0 | penalty | -2 | warn | 같은 계열(줄+줄, 체크+체크)은 크기가 달라야 함 | BLPAT,FBPAT,MRPPAT |
| ptSameFamilyScaleOk | patternCount=2;sameFamily=true;scaleDiff=2 | bonus | 1 | info | 작은+큰 같은 계열(깅엄+윈도페인)은 허용 | BLPAT,FBPAT |
| ptDiffFamilyScale | patternCount=2;sameFamily=false;scaleDiff=0,1 | bonus | 0 | info | 다른 계열(줄+체크)은 비슷한 크기 OK | BLPAT |
| ptShareColor | patternCount=2;sharedColor=false | penalty | -1 | warn | 두 패턴은 색을 하나 이상 공유 | FBPAT,WHPAT,AOSPAT |
| ptSolidGround | patternCount=1 | bonus | 1 | info | 패턴 1개 + 나머지 무지가 기본. 미니멀 룩의 킥 | WKCHECK,FBPAT |
| ptBretonTopOnly | pattern=breton;category=bottom,outer,shoes | exclude | -2 | block | 브레통은 상의만 | R1 5-8,Dalm |
| ptBretonPairs | pattern=breton;bottomColor=navy,indigo,beige,white,midDenim | bonus | 1 | info | 브레통 + 네이비·인디고·베이지·화이트 하의 | R1 5-8,Dalm |
| ptStripeShirtBlazer | pattern=stripeShirt;outerType=blazer,chesterfield,trench | bonus | 1 | info | 잔줄 셔츠는 테일러링 아우터 안에서 가장 안전 | FBPAT,BLPAT |
| ptPinstripeFormal | pattern=pinstripe;formalityMax=5 | penalty | -2 | warn | 핀스트라이프는 포멀도 6 이상 코디에서만 | FBPAT,BLPAT |
| ptPlaidBottomSolid | pattern=plaid;bottomPattern=null | bonus | 1 | info | 체크 셔츠·셔츠재킷엔 무지 하의(데님·치노) | STRIDE,PRIMER |
| ptPlaidCheckClash | pattern=plaid;otherPattern=gingham,windowpane,houndstooth | penalty | -2 | warn | 큰 체크 + 다른 체크는 크기 차가 있어도 피함(Quick) | FBPAT,MRPPAT |
| ptHoundstoothMono | pattern=houndstooth;outfitTones=mono | bonus | 1 | info | 하운드투스는 모노 팔레트 + 무지 하의 | FBPAT,SSHOUND |
| ptHoundstoothCasual | pattern=houndstooth;formalityMax=5 | exclude | -2 | block | 하운드투스는 테일러링 코디(포멀도 6 이상)에만 — 데님+워크 부츠 제외(C6-11) | FBPAT,SSHOUND |
| ptHoundstoothCasualShoes | pattern=houndstooth;shoeType=workboot,chukka,sneakerColor,running,sandal | exclude | -2 | block | 하운드투스 + 워크 부츠·척카·컬러 스니커즈 금지(C6-11) | FBPAT,SSHOUND |
| ptHerringboneTexture | pattern=herringbone | countAs=texture | 0 | info | 헤링본은 패턴 수에 세지 않음(질감) | FBPAT |
| ptCamoAlone | pattern=camo;patternCount=2 | exclude | -2 | block | 카모는 다른 패턴과 절대 같이 안 씀 | HSSGORP,CX |
| ptCamoFormal | pattern=camo;formalityMin=6 | exclude | -2 | block | 카모는 포멀 코디 금지 | CX |
| ptPatternAccent | patternCount=1;accentCount=1;sharedColor=false | penalty | -1 | warn | 패턴 + 포인트 컬러가 색을 공유하지 않으면 '시끄러움' | FBPAT,Vou1,T9 |
| ptShoesSolid | pattern=any;category=shoes | exclude | -2 | block | 신발·벨트는 항상 무지 | CX |

`when` 허용 키(패턴): `mode, patternCount, sameFamily, scaleDiff(0,1,2), sharedColor, pattern, otherPattern, category, bottomColor, bottomPattern, outerType, shoeType, outfitTones, formalityMin, formalityMax, accentCount`. 패턴 변주 생성은 코디 평균 포멀도가 패턴 포멀도 ±2 안일 때만(`PATTERN_FORMALITY_TOL`, C6-11). `effect` ∈ `exclude(후보 제외) · penalty · bonus · countAs`.

---

## 6. 레이어링 확장 (layerRules.json 확장 · midLayerRules.json)

### 6-1. midTypes (5행)

| id | labelKo | material | formality | length | weight | seasons | colors | note |
|---|---|---|---|---|---|---|---|---|
| cardigan | 가디건 | knitWool | 5 | regular | mid | springFall,winter | - | outerTypes.cardigan과 같은 품목. 아우터 밑에 들어가면 mid |
| knitVest | 니트 베스트 | knitWool | 5 | regular | light | springFall,winter | - | 셔츠 위. 아이비·시티보이 |
| quiltedVest | 퀼팅 베스트 | nylonTech | 3 | regular | mid | springFall,winter | navy,olive,black,charcoal,brown | 팔 부피 없음. 코트 안 OK. 나일론 기능템이라 색 제한(C6-12) |
| overshirtMid | 오버셔츠(미드) | null | 4 | regular | light | springFall | - | shirtJacket·overshirt가 코트 안에 들어갈 때 |
| knitOverShirt | 이너 니트 | knitWool | 5 | regular | mid | springFall,winter | - | top=oxfordShirt + mid=knitWool. 겨울 기본 3겹 |

### 6-2. midLayerRules (15행)

| id | season | base | mid | outer | score | tag | note | sources |
|---|---|---|---|---|---|---|---|---|
| mlSfCardiganShirtJacket | springFall | tee,oxfordShirt,henley | cardigan | shirtJacket,trench,balmacaan | 5 | classic | 봄가을 기본 3겹이에요. 안쪽은 얇고 매끈하게, 바깥은 두껍게 | R2 6-4,ESQLAY,ALLCARD |
| mlSfVestBlazer | springFall | oxfordShirt,dressShirt | knitVest | blazer,balmacaan | 5 | classic | 아이비 정석이에요. 베스트는 재킷 밑단 안에 들어가게 | OPUMOIVY,STUIVY |
| mlSfQuiltedVest | springFall | oxfordShirt,knitCotton,tee | quiltedVest | none,shirtJacket | 4 | classic | 초봄·늦가을에 좋은 겹옷이에요. 팔이 두꺼워지지 않아요 | PTOMID,OPUMOLAY |
| mlSfOvershirtUnderCoat | springFall | tee,henley | overshirtMid | trench,balmacaan | 4 | classic | 코트 안에 오버셔츠를 겹쳐요. 밑단이 코트보다 짧게 | OPUMOLAY,IHLAY |
| mlWiKnitOverShirt | winter | oxfordShirt,dressShirt | knitOverShirt | chesterfield,balmacaan,peacoat,duffle | 5 | classic | 겨울 기본 3겹이에요. 니트 기장이 코트 밖으로 나오지 않게 | R2 6-4,KHLAY |
| mlWiKnitOverShirtNoCoat | winter | oxfordShirt,dressShirt | knitOverShirt | none | 4 | classic | 셔츠 위에 니트만 겹친 실내용 2겹이에요 | R2 6-4,KHLAY |
| mlWiKnitVestCoat | winter | oxfordShirt,dressShirt | knitVest | chesterfield,balmacaan,blazer | 4 | classic | 셔츠 위 니트 베스트, 코트 안에 들어가요 | OPUMOIVY,STUIVY |
| mlWiCardiganUnderCoatKnit | winter | tee | cardigan | chesterfield | 4 | classic | 티 위에 가디건, 그 위에 코트예요 | ESQLAY,ALLCARD |
| mlWiCardiganPeacoat | winter | tee,oxfordShirt | cardigan | peacoat,duffle,balmacaan | 5 | classic | 가디건은 코트·패딩 안에 겹치는 기본이에요 | ESQLAY,ALLCARD |
| mlWiCardiganChesterfield | winter | oxfordShirt | cardigan | chesterfield | 4 | classic | 쓰리피스 느낌이에요. 가디건은 코트보다 밝은 톤으로 | OPUMOLAY,PTOMID |
| mlWiQuiltedUnderCoat | winter | knitWool | quiltedVest | chesterfield,balmacaan | 3 | variation | 니트+퀼팅 베스트+코트는 부피가 커요(변주) | PTOMID |
| mlWiHoodiePuffer | winter | hoodie | none | shortPuffer,longPuffer,coachJacket | 5 | classic | 후디 위 패딩은 후드를 밖으로. 스트릿·고프코어 | VKNB,HSSGORP |
| mlWiHoodieCoat | winter | hoodie | none | chesterfield,balmacaan | 3 | variation | 후디+롱코트는 스트릿 변주(격차 경고) | R2 5-5,ALLWORK |
| mlSuNoMid | summer | tee,linenShirt,poloPique,tank | none | none,overshirt | 5 | classic | 여름은 미드 없음. 2겹 초과 금지 | R2 6-2,R2 6-4 |
| mlSuMidBlock | summer | any | cardigan,knitVest,quiltedVest,knitOverShirt | any | 1 | block | 여름 미드 레이어는 차단 | R2 6-4 |

`outer=none` = 아우터 없이 미드가 최외곽. `mid=none` = 미드 없음(해당 행은 base+outer 조합 자체를 평가). `base=any` 와일드카드.

### 6-3. twoOuterRules (6행)

| id | season | inner | outer | score | tag | note | sources |
|---|---|---|---|---|---|---|---|
| toLeatherLongCoat | winter | leatherJacket | chesterfield,balmacaan | 3 | variation | 가죽 재킷 + 롱 코트(R2 s22). 안쪽 short < 바깥 long | R2 7,R2 6-4 |
| toBlousonLongCoat | winter | blouson | balmacaan,chesterfield | 3 | variation | 숏 블루종 + 롱 코트. 롱 코트 안 숏 아우터는 변주 | R2 6-4,VKCOAT |
| toDenimDuffle | winter | denimJacket | duffle,balmacaan | 4 | classic | 데님 재킷 + 더플·발마칸. 아메카지·시티보이 겨울 정석 | YOKO,NTAME,R2 6-3 |
| toFleecePuffer | winter | fleece | shortPuffer,longPuffer | 4 | classic | 플리스 + 패딩. 고프코어 레이어 | HSSGORP,SNKGORP |
| toSfTwoOuter | springFall | any | any | 2 | variation | 봄가을 2겹 아우터는 데님 재킷+트렌치 정도만(변주) | R2 6-4 |
| toSummerTwoOuter | summer | any | any | 1 | block | 여름 2겹 아우터 차단(기존 LAYER_OVER_PENALTY와 동일) | R2 6-2 |

규칙(엔진): 안쪽 아우터 `length < 바깥 length` 아니면 −2(같으면 −1). 안쪽 포멀도가 바깥보다 3 이상 낮으면 warn. 바깥쪽(layer 2)만 outerRules 축 평가(기존 유지), 안쪽은 twoOuterRules 점수를 `outer` 축에 0.5 가중 평균.

**범위(Phase 6-B-3 결정, C6-20)**: 이 표는 **점수 규칙으로만** 쓰인다(outfits.json·사용자 입력의 2겹 아우터 코디 평가). Deep+layering의 2겹 아우터 **후보 생성**(데님 재킷 + 더플 등)은 2차 — `candidates.js` layering 분기는 미드 1겹만 만든다.

---

## 7. 출처 코드표 (CX)

### 7-1. sources (CX 코드 — V-20용)

| code | 출처 | URL |
|---|---|---|
| GQK8 | GQ Korea – 2026 봄 남성복 8대 트렌드(3세대 프레피·레이어링) | https://www.gqkorea.co.kr/?p=341092 |
| VKFW26 | Vogue Korea – 2026 가을/겨울 남성복 트렌드 12 | https://www.vogue.co.kr/2026/09/08/2026-가을-겨울-남성복-트렌드-12/ |
| VKMIN | Vogue Korea – 올가을 진짜 미니멀리스트가 입는 아이템 10 | https://www.vogue.co.kr/?p=704342 |
| VKMIN2 | Vogue Korea – 미니멀 스타일 룩 5(콰이어트 럭셔리) | https://www.vogue.co.kr/?p=438226 |
| WKDENIM | W Korea – 럭셔리 룩 의외의 아이템 데님(무채색 묶기) | https://www.wkorea.com/?p=267386 |
| WKCHECK | W Korea – 클린 룩에 킥을 더해 줄 체크 | https://www.wkorea.com/?p=344035 |
| ESQMIN | Esquire Korea – 2026 FW 슬릭 미니멀리즘 | https://www.esquirekorea.co.kr/article/1896507 |
| VKGORP | Vogue Korea – 고프코어에 대해 알아야 할 모든 것 | https://www.vogue.co.kr/2023/06/23/ |
| KHGORP | 경향 – 알록달록 등산복 시대 끝… 고프코어 룩 | https://lady.khan.co.kr/fashion/article/202304100712011 |
| GQKGORP | GQ Korea – 그래놀라 코어(아웃도어 활동과 함께) | https://www.gqkorea.co.kr/?p=345448 |
| HSSGORP | He Spoke Style – Gorpcore fashion | https://hespokestyle.com/gorpcore-fashion/ |
| SNKGORP | SNKRDUNK – Guide to gorpcore fashion | https://snkrdunk.com/en/magazine/?p=273994 |
| NTAME | 뉴스토마토 – 작업복도 패션이 된다, 아메카지 룩 인기 | https://newstomato.com/ReadNews.aspx?no=898913 |
| KHSTYLE6 | 경향 – 6가지 스타일, 내 남자를 위한 Style Guide | https://lady.khan.co.kr/fashion/article/4370 |
| STRUM | STRUM – Amekaji style coordinate | https://strum.jp/en/blogs/styling/coordinate-2021-8-1 |
| TRADEJP | trade.gov – Japan apparel for men(아메카지 품목) | https://www.trade.gov/market-intelligence/japan-apparel-men |
| YOKO | Yokogao – The Rise of the City Boy | https://www.yokogaomag.com/editorial/the-rise-of-the-city-boy |
| POPWIKI | Wikipedia – Popeye (magazine) | https://en.wikipedia.org/wiki/Popeye_(magazine) |
| SNKCITY | SNKRDUNK – Shoes for Japanese city boy style | https://snkrdunk.com/en/magazine/2024/12/17/capturing-tokyos-cool-shoes-for-japanese-city-boy-style/ |
| ESQCITY | Esquire Korea – 시티보이 룩(오버핏 셔츠·숏 재킷·블랙진) | https://www.esquirekorea.co.kr/article/66395 |
| VKWIDE | Vogue Korea – 와이드 데님 현명하게 입는 법 5 | https://www.vogue.co.kr/?p=345308 |
| WKOVER | W Korea – 오버핏 셔츠로 에포리스 시크 | https://www.wkorea.com/?p=291522 |
| OPUMOIVY | Opumo – Ivy League style, the original smart-casual uniform | https://www.opumo.com/magazine/ivy-league-style/ |
| STUIVY | Stuarts London – Ivy League style guide | https://www.stuartslondon.com/pages/ivy-league-style-guide |
| VOUIVY | The VOU – Ivy League style | https://thevou.com/fashion/ivy-league-style/ |
| STRIDE | Stridewise – How to style a chore coat | https://stridewise.com/how-to-style-a-chore-coat/ |
| MRPWORK | MR PORTER – The stylish gent's guide to workwear(검색 요약; 본문 403) | https://www.mrporter.com/en-gb/journal/fashion/the-men-who-wear-workwear-well-914020 |
| MOMCHORE | Man of Many – Best chore coats and how to wear them | https://manofmany.com/style/best-mens-chore-coats-tips-on-how-to-wear-them |
| DAZEDCW | Dazed – Carhartt WIP FW25(스톤·베이지·브라운 팔레트) | https://www.dazed.me/fashion/carhartt-wip-fw25-collection |
| SUITBC | Suitsupply – Business casual for men | https://suitsupply.com/ko-kr/journal/business-casual-for-men.html |
| ALLWORK | Allure Korea – 슬랙스로 완성하는 출근 룩 | https://www.allurekorea.com/?p=275832 |
| ALLBLZ | Allure Korea – 블랙 블레이저+와이드 데님, 그레이 셋업 | https://www.allurekorea.com/?p=309571 |
| GQKSUM | GQ Korea – 여름 출근, 덜 입되 더 있어 보이게 | https://www.gqkorea.co.kr/?p=328293 |
| GQKWED | GQ Korea – 센스 있는 남자 가을 하객룩 아이디어 4 | https://www.gqkorea.co.kr/?p=340960 |
| GQKSUIT | GQ Korea – 기본템 수트 센스 있게 입는 방법 | https://www.gqkorea.co.kr/?p=404194 |
| BOSSWED | Hugo Boss – 웨딩 룩(겨울 네이비·그레이·차콜) | https://www.hugoboss.com/kr/boss-wedding-outfit-style/ |
| CMTINT | 코멘토 – 면접 정장은 어떤 색(네이비·차콜, 올블랙 주의) | https://comento.kr/job-questions/ |
| HKINT | 한국경제 – 대기업 사무직 감색 수트 | https://www.hankyung.com/amp/2010090369191 |
| GQKDATE | GQ Korea – 데이트 룩(셔츠 단추·치노·로퍼) | https://www.gqkorea.co.kr/?p=359588 |
| ESQDATE | Esquire Korea – 소개팅·데이트 룩(여유 핏, 각 잡힌 블레이저 주의) | https://www.esquirekorea.co.kr/article/1895640 |
| ALLDATE | Allure Korea – 데이트룩 니트 vs 후디 | https://www.allurekorea.com/?p=202670 |
| VKCARGO | Vogue Korea – 청바지만큼 실용적인 카고 팬츠 | https://www.vogue.co.kr/2025/08/28/ |
| VKNB | Vogue Korea – 뉴발란스는 어떻게 가장 멋진 운동화 브랜드가 되었나 | https://www.vogue.co.kr/?p=414049 |
| MYRQ | Myrqvist – Matching your belt and shoes | https://myrqvist.com/blogs/journal/matching-belt-and-shoes |
| TMMBELT | The Modest Man – Match belt and shoes | https://www.themodestman.com/match-belt-and-shoes/ |
| EGSOCK | Effortless Gent – How to match socks | https://effortlessgent.com/how-to-match-socks/ |
| EGNOSHOW | Effortless Gent – Best no-show socks | https://effortlessgent.com/no-show-socks/ |
| WHSOCK | Westwood Hart – Matching socks and ties | https://westwoodhart.com/blogs/westwood-hart/matching-socks-ties-guide-coordination |
| MOMBAG | Man of Many – Guide to men's bags(5 styles) | https://manofmany.com/culture/best-mens-bags |
| FASHBAG | The Fashionisto – Essential bags for men | https://thefashionisto.com/essential-bags-men |
| MRPBAG | MR PORTER – The new rules of bags(검색 요약; 본문 403) | https://www.mrporter.com/en-gb/journal/fashion/the-new-rules-of-bags-789114 |
| LAIRD1 | Laird London – Match cap material and colour to coat | https://lairdlondon.co.uk/blogs/journal/3-ways-to-match-cap-material-and-colour-to-coat-suit-and-shoes |
| ANSIN | Ansin – How to match a scarf to a coat | https://ansin.pl/en/blogs/journal/jak-dobrac-szalik-do-plaszcza |
| ASOSSCARF | ASOS – How to style a scarf(2026) | https://www.asos.com/men/fashion-feed/2026_01_12-mon/how-to-style-a-scarf |
| FBPAT | FashionBeans – Pattern mixing guide | https://www.fashionbeans.com/article/pattern-mixing-guide/ |
| BLPAT | Black Lapel – Mixing patterns with confidence(rule of scale) | https://blacklapel.com/thecompass/mixing-patterns-with-confidence |
| MRPPAT | MR PORTER – How to mix stripes with checks(검색 요약) | https://www.mrporter.com/en-gb/journal/fashion/how-to-mix-stripes-with-checks-686194 |
| AOSPAT | Articles of Style – A simple guide to pattern mixing | https://articlesofstyle.com/blogs/news/a-simple-guide-to-patternmixing |
| WHPAT | Westwood Hart – Mixing patterns and textures | https://westwoodhart.com/blogs/westwood-hart/mixing-patterns-textures-mens-fashion-style-guide |
| PRIMER | Primer – Nine patterns every man should know | https://www.primermagazine.com/2010/learn/nine-patterns-every-man-should-know |
| SSHOUND | StudioSuits – Houndstooth buying guide | https://studiosuits.com/blogs/articles/the-complete-buying-guide-for-houndstooth-dress-shirts |
| PTOMID | Put This On – Throwing in a light mid-layer | https://putthison.com/?p=1949 |
| OPUMOLAY | Opumo – 10 essential layering pieces | https://www.opumo.com/magazine/10-essential-layering-pieces-every-man-needs-for-autumn-and-winter/ |
| IHLAY | InsideHook – 8 underrated fall layering pieces | https://www.insidehook.com/style/8-underrated-fall-layering-pieces-for-men/amp |
| ESQLAY | Esquire Korea – 가디건·베스트 레이어드 | https://www.esquirekorea.co.kr/article/1908249 |
| ALLCARD | Allure Korea – 가디건 입기 좋은 날씨 | https://www.allurekorea.com/?p=265490 |
| KHLAY | 경향 – 남자들을 위한 아우터 코디법(터틀넥 이너) | https://lady.khan.co.kr/fashion/article/201301091500361 |
| CX | CX 내부 판단(출처 없음, 통념) | - |

R1 코드(`Vou1`, `WH1`, `WH2`, `MM`, `Dalm`, `R1 5-8`)와 R2 코드(`R2 4-1`, `R2 5-5`, `R2 6-2`, `R2 6-3`, `R2 6-4`, `R2 7`, `VKCOAT`, `T8`, `T9`)는 기존 코드표 그대로.
