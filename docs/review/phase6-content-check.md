# Phase 6-B-3 콘텐츠 정확성 — 확장 검토 (P3)

작성일: 2026-10-20 · 작성: P3(콘텐츠 정확성) · 대상: 총괄 PM, CX/C2(데이터·엔진), UX · 리뷰 전용(src/·scripts/ 수정 없음)
입력: `docs/phase6/content-expansion.md`(정의·affinity 설계·§12 구현 메모), `docs/architecture/engine-spec.md` §12, `data-conversion-log.md` §9, `src/engine/style.js`·`groups.js`·`recommend.js`·`candidates.js`, `src/data/{styles,styleAffinity,occasions,accessoryRules,accessoryTypes,patterns,patternRules,midTypes,midLayerRules,twoOuterRules,labels.ko}.json`, Phase 4 보고 `docs/review/content-check.md`, `gate-4-review.md` §4.
스크립트·덤프: `docs/review/scratch-p3-v2/` — `dump.mjs`(1~7·9절 덤프 → `1-tags.txt` … `9-carryover.txt`), `whatif.mjs`(affinity 수정안 시뮬레이션), `whatif-groups.mjs`(byStyle 그룹 대안), `check-v2.mjs`(기준 ①~⑦, 출력 `check-v2-output.txt`). 전부 실제 엔진·실데이터를 import한다.

---

## 0. 요약

| 항목 | 결과 |
|---|---|
| 스타일 오태그(52행) | **명백한 오태그 7행(13.5% of 코디 / 태그 슬롯 96개 기준 7.3%)**, 경계 7행. 5건이 `ivy` 과잉(후디·플리스·초어 재킷 룩에 아이비). affinity 셀 10개 수정안(B)으로 6/7 해소 시뮬레이션 완료 |
| byStyle 그룹 | 그룹 스타일이 카드 태그에 들어가는 비율 **62%**(462장 중 285). 차콜 울 슬랙스는 minimal·bizcasual·ivy 3그룹이 **5장 동일**. 그룹 정렬이 `final + 0.5×norm`이라 사실상 "점수순 상위 5장" |
| byOccasion | Deep 120그룹: stage0 93 · stage2 15 · stage3 9 · stage4 3. **격식 창 밖 카드가 격식·운동 그룹에 42장**(티셔츠+치노+로퍼 '격식', 울 슬랙스+스니커즈 '운동'). date=work 동일 6/24 |
| 기준 ⑥ | **FAIL** — quick+상황 840건 중 3장·stage≤2 **81.9%**(work 96 · weekend 100 · date 98 · **active 76 · formal 40**). Deep byOccasion 81.8% |
| 기준 ⑦ | **PASS** — Deep 7,059장·벨트 제안 4,593건에서 가죽 벨트↔신발 계열 위반 0. 단 벨트 밖에서 "토트백 화이트(가죽)" 190장·"가죽 시계 화이트"는 계열 위반(C6-06) |
| 액세서리 | 852장·3,514줄 검사. 패턴 양말이 70% 카드의 기본 양말, 볼캡이 트렌치·블레이저 카드에, 문구가 내부 규칙 note 그대로(T8·−1·포멀도) |
| 패턴 | 변주 57장, 규칙 위반 0. 단 "화이트 하운드투스 울 니트 + 인디고 + 워크 부츠" 등 하운드투스 10장이 정의(모노·테일러링)와 어긋남 |
| 미드 레이어 | 여름 0·Quick 0 정상. **겨울 8베이스 전부 0장** — 기능이 겨울에 비활성. 봄가을 19장 중 15장이 퀼팅 베스트, 색이 화이트·라이트 블루·멜란지 |
| 라벨 | shortLabel >6자 0. 문구 3건 수정(격식 격식 중복 등), help·note에 내부 id·약어 노출 |
| 기준 ①~⑤ | 전부 PASS 유지 |

---

## 1. 검토 범위(커버리지)

| 절 | 대상 | 수량 | 덤프 |
|---|---|---|---|
| 1 | outfits.json 전 행 캡션 + `styles[]` + 8스타일 norm | 52행 · 96 태그 슬롯 | `1-tags.txt` |
| 2 | Deep byStyle — 8 베이스(인디고·베이지 치노·차콜 울·블랙 데님·올리브 치노·흰 상의·네이비 상의·흰 스니커즈) × 3계절 × 1차 4스타일 | 24 결과 · 93 그룹 · 462장 | `2-bystyle.txt` |
| 3 | Deep byOccasion 같은 24 결과 × 5상황 + **Quick+occasion 전 칩**(`engine.baseColors` 56칩 × 3계절 × 5상황) | 120 그룹 360장 · quick 840호출 2,520장 | `3-byoccasion.txt` |
| 4 | 소품: 24 결과 + 6 보조(블랙·네이비 하의, 카멜 아우터, 브라운 신발, 라이트 블루 상의, 카키 하의) 봄가을 = 30 Deep 결과의 화면 카드 | 852장 · 3,514줄 | `4-accessories.txt` |
| 5 | `patterns: true` 같은 30 결과 | 패턴 변주 57장 + 화면 카드 패턴 수 | `5-patterns.txt` |
| 6 | `layering: true` 24 결과 + quick 24 | mid 카드 19장 | `6-layering.txt` |
| 7 | 신규 라벨 51 + explain 24 + 실제 렌더 문구 샘플 4결과 | — | `7-labels.txt` |
| 8 | 기준 ①~⑦ | quick 504장 · 상황 840 · deep 7,059장 | `check-v2-output.txt` |
| 9 | Gate-4 이월 4건 | — | `9-carryover.txt` |

---

## 2. 발견 사항

심각도: **높음** = 스타일 아는 사람이 반박할 명백히 틀린 스타일·상황 추천 또는 계절 오류 · **중간** = 어색하지만 치명적이지 않음 · **낮음** = 문구·우선순위.

### 높음 (6건)

