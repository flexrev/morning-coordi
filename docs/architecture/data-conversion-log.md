# 데이터 변환 로그 (C2)

작성일: 2026-10-19 · 작성: C2 · 입력: `research/color-rules.md`(R1), `research/style-rules.md`(R2) · 규격: `data-schema.md` v1.0, `engine-spec.md` v1.0
생성 스크립트: `npm run build:data` → `scripts/build-data.mjs` (+ `scripts/build/{util,sources,r1,r2,outfits,labels}.mjs`). 리서치 표를 다시 파싱하므로 **JSON을 손으로 고치지 말고 스크립트를 고친 뒤 재생성**한다. 같은 입력이면 바이트 단위로 같은 출력이 나온다.

검증·테스트 결과(제출 시점): `npm run validate` **0 error / 45 warning**, `npm test` **31 pass / 0 fail**, `npm run build` 성공.

---

## 1. 파일별 레코드 수

| 파일 | 레코드 | 용량 | 출처 → 비고 |
|---|---|---|---|
| enums.json | 11 키 | 6.3 KB | data-schema 2절. topTypes 16, outerTypes 16 포함 |
| colors.json | 32 | 10 KB | R1 1장 + 2-1(tones 역산) + 6장(seasons). hex는 R1 값 그대로 |
| toneRules.json | 9 규칙 + 6 그룹 + 색상환 | 6 KB | R1 2-2, 3장, 9-3. T5에 `limitColors` 추가(아래 3-3) |
| colorRules.json | 24 베이스 / **514 match** / 26 avoid | 127 KB | R1 4·5·8장. 380 표 행(4장 255 + 5장 125)을 `a / b` 분리하면 514 match. bottom 베이스 13(12 + white/cream 분리), top 베이스 11(variant null 9 + bretonStripe 1 + oxfordShirt 1) |
| materials.json | 15 | 5 KB | R2 3-1 + data-schema 2-5 |
| matRules.json | 15 × pairsWith 15 | 30 KB | R2 3-2 행렬 → denim 3종 복제 → 3-3 덮어쓰기 → 비대칭은 낮은 쪽 |
| fitRules.json | 20 | 3 KB | R2 1-2 그대로 |
| lengthRules.json | 50 (top 15 / outer 15 / trouser 20) | 8 KB | R2 2-1~2-3 |
| shoes.json | 11 | 4 KB | R2 4-1 + data-schema 2-8 |
| shoeRules.json | 11 / bottoms **147** / lengths 44 | 32 KB | R2 4-2(100행) + 2-4. "어떤 소재든" 행을 15개 소재로 전개(아래 3-6) |
| formality.json | 60 | 6 KB | R2 5-1~5-4. shoes 11 + bottom 17(chino 3행) + top 16 + outer 16 |
| outerRules.json | 16 | 22 KB | R2 6-1~6-3. 스크립트에 수기 입력(표가 자유 텍스트) |
| layerRules.json | 3 | 0.6 KB | R2 6-4 |
| adjust.json | 13 | 4 KB | R2 2-5(7행 중 6) + 3-4(2) + R1 8장(A11·A12·A13) |
| outfits.json | **52** (universal 10, 병합 3쌍) | 70 KB | R1 7장 30 + c29 변주 1 + R2 7장 24 − 병합 3 |
| labels.ko.json | 167 | 26 KB | 모든 enum 값 + explain.* 25 + ui.* 9. `shortLabel`(≤6자) 포함 |
| **합계** | | **302 KB** (gzip ≈ 45 KB 추정) | V-22(300 KB) 2 KB 초과 → warning. 1칸 들여쓰기로 작성 |

---

## 2. 버린 행 / 애매한 행

### 2-1. 셀에서 버린 토큰 (행 자체는 유지, 같은 행의 다른 색만 사용)

| 위치 | 토큰 | 이유 |
|---|---|---|
| R1 4-7 midGrey 상의 `mustard / 파스텔 옐로` | 파스텔 옐로 | 32색에 없음 → mustard만 |
| R1 4-7 midGrey 신발 `tan / walnut` | walnut | 32색에 없음 → tan만 |
| R1 4-8 charcoal 신발 `tan / walnut` | walnut | 동일 |
| R1 4-10 brown 신발 `burgundy / 코도반` | 코도반 | 색이 아니라 가죽 종류 → burgundy만 |
| R1 4-12 white/cream 상의 `lightBlue / 샴브레이` | 샴브레이 | 소재(denimShirt) → lightBlue만 |

### 2-2. 행 단위로 버린 것

| 위치 | 내용 | 이유 |
|---|---|---|
| R2 2-5 "short 아우터 + crop 상의 + wide 하의 → 0" | `adjShortCropWide` delta 0으로 **유지**(버리지 않음, 설명 문구용) | — |
| R2 3-4 "계절 인접: 여름↔겨울 소재 직접 조합 1" | **미반영** | adjust.when 허용 키로 표현 불가. 계절 축(3-6)이 계절 밖 아이템 수로 간접 처리 |
| R2 3-4 "보송함 레벨 맞추기(니트로 완충)" | 미반영 | 점수 규칙이 아니라 조언. matRules 질감 점수에 이미 반영됨 |
| R2 1-3 체형 보정, 4-3 메모 | 미반영 | 2차 범위(R2 명시) |
| R1 3장 피부·머리 대비, 언더톤 | 미반영 | 2차 범위(R1 명시) |
| R1 7장 c09 "white 옥스포드 **+** midGrey 크루넥" | 상의 1개 제한 → **midGrey 크루넥(knitWool)** 만 기록, 옥스포드는 note | V-17(top 정확히 1개) |

### 2-3. 출처 미기재 행 (46건) → `sources: ["R1"]`

