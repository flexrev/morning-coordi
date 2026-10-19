// Deep 그룹핑(톤별·색상별·변주) — engine-spec.md 5-2절. 구현: C2.
// Phase 4: 그룹 5장 중복 상한(P1-06·P3-20), 유사색=톤별 동일 집합 금지(P1-06), 변주 품목 재구체화(P3-12)
import { materialize, makeOutfit, outfitSignature, cachedScore, toCandidate, compareOutfits } from './candidates.js';
import { DEFAULTS, GROUP_MAX_SAME_OUTER, GROUP_MAX_SAME_SHOE, GROUP_MAX_SAME_TOP } from './constants.js';

const TONE_ORDER = ['neutral', 'earth', 'mono', 'navyBase', 'accent', 'pastel'];
const item = (outfit, cat) => outfit.items.find((i) => i.category === cat);
const byScore = (a, b) => b.score.final - a.score.final || a.outfit.id.localeCompare(b.outfit.id);

/**
 * 점수순으로 채우되 같은 아우터 종류 ≤ GROUP_MAX_SAME_OUTER, 같은 신발 종류 ≤ GROUP_MAX_SAME_SHOE, 같은 (상의 종류+색) ≤ GROUP_MAX_SAME_TOP.
 * 상한에 걸리는 카드만 남으면 '상한 위반 수'가 가장 적은 카드부터(동점이면 점수순) 채운다 — 신발이 전부 같아도 아우터 상한은 따로 지켜진다.
 * deprioritize: 이 id들은 같은 위반 수 안에서 뒤로 미룬다(제외는 아님) — 색상별 그룹이 톤별 그룹과 같은 5장이 되지 않게
 */
export function fillDiverse(candidates, perGroup, deprioritize = new Set()) {
  const sorted = [...candidates].sort((a, b) => (deprioritize.has(a.outfit.id) ? 1 : 0) - (deprioritize.has(b.outfit.id) ? 1 : 0) || byScore(a, b));
  const out = [];
  const outer = new Map(); const shoe = new Map(); const top = new Map();
  const bump = (m, k) => m.set(k, (m.get(k) ?? 0) + 1);
  const keys = (c) => [item(c.outfit, 'outer')?.itemType ?? null, item(c.outfit, 'shoes')?.shoeType, `${item(c.outfit, 'top')?.itemType}|${item(c.outfit, 'top')?.color}`];
  const violations = (c) => {
    const [o, s, t] = keys(c);
    return (o && (outer.get(o) ?? 0) >= GROUP_MAX_SAME_OUTER ? 1 : 0) + ((shoe.get(s) ?? 0) >= GROUP_MAX_SAME_SHOE ? 1 : 0) + ((top.get(t) ?? 0) >= GROUP_MAX_SAME_TOP ? 1 : 0);
  };
  const remaining = [...sorted];
  while (out.length < perGroup && remaining.length) {
    let best = 0; let bestV = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const v = violations(remaining[i]);
      if (v < bestV) { bestV = v; best = i; if (v === 0) break; }
    }
    const [c] = remaining.splice(best, 1);
    const [o, s, t] = keys(c);
    out.push(c); if (o) bump(outer, o); bump(shoe, s); bump(top, t);
  }
  return out;
}

/** @returns {import('./types.js').ToneGroup[]} */
export function groupByTone(index, candidates, base, perGroup = 5) {
  const groups = new Map(TONE_ORDER.map((t) => [t, []]));
  for (const c of candidates) {
    const top = item(c.outfit, 'top'); const bottom = item(c.outfit, 'bottom');
    const tt = index.colors.get(top.color)?.tones ?? []; const bt = index.colors.get(bottom.color)?.tones ?? [];
    for (const t of tt) if (t !== 'accent' && bt.includes(t)) groups.get(t).push(c);
    const accentN = c.outfit.items.filter((i) => index.colors.get(i.color)?.tones.includes('accent')).length;
    if (accentN === 1) groups.get('accent').push(c);
  }
  return TONE_ORDER.filter((t) => groups.get(t).length).map((t) => ({ tone: t, labelKey: `tone.${t}`, candidates: fillDiverse(groups.get(t), perGroup) }));
}

/** base 색과 상대 색의 색상환 관계 */
export function hueRelation(index, baseColor, otherColor) {
  const ga = index.analogousOf.get(baseColor); const gb = index.analogousOf.get(otherColor);
  if (ga && gb && ga === gb) return 'analogous';
  for (const p of index.complementary) {
    if ((p.aColors.has(baseColor) && p.bColors.has(otherColor)) || (p.bColors.has(baseColor) && p.aColors.has(otherColor))) return 'complementary';
  }
  if (index.achromatic.has(otherColor) || index.achromatic.has(baseColor)) return 'achromatic';
  return null;
}

/**
 * @returns {import('./types.js').HueGroup[]}
 * opts.toneGroups(이미 만든 톤별 그룹)를 주면 어떤 톤 그룹과도 같은 5장이 되지 않게 한다 — 같은 집합이면 그 톤 그룹의 id를 뒤로 미루고 다시 채우고, 그래도 같으면 그룹을 뺀다 (P1-06)
 */
