# P3 콘텐츠 정확성 검토 — 엔진 추천 결과 전수 확인

검토일: 2026-10-19 · 검토자: P3 · 대상: `src/data/*.json` + `src/engine/*`(검토만, 수정 없음)
방법: `docs/review/scratch-p3/dump.mjs`(실제 엔진·실데이터 import)로 quick 270장 + deep 6건을 덤프해 눈으로 전수 검토. 덤프 원본은 `scratch-p3/dump-output.txt`, 보조 확인은 `extra.mjs` → `extra-output.txt`, `extra2-output.txt`. 수정 후 같은 스크립트를 다시 돌려 diff 하면 된다.
근거 문서: `docs/research/color-rules.md`(이하 R1) 2-2·3·4·5·6·8장, `docs/research/style-rules.md`(이하 R2) 3·5·6·8장, `docs/architecture/data-conversion-log.md`(이하 로그) 3·4·6·7절.

---

## 1. 검토 범위

| 모드 | 베이스 | 계절 | 카드 수 |
|---|---|---|---|
| quick | 하의 13(indigo, lightDenim, blackDenim, beige, khaki, navy, midGrey, charcoal, olive, brown, black, white, cream) | 봄가을·여름·겨울 | 117 |
| quick | 상의 9(white, black, greyMelange, navy, oatmeal, cream, lightBlue, olive, burgundy) | 3계절 | 81 |
| quick | 신발 4(white, black, brown, tan) 역참조 | 3계절 | 36 |
| quick | 아우터 4(navy, camel, black, olive) 역참조 | 3계절 | 36 |
| quick 보조 | S2 칩 그리드에 실제로 뜨는데 R1 베이스가 아닌 색: 상의 beige·brown·lightGrey·midGrey·charcoal·tan, 하의 lightGrey, 신발 navy·burgundy·midGrey, 아우터 brown·midGrey·indigo·lightGrey·cream·tan·chocolate, 고아 색 teal·taupe·midDenim | 3계절(일부 봄가을) | 84 |
| deep | indigo, beige, charcoal, blackDenim 하의 / white, navy 상의 | 봄가을 | 톤별·색상별·변주·피할 것 전부 |

**quick 270장 중 스타일 상식으로 '틀렸다'고 본 카드: 27장(10%)**. 유형: 계절 밖 아이템을 엔진이 골라 넣음 17, 여름 울 슬랙스+컬러 스니커즈 8, 품목명 말이 안 됨 1, 리서치 '피하기'를 어김 1. 그 외 보조 84장에서는 **상의 6색·하의 1색이 규칙 없이 폴백 1장만** 나오는 문제(P3-01)를 발견했다.
`npm run validate` 0 error / 45 warning, `npm test` 통과 상태에서 검토(코드·데이터 변경 없음).

---

## 2. 발견 사항

심각도: **높음** = 스타일을 아는 사람이 보면 명백히 틀리거나 계절이 어긋난 추천 / **중간** = 어색하거나 리서치와 어긋나지만 변명 가능 / **낮음** = 문구·중복·문서.

### 높음 (6건)

