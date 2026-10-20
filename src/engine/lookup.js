// 데이터 인덱스와 축별 조회 — engine-spec.md 8절 lookup.js. 구현: C2.
import { DEFAULT_SCORE, RESERVE_COLORS } from './constants.js';

const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

/** @param {object} data data/index.js의 data 객체 @returns {import('./types.js').DataIndex} */
export function buildIndex(data) {
  const colors = new Map(data.colors.map((c) => [c.id, c]));
  const materials = new Map(data.materials.map((m) => [m.id, m]));
  const shoes = new Map(data.shoes.map((s) => [s.id, s]));
  const topTypes = new Map(data.enums.topTypes.map((t) => [t.id, t]));
  const outerTypes = new Map(data.enums.outerTypes.map((t) => [t.id, t]));

  // colorRules: `${base}|${baseCategory}` → { rule, matches: Map `${category}|${color}`, avoid }
  const colorRules = new Map();
  // 역인덱스: `${category}|${color}` → [{ base, baseCategory, match }]  (신발·아우터 베이스용, gate-2 3절 1항)
  const reverse = new Map();
  for (const rule of data.colorRules) {
    if (rule.variant !== null) continue;
    const matches = new Map();
    for (const m of rule.matches) {
      const k = `${m.category}|${m.color}`;
      matches.set(k, m);
      if (!reverse.has(k)) reverse.set(k, []);
      reverse.get(k).push({ base: rule.base, baseCategory: rule.baseCategory, match: m });
    }
    const avoid = new Map();
    for (const a of rule.avoid) if (a.category && a.color) avoid.set(`${a.category}|${a.color}`, a);
    colorRules.set(`${rule.base}|${rule.baseCategory}`, { rule, matches, avoid });
  }

  const toneRules = new Map(data.toneRules.rules.map((r) => [pairKey(r.from, r.to), r]));
  const toneGroups = new Map(data.toneRules.groups.map((g) => [g.id, g]));
  const hue = data.toneRules.hue;
  const analogousOf = new Map(); // color → group id
  for (const g of hue.analogous) for (const c of g.colors) analogousOf.set(c, g.id);
  const hueExpand = (id) => (analogousOf.has(id) && !hue.analogous.some((g) => g.id === id) ? [id] : (hue.analogous.find((g) => g.id === id)?.colors ?? [id]));
  const complementary = hue.complementary.map((p) => ({ ...p, aColors: new Set(hueExpand(p.a)), bColors: new Set(hueExpand(p.b)) }));
  const achromatic = new Set(hue.achromatic);

  const matRules = new Map();
  for (const r of data.matRules) for (const p of r.pairsWith) matRules.set(pairKey(r.material, p.material), p);
  const fitRules = new Map(data.fitRules.map((f) => [`${f.topFit}|${f.bottomFit}`, f]));
  const lengthRules = new Map(data.lengthRules.map((l) => [`${l.kind}|${l.length}|${l.bottomFit}`, l]));
  const shoeRules = new Map(data.shoeRules.map((r) => [r.shoe, { bottoms: r.bottoms, lengths: new Map(r.lengths.map((l) => [l.length, l])) }]));
  const formality = new Map();
  for (const f of data.formality) {
    const k = `${f.category}|${f.id}`;
    if (!formality.has(k)) formality.set(k, []);
    formality.get(k).push(f);
  }
  const outerRules = new Map(data.outerRules.map((r) => [r.outer, { ...r, shoeMap: new Map(r.shoes.map((s) => [s.shoe, s.score])) }]));
  const layerRules = new Map(data.layerRules.map((l) => [l.season, l]));
  const outfits = new Map(data.outfits.map((o) => [o.id, o]));
  const outfitsByItem = new Map();
  for (const o of data.outfits) for (const it of o.items) {
    const k = `${it.category}|${it.color}`;
    if (!outfitsByItem.has(k)) outfitsByItem.set(k, []);
    outfitsByItem.get(k).push(o.id);
  }
  const labels = new Map(data.labels.map((l) => [l.id, l]));
  const labelMap = {};
  for (const l of data.labels) labelMap[l.id] = l.label;

  // Phase 4 (P3-01): 카테고리별 베이스 후보 색 — 자기 규칙이 있거나(bottom·top) 역참조(score ≥3)로 후보를 만들 수 있고 classic 매치가 1개 이상인 색.
  // classic 매치 수 내림차순 → 전체 매치 수 → id. UI 칩 정렬·필터용 (engine.baseColors / engine.hasBaseRule)
  const baseStats = new Map(); // `${category}|${color}` → { classic, total }
  const bump = (category, color, m) => {
    if (m.score < 3 || !colors.has(color)) return;
    const k = `${category}|${color}`;
    const s = baseStats.get(k) ?? { classic: 0, total: 0 };
    s.total++;
    if (m.tag === 'classic') s.classic++;
    baseStats.set(k, s);
  };
  for (const { rule } of colorRules.values()) for (const m of rule.matches) { bump(rule.baseCategory, rule.base, m); bump(m.category, m.color, m); }
  const hasBaseRule = (category, color) => colorRules.has(`${color}|${category}`);
  // classic 매치가 하나도 없는 색(버건디 하의, 러스트·카멜 상의, 미드그레이 신발…)은 3장이 전부 variation·계절 경고가 되므로 칩에서 뺀다
  const baseColors = (category) => [...baseStats.entries()]
    .filter(([k, s]) => k.startsWith(`${category}|`) && s.classic >= 1 && !RESERVE_COLORS.includes(k.split('|')[1]))
    .map(([k, s]) => ({ color: k.split('|')[1], ...s, hasRule: hasBaseRule(category, k.split('|')[1]) }))
    .sort((a, b) => b.classic - a.classic || b.total - a.total || a.color.localeCompare(b.color))
    .map((x) => x.color);

  // Phase 6-B (CX) 콘텐츠 확장 — 파일이 없거나 빈 배열이면 null/빈 Map → 기능 OFF (content-expansion 6-3)
  const list = (v) => (Array.isArray(v) && v.length ? v : null);
  const styles = list(data.styles);
  const affinity = new Map((data.styleAffinity ?? []).map((a) => [`${a.kind}|${a.id}`, a]));
  const occasions = new Map((data.occasions ?? []).map((o) => [o.id, o]));
  const accessoryTypes = new Map((data.accessoryTypes ?? []).map((a) => [a.id, a]));
  const accessoryRules = list(data.accessoryRules) ?? [];
  const patterns = new Map((data.patterns ?? []).map((p) => [p.id, p]));
  const patternRules = list(data.patternRules) ?? [];
  const midTypes = new Map((data.midTypes ?? []).map((m) => [m.id, m]));
  const midLayerRules = list(data.midLayerRules) ?? [];
  const twoOuterRules = list(data.twoOuterRules) ?? [];

  return {
    data, enums: data.enums, colors, materials, shoes, topTypes, outerTypes, colorRules, reverse, hasBaseRule, baseColors, baseStats,
    toneRules, toneGroups, toneRaw: data.toneRules, hue, analogousOf, complementary, achromatic,
    matRules, fitRules, lengthRules, shoeRules, formality, outerRules, layerRules, adjust: data.adjust,
    outfits, outfitsByItem, labels, labelMap,
    styles, affinity, occasions, accessoryTypes, accessoryRules, patterns, patternRules, midTypes, midLayerRules, twoOuterRules,
  };
}

