# 추천 엔진 사양 (engine-spec)

작성일: 2026-10-19 · 버전 v1.0 · 작성: C1 · 구현: C2 (`src/engine/*.js`)
전제: 순수 함수, 프레임워크·DOM 접근 없음, 입력은 `data-schema.md`의 JSON. 같은 입력에 같은 출력(결정적). 난수 금지.

---

## 1. 입출력

### 1-1. 입력

```ts
Query {
  base: BaseItem          // 사용자가 고른 기준 아이템
  season: Season          // "springFall" | "summer" | "winter"
  mode: "quick" | "deep"
}
BaseItem {
  category: Category      // top | bottom | shoes | outer
  color: string           // colors.id
  material?: string|null  // Deep에서만. 없으면 6절 기본값
  fit?: string|null       // Deep에서만
  shoeType?: string|null  // category === "shoes"일 때
  itemType?: string|null  // top/outer일 때 (topType/outerType)
}
```

### 1-2. 출력

```ts
RecommendResult {
  mode, base, season,
  classic: Candidate[]            // 항상 3개 (Quick·Deep 공통)
  byTone?: ToneGroup[]            // Deep만. 순서: neutral, earth, mono, navyBase, accent, pastel
  byHue?: HueGroup[]              // Deep만. analogous, complementary, achromatic
  variations?: Variation[]        // Deep만. 3~5 × classic 카드 수, 중복 제거
  stats: { candidates: number, ms: number }
}
Candidate { outfit: Outfit, score: OutfitScore, explain: string[] }
ToneGroup { tone: string, labelKey: "tone.<id>", candidates: Candidate[] }   // 각 ≤ 5
HueGroup  { relation: "analogous"|"complementary"|"achromatic", labelKey: "explain.<relation>", candidates: Candidate[] }
Variation { fromOutfitId: string, swapped: { category, from: OutfitItem, to: OutfitItem }, candidate: Candidate }
```

`Outfit`·`OutfitItem`은 data-schema 4-15와 동일 구조. 엔진이 만든 코디는 `id: "g-<hash>"`, `generated: true`, `sources: []`, `isClassic`은 구성 match가 전부 classic이면 true.

```ts
OutfitScore {
  final: number            // 1.0 ~ 5.0, 소수 2자리
  percent: number          // round((final - 1) / 4 * 100)  → UI "안전도 92"
  blocked: boolean
  color:  AxisScore        // 2절
  style: { fit, len, mat, shoe, outer, season, adjust, formality: AxisScore }
  reasons: Reason[]        // 모든 축의 reasons 합본 (설명 문구용, severity 순)
  warnings: Reason[]       // severity === "warn"
  blockReasons: Reason[]   // severity === "block"
}
AxisScore { axis: string, score: number, weight: number, reasons: Reason[] }
Reason { key: string, params?: Record<string, string|number>, delta?: number, severity: "info"|"warn"|"block", sources?: string[] }
```

---

## 2. 색 축 (R1 9-4 기반)

평가 대상 쌍 `P` (면적 큰 순):
1. `bottom ↔ top`
2. `bottom ↔ shoes`
3. `bottom ↔ outer` (outer가 있을 때. outer 2개면 바깥쪽 `layer: 2`)
4. `top ↔ outer` (outer가 있을 때, 가중 0.5)

### 2-1. 쌍 점수 `pairScore(a, b)`

```
rule = colorRules[a.color | a.category]           // a가 bottom 또는 top 베이스일 때
  → rule.matches[b.category | b.color].score
없으면 rule = colorRules[b.color | b.category] → matches[a.category | a.color]
둘 다 없으면 3, reason { key: "explain.ruleMissing", severity: "info" }
```
- score 1 → `severity: "block"`, reason `explain.avoid`(avoid.reason 또는 match.note).
- score 2 → `severity: "warn"`, reason `explain.adventurous`.
- match.flags에 `disputed` → reason `explain.disputed`(info).
- match.tag·sources는 reason params로 전달(`{tag, sourceCount}`) → "출처 N개".

### 2-2. 톤 보정 `toneModifier(colorA, colorB)`