| # | 발견 | 베이스/계절/카드 | 왜 틀렸나(정의 인용) | 수정(파일·행·값) |
|---|---|---|---|---|
| **C6-01** | **격식(formal) 상황이 캐주얼 베이스에서 stage 3·4까지 완화해 티셔츠·스니커즈 카드를 '격식' 3장으로 낸다.** quick 격식 168호출 중 stage≥3 **101건(60%)**. Deep도 동일 | 올리브 여름 formal: "네이비 티셔츠[2] · 올리브 치노 · 브라운 페니 로퍼" ×3 / 흰 스니커즈 베이스 3계절 formal stage4: "네이비 티셔츠 · 베이지 치노 · 흰 스니커즈" / 탄 하의 겨울 formal stage4: "그레이 멜란지 맨투맨 · 탄 치노 · 흰 스니커즈" / 상의 멜란지 봄가을: "멜란지 맨투맨 · 블랙 울 슬랙스 · 블랙 더비 · 차콜 블레이저" | occasions.formal 정의 "창 6~10, avoid 캐주얼 상의 전부·스니커즈". D-2는 "항상 3장"을 택했지만 §2 처리 규칙 1은 "신발 avoid는 끝까지 유지 — 격식에 샌들이 나오면 신뢰 붕괴"라고 못 박았고 §12는 이를 뒤집었다. 또 창 밖 감점이 아이템당 −0.3 **고정**이라 티셔츠(2, 4단계 밖)와 린넨 셔츠(5, 1단계 밖)가 같은 감점을 받아 final이 높은 티셔츠가 이긴다(차콜 여름 formal: 린넨 셔츠 2장 사이에 "그레이 멜란지 티셔츠 gap5"가 2위) | ① `src/engine/style.js occasionWindow`: 감점을 거리 비례로 — `penalty = Σ max(1, |level − 창 경계|) × OCC_WINDOW_PENALTY`, 하한 −0.9 → −1.5 (`constants.js OCC_WINDOW_FLOOR`). ② `recommend.js`·`groups.js groupByOccasion`: formal·active는 **stage 2까지만** 완화하고 3장 미만이면 그대로 반환(`applied.relaxed`에 `'insufficient'`), UI는 "이 베이스로는 격식 코디가 2장뿐이에요" 안내(UX). ③ `occasions.json formal.avoid.itemTypes`에서 `linenShirt`·`poloPique` 제거(여름 격식 근사치로 허용, 창 감점만 받게) |
| **C6-02** | **운동·산책(active)이 울 슬랙스·드레스 베이스에서 materials 완화(stage 2) → "차콜 울 슬랙스 + 흰 스니커즈"가 운동 카드.** quick active 168호출 중 stage≥2 **41건(24%)**, 신발 블랙·브라운·탄 베이스는 stage4(더비·척카로 운동) | 차콜 3계절 active stage2: "그레이 멜란지 맨투맨 · 차콜 울 슬랙스 · 흰 스니커즈" / 신발 블랙 봄가을 active stage4: "라이트 그레이 코튼 니트 · 블랙 울 슬랙스 · 블랙 더비" / 상의 화이트 봄가을 active stage3: "화이트 옥스포드 셔츠 · 라이트워시 데님 · 흰 스니커즈" | active 정의 "avoid 울·플란넬·트위드·가죽, 가죽 신발 전부(척카 포함)", 창 1~4. 울 슬랙스(7)는 창 밖 3단계 | C6-01 ①②와 동일 수정. 추가로 `candidates.js generateCandidates`: occasion이 active면 하의 베이스가 wool·flannel일 때 **하의 소재를 jersey·nylonTech로 재구체화한 후보**(색 유지)를 풀에 더한다 — "차콜 테크 팬츠 + 러닝화"가 정답. 2차면 UI에서 운동 칩을 울·플란넬 베이스에 비활성 |
| **C6-03** | **byStyle 그룹이 서로 같다.** 차콜 울 슬랙스 봄가을·겨울: minimal∩bizcasual **5/5**, 여름 4/5; 흰 스니커즈 여름 minimal∩amekaji 5/5; 24결과 합계 minimal∩bizcasual 63·bizcasual∩ivy 59·minimal∩ivy 50(각 최대 120). 462장 중 **177장(38%)이 그룹 스타일을 태그에 갖지 않음**. 베이지 봄가을 **amekaji** 그룹 = "네이비 코튼 니트 · 베이지 치노 · 탄 척카(norm 0.42)", "올리브 코튼 니트 · 베이지 치노 · 네이비 컬러 스니커즈" 5장 — 아메카지 요소(인디고·플란넬·워크 부츠·데님 재킷) 0 | 2절 샘플 전부 | `groupByStyle`은 `norm ≥ 0.4` 필터 후 `final + 0.5×norm`으로 정렬 → norm 차 0.3이 final 차 0.15와 같아 **점수 상위 5장이 모든 그룹에 반복**. 설계 1-4 "styleTags = norm ≥ 0.4 && ≥ 0.8×max"는 그룹 소속이 아니라 태그 기준인데 그룹이 더 느슨한 기준(ratio 없음)을 쓴다 | `src/engine/groups.js groupByStyle build(s)`: 후보 필터를 `c.styleTags.some(t => t.id === s)`(top-2 태그 포함)로, 정렬을 `norm[s]` 우선·`final` 보조(`rankOf = c => 10×norm + final`)로. 5장 미만·빈 그룹 허용(빈 그룹은 UI에서 칩 비활성). 시뮬레이션(`whatif-groups-output.txt`, 화면 후보 풀 기준): 그룹 스타일∈태그 62%→**100%**, 동일 그룹 쌍 6→**0**, overlap 합계 63/59/50 → 27/12/22, 빈 그룹 3→14(차콜 amekaji 등 — 올바른 결과) |
| **C6-04** | **겨울 `layering: true`가 8베이스 전부 mid 카드 0장.** 봄가을 19장, 여름 0(정상), 겨울 **0**. 겨울이 레이어링의 본 계절인데 토글이 아무것도 안 한다 | 6절 전 베이스 겨울 | 겨울 생성 후보의 기본 상의가 `knitWool`인데 `midLayerRules` 겨울 행의 base는 oxfordShirt·dressShirt·tee·hoodie뿐, knitWool은 `mlWiQuiltedUnderCoat`(score 3) 하나라 `midTypesFor`(≥4)에서 전부 탈락. 로그 9-4가 "겨울 카드가 적다"로 적었지만 실측은 **0** | ① `candidates.js generateCandidates` layering 분기: 겨울이면 base 상의가 셔츠 허용색(white·lightBlue·skyBlue·offWhite)일 때 `materialize(top, color, 'winter', {itemType:'oxfordShirt'})`로 바꾼 코디에 `knitOverShirt`(색 = 원래 니트 색)를 끼워 넣는다 → `mlWiKnitOverShirt`(5)가 살아난다. ② `midLayerRules.json` 추가 행: `{id: mlWiKnitVestCoat, season: winter, base: [oxfordShirt, dressShirt], mid: [knitVest], outer: [chesterfield, balmacaan, blazer], score: 4, tag: classic}`, `{id: mlWiCardiganUnderCoatKnit, season: winter, base: [tee], mid: [cardigan], outer: [chesterfield], score: 4}`. ③ 테스트 `expansion.test.js` "겨울 layering ≥ 1장" 추가 |
| **C6-05** | **스타일 오태그 7행 — 후디·플리스·초어 재킷 룩에 '아이비'.** o30 "포레스트 그린 후디 · 인디고 · 흰 스니커즈 · 브라운 코트" → minimal, **ivy** / o49 "화이트 티셔츠 · 베이지 치노 · 흰 스니커즈 · 네이비 플리스" → **ivy**(1위), minimal / o27 "흰 티 · 베이지 카고 · 흰 스니커즈 · 올리브 초어 재킷" → minimal, **ivy** / o03 "멜란지 맨투맨 · 인디고 · 흰 스니커즈 · 네이비 필드 재킷" → minimal, **ivy** / o34 "흰 맨투맨 · 연청 · 네이비 컬러 스니커즈 · 코치 재킷"(R2 메모 '스트릿 기본') → **amekaji**, cityboy(street 누락) / o12 "흰 티 · 연청 · 흰 스니커즈 · 블레이저" → **ivy**(1위) / o50 "흰 티 · 블랙 데님 · 블랙 첼시 · 블랙 가죽 재킷" → minimal, **bizcasual** | 1절 | styles.ivy.avoid = `hoodie, running, longPuffer, camo, oversized`; 정의 "옥스포드·피케·코튼 니트 + 치노·코듀로이 + 페니 로퍼·척카 + 블레이저·가디건·더플". 원인은 **핏·기장 행**: topFit regular ivy 2 · bottomFit regular 2 · topLength regular 2 · outerLength regular 2 → R1 코디 대부분이 regular라 품목과 무관하게 ivy에 +8, 여기에 navy 3·white 2·chino 3·sneakerWhite 2가 얹힌다. shirtJacket ivy 0·fleece ivy 0이라 상쇄가 없다. bizcasual은 leatherJacket −1·tee −1로 약함 | `styleAffinity.json` 10셀 (**수정안 B**, `whatif-output.txt`): outerType shirtJacket ivy 0→**−1** · outerType fleece ivy 0→**−2** · topType hoodie ivy −1→**−2** · topType sweatshirt ivy 1→**0** · topLength regular ivy 2→**1** · outerLength regular ivy 2→**1** · outerType leatherJacket bizcasual −1→**−2** · topType tee bizcasual −1→**−2** · color navy street 0→**1** · topType sweatshirt amekaji 2→**1**. 결과: 오태그 7건 중 **6건 해소**(o12만 minimal/ivy 순서로 남음 — 허용), 분포 minimal 60%·ivy 33%·bizcasual 40%·amekaji 12%·workwear 13%·street 6%, 태그 없음 0, ⑤ 통과(minimal 60%는 경계 — 필요하면 `color white minimal 2→1` 추가). 바뀌는 다른 행 8개(o05·o11 순서 교환, o13 bizcasual/minimal, o18·o32 amekaji/workwear, o25 ivy/minimal, o47 minimal/bizcasual, o48 street)는 전부 정의에 더 가깝다. V-26(시그니처 ≥+2)은 건드리지 않는다. 대안 A(핏·기장 lookup 가중 0.5, `constants.js STYLE_FIT_WEIGHT`)는 3건만 해소하고 회귀 8건 → 비추 |
| **C6-06** | **"토트백: 화이트"(흰 가죽 토트) 190장(852장의 22%), "가죽 스트랩 시계: 화이트"** — 흰 가죽 스니커즈 카드에 신발 계열 '화이트' 가죽 소품 | 베이지 봄가을 work: "라이트 블루 옥스포드 · 베이지 치노 · 흰 스니커즈 · 네이비 블레이저" → 웨빙 벨트 + **가죽 시계 화이트** + 토트백 오프화이트 / "화이트 울 니트 · 베이지 치노 · 흰 스니커즈" → **토트백 화이트** | 3-2 "가죽 가방 = 신발 가죽 색 계열"은 브라운·블랙 구두 전제(T8). 원인 두 가지: ① `style.js accWhen` `material` 키 — `props.material === null`이면 **통과**해 `acBagLeatherUnify`(shoesMaterial leather)가 흰 가죽 스니커즈에도 발화, `pick.color shoesFamily` = white. ② 상황 기본값(`occasions.work.accessories watchLeather`)의 `colorFrom: shoes`가 흰 스니커즈 색을 그대로 가져옴 | ① `accessoryRules.json acBagLeatherUnify.when`에 `shoesColor: [brown, chocolate, tan, camel, black, burgundy]` 추가(또는 `accWhen`에서 material null은 불일치로). ② `suggestAccessories` 상황 기본값: `colorFrom shoes`인데 신발 색이 가죽 드레스 계열 밖이면 `NEUTRAL_ACCESSORY_COLOR`(차콜) 또는 black. ③ `deriveAccessoryColor('shoesFamily')`가 white·navy·burgundy 등 비(非)가죽색이면 가죽 소품엔 null 반환하도록 `LEATHER_FAMILY` 상수 추가 |