| ID | 내용 | 근거 | 수정 |
|---|---|---|---|
| **P3-01** | **S2 칩에 뜨는 색 중 상의 beige·brown·lightGrey·midGrey·charcoal·tan(봄가을 상의 12칩 중 6칩), 하의 lightGrey(여름)는 colorRules 베이스가 없어 `pickClassic` 폴백 템플릿 1장만 나온다.** 예: 상의 베이지 → "베이지 코튼 니트 · 인디고 데님 · 흰 스니커즈 => 5"(3계절 동일, 규칙 없이 5점 표기). 상의 탄·브라운·차콜 등 전부 동일. 하의 라이트그레이 여름 → "화이트 티셔츠 · 라이트 그레이 치노 · 흰 스니커즈" 1장 | 게이트 기준 "클래식 3조합" 미달. `catalog.colorsFor`는 역참조 색(점수 합)을 칩으로 올리지만 `generateCandidates`는 top 베이스에서 `index.reverse`를 쓰지 않음(shoes·outer만 씀) | ① `src/engine/candidates.js generateCandidates`: `base.category === 'top'`이고 `colorRules`에 `${color}|top`이 없으면 shoes·outer와 같이 `index.reverse.get('top|'+color)`에서 bottom 베이스를 모아 하의 후보 생성(beige·tan 상의는 olive·brown·blackDenim·indigo 하의 규칙에 이미 있음). ② 하의 lightGrey는 규칙이 없으므로 `catalog.colorsFor`에서 bottom은 `baseCategory === 'bottom'` 규칙이 있는 색만 노출. ③ 폴백 카드에는 `explain.ruleMissing`을 앞에 붙이고 점수를 `DEFAULT_SCORE`로 고정(지금은 흰 티+인디고 쌍 점수가 그대로 5로 보임) |
| **P3-02** | **여름 + 울 슬랙스 + "블랙 컬러 스니커즈"(격식 2)가 클래식 1·2위.** `DEFAULTS.shoesByColor.black.summer = 'sneakerColor'`라서 차콜·미드그레이·블랙 슬랙스 여름 카드와 신발 블랙 여름 3장 전부 "화이트 린넨 셔츠 · 차콜 울 슬랙스 · 블랙 컬러 스니커즈(격차 5)". 9장. 포멀도 완화(D1) 전에는 격차 5가 차단이라 안 나오던 조합 → **완화가 새로 들여온 유일한 '이상한 조합'** | R2 5-5 "sneaker_white(3)+wool(7)=4 경고, 가죽 미니멀형 권장"; 레트로/컬러 스니커즈(2)는 그보다 아래. R1 4-7·4-8 신발 black 5 classic은 "더비·로퍼" 전제 | `constants.js DEFAULTS.shoesByColor.black`: `summer: 'loaferPenny'`(블랙 페니 로퍼, 여름 연중 신발). 추가로 `pickClassic` 풀에서 `formality.gap ≥ 5`이면서 `lo`가 sneakerColor·running·sandal인 카드는 제외(deep에는 남김) |
| **P3-03** | **톤 다양성 규칙이 계절 밖 색을 클래식 3장에 밀어 넣음.** `pickClassic` pass 0은 "톤 그룹이 다른 카드"를 우선하는데, 인디고·네이비·카키 하의처럼 뉴트럴 상의가 전부 같은 톤키가 되면 3번째 카드는 **accent(버건디·러스트)나 파스텔**밖에 남지 않아 계절 패널티(−1/−2)를 받은 카드가 올라온다. 여름: 인디고 #3 "버건디 티셔츠 · 인디고 · 초콜릿 페니 로퍼"(3.91), 네이비 #3·카키 #2·미드그레이 #3 버건디, 베이지 #3·올리브 #3 "초콜릿 티셔츠", 차콜 #3 초콜릿 로퍼, 상의 네이비 #3 버건디 로퍼, 상의 버건디 #1 초콜릿 로퍼. 겨울: 연청 #2 "스카이 블루 울 니트", #3 "세이지 울 니트", 크림 #3 세이지. **총 14장**. 대안(네이비·라이트블루·올리브·베이지 상의 4 classic, 연중색)이 풀에 있는데도 밀림 | R1 6장 "겨울 파스텔·연청, 여름 초콜릿·헤비 브라운 = 계절감 어긋남"(A14), 버건디는 봄가을·겨울 | `src/engine/candidates.js pickClassic`: pass 0·1에서는 `score.color.detail.seasonMod < 0` 또는 `explain.seasonItem` 경고가 있는 카드를 건너뛰고, pass 2에서만 허용. 같은 자리에서 tier 3(allClassic 아님) 카드도 pass 0에서는 제외(P3-06 해결) |
| **P3-04** | **하의 브라운은 계절과 무관하게 코듀로이로 구체화** → 여름 브라운 하의 3장 전부 "브라운 코듀로이는 여름용이 아니에요" + 저지·코듀로이 무게 충돌 −1 + 로퍼 격차 4. 상의 오트밀·네이비 여름에도 "오트밀 티셔츠 · 브라운 코듀로이 · 브라운 페니 로퍼" 등장. 4장 | R2 3-1 corduroy = spring_fall(늦가을)·winter. R1 4-10은 "브라운 코듀로이"지만 여름 브라운 하의는 치노·린넨이 상식 | `constants.js DEFAULTS.bottomMaterialByColor`를 계절별 객체 허용(`shoesByColor`와 같은 `bySeason` 방식): `brown: { springFall: 'corduroy', winter: 'corduroy', summer: 'chino' }`. `materialize` bottom 분기에서 `bySeason()` 적용 |
| **P3-05** | **`color.indigo` 라벨이 "인디고 데님"이라 색+품목 합성명이 깨짐.** 신발 탄 겨울 #2 "**인디고 데님 울 니트** · 브라운 코듀로이 · 탄 워크 부츠"(brown|bottom→top:indigo 4 classic, 원문은 '데님 셔츠'), 아우터 인디고 "**인디고 데님 데님 재킷**", 여름 "인디고 데님 오버셔츠(린넨)", 겨울 "인디고 데님 체스터필드·싱글 코트" | R1 1장 id indigo = 진청 **색**; 4-10 indigo 행 비고 "데님 셔츠" | ① `labels.ko.json color.indigo` label → "인디고"(shortLabel은 이미 "인디고"). bottom itemName은 `materialize`가 '데님' 중복을 걸러 "인디고 데님"이 유지되는지 확인(`cl.includes('데님')` 조건이 깨지므로 `material.denimIndigo` 라벨 "인디고 데님"을 그대로 쓰게 분기 수정). ② 상의 색 indigo·lightDenim은 `DEFAULTS.topTypeByColor = { indigo: 'denimShirt', lightDenim: 'denimShirt' }`로 데님 셔츠 구체화(R1 4-10·4-12 '샴브레이' 의도). ③ 아우터 indigo는 계절과 무관하게 `denimJacket`(겨울 outerBySeason에 체스터필드가 인디고로 칠해지는 것 방지) |
| **P3-06** | **카키 하의 봄가을 #3 "올리브 코튼 니트 · 카키 치노 · 브라운 척카 부츠 · 네이비 블레이저"** — R1 4-5 피하기 "카키+올리브+브라운 셋 다 비슷한 명도(흙탕)" 그대로. avoid가 `category:null`이라 엔진이 못 막고, 톤 다양성(earth)으로 3-variation 카드가 2-classic 카드들을 제침 | R1 4-5 olive 3 variation "근접색, 명도 차 필요", 피하기 행 | ① `scripts/build/r1.mjs` avoid 수기 표에 `khaki|bottom → top:olive`(구조화, reason 동일) 추가 → 엔진 `explain.avoid`는 score 1만 차단하므로 ② `khaki→top:olive` score 3→**2**(variation, 경고)로 내리거나, P3-03의 "pass 0은 tier ≤2만" 규칙으로 해결 |

### 중간 (13건)