두 색의 `tones[]` 데카르트곱의 각 톤 쌍에 toneRules.rules(무방향)를 적용, **0이 아닌 modifier를 합산**한 뒤 −2..+1로 clamp. 예: black[neutral,mono] × brown[neutral,earth] → T5 mono↔earth −1 → −1. beige[neutral,earth] × navy[neutral,navyBase] → T3 +1.
- 두 색이 같은 톤 그룹을 하나라도 공유하고 색 id가 다르면 reason `explain.toneOnTone`(info, 보정 없음 — 톤온톤은 설명용).
- 두 색이 모두 `accent` → `toneRules.accentAccent`(−2) 추가.

### 2-3. 계절 보정 `seasonModifier(items, season)`

각 아이템 색에 대해 `season ∉ color.seasons`이면 −1, 그 색이 `accent` 톤이면 −2. 합산 후 **−2로 clamp**. reason `explain.seasonOut {color}`(warn).

### 2-4. 색 축 합산

```
colorScore = clamp( mean(P의 pairScore, outer쌍은 가중 평균)
                  + clamp(Σ toneModifier(P), -2, +1)
                  + seasonModifier, 1, 5 )
```
3색 초과 패널티와 같은 색 상·하 패널티는 **여기 넣지 않는다** — adjust.json(`adjFourColors`, `adjSameColorTopBottom`)이 스타일 축에서 한 번만 적용(data-schema 4-14).

색상환 관계(R1 3장, toneRules.hue)는 점수에 쓰지 않고 **설명·그룹핑에만** 쓴다(R1 9-3).

---

## 3. 스타일 축 (R2 9장 기반)

모든 축은 1~5. 표에 없으면 3. 어떤 축이든 **1이면 block**(R2 0-6).

### 3-1. 핏 `fit`
`fitRules[top.fit | bottom.fit].score`. outer·shoes는 핏 없음.

### 3-2. 기장 `len`
`mean( lengthRules[top|top.length|bottom.fit], lengthRules[outer|outer.length|bottom.fit] (outer 있을 때), lengthRules[trouser|bottom.length|bottom.fit] )`.

### 3-3. 소재 `mat`
쌍: top↔bottom, bottom↔shoes, bottom↔outer, top↔outer. `material === null`인 쪽이 있는 쌍은 **제외**. 남은 쌍이 없으면 3. `matRules[a].pairsWith[b].score`의 평균. 쌍 점수 ≤ 2 → warn(`explain.matClash {a, b}`), 1 → block.

### 3-4. 신발 `shoe`
```
rows = shoeRules[shoe].bottoms
exact = rows.find(material, fit, length 정확 일치)
if exact → base = exact.score, lengthUsed = true
else   → base = rows.find(material, fit, "*") ?? rows.find(material, "*", "*") ?? 3
lenScore = shoeRules[shoe].lengths[bottom.length].score
shoe = lengthUsed ? base : round2((base + lenScore) / 2)
```
reason: `explain.shoeScore {shoe, score}`; `lenScore ≤ 2` → warn `explain.shoeLength`.

### 3-5. 아우터 `outer` (outer 있을 때만, 가중 0.7)
`mean( outerRules[outer].bottoms lookup(material, fit) (우선순위: 정확 → (material,*) → (*,fit) → 3), outerRules[outer].shoes[shoe].score ?? 3 )`. outer가 2개면 바깥쪽(layer 2)만 평가. outer 없으면 축 자체를 뺀다(가중치 합에서도 제외).

### 3-6. 계절 적합 `season`
아이템별 계절 집합: bottom·top·outer는 `materials[material].seasons`(material null이면 top은 topType 기본 material, outer는 outerTypes.seasons), shoes는 `shoes[shoeType].seasons`. 계절 밖 아이템 수 `k` → `season = max(1, 5 − 2k)`. k ≥ 1이면 warn `explain.seasonItem {item}`.
추가: `layerRules[season].maxLayers`보다 레이어가 많으면(여름에 outer 2개 등) −2.

### 3-7. 가감점 `adjust`
`adjust.json`의 각 규칙에 대해 `when`의 모든 키가 일치(배열은 OR)하면 `delta` 합산. 파생 속성 계산:
- `materialWeights`: 코디의 non-null 소재 weight 집합. 규칙값 배열이 집합에 **모두 포함**될 때 일치.
- `colorCountMin`: 서로 다른 color id 수(단, shoes가 neutral 톤이면 세지 않음 — R1 3장 "4번째가 작은 뉴트럴이면 허용") ≥ 값.
- `sameColorTopBottom`: top.color === bottom.color.
- `hasOuter`: outer 존재 여부.
각 일치 규칙은 reason `explain.adjust {id}` + delta. `flags: disputed`면 severity info로 문구만.

