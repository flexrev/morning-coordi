// 후보 생성·Quick 카드 — engine-spec.md 5·6절 + gate-2 3절 2항(클래식 3 선정 규칙). 구현: C2.
// Phase 4 수정: P3-01(역참조 생성) · P3-02(quick 풀 제외) · P3-03/06/P1-04(계절·tier 3 제외) · P3-04/05/08(구체화) · P3-07/13/20, P1-05/17(클래식 3 다양성)
import { DEFAULTS, QUICK_CARDS, CANDIDATE_MAX, OUTER_CANDIDATES, QUICK_EXCLUDE_GAP, QUICK_EXCLUDE_LO_SHOES } from './constants.js';
import { scoreOutfit } from './score.js';
import { explainScore } from './explain.js';

const CAT_ORDER = { top: 0, bottom: 1, shoes: 2, outer: 3 };
const scoreCache = new WeakMap(); // outfit → { season → OutfitScore }

/** 같은 outfit 객체·계절이면 점수 재계산 없음 */
export function cachedScore(index, outfit, season) {
  let m = scoreCache.get(outfit);
  if (!m) { m = new Map(); scoreCache.set(outfit, m); }
  if (!m.has(season)) m.set(season, scoreOutfit(index, outfit, season));
  return m.get(season);
}

function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/** @returns {string}  "bottom:indigo:denimIndigo|shoes:white:sneakerWhite|top:white:jersey" */
export function outfitSignature(outfit) {
  return [...outfit.items]
    .sort((a, b) => a.category.localeCompare(b.category) || (a.layer ?? 0) - (b.layer ?? 0))
    .map((i) => `${i.category}:${i.color}:${i.category === 'shoes' ? i.shoeType : i.category === 'outer' ? i.itemType : (i.material ?? i.itemType)}`)
    .join('|');
}

const label = (index, id, fallback) => index.labels.get(id)?.label ?? fallback;
const colorName = (index, color) => label(index, `color.${color}`, color);
const bySeason = (v, season) => (v && typeof v === 'object' ? v[season] : v);
const matFormality = (index, material) => (material ? index.materials.get(material)?.formality ?? 0 : 0);