| ID | 내용 | 근거 | 수정 |
|---|---|---|---|
| **P3-07** | 신발 색 다양성 규칙(3장째 신발 색 2종 이상)이 **variation 신발을 강제**. 블랙 슬랙스 봄가을 #3 "버건디 코튼 니트 · 블랙 울 슬랙스 · 흰 스니커즈(3 variation) · 미드 그레이 블레이저"(3.95, 격차 4), 겨울 #3 같은 구조에 체스터필드(격차 5, 4.01). 블랙 슬랙스는 신발 classic이 블랙뿐이라 규칙이 성립할 수 없음 | R1 4-11 신발 white 3 variation "캐주얼"; 로그 3-2(V-08 임계 완화 이유와 동일) | `pickClassic ok()`: `needShoe` 조건을 "신발 쌍이 classic인 후보가 풀에 있을 때만" 적용. 없으면 신발 색 조건을 건너뛰고 상의·아우터 다양성으로 대체 |
| **P3-08** | 겨울 브라운·초콜릿·탄 신발 기본 = **워크 부츠**가 울·플란넬 슬랙스에도 붙음. 미드그레이 겨울 #3 "버건디 울 니트 · 미드 그레이 울 슬랙스 · 브라운 워크 부츠"(4.51), 차콜 겨울 #3 "초콜릿 워크 부츠"(3.61). 치노·데님엔 맞음 | R2 5-5 "workboot(4)+wool(7)=3 통과하되 −1", R2 3-3 flannel "무거운 신발(더비·첼시·태슬로퍼)" | `materialize` shoes에 `forBottom`(top과 동일 방식) 전달: 하의 소재 포멀도 ≥6이면 brown 계열 겨울 → `chelsea`(봄가을 chukka는 유지, R1 o17 근거), 여름은 loaferPenny 유지. `generateCandidates`에서 `materialize(index,'shoes',m.color,season,{forBottom: bottom.material})` |
| **P3-09** | **T5 `limitColors`에 charcoal 포함** → 차콜+초콜릿 더비(R1 4 classic) −1, 차콜+카멜 코트(R1 5 classic) −1, 둘 다면 −2. 실측: "화이트 울 니트 · 차콜 · 초콜릿 더비 · 카멜 체스터필드" color 2.43, final 3.18. 차콜 겨울 #3이 3.61로 떨어진 원인. 체크리스트 3항 답: **charcoal 제외** | R1 T5 원문 "모노(**블랙**)+어스", 4-8 charcoal→chocolate 4·camel 5 classic | `scripts/build/r1.mjs` T5 `limitColors: ["black","blackDenim"]` → `toneRules.json` 재생성 |
| **P3-10** | `material.wool` 라벨 "울 슬랙스"가 **블레이저 소재**에도 쓰여 universal 카드(o12, 연청 봄가을 #1)에 "워시드 데님+**울 슬랙스**는 소재가 안 맞아요" 경고가 찍힘. 브라운 봄가을 #3도 "코듀로이+울 슬랙스는 소재가 안 맞아요"(네이비 블레이저). 또 `matRules corduroy↔wool = 2`가 R1 o20/c20(라이트블루 셔츠+브라운 코듀로이+네이비 블레이저, GG·HB classic)과 충돌 — 체크리스트 9항 | R2 3-3 "매끈 워스티드 **재킷**+골덴 바지 2, 반대는 4"(방향성), R1 7장 c20 | ① `labels.ko.json material.wool` label "울", shortLabel "울"; `materialize` bottom은 wool일 때 itemName "울 슬랙스"로 합성(`DEFAULTS.bottomNameByMaterial = { wool: '울 슬랙스' }`). ② `scripts/build/r2.mjs` corduroy↔wool **3**(note에 "재킷이 워스티드면 2") |
| **P3-11** | **포인트 컬러 2개 미감점.** 톤 규칙은 bottom-top·bottom-shoes·bottom-outer·top-outer 쌍만 보므로 "버건디 코튼 니트 · 인디고 · **버건디 페니 로퍼** · 베이지 트렌치"(상의 버건디 봄가을 #3, 4.9), "버건디 피케 폴로 · 미드 그레이 · 버건디 페니 로퍼"(여름 #3)가 T6 위반인데 경고 없음. 실측 "버건디 니트+인디고+버건디 로퍼" 4.1, accent reason 0 | R1 T6 "포인트 컬러는 1개만", A11 | `score.js scoreColorAxis`: `outfit.items`에서 accent 톤 아이템 수 ≥2이면(색 id가 같아도) `toneRaw.accentAccent` 한 번 적용 + `explain.accentAccent`. 현 pairwise 체크는 유지 |
| **P3-12** | **변주가 색만 바꾸고 품목을 유지** → "그레이 멜란지 옥스포드 셔츠", "라이트 그레이 옥스포드 셔츠"(차콜·블랙데님 deep 변주 1~4위), "미드 그레이 가죽 재킷"(블랙데님 o08 변주). 멜란지는 저지/니트 전용, 그레이 가죽 재킷은 실존하지 않다시피 함. G2 수정(신발)과 같은 문제가 상의·아우터에 남음 | R1 5-3 greyMelange = "티/맨투맨", 4-3 midGrey 아우터 비고 "블레이저·코트" | `groups.js makeVariations`: top 슬롯은 `itemType`을 유지하되 **셔츠류(oxfordShirt·linenShirt·dressShirt·denimShirt)는 색 허용 목록**(white, lightBlue, skyBlue, navy, olive, black, cream, lightGrey, dustyPink)을 벗어나면 `DEFAULTS.topBySeason`으로 재구체화; outer 슬롯은 `itemType`을 버리고 `materialize(index,'outer',color,season,{rank})`로 다시 정함(가죽 재킷은 black·brown·chocolate·tan만 유지) |
| **P3-13** | **겨울 quick에 티셔츠 단품(아우터 없음) 카드.** 인디고 겨울 #1·상의 화이트 겨울 #1·신발 화이트 겨울 #1이 o01(흰 티+인디고+흰 스니커즈, 연중). 신발 화이트 겨울은 3장 모두 "인디고 데님 + 흰 스니커즈"에 상의만 다름 | R2 6-4 겨울 레이어 "티셔츠 → 니트 → 코트"; R1 o01은 '연중'이지만 겨울엔 베이스 레이어 | `pickClassic`: `season === 'winter'`이고 히트 코디에 outer가 없으면 bottom 규칙의 아우터 classic 5 첫 색으로 `materialize` 아우터를 덧붙인 사본을 풀에 넣고(id 유지, `generated`), 원본은 pass 2로 내림. 신발 베이스는 `ok()`에 **하의 색 2종 이상** 조건 추가 |
| **P3-14** | **색 계절 데이터가 리서치 자체 모순을 그대로 옮김.** `lightBlue` 겨울 제외 → R1 universal c16/o10(라이트블루 셔츠+차콜+네이비 코트, **겨울**)이 −1 받아 4.17, 상의 라이트블루 겨울 3장·네이비 하의 겨울 #2·크림 겨울 #2 전부 "라이트 블루는 겨울에 어색해요". `cream` 여름 제외 → 크림 하의·상의 여름 6장 경고, 그런데 R1 6장 첫 표는 여름 기본 뉴트럴에 **cream 포함** | R1 6장 첫 표 vs 둘째 표, R1 3장 "라이트블루 셔츠는 거의 모두에게 무난", 7장 o16 | `scripts/build/r1.mjs` seasons 표 덮어쓰기: `lightBlue` + winter, `cream` + summer(오트밀은 니트 색이므로 유지). `colors.json` 재생성. (근본적으로는 R1 6장 둘째 표 정정 요청) |
| **P3-15** | **유사색 그룹: khaki가 green 그룹**(R1 9-3 원문도 그렇지만 A15·4-5 정의 "황갈색"과 모순), beige·oatmeal은 어느 그룹에도 없어 **베이지 하의 '색상별' 탭에 무채색만** 뜨고 네이비+베이지 보색 관계가 안 보임. 체크리스트 4항 답 | R1 A15, 4-5 제목, 3장 보색 "네이비+카멜/브라운" | `scripts/build/r1.mjs` hue.analogous: green에서 khaki 제거, brown 그룹에 beige·khaki·oatmeal 추가 → 베이지·카키 하의에 유사색(브라운 상의)·보색(네이비 상의) 그룹이 생김 |
| **P3-16** | 사용자 노출 문구 오류 모음: ① `explain.seasonOut/seasonItem` "{color}는" → "초콜릿**는**", "라이트워시 데님**는**", "오트밀**는**" 조사 오류 ② seasonOut 문구에 "(−1)" 하드코딩인데 accent는 −2 ③ "규칙 없음(기본 3)"이 카드 '이유' 2~3번째로 노출(블랙데님 겨울 #2, 상의 버건디 #3) ④ 코디 품목명 "차콜 울 트라우저(울슬랙스)", "미드 그레이 트라우저(울슬랙스)"(o10·o19·o26 itemName에 '슬랙스'가 없어 괄호 중복) ⑤ 캡션 "카키(베이지 계열) 치노", "카키(베이지 계열) 치노 · 네이비 컬러 스니커즈" — 라벨 괄호가 캡션에 섞임 ⑥ "흰 티셔츠"(R1 코디)와 "화이트 티셔츠"(생성)가 같은 화면에 공존(연청 봄가을 #1·#2, 신발 화이트 겨울) | R2 8장 표기 표준, D3 캡션 | ① `labels.ko.json` 문구를 조사 없는 형태로: "{color}: {season}엔 어색해요", "{item}: {season}용 아님" (또는 `explain.js formatReason`에 받침 판별 함수) ② `{delta}` 파라미터 사용: "({delta})" ③ `explain.js PRIORITY`에서 `ruleMissing`을 severity info 최하위로, `explainShort`/G6 `cardReason`에서 제외 ④ `scripts/build/outfits.mjs` R1 품목명 "트라우저" → "울 슬랙스" ⑤ `color.khaki` label "카키" + help 유지(이미 있음), 괄호 설명은 S2 aria/help로만 ⑥ `outfits.mjs` R1 "흰 티셔츠" → "화이트 티셔츠"(신발 "흰 스니커즈"는 관용 표기로 유지) |
| **P3-17** | **상의 베이스 '피할 것'이 비어 있음**(네이비 상의 deep avoid 0건, 화이트 상의 1건). 5장엔 '피하기' 행이 없고 역방향도 하의 규칙 avoid에 상의 색이 거의 없어서. 반면 R1 5-4 navy→navy 2, navy→black 3⚠ 등 피할 정보는 있음 | R1 5장 score ≤2 행, 8장 A8 | `recommend.js avoidList`: 베이스 규칙 matches 중 `score ≤ 2`를 `"{category} {color} — {note 또는 '비추천(점수 n)'}"`로 추가(정방향·역방향 모두). 네이비 상의면 "하의 네이비 — 같은 톤", "하의 라이트워시 데님"은 4라 제외 |
| **P3-18** | V-18 규칙 누락 3쌍이 기본 3으로 계산됨: o14 blackDenim↔midGrey 상의(겨울 R1 코디), o32 beige↔indigo 데님 재킷(R2 봄가을 기본), o30 indigo↔forestGreen 후디. 체크리스트 7항 답: **추가** | R1 4-3 greyMelange/lightGrey 5(미드그레이는 같은 모노 계열), R2 6-1 데님 재킷+치노 5, R1 7장 c29 변주 | `scripts/build/r1.mjs` 추가 행: `blackDenim→top:midGrey 4 classic (FB1 모노 톤온톤)`, `beige→outer:indigo 4 classic (R2 6-1)`, `indigo→top:forestGreen 3 variation (AtG1 브라운 코트 변주)`, 소스 `C2`. o52 greyMelange 하의 3쌍은 스웻팬츠 전용이라 기본 3 유지 |
| **P3-19** | **격식 차이 4단계 경고가 여름 클래식에 붙음**: 티셔츠(2)+페니 로퍼(6). 화이트 하의 여름 #1 "네이비 티셔츠 · 화이트 치노 · 브라운 페니 로퍼"(R1 o12·o30 그대로)에 "격식 차이 4단계" 문구. 체스터필드(8)+인디고(4)도 R2 6-3이 5점인데 경고. 전수 목록은 3절 | R1 7장 o12·o30, R2 6-3 체스터필드+denim_indigo 5 | 격차 4는 패널티 1은 유지하되 **문구는 allClassic 카드에서 숨김**(`explain.js`에서 `gap < 5 && allClassic`이면 reason을 info로 강등). 또는 `formality.json` 쌍 예외표 `{ lo: 'tee', hi: 'loaferPenny', season: 'summer' }`, `{ lo: 'denimIndigo', hi: 'chesterfield' }` — 상수 하나로 끝나는 전자 권장 |

### 낮음 (7건)

| ID | 내용 | 수정 |
|---|---|---|
| **P3-20** | 근사 중복 카드(상의 색만 다름): 차콜 여름 #1/#2, 블랙 여름 #1/#2, 미드그레이 겨울 #1/#2, 상의 블랙 봄가을 #2/#3(크림 치노 vs 화이트 치노), 신발 화이트 겨울 3장. deep 톤별 인디고는 5장 중 4장이 트렌치+척카. gate-3 1항(P1+C2)과 같은 뿌리 | `pickClassic`·`groupByTone`에 (아우터 종류, 신발 종류, 하의 색) 중복 상한 1 |
| **P3-21** | 잘린 note 6건 — 4절 표 | `scripts/build/r1.mjs` 출처 괄호 제거 후 `trim` + 끝 조사 보정 표(4절) |
| **P3-22** | 올블랙 우회: `adjSameColorTopBottom`은 id 동일만 보므로 상의 black + 하의 blackDenim(상의 블랙 겨울 #2 "블랙 울 니트 · 블랙 데님 · 블랙 더비" 4.62 classic)은 −2 없이 통과. A12 취지상 같은 올블랙 | `adjust.json adjSameColorTopBottom.when`에 `colorFamilySame`(black≡blackDenim, white≡offWhite) 또는 `score.js deriveProps`에서 family 비교. 겨울 올블랙은 상식적으로 허용되니 −1 정도 |
| **P3-23** | 아우터 indigo 칩이 겨울 그리드에 있고 겨울 기본 아우터가 체스터필드라 "인디고 (데님) 체스터필드"가 나옴(P3-05 ③와 동일 수정). 여름엔 "인디고 오버셔츠(린넨)" — 샴브레이 오버셔츠로 볼 수 있어 허용 | P3-05 ③ |
| **P3-24** | `disputed` 건수: 로그·gate-3는 21건이라 하지만 실제 `colorRules.json` **25**건 + shoeRules 1 + materials 1 + fitRules 1 + lengthRules 1 + shoes 1 + adjust 1 = **31**건(toneRules의 2건은 note 텍스트). 5절 표는 31건 전부 | `data-conversion-log.md` 6절·gate-3 3절 8항 숫자 수정 |
| **P3-25** | V-21 고아 색 teal·taupe·midDenim: `catalog.colorsFor`가 규칙에 등장한 색만 칩으로 올리므로 **UI에 안 뜸, 실해 없음**. 다만 midDenim(중청)은 한국에서 가장 흔한 청바지 색인데 베이스가 없음 | 2차 범위로 두되, 권장: `scripts/build/r1.mjs`에서 `midDenim|bottom` 규칙을 indigo 행 복제(신발 black은 lightDenim 값 2로, 출처 `C2`)로 생성해 칩에 올림. teal·taupe는 colors.json에 두고 V-21을 info로 강등 |
| **P3-26** | `tone.navyBase` shortLabel "네이비"가 색 shortLabel "네이비"와 같아 칩·태그가 섞이면 모호 | shortLabel "네이비계" 또는 "블루계" |

---

## 3. 포멀도 완화(D1) 감사 — 격차 4·5 전수 (gate-3 7항)

덤프 3절에 quick 44건 + deep 10건(중복 제거). 쌍 유형별 판정:

| 격차 | 쌍 (hi ↔ lo) | 출현 | 판정 | 권고 |
|---|---|---|---|---|
| 5 | 블레이저·트렌치(7) ↔ 티셔츠(2) | o02·o12 universal, deep 변주 5건 | **허용 클래식** (R1 c02·c22) | 유지. 경고 문구도 유지(가죽 미니멀 스니커즈·깔끔한 티 전제) |
| 5 | 체스터필드(8) ↔ 흰 스니커즈(3) | 카키 겨울 #3, 블랙 겨울 #3 | 허용(코트+흰 스니커즈 일상) | 유지 |
| 5 | **울 슬랙스(7) ↔ 컬러 스니커즈(2)** | 차콜·블랙·미드그레이 여름, 신발 블랙 여름 = 9장 | **클래식에선 틀림** — 완화 전엔 차단됐던 조합 | P3-02: 기본 신발 교체 + quick 풀에서 제외. deep 변주엔 남겨도 됨 |
| 5 | 블레이저(7) ↔ 컬러 스니커즈(2) | deep 변주(베이지) 1건 | 변주로만 허용 | 유지 |
| 4 | 페니 로퍼(6) ↔ 티셔츠(2) | 여름 17장 | **허용 클래식** (R1 o12·o30, 노삭스 로퍼) | P3-19: allClassic이면 문구 숨김 |
| 4 | 체스터필드(8) ↔ 인디고 데님(4) | 아우터 카멜·블랙·올리브 겨울 6장 | 허용 클래식 (R2 6-3 5점) | P3-19와 동일 |
| 4 | 울 슬랙스(7) ↔ 흰 스니커즈(3) | 블랙 봄가을 #3, 여름 #3, deep 변주 4건 | 허용(R2 "가죽 미니멀형 권장") | 유지. 단 P3-07로 variation 신발 강제는 막기 |
| 4 | 미드그레이 블레이저(7)·체스터필드(8) ↔ 흰 스니커즈(3) | 블랙 #3 | 허용 | 유지 |
| 6+ | 러닝화·샌들(1) ↔ 울(7), 후디(1) ↔ 체스터필드(8), 탱크톱 | quick·deep 결과에 **0건**(차단 정상 작동, 피할 것 목록에 노출) | 정상 | — |
| 6 | 티셔츠(2) ↔ 체스터필드(8), 출처 ≥2 면제 | 해당 코디 데이터에 없음(o29·o30은 variation 태그로 통과) | 정상 | 면제 규칙은 그대로 |

결론: 완화로 새로 올라온 '이상한 조합'은 **울 슬랙스+컬러 스니커즈 하나**(원인은 완화가 아니라 블랙 신발 여름 기본값). 사다리는 7/7/8 유지, 추가 하향 불필요. 격차 4 경고는 문구만 숨기면 됨.

**gate-3 4항 (`DEFAULTS.topFormalSummer`, 여름 울 슬랙스 기본 상의 = 피케 폴로 → 티셔츠 허용?)**
실측(extra-output): 화이트 티 + 차콜 울 + 블랙 페니 로퍼 = 4.69(격차 5 경고), 같은 조합 폴로 = 4.88(격차 3); 티 + 흰 스니커즈 4.02 vs 폴로 4.02. R1 c28/o28(라이트그레이 티+차콜 슬랙스+흰 스니커즈, 여름, AtG1·MF)이 클래식으로 복원돼 있는데 지금은 **차콜 베이스 여름에서 티셔츠가 절대 안 나옴**(deep에서도 폴로만). 권고: **기본값은 폴로 유지(한국 여름 출근 기준으로 더 안전)**, 대신 `generateCandidates`에서 여름+포멀 하의일 때 상의를 `[poloPique, tee]` 두 벌로 생성(셔츠색은 `[linenShirt, tee]`). 점수상 폴로가 먼저 오므로 quick은 거의 그대로이고 deep 톤별·변주에 티셔츠 조합이 보인다. E-03은 영향 없음(폴로 카드가 그대로 있음).

---

## 4. 잘린 note (gate-3 5항)

출처 괄호 `[FB1]`·`⚠`를 지우면서 문장 끝이 잘린 것. R1 원문 자체가 "⚠"로 끝나 불완전한 것은 '원문'에 표시.

| 행 | 현재 note | R1 원문 | 수정 문구 |
|---|---|---|---|
| blackDenim→shoes:brown / chocolate (3 var, A2) | "워크부츠 — FB1 Red Wing 예시. 블랙+브라운 가죽 혼용은" | 4-3 "FB1 Red Wing 예시. 블랙+브라운 가죽 혼용은 ⚠" (원문 불완전) | "…블랙+브라운 가죽 혼용은 의견이 갈림(벨트·신발 가죽 통일 권장)" |
| olive→top:black (4 classic) | "MM은 '블랙+어스톤 덜 어울림' 단서도" | 4-9 "[MM][Celio] ⚠ MM은 '블랙+어스톤 덜 어울림' 단서도" (원문 불완전) | "…단서도 있음" |
| olive→shoes:black (4 classic) | "뉴트럴·쿨톤 상의와" | 4-9 "뉴트럴·쿨톤 상의와 [MM][AtG2]" | "뉴트럴·쿨톤 상의와 함께" |
| white / cream→top:white (2 var) | "올화이트는 씻겨 보임, 오프화이트로" | 4-12 "올화이트는 씻겨 보임, 오프화이트로 [FB2]" | "…오프화이트로 대체" |
| navy/bretonStripe→bottom:olive (3 var) | "밀리터리 니트와" | 5-8 "밀리터리 니트와 [Dalm]" | "밀리터리 니트와 함께" |
| blackDenim→top:black (4 classic) | "올블랙, 질감 차이 필요 **.** 여름 블랙 셔츠는 '웨이터' 주의" | 4-3 "올블랙, 질감 차이 필요 [FB1][AtG2]. 여름…" | 괄호 제거 후 " ." → "." |
| lightDenim→shoes:black (2 var, A3) | "…며 비추 **;** 일부는 블랙 로퍼 OK" | 4-2 "비추 [MSR][GG]; 일부는" | " ;" → ";" |
| charcoal→shoes:tan (1, A7) | "비추 PS도 '차콜엔…'" | 4-8 "비추 [Dapp][Fitville] ⚠ PS도" | "비추. PS도 …" |
| black→top:black (4, A12) | "올블랙, 질감 차 FB3: 올블랙은…" | 4-11 "질감 차 [AtG2][FB3] FB3: …" | "질감 차. FB3: …" |

(정규식이 잡았지만 완전한 문장: "봄·여름 라이트그레이, 가을 다크그레이", "브라운 바지+그린 상의", "…주의".) 파서 수정: `r1.mjs`에서 `\[[^\]]+\]`·`⚠` 제거 후 `replace(/\s+([.;,])/g,'$1').trim()`, 그리고 위 5건은 수기 보정 표.

---

## 5. `disputed` 31건 판정

주류 판정 기준 = R1 8장. "현 처리 OK"는 점수·태그를 그대로 두라는 뜻.

| # | 행 | 현재 | R1 8장 주류 판정 | 판정 |
|---|---|---|---|---|
| 1 | indigo→shoes:black | 3 var (A3) | A3 진청엔 OK, 연청엔 비추 | OK. 아우터 카멜·올리브 겨울 카드에 "변주+의견 갈림"으로 노출되는 것도 적절 |
| 2 | lightDenim→shoes:black | 2 var (A3) + avoid | A3 연청 비추 | OK |
| 3 | blackDenim→top:navy | 3 var (A1, 8장 덮어쓰기 4→3) | A1 "가능, 금기는 낡은 규칙" 단 캐주얼 아이템일 때 | OK. 블랙 데님은 캐주얼이므로 4 classic으로 되돌려도 무방하나 보수적 3 유지 |
| 4·5 | blackDenim→shoes:brown/chocolate | 3 var (A2) | A2 가죽 통일 원칙 → 벨트 없는 캐주얼엔 허용 | OK (deep 변주에서 DISPUTED 표시 확인) |
| 6 | blackDenim→outer:navy | 3 var (A1) | A1 "네이비 봄버+블랙 진 ✔" | **4 classic 권장**(MRP 예시 그대로가 이 행). 보수적으로 두려면 3 유지 |
| 7 | beige→shoes:black | 3 var | A2·4-4 "스마트 셋업에만" | OK |
| 8 | navy→top:black | 3 var (A1) | A1 가능(캐주얼) | OK |
| 9 | navy→outer:black | 3 var (A1) | A1 "네이비 블레이저+블랙 수트바지 ✗", 봄버는 ✔ | OK |
| 10 | charcoal→shoes:tan | **1** var (A7) + avoid | A7 비추(Dapp·Fitville·PS 일치) | OK — 사실상 주류 합의라 disputed 플래그는 빼도 됨 |
| 11 | olive→top:black | 4 classic | A2 "옷 면적 블랙+어스는 OK", MM 단서 | OK (상의 블랙 여름 #3에 classic+의견갈림으로 노출, 적절) |
| 12 | olive→top:rust | 2 var (A9) | A9 이견, 탁한 러스트만 | OK |
| 13 | brown→top:olive | 3 var + avoid | 4-10 피하기 "브라운 바지+그린 상의(HB)" | 모순: avoid(차단급)인데 match는 3. **2로 내리거나 avoid에서 제외**. 권장 2 |
| 14 | brown→top:black | 3 var | A2 옷 면적 OK(VK2 럭셔리) | OK |
| 15 | black|bottom→top:black | 4 classic (A12) | A12 "같은 id 상·하 score 2" | 로그 3-1-3 결정(표 유지 + adjSameColor −2) **타당**. 단 P3-22 블랙데님 우회 보완 |
| 16 | black→top:navy | 3 var (A1) | A1 네이비 블레이저+블랙 수트바지 ✗ | OK |
| 17 | black→shoes:chocolate | 2 var (A2) + avoid | A2 가죽 통일 | OK |
| 18 | black→outer:navy | 3 var (A1) + avoid "네이비 재킷+블랙 수트바지" | A1 봄버 ✔ / 블레이저 ✗ | OK. 아우터 종류별 분기는 2차 |
| 19·20 | white/cream→shoes:black | 2 var (A4) | A4 이견 큼, 한국 보수적 | OK |
| 21 | black|top→bottom:black | 5 classic (A12) | A12 2 | 15와 동일 논리. **5는 과함 → 4**(5-2 표 자체가 5이지만 4-11 표는 4; 대칭 맞추기) |
| 22 | black|top→bottom:navy | 3 var (A1) | A1 | OK |
| 23·24 | navy|top→bottom:blackDenim/black | 3 var (A1) | A1 캐주얼 OK | OK |
| 25 | olive|top→bottom:brown | 3 var | HB 반대 | 13과 대칭. 13을 2로 내리면 같이 2 |
| 26 | shoeRules running×wool | 2 | R2 10장 "러닝화+슬랙스 2점 경고, The Rake는 가능" | OK (포멀도 격차 6으로 어차피 차단) |
| 27 | materials linen seasons | springFall·summer | R2 "레이어링하면 가을도" | OK |
| 28 | fitRules slim×slim | 3 | R2 "2010년대식, 조건부" | OK |
| 29 | lengthRules outer long×wide | 3 | R2 "의도된 볼륨 vs 국내 슬림" | OK |
| 30 | shoes chelsea formality | 6 | R2 "몽크 위/아래 → 6 중간" | OK |
| 31 | adjust adjWideThinShoe | 0 | R2 4-3 둘 다 4점 | OK |

점수 변경 권고: #6(3→4), #13·#25(3→2), #21(5→4). 나머지 27건은 현 처리 유지.

---

## 6. 출처 미기재 46행 중 classic·4점 이상 (체크리스트 5항)

`sources == ["R1"]`이면서 classic ≥4인 행 44개(extra-output 참조). 5장 신발 열 36행은 R1 4장 신발 표와 일치하므로 문제없음(예: navy 상의→brown 5 ↔ 4-6 brown 5). 판단이 필요한 8행:

| 행 | 점수 | 판정 |
|---|---|---|
| charcoal→top:cream / oatmeal | 4 classic "명도 대비 좋음" | 타당(R1 5-5 oatmeal→charcoal 4와 대칭) |
| black→top:charcoal | 4 classic "모노" | 타당하나 올블랙 근접 — 질감 차 note 권장 |
| black→top:burgundy | 4 classic | 타당(R1 5-10 burgundy→black 3 var와 **비대칭** → 둘 다 4로 맞추거나 둘 다 3). 권장 3·variation(블랙 슬랙스+버건디는 저녁용) |
| black→outer:camel | 4 classic | 타당(A2·VK2 럭셔리) |
| navy|top→bottom:lightDenim | 4 classic "명도 대비" | 타당(4-2 navy 4 classic과 대칭) |
| oatmeal/cream→bottom:charcoal / midGrey | 4 classic | 타당 |
| navy/bretonStripe→bottom:navy | 4 classic "톤온톤" | 엔진이 variant를 무시하므로 무영향. 5-8 원문 그대로 |

---

## 7. P3 확인 10항목 답 (로그 6절)

1. **포멀도 사다리 vs R1 클래식** — D1(BLOCK 6, WARN 4, 블레이저·트렌치 7, 체스터필드 8, 출처 ≥2 면제)로 해결됨. 추가 변경 불필요. 남은 과제는 격차 4 **문구** 노출(P3-19)과 완화로 새로 올라온 울 슬랙스+컬러 스니커즈(P3-02). 티셔츠를 3으로 올릴 필요 없음.
2. **A12 올블랙** — 3-1-3 결정(표 점수 유지 + `adjSameColorTopBottom` −2) 타당. 단 black|top→bottom:black 5는 4-11 표(4)와 비대칭이라 4로(5절 #21), 그리고 black + blackDenim 조합이 −2를 피하는 구멍(P3-22).
3. **T5 limitColors charcoal** — **제외**(P3-09). 실측에서 차콜 클래식 2건이 각각 −1, 합쳐 −2를 받음.
4. **유사색 그룹 확장** — midDenim·lightDenim·skyBlue·forestGreen·chocolate·taupe 추가는 타당. 문제는 khaki가 green 그룹이고 beige·oatmeal이 어디에도 없는 것(P3-15).
5. **출처 미기재 46행** — 6절. 수정 권고 1건(black→burgundy 4→3).
6. **R2-only 21건 색 배정** — 전부 열람(덤프 7절 o32~o52). 상식에 맞음. 특기: o42(네이비 탱크·화이트 린넨·브라운 샌들·크림 오버셔츠) 휴양 변주로 적절, o45(화이트 캐시미어·블랙 데님·블랙 첼시·블랙 싱글 코트) 모노크롬 클래식으로 좋음, o52 수동 지정 적절. o32만 규칙 누락(P3-18). o50은 아우터 2겹(가죽 재킷 layer1 + 미드그레이 롱 코트 layer2)이 데이터에 제대로 있음.
7. **V-18 6건** — 3쌍 규칙 추가 권고(P3-18), o52 3쌍은 기본 3 유지.
8. **여름 울 슬랙스 기본 상의** — 폴로 유지 + 티셔츠를 두 번째 후보로 병행 생성(3절 끝).
9. **sandal 2/1/1, corduroy↔wool 2** — 샌들 값은 R2 "1~2" 근사로 타당. corduroy↔wool 2는 R1 c20(네이비 블레이저+브라운 코듀로이) 클래식과 충돌 → 3 권고(P3-10 ②).
10. **hex** — D2 토큰 비교는 P1/디자인 범위. 콘텐츠 관점 이상 없음(색 이름↔hex 대응 32색 확인).

---

## 8. 용어·라벨 점검 (labels.ko.json)

- shortLabel 전수: 6자 초과·공백 포함 **0건**.
- 표준 용어: 코듀로이(골덴 아님) ✓, 치노 + help "면바지" ✓, "울 슬랙스" ✓(단 소재 라벨로는 부적절, P3-10), 플란넬 help로 셔츠와 구분 ✓, 스니커즈 철자 ✓, 러닝화 ✓, 척카 부츠 + help "데저트 부츠 포함" ✓, 블루종(MA-1·해링턴) ✓, 셔츠 재킷 ✓.
- 카키/올리브: `color.khaki` label "카키(베이지 계열)" + help "국방색은 '올리브'"로 A15 의도는 충족. 그러나 괄호가 품목명·캡션에 그대로 섞여 "카키(베이지 계열) 치노"가 카드에 찍힘(P3-16 ⑤). label은 "카키"로, 설명은 help·S2 aria-label로.
- 흰/화이트 혼용: 색 라벨은 "화이트", R1 코디 품목명은 "흰 티셔츠", 신발 라벨은 "흰 스니커즈" → 같은 화면에 "흰 티셔츠"와 "화이트 티셔츠" 공존(P3-16 ⑥). 신발 "흰 스니커즈"만 관용으로 남기고 상의는 "화이트"로 통일 권장.
- `color.indigo` "인디고 데님"(P3-05), `tone.navyBase` short "네이비"(P3-26), `shoe.sneakerColor` "컬러 스니커즈" → "블랙 컬러 스니커즈/네이비 컬러 스니커즈"가 어색. "레트로 스니커즈"(R2 0-4 "컬러/레트로 스니커즈")로 바꾸면 "네이비 레트로 스니커즈".
- `material.denimWashed` label "워시드 데님"인데 color.lightDenim label은 "라이트워시 데님" → 하의 품목명이 "라이트워시 데님"(색)으로만 나와 일관됨. OK.
- explain 문구 조사·델타 하드코딩: P3-16 ①②.

---

## 9. 검증 경고 '데이터 갭' 판정 (gate-3 9항, P3 몫)

| 경고 | 판정 |
|---|---|
| V-21 midDenim·teal·taupe 미사용 | UI 칩에 안 뜨므로 실해 없음. midDenim은 베이스 추가 권장(P3-25), teal·taupe는 2차까지 colors.json 유지 + V-21 info 강등 |
| V-18 6건 | 3쌍 규칙 추가(P3-18), o52 3쌍 유지 |
| V-09 36건(classic 5 출처 1) | 5장 신발 열은 4장과 교차 검증됨 → 콘텐츠상 문제 없음. 경고 자체는 유지 |
| V-22 302 KB | 콘텐츠 범위 아님 |

---

## 10. 수정 권고 우선순위

게이트 기준 "높음 0건"을 맞추려면 1~6이 필수. 전부 `scripts/build/*.mjs` 또는 `src/engine/constants.js`·`candidates.js` 소규모 변경이며, 수정 후 `node docs/review/scratch-p3/dump.mjs > docs/review/scratch-p3/dump-output.txt`로 diff 확인.

1. **P3-01** 상의 6색·하의 lightGrey 폴백 1장 — `candidates.js generateCandidates` top 역참조 + `catalog.colorsFor` 하의 필터. (가장 눈에 띄는 결함: 칩의 절반이 빈 결과)
2. **P3-02** 블랙 신발 여름 기본 → 페니 로퍼 — `constants.js` 한 줄. 9장 즉시 해결.
3. **P3-03 + P3-06** `pickClassic` pass 0·1에서 계절 경고·tier 3 제외 — 14장 + 카키 흙탕 해결.
4. **P3-04** 브라운 하의 여름 → 치노 — `constants.js` + `materialize` bySeason.
5. **P3-05** `color.indigo` → "인디고", 상의 인디고 → 데님 셔츠, 아우터 인디고 → 데님 재킷 고정.
6. **P3-14** lightBlue +겨울, cream +여름 — `r1.mjs` seasons 표 2줄. (o10 universal 점수 복원)
7. **P3-09** T5 charcoal 제외, **P3-10** material.wool 라벨·corduroy↔wool 3, **P3-18** 규칙 3쌍 추가 — 데이터 스크립트 묶음 1회 재생성.
8. **P3-07·P3-08·P3-11·P3-13** 엔진 선택 규칙 4건(신발 다양성, 겨울 부츠, 포인트 2개, 겨울 티 단품).
9. **P3-12** 변주 품목 재구체화, **P3-19** 격차 4 문구 숨김, **P3-16·P3-17** 문구·피할 것.
10. 낮음 7건 + 5절 점수 변경 4행(#6, #13, #21, #25) + 6절 1행 + 4절 note 정리 + 로그 숫자(21→31).

재검토 시 확인 기준: quick 270장에서 ① `SEASON!`가 베이스 자체 때문이 아닌 카드 0, ② `gap5` 카드의 lo가 sneakerColor·running·sandal 0, ③ 라벨에 'a-z'·"인디고 데님 울"·"(울슬랙스)" 0, ④ 모든 S2 칩이 3장 반환.