### 3-8. 포멀도 `formality`
아이템별 level = `formality[category | id]` (bottom은 material, shoes는 shoeType, top·outer는 itemType; `when.fit` 일치 행 우선). 어떤 아이템에 행이 없으면 그 아이템은 제외.
```
gap = max(level) − min(level)
gap ≥ 5 → block (단 outfit.tags ∋ "variation"이면 warn + penalty 2)
gap == 4 → warn, penalty 1
else      → penalty 0
```
reason `explain.formalityGap {gap, hi, lo}`. 축 점수로는 `formality = 5 − penalty`(표시용), 합산에는 `−penalty`로 들어간다.

### 3-9. 스타일 축 합산

```
W = { fit: 1.0, len: 0.7, mat: 1.0, shoe: 1.0, outer: 0.7, season: 1.5 }   // outer는 있을 때만
styleRaw  = Σ W[axis] × score[axis] + Σ adjust.delta − formality.penalty
styleNorm = clamp( styleRaw / Σ W[사용한 축], 1, 5 )
```
Σ W = 5.2(아우터 없음) / 5.9(있음). adjust·penalty는 정규화 전에 더해 **한 단계(=1점) 가감**이 되게 한다. 정확히는 `(Σadjust − penalty) / ΣW × ΣW`… 이 아니라 단순히 raw에 더한 뒤 ΣW로 나누므로 delta 1 ≈ 0.17~0.19점. 의도한 체감("한 단계")이 약하므로 **adjust·penalty에는 계수 `K_ADJ = 2.5`를 곱한다**: `styleRaw = ΣW·score + K_ADJ·(Σadjust − penalty)` → delta 1 ≈ 0.45점.

### 3-10. 최종

```
W_COLOR = 1.5, W_STYLE = 1.0
final   = (W_COLOR × colorScore + W_STYLE × styleNorm) / (W_COLOR + W_STYLE)
percent = round((final − 1) / 4 × 100)
blocked = 색 쌍 1 ∥ 스타일 축 1 ∥ 포멀도 gap ≥ 5(비변주) ∥ 소재 쌍 1
```
색 가중을 더 두는 이유: MVP 핵심 기능 A가 컬러 매칭이고 Quick 경로 입력이 색 하나이기 때문(계획서 2-1). 정렬: `blocked` 제외 → `final` 내림차순 → 동점이면 `universal` → `isClassic` → `sources.length` → `outfit.id`.

상수는 `src/engine/constants.js` 한 곳에: `WEIGHTS`, `W_COLOR`, `W_STYLE`, `K_ADJ`, `FORMALITY_WARN = 4`, `FORMALITY_BLOCK = 6`(통합 결정 D1, 종전 5; `isClassic && sources ≥ 2`는 차단 면제), `SEASON_COLOR_PENALTY = {out: -1, accentOut: -2}`, `DEFAULT_SCORE = 3`.

---

## 4. 설명 문구 (explain)

엔진은 **키와 파라미터**만 돌려주고 한국어 문장은 `labels.ko.json`의 `explain.*`에서 가져온다(팀5가 문구 수정 가능). `explain.js`에는 라벨이 없을 때의 **기본 한국어 폴백**을 둔다.

