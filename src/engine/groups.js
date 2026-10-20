// Deep 그룹핑(톤별·색상별·변주) — engine-spec.md 5-2절. 구현: C2.
// Phase 4: 그룹 5장 중복 상한(P1-06·P3-20), 유사색=톤별 동일 집합 금지(P1-06), 변주 품목 재구체화(P3-12)
import { materialize, makeOutfit, outfitSignature, cachedScore, toCandidate, compareOutfits } from './candidates.js';
import { DEFAULTS, GROUP_MAX_SAME_OUTER, GROUP_MAX_SAME_SHOE, GROUP_MAX_SAME_TOP, STYLE_TAG_MIN, BY_STYLE_MAX_GROUPS, BY_STYLE_PER_GROUP, BY_STYLE_MAX_OVERLAP, BY_OCCASION_PER_GROUP, OCC_RELAX_MAX_STAGE } from './constants.js';
import { occasionAvoidHit, occasionAdjust, patternFor, patternExcluded, outfitFormality } from './style.js';

const TONE_ORDER = ['neutral', 'earth', 'mono', 'navyBase', 'accent', 'pastel'];
const item = (outfit, cat) => outfit.items.find((i) => i.category === cat);
const byScore = (a, b) => b.score.final - a.score.final || a.outfit.id.localeCompare(b.outfit.id);

/**
 * 점수순으로 채우되 같은 아우터 종류 ≤ GROUP_MAX_SAME_OUTER, 같은 신발 종류 ≤ GROUP_MAX_SAME_SHOE, 같은 (상의 종류+색) ≤ GROUP_MAX_SAME_TOP.
 * 상한에 걸리는 카드만 남으면 '상한 위반 수'가 가장 적은 카드부터(동점이면 점수순) 채운다 — 신발이 전부 같아도 아우터 상한은 따로 지켜진다.
 * deprioritize: 이 id들은 같은 위반 수 안에서 뒤로 미룬다(제외는 아님) — 색상별 그룹이 톤별 그룹과 같은 5장이 되지 않게
 * rankOf (Phase 6-B): 정렬 기준 점수 함수. 기본 score.final — 스타일·상황 그룹은 finalRanked를 준다
 * strict (Phase 6-B-3, C6-03): 상한을 어기는 카드만 남으면 거기서 멈춘다(5장 미만 허용) — 태그로 좁힌 스타일 그룹용
 */