### 중간 (10건)

| # | 발견 | 사례 | 근거 | 수정 |
|---|---|---|---|---|
| **C6-07** | **패턴 양말이 기본 양말**: 852장 중 **601장(70%)** `socksPattern`, 색 = 상의 색("패턴 양말: 화이트", "패턴 양말: 오트밀"). 겨울 로퍼 41장도 바지색·네이비 양말 대신 패턴 양말 | "오트밀 니트 · 인디고 · 브라운 로퍼" → 패턴 양말 오트밀 / 겨울 "올리브 울 니트 · 인디고 · 버건디 페니 로퍼" → 패턴 양말 올리브 | 3-2 "패턴 양말은 코디에 패턴이 없을 때 작은 패턴만"은 **허용** 규칙인데 delta 0 동점에서 id 사전순(`acSocksPatternOnce` < `acSocksWhiteSneakerOnly` < `acSocksWinterLoafer`)으로 이긴다. 겨울 로퍼 규칙(EGSOCK "바지색·네이비·차콜")이 묻힘 | `accessoryRules.json`: `acSocksWinterLoafer.delta 0→1`, `acSocksWhiteSneakerOnly.delta 0→1`, `acSocksPatternOnce.pick.color outfit→bottomDarker` + `when`에 `shoeType: [derby, oxford, loaferPenny, loaferTassel, chelsea, chukka]`(스니커즈엔 패턴 양말 제안 안 함) |
| **C6-08** | **accessoryTypes의 formality 창이 규칙 경로에서 무시됨** → 볼캡(max 5)이 트렌치·블레이저 카드(F 5.25~6.9)에 **63장**, 웨빙 벨트(max 4)가 F4.3~5.75 옥스포드+치노 카드에 136장 | "화이트 옥스포드 · 인디고 · 버건디 페니 로퍼 · 카멜 트렌치(F5.75)" → **볼캡 카멜** / "라이트 블루 옥스포드 · 베이지 치노 · 흰 스니커즈 · 네이비 블레이저" → 웨빙 벨트 | 3-2 "포멀도 ≥7엔 모자 생략"만 규칙이고 types의 `formality.min/max`는 상황 기본값 경로에서만 검사(`suggestAccessories` `fits()`는 seasons만) | `style.js suggestAccessories fits(t)`: `t.seasons.includes(season) && (props.formality === null || (props.formality >= t.formality.min − 0.5 && props.formality <= t.formality.max + 0.5))`. 효과: 볼캡은 F≤5.5, 웨빙 벨트 F≤4.5, 브레이디드 3~6.5로 정리 |
| **C6-09** | **데이트 ≈ 출근**: 24결과 중 3장 동일 **6**, 2장 이상 겹침 13 | 차콜 3계절·인디고 여름·블랙 데님 여름·올리브 여름·흰 상의 여름·흰 스니커즈 여름 전부 동일 3장 | 두 상황의 avoid·창이 거의 같고(3~9 vs 3~8) styleBoost 차이가 `K_OCC 0.4`×norm 차 ≈ 0.02~0.05라 정렬을 못 바꾼다. GQKDATE·ESQDATE "각 잡힌 블레이저는 면접처럼" | ① `groups.js groupByOccasion`: date 그룹을 만들 때 work 그룹 id를 `deprioritize`로 전달(P1-06 톤별↔색상별과 같은 방식). ② `occasions.json date.avoid.itemTypes`에 `dressShirt` 추가, `prefer.itemTypes`에서 `blazer` 제거하고 `cardigan`·`shirtJacket` 유지. ③ `date.styleBoost` minimal 2→3(차이 확대) |
| **C6-10** | **소품 문구가 내부 규칙 note 그대로**: "브라운 계열끼리. 탄+에스프레소처럼 명도 차 크면 −1", "신발·벨트·시계줄 가죽 한 색(T8)", "나토·러버는 포멀도 5 이하 코디만", "캐주얼엔 나일론·캔버스. 안전색 4개", "(3색 규칙)". `key: explain.acc.<ruleId>`는 생성되지만 `labels.ko.json`에 **0/32** 존재 → `note`로 폴백 | 7절 샘플 전부 | 설계 3절 "카드 아래 소품 제안 한 문장"; V-32는 `accessory.*`만 요구하고 `explain.acc.<ruleId>`를 빠뜨림 | `labels.ko.json`에 `explain.acc.ac*` 32행 추가(사용자 문장, 예: acBeltBrownShoes "브라운 구두엔 브라운 계열 벨트", acWatchLeatherUnify "시계줄도 신발·벨트와 같은 가죽 색으로", acBagCasualNylon "나일론·캔버스 백팩, 블랙·올리브·네이비·차콜 중 하나", acSocksNoShowSummerLoafer "여름 로퍼·스니커즈엔 페이크삭스"). `attachAccessories`가 `L[a.key] ?? note`를 쓰게. V-32에 `explain.acc.<ruleId>` 전수 추가 |
| **C6-11** | **하운드투스 변주가 정의 밖**: "화이트 하운드투스 울 니트 · 인디고 데님 · 브라운 워크 부츠(F4.33)", "… · 블랙 데님 · 흰 스니커즈" 등 10장 | 인디고·블랙 데님·베이지·흰 스니커즈 겨울 | patterns.houndstooth "모노 팔레트와. 테일러링", formality 7. `patternFor`의 포멀도 허용 ±3이 넓고 톤 조건이 없다 | `patterns.json houndstooth.itemTypes`에서 `knitWool` 제거(아우터 전용) **또는** `style.js patternFor`: 허용 편차 3→**2** + `p.formality ≥ 7`이면 `outfit.tags`에 mono 필요. 잔줄 셔츠·브레통 변주는 정확(위반 0) |
| **C6-12** | **미드 레이어 색이 비현실적**: "화이트 퀼팅 베스트", "라이트 블루 퀼팅 베스트", "그레이 멜란지 퀼팅 베스트", "오프화이트 퀼팅 베스트" — 봄가을 19장 중 퀼팅 베스트 15장, 그중 10장이 이런 색 | 인디고·블랙 데님·올리브·차콜·흰 스니커즈 봄가을 | 5-1 퀼팅 베스트 = 나일론 기능템(네이비·올리브·블랙·카키). `generateCandidates`가 mid 색을 colorRules 상의/아우터 매치 ≥4에서 첫 색으로 집어 색 제약이 없다 | `midTypes.json`에 `colors` 허용 목록 추가(quiltedVest: navy·olive·black·khaki·charcoal / knitVest·cardigan·knitOverShirt: 니트 색 전부 / overshirtMid: 셔츠 재킷 색), `candidates.js` layering 분기에서 `midColor`를 허용 목록 ∩ 매치 ≥4 중 첫 색으로 |
| **C6-13** | **상황 설명 문구**: "**격식 격식** 창 밖 아이템 1개 (−0.3)"(occasion=격식일 때 중복), "출근에 +0.28"(숫자만, 의미 없음), 창 밖 감점과 "주말에 딱 맞는 격식 (+0.2)"이 같은 카드에 동시 출력(모순처럼 읽힘) | 7절 샘플 | V-12 사용자 문구 기준 | `labels.ko.json`: `explain.occasion.window` → "{occasion}치곤 격식이 안 맞는 아이템 {n}개 ({delta})", `explain.occasion.adj` → "{occasion} 분위기와 잘 맞아요 ({delta})", `explain.occasion.target` → "전체 격식은 {occasion}에 딱 맞아요 (+0.2)". `decorateCandidate`: `outside > 0`이면 target 줄 생략 |
| **C6-14** | **버건디 로퍼엔 벨트 규칙이 없어 벨트 줄이 비고 가방만 "토트백: 버건디"** | "베이지 코튼 니트 · 인디고 · 버건디 페니 로퍼 · 베이지 트렌치" 벨트 없음(해당 카드 202장 중 버건디 로퍼 전부) | MYRQ: 버건디·옥스블러드 구두엔 다크 브라운 또는 같은 버건디 벨트 | `accessoryRules.json` 추가: `{id: acBeltBurgundyShoes, accessory: [beltLeather], when: {shoesMaterial: leather, shoesColor: burgundy}, pick: {color: chocolate}, delta: 1, note: "버건디 구두엔 다크 브라운 또는 버건디 벨트"}`; `acBagLeatherUnify`도 burgundy면 chocolate |
| **C6-15** | **머플러가 45% 카드(383장)에**, 아우터 없는 카드 84장 포함, 봄가을 셔츠 재킷·블레이저에도 | "러스트 코튼 니트 · 인디고 · 흰 스니커즈" → 머플러 차콜(아우터 없음) | `acScarfAccentOnce`에 `hasOuter`·season 조건 없음, `acScarfSolidCoat`가 봄가을 모든 아우터에 발화 | `acScarfAccentOnce.when`에 `hasOuter: true, season: [winter, springFall]`; `acScarfSolidCoat.when.season`을 `winter`로, 봄가을은 `outerType: [trench, balmacaan, chesterfield]` 한정 |
| **C6-16** | **운동 카드 소품**: "볼캡: 화이트 — 아우터와 2~3톤 이내"(아우터 없음), "페이크삭스: 여름 로퍼는 페이크삭스"(스니커즈 카드) — note가 조건과 안 맞음 | 흰 상의 여름 active 3장 | — | C6-10 라벨로 해결(규칙별 문장에서 조건 제거) |