| key | 기본 문구 | 발생 조건 |
|---|---|---|
| `explain.classic` | 클래식 | 모든 색 쌍 tag classic |
| `explain.universal` | 누구나 안전한 기본 조합 | outfit.universal |
| `explain.variation` | 변주 | 색 쌍 중 variation 있음 또는 tags ∋ variation |
| `explain.sources2` | 출처 {n}개 이상 | 쌍 중 최소 sourceCount ≥ 2 → n = 그 값 |
| `explain.toneOnTone` | 톤온톤 ({tone}) | 2-2 |
| `explain.analogous` | 유사색 | 5-3 |
| `explain.complementary` | 보색(탁한) | 5-3 |
| `explain.achromatic` | 무채색 조합 | 5-3 |
| `explain.toneCross` | {from}+{to} 조합 (+1) | toneModifier > 0 |
| `explain.seasonOut` | {color}는 {season}에 어색해요 (−1) | 2-3 |
| `explain.seasonItem` | {item}는 {season}용이 아니에요 | 3-6 |
| `explain.formalityGap` | 격식 차이 {gap}단계 ({hi} ↔ {lo}) | 3-8 |
| `explain.fourColors` | 색이 4개 이상 | adjFourColors |
| `explain.sameColor` | 상·하의 같은 색 | adjSameColorTopBottom |
| `explain.fitScore` | 핏 밸런스 {score}/5 | 항상 (Deep 카드 상세) |
| `explain.shoeScore` | 신발 조합 {score}/5 | 항상 |
| `explain.matScore` | 소재 궁합 {score}/5 | 소재 쌍 ≥ 1 |
| `explain.matClash` | {a}+{b}는 소재가 안 맞아요 | 3-3 |
| `explain.adventurous` | 모험적인 조합 | 쌍 점수 2 |
| `explain.avoid` | 피하는 조합: {reason} | 쌍 점수 1 / avoid |
| `explain.disputed` | 의견이 갈리는 조합 | flags disputed |
| `explain.ruleMissing` | 규칙 없음(기본 3) | 2-1 |
| `explain.adjust` | {reason} ({delta:+d}) | 3-7 (reason은 adjust.reason) |

`explainScore(score, labels)` → `string[]`: Quick 카드는 앞 **2개**만 노출(`classic/universal` → `toneOnTone/complementary/...` → `sources2` 우선순위), Deep 카드 상세는 전부. 숫자 포맷은 `{delta:+d}` → "+1"/"−1".

---

## 5. 후보 생성과 모드

### 5-1. Quick (`mode: "quick"`) — 카드 3개 고정

```
1. hits = outfits.json 중 universal === true
          && items에 base와 같은 (category, color) 아이템 존재
          && season ∈ outfit.seasons
   (base.material·shoeType·itemType이 주어지면 그것도 일치해야 함)
2. hits를 scoreOutfit으로 점수화 → 정렬 → 상위 3
3. 3개 미만이면 generateCandidates(base, season)에서
   색 쌍이 전부 score 5 && classic 인 후보만 골라 점수순으로 채움
4. 그래도 3개 미만이면 score ≥ 4 classic으로 완화. 그래도 부족하면 있는 만큼(최소 1개 보장: 규칙 없으면 기본 템플릿)
```
Quick 결과에는 `byTone/byHue/variations`를 넣지 않는다. 같은 (base, season)에 대해 항상 같은 3장(결정적).

### 5-2. Deep (`mode: "deep"`)

`classic`은 Quick과 동일 3장. 추가로:

**후보 생성 `generateCandidates(index, base, season, opts)`**
```
bottoms = base.category === "bottom" ? [base]
        : base.category === "top"   ? colorRules[base.color|top].matches(category bottom, score ≥ 3)
        : 역조회: 모든 bottom 베이스 중 matches[base.category | base.color].score ≥ 3 인 것
각 bottom에 대해
  tops   = base.category === "top" ? [base] : colorRules[bottom.color|bottom].matches(top, ≥3)       (≤ 13)
  shoes  = base.category === "shoes" ? [base] : matches(shoes, ≥3)                                    (≤ 6)
  outers = [없음] ∪ (season === "summer" ? [] : matches(outer, ≥4) 상위 4)
           base.category === "outer"면 [base]만
  조합 = tops × shoes × outers  → OutfitItem으로 구체화(6절 기본값) → scoreOutfit
blocked 제외, final 내림차순, 상한 opts.max (기본 300)
```
아이템 구체화 시 색 id 중복(상·하 같은 색)은 후보에서 제외하지 않고 점수에 맡긴다(adjust가 −2).

**톤별 `groupByTone`**: 후보의 **top과 bottom 색이 공유하는 톤 그룹 g**가 있으면 그룹 g에 넣는다(둘 이상 공유하면 전부). `accent` 그룹은 예외로 "아이템 중 정확히 하나가 accent 톤"인 후보. 각 그룹 점수순 상위 5. 빈 그룹은 결과에서 뺀다.