/** 색만 있는 BaseItem/색 id를 6절 기본값으로 OutfitItem으로 @returns {import('./types.js').OutfitItem} */
export function materialize(index, category, color, season, overrides = {}) {
  const ov = overrides ?? {};
  const cl = colorName(index, color);
  if (category === 'bottom') {
    const material = ov.material ?? bySeason(DEFAULTS.bottomMaterialByColor[color], season) ?? DEFAULTS.bottomMaterialFallback;
    const fit = ov.fit ?? DEFAULTS.bottomFitByMaterial[material] ?? DEFAULTS.bottomFitFallback;
    const length = ov.length ?? DEFAULTS.bottomLength;
    // 품목명: '인디고'+'인디고 데님' → '인디고 데님', '라이트워시 데님'+'워시드 데님' → '라이트워시 데님', '차콜'+'울' → '차콜 울 슬랙스' (P3-05·P3-10)
    const mName = DEFAULTS.bottomNameByMaterial[material] ?? label(index, `material.${material}`, material);
    const itemName = mName.includes(cl) ? mName : cl.includes('데님') && mName.includes('데님') ? cl : `${cl} ${mName}`;
    return { category, color, material, fit, length, shoeType: null, itemType: null, itemName, pattern: null };
  }
  if (category === 'top') {
    let itemType = ov.itemType ?? null;
    let material = ov.material ?? null;
    if (!itemType) {
      const formalBottom = matFormality(index, ov.forBottom) >= DEFAULTS.topFormalBottomMin;
      const byColor = bySeason(DEFAULTS.topTypeByColor[color], season);
      if (byColor) [itemType, material] = [byColor, index.topTypes.get(byColor)?.material ?? null];
      else if (DEFAULTS.topShirtColors.includes(color) && season === 'springFall') [itemType, material] = DEFAULTS.topShirt;
      else if (formalBottom && season === 'summer') [itemType, material] = DEFAULTS.topShirtColors.includes(color) ? DEFAULTS.topFormalSummerShirt : DEFAULTS.topFormalSummer;
      else [itemType, material] = DEFAULTS.topBySeason[season] ?? DEFAULTS.topBySeason.springFall;
      if (ov.material !== undefined && ov.material !== null) material = ov.material;
    } else if (ov.material === undefined) material = index.topTypes.get(itemType)?.material ?? null;
    return { category, color, material, fit: ov.fit ?? DEFAULTS.topFit, length: ov.length ?? DEFAULTS.topLength, shoeType: null, itemType, itemName: `${cl} ${label(index, `topType.${itemType}`, itemType)}`, pattern: ov.pattern ?? null };
  }
  if (category === 'shoes') {
    let shoeType = ov.shoeType ?? null;
    if (!shoeType) {
      const fw = DEFAULTS.shoesFormalWinter;
      // P3-08: 브라운 계열 겨울 워크 부츠는 치노·데님용. 울·플란넬엔 첼시
      if (season === 'winter' && fw.colors.includes(color) && matFormality(index, ov.forBottom) >= fw.bottomFormalMin) shoeType = fw.shoeType;
      else shoeType = bySeason(DEFAULTS.shoesByColor[color], season) ?? DEFAULTS.shoesFallback;
    }
    const material = ov.material !== undefined ? ov.material : (DEFAULTS.shoesMaterialByType[shoeType] ?? DEFAULTS.shoesMaterialFallback);
    const sl = label(index, `shoe.${shoeType}`, shoeType);
    const itemName = shoeType === 'sneakerWhite' ? sl : `${cl} ${sl}`;
    return { category, color, material, fit: null, length: null, shoeType, itemType: null, itemName, pattern: null };
  }
  // outer
  let itemType = ov.itemType ?? null;
  if (!itemType) {
    if (DEFAULTS.outerDenimColors.includes(color) && season !== 'summer') itemType = DEFAULTS.outerDenim;
    else if (DEFAULTS.outerCoatColors.includes(color)) itemType = DEFAULTS.outerCoatBySeason[season];
    else itemType = (DEFAULTS.outerBySeason[season] ?? DEFAULTS.outerBySeason.springFall)[ov.rank ?? 0] ?? DEFAULTS.outerBySeason[season][0];
    // P3-12: 가죽 재킷은 가죽 색(블랙·브라운 계열)만
    if (itemType === 'leatherJacket' && !DEFAULTS.leatherColors.includes(color)) itemType = DEFAULTS.outerBySeason[season][0];
  }
  const ot = index.outerTypes.get(itemType);
  return { category, color, material: ov.material !== undefined ? ov.material : (ot?.material ?? null), fit: null, length: ot?.length ?? 'regular', shoeType: null, itemType, itemName: `${cl} ${label(index, `outerType.${itemType}`, itemType)}`, pattern: null };
}

/** base의 사용자 지정값을 materialize overrides로 */
function baseOverrides(base) {
  const o = {};
  for (const k of ['material', 'fit', 'shoeType', 'itemType', 'length']) if (base[k] !== undefined && base[k] !== null) o[k] = base[k];
  return o;
}

/** 코디 톤 태그: top·bottom이 공유하는 톤 (+ accent 아이템이 정확히 하나면 accent) */
export function toneTags(index, outfit) {
  const top = outfit.items.find((i) => i.category === 'top');
  const bottom = outfit.items.find((i) => i.category === 'bottom');
  const tt = index.colors.get(top.color)?.tones ?? [];
  const bt = index.colors.get(bottom.color)?.tones ?? [];
  const shared = tt.filter((t) => bt.includes(t));
  const tags = shared.length ? [...shared] : [bt[0] ?? 'neutral'];
  const accentN = outfit.items.filter((i) => index.colors.get(i.color)?.tones.includes('accent')).length;
  if (accentN === 1 && !tags.includes('accent')) tags.push('accent');
  return tags;
}

export function makeOutfit(index, items, season, extraTags = []) {
  const sorted = [...items].sort((a, b) => CAT_ORDER[a.category] - CAT_ORDER[b.category] || (a.layer ?? 0) - (b.layer ?? 0));
  const outfit = { id: '', items: sorted, seasons: [season], tags: [], isClassic: false, universal: false, sources: [], flags: [], note: '', generated: true };
  outfit.id = `g-${hash(outfitSignature(outfit) + '|' + season)}`;
  outfit.tags = [...new Set([...toneTags(index, outfit), ...extraTags])];
  return outfit;
}