### 낮음 (6건)

| # | 발견 | 수정 |
|---|---|---|
| **C6-17** | 패턴 변주 품목명 "**잔줄 셔츠 라이트 블루 셔츠**"(o10 itemName "라이트 블루 셔츠"가 `topType.oxfordShirt` 라벨을 안 담아 접두 삽입) | `groups.js makePatternVariations`: 치환 실패 시 itemName의 **마지막 단어 앞**에 짧은 라벨의 수식어만 삽입("라이트 블루 잔줄 셔츠") |
| **C6-18** | 여름 울 슬랙스+로퍼에 "바지색 양말"(19장) — `acSocksMatchTrousers`와 `acSocksNoShowSummerLoafer` 동점에서 전자가 이김. 출근이면 OK, 데이트·주말이면 페이크삭스가 자연스러움 | 허용. 원하면 `acSocksNoShowSummerLoafer.delta 1→2` |
| **C6-19** | shortLabel "셔츠위 니트"(띄어쓰기 비표준) · help에 내부 id: `midType.cardigan` "outerTypes.cardigan과 같은 품목…", `midType.knitOverShirt` "top=oxfordShirt + mid=knitWool", `midType.overshirtMid` "shirtJacket·overshirt가…", accessory help "(T8)" | shortLabel → "이너 니트"; help를 사용자 문장으로("코트 안에 입는 가디건", "셔츠 위에 겹쳐 입는 니트", "코트 안에 입는 오버셔츠", "벨트·신발과 같은 가죽 색") |
| **C6-20** | `twoOuterRules`가 후보 생성에 쓰이지 않음(겨울 아우터 인디고 + layering: 2겹 카드 0) — 데이터만 있고 "데님 재킷 + 더플" 카드가 안 나온다 | Gate-4 이월(겨울 데님 재킷)과 함께 9절 |
| **C6-21** | 미드 카드 S6 설명에 "규칙 없음(기본 3)"(top↔mid 색 쌍 규칙 부재)이 그대로 노출 | `explain.js` PRIORITY: `ruleMissing`은 mid 쌍에 한해 생략, 또는 `PAIR_WEIGHT_MID` 쌍은 규칙 없으면 축에서 제외 |
| **C6-22** | `occasion.formal` help "…수트는 2차", `occasion.active` shortLabel "운동·산책"(5자, 칩에서 2줄 위험) | help에서 "수트는 2차" 삭제(사용자용 아님), shortLabel "운동"(aliases에 산책 유지) |

