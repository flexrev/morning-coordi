// 진입점 — engine-spec.md 1·5절. 구현: C2.
import { generateCandidates, pickClassic, toCandidate } from './candidates.js';
import { groupByTone, groupByHue, makeVariations } from './groups.js';
import { materialize } from './candidates.js';
import { formalityLevel } from './lookup.js';
import { FORMALITY_BLOCK } from './constants.js';

const KIND_NS = { bottom: 'material', shoes: 'shoe', top: 'topType', outer: 'outerType' };

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

/** @returns {import('./types.js').RecommendResult} */
export function recommend(index, query) {
  const t0 = now();
  const { base, season, mode = 'quick' } = query;
  if (!base || !base.category || !base.color) throw new Error('recommend: base.category·base.color 필요');
  if (!index.colors.has(base.color)) throw new Error(`recommend: 알 수 없는 색 ${base.color}`);
  const classic = pickClassic(index, base, season);
  const result = { mode, base, season, classic, stats: { candidates: classic.length, ms: 0 } };
  if (mode === 'deep') {
    const outfits = generateCandidates(index, base, season);
    const candidates = outfits.map((o) => toCandidate(index, o, season));
    result.byTone = groupByTone(index, candidates, base);
    result.byHue = groupByHue(index, candidates, base, 5, { toneGroups: result.byTone }); // P1-06: 유사색 ≠ 톤별 같은 5장
    result.variations = makeVariations(index, classic, base, season);
    result.avoid = avoidList(index, base, season);
    result.stats.candidates = candidates.length;
  }
  result.stats.ms = Math.round((now() - t0) * 100) / 100;
  return result;
}
