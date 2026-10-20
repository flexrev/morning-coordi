// 진입점 — engine-spec.md 1·5절. 구현: C2. Phase 6-B (CX): style·occasion·accessories·layering·patterns 옵션 (content-expansion.md 7절)
import { generateCandidates, pickClassic, quickPool, selectQuick, toCandidate, compareOutfits } from './candidates.js';
import { groupByTone, groupByHue, makeVariations, groupByStyle, groupByOccasion, makePatternVariations, RELAX_STAGES } from './groups.js';
import { materialize } from './candidates.js';
import { formalityLevel } from './lookup.js';
import { FORMALITY_BLOCK, QUICK_CARDS } from './constants.js';
import { hasStyles, hasOccasions, styleVector, styleTags, styleBoost, occasionAdjust, occasionAvoidHit, occasionFit, suggestAccessories, patternExcluded } from './style.js';
import { formatReason } from './explain.js';

const KIND_NS = { bottom: 'material', shoes: 'shoe', top: 'topType', outer: 'outerType', mid: 'midType' };

/**
 * "이 아이템과 피할 것" — colorRules[base].avoid(정방향) + 다른 베이스 규칙의 avoid에 이 아이템이 오른 것(역방향, 신발·아우터 베이스)
 * + 포멀도 격차 ≥ FORMALITY_BLOCK 품목. UI(S4)가 그대로 표시한다. 통합 단계 G1.
 * @returns {Array<{target: string|null, reason: string, ruleId: string|null}>}
 */
export function avoidList(index, base, season) {
  const L = index.labelMap;
  const cat = (c) => L[`category.${c}`] ?? c;
  const col = (c) => L[`color.${c}`] ?? c;
  const out = [];
  const seen = new Set();
  const push = (target, reason, ruleId = null) => {
    const k = `${target}|${reason}`;
    if (seen.has(k) || !reason) return;
    seen.add(k);
    out.push({ target, reason, ruleId });
  };
  const own = `${base.color}|${base.category}`;
  const r = index.colorRules.get(own);
  for (const a of r?.rule.avoid ?? []) push(a.category && a.color ? `${cat(a.category)} ${col(a.color)}` : null, a.reason, a.ruleId ?? null);
  for (const [key, rule] of index.colorRules) {
    if (key === own) continue;
    const a = rule.avoid.get(`${base.category}|${base.color}`);
    if (a) push(`${cat(rule.rule.baseCategory)} ${col(rule.rule.base)}`, a.reason, a.ruleId ?? null);
  }
  // P3-17: score ≤2 매치(정방향·역방향)도 '피할 것'으로 — 상의 베이스(5장)는 피하기 행이 없어서 비어 있었음
  const low = (m) => m.note || `비추천(점수 ${m.score})`;
  const targets = new Set(out.map((a) => a.target));
  const pushLow = (target, m) => { if (targets.has(target)) return; targets.add(target); push(target, low(m), m.ruleId ?? null); };
  for (const m of r?.rule.matches ?? []) if (m.score <= 2) pushLow(`${cat(m.category)} ${col(m.color)}`, m);
  for (const x of index.reverse.get(`${base.category}|${base.color}`) ?? []) if (x.match.score <= 2) pushLow(`${cat(x.baseCategory)} ${col(x.base)}`, x.match);
  const level = formalityLevel(index, materialize(index, base.category, base.color, season, base));
  if (level !== null) {
    for (const [key, rows] of index.formality) {
      const [category, id] = key.split('|');
      if (category === base.category) continue;
      const row = rows.find((f) => !f.when);
      if (!row) continue;
      const gap = Math.abs(row.level - level);
      if (gap >= FORMALITY_BLOCK) push(`${cat(category)} ${L[`${KIND_NS[category]}.${id}`] ?? id}`, `격식 차이 ${gap}단계`, 'formality');
    }
  }
  return out;
}

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