---

## 3. 스타일 오태그 표 (52행 중)

판정 기준: 1-1 정의·1-2 시그니처·1-3 avoid. **오태그** = 그 스타일 사람이 반박할 태그, **경계** = 2순위로는 허용 가능.

| id | 캡션 | 현재 태그 | 판정 | 맞는 태그 | 수정안 B 적용 후 |
|---|---|---|---|---|---|
| o03 | 그레이 멜란지 맨투맨 · 인디고 데님 · 흰 스니커즈 · 네이비 필드 재킷 | minimal, **ivy** | 오태그 | minimal·workwear/amekaji | minimal, workwear |
| o12 | 화이트 티셔츠 · 라이트워시 데님 · 흰 스니커즈 · 네이비 블레이저 | **ivy**, minimal | 오태그(1위) | minimal·cityboy | minimal, ivy |
| o27 | 화이트 티셔츠 · 베이지 카고/치노 · 흰 스니커즈 · 올리브 초어 재킷 | minimal, **ivy** | 오태그 | workwear·cityboy | minimal, workwear |
| o30 | 포레스트 그린 후디 · 인디고 데님 · 흰 스니커즈 · 브라운 코트 | minimal, **ivy** | 오태그(ivy avoid=hoodie) | street 변주·minimal | minimal |
| o34 | 화이트 맨투맨 · 라이트워시 데님 · 네이비 컬러 스니커즈 · 네이비 코치 재킷 | **amekaji**, cityboy | 오태그(street 누락, R2 "스트릿 기본") | street·cityboy | street, cityboy |
| o49 | 화이트 티셔츠 · 베이지 치노 · 흰 스니커즈 · 네이비 플리스 | **ivy**, minimal | 오태그(1위) | minimal·cityboy·gorpcore | minimal, cityboy |
| o50 | 화이트 티셔츠 · 블랙 데님 · 블랙 첼시 부츠 · 블랙 가죽 재킷 | minimal, **bizcasual** | 오태그 | minimal·street | minimal |
| o02 | 화이트 티셔츠 · 인디고 데님 · 브라운 부츠 · 카멜 트렌치 | minimal, ivy | 경계 | minimal·amekaji | minimal |
| o07 | 화이트 티셔츠 · 올리브 치노 · 흰 스니커즈 | minimal, ivy | 경계 | minimal·cityboy | 유지 |
| o14 | 미드 그레이 니트 · 블랙 데님 · 블랙 스웨이드 척카 · 네이비 봄버 | minimal, bizcasual | 경계 | minimal | 유지 |
| o24 | 브레통 티 · 인디고 데님 · 흰 스니커즈 | ivy, minimal | 경계 | cityboy·minimal | minimal, ivy |
| o29 | 그레이 멜란지 후디 · 인디고 · 흰 스니커즈 · 브라운 코트 | minimal | 경계(후디+코트 = 스트릿 변주) | minimal/street | 유지 |
| o37 | 화이트 코튼 셔츠 재킷(→옥스포드) · 인디고 · 브라운 더비 | minimal, bizcasual | 경계(인디고는 bizcasual 시그니처 밖) | minimal·ivy | 유지 |
| o41 | 화이트 피케 폴로 · 미드 그레이 울 슬랙스 · 브라운 태슬 로퍼 | minimal, bizcasual | 경계(ivy 0.54 동점을 순서로 탈락) | ivy·bizcasual | 유지 |