export function fillDiverse(candidates, perGroup, deprioritize = new Set(), rankOf = null, strict = false) {
  const rank = rankOf ? new Map(candidates.map((c) => [c, rankOf(c)])) : null; // 후보당 1회 계산
  const cmp = rank ? (a, b) => rank.get(b) - rank.get(a) || byScore(a, b) : byScore;
  const sorted = [...candidates].sort((a, b) => (deprioritize.has(a.outfit.id) ? 1 : 0) - (deprioritize.has(b.outfit.id) ? 1 : 0) || cmp(a, b));
  const out = [];
  const outer = new Map(); const shoe = new Map(); const top = new Map();
  const bump = (m, k) => m.set(k, (m.get(k) ?? 0) + 1);
  const keys = (c) => [item(c.outfit, 'outer')?.itemType ?? null, item(c.outfit, 'shoes')?.shoeType, `${item(c.outfit, 'top')?.itemType}|${item(c.outfit, 'top')?.color}`];
  // strict일 때 풀 전체가 한 값인 차원(신발 베이스의 신발 종류 등)은 상한을 걸지 않는다
  const fixedOuter = strict && new Set(candidates.map((c) => keys(c)[0])).size <= 1; const fixedShoe = strict && new Set(candidates.map((c) => keys(c)[1])).size <= 1;
  const hard = (c) => { const [o, s] = keys(c); return (!fixedOuter && o && (outer.get(o) ?? 0) >= GROUP_MAX_SAME_OUTER ? 1 : 0) + (!fixedShoe && (shoe.get(s) ?? 0) >= GROUP_MAX_SAME_SHOE ? 1 : 0); };
  const violations = (c) => hard(c) + ((top.get(keys(c)[2]) ?? 0) >= GROUP_MAX_SAME_TOP ? 1 : 0);
  const remaining = [...sorted];
  while (out.length < perGroup && remaining.length) {
    let best = 0; let bestV = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const v = violations(remaining[i]);
      if (v < bestV) { bestV = v; best = i; if (v === 0) break; }
    }
    if (strict && bestV > 0 && hard(remaining[best]) > 0) break; // strict: 아우터·신발 종류 상한은 끝까지(상의 종류+색 상한은 양보)
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

// ================================================================ Phase 6-B (CX) — 스타일·상황 그룹, 패턴 변주 (content-expansion 4-3·7-3)

/**
 * @returns {Array<{ style: string, labelKey: string, candidates: Candidate[] }>}
 * 후보는 decorate된 Candidate(c.styleVec·c.tags 있음). C6-03:
 *  그룹 = 카드 styleTags(top-2)에 그 스타일이 있고 norm ≥ STYLE_TAG_MIN인 후보를 **norm 우선·final 보조**(10×norm + final)로 fillDiverse. 5장 미만·빈 그룹 허용(빈 그룹은 뺀다).
 *  그룹 쌍의 공통 카드 ≤ BY_STYLE_MAX_OVERLAP: 앞 그룹 카드를 뒤로 미뤄 다시 채우고, 그래도 넘치면 공통 카드를 뒤에서부터 뺀다(미니멀·아이비가 같은 5장이 되지 않게).
 * opts.style 선택 시 [선택 스타일, 근접 스타일 1개(그룹 교집합 최대)], 아니면 1차 범위(phase 1) 순 ≤ BY_STYLE_MAX_GROUPS.
 */
export function groupByStyle(index, candidates, opts = {}) {
  if (!index.styles) return [];
  const per = opts.perGroup ?? BY_STYLE_PER_GROUP;
  const maxOverlap = opts.maxOverlap ?? BY_STYLE_MAX_OVERLAP;
  const norm = (c, s) => c.styleVec?.norm?.[s] ?? 0;
  const tagged = (c, s) => (c.tags?.style ?? c.styleTags?.map((t) => t.id) ?? []).includes(s) && norm(c, s) >= STYLE_TAG_MIN;
  const rankOf = (s) => (c) => 10 * norm(c, s) + c.score.final;
  const build = (s, deprioritize = new Set()) => fillDiverse(candidates.filter((c) => tagged(c, s)), per, deprioritize, rankOf(s), true);
  const phase1 = index.styles.filter((s) => s.phase === 1).map((s) => s.id);
  const mk = (s) => ({ style: s, labelKey: `style.${s}`, candidates: build(s) });
  // 앞 그룹들과의 overlap 상한 적용
  const dedupe = (groups) => {
    const done = [];
    for (const g of groups) {
      const prev = done.map((d) => new Set(d.candidates.map((c) => c.outfit.id)));
      const over = (list) => prev.some((ids) => list.filter((c) => ids.has(c.outfit.id)).length > maxOverlap);
      let list = g.candidates;
      if (over(list)) list = build(g.style, new Set(prev.flatMap((ids) => [...ids])));
      if (over(list)) {
        // 공통 카드를 순위 낮은 것부터 제거해 각 앞 그룹과 ≤ maxOverlap
        const kept = [];
        for (const c of list) {
          const next = [...kept, c];
          if (prev.every((ids) => next.filter((x) => ids.has(x.outfit.id)).length <= maxOverlap)) kept.push(c);
        }
        list = kept;
      }
      done.push({ ...g, candidates: list });
    }
    return done.filter((d) => d.candidates.length);
  };
  if (opts.style && index.styles.some((s) => s.id === opts.style)) {
    const sel = mk(opts.style);
    const ids = new Set(sel.candidates.map((c) => c.outfit.id));
    const others = phase1.filter((s) => s !== opts.style).map(mk).filter((g) => g.candidates.length);
    others.sort((a, b) => b.candidates.filter((c) => ids.has(c.outfit.id)).length - a.candidates.filter((c) => ids.has(c.outfit.id)).length || phase1.indexOf(a.style) - phase1.indexOf(b.style));
    return dedupe([sel, ...others.slice(0, 1)].filter((g) => g.candidates.length));
  }
  return dedupe(phase1.map(mk).filter((g) => g.candidates.length)).slice(0, BY_STYLE_MAX_GROUPS);
}

/**
 * @returns {Array<{ occasion: string, labelKey: string, candidates: Candidate[], relaxed: string[], shortfall: boolean }>}
 * 상황별 ≤ BY_OCCASION_PER_GROUP장: avoid 제외(단계 완화) + final + occasionAdjust 순 fillDiverse. 3장이 되는 첫 단계에서 멈춘다.
 * C6-01·02: 완화 상한은 OCC_RELAX_MAX_STAGE[occasion] (격식·운동 = 2 → itemTypes·shoeTypes는 끝까지). 상한에서도 3장 미만이면 그대로 두고 shortfall: true.
 * opts.extraFor(occasion) → Candidate[]: 완화 없이 3장을 못 채울 때만 호출해 그 상황에 더하는 후보(OCC_ALT 대체 구체화 — 운동의 테크 팬츠, 여름 격식의 린넨 셔츠). 지연 호출이라 대부분의 Deep 호출은 비용 0.
 * C6-09: 데이트 그룹이 출근 그룹과 2장 이상 겹치면 출근 카드를 뒤로 미뤄 다시 채운다(P1-06 톤별↔색상별과 같은 방식).
 */
export const RELAX_STAGES = [[], ['patterns'], ['patterns', 'materials'], ['patterns', 'materials', 'itemTypes'], ['patterns', 'materials', 'itemTypes', 'shoeTypes']];
export const relaxMaxStage = (occId) => OCC_RELAX_MAX_STAGE[occId] ?? RELAX_STAGES.length - 1;
export function groupByOccasion(index, candidates, opts = {}) {
  if (!index.occasions?.size) return [];
  const per = opts.perGroup ?? BY_OCCASION_PER_GROUP;
  const out = [];
  const byId = (list) => new Set(list.map((c) => c.outfit.id));
  for (const occ of index.occasions.values()) {
    let pool = candidates;
    const rank = (c) => c.score.final + occasionAdjust(index, c.outfit, occ, c.styleVec ?? null).total;
    const maxStage = relaxMaxStage(occ.id);
    const fill = (deprioritize = new Set()) => {
      let list = []; let relaxed = [];
      for (let stage = 0; stage <= maxStage; stage++) {
        list = fillDiverse(pool.filter((c) => !occasionAvoidHit(c.outfit, occ, stage)), per, deprioritize, rank);
        relaxed = RELAX_STAGES[stage];
        if (list.length >= per) break;
      }
      return { list, relaxed };
    };
    let { list, relaxed } = fill();
    if ((list.length < per || relaxed.length > 0) && opts.extraFor) { // 완화가 필요했거나 모자라면 대체 후보를 더해 다시(울 슬랙스+스니커즈 '운동' 대신 테크 팬츠)
      const extra = opts.extraFor(occ.id) ?? [];
      if (extra.length) { pool = [...candidates, ...extra]; ({ list, relaxed } = fill()); }
    }
    if (occ.id === 'date') {
      const work = out.find((g) => g.occasion === 'work');
      if (work) {
        const ids = byId(work.candidates);
        if (list.filter((c) => ids.has(c.outfit.id)).length >= 2) ({ list, relaxed } = fill(ids));
      }
    }
    if (list.length) out.push({ occasion: occ.id, labelKey: `occasion.${occ.id}`, candidates: list, relaxed, shortfall: list.length < per });
  }
  return out;
}

/**
 * Deep + patterns 옵션: 클래식 카드 상의에 패턴(브레통·잔줄·깅엄)을 입힌 변주 ≤ 1장/카드. AS 패턴 텍스처 자산이 있어야 화면에 보인다.
 * @returns {import('./types.js').Variation[]}
 */
export function makePatternVariations(index, classic, season) {
  if (!index.patterns?.size) return [];
  const out = [];
  for (const card of classic) {
    const o = card.outfit;
    const top = item(o, 'top');
    const p = patternFor(index, top, season, outfitFormality(index, o).avg);
    if (!p) continue;
    // 품목명: "라이트 블루 잔줄 셔츠"(패턴 짧은 라벨이 품목을 담으면 치환) · "네이비 브레통 코튼 니트"(아니면 품목 앞에 삽입)
    // C6-17: 품목명에 품목 라벨이 통째로 없으면("라이트 블루 셔츠") 마지막 단어 앞에 패턴 수식어만 끼운다 — "잔줄 셔츠 라이트 블루 셔츠" 방지
    const pl = index.labels.get(`pattern.${p.id}`)?.shortLabel ?? index.labels.get(`pattern.${p.id}`)?.label ?? p.id;
    const tl = index.labels.get(`topType.${top.itemType}`)?.label ?? '';
    const lastWord = tl.split(/\s/).pop();
    const words = top.itemName.split(/\s+/); const last = words[words.length - 1];
    const itemName = tl && top.itemName.includes(tl) ? top.itemName.replace(tl, lastWord && pl.endsWith(lastWord) ? pl : `${pl} ${tl}`)
      : pl.endsWith(last) ? [...words.slice(0, -1), pl].join(' ') : [...words.slice(0, -1), pl, last].join(' ');
    const next = { ...top, pattern: p.id, itemName };
    const outfit = makeOutfit(index, o.items.map((it) => (it === top ? next : it)), season, ['variation', 'pattern']);
    const score = cachedScore(index, outfit, season);
    if (score.blocked || patternExcluded(index, outfit, season, 'deep')) continue;
    outfit.isClassic = false;
    out.push({ fromOutfitId: o.id, swapped: { category: 'top', from: top, to: next }, candidate: toCandidate(index, outfit, season) });
  }
  return out;
}