function matchesOf(index, base, baseCategory, category, min) {
  const r = index.colorRules.get(`${base}|${baseCategory}`);
  if (!r) return [];
  return r.rule.matches.filter((m) => m.category === category && m.score >= min);
}
/** 역참조: `${category}|${color}`가 매치로 오른 베이스(baseCategory) 목록, score ≥ min */
function reverseOf(index, category, color, baseCategory, min) {
  return (index.reverse.get(`${category}|${color}`) ?? []).filter((x) => x.baseCategory === baseCategory && x.match.score >= min).map((x) => x.base);
}
const uniq = (arr) => [...new Set(arr)];

/** 여름 + 포멀 하의: 기본(폴로·린넨 셔츠) 외에 티셔츠도 생성 — 점수상 뒤라 deep·변주에 보임 (gate-3 4항) */
function topVariants(index, color, season, bottom, ov) {
  const primary = materialize(index, 'top', color, season, { ...ov, forBottom: bottom.material });
  const out = [[primary, []]];
  if (!ov.itemType && season === 'summer' && matFormality(index, bottom.material) >= DEFAULTS.topFormalBottomMin && primary.itemType !== DEFAULTS.topFormalSummerAlt[0]) {
    const [itemType, material] = DEFAULTS.topFormalSummerAlt;
    out.push([materialize(index, 'top', color, season, { ...ov, itemType, material }), ['variation']]); // 변주 태그 → quick 클래식에서 제외
  }
  return out;
}

/**
 * @returns {import('./types.js').Outfit[]}  blocked 제외, final 내림차순, 상한 opts.max
 * 베이스 규칙이 없는 색(상의 beige·brown…, 하의 lightGrey)도 역참조로 후보를 만든다 (P3-01):
 *  - top 베이스 규칙 없음 → `top|color`가 매치로 오른 하의 베이스들
 *  - bottom 규칙 없음 → `bottom|color`가 매치로 오른 상의 베이스들, 신발은 그 상의 규칙(5장 신발 열) → 없으면 뉴트럴 신발
 */
export function generateCandidates(index, base, season, opts = {}) {
  const max = opts.max ?? CANDIDATE_MAX;
  const bo = baseOverrides(base);
  let bottomColors;
  if (base.category === 'bottom') bottomColors = [base.color];
  else if (base.category === 'top' && index.colorRules.has(`${base.color}|top`)) bottomColors = matchesOf(index, base.color, 'top', 'bottom', 3).map((m) => m.color);
  else bottomColors = reverseOf(index, base.category, base.color, 'bottom', 3);

  const seen = new Set();
  const out = [];
  for (const bottomColor of uniq(bottomColors)) {
    const bottom = base.category === 'bottom' ? materialize(index, 'bottom', base.color, season, bo) : materialize(index, 'bottom', bottomColor, season);
    const hasRule = index.colorRules.has(`${bottom.color}|bottom`);
    let topColors;
    if (base.category === 'top') topColors = [base.color];
    else if (hasRule) topColors = matchesOf(index, bottom.color, 'bottom', 'top', 3).map((m) => m.color);
    else topColors = reverseOf(index, 'bottom', bottom.color, 'top', 3);
    const shoeColorsFor = (topColor) => {
      if (base.category === 'shoes') return [base.color];
      if (hasRule) return matchesOf(index, bottom.color, 'bottom', 'shoes', 3).map((m) => m.color);
      const fromTop = matchesOf(index, topColor, 'top', 'shoes', 3).map((m) => m.color);
      return fromTop.length ? fromTop : DEFAULTS.shoesNeutralFallback;
    };
    let outers;
    if (base.category === 'outer') outers = [materialize(index, 'outer', base.color, season, bo)];
    else if (season === 'summer' || !hasRule) outers = [null];
    else outers = [null, ...matchesOf(index, bottom.color, 'bottom', 'outer', 4).slice(0, OUTER_CANDIDATES).map((m) => materialize(index, 'outer', m.color, season))];

    for (const topColor of uniq(topColors)) {
      const tops = topVariants(index, topColor, season, bottom, base.category === 'top' ? bo : {});
      const shoes = uniq(shoeColorsFor(topColor)).map((c) => materialize(index, 'shoes', c, season, { ...(base.category === 'shoes' ? bo : {}), forBottom: bottom.material }));
      for (const [top, extraTags] of tops) for (const shoe of shoes) for (const outer of outers) {
        const items = [top, bottom, shoe];
        if (outer) items.push(outer);
        const outfit = makeOutfit(index, items, season, extraTags);
        const sig = outfitSignature(outfit);
        if (seen.has(sig)) continue;
        seen.add(sig);
        const s = cachedScore(index, outfit, season);
        if (s.blocked) continue;
        outfit.isClassic = s.color.detail.allClassic;
        out.push(outfit);
      }
    }
  }
  out.sort((a, b) => compareOutfits(index, a, b, season));
  return out.slice(0, max);
}