**오태그율**: 7/52 코디 = **13.5%**, 태그 슬롯 기준 7/96 = **7.3%** (목표 ≤10%: 슬롯 기준 통과, 코디 기준 미달). 수정안 B 후 1/52.

**affinity 셀 변경 제안(수정안 B)** — `styleAffinity.json`

| kind | id | 스타일 | 현재 → 제안 | 이유 |
|---|---|---|---|---|
| outerType | shirtJacket | ivy | 0 → −1 | 초어·필드 재킷은 워크웨어·아메카지(1-2) |
| outerType | fleece | ivy | 0 → −2 | 고프코어 시그니처, ivy avoid(longPuffer)와 동급 |
| topType | hoodie | ivy | −1 → −2 | ivy avoid 1순위 |
| topType | sweatshirt | ivy | 1 → 0 | 1-2 ivy 상의에 없음 |
| topLength | regular | ivy | 2 → 1 | 기장은 저신호 — 모든 R1 코디에 +2 누적 |
| outerLength | regular | ivy | 2 → 1 | 동일 |
| outerType | leatherJacket | bizcasual | −1 → −2 | SUITBC 비즈캐주얼 아우터 밖 |
| topType | tee | bizcasual | −1 → −2 | 티셔츠 출근룩은 ALLWORK에서도 제외 |
| color | navy | street | 0 → 1 | 네이비 코치 재킷·스니커즈(VKNB)는 스트릿 안전색 |
| topType | sweatshirt | amekaji | 2 → 1 | 맨투맨은 아메카지보다 스트릿·시티보이(o34) |

---

## 4. 상황 완화(relaxed) 최악 사례

Quick+occasion 840호출: stage0 603 · stage2 85 · **stage3 112 · stage4 40**(3장 미만 0). Deep byOccasion 동일 분포(603/0/84/112/41).

| 베이스/계절/상황 | stage | 나온 3장(발췌) | 부끄러운가 |
|---|---|---|---|
| 신발 흰 스니커즈 × 3계절 **formal** | 4 (shoeTypes 해제) | "네이비 티셔츠 · 베이지 치노 · 흰 스니커즈", "네이비 울 니트 · 미드 그레이 울 슬랙스 · 흰 스니커즈 · 카멜 체스터필드" | **예** — 결혼식·면접에 흰 스니커즈 |
| 신발 네이비 봄가을 **work** | 4 | "화이트 옥스포드 · 베이지 치노 · **네이비 컬러 스니커즈** · 네이비 블레이저" | 예(work avoid sneakerColor) |
| 신발 블랙 봄가을 **active** | 4 | "라이트 그레이 코튼 니트 · 블랙 울 슬랙스 · 블랙 더비" | **예** — 운동에 더비+울 슬랙스 |
| 하의 탄 겨울 **formal** | 4 | "그레이 멜란지 맨투맨 · 탄 치노 · 흰 스니커즈" | 예 |
| 하의 초콜릿·탄 봄가을 **active** | 4 | "오트밀 코튼 니트 · 초콜릿 치노 · 브라운 척카" | 예 |
| 하의 연청·크림·화이트 **formal** | 4 | "화이트 티셔츠 · 라이트워시 데님 · 흰 스니커즈 · 네이비 블레이저" | 예 |
| 상의 멜란지·인디고·탄·… 25색 **formal** | 3 (itemTypes 해제) | "그레이 멜란지 맨투맨 · 블랙 울 슬랙스 · 블랙 더비 · 차콜 블레이저" | 예 — 맨투맨 하객 |
| 올리브·베이지·인디고·블랙 데님 여름 **formal** | 3 | "네이비 티셔츠 · 올리브 치노 · 브라운 페니 로퍼" | 예 — 린넨 셔츠·폴로가 풀에 있는데 티셔츠가 final로 이김(C6-01 감점 고정) |
| 아우터 인디고 겨울 **formal** | 3 | "네이비 울 니트 · 올리브 치노 · 블랙 더비 · 인디고 데님 재킷" | 예 |
| 아우터 네이비·올리브·카멜·… **active** | 3 | "화이트 티셔츠 · 연청 · 흰 스니커즈 · 네이비 블레이저" | 예 — 블레이저 입고 산책 |
| 차콜·미드그레이·블랙 울 × 3계절 **active** | 2 (materials 해제) | "그레이 멜란지 맨투맨 · 차콜 울 슬랙스 · 흰 스니커즈" | 예(울 슬랙스 운동) |
| 인디고·베이지·올리브·블랙 데님 여름 **work/date** | 2 | "베이지 티셔츠 · 인디고 데님 · 흰 스니커즈" | 아니오 — 여름 캐주얼 출근으로 허용 범위(jersey 해제) |

stage 2의 work/date 48건은 수용 가능(여름 티셔츠). **문제는 formal·active의 stage 3·4 152건**(18%)과 울 슬랙스 active stage 2.

---

## 5. 액세서리 위반 표 (852장 · 3,514줄)

소품별 빈도: bagTote 644 · socksPattern 601 · watchNato 433 · scarf 383 · beltLeather 345 · watchLeather 345 · beltWebbing 231 · bagBackpack 207 · socksNoShow 160 · socksMatch 74 · cap 70 · socksWhite 17 · beanie 3 · bagBriefcase 1.