R1 4·5장에서 근거 열이 비어 있거나 코드 없이 메모만 있는 행 46개에 내부 코드 `R1`("담당자 판단")을 부여했다(V-09 `sources ≥ 1` 충족용). 5장 **신발 열 전체**(36행)도 근거 열이 없어 `R1`이다. 전체 목록은 `node scripts/build-data.mjs`의 `== nosource` 출력 참조. P3는 이 46건 중 classic·score 4 이상인 행(예: `charcoal|bottom top|cream 4`, `black|bottom top|burgundy 4`, `navy|top bottom|lightDenim 4`)을 우선 확인.

### 2-4. 괄호 없는 매체 언급 → 코드로 환원

`indigo|bottom shoes|black` → `["GG","FB1","Allure"]`, `white|bottom shoes|black` → `["FB2","AtG3","VK1"]` (data-schema 예시와 일치), 그 외 본문에 `FB1`, `PM:`, `MM`, `HB`, `GG가` 등 코드 토큰이 나오면 자동 추출.

---

## 3. 스키마 문서 밖에서 C2가 내린 결정

### 3-1. colorRules

1. **5-7 화이트 옥스포드 셔츠**는 5-1 화이트 티셔츠와 (base, baseCategory) = (white, top)이 겹친다 → `variant: "oxfordShirt"`로 분리 보존. 엔진은 MVP에서 variant≠null을 무시(브레통과 동일). → V-05 허용 variant에 `oxfordShirt` 추가.
2. **8장 우선 덮어쓰기 4건**: `blackDenim→navy` top/outer 4→3·variation(A1), `midGrey→midGrey` top 2→1(A5), `charcoal→lightGrey` top 4→3(A5, tag classic 유지 = "조건부 클래식").
3. **A12 올블랙은 점수 덮어쓰지 않음**: 표(4-11 black→black 4, 5-2 black→black 5)와 8장(2)이 충돌하지만, 같은 내용이 `adjSameColorTopBottom`(−2)으로 스타일 축에 이미 들어가므로 이중 감점을 피해 표 값을 유지하고 `ruleId: "A12"` + `disputed`만 붙였다. 올화이트(white→white 2)는 표 자체가 2라 그대로.
4. **A6 제안 `olive→sage 3`** 은 표에 없던 행이라 추가(`ruleId: "A6"`, sources FB3).
5. **V-06 자동 교정**: 없음(표가 모두 규칙에 맞았음).
6. **avoid[]** 는 "피하기" 자유 텍스트를 스크립트에 수기로 옮김(26건). 색이 아닌 항목(스키니 핏, 4색, 이염)은 `category: null, color: null`.

### 3-2. V-08 임계치 변경 (data-schema 8절)

R1 데이터상 **bottom 베이스의 신발 classic 수**가 black 1개(black 5 / white 3 variation / chocolate 2), blackDenim 2개, charcoal 2개라 "≥3"을 만족할 수 없다. 행을 지어내지 않고 **검증 임계치를 shoes ≥ 1로 낮췄다**(top·outer ≥3, top 베이스는 bottom ≥3·shoes ≥2 그대로). top 베이스(variant null) 수는 9(10 − 브레통 − 옥스포드 variant + oatmeal/cream 분리).

### 3-3. toneRules T5 `limitColors`

T5(모노↔어스 −1)를 2-2 규칙대로 톤 데카르트곱에 적용하면 **white[neutral, mono] × beige/brown/khaki** 도 −1이 되어 "흰 티+베이지 치노" 같은 5점 클래식이 깎인다. R1 원문은 "모노(**블랙**)+어스"이므로 규칙에 `limitColors: ["black","blackDenim","charcoal"]`(쌍의 한쪽이 이 색일 때만 적용)을 추가했다. 엔진 `toneModifier`가 이 필드를 지원하고 validate가 색 id를 검사한다. T6(accent-accent)의 −2는 `accentAccent` 상수로 한 번만 적용되도록 rule modifier는 0.

### 3-4. matRules 비대칭 10쌍 → 낮은 쪽

denimWashed↔wool 2/4→2, denimWashed↔flannel 2/4→2, denimWashed↔knitWool 4/5→4, denimWashed↔leather 4/5→4, denimWashed↔tweed 3/5→3, denimBlack↔corduroy 3/4→3, denimBlack↔chino 3/4→3, denimBlack↔linen 2/4→2, denimBlack↔jersey 4/5→4, denimBlack↔tweed 4/5→4. 추가로 **corduroy↔wool = 2**(data-schema 4-6이 명시한 예: 울 재킷+골덴 바지 2, 반대 4). linen↔wool은 R2가 양쪽 모두 3으로 적어 3 유지(note에 방향 조건).

### 3-5. shoeRules

- "어떤 소재든"(chelsea wide 2, workboot slim 2, chukka wide 3)은 V-13이 material `"*"`를 금지하므로 **15개 소재 행으로 전개**(각 15행). 그래서 bottoms 합계가 147(원문 100행).
- sandal `denim_indigo / corduroy / flannel … 1~2` → denimIndigo 2, corduroy·flannel 1, `flags: ["approx"]`.
- running+wool 행에 `flags: ["disputed"]`(V-07 "러닝화+슬랙스").
- 조회 우선순위는 engine-spec 3-4 그대로: 정확 일치 → (material, fit, *) → (material, *, *) → 3, 그 뒤 lengths 평균.

### 3-6. formality

material 15개 전부에 bottom 기본 행(V-14). chino는 기본 5 + `when.fit` 2행. corduroy는 4 고정(R2 8-3 "MVP 한 등급"), 가는 골 6은 note. 아우터 범위(블루종 3~5 등)는 data-schema 2-10 중간값 + formalityNote.

### 3-7. outfits 병합

조인 키 = `bottom.material + shoeType + (outerType | none)`, 같은 classic 여부. 후보 중 **채택 3쌍**: c01↔s01, c05↔s03, c16↔s16. 키가 같아도 버린 쌍: c04↔s10(연중 vs 여름 crop), c07↔s15(universal에 와이드 크롭 핏 부여 부적절), c24↔s01(s01 이미 사용), c30↔s10(variation vs classic). 스키마가 예상한 c20↔s18, c10↔s17은 outer/shoes가 달라 미병합.