export function groupByHue(index, candidates, base, perGroup = 5, opts = {}) {
  const groups = { analogous: [], complementary: [], achromatic: [] };
  const partnerCat = base.category === 'bottom' ? 'top' : 'bottom';
  for (const c of candidates) {
    const partner = item(c.outfit, partnerCat);
    if (!partner) continue;
    const rel = hueRelation(index, base.color, partner.color);
    if (rel) groups[rel].push(c);
  }
  const toneSets = (opts.toneGroups ?? []).map((g) => new Set(g.candidates.map((c) => c.outfit.id)));
  const sameAsTone = (list) => toneSets.find((s) => s.size === list.length && list.every((c) => s.has(c.outfit.id)));
  const out = [];
  for (const r of ['analogous', 'complementary', 'achromatic']) {
    if (!groups[r].length) continue;
    let list = fillDiverse(groups[r], perGroup);
    const dup = sameAsTone(list);
    if (dup) {
      list = fillDiverse(groups[r], perGroup, dup);
      if (sameAsTone(list)) continue; // 풀 전체가 그 톤 그룹과 같으면 색상별에서 뺀다
    }
    out.push({ relation: r, labelKey: `explain.${r}`, candidates: list });
  }
  return out;
}

const SLOT_ORDER = ['top', 'bottom', 'shoes', 'outer'];

/**
 * 변주에서 색이 바뀔 때 색에 묶인 속성 재결정 (통합 G2 + P3-12):
 *  신발 → 종류·소재, 하의 → 소재, 상의 → 셔츠류는 허용 색 밖이면 계절 기본 품목(멜란지 옥스포드 셔츠 방지), 데님색·멜란지는 색 규칙 품목,
 *  아우터 → 종류를 색·계절에 맞춰 다시 정함(가죽 재킷은 가죽 색만, 데님색은 데님 재킷)
 */
function swapItem(index, cat, cur, color, season, outfit) {
  if (cat === 'shoes') return materialize(index, 'shoes', color, season, { fit: cur.fit, length: cur.length, forBottom: item(outfit, 'bottom')?.material });
  if (cat === 'bottom') return materialize(index, 'bottom', color, season, { fit: cur.fit, length: cur.length, pattern: cur.pattern });
  if (cat === 'top') {
    const keep = { fit: cur.fit, length: cur.length, pattern: cur.pattern };
    const colorBound = DEFAULTS.topTypeByColor[color] !== undefined;
    const shirt = DEFAULTS.topShirtTypes.includes(cur.itemType);
    if (colorBound || (shirt && !DEFAULTS.topShirtOkColors.includes(color))) return materialize(index, 'top', color, season, { ...keep, forBottom: item(outfit, 'bottom')?.material });
    return materialize(index, 'top', color, season, { ...keep, material: cur.material, itemType: cur.itemType });
  }
  // outer: 같은 종류를 쓸 수 있으면 유지(가죽 재킷은 가죽 색만, 데님 재킷은 데님 색만), 아니면 색·계절 기본
  const keepType = cur.itemType === 'leatherJacket' ? DEFAULTS.leatherColors.includes(color)
    : cur.itemType === 'denimJacket' ? DEFAULTS.outerDenimColors.includes(color)
    : !DEFAULTS.outerDenimColors.includes(color) && !DEFAULTS.outerCoatColors.includes(color);
  return materialize(index, 'outer', color, season, keepType ? { itemType: cur.itemType } : {});
}

/** @returns {import('./types.js').Variation[]} */
export function makeVariations(index, classic, base, season, opts = {}) {
  const perCard = opts.perCard ?? 5;
  const perSlot = opts.perSlot ?? 2; // 슬롯당 상한: 상의가 5개를 다 차지하면 S6 신발·아우터 대안이 비기 때문(통합 G2)
  const seen = new Set(classic.map((c) => outfitSignature(c.outfit)));
  const usedAt = (cat) => new Set(classic.map((c) => item(c.outfit, cat)?.color).filter(Boolean));
  const out = [];
  for (const card of classic) {
    let made = 0;
    const o = card.outfit;
    for (const cat of SLOT_ORDER) {
      if (cat === base.category || made >= perCard) continue;
      const cur = item(o, cat);
      if (!cur) continue;
      // 다음 순위 match: bottom 슬롯은 top 베이스 규칙, 그 외는 현재 bottom 색의 규칙
      const bottom = item(o, 'bottom'); const top = item(o, 'top');
      const rule = cat === 'bottom' ? index.colorRules.get(`${top.color}|top`) : index.colorRules.get(`${bottom.color}|bottom`);
      if (!rule) continue;
      const taken = usedAt(cat);
      const nexts = rule.rule.matches.filter((m) => m.category === cat && m.score >= 3 && m.color !== cur.color && !taken.has(m.color));
      let madeHere = 0;
      for (const m of nexts) {
        if (made >= perCard || madeHere >= perSlot) break;
        const next = swapItem(index, cat, cur, m.color, season, o);
        if (cur.layer) next.layer = cur.layer;
        const items = o.items.map((it) => (it === cur ? next : it));
        const outfit = makeOutfit(index, items, season, ['variation']);
        const sig = outfitSignature(outfit);
        if (seen.has(sig)) continue;
        seen.add(sig);
        const score = cachedScore(index, outfit, season);
        if (score.blocked) continue;
        outfit.isClassic = false;
        out.push({ fromOutfitId: o.id, swapped: { category: cat, from: cur, to: next }, candidate: toCandidate(index, outfit, season) });
        made++; madeHere++;
      }
    }
  }
  return out.sort((a, b) => compareOutfits(index, a.candidate.outfit, b.candidate.outfit, season));
}