| 유형 | 건수 | 사례 | 판정 | 수정 |
|---|---|---|---|---|
| 벨트 색 ↔ 신발 가죽 계열 | **0** | — | ⑦ PASS | — |
| 흰 가죽 토트 / 흰 가죽 시계(신발=흰 스니커즈) | 190 / 상황 기본값 다수 | "화이트 울 니트 · 베이지 치노 · 흰 스니커즈 → 토트백 화이트" | 위반(계열 규칙의 취지) | C6-06 |
| 패턴 양말 기본 · 겨울 로퍼에 패턴 양말 | 601 / 41 | "올리브 울 니트 · 인디고 · 버건디 로퍼 → 패턴 양말 올리브" | 위반(EGSOCK 겨울 로퍼 = 바지색·네이비·차콜) | C6-07 |
| 볼캡 + 트렌치·블레이저 (F5.25~6.9) | 63 | "화이트 옥스포드 · 인디고 · 버건디 로퍼 · 카멜 트렌치 → 볼캡 카멜" | 위반(cap max 5) | C6-08 |
| 웨빙 벨트 F>4 | 136 | "옥스포드 · 베이지 치노 · 흰 스니커즈 → 웨빙 벨트" | 경미(아이비 서싱글 벨트로 허용 가능) | C6-08로 함께 정리 |
| 머플러 아우터 없음 / 봄가을 셔츠 재킷 | 84 / 다수 | "러스트 니트 · 인디고 · 흰 스니커즈 → 머플러 차콜" | 경미 | C6-15 |
| 여름 로퍼 + 바지색 양말(울 슬랙스) | 19 | "린넨 셔츠 · 차콜 울 슬랙스 · 블랙 로퍼 → 바지색 양말" | 허용 | C6-18 |
| 백팩 + 트렌치(F3.75~4) | 2 | "멜란지 맨투맨 · 인디고 · 흰 스니커즈 · 카멜 트렌치 → 백팩" | 경미(캐주얼 코디) | 없음 |
| 비니 여름 / 버킷햇 겨울 / 흰 양말 + 구두 / 샌들 양말 / 페이크삭스 겨울 | 0 | — | 정상 | — |
| 버건디 로퍼 벨트 없음 | 버건디 로퍼 카드 전부 | — | 누락 | C6-14 |

**Quick 클래식 카드에 소품을 제안할지(PM 질문)**: **텍스트 칩만, 그림에는 절대 그리지 않는다**에 동의하되 **S3 Quick 3장에는 소품 줄 자체를 두지 말 것**을 권고. 근거: (1) Quick은 "아침 2탭" 경로이고 소품은 점수 무영향 부가 정보 — 카드당 4.1줄이 S3 캡션 1줄 규약(UX 9절)을 깨뜨린다. (2) 현재 품질(C6-06·07·08·10)로는 Quick에서 신뢰를 깎는 쪽이 크다. (3) 엔진도 이미 Quick 기본 OFF다. S6 상세의 "소품" 접힘 섹션(설계 9절)에 한정하고, 거기서도 **벨트·양말·가방 3줄 상한**(모자·머플러는 겨울만)을 권한다.

---

## 6. 패턴 (`patterns: true`)

- 30 Deep 결과에서 패턴 변주 **57장**(브레통 27 · 잔줄 셔츠 20 · 하운드투스 10). 올리브 봄가을·겨울, 네이비 상의 겨울은 0장(허용색 밖) — 정상.
- 규칙 검사 **위반 0**: 패턴 아이템 ≤1(Quick `patterns:true` 비브레통 0, Deep 화면 카드에 2패턴 0), 브레통 하의·아우터 0, 계절·품목 허용 위반 0. outfits.json 패턴 코디는 o24·o25(브레통) 2행뿐이라 패턴+패턴 충돌 경로는 실데이터로 검증 불가(테스트 E-30만).
- 품질 문제: 하운드투스 10장(C6-11), 품목명 1건(C6-17). 잔줄 셔츠+블레이저(+1 ptStripeShirtBlazer)·브레통+네이비/베이지 하의(+1) 변주는 정의대로.
- 깅엄 변주 **0장**: `patternFor`가 patterns.json 순서로 첫 매치를 쓰는데 옥스포드 셔츠 white/lightBlue는 `stripeShirt`가 먼저 걸린다 → 깅엄(아이비 시그니처)은 영영 안 나온다. 권고: `patternFor`가 후보 패턴 목록을 돌려주고 `makePatternVariations`가 스타일 dominant에 맞는 것(ivy면 gingham, bizcasual이면 stripeShirt)을 고르거나, 카드당 1장 상한 안에서 두 번째 클래식 카드엔 다음 패턴을 쓴다(낮음).

## 7. 미드 레이어 (`layering: true`)

- 여름 0장, Quick 0장(8베이스 × 3계절) — 정상. 포멀도 ±2 경고·기장·무게 경고 **0**.
- **겨울 0장**(C6-04). 봄가을 19장: 퀼팅 베스트 15 · 가디건 3 · 니트 베스트 1, 클래식 티어 카드 0(`isClassic` 10장이지만 byTone·byHue·byOccasion에만 실림). 색 문제(C6-12).
- 가디건 3장은 정확("화이트 옥스포드 · 라이트 블루 가디건 · 차콜 울 슬랙스 · 척카 · 카멜 트렌치" 5/5). 니트 베스트 1장(옥스포드 + 흰 니트 베스트 + 블레이저) 정확.

## 8. 라벨

- 신규 shortLabel 51개 모두 **≤6자**(6자: 핀스트라이프·니트 베스트·퀼팅 베스트·셔츠위 니트·바지색 양말·뉴트럴 양말·브리프케이스). 맞춤법 오류 0. `style.*`·`occasion.*` 라벨·help·aliases 자연스러움(아메카지 alias "아메리칸 캐주얼", 고프코어 "아웃도어 룩" 포함 — 설계 9절 반영).
- `explain.style.<id>` 8줄 자연스러움. `explain.style.boost` "클래식·아이비 스타일 +0.4", `explain.style.tag` "미니멀 느낌" OK.
- 고칠 것: C6-13(격식 격식·"+0.28"), C6-10(소품 32문장 부재), C6-19(help 내부 id, "셔츠위 니트"), C6-22("수트는 2차", "운동·산책" 길이), `explain.midLayer` "{mid|은는} {reason}" → "퀼팅 베스트는 초봄·늦가을 미드. 팔 부피 없어 재킷 안에도 (4/5)"는 note 그대로라 S6용으로는 가능하나 "미드"가 사용자 용어가 아님 → note를 "초봄·늦가을에 좋은 겹옷. 팔이 두꺼워지지 않아요"로.

## 9. 기준 ①~⑦ (`check-v2.mjs`)