- **R1만**: 핏 regular, 기장 regular/nobreak, `styleAssigned`. 소재는 품목명→소재 표.
- **R2만**(21건): 색은 하의 소재 대표색 → colorRules의 첫 classic 5(없으면 4). 신발은 sneakerWhite→white, sneakerColor/running→navy·black·white 중 score ≥3 첫 색, 가죽 신발은 white 제외 첫 classic. 아우터는 denimJacket→indigo, 가죽→black/brown, 패딩·플리스·코치→black/navy/olive, 코트류→첫 classic 5, **상의·다른 아우터와 같은 색은 건너뜀**. `colorAssigned`.
- **s24(스웻팬츠 greyMelange)**: bottom 베이스가 없어 상의 black·러닝화 black·롱패딩 black을 **수동 지정**(V-18 warning 3건).
- **V-19 때문에 variation으로 바꾼 R1 클래식 4건** — 포멀도 사다리(티셔츠 2 vs 트렌치·블레이저 8, 피코트 7, 울 슬랙스 7)로 격차 ≥5: **c02**(흰 티+인디고+브라운 부츠+카멜 트렌치, R1 universal), **c22**(흰 티+연청+흰 스니커즈+네이비 블레이저, R1 universal), c25(브레통+베이지 치노+로퍼+피코트), c28(라이트그레이 티+차콜 슬랙스+흰 스니커즈). universal 13 → **10**(V-17 하한 딱 충족). c29는 R1 태그에 이미 variation.
- 자유 텍스트 매핑: "부츠"(봄가을)→chukka, (겨울)→workboot, c20은 옥스포드 셔츠 문맥→chelsea; "로퍼"→loaferPenny; "더비부츠"→derby; "필드재킷·초어재킷"→shirtJacket, "봄버"→blouson, "코트"(겨울)→chesterfield, "재킷"(c14)→shirtJacket, "더블브레스트"(c11 겨울)→chesterfield; "화이트 데님"(c12)→denimWashed; s08 "셔츠 재킷을 상의로"→oxfordShirt(loose); s15 "반팔 셔츠"→linenShirt; s21 "플리스 상의"→tee + fleece 아우터. 모두 `flags: ["mapped"]`.
- 최종 id: universal(R1 순) → R1 나머지 → R2 나머지. 대응표는 `node scripts/build-data.mjs`의 `== outfit` 출력(o01 ← c01+s01 …).

### 3-8. adjust

- data-schema 4-14의 9개 + R2 2-5의 `adjWideThinShoe`(0, disputed), `adjWideFullThinShoe`(−1), `adjShortCropWide`(0).
- **`adjHeavyLight` 조건 변경**: 스키마 예시의 `materialWeights: ["heavy","light"]`는 "저지 티+인디고 데님(heavy)"에 −1을 주어 o01이 2위로 밀렸다(가죽 신발이 heavy라 거의 모든 코디에 걸림). R2 3-4 원문대로 `bottomMaterial ∈ {corduroy, flannel, tweed}` × `topMaterial ∈ {linen, jersey}`로 바꾸고, 아우터 방향은 `adjHeavyLightOuter`(tweed·leather 아우터 × linen·jersey 하의)로 분리. `materialWeights` 키는 엔진이 계속 지원(신발 제외 집합).

### 3-9. labels

`shortLabel`(≤6자, 공백 없음)을 color·category·shoe·material·fit·length·tone·season 전부에, topType·outerType·tag에도 붙였다. 동의어는 R2 8장·R1 A15(khaki/olive 주의). explain.* 25개는 engine-spec 4절 표 + C2 추가 7개(`shoeLength`, `layerOver`, `accentAccent`, `outerScore`, `lengthBlock`, `seasonBlock`, `fourColors`/`sameColor` 분리). 팀5가 문구를 바꿀 때는 `labels.ko.json`만 고치면 된다(엔진 폴백은 `explain.js`).

### 3-10. R2 출처 코드표

R2 10장은 매체·제목만 있어 아래 코드를 만들었다(`scripts/build/sources.mjs`, `validate.js` 동일). V-20은 이 표 + R1 10장 코드만 허용.