**색상별 `groupByHue`**: base 색과 **상대 아이템**(base가 bottom이면 top, 그 외엔 bottom)의 관계로 분류:
- `analogous`: 같은 `hue.analogous` 그룹
- `complementary`: `hue.complementary`의 (a,b) 쌍에 속함(그룹 id는 소속 전체로 확장)
- `achromatic`: 상대 색이 `hue.achromatic`에 포함 (base가 무채색이면 상대가 유채색이어도 여기)
- 그 외는 분류하지 않음. 각 상위 5.

**변주 `makeVariations`**: classic 카드 각각에 대해 base가 아닌 카테고리 하나씩(top → shoes → outer 순) 그 자리의 색을 colorRules에서 **다음 순위 match(score ≥ 3, 현재 카드·다른 classic 카드에 없는 색)**로 바꾼 코디를 만든다. 아이템 하나만 바뀌고 나머지는 동일. 카드당 최대 5개, 전체에서 시그니처(`category:color:material:shoeType` 정렬 문자열) 중복 제거. blocked 제외. 점수순.

### 5-3. Deep 탭 수 보장
D1 와이어프레임 기준: 결과 → "더 보기" → 탭(톤별|색상별|변주) → 카드 → 칩 상세 = 4탭 ≤ 6. 엔진은 한 번의 `recommend()`로 세 그룹을 다 돌려주므로 탭 전환 시 재계산 없음.

---

## 6. 아이템 구체화 기본값 (색만 주어졌을 때)

| 카테고리 | material | fit | length | itemType / shoeType |
|---|---|---|---|---|
| bottom | 색→소재 표(data-schema 4-15): indigo→denimIndigo, lightDenim·midDenim→denimWashed, blackDenim→denimBlack, beige·khaki·navy·olive·white·cream→chino, midGrey·charcoal·black→wool, brown→corduroy | 소재별: denim*→straight, chino·wool→tapered, 그 외 regular | nobreak | — |
| top | 계절별: summer→jersey(tee), springFall→knitCotton(knitCotton), winter→knitWool(knitWool). lightBlue·white 셔츠색이면 springFall은 oxfordShirt(null) | regular | regular | 왼쪽 |
| shoes | 색→신발: white→sneakerWhite(leather), brown·chocolate·tan→계절별 chukka(springFall)/workboot(winter)/loaferPenny(summer), black→derby(springFall·winter)/sneakerColor(summer), burgundy→loaferPenny, navy→sneakerColor | — | — | 왼쪽 |
| outer | 계절별 후보 순서 springFall→[blazer, shirtJacket, denimJacket, trench], winter→[chesterfield, peacoat, duffle, leatherJacket]; camel·beige 색이면 trench/chesterfield 우선. outerType의 material·length 사용 | — | outerType.length | 왼쪽 |

이 표는 `src/engine/constants.js`의 `DEFAULTS`로 둔다. 사용자가 Deep에서 소재·핏을 고르면 그 값이 우선.

---

## 7. 성능과 사전 계산 결정

- **런타임 계산, 빌드 타임 사전 계산 없음.** 근거: 최악 후보 수 ≈ 13 tops × 6 shoes × 5 outers = 390(하의 베이스) / 8 bottoms × 6 × 5 = 240(상의 베이스). 코디 하나 점수화는 Map 조회 ~15회 → 수 µs. 전체 < 5ms(목표 < 10ms, 측정값을 `stats.ms`로 반환).
- `buildIndex(data)`는 앱 시작 시 1회(< 5ms). `recommend()` 결과는 `(base 시그니처, season, mode)` 키로 **메모이즈**(Map, 최대 20개 LRU) — 탭 전환·뒤로가기 재계산 방지.
- 2차에서 옷장 필터·날씨가 붙어 후보가 10배가 되면 `scripts/precompute.mjs`로 Quick 3장만 `src/data/quick.json`에 미리 구워 둘 수 있게 `pickClassic`을 독립 함수로 유지한다. MVP에서는 만들지 않는다.
- 데이터는 번들 정적 import(tech-stack 1절). 엔진 모듈은 `import { data } from '../data/index.js'`를 **하지 않고** 인자로 받는다(테스트에서 가짜 데이터 주입).

---