const NOT_FOUND = { score: DEFAULT_SCORE, tag: null, sources: [], flags: [], note: '', found: false, avoid: null };

/** @returns {{ score: number, tag: 'classic'|'variation'|null, sources: string[], flags: string[], note: string, found: boolean, avoid: object|null }} */
export function colorPair(index, a, b) {
  const tryBase = (x, y) => {
    if (x.category !== 'bottom' && x.category !== 'top') return null;
    const r = index.colorRules.get(`${x.color}|${x.category}`);
    if (!r) return null;
    // mid(가디건·베스트)는 색 규칙이 없으므로 상의 → 아우터 행으로 대신 본다 (D-3)
    const cats = y.category === 'mid' ? ['top', 'outer'] : [y.category];
    const m = cats.map((c) => r.matches.get(`${c}|${y.color}`)).find(Boolean);
    if (!m) return null;
    return { score: m.score, tag: m.tag, sources: m.sources, flags: m.flags, note: m.note, found: true, avoid: r.avoid.get(`${y.category}|${y.color}`) ?? null, ruleId: m.ruleId ?? null };
  };
  return tryBase(a, b) ?? tryBase(b, a) ?? NOT_FOUND;
}

/** @returns {{ modifier: number, sharedTones: string[], rulesHit: string[], accentAccent: boolean }} */
export function toneModifier(index, colorA, colorB) {
  const ca = index.colors.get(colorA);
  const cb = index.colors.get(colorB);
  if (!ca || !cb) return { modifier: 0, sharedTones: [], rulesHit: [], accentAccent: false };
  let sum = 0;
  const rulesHit = [];
  const seen = new Set();
  for (const ta of ca.tones) for (const tb of cb.tones) {
    const k = ta < tb ? `${ta}|${tb}` : `${tb}|${ta}`;
    if (seen.has(k)) continue;
    seen.add(k);
    const r = index.toneRules.get(k);
    if (!r || r.modifier === 0) continue;
    if (r.limitColors && !r.limitColors.includes(colorA) && !r.limitColors.includes(colorB)) continue;
    sum += r.modifier;
    rulesHit.push(r.id);
  }
  const accentAccent = ca.tones.includes('accent') && cb.tones.includes('accent');
  if (accentAccent) sum += index.toneRaw.accentAccent;
  const sharedTones = colorA !== colorB ? ca.tones.filter((t) => cb.tones.includes(t)) : [];
  return { modifier: Math.max(-2, Math.min(1, sum)), sharedTones, rulesHit, accentAccent };
}