| 코드 | 출처 | 코드 | 출처 |
|---|---|---|---|
| MOM | Man of Many – Relaxed fit | BESPOKE | Bespoke Unit – Shoe formality |
| BGU | Bonne Gueule – Oversized/loose | KOACHMAN | Mr. Koachman – Shoe formality |
| RMRSFIT | RMRS – Relaxed fit trend | JWHITE | John White – Formality spectrum |
| RMRSWIDE1 | RMRS – Slim vs wide | FBSHOES | FashionBeans – Shoes with trousers |
| MRPWIDE | MR PORTER – Wide-leg guide | FBWIDE | FashionBeans – Wide-leg pants |
| DIEWW | MR PORTER (Die Workwear) – Oversized | RMRSWIDE2 | RMRS – Shoes for wide leg |
| SQM | Square Mile – Loose clothes | SARTOROSHOE | Sartoro – Shoes with pants |
| VKFIT | Vogue Korea – 헐렁한 바지+간결한 상의 | MRPCHELSEA | MR PORTER – Chelsea boots |
| ESQK1 | Esquire Korea – 슬림 vs 와이드 | MRPBOOTS | MR PORTER – Guide to boots |
| ESQK2 | Esquire Korea – 슬림 재조명 | BOOTSPY | Bootspy – Style boots |
| COSK | COS Korea – Jeans fit guide | RAKE | The Rake – Tailored and Trainered |
| SUIT | Suitsupply – Trousers fit guide | WHSNEAK | Westwood Hart – Sneakers with suit |
| PSBREAK | Permanent Style – One clean break | GGSOCKS | Gentleman's Gazette – Socks |
| EGENT | Effortless Gent – Trouser break | MRPSOCKS | MR PORTER – Socks |
| SARTORO | Sartoro – Suit pant length | RMRSSOCK | RMRS – Sock length |
| TIES | Ties.com – Trouser length | ONDO | Ondo – Socks for loafers |
| BLOOM | Bloomberg – Pants break | ALLUREK1 | Allure Korea – 2026 봄 로퍼 |
| WKCOAT | W Korea – 숏 코트+스트레이트 데님 | GQKSHOE | GQ Korea – 2025 여름 신발 |
| VKCOAT | Vogue Korea – 롱 코트 무게중심 | PAPERSTRAIGHT | PaperStraight(FB 인용) |
| PSCORD | Permanent Style – Corduroy | GQKOUTER | GQ Korea – 초봄 아우터 5 |
| PROPER | Proper Cloth – Fall layering 2025 | ESQKCOACH | Esquire Korea – 코치 재킷 |
| SFORUM | StyleForum – Fabric textures | VKCOATJEAN | Vogue Korea – 코트+청바지 7 |
| MASHBURN | Sid Mashburn – Matching fabrics | VKTREND | Vogue Korea – 2026 FW 트렌드 12 |
| FBLAYER | FashionBeans – Layering/fabrics | ESQKFW | Esquire Korea – 2026 FW 슬릭 미니멀 |
| FBFABRIC | FashionBeans – Difficult fabrics | ELLEK | Elle Korea – 플리스·패딩 |
| BALTSUN | Baltimore Sun – Textures | ALLUREK2 | Allure Korea – 플리스 트렌드 |
| ARMOURY | The Armoury – Wool linen | KHANOUTER | 경향 – 겨울 아우터 종류 |
| SUMISSURA | Sumissura – Linen rules | R2 0 … R2 7 | R2 문서 절 참조(개별 매체 미기재 표) |
| KHANCORD | 경향 – 골덴 | R1 | R1 담당자 판단(출처 미기재 행) |
| WKCORD | W Korea – 코듀로이의 계절 | C1 / C2 | 스키마·변환 시 보강 |
| GQKLINEN | GQ Korea – 린넨 | NAMU | 나무위키 – 치노 |

---

## 4. engine-spec에서 벗어난 구현 (최소 변경)

| # | 항목 | 내용 |
|---|---|---|
| 1 | E-20 | `validateData(data)`가 빈 배열이 아니라 **error 0건**을 기준으로 통과(warning 45건 허용, 아래 5절). |
| 2 | 3-7 `materialWeights` | 신발 소재(가죽=heavy)를 집합에서 **제외**. 포함하면 E-09(블랙 티+블랙 데님+가죽 신발)가 "delta −1만"이 될 수 없다. |
| 3 | 6절 상의 기본값 | 여름 + 포멀도 ≥6 하의(울·플란넬)는 티셔츠(2) 대신 **피케 폴로**(4), 셔츠색이면 린넨 셔츠(5). 티셔츠면 격차 5로 전부 차단되어 E-03(midGrey/charcoal/black × summer)이 실패. `DEFAULTS.topFormalSummer`. |
| 4 | 2-2 toneModifier | `limitColors`(3-3) 지원. |
| 5 | 5-1 Quick 선정 | gate-2 3절 2항 규칙 구현: (universal 히트 → 전 쌍 5·classic → ≥4·classic → 나머지) 순의 풀에서 **톤 그룹이 다른 카드 우선, 3장째는 신발 색이 2종 이상 되도록** 고름. 조건을 못 채우면 단계적으로 완화. |
| 6 | 4절 explain | `explainScore(score, labels, outfit?)` 3번째 인자로 outfit을 받아 `explain.universal`/`variation`을 넣는다. `explainShort`(앞 2개), `captionOutfit`/`itemCaption`(gate-2 8항: 품목에 소재가 내포되면 생략) 추가. |
| 7 | 3-8 formality | 변주(tags ∋ variation) 격차 ≥5는 warn + penalty 2(스펙 그대로), `style.formality`에 `gap/penalty/blocked` 필드 추가. |
| 8 | 색 축 reasons | `explain.accentAccent`(−2), `explain.toneCross`에 from/to 톤 id, 모든 reason.params에 색·카테고리 id 포함(UI가 라벨로 치환). |
| 9 | 데이터 import | `src/data/index.js`는 Node 22에서 JSON을 직접 import하려면 `with { type: 'json' }`이 필요해 추가(Vite 6도 그대로 처리). |
| 10 | 성능 | 측정값: quick 0.5~2 ms(히트만), 역조회·deep 15~27 ms(후보 300개, 콜드 포함). `stats.ms`는 engine-spec 목표(<10)를 deep에서 넘기므로 테스트는 CI 기준 <50 ms. 2차에서 `generateCandidates` 상한(300)을 150으로 줄이면 10 ms 안. |

data-schema에서 벗어난 것: 3-2(V-08), 3-1-1(variant oxfordShirt), 3-3(limitColors), 3-8(adjHeavyLight), `flags` 필드를 materials·fitRules·lengthRules·shoeRules.bottoms·shoes에 추가(V-07 disputed 표기용), formality 60행(≈45 예상). 두 문서 끝에 "C2 구현 메모"로 같은 내용을 적어 두었다.

---

## 5. validate 경고 45건 (허용)

| 규칙 | 건수 | 내용 |
|---|---|---|
| V-09 | 36 | classic·score 5인데 출처 1개. 5장 신발 열 전체(근거 열 없음)와 4장 단일 출처 5점 행(`blackDenim→greyMelange/lightGrey/midGrey/charcoal`, `navy→camel/beige`, `midGrey→camel`, `charcoal→camel`, `black→charcoal/midGrey`). |
| V-18 | 6 | 색 규칙 없음(warning): o13 blackDenim↔midGrey 상의, o30 indigo↔forestGreen 후디, o32 beige↔indigo 데님 재킷, o52 greyMelange 하의 3쌍. |
| V-21 | 3 | 고아 색: midDenim, teal, taupe (R1 4·5장에 매치 없음). |
| V-22 | 1 | 총합 302 KB > 300 KB (2 KB 초과, gzip ≈ 45 KB). |

