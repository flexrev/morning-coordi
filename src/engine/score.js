// 점수 합산 — engine-spec.md 2·3절. 구현: C2.
import { WEIGHTS, W_COLOR, W_STYLE, K_ADJ, FORMALITY_WARN, FORMALITY_BLOCK, FORMALITY_EXEMPT_SOURCES, SEASON_COLOR_PENALTY, DEFAULT_SCORE, PAIR_WEIGHT_TOP_OUTER, LAYER_OVER_PENALTY } from './constants.js';
import { colorPair, toneModifier, fitScore, lengthScore, matPair, shoeScore, outerScore, formalityLevel, itemSeasons } from './lookup.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const round2 = (v) => Math.round(v * 100) / 100;
const by = (outfit, cat) => outfit.items.filter((i) => i.category === cat);
const SEV_ORDER = { block: 0, warn: 1, info: 2 };

/** 겉 아우터(layer 2 우선) */
export function outerOf(outfit) {
  const outers = by(outfit, 'outer');
  if (outers.length === 0) return null;
  if (outers.length === 1) return outers[0];
  return outers.find((o) => o.layer === 2) ?? outers[outers.length - 1];
}
const parts = (outfit) => ({ top: by(outfit, 'top')[0], bottom: by(outfit, 'bottom')[0], shoes: by(outfit, 'shoes')[0], outer: outerOf(outfit), outerCount: by(outfit, 'outer').length });

/** @returns {import('./types.js').AxisScore} */
export function scoreColorAxis(index, outfit, season) {
  const { top, bottom, shoes, outer } = parts(outfit);
  const reasons = [];
  const pairs = [[bottom, top, 1], [bottom, shoes, 1]];
  if (outer) pairs.push([bottom, outer, 1], [top, outer, PAIR_WEIGHT_TOP_OUTER]);
  let sum = 0;
  let wsum = 0;
  let toneSum = 0;
  let allClassic = true;
  let anyVariation = false;
  let minSources = Infinity;
  let minPair = 5;
  let blocked = false;
  for (const [a, b, w] of pairs) {
    const p = colorPair(index, a, b);
    sum += p.score * w;
    wsum += w;
    if (p.found) minPair = Math.min(minPair, p.score); // Phase 4: 규칙 없는 쌍(상의↔아우터 등)은 등급(minPair)에 안 섞음 — ruleMissing info로만
    const params = { a: a.color, b: b.color, aCategory: a.category, bCategory: b.category, score: p.score, tag: p.tag ?? '', sourceCount: p.sources.length };
    if (!p.found) {
      reasons.push({ key: 'explain.ruleMissing', params, severity: 'info' });
    } else {
      if (p.tag !== 'classic') allClassic = false;
      if (p.tag === 'variation') anyVariation = true;
      minSources = Math.min(minSources, p.sources.length);
      if (p.score === 1) { blocked = true; reasons.push({ key: 'explain.avoid', params: { ...params, reason: p.avoid?.reason ?? p.note ?? '' }, severity: 'block', sources: p.sources }); }
      else if (p.score === 2) reasons.push({ key: 'explain.adventurous', params, severity: 'warn', sources: p.sources });
      if (p.flags.includes('disputed')) reasons.push({ key: 'explain.disputed', params: { ...params, note: p.note ?? '' }, severity: 'info', sources: p.sources });
    }
    const t = toneModifier(index, a.color, b.color);
    toneSum += t.modifier;
    if (t.modifier > 0) {
      const ta = index.colors.get(a.color).tones; const tb = index.colors.get(b.color).tones;
      const rule = index.toneRaw.rules.find((r) => r.id === t.rulesHit[0]);
      const from = rule && ta.includes(rule.from) ? rule.from : rule?.to; const to = rule && from === rule.from ? rule.to : rule?.from;
      reasons.push({ key: 'explain.toneCross', params: { from: from ?? '', to: to ?? '', a: a.color, b: b.color }, severity: 'info', delta: t.modifier });
    }
    if (t.sharedTones.length) reasons.push({ key: 'explain.toneOnTone', params: { tone: t.sharedTones[0], a: a.color, b: b.color }, severity: 'info' });
    if (t.accentAccent) reasons.push({ key: 'explain.accentAccent', params: { a: a.color, b: b.color }, severity: 'warn', delta: index.toneRaw.accentAccent });
  }
  // P3-11 (R1 T6 '포인트 컬러는 1개만'): 쌍 규칙이 못 보는 상의↔신발·같은 색 id 포함, 코디 전체 accent 아이템 ≥2이면 한 번 감점
  const accentItems = outfit.items.filter((it) => index.colors.get(it.color)?.tones.includes('accent'));
  if (accentItems.length >= 2 && !reasons.some((r) => r.key === 'explain.accentAccent')) {
    toneSum += index.toneRaw.accentAccent;
    reasons.push({ key: 'explain.accentAccent', params: { a: accentItems[0].color, b: accentItems[1].color }, severity: 'warn', delta: index.toneRaw.accentAccent });
  }
  const mean = wsum ? sum / wsum : DEFAULT_SCORE;
  const toneMod = clamp(toneSum, -2, 1);
  // 계절 보정 (2-3)
  let seasonMod = 0;
  for (const it of outfit.items) {
    const c = index.colors.get(it.color);
    if (!c || c.seasons.includes(season)) continue;
    const d = c.tones.includes('accent') ? SEASON_COLOR_PENALTY.accentOut : SEASON_COLOR_PENALTY.out;
    seasonMod += d;
    reasons.push({ key: 'explain.seasonOut', params: { color: it.color, season, item: it.itemName, category: it.category }, severity: 'warn', delta: d });
  }
  seasonMod = Math.max(-2, seasonMod);
  if (allClassic && pairs.length) reasons.unshift({ key: 'explain.classic', severity: 'info' });
  else if (anyVariation) reasons.unshift({ key: 'explain.variation', severity: 'info' });
  if (Number.isFinite(minSources) && minSources >= 2) reasons.push({ key: 'explain.sources2', params: { n: minSources }, severity: 'info' });
  const score = clamp(mean + toneMod + seasonMod, 1, 5);
  return { axis: 'color', score: round2(score), weight: W_COLOR, reasons, detail: { mean: round2(mean), toneMod, seasonMod, blocked, allClassic, minPair } };
}