## 8. 함수 시그니처 (JSDoc) — `src/engine/`

```js
// ---------- types.js (JSDoc 전용, 런타임 코드 없음) ----------
/** @typedef {'top'|'bottom'|'shoes'|'outer'} Category */
/** @typedef {'springFall'|'summer'|'winter'} Season */
/** @typedef {'quick'|'deep'} Mode */
/**
 * @typedef {object} BaseItem
 * @property {Category} category
 * @property {string} color
 * @property {string|null} [material]
 * @property {string|null} [fit]
 * @property {string|null} [shoeType]
 * @property {string|null} [itemType]
 */
/**
 * @typedef {object} OutfitItem
 * @property {Category} category
 * @property {string} color
 * @property {string|null} material
 * @property {string|null} fit
 * @property {string|null} length
 * @property {string|null} shoeType
 * @property {string|null} itemType
 * @property {string} itemName
 * @property {string|null} [pattern]
 * @property {1|2} [layer]
 */
/**
 * @typedef {object} Outfit
 * @property {string} id
 * @property {OutfitItem[]} items
 * @property {Season[]} seasons
 * @property {string[]} tags
 * @property {boolean} isClassic
 * @property {boolean} universal
 * @property {string[]} sources
 * @property {string[]} flags
 * @property {string} [note]
 * @property {boolean} [generated]
 * @property {string[]} [mergedFrom]
 */
/** @typedef {{ key: string, params?: Record<string, string|number>, delta?: number, severity: 'info'|'warn'|'block', sources?: string[] }} Reason */
/** @typedef {{ axis: string, score: number, weight: number, reasons: Reason[] }} AxisScore */
/**
 * @typedef {object} OutfitScore
 * @property {number} final
 * @property {number} percent
 * @property {boolean} blocked
 * @property {AxisScore} color
 * @property {{ fit: AxisScore, len: AxisScore, mat: AxisScore, shoe: AxisScore, outer: AxisScore|null, season: AxisScore, adjust: AxisScore, formality: AxisScore }} style
 * @property {Reason[]} reasons
 * @property {Reason[]} warnings
 * @property {Reason[]} blockReasons
 */
/** @typedef {{ outfit: Outfit, score: OutfitScore, explain: string[] }} Candidate */
/** @typedef {{ tone: string, labelKey: string, candidates: Candidate[] }} ToneGroup */
/** @typedef {{ relation: 'analogous'|'complementary'|'achromatic', labelKey: string, candidates: Candidate[] }} HueGroup */
/** @typedef {{ fromOutfitId: string, swapped: { category: Category, from: OutfitItem, to: OutfitItem }, candidate: Candidate }} Variation */
/** @typedef {{ base: BaseItem, season: Season, mode: Mode }} Query */
/**
 * @typedef {object} RecommendResult
 * @property {Mode} mode
 * @property {BaseItem} base
 * @property {Season} season
 * @property {Candidate[]} classic
 * @property {ToneGroup[]} [byTone]
 * @property {HueGroup[]} [byHue]
 * @property {Variation[]} [variations]
 * @property {{ candidates: number, ms: number }} stats
 */
/** @typedef {{ rule: string, severity: 'error'|'warn', message: string, path: string }} ValidationIssue */
/** @typedef {object} DataIndex  — buildIndex()가 만드는 Map 묶음. 내부 구조는 lookup.js가 소유 */
/** @typedef {Record<string, string>} Labels  — labels.ko.json을 id→label로 펼친 것 */

// ---------- lookup.js ----------
/** @param {object} data  data/index.js의 data 객체 @returns {DataIndex} */
export function buildIndex(data) {}
/** @returns {{ score: number, tag: 'classic'|'variation'|null, sources: string[], flags: string[], note: string, found: boolean }} */
export function colorPair(index, a /** @type {OutfitItem} */, b /** @type {OutfitItem} */) {}
/** @returns {{ modifier: number, sharedTones: string[], rulesHit: string[] }} */
export function toneModifier(index, colorA, colorB) {}
/** @returns {number} 1~5 */
export function fitScore(index, topFit, bottomFit) {}
/** @param {'top'|'outer'|'trouser'} kind @returns {number} */
export function lengthScore(index, kind, length, bottomFit) {}
/** @returns {{ score: number, note: string }} */
export function matPair(index, materialA, materialB) {}
/** @param {OutfitItem} bottom @returns {{ score: number, exact: boolean, lenScore: number, note: string }} */
export function shoeScore(index, shoeType, bottom) {}
/** @returns {{ score: number, note: string }} */
export function outerScore(index, outerType, bottom, shoeType) {}
/** @returns {number|null} */
export function formalityLevel(index, item /** @type {OutfitItem} */) {}

// ---------- score.js ----------
/** @returns {OutfitScore} */
export function scoreOutfit(index, outfit /** @type {Outfit} */, season /** @type {Season} */) {}
/** @returns {AxisScore} */
export function scoreColorAxis(index, outfit, season) {}
/** @returns {OutfitScore['style']} */
export function scoreStyleAxes(index, outfit, season) {}
/** @returns {{ gap: number, hi: OutfitItem|null, lo: OutfitItem|null, penalty: number, blocked: boolean }} */
export function formalityGap(index, outfit) {}

// ---------- candidates.js ----------
/** @returns {Outfit[]}  blocked 제외·정렬 전(점수는 호출자가) */
export function generateCandidates(index, base /** @type {BaseItem} */, season, opts = { max: 300 }) {}
/** 색만 있는 BaseItem/색 id를 6절 기본값으로 OutfitItem으로 @returns {OutfitItem} */
export function materialize(index, category, color, season, overrides = {}) {}
/** @returns {Candidate[]}  항상 ≤ n, 결정적 */
export function pickClassic(index, base, season, n = 3) {}
/** @returns {string}  "bottom:indigo:denimIndigo|shoes:white:sneakerWhite|top:white:jersey" */
export function outfitSignature(outfit) {}

// ---------- groups.js ----------
/** @returns {ToneGroup[]} */
export function groupByTone(index, candidates /** @type {Candidate[]} */, base, perGroup = 5) {}
/** @returns {HueGroup[]} */
export function groupByHue(index, candidates, base, perGroup = 5) {}
/** @returns {Variation[]} */
export function makeVariations(index, classic /** @type {Candidate[]} */, base, season, opts = { perCard: 5 }) {}

// ---------- explain.js ----------
/** @returns {string[]}  한국어 문장 배열, 우선순위 정렬 */
export function explainScore(score /** @type {OutfitScore} */, labels /** @type {Labels=} */) {}
/** @returns {string}  한 개의 Reason → 문장 (폴백 포함) */
export function formatReason(reason /** @type {Reason} */, labels) {}

// ---------- recommend.js ----------
/** @returns {RecommendResult} */
export function recommend(index, query /** @type {Query} */) {}

// ---------- validate.js ----------
/** data-schema.md 8절 V-01~V-22 @returns {ValidationIssue[]} 빈 배열이면 통과 */
export function validateData(data) {}

// ---------- index.js ----------
/**
 * 앱이 쓰는 유일한 진입점. 인덱스 생성 + 메모이즈.
 * @returns {{ recommend: (q: Query) => RecommendResult, score: (o: Outfit, s: Season) => OutfitScore,
 *             explain: (s: OutfitScore) => string[], index: DataIndex, labels: Labels }}
 */
export function createEngine(data) {}
export { recommend, scoreOutfit, generateCandidates, pickClassic, groupByTone, groupByHue, makeVariations, explainScore, validateData, buildIndex };
```