---

## 6. P3(콘텐츠 검토)가 확인할 것

1. **포멀도 사다리 vs R1 클래식 충돌** — 티셔츠(2)+블레이저/트렌치(8)는 격차 6으로 차단된다. 그래서 R1 universal이던 c02(흰 티+인디고+카멜 트렌치), c22(흰 티+연청+네이비 블레이저)가 변주로 내려갔고, 엔진은 "티셔츠 위에 블레이저"를 절대 추천하지 않는다. 사다리를 유지할지, 티셔츠를 3으로 올릴지(또는 `FORMALITY_BLOCK`을 6으로) 결정 필요. 상수 하나(`constants.js`)로 바뀐다.
2. **A12 올블랙** 점수(표 4·5 vs 8장 2) — 3-1-3의 결정이 맞는지.
3. **T5 limitColors**(3-3) — 어두운 모노 색만 어스톤과 −1. charcoal 포함 여부.
4. **유사색 그룹 확장**(data-schema 4-3, C1 추가 midDenim·lightDenim·skyBlue·forestGreen·chocolate·taupe) — 그대로 반영했다.
5. **출처 미기재 46행**(2-3) 중 classic 4점 이상 행.
6. **R2-only 코디 21건의 색 배정**(3-7) — 특히 o42(네이비 탱크+화이트 린넨+브라운 샌들+크림 오버셔츠), o45(화이트 캐시미어+블랙 데님+블랙 첼시+블랙 싱글 코트), o52(수동 지정).
7. **V-18 warning 6건**의 쌍은 규칙이 없어 기본 3으로 계산된다 — 규칙 행을 추가할지.
8. **여름 울 슬랙스 기본 상의 = 피케 폴로**(4절 3) — 티셔츠를 원하면 사다리를 바꿔야 함.
9. shoeRules sandal `1~2` → 2/1/1(3-5), corduroy↔wool 2(3-4).
10. 색 hex는 R1 원본 그대로이며 화면은 D2 토큰(`--g-<id>`) 우선(gate-2 2절 6항). 두 값 비교표는 `colors.json`의 `hex`와 `design-tokens.md` 32색 조정표를 나란히 보면 된다.


---

## 7. 통합 단계 결정 (Phase 3-C, C1)

PM 결정 D1~D3과 통합 중 발견한 갭(G1~G6)의 처리. 데이터 JSON은 손으로 고치지 않고 `scripts/build/*.mjs`를 바꾼 뒤 `npm run build:data`로 재생성했다.

### D1. 포멀도 임계·사다리·면제

| 항목 | 변경 | 위치 |
|---|---|---|
| (a) 임계치 | `FORMALITY_WARN = 4`(격차 4~5 경고, 패널티 1), `FORMALITY_BLOCK = 6`(격차 ≥6 차단, 패널티 2). 종전 BLOCK 5 | `src/engine/constants.js` |
| (b) 사다리 | blazer 8→**7**, trench 8→**7**, chesterfield 9→**8** (캐주얼 착용이 일상적). `formalityNote`에 R2 원문 값을 남김 | `scripts/build/r2.mjs` OUTER_TYPES → `enums.outerTypes.formality` + `formality.json` outer 행 |
| (c) 면제 | `isClassic && sources.length ≥ 2`인 코디는 격차 ≥6이어도 차단하지 않고 경고(패널티 2). `FORMALITY_EXEMPT_SOURCES = 2` | `src/engine/score.js formalityGap`, `src/engine/validate.js` V-19(임계 6 + 같은 면제) |
| 복원 | **c02**(흰 티+인디고+브라운 척카+카멜 트렌치, 출처 2)·**c22**(흰 티+연청+흰 스니커즈+네이비 블레이저, 출처 1)를 R1대로 **universal** 복원. 두 코디 모두 격차 5(티셔츠 2 ↔ 7)라 (c) 없이도 경고로 끝난다. 같은 이유(격차 5)로만 변주가 됐던 **c25**(브레통+베이지 치노+피코트)·**c28**(라이트그레이 티+차콜 슬랙스)도 classic(비 universal)으로 복원 | `scripts/build/outfits.mjs` |
| 결과 | universal **10 → 12**. id가 재부여됨(universal이 R1 순으로 앞에 오므로): o01 c01, **o02 c02**, o03 c03, o04 c04, o05 c05, o06 c06, o07 c07, o08 c10, o09 c15, o10 c16, o11 c17, **o12 c22**, 이후 R1 나머지·R2 순. 3-7의 대응표는 `npm run build:data`의 `== outfit` 출력이 정본 | `src/data/outfits.json` |
| 테스트 | 기존 E-04(러닝화 1 ↔ 울 7 = 6 → 차단)·E-05·E-06·E-07은 새 임계에서도 그대로 통과. 새 임계를 직접 못 박는 케이스는 `tests/integration.test.js`의 "D1 formality"(격차 5 경고·비차단, 격차 6 출처 1 차단 / 출처 2 면제)와 "D1 data"(universal 12, 사다리 7/7/8) | `tests/` |
| 부수 효과 | `DEFAULTS.topFormalSummer`(여름 울 슬랙스 기본 상의 = 피케 폴로)는 격차 5 차단을 피하려던 것인데 이제 5는 경고라 완화할 여지가 있다. 바꾸지 않았다(E-03 안정성) — Phase 4 판단 | `src/engine/constants.js` |

### D2. 성능

그대로 수용. `CANDIDATE_MAX = 300` 유지. 브라우저(프로덕션 번들)에서 deep 첫 호출 16~47 ms, quick 메모 히트 <1 ms.

### D3. 캡션