/** 정렬: final 내림차순 → universal → isClassic → sources.length → id */
export function compareOutfits(index, a, b, season) {
  const sa = cachedScore(index, a, season); const sb = cachedScore(index, b, season);
  return sb.final - sa.final || (b.universal ? 1 : 0) - (a.universal ? 1 : 0) || (b.isClassic ? 1 : 0) - (a.isClassic ? 1 : 0) || b.sources.length - a.sources.length || a.id.localeCompare(b.id);
}

function baseMatchesItem(base, it) {
  if (it.category !== base.category || it.color !== base.color) return false;
  if (base.material && it.material !== base.material) return false;
  if (base.shoeType && it.shoeType !== base.shoeType) return false;
  if (base.itemType && it.itemType !== base.itemType) return false;
  return true;
}

export function toCandidate(index, outfit, season) {
  const score = cachedScore(index, outfit, season);
  return { outfit, score, explain: explainScore(score, index.labelMap, outfit) };
}

const toneKey = (outfit) => outfit.tags.filter((t) => ['neutral', 'earth', 'mono', 'navyBase', 'accent', 'pastel'].includes(t)).sort().join('+');
const item = (outfit, cat) => outfit.items.find((i) => i.category === cat);
const shoeColor = (outfit) => item(outfit, 'shoes')?.color;
const bottomColor = (outfit) => item(outfit, 'bottom')?.color;
const shoeType = (outfit) => item(outfit, 'shoes')?.shoeType;
const topType = (outfit) => item(outfit, 'top')?.itemType;
const hasOuter = (outfit) => !!item(outfit, 'outer');
/** 근사 중복(P3-20): 색만 다르고 품목 구조가 같음 */
const structKey = (outfit) => `${topType(outfit)}|${item(outfit, 'bottom')?.color}|${shoeType(outfit)}|${item(outfit, 'outer')?.itemType ?? '-'}`;

/** 계절 경고가 베이스 아이템 자체 때문인가 (아우터 인디고 겨울 = 데님 재킷 등) */
function seasonReasonFromBase(r, base) {
  if (r.key === 'explain.seasonOut') return r.params.category === base.category && r.params.color === base.color;
  if (r.key === 'explain.seasonItem') return r.params.category === base.category;
  return false;
}

/**
 * @returns {import('./types.js').Candidate[]}  항상 ≤ n, 결정적
 * 선정 규칙 (gate-2 3절 2항 + Phase 4):
 *  풀 = universal 히트 + 생성 후보(격차 ≥5이면서 낮은 쪽이 컬러 스니커즈·러닝화·샌들이면 제외, P3-02)
 *  '깨끗한' 카드 = 전 쌍 classic(또는 universal 히트) + 계절 경고 없음(베이스 자체 때문인 것은 예외) + 겨울 저지 상의 단품 아님 + 구조화 avoid 쌍 없음
 *  pass 0: 깨끗 + 톤 그룹 다름 + 구조 중복 아님 + 마지막 자리 다양성(신발 색·신발 종류·상의 종류·겨울 아우터)
 *  pass 1: 깨끗 + 마지막 자리 신발 색·겨울 아우터
 *  pass 2: 깨끗
 *  pass 3: 계절은 맞는 variation 카드, pass 4: 나머지(계절 경고·겨울 티 단품) — 깨끗한 대안이 모자랄 때만 (P3-03·P3-06·P1-04)
 */