```
quick cards checked: 504 (168 chip×season)
PASS ① SEASON! (베이스 자체 원인 제외) = 0
PASS ② gap5 + lo ∈ {sneakerColor, running, sandal} = 0
PASS ③ 라벨에 'a-z'·'인디고 데님 울'·'(울슬랙스)' = 0
PASS ④ 모든 칩(baseColors × 3계절) 3장
PASS ⑤ 스타일 태그 분포 3%~60%, 태그 없음 0  (minimal 56 · ivy 50 · bizcasual 40 · amekaji 15 · cityboy 10 · workwear 6 · street 4 · gorpcore 4)
FAIL ⑥ 상황: 3장 + relaxed ≤ stage 2 비율 ≥ 90%
     quick+occasion 688/840 = 81.9% (stage0..4 = 603/0/85/112/40) · work 96% · weekend 100% · date 98% · active 76% · formal 40%
     deep byOccasion 687/840 = 81.8% (603/0/84/112/41) · 동일
PASS ⑦ 소품: 가죽 벨트 색이 신발 가죽 계열을 어기는 제안 0  (deep 카드 7,059 · 벨트 제안 4,593)
```

⑥은 C6-01·02 수정(거리 비례 감점 + formal/active stage 2 상한 + active 하의 재구체화) 후 재측정이 필요하다. formal은 수트 품목 없이도 "stage 2에서 멈추고 2장" 쪽이 "stage 4에서 3장"보다 낫다. ⑦은 통과했지만 벨트 밖 가죽 소품(C6-06)을 ⑦에 포함하면 FAIL(190장)이므로 ⑦ 정의 확장을 제안한다(`check-v2.mjs`에 `bag·watch` 가죽 색 추가 1줄).

## 10. Gate-4 이월 항목 — 확장 데이터로 풀리나

| 항목 | 확인 결과 | 판단 |
|---|---|---|
| 블랙 슬랙스 클래식 3장 신발 전부 블랙 | 스타일 4종·상황 5종 어떤 조합에서도 신발은 블랙 더비/로퍼 또는 흰 스니커즈(active)뿐. Deep 신발 종류 2종 | **풀리지 않음** — affinity는 재정렬만 하고 후보를 만들지 않는다. `scripts/build/r1.mjs` `black|bottom → shoes:chocolate 3 variation (A2 disputed)`·`burgundy 3` 행 추가(2차 데이터) |
| 라이트그레이·초콜릿·탄 하의 겨울 아우터 없음 | 겨울 quick 아우터 0, Deep+layering 아우터 0·mid 0(브라운은 아우터 12장 있음) | **풀리지 않음** — 아우터 colorRules 부재가 원인. r1 행 추가(lightGrey→outer navy/charcoal 4, chocolate·tan→outer navy/camel 4). C6-04가 해결돼도 아우터 없는 코디엔 겨울 mid(코트 전제)가 안 붙는다 |
| 겨울 데님 재킷(아우터 인디고) 허용 여부 | quick 3장 "울 니트 · 치노 · 데님 재킷"(태그 ivy/minimal — C6-05 수정 후 amekaji/workwear 기대). `twoOuterRules toDenimDuffle`(4 classic)가 있지만 2겹 카드 생성 0 | **콘텐츠 판단: 단독은 변주, 더플·발마칸 안에 넣으면 클래식**(YOKO·NTAME). 엔진: 겨울 + layering + 아우터 베이스가 denimJacket/leatherJacket/blouson/fleece면 `twoOuterRules` classic 행으로 바깥 아우터(duffle·balmacaan·puffer)를 붙인 2겹 후보 생성(`candidates.js` layering 분기에 ≤20장). 그 전까지 겨울 데님 재킷 단독 카드엔 `explain.seasonItem` 수준 경고 |
| 울 슬랙스 + 멜란지 티 격차 5 클래식 유지 | 차콜 여름 quick #2 "그레이 멜란지 티셔츠 · 차콜 울 슬랙스 · 블랙 페니 로퍼 gap5" 유지, **formal 상황에서도 2위**(C6-01) | 옵션 없는 Quick은 Phase 4 결정대로 유지. 상황이 붙으면 C6-01 거리 감점으로 자연히 밀린다 |
| P3-22 올블랙 −1, P3-25 midDenim 베이스 | 변동 없음 | 2차 |

---

## 11. 수정 권고 우선순위

| 순위 | 항목 | 분류 | 작업 |
|---|---|---|---|
| 1 | **C6-01·02** 격식·운동 완화 — 거리 비례 창 감점, formal/active stage 2 상한(3장 미만 허용 + 안내), active 울 하의 재구체화, formal avoid에서 linenShirt·poloPique 제거 | 엔진 + 데이터 | `style.js occasionWindow`, `recommend.js`·`groups.js groupByOccasion`, `candidates.js`, `occasions.json`, `constants.js OCC_WINDOW_FLOOR`. ⑥ 재측정 목표 ≥90% |
| 2 | **C6-03** byStyle 그룹 = 태그 포함 + norm 우선 정렬, 빈 그룹 허용 | 엔진 | `groups.js groupByStyle` (시뮬레이션 G1) |
| 3 | **C6-05** affinity 10셀(수정안 B) → `npm run build:data`로 태그 재계산, check ⑤ 확인 | 데이터 | `styleAffinity.json` |
| 4 | **C6-04·12** 겨울 레이어링(셔츠 재구체화 + 규칙 2행) · mid 색 허용 목록 | 엔진 + 데이터 | `candidates.js`, `midLayerRules.json`, `midTypes.json` |
| 5 | **C6-06·08·07·14·15** 소품: material null 통과 수정, 상황 기본값 색, 타입 formality 창 적용, 양말 delta, 버건디 벨트, 머플러 조건 | 엔진 + 데이터 | `style.js accWhen/suggestAccessories/fits`, `accessoryRules.json` 7행 |
| 6 | **C6-10·13·19·22** 라벨: `explain.acc.*` 32문장, 상황 문구 3개, help 4개, shortLabel 2개 | 라벨 | `labels.ko.json`, V-32 확장 |
| 7 | **C6-09** date≠work (deprioritize + date avoid dressShirt) | 엔진 + 데이터 | `groups.js`, `occasions.json` |
| 8 | **C6-11·17** 하운드투스 범위·패턴 품목명, 깅엄 변주 0 | 데이터/엔진 | `patterns.json`, `groups.js makePatternVariations`, `style.js patternFor` |
| 9 | Gate-4 이월: r1 행(블랙 슬랙스 신발, lightGrey·chocolate·tan 아우터), 2겹 아우터 생성 | 2차 데이터 | `scripts/build/r1.mjs`, `candidates.js` |

Quick 소품: S3에 소품 줄 없음(텍스트 칩도 없음), S6 접힘 섹션 3줄 상한 — UX 결정으로 넘김.