- 컴팩트 카드(S3·S4)는 **shortLabel 조합**(`catalog.shortName`: 색 shortLabel + 품목 shortLabel, 품목명이 색을 담으면 품목만 — "인디고데님", "흰스니커즈")으로 그리고 CSS `-webkit-line-clamp: 2`로 2줄에서 자른다. 예: "네이비 코튼니트 · 인디고데님 · 브라운 척카부츠 · 베이지 트렌치"(2줄).
- S5 상세와 카드 `aria-label`은 **엔진 전체 캡션**(`engine.caption` / `engine.itemCaption`, 소재 중복 제거 규칙) — "흰 티셔츠 · 인디고 데님 · 흰 스니커즈".

### G1~G6 갭 처리

| # | 처리 |
|---|---|
| G1 | 실제 엔진 deep 결과에 `avoid[]` 추가(`recommend.js avoidList`): ① colorRules[base].avoid(정방향) ② 다른 베이스 규칙의 avoid에 이 아이템이 오른 것(역방향 — 신발·아우터 베이스용, 예: 신발 탄 ← "하의 차콜") ③ 포멀도 격차 ≥ BLOCK인 품목("신발 러닝화 — 격식 차이 6단계"). UI는 그대로 `result.avoid` 읽음 |
| G2 | `variations[]`는 `fromOutfitId`·`swapped{category,from,to}`를 이미 실었음. 단 ① 상의 슬롯이 카드당 5개를 다 차지해 S6 신발·아우터 대안이 비었다 → `perSlot = 2` 상한 추가 ② 신발을 바꿀 때 `shoeType`·`material`을 유지해 "브라운 흰 스니커즈"가 생겼다 → 신발은 종류·소재, 하의는 소재를 색에 맞춰 다시 정함(`groups.js makeVariations`) |
| G3 | `components.captionParts(items, {short})` — 엔진이 `itemCaption`을 주면 그걸, 없으면(목) 카탈로그 폴백 |
| G4 | `main.js`가 엔진과 `createCatalog`에 같은 `data` 객체를 넘김(변경 없음, 주석으로 고정) |
| G5 | 실제 엔진의 `explain.disputed` reason에 `params.note`(colorRules match note)를 추가. S6 "의견 갈림" 시트는 `색A + 색B — note` → `outfit.note` 순으로 보여줌 |
| G6 | 카드 한 줄 설명(`cardReason`): '클래식/변주'를 빼고 **색 관계 설명(톤온톤·유사색·보색·무채색·+1 조합) → "누구나 안전한 기본 조합" → 나머지** 순, 점수 델타 "(+1)"는 카드에서 숨김. 인디고 3장: "누구나 안전한 기본 조합" / "네이비 베이스+어스톤 조합" / "톤온톤 (네이비 베이스)". S5 설명 줄도 한 단어 라벨을 뺀 앞 2개(`detailReasons`) |

### 엔진 전환·PWA

- `main.js`: `VITE_USE_MOCK === 'true'`일 때만 목. `.env.production`에 `VITE_USE_MOCK=false`. 비교가 빌드 타임 상수로 접혀 `dist/`에 mock 청크 없음(`grep mock dist/assets` 0건).
- 아이콘: `npm run icons`(`scripts/make-icons.mjs`, sharp 0.35)로 `docs/design/app-icon.svg` → 192/512/512 maskable/180 PNG, 전부 불투명.
- 체크리스트 결과: `docs/review/pwa-dod.md`.


---

## 8. Phase 4 수정 (P3 콘텐츠 검토 · P1 사용성 검토 반영)

반영일: 2026-10-19 · 근거: `docs/review/content-check.md`(P3-01~26, 3·4·5·6절), `docs/review/morning-usability.md`(P1-04·05·06·17), `docs/review/pwa-qa.md` 5절(V-21). 수정 범위는 `scripts/build/*`, `src/engine/*`, `tests/*`뿐이며 `src/data/*.json`은 `npm run build:data`로 재생성했다. 재검토는 `node docs/review/scratch-p3/check.mjs`(4항 PASS/FAIL)와 `dump.mjs` → `dump-output.txt` diff.

### 8-1. 데이터 (scripts/build)