/** @returns {{ gap: number, hi: object|null, lo: object|null, penalty: number, blocked: boolean }} */
export function formalityGap(index, outfit) {
  let hi = null; let lo = null; let hiL = -Infinity; let loL = Infinity;
  for (const it of outfit.items) {
    const l = formalityLevel(index, it);
    if (l === null) continue;
    if (l > hiL) { hiL = l; hi = it; }
    if (l < loL) { loL = l; lo = it; }
  }
  if (!hi) return { gap: 0, hi: null, lo: null, penalty: 0, blocked: false, hiLevel: null, loLevel: null };
  const gap = hiL - loL;
  const variation = outfit.tags?.includes('variation');
  // D1(c): 연구에서 2개 이상 출처가 클래식으로 표시한 코디는 차단 대신 경고(패널티 2)
  const exempt = outfit.isClassic && (outfit.sources?.length ?? 0) >= FORMALITY_EXEMPT_SOURCES;
  if (gap >= FORMALITY_BLOCK) return { gap, hi, lo, penalty: 2, blocked: !variation && !exempt, hiLevel: hiL, loLevel: loL };
  if (gap >= FORMALITY_WARN) return { gap, hi, lo, penalty: 1, blocked: false, hiLevel: hiL, loLevel: loL };
  return { gap, hi, lo, penalty: 0, blocked: false, hiLevel: hiL, loLevel: loL };
}

/** adjust.when 평가용 파생 속성 (engine-spec 3-7) */
export function deriveProps(index, outfit, season) {
  const { top, bottom, shoes, outer } = parts(outfit);
  const mats = [top, bottom, outer].filter((i) => i && i.material).map((i) => i.material);
  const weights = new Set(mats.map((m) => index.materials.get(m)?.weight).filter(Boolean));
  const colorCount = new Set(outfit.items.filter((i) => !(i.category === 'shoes' && index.colors.get(i.color)?.tones.includes('neutral'))).map((i) => i.color)).size;
  return {
    season, trouserLength: bottom.length, topLength: top.length, outerLength: outer?.length ?? null, bottomFit: bottom.fit, topFit: top.fit,
    shoe: shoes.shoeType, bottomMaterial: bottom.material, topMaterial: top.material, outerMaterial: outer?.material ?? null,
    bottomWeight: index.materials.get(bottom.material)?.weight ?? null, materialWeights: weights, colorCountMin: colorCount,
    sameColorTopBottom: top.color === bottom.color, topColor: top.color, bottomColor: bottom.color, shoesColor: shoes.color, outerColor: outer?.color ?? null, hasOuter: !!outer,
  };
}