// ---------------------------------------------------------------- Phase 6-B: 스타일 벡터 캐시(코디 객체당) · 카드 장식
const svCache = new WeakMap();
function styleVectorCached(index, outfit) {
  if (!hasStyles(index)) return null;
  if (!svCache.has(outfit)) svCache.set(outfit, styleVector(index, outfit));
  return svCache.get(outfit);
}

/** 옵션 정규화: style·occasion은 데이터에 있을 때만 적용, 없으면 null(기능 OFF와 동일) */
export function normalizeOptions(index, query) {
  const style = hasStyles(index) && query.style && index.styles.some((s) => s.id === query.style) ? query.style : null;
  const occasion = hasOccasions(index) && query.occasion && index.occasions.has(query.occasion) ? query.occasion : null;
  const accessories = query.accessories ?? false;
  return { style, occasion, accessories, layering: !!query.layering, patterns: !!query.patterns };
}

/**
 * Candidate에 Phase 6-B 필드를 붙인다 (candidate.explain·score는 그대로 — S3 카드 줄 불변):
 *  styleVec · styleTags [{id, score}] ≤2 · tags { style: id[], occasion: id[] } (UX 7-5 계약) · tagLabels (한국어)
 *  rank { boost, occasionAdj, finalRanked } · styleReasons [{key, severity, delta, params}] · styleExplain (한국어) · accessories (옵션)
 */
export function decorateCandidate(index, c, season, opts, occ) {
  const L = index.labelMap;
  const sv = styleVectorCached(index, c.outfit);
  c.styleVec = sv;
  c.styleTags = styleTags(sv, index);
  c.tags = { style: c.styleTags.map((t) => t.id), occasion: occasionFit(index, c.outfit) };
  c.tagLabels = [...c.tags.style.map((s) => index.labels.get(`style.${s}`)?.shortLabel ?? L[`style.${s}`] ?? s), ...c.tags.occasion.map((o) => index.labels.get(`occasion.${o}`)?.shortLabel ?? L[`occasion.${o}`] ?? o)];
  const boost = styleBoost(sv, opts.style);
  const oa = occ ? occasionAdjust(index, c.outfit, occ, sv) : null;
  c.rank = { boost, occasionAdj: oa ? oa.total : 0, finalRanked: Math.round((c.score.final + boost + (oa ? oa.total : 0)) * 100) / 100 };
  const reasons = [];
  if (opts.style && sv) reasons.push({ key: 'explain.style.boost', params: { style: opts.style, delta: boost }, delta: boost, severity: 'info' });
  else if (c.styleTags[0]) reasons.push({ key: 'explain.style.tag', params: { style: c.styleTags[0].id }, severity: 'info' });
  if (oa) {
    if (oa.styleAdj) reasons.push({ key: 'explain.occasion.adj', params: { occasion: occ.id, delta: oa.styleAdj }, delta: oa.styleAdj, severity: 'info' });
    if (oa.outside) reasons.push({ key: 'explain.occasion.window', params: { occasion: occ.id, n: oa.outside, delta: oa.windowPenalty }, delta: oa.windowPenalty, severity: 'warn' });
    if (oa.targetBonus) reasons.push({ key: 'explain.occasion.target', params: { occasion: occ.id }, delta: oa.targetBonus, severity: 'info' });
  }
  c.styleReasons = reasons;
  c.styleExplain = reasons.map((r) => formatReason(r, L));
  return c;
}

/** 소품 제안 첨부 — 결과에 실리는 카드에만(후보 300장 전부가 아니라) */
export function attachAccessories(index, c, season, opts, occ) {
  if (!opts.accessories || c.accessories) return c;
  const L = index.labelMap;
  const forced = typeof opts.accessories === 'object' ? opts.accessories : {};
  c.accessories = suggestAccessories(index, c.outfit, season, c.styleVec ?? null, { ...forced, occasion: occ?.id ?? null })
    .map((a) => ({ ...a, text: formatReason({ key: 'explain.acc', params: { accessory: a.id, reason: a.color ? `${L[`color.${a.color}`] ?? a.color} — ${a.note}` : a.note } }, L) }));
  return c;
}