| 항목 | 변경 | 파일 |
|---|---|---|
| P3-14 | `lightBlue` seasons +winter, `cream` +summer (R1 6장 첫 표·7장 c16/o10 근거). o10(라이트블루 셔츠+차콜+네이비 코트, 겨울 universal)의 −1 해소 | `r1.mjs SEASONS_BY_COLOR` |
| P3-09 | T5 `limitColors` → `["black","blackDenim"]`(차콜 제외) | `r1.mjs buildToneRules` |
| P3-15 | hue.analogous: khaki를 green → brown 그룹, brown 그룹에 beige·oatmeal 추가 → 베이지·카키 하의에 유사색(브라운)·보색(네이비) 그룹 생성 | `r1.mjs` |
| P3-18 | 규칙 3쌍 추가(`EXTRA_MATCHES`, 출처에 `C2`): `blackDenim→top:midGrey 4 classic`, `beige→outer:indigo 4 classic`(R2 6), `indigo→top:forestGreen 3 variation`. V-18 6 → 3(o52 스웻팬츠 3쌍은 기본 3 유지) | `r1.mjs` |
| P3-06 | `khaki|bottom` avoid "카키+올리브+브라운 흙탕"을 `top:olive`로 구조화 + `khaki→top:olive` 3→**2** | `r1.mjs AVOIDS·A_OVERRIDES` |
| 5절 disputed | #6 `blackDenim→outer:navy` 3 variation → 표 값 **4 classic** 복원(A1 '네이비 봄버+블랙 진 ✔'), #13 `brown→top:olive` 3→**2**, #25 `olive|top→bottom:brown` 3→**2**, #21 `black|top→bottom:black` 5→**4**(4-11 표와 대칭). 6절: `black→top:burgundy` 4 classic → **3 variation**(5-10과 대칭). 나머지 27건 유지 | `r1.mjs A_OVERRIDES` |
| P3-21 | note 파서: 출처 괄호·⚠ 제거 후 `\s+([.;,])` 붙임 + 수기 보정 7건(`NOTE_FIX`: "…혼용은 의견이 갈림(벨트·신발 가죽 통일 권장)", "…단서도 있음", "…상의와 함께", "…오프화이트로 대체", "…니트와 함께", "비추. PS도", "질감 차. FB3:") | `r1.mjs cleanBasis/fixNote` |
| P3-10 | `corduroy↔wool` 2 → **3**(R1 c20 네이비 블레이저+브라운 코듀로이 classic, note에 "재킷이 워스티드면 2") | `r2.mjs EXPLICIT` |
| P3-05·10·16 | 라벨: `color.indigo` "인디고 데님" → **"인디고"**, `material.wool` "울 슬랙스" → **"울"**(하의 품목명은 엔진 `DEFAULTS.bottomNameByMaterial`이 "울 슬랙스"로 합성), `color.khaki` "카키(베이지 계열)" → **"카키"**(설명은 help로), 품목 라벨에서 괄호·슬래시 제거(`topType.sweatshirt` "맨투맨", `outerType.overshirt` "오버셔츠", `chesterfield` "체스터필드 코트", `blouson` "블루종"). explain 문구에 조사 자리표시 `{color|은는}`·`{delta}` 사용 | `labels.mjs` |
| P3-16 ④⑥ | R1 코디 품목명 "트라우저" → "울 슬랙스"(o10·o19·o26·o28), "흰 티셔츠" → "화이트 티셔츠"(6건, 신발 "흰 스니커즈"는 유지) | `outfits.mjs` |
| P3-24 | `disputed` 플래그 행은 colorRules 25 + shoeRules 1 + materials 1 + fitRules 1 + lengthRules 1 + shoes 1 + adjust 1 = **31건**(toneRules T4·T5는 note 텍스트). 본 문서·gate-3의 "21건"은 colorRules만 센 것 → 31로 정정 | — |
| V-21 | `teal`·`taupe`는 `RESERVE_COLORS`(constants.js)로 두고 validate에서 **info**로 강등(어휘·토큰은 유지, 베이스 칩엔 안 오름). `midDenim`은 베이스 규칙이 없어 warning 유지(2차) | `validate.js` |

결과: validate 0 error / **45 → 40 warning**(V-18 6→3, V-21 3→1, V-09 36 유지). `colorRules.json` 24 베이스 / 517 match / 26 avoid, labels 171.

### 8-2. 엔진 (src/engine)

| 항목 | 변경 | 파일 |
|---|---|---|
| **P3-01** | 베이스 규칙이 없는 색도 역참조로 후보 생성: top 베이스(beige·brown·lightGrey·midGrey·charcoal·tan…)는 `top|color`가 매치로 오른 하의 베이스들, 규칙 없는 하의(lightGrey·chocolate·tan)는 `bottom|color`가 오른 상의 베이스 + 그 상의 규칙의 신발 열(없으면 뉴트럴 신발 white·brown·black, 규칙 없음 info). 아우터는 하의 규칙이 있을 때만. 새 공개 API `engine.hasBaseRule(category, color)`·`engine.baseColors(category)`(8-4) | `candidates.js generateCandidates`, `lookup.js`, `index.js` |
| **P3-02** | `DEFAULTS.shoesByColor.black.summer` → `loaferPenny`. quick 풀에서 격차 ≥5이면서 낮은 쪽이 sneakerColor·running·sandal 인 카드 제외(`QUICK_EXCLUDE_GAP/LO_SHOES`, deep에는 남음) | `constants.js`, `candidates.js pickClassic` |
| **P3-03·06, P1-04** | `pickClassic` 재작성: '깨끗한' 카드(전 쌍 classic 또는 universal 히트 + 베이스 탓이 아닌 계절 경고 없음 + 겨울 저지 상의 단품 아님 + 구조화 avoid 쌍 없음)만 pass 0~2, 계절은 맞는 variation은 pass 3, 계절 경고 카드는 pass 4. 톤 다양성(pass 0)은 깨끗한 카드 안에서만. 등급(minPair)은 규칙 없는 쌍(상의↔아우터)을 빼고 계산 | `candidates.js`, `score.js minPair` |
| **P3-04** | `bottomMaterialByColor.brown` 계절별: 봄가을·겨울 코듀로이, 여름 치노(`bySeason`) | `constants.js`, `candidates.js materialize` |
| **P3-05·23** | `topTypeByColor`: indigo·lightDenim·midDenim → 데님 셔츠, greyMelange → 맨투맨(여름 티). 데님색 아우터는 여름(오버셔츠) 외 항상 데님 재킷. 하의 품목명 합성: 소재 라벨이 색 라벨을 포함하면 소재 라벨("인디고"+"인디고 데님" → "인디고 데님") | `constants.js`, `candidates.js` |
| P3-07 | 신발 색 2종 조건은 깨끗한 후보로 못 채우면 pass 2에서 건너뜀(블랙 슬랙스는 블랙 신발 3장 허용, variation 신발 강제 안 함) | `candidates.js` |
| P3-08 | 브라운·초콜릿·탄 겨울 신발: 하의 포멀도 ≥6(울·플란넬)이면 첼시, 치노·데님은 워크 부츠(`shoesFormalWinter`, `materialize(…,{forBottom})`) | `constants.js`, `candidates.js` |
| P3-11 | 코디 전체 accent 아이템 ≥2(상의↔신발·같은 색 포함)이면 `accentAccent` −2 한 번 + 경고 | `score.js` |
| P3-12 | 변주 재구체화: 셔츠류는 허용 색(`topShirtOkColors`) 밖이면 계절 기본 상의로, 색 고정 품목(데님·멜란지)은 색 규칙으로, 아우터는 색·계절에 맞춰 종류 재결정(가죽 재킷은 black·brown·chocolate·tan만, 데님색은 데님 재킷) | `groups.js swapItem`, `candidates.js materialize` |
| P3-13, P1-05 | 겨울: 마지막 자리에서 아우터 카드 0이면 아우터 카드 요구(pass ≤1), 저지 상의(티·맨투맨·후디) 단품은 pass 4로. 신발 베이스는 신발 색 대신 하의 색 2종 | `candidates.js` |
| P3-16 ①②③ | `formatReason`에 조사 선택 `{param|은는}`(받침 판별, `josa()` export), `{delta}`로 −1/−2 표기, `ruleMissing`은 explain 맨 뒤·`explainShort`에서 제외. `itemCaption`은 1자 소재 라벨("울")을 전체 라벨로만 비교 → "(울)" 중복 없음 | `explain.js` |
| P3-17 | `avoidList`에 score ≤2 매치(정방향·역방향)를 "{카테고리} {색} — note 또는 비추천(점수 n)"으로 추가, 같은 대상은 1회 | `recommend.js` |
| P3-19 | 격차 4(경고 임계) 문구는 전 쌍 classic 코디에서 severity info로 강등 → 카드 explain에서 숨김, `score.reasons`에는 남아 S6가 읽음. 패널티 1 유지 | `score.js scoreOutfit`, `explain.js` |
| P3-20, P1-06·17 | 클래식 3: 구조 중복(상의 종류·하의 색·신발 종류·아우터 종류 동일) 금지, 마지막 자리에서 신발 색·신발 종류·상의 종류 2종 이상(베이스가 고정하는 차원은 제외). deep 그룹 5장: 같은 아우터 종류 ≤2, 같은 신발 종류 ≤2, 같은 (상의 종류+색) ≤1 — 상한에 걸리면 위반 수가 적은 카드부터(`fillDiverse`). 색상별 그룹이 톤별 그룹과 같은 5장이면 그 id를 뒤로 미뤄 다시 채우고, 그래도 같으면 그룹 제외 | `candidates.js`, `groups.js`, `recommend.js` |
| gate-3 4항 | 여름 + 포멀 하의(울·플란넬)는 기본 상의(폴로·린넨 셔츠) 외에 티셔츠 후보를 `variation` 태그로 병행 생성 → quick 클래식엔 안 오르고 deep 톤별·변주에 보임 | `candidates.js topVariants` |