export function pickClassic(index, base, season, n = QUICK_CARDS) {
  // 1. universal 코디 히트
  const ids = index.outfitsByItem.get(`${base.category}|${base.color}`) ?? [];
  const hits = ids.map((id) => index.outfits.get(id))
    .filter((o) => o.universal && o.seasons.includes(season) && o.items.some((it) => baseMatchesItem(base, it)))
    .filter((o) => !cachedScore(index, o, season).blocked)
    .sort((a, b) => compareOutfits(index, a, b, season));
  // 2~4. 생성 후보를 등급별로 (A: 전 쌍 5·classic, B: 전 쌍 ≥4·classic, C: 나머지)
  const gen = generateCandidates(index, base, season);
  const tier = (o) => { if (o.tags.includes('variation')) return 3; const d = cachedScore(index, o, season).color.detail; return d.allClassic && d.minPair >= 5 ? 1 : d.allClassic && d.minPair >= 4 ? 2 : 3; };
  const quickOk = (o) => { const f = cachedScore(index, o, season).style.formality; return !(f.gap >= QUICK_EXCLUDE_GAP && QUICK_EXCLUDE_LO_SHOES.includes(f.lo?.shoeType)); };
  const hitSet = new Set(hits);
  const pool = [...hits.map((o) => [0, o]), ...gen.filter(quickOk).map((o) => [tier(o), o])].sort((x, y) => x[0] - y[0] || compareOutfits(index, x[1], y[1], season)).map((x) => x[1]);

  const seasonBad = (o) => cachedScore(index, o, season).reasons.some((r) => (r.key === 'explain.seasonOut' || r.key === 'explain.seasonItem') && !seasonReasonFromBase(r, base));
  const bareWinter = (o) => season === 'winter' && item(o, 'top')?.material === 'jersey' && !hasOuter(o); // 티·맨투맨·후디 단품 (R2 6-4 겨울 레이어)
  const seasonOk = (o) => !seasonBad(o) && !bareWinter(o);
  // 구조화된 avoid 쌍(규칙의 피하기 행에 색이 명시된 것, 예: blackDenim→top:black '여름 웨이터', khaki→top:olive '흙탕')은 점수와 무관하게 클래식에서 제외
  const avoidPair = (o) => o.items.some((b) => (b.category === 'bottom' || b.category === 'top') && o.items.some((it) => it !== b && index.colorRules.get(`${b.color}|${b.category}`)?.avoid.has(`${it.category}|${it.color}`)));
  const clean = (o) => (hitSet.has(o) || tier(o) <= 2) && seasonOk(o) && !avoidPair(o);

  const chosen = [];
  const sigs = new Set();
  // 마지막 자리에서 모두 같은 값이면 다른 값을 요구. 베이스가 고정하는 차원은 다른 차원으로 대체(P3-13: 신발 베이스 → 하의 색)
  const needDiff = (fn, o) => chosen.length === n - 1 && new Set(chosen.map(fn)).size === 1 && fn(o) === fn(chosen[0]);
  const colorDim = base.category === 'shoes' ? bottomColor : shoeColor;
  const typeDims = [base.category !== 'shoes' && shoeType, base.category !== 'top' && topType].filter(Boolean);
  const ok = (o, pass) => {
    if (sigs.has(outfitSignature(o))) return false;
    if (pass <= 2 && !clean(o)) return false;
    if (pass === 3 && !seasonOk(o)) return false;
    if (chosen.length === 0) return true;
    if (pass <= 1) {
      if (needDiff(colorDim, o)) return false;
      if (season === 'winter' && base.category !== 'outer' && needDiff(hasOuter, o) && !hasOuter(o)) return false; // P1-05·P3-13: 겨울엔 아우터 카드 1장 이상
    }
    if (pass === 0) {
      if (chosen.some((c) => toneKey(c) === toneKey(o))) return false;
      if (chosen.some((c) => structKey(c) === structKey(o))) return false;
      if (typeDims.some((fn) => needDiff(fn, o))) return false; // P1-17: 신발 종류·상의 종류도 2종 이상
    }
    return true;
  };
  // pass 3: 계절은 맞지만 variation 쌍인 카드, pass 4: 계절 경고 카드 — 깨끗한 대안이 모자랄 때만
  for (const pass of [0, 1, 2, 3, 4]) {
    for (const o of pool) {
      if (chosen.length >= n) break;
      if (!ok(o, pass)) continue;
      chosen.push(o); sigs.add(outfitSignature(o));
    }
    if (chosen.length >= n) break;
  }
  // 최소 1개 보장: 규칙이 전혀 없으면 기본 템플릿
  if (chosen.length === 0) {
    const items = { top: ['white', 'top'], bottom: ['indigo', 'bottom'], shoes: ['white', 'shoes'] };
    const list = Object.entries(items).map(([cat, [color]]) => (cat === base.category ? materialize(index, cat, base.color, season, baseOverrides(base)) : materialize(index, cat, color, season)));
    if (base.category === 'outer') list.push(materialize(index, 'outer', base.color, season, baseOverrides(base)));
    chosen.push(makeOutfit(index, list, season));
  }
  return chosen.map((o) => toCandidate(index, o, season));
}