---

## 9. 테스트 케이스 (`tests/engine.test.js`, node:test) — C2 구현 완료 기준

| # | 입력 | 기대 |
|---|---|---|
| E-01 | `{base:{category:"bottom",color:"indigo"}, season:"springFall", mode:"quick"}` | classic 3개, 첫 장 = 흰 티+인디고+흰 스니커즈(o01), 전부 `universal` |
| E-02 | 같은 쿼리 2회 | 결과 동일(deep-equal) |
| E-03 | 12개 bottom 베이스 × 3계절 × quick | 항상 3개, blocked 0 |
| E-04 | running + wool 슬랙스 코디 | blocked, blockReasons에 formalityGap gap 6 |
| E-05 | oxford + chino tapered | warnings에 formalityGap 4, not blocked |
| E-06 | sneakerWhite + wool | warn 4 |
| E-07 | hoodie(oversized) + wool + tags [variation] | warn(변주 완화), not blocked |
| E-08 | o01(흰 티+인디고+흰 스니커즈) springFall | final ≥ 4.5, explain[0] ∈ {클래식, 누구나 안전한 기본 조합} |
| E-09 | black 티 + blackDenim, summer | adjSummerBlackBlack + sameColor? (black ≠ blackDenim이므로 sameColor 아님) → delta −1만 |
| E-10 | white 티 + white 치노 | adjSameColorTopBottom −2 적용 |
| E-11 | charcoal 슬랙스 + tan 신발 | 색 쌍 1 → blocked (A7) |
| E-12 | lightDenim + black 더비 | 색 쌍 2 → warn `adventurous` |
| E-13 | beige 치노 + navy 니트 | toneModifier +1, explain에 "보색" 또는 "{from}+{to}" |
| E-14 | indigo + rust 니트 deep | byHue.complementary에 포함 |
| E-15 | indigo + lightBlue 셔츠 deep | byHue.analogous에 포함, explain "톤온톤" 또는 "유사색" |
| E-16 | deep, indigo | variations 각 항목이 classic 카드와 정확히 한 아이템만 다름 |
| E-17 | deep, 임의 베이스 | stats.ms < 10 (CI에서는 < 50) |
| E-18 | winter, lightDenim 베이스 | 색 축 seasonModifier −1, explain에 seasonOut |
| E-19 | summer, outer 2개 코디 | layer 초과 −2 |
| E-20 | `validateData(data)` | 빈 배열 |