/** @returns {number} 1~5 */
export function fitScore(index, topFit, bottomFit) {
  return index.fitRules.get(`${topFit}|${bottomFit}`)?.score ?? DEFAULT_SCORE;
}

/** @param {'top'|'outer'|'trouser'} kind @returns {number} */
export function lengthScore(index, kind, length, bottomFit) {
  return index.lengthRules.get(`${kind}|${length}|${bottomFit}`)?.score ?? DEFAULT_SCORE;
}

/** @returns {{ score: number, note: string }} */
export function matPair(index, materialA, materialB) {
  const p = index.matRules.get(pairKey(materialA, materialB));
  return p ? { score: p.score, note: p.note } : { score: DEFAULT_SCORE, note: '' };
}

/** @param {import('./types.js').OutfitItem} bottom @returns {{ score: number, exact: boolean, lenScore: number, base: number, note: string }} */
export function shoeScore(index, shoeType, bottom) {
  const r = index.shoeRules.get(shoeType);
  if (!r) return { score: DEFAULT_SCORE, exact: false, lenScore: DEFAULT_SCORE, base: DEFAULT_SCORE, note: '' };
  const rows = r.bottoms;
  const exact = rows.find((x) => x.material === bottom.material && x.fit === bottom.fit && x.length === bottom.length);
  const lenScore = r.lengths.get(bottom.length)?.score ?? DEFAULT_SCORE;
  if (exact) return { score: exact.score, exact: true, lenScore, base: exact.score, note: exact.note };
  const row = rows.find((x) => x.material === bottom.material && x.fit === bottom.fit && x.length === '*')
    ?? rows.find((x) => x.material === bottom.material && x.fit === '*' && x.length === '*');
  const base = row?.score ?? DEFAULT_SCORE;
  return { score: Math.round(((base + lenScore) / 2) * 100) / 100, exact: false, lenScore, base, note: row?.note ?? '' };
}

/** @returns {{ score: number, bottomScore: number, shoeScore: number, note: string }} */
export function outerScore(index, outerType, bottom, shoeType) {
  const r = index.outerRules.get(outerType);
  if (!r) return { score: DEFAULT_SCORE, bottomScore: DEFAULT_SCORE, shoeScore: DEFAULT_SCORE, note: '' };
  const rows = r.bottoms;
  const row = rows.find((x) => x.material === bottom.material && x.fit === bottom.fit)
    ?? rows.find((x) => x.material === bottom.material && x.fit === '*')
    ?? rows.find((x) => x.material === '*' && x.fit === bottom.fit);
  const bottomScore = row?.score ?? DEFAULT_SCORE;
  const sScore = r.shoeMap.get(shoeType) ?? DEFAULT_SCORE;
  return { score: Math.round(((bottomScore + sScore) / 2) * 100) / 100, bottomScore, shoeScore: sScore, note: row?.note ?? '' };
}

/** @returns {number|null} */
export function formalityLevel(index, item) {
  if (item.category === 'mid') return index.midTypes?.get(item.itemType)?.formality ?? null;
  const id = item.category === 'bottom' ? item.material : item.category === 'shoes' ? item.shoeType : item.itemType;
  if (!id) return null;
  const rows = index.formality.get(`${item.category}|${id}`);
  if (!rows) return null;
  const w = item.fit ? rows.find((f) => f.when?.fit?.includes(item.fit)) : null;
  return (w ?? rows.find((f) => !f.when))?.level ?? null;
}

/** 아이템의 계절 집합 (engine-spec 3-6) */
export function itemSeasons(index, item) {
  if (item.category === 'shoes') return index.shoes.get(item.shoeType)?.seasons ?? null;
  let material = item.material;
  if (!material && item.category === 'top') material = index.topTypes.get(item.itemType)?.material ?? null;
  if (material) return index.materials.get(material)?.seasons ?? null;
  if (item.category === 'outer') return index.outerTypes.get(item.itemType)?.seasons ?? null;
  if (item.category === 'mid') return index.midTypes?.get(item.itemType)?.seasons ?? null;
  return null;
}