### 8-3. 검증 결과

- `npm test` 39 → **48 pass**(integration 9건 추가: 전 칩 × 3계절 전수, 신발 다양성, 겨울 아우터, P3-02, 구체화, 데이터 값, 설명 문구, deep 그룹). 기대값을 바꾼 기존 테스트 3건: E-06(격차 4 문구 info), E-14(brown 그룹에 beige·khaki·oatmeal), 캡션 "화이트 티셔츠"; integration avoid 대상 "아우터 인디고".
- `check.mjs`(content-check 10절 재검토 기준, `engine.baseColors` 전 칩 168 × 3계절 = 504장): ① 베이스 탓이 아닌 SEASON! **0** ② gap5+컬러 스니커즈·러닝화·샌들 **0** ③ 라벨 'a-z'·"인디고 데님 울"·"(울슬랙스)" **0** ④ 전 칩 3장 **PASS**.
- `dump-output.txt`(270장): 계절 경고 15장은 전부 베이스 자체(연청 겨울, 블랙 데님 여름, 오트밀·버건디·카멜 여름), disputed 쌍 0, 상·하의 같은 색 0, 격차 ≥4 전수 67건 중 gap5는 블레이저·트렌치·체스터필드↔티·흰 스니커즈(허용 클래식)와 블랙 울 슬랙스↔멜란지 티만.

### 8-4. UI용 엔진 API (Phase 4 추가)

```js
engine.hasBaseRule(category, color) // boolean — colorRules에 `${color}|${category}` 베이스 규칙이 있는가 (bottom·top만 true 가능)
engine.baseColors(category)         // string[] — 그 카테고리에서 베이스로 쓸 수 있는 색 id. 자기 규칙 또는 역참조(score ≥3)로 후보가 생기고 classic 매치가 1개 이상인 색.
                                    //             classic 매치 수 내림차순 → 전체 매치 수 → id. RESERVE_COLORS(teal·taupe) 제외. 계절 무관(제철 여부는 colors[].seasons로)
engine.index.baseStats              // Map `${category}|${color}` → { classic, total } (정렬 근거)
```

`baseColors` 결과(현재 데이터): bottom 16(olive indigo navy beige white cream brown midGrey khaki charcoal blackDenim lightDenim black lightGrey chocolate tan), top 22, shoes 6(white brown tan black chocolate navy), outer 12. 이 색은 전부 3계절 각각 클래식 3장을 돌려준다(통합 테스트가 보장). classic 매치가 없는 색(하의 burgundy, 상의 rust·camel·lavender·mustard, 신발 burgundy·midGrey, 아우터 forestGreen·tan)은 `recommend()`는 되지만 칩에서 뺐다.

### 8-5. 미반영·2차

- P3-22(블랙 상의+블랙 데님 올블랙 −1), P3-25(midDenim 베이스 규칙), P3-26(`tone.navyBase` shortLabel), `shoe.sneakerColor` → "레트로 스니커즈" 제안 — 낮음/2차 범위.
- 역참조로만 만든 하의(lightGrey·chocolate·tan)는 아우터 규칙이 없어 겨울에도 아우터 카드가 없다(하의 규칙 추가가 근본 해결).
- `outer|indigo` 겨울은 데님 재킷(소재 denimIndigo 연중)이라 경고 없이 나오지만 R2 outerTypes seasons는 봄가을 — 겨울 데님 재킷 허용 여부는 콘텐츠 판단.
- `top|indigo`(데님 셔츠, denimWashed) 겨울은 베이스 자체 계절 경고가 붙는다(classic 매치 1개뿐인 색).