---

## 10. 구현 순서 권장 (C2)

1. `validate.js` + `scripts/validate-data.mjs` — 데이터 넣으면서 바로 돌린다.
2. `lookup.js` (buildIndex, 각 축 조회) → 단위 테스트.
3. `score.js` → E-04~E-13.
4. `candidates.js` `pickClassic` → E-01~E-03 (Quick 경로 먼저 끝내면 C3·C1이 통합 시작 가능).
5. `groups.js`, `explain.js`, `recommend.js` → 나머지.

---

## 11. C2 구현 메모 (Phase 3, 2026-10-19) — 상세는 `data-conversion-log.md` 4절

1. **E-20**은 `validateData(data)`의 **error 0건**이 기준(warning 45건은 변환 로그 5절).
2. **3-7 `materialWeights`**는 신발 소재를 제외한 집합(가죽=heavy가 모든 코디에 걸리는 문제, E-09 충족).
3. **6절 상의 기본값**: 여름 + 포멀도 ≥6 하의(울·플란넬)는 `poloPique`(셔츠색이면 `linenShirt`). 티셔츠(2)면 격차 5로 전부 차단되어 E-03이 깨짐. `DEFAULTS.topFormalSummer`.
4. **5-1 Quick 3장**은 gate-2 3절 2항 규칙: 풀 순서(universal 히트 → 전 쌍 5·classic → ≥4·classic → 나머지, 각 final 내림차순)에서 톤 그룹이 겹치지 않게, 3장째는 신발 색이 2종 이상 되게 고른다(못 채우면 단계적 완화). 같은 입력엔 항상 같은 3장.
5. `explainScore(score, labels, outfit?)`: outfit을 주면 `explain.universal`/`explain.variation` 포함. 추가 export: `explainShort`, `captionOutfit`, `itemCaption`(gate-2 8항 소재 생략 규칙), `materialize`, `outfitSignature`. `createEngine()`은 `caption`, `itemCaption`, `materialize`, `explainShort`도 돌려준다.
6. reason 키 추가: `explain.accentAccent`, `explain.outerScore`, `explain.shoeLength`, `explain.layerOver`, `explain.lengthBlock`, `explain.seasonBlock`. `style.formality`에 `gap/penalty/blocked`, `color.detail`에 `mean/toneMod/seasonMod/allClassic/minPair`, `OutfitScore.styleNorm`.
7. **성능**: quick(히트만) 0.5~2 ms, 역조회·deep 15~27 ms(후보 300). 테스트 기준 < 50 ms(CI). 10 ms 목표가 필요하면 `CANDIDATE_MAX`를 150으로.
8. `src/data/index.js`의 JSON import는 `with { type: 'json' }`(Node 22 직접 실행용, Vite 호환).