/** @returns {import('./types.js').RecommendResult} */
export function recommend(index, query) {
  const t0 = now();
  const { base, season, mode = 'quick' } = query;
  if (!base || !base.category || !base.color) throw new Error('recommend: base.category·base.color 필요');
  if (!index.colors.has(base.color)) throw new Error(`recommend: 알 수 없는 색 ${base.color}`);
  const opts = normalizeOptions(index, query);
  if (mode === 'deep' && opts.accessories === false && query.accessories === undefined) opts.accessories = true; // Deep은 기본 ON, Quick은 요청 시만
  const occ = opts.occasion ? index.occasions.get(opts.occasion) : null;
  const sv = (o) => styleVectorCached(index, o);
  const rankAdj = (o) => styleBoost(sv(o), opts.style) + (occ ? occasionAdjust(index, o, occ, sv(o)).total : 0);
  const decorate = (c) => decorateCandidate(index, c, season, opts, occ);
  const applied = { style: opts.style, occasion: opts.occasion, accessories: !!opts.accessories, layering: opts.layering, patterns: opts.patterns, relaxed: [] };

  // Quick 3장: 옵션 없으면 Phase 4와 동일(pickClassic). 옵션 있으면 같은 풀을 finalRanked로 재정렬 + 상황 avoid 단계 완화(항상 3장, D-2)
  let classic;
  if (opts.style || occ) {
    const pool = quickPool(index, base, season);
    const stages = occ ? RELAX_STAGES.map((_, i) => i) : [null];
    for (const stage of stages) {
      const exclude = occ ? (o) => !!occasionAvoidHit(o, occ, stage) : undefined;
      classic = selectQuick(index, base, season, pool, QUICK_CARDS, { rankAdj, exclude, noFallback: true });
      applied.relaxed = occ ? RELAX_STAGES[stage] : [];
      if (classic.length >= QUICK_CARDS) break;
    }
    if (!classic?.length) classic = pickClassic(index, base, season);
  } else classic = pickClassic(index, base, season);
  classic.forEach(decorate);

  const result = { mode, base, season, classic, applied, stats: { candidates: classic.length, ms: 0 } };
  if (mode === 'deep') {
    const outfits = generateCandidates(index, base, season, { layering: opts.layering }).filter((o) => !patternExcluded(index, o, season, 'deep'));
    const candidates = outfits.map((o) => decorate(toCandidate(index, o, season)));
    const reorder = (list) => (opts.style || occ ? [...list].sort((a, b) => b.rank.finalRanked - a.rank.finalRanked || compareOutfits(index, a.outfit, b.outfit, season)) : list);
    result.byTone = groupByTone(index, candidates, base).map((g) => ({ ...g, candidates: reorder(g.candidates) }));
    result.byHue = groupByHue(index, candidates, base, 5, { toneGroups: result.byTone }).map((g) => ({ ...g, candidates: reorder(g.candidates) })); // P1-06: 유사색 ≠ 톤별 같은 5장
    const variations = makeVariations(index, classic, base, season);
    if (opts.patterns) variations.push(...makePatternVariations(index, classic, season));
    variations.forEach((v) => decorate(v.candidate));
    result.variations = opts.style || occ ? [...variations].sort((a, b) => b.candidate.rank.finalRanked - a.candidate.rank.finalRanked || compareOutfits(index, a.candidate.outfit, b.candidate.outfit, season)) : variations;
    result.byStyle = groupByStyle(index, candidates, { style: opts.style });
    result.byOccasion = groupByOccasion(index, candidates);
    result.avoid = avoidList(index, base, season);
    result.stats.candidates = candidates.length;
    const shown = [...result.byTone, ...result.byHue, ...result.byStyle, ...result.byOccasion].flatMap((g) => g.candidates).concat(result.variations.map((v) => v.candidate));
    shown.forEach((c) => attachAccessories(index, c, season, opts, occ));
  }
  classic.forEach((c) => attachAccessories(index, c, season, opts, occ));
  result.stats.ms = Math.round((now() - t0) * 100) / 100;
  return result;
}