function whenMatches(when, props) {
  for (const [k, v] of Object.entries(when)) {
    const p = props[k];
    if (k === 'materialWeights') { if (!v.every((w) => p.has(w))) return false; continue; }
    if (k === 'colorCountMin') { if (!(p >= v)) return false; continue; }
    if (Array.isArray(v)) { if (!v.includes(p)) return false; continue; }
    if (p !== v) return false;
  }
  return true;
}

/** @returns {import('./types.js').OutfitScore['style']} */
export function scoreStyleAxes(index, outfit, season) {
  const { top, bottom, shoes, outer, outerCount } = parts(outfit);
  const axis = (name, score, weight, reasons = []) => ({ axis: name, score: round2(score), weight, reasons });

  // 3-1 핏
  const fitS = fitScore(index, top.fit, bottom.fit);
  const fit = axis('fit', fitS, WEIGHTS.fit, [{ key: 'explain.fitScore', params: { score: fitS, topFit: top.fit, bottomFit: bottom.fit }, severity: fitS === 1 ? 'block' : 'info' }]);

  // 3-2 기장
  const lens = [lengthScore(index, 'top', top.length, bottom.fit), lengthScore(index, 'trouser', bottom.length, bottom.fit)];
  if (outer) lens.push(lengthScore(index, 'outer', outer.length, bottom.fit));
  const lenS = lens.reduce((a, b) => a + b, 0) / lens.length;
  const len = axis('len', lenS, WEIGHTS.len, lens.some((s) => s === 1) ? [{ key: 'explain.lengthBlock', severity: 'block' }] : []);

  // 3-3 소재
  const matPairs = [[top, bottom], [bottom, shoes]];
  if (outer) matPairs.push([bottom, outer], [top, outer]);
  const matReasons = [];
  let matSum = 0; let matN = 0;
  for (const [a, b] of matPairs) {
    if (!a.material || !b.material) continue;
    const p = matPair(index, a.material, b.material);
    matSum += p.score; matN++;
    if (p.score <= 2) matReasons.push({ key: 'explain.matClash', params: { a: a.material, b: b.material, score: p.score, note: p.note }, severity: p.score === 1 ? 'block' : 'warn' });
  }
  const matS = matN ? matSum / matN : DEFAULT_SCORE;
  if (matN) matReasons.push({ key: 'explain.matScore', params: { score: round2(matS) }, severity: 'info' });
  const mat = axis('mat', matS, WEIGHTS.mat, matReasons);

  // 3-4 신발
  const sh = shoeScore(index, shoes.shoeType, bottom);
  const shoeReasons = [{ key: 'explain.shoeScore', params: { shoe: shoes.shoeType, score: sh.score }, severity: sh.score === 1 ? 'block' : 'info' }];
  if (sh.lenScore <= 2) shoeReasons.push({ key: 'explain.shoeLength', params: { shoe: shoes.shoeType, length: bottom.length, score: sh.lenScore }, severity: 'warn' });
  const shoe = axis('shoe', sh.score, WEIGHTS.shoe, shoeReasons);

  // 3-5 아우터
  let outerAxis = null;
  if (outer) {
    const o = outerScore(index, outer.itemType, bottom, shoes.shoeType);
    outerAxis = axis('outer', o.score, WEIGHTS.outer, [{ key: 'explain.outerScore', params: { outer: outer.itemType, score: o.score }, severity: o.score === 1 ? 'block' : 'info' }]);
  }

  // 3-6 계절
  const seasonReasons = [];
  let k = 0;
  for (const it of outfit.items) {
    const s = itemSeasons(index, it);
    if (s && !s.includes(season)) { k++; seasonReasons.push({ key: 'explain.seasonItem', params: { item: it.itemName, season, category: it.category }, severity: 'warn' }); }
  }
  let seasonS = Math.max(1, 5 - 2 * k);
  const maxLayers = index.layerRules.get(season)?.maxLayers ?? 3;
  const layers = 1 + outerCount;
  if (layers > maxLayers) { seasonS = Math.max(1, seasonS + LAYER_OVER_PENALTY); seasonReasons.push({ key: 'explain.layerOver', params: { season, layers, maxLayers }, severity: 'warn', delta: LAYER_OVER_PENALTY }); }
  if (seasonS === 1) seasonReasons.push({ key: 'explain.seasonBlock', params: { season }, severity: 'block' });
  const seasonAxis = axis('season', seasonS, WEIGHTS.season, seasonReasons);

  // 3-7 가감점
  const props = deriveProps(index, outfit, season);
  const adjReasons = [];
  let delta = 0;
  for (const rule of index.adjust) {
    if (!whenMatches(rule.when, props)) continue;
    const disputed = rule.flags?.includes('disputed');
    delta += rule.delta;
    const key = rule.id === 'adjFourColors' ? 'explain.fourColors' : rule.id === 'adjSameColorTopBottom' ? 'explain.sameColor' : 'explain.adjust';
    adjReasons.push({ key, params: { id: rule.id, reason: rule.reason, delta: rule.delta }, delta: rule.delta, severity: disputed || rule.delta === 0 ? 'info' : rule.delta < 0 ? 'warn' : 'info', sources: rule.sources });
  }
  const adjust = { axis: 'adjust', score: delta, weight: K_ADJ, reasons: adjReasons };

  // 3-8 포멀도
  const fg = formalityGap(index, outfit);
  const fReasons = [];
  if (fg.gap >= FORMALITY_WARN) fReasons.push({ key: 'explain.formalityGap', params: { gap: fg.gap, hi: fg.hi?.itemName ?? '', lo: fg.lo?.itemName ?? '', hiLevel: fg.hiLevel, loLevel: fg.loLevel }, severity: fg.blocked ? 'block' : 'warn', delta: -fg.penalty });
  const formality = { axis: 'formality', score: 5 - fg.penalty, weight: 1, reasons: fReasons, gap: fg.gap, penalty: fg.penalty, blocked: fg.blocked };

  return { fit, len, mat, shoe, outer: outerAxis, season: seasonAxis, adjust, formality };
}

/** @returns {import('./types.js').OutfitScore} */
export function scoreOutfit(index, outfit, season) {
  const color = scoreColorAxis(index, outfit, season);
  const style = scoreStyleAxes(index, outfit, season);
  // P3-19: 격차 4(경고 임계, 차단 아님)는 전 쌍 classic 코디(티셔츠+페니 로퍼, 체스터필드+인디고)에서 문구만 숨김 — 패널티 1은 유지, S6는 reasons에서 계속 읽음
  if (color.detail.allClassic && style.formality.gap < FORMALITY_BLOCK - 1) for (const r of style.formality.reasons) if (r.key === 'explain.formalityGap' && r.severity === 'warn') r.severity = 'info';
  const axes = [style.fit, style.len, style.mat, style.shoe, style.season];
  if (style.outer) axes.push(style.outer);
  const wsum = axes.reduce((a, x) => a + x.weight, 0);
  const raw = axes.reduce((a, x) => a + x.weight * x.score, 0) + K_ADJ * (style.adjust.score - style.formality.penalty);
  const styleNorm = clamp(raw / wsum, 1, 5);
  const final = round2((W_COLOR * color.score + W_STYLE * styleNorm) / (W_COLOR + W_STYLE));
  const reasons = [...color.reasons, ...axes.flatMap((x) => x.reasons), ...style.adjust.reasons, ...style.formality.reasons]
    .sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);
  const blocked = color.detail.blocked || axes.some((x) => x.score === 1) || style.formality.blocked || style.mat.reasons.some((r) => r.severity === 'block');
  return {
    final, percent: Math.round(((final - 1) / 4) * 100), blocked, color, style,
    styleNorm: round2(styleNorm),
    reasons, warnings: reasons.filter((r) => r.severity === 'warn'), blockReasons: reasons.filter((r) => r.severity === 'block'),
  };
}
