// Phase 6-B (CX) 콘텐츠 확장 — 스타일 벡터·상황 적합·액세서리·패턴·미드 레이어. 순수 함수. 설계: docs/phase6/content-expansion.md 1~5·7절.
// 빌드(scripts/build-data.mjs)와 런타임이 같은 함수를 쓴다 (outfits.styles[]·occasions[] = styleTags()·occasionFit(), V-31).
import {
  K_STYLE, K_OCC, OCC_WINDOW_PENALTY, OCC_WINDOW_FLOOR, OCC_TARGET_BONUS, OCC_PREFER_BONUS, OCC_PREFER_MAX, STYLE_TAG_MIN, STYLE_TAG_RATIO, STYLE_TAGS_MAX, STYLE_SHOES_COLOR_WEIGHT, STYLE_NORM_DIV,
  PATTERN_DELTA_MIN, PATTERN_DELTA_MAX, PATTERN_FORMALITY_TOL, ACCESSORY_GROUP_ORDER, ACCESSORY_LINES_MAX, DARKER_OF, NEUTRAL_ACCESSORY_COLOR, DEFAULT_SCORE, MID_FORMALITY_TOL,
  LEATHER_FAMILY, LEATHER_FAMILY_COLOR, LEATHER_ACCESSORY_DEFAULT,
} from './constants.js';
import { formalityLevel } from './lookup.js';

const round2 = (v) => Math.round(v * 100) / 100;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const item = (outfit, cat) => outfit.items.find((i) => i.category === cat);
/** 겉 아우터(layer 2 우선) */
const outerOf = (outfit) => { const os = outfit.items.filter((i) => i.category === 'outer'); return os.length <= 1 ? os[0] ?? null : os.find((o) => o.layer === 2) ?? os[os.length - 1]; };
const arr = (v) => (Array.isArray(v) ? v : [v]);

/** 기능 ON 여부 — 새 파일이 없거나 빈 배열이면 OFF (content-expansion 6-3) */
export const hasStyles = (index) => !!(index.styles && index.styles.length);
export const hasOccasions = (index) => !!(index.occasions && index.occasions.size);
export const hasAccessories = (index) => !!(index.accessoryRules && index.accessoryRules.length);
export const hasPatterns = (index) => !!(index.patterns && index.patterns.size);
export const hasMidLayers = (index) => !!(index.midLayerRules && index.midLayerRules.length);

// ================================================================ 1. 스타일 벡터 (content-expansion 1-4)

/** 코디 하나의 affinity 조회 목록 [(kind, id, weight)] */
export function styleLookups(outfit) {
  const out = [];
  const add = (kind, id, w = 1) => { if (id) out.push([kind, id, w]); };
  const top = item(outfit, 'top'); const bottom = item(outfit, 'bottom'); const shoes = item(outfit, 'shoes'); const outer = outerOf(outfit); const mid = item(outfit, 'mid');
  if (top) { add('topType', top.itemType); add('topFit', top.fit); add('topLength', top.length); add('color', top.color); }
  if (bottom) { add('material', bottom.material); add('bottomFit', bottom.fit); add('trouserLength', bottom.length); add('color', bottom.color); }
  if (shoes) { add('shoeType', shoes.shoeType); add('color', shoes.color, STYLE_SHOES_COLOR_WEIGHT); }
  if (outer) { add('outerType', outer.itemType); add('outerLength', outer.length); add('color', outer.color); }
  if (mid) { add('midType', mid.itemType); add('color', mid.color); }
  for (const it of outfit.items) if (it.pattern) add('pattern', it.pattern);
  return out;
}

/**
 * @returns {{ vec: Record<string,number>, norm: Record<string,number>, dominant: string|null, wsum: number }|null}
 * styleVec[s] = Σ weights[kind|id][s] × 가중, styleNorm[s] = clamp(vec / (3 × Σ가중), −1, 1). 스타일 데이터 없으면 null.
 */
export function styleVector(index, outfit) {
  if (!hasStyles(index)) return null;
  const ids = index.styles.map((s) => s.id);
  const vec = Object.fromEntries(ids.map((s) => [s, 0]));
  let wsum = 0;
  for (const [kind, id, w] of styleLookups(outfit)) {
    wsum += w;
    const row = index.affinity.get(`${kind}|${id}`);
    if (!row) continue;
    for (const s of ids) vec[s] += (row.weights[s] ?? 0) * w;
  }
  const norm = {};
  for (const s of ids) { vec[s] = round2(vec[s]); norm[s] = wsum ? round2(clamp(vec[s] / (STYLE_NORM_DIV * wsum), -1, 1)) : 0; }
  let dominant = null;
  for (const s of ids) if (dominant === null || norm[s] > norm[dominant]) dominant = s; // 동점이면 styles.json 순서
  return { vec, norm, dominant, wsum: round2(wsum) };
}

/**
 * @returns {Array<{ id: string, score: number }>} 상위 ≤ STYLE_TAGS_MAX — norm ≥ STYLE_TAG_MIN && norm ≥ STYLE_TAG_RATIO × max.
 * 임계를 넘는 스타일이 없으면 dominant 1개(태그 없는 코디 0 목표). 결정적: norm 내림차순, 동점은 styles.json 순서.
 */
export function styleTags(sv, index) {
  if (!sv) return [];
  const ids = index.styles.map((s) => s.id);
  const sorted = ids.map((id, i) => ({ id, score: sv.norm[id], i })).sort((a, b) => b.score - a.score || a.i - b.i);
  const max = sorted[0]?.score ?? 0;
  const pass = sorted.filter((x) => x.score >= STYLE_TAG_MIN && x.score >= STYLE_TAG_RATIO * max);
  const picked = (pass.length ? pass : sorted.slice(0, 1)).slice(0, STYLE_TAGS_MAX);
  return picked.map(({ id, score }) => ({ id, score }));
}

/** 스타일 선택 보정 (D-1): final + K_STYLE × styleNorm[style]. 스타일 데이터 없거나 미선택이면 0 */
export function styleBoost(sv, style) {
  if (!sv || !style || sv.norm[style] === undefined) return 0;
  return round2(K_STYLE * sv.norm[style]);
}

// ================================================================ 2. 상황 (content-expansion 2절)

/** 코디의 아이템별 포멀도와 평균 (코디 객체당 캐시 — 상황 5개 × 완화 단계 × 정렬에서 반복 호출) */
const formalityCache = new WeakMap();
export function outfitFormality(index, outfit) {
  const hit = formalityCache.get(outfit);
  if (hit && hit.index === index) return hit.value;
  const levels = outfit.items.map((it) => [it, formalityLevel(index, it)]).filter(([, l]) => l !== null);
  const avg = levels.length ? levels.reduce((a, [, l]) => a + l, 0) / levels.length : null;
  const value = { levels, avg: avg === null ? null : round2(avg), min: levels.length ? Math.min(...levels.map(([, l]) => l)) : null, max: levels.length ? Math.max(...levels.map(([, l]) => l)) : null };
  formalityCache.set(outfit, { index, value });
  return value;
}

/**
 * avoid 판정. stage(완화 단계): 0 전부 · 1 patterns 제외 · 2 +materials 제외 · 3 +itemTypes 제외 (shoeTypes는 끝까지) · 4 전부 해제
 * materials는 top·bottom·outer·mid 소재에만(신발 소재는 shoeTypes로 다룬다 — sneakerWhite는 가죽이지만 active 선호 신발).
 * @returns {string|null} 걸린 이유 'itemTypes'|'shoeTypes'|'materials'|'patterns' 또는 null
 */
export function occasionAvoidHit(outfit, occ, stage = 0) {
  if (stage >= 4) return null;
  const a = occ.avoid;
  for (const it of outfit.items) {
    if (it.category === 'shoes') { if (a.shoeTypes.includes(it.shoeType)) return 'shoeTypes'; continue; }
    if (stage < 3 && it.itemType && a.itemTypes.includes(it.itemType)) return 'itemTypes';
    if (stage < 2 && it.material && a.materials.includes(it.material)) return 'materials';
    if (stage < 1 && it.pattern && a.patterns.includes(it.pattern)) return 'patterns';
  }
  return null;
}

/**
 * 상황 창 평가: 창 밖 아이템 수·거리 합·목표 안 여부·보정값.
 * C6-01: 감점은 창 경계까지의 거리(단계)에 비례 — Σ max(1, 거리) × OCC_WINDOW_PENALTY, 하한 OCC_WINDOW_FLOOR. 티셔츠(2, 격식 창 6~10에서 4단계 밖)는 −1.2, 린넨 셔츠(5)는 −0.3
 */
export function occasionWindow(index, outfit, occ) {
  const f = outfitFormality(index, outfit);
  const dist = (l) => (l < occ.formality.min ? occ.formality.min - l : l > occ.formality.max ? l - occ.formality.max : 0);
  const outsideLevels = f.levels.map(([, l]) => dist(l)).filter((d) => d > 0);
  const outside = outsideLevels.length;
  const distance = outsideLevels.reduce((a, d) => a + Math.max(1, d), 0);
  const inTarget = f.avg !== null && f.avg >= occ.formality.targetLo && f.avg <= occ.formality.targetHi;
  const penalty = Math.max(OCC_WINDOW_FLOOR, distance * OCC_WINDOW_PENALTY);
  return { outside, distance, inTarget, avg: f.avg, penalty: round2(penalty), bonus: inTarget ? OCC_TARGET_BONUS : 0 };
}

/** occasions.prefer 품목·신발 수 (C6-09) */
export function occasionPreferCount(outfit, occ) {
  const p = occ.prefer ?? {};
  let n = 0;
  for (const it of outfit.items) {
    if (it.category === 'shoes') { if ((p.shoeTypes ?? []).includes(it.shoeType)) n++; continue; }
    if (it.itemType && (p.itemTypes ?? []).includes(it.itemType)) n++;
  }
  return n;
}

/** occasionAdj = K_OCC × Σ(boost_s × styleNorm[s]) / Σboost_s + preferBonus + windowPenalty + targetBonus */
export function occasionAdjust(index, outfit, occ, sv) {
  const w = occasionWindow(index, outfit, occ);
  let styleAdj = 0;
  const boosts = Object.entries(occ.styleBoost ?? {});
  if (sv && boosts.length) {
    const sum = boosts.reduce((a, [, b]) => a + b, 0);
    styleAdj = sum ? (K_OCC * boosts.reduce((a, [s, b]) => a + b * (sv.norm[s] ?? 0), 0)) / sum : 0;
  }
  const preferN = occasionPreferCount(outfit, occ);
  const preferBonus = round2(Math.min(OCC_PREFER_MAX, preferN * OCC_PREFER_BONUS));
  return { styleAdj: round2(styleAdj), preferN, preferBonus, windowPenalty: w.penalty, targetBonus: w.bonus, outside: w.outside, distance: w.distance, avg: w.avg, total: round2(styleAdj + preferBonus + w.penalty + w.bonus) };
}

/** @returns {string[]} 빌드 타임 occasions[]: avoid에 안 걸리고(완화 0), 전 아이템 창 안, 평균이 목표 안 (6-4) */
export function occasionFit(index, outfit) {
  if (!hasOccasions(index)) return [];
  const out = [];
  for (const occ of index.occasions.values()) {
    if (occasionAvoidHit(outfit, occ, 0)) continue;
    const w = occasionWindow(index, outfit, occ);
    if (w.outside === 0 && w.inTarget) out.push(occ.id);
  }
  return out;
}

// ================================================================ 3. 패턴 (content-expansion 4절)

const SCALE_IDX = { small: 0, mid: 1, large: 2 };

function patternItems(index, outfit) {
  return outfit.items.filter((it) => it.pattern && index.patterns.has(it.pattern)).map((it) => ({ item: it, pattern: index.patterns.get(it.pattern) }));
}
const countAsTexture = (index, p) => index.patternRules.some((r) => r.effect === 'countAs' && r.countAs === 'texture' && r.when.pattern === p.id);

/** 패턴 아이템 수 (헤링본 등 countAs=texture는 제외) */
export function patternCount(index, outfit) {
  if (!hasPatterns(index)) return 0;
  return patternItems(index, outfit).filter(({ pattern }) => !countAsTexture(index, pattern)).length;
}

function sharedColor(a, b) {
  if (a.item.color === b.item.color) return true;
  return b.pattern.colorsTypical.includes(a.item.color) || a.pattern.colorsTypical.includes(b.item.color);
}

/**
 * 패턴 규칙 평가. mode 없이 호출(scoreOutfit)하면 mode 조건 규칙은 건너뛴다 — 후보 생성이 mode별로 다시 묻는다(patternExcluded).
 * @returns {{ count: number, delta: number, reasons: Reason[], blocked: boolean, hits: string[] }}
 */
export function evalPatterns(index, outfit, season, mode = null, extra = {}) {
  const none = { count: 0, delta: 0, reasons: [], blocked: false, hits: [] };
  if (!hasPatterns(index)) return none;
  const pis = patternItems(index, outfit);
  if (!pis.length) return none;
  const counted = pis.filter(({ pattern }) => !countAsTexture(index, pattern));
  const count = counted.length;
  const bottom = item(outfit, 'bottom'); const outer = outerOf(outfit); const shoes = item(outfit, 'shoes');
  const f = outfitFormality(index, outfit);
  const accentCount = outfit.items.filter((it) => index.colors.get(it.color)?.tones.includes('accent')).length;
  const tones = outfit.tags?.filter((t) => ['neutral', 'earth', 'mono', 'navyBase', 'accent', 'pastel'].includes(t)) ?? [];
  const pair = counted.length === 2 ? counted : null;
  const common = {
    mode, patternCount: count, accentCount, bottomColor: bottom?.color ?? null, bottomPattern: bottom?.pattern ?? null, outerType: outer?.itemType ?? null, shoeType: shoes?.shoeType ?? null, outfitTones: tones,
    sameFamily: pair ? pair[0].pattern.family === pair[1].pattern.family : null,
    scaleDiff: pair ? Math.abs(SCALE_IDX[pair[0].pattern.scale] - SCALE_IDX[pair[1].pattern.scale]) : null,
    sharedColor: pair ? sharedColor(pair[0], pair[1]) : (count === 1 && extra.accentColor ? counted[0].pattern.colorsTypical.includes(extra.accentColor) || counted[0].item.color === extra.accentColor : null),
    formality: f.avg,
  };
  // 패턴+포인트 컬러 공유 (ptPatternAccent): 포인트 아이템 색이 패턴 색 안에 있나
  if (count === 1 && accentCount === 1 && common.sharedColor === null) {
    const acc = outfit.items.find((it) => index.colors.get(it.color)?.tones.includes('accent'));
    common.sharedColor = acc ? counted[0].pattern.colorsTypical.includes(acc.color) || counted[0].item.color === acc.color : null;
  }
  const matchWhen = (when, props) => {
    for (const [k, v] of Object.entries(when)) {
      if (k === 'mode') { if (mode === null || mode !== v) return false; continue; }
      if (k === 'formalityMin') { if (props.formality === null || props.formality < v) return false; continue; }
      if (k === 'formalityMax') { if (props.formality === null || props.formality > v) return false; continue; }
      if (k === 'outfitTones') { if (!arr(v).some((t) => props.outfitTones.includes(t))) return false; continue; }
      if (k === 'pattern') { if (v !== 'any' && !arr(v).includes(props.pattern)) return false; continue; }
      if (k === 'otherPattern') { if (!props.otherPatterns.some((p) => arr(v).includes(p))) return false; continue; }
      if (k === 'category') { if (!arr(v).includes(props.category)) return false; continue; }
      const p = props[k];
      if (p === undefined) return false;
      if (Array.isArray(v)) { if (!v.includes(p)) return false; continue; }
      if (p !== v) return false;
    }
    return true;
  };
  const reasons = []; const hits = [];
  let delta = 0; let blocked = false;
  const apply = (rule, pi) => {
    hits.push(rule.id);
    if (rule.effect === 'countAs') return;
    if (rule.effect === 'exclude') { blocked = true; reasons.push({ key: 'explain.pattern', params: { id: rule.id, pattern: pi?.pattern.id ?? '', reason: rule.note, delta: rule.delta }, delta: rule.delta, severity: 'block', sources: rule.sources }); return; }
    delta += rule.delta;
    reasons.push({ key: 'explain.pattern', params: { id: rule.id, pattern: pi?.pattern.id ?? '', reason: rule.note, delta: rule.delta }, delta: rule.delta, severity: rule.delta < 0 ? 'warn' : 'info', sources: rule.sources });
  };
  for (const rule of index.patternRules) {
    if (rule.when.pattern !== undefined || rule.when.category !== undefined) {
      // 아이템 단위 규칙: 패턴 아이템마다 한 번
      for (const pi of pis) {
        const props = { ...common, pattern: pi.pattern.id, category: pi.item.category, otherPatterns: pis.filter((x) => x !== pi).map((x) => x.pattern.id) };
        if (matchWhen(rule.when, props)) apply(rule, pi);
      }
    } else if (matchWhen(rule.when, { ...common, otherPatterns: [] })) apply(rule, null);
  }
  return { count, delta: clamp(delta, PATTERN_DELTA_MIN, PATTERN_DELTA_MAX), reasons, blocked, hits };
}

/** 후보 생성용: mode별 패턴 상한 초과(ptQuickMaxOne·ptDeepMaxTwo 등 mode 조건 exclude 규칙) */
export function patternExcluded(index, outfit, season, mode) {
  if (!hasPatterns(index)) return false;
  if (!outfit.items.some((it) => it.pattern)) return false;
  const r = evalPatterns(index, outfit, season, mode);
  if (r.blocked) return true;
  return index.patternRules.some((rule) => rule.effect === 'exclude' && rule.when.mode === mode && rule.when.patternCount !== undefined && r.count >= rule.when.patternCount);
}

/** Deep 변주용: 상의에 입힐 수 있는 패턴 (허용 품목·색·계절·포멀도) — patterns.json 순서, 첫 번째 */
export function patternFor(index, top, season, formalityAvg) {
  if (!hasPatterns(index) || !top || top.pattern) return null;
  for (const p of index.patterns.values()) {
    if (!p.categories.includes('top') || !p.itemTypes.includes(top.itemType)) continue;
    if (!p.seasons.includes(season) || !p.colorsTypical.includes(top.color)) continue;
    if (formalityAvg !== null && Math.abs(formalityAvg - p.formality) > PATTERN_FORMALITY_TOL) continue; // C6-11: ±2 (하운드투스 7 ↔ 데님+워크 부츠 4.3 제외)
    return p;
  }
  return null;
}

// ================================================================ 4. 미드 레이어 · 2겹 아우터 (content-expansion 5절)

const matchList = (v, id) => v === 'any' || (v === 'none' ? !id : Array.isArray(v) && v.includes(id));

/**
 * mid 아이템이 있을 때의 layer 축 (가중 W_LAYER). midLayerRules에서 (season, base, mid, outer) 매칭 → score. 없으면 3.
 * 공통 규칙: 미드 포멀도 ±2 warn · 미드 기장 < 아우터 기장(regular 미드 + short 아우터 = block) · 미드 weight ≤ 아우터 weight(아니면 2)
 * @returns {{ score: number, reasons: Reason[], rule: object|null }|null}
 */
export function midLayerScore(index, outfit, season) {
  const mid = item(outfit, 'mid');
  if (!mid) return null;
  const top = item(outfit, 'top'); const outer = outerOf(outfit);
  const reasons = [];
  let rule = null;
  if (hasMidLayers(index)) {
    rule = index.midLayerRules.find((r) => r.season === season && matchList(r.base, top?.itemType) && (r.mid !== 'none' && r.mid.includes(mid.itemType)) && (outer ? matchList(r.outer, outer.itemType) : r.outer === 'none' || r.outer === 'any' || (Array.isArray(r.outer) && r.outer.includes('none')))) ?? null;
  }
  let score = rule ? rule.score : DEFAULT_SCORE;
  if (rule) reasons.push({ key: 'explain.midLayer', params: { id: rule.id, mid: mid.itemType, reason: rule.note, score }, severity: rule.tag === 'block' || score === 1 ? 'block' : rule.tag === 'variation' ? 'warn' : 'info', sources: rule.sources });
  const mt = index.midTypes?.get(mid.itemType);
  if (mt && outer) {
    const ot = index.outerTypes.get(outer.itemType);
    const L = { short: 0, regular: 1, long: 2 }; const W = { light: 0, mid: 1, heavy: 2 };
    if (L[mid.length ?? mt.length] >= L[outer.length] && outer.length === 'short') { score = 1; reasons.push({ key: 'explain.midLength', params: { mid: mid.itemType, outer: outer.itemType }, severity: 'block' }); }
    const ow = index.materials.get(outer.material ?? ot?.material)?.weight;
    if (ow && W[mt.weight] > W[ow]) { score = Math.min(score, 2); reasons.push({ key: 'explain.midWeight', params: { mid: mid.itemType, outer: outer.itemType }, severity: 'warn' }); }
    const fm = formalityLevel(index, mid); const ft = top ? formalityLevel(index, top) : null; const fo = formalityLevel(index, outer);
    if (fm !== null && ft !== null && fo !== null) {
      const lo = Math.min(ft, fo) - MID_FORMALITY_TOL; const hi = Math.max(ft, fo) + MID_FORMALITY_TOL;
      if (fm < lo || fm > hi) reasons.push({ key: 'explain.midFormality', params: { mid: mid.itemType }, severity: 'warn' });
    }
  }
  if (score === 1 && !reasons.some((r) => r.severity === 'block')) reasons.push({ key: 'explain.midLayer', params: { id: rule?.id ?? '', mid: mid.itemType, reason: rule?.note ?? '', score }, severity: 'block' });
  return { score, reasons, rule };
}

/**
 * 2겹 아우터: twoOuterRules (season, inner, outer) → score. 안쪽 기장 ≥ 바깥이면 −2(같으면 −1).
 * @returns {{ score: number, reasons: Reason[], rule: object|null }|null}
 */
export function twoOuterScore(index, outfit, season) {
  const outers = outfit.items.filter((i) => i.category === 'outer');
  if (outers.length < 2 || !index.twoOuterRules?.length) return null;
  const outer = outerOf(outfit); const inner = outers.find((o) => o !== outer);
  const rule = index.twoOuterRules.find((r) => r.season === season && matchList(r.inner, inner.itemType) && matchList(r.outer, outer.itemType)) ?? null;
  let score = rule ? rule.score : DEFAULT_SCORE;
  const reasons = [];
  if (rule) reasons.push({ key: 'explain.twoOuter', params: { id: rule.id, inner: inner.itemType, outer: outer.itemType, reason: rule.note, score }, severity: rule.tag === 'block' || score === 1 ? 'block' : rule.tag === 'variation' ? 'warn' : 'info', sources: rule.sources });
  const L = { short: 0, regular: 1, long: 2 };
  if (L[inner.length] > L[outer.length]) { score = Math.max(1, score - 2); reasons.push({ key: 'explain.twoOuterLength', params: { inner: inner.itemType, outer: outer.itemType }, severity: 'warn', delta: -2 }); }
  else if (L[inner.length] === L[outer.length]) { score = Math.max(1, score - 1); reasons.push({ key: 'explain.twoOuterLength', params: { inner: inner.itemType, outer: outer.itemType }, severity: 'warn', delta: -1 }); }
  return { score, reasons, rule };
}

/** Deep + layering: 이 코디에 넣을 수 있는 미드 타입들 (classic 규칙 ≥4만). 여름 없음 */
export function midTypesFor(index, outfit, season) {
  if (!hasMidLayers(index) || season === 'summer') return [];
  const top = item(outfit, 'top'); const outer = outerOf(outfit);
  const out = [];
  for (const r of index.midLayerRules) {
    if (r.season !== season || r.mid === 'none' || r.tag === 'block' || r.score < 4) continue;
    if (!matchList(r.base, top?.itemType)) continue;
    if (outer ? !matchList(r.outer, outer.itemType) : !(r.outer === 'none' || r.outer === 'any' || (Array.isArray(r.outer) && r.outer.includes('none')))) continue;
    for (const m of r.mid) if (!out.includes(m)) out.push(m);
  }
  return out;
}

// ================================================================ 5. 액세서리 (content-expansion 3절)

/**
 * 파생 색 계산: shoesFamily·bottomDarker·outfit·outfitSecondary·outerTone2·outerPick·neutral·free·색 id. 배열이면 값을 내는 첫 항목.
 * C6-06: shoesFamily는 신발 색이 가죽 계열(LEATHER_FAMILY)일 때만 — 흰 스니커즈에 '화이트' 가죽 토트·시계줄을 내지 않는다(다음 항목으로, 없으면 null). 버건디는 다크 브라운(C6-14)
 */
export function deriveAccessoryColor(index, outfit, spec) {
  if (!spec) return null;
  const top = item(outfit, 'top'); const bottom = item(outfit, 'bottom'); const shoes = item(outfit, 'shoes'); const outer = outerOf(outfit);
  for (const s of arr(spec)) {
    if (s === 'free') return null;
    if (s === 'shoesFamily') { if (shoes && LEATHER_FAMILY.includes(shoes.color)) return LEATHER_FAMILY_COLOR[shoes.color] ?? shoes.color; continue; }
    if (s === 'bottomDarker') return bottom ? DARKER_OF[bottom.color] ?? bottom.color : null;
    if (s === 'outfit') return top?.color ?? null;
    if (s === 'outfitSecondary') return bottom?.color ?? null;
    if (s === 'outerTone2' || s === 'outerPick') return outer?.color ?? null;
    if (s === 'neutral') return NEUTRAL_ACCESSORY_COLOR;
    if (index.colors.has(s)) return s;
  }
  return null;
}

/** accessoryRules.when 평가용 코디 속성 */
export function accessoryProps(index, outfit, season, sv, picks = {}) {
  const top = item(outfit, 'top'); const bottom = item(outfit, 'bottom'); const shoes = item(outfit, 'shoes'); const outer = outerOf(outfit);
  const f = outfitFormality(index, outfit);
  const suede = /스웨이드/.test(shoes?.itemName ?? '');
  return {
    season, shoeType: shoes?.shoeType ?? null, shoesColor: shoes?.color ?? null, shoesMaterial: shoes?.material ?? null, shoesFinish: suede ? 'suede' : 'smooth',
    bottomMaterial: bottom?.material ?? null, topType: top?.itemType ?? null, outerType: outer?.itemType ?? null, outerPattern: outer ? outer.pattern ?? null : null,
    trouserLength: bottom?.length ?? null, hasOuter: !!outer, formality: f.avg,
    patternCount: patternCount(index, outfit), accentCount: outfit.items.filter((it) => index.colors.get(it.color)?.tones.includes('accent')).length,
    style: sv?.dominant ?? null, tuckIn: picks.tuckIn ?? false, belt: picks.belt ?? null, watch: picks.watch ?? null, beltColor: picks.beltColor ?? null, material: picks.material ?? null,
  };
}

function accWhen(when, props) {
  for (const [k, v] of Object.entries(when)) {
    if (k === 'formalityMin') { if (props.formality === null || props.formality < v) return false; continue; }
    if (k === 'formalityMax') { if (props.formality === null || props.formality > v) return false; continue; }
    if (k === 'outerPattern') { if (!props.hasOuter) return false; if (v === null) { if (props.outerPattern !== null) return false; continue; } if (!arr(v).includes(props.outerPattern)) return false; continue; }
    if (k === 'material') { if (props.material === null || !arr(v).includes(props.material)) return false; continue; } // C6-06: 가방 소재가 안 정해졌으면(null) 가죽 통일 규칙은 발화하지 않는다
    const p = props[k];
    if (p === undefined) return false;
    if (Array.isArray(v)) { if (!v.includes(p)) return false; continue; }
    if (p !== v) return false;
  }
  return true;
}

/**
 * 소품 제안 — 소품 그룹별 1개, 최대 ACCESSORY_LINES_MAX줄. 점수 무영향(설명만).
 * 1패스: belt·watch·beltColor 조건 없는 규칙 → 벨트·시계 결정. 2패스: 그 결과로 나머지(가죽 통일·금속 통일·경고).
 * 같은 그룹에 규칙 2개 이상이면 delta 큰 것 → 출처 수 → id 순. forced: { belt, beltColor, watch, tuckIn } 강제값(테스트·설정용).
 * @returns {Array<{ group, id, color, note, severity, ruleId, delta, key }>}
 */
export function suggestAccessories(index, outfit, season, sv, opts = {}) {
  if (!hasAccessories(index)) return [];
  const forced = typeof opts === 'object' && opts !== null ? opts : {};
  const occ = forced.occasion && index.occasions?.get(forced.occasion);
  const typeOf = (id) => index.accessoryTypes.get(id);
  const fAvg = outfitFormality(index, outfit).avg;
  // C6-08: 소품 종류의 계절 + 포멀도 창(accessoryTypes.formality)을 규칙 경로에서도 지킨다 — 볼캡(≤5)은 트렌치·블레이저 카드에, 웨빙 벨트(≤4)는 옥스포드+치노 카드에 안 나온다
  const fits = (t) => !!t && t.seasons.includes(season) && (fAvg === null || (fAvg >= t.formality.min && fAvg <= t.formality.max));
  const cands = new Map(); // group → [{...}]
  const negatives = []; // delta < 0 규칙: 그 소품이 실제로 골라졌거나(forced·pick) 강제됐을 때만 경고
  const consider = (rule, props) => {
    if (!accWhen(rule.when, props)) return;
    for (const accId of rule.accessory) {
      const t = typeOf(accId);
      if (!t) continue;
      if (rule.pick?.skip) { cands.set(t.group, [{ skip: true, ruleId: rule.id, delta: rule.delta, sources: rule.sources.length }]); continue; }
      if (rule.delta < 0) { negatives.push({ group: t.group, id: accId, note: rule.note, ruleId: rule.id, delta: rule.delta }); continue; }
      if (!fits(t)) continue;
      const list = cands.get(t.group) ?? [];
      if (list.some((x) => x.skip)) continue;
      list.push({ group: t.group, id: accId, color: deriveAccessoryColor(index, outfit, rule.pick?.color), note: rule.note, severity: rule.severity, ruleId: rule.id, delta: rule.delta, sources: rule.sources.length, key: `explain.acc.${rule.id}`, pick: rule.pick ?? {} });
      cands.set(t.group, list);
    }
  };
  const dependent = (r) => ['belt', 'watch', 'beltColor', 'material'].some((k) => r.when[k] !== undefined);
  const props1 = accessoryProps(index, outfit, season, sv, forced);
  for (const rule of index.accessoryRules) if (!dependent(rule)) consider(rule, props1);
  const best = (group) => { const list = (cands.get(group) ?? []).filter((x) => !x.skip); return list.sort((a, b) => b.delta - a.delta || b.sources - a.sources || a.ruleId.localeCompare(b.ruleId))[0] ?? null; };
  const belt = forced.belt ?? best('belt')?.id ?? null;
  const watch = forced.watch ?? best('watch')?.id ?? null;
  const beltColor = forced.beltColor ?? best('belt')?.color ?? null;
  const props2 = accessoryProps(index, outfit, season, sv, { ...forced, belt, watch, beltColor, material: best('bag')?.pick?.material ? arr(best('bag').pick.material)[0] : null });
  for (const rule of index.accessoryRules) if (dependent(rule)) consider(rule, props2);
  const forcedIds = new Set([forced.belt, forced.watch, forced.socks, forced.bag, forced.hat, forced.scarf].filter(Boolean));
  const warnings = negatives
    .filter((n) => forcedIds.has(n.id) || best(n.group)?.id === n.id || (n.group === 'belt' && forced.beltColor && (best('belt')?.id === n.id || belt === n.id)))
    .map((n) => ({ group: n.group, id: n.id, color: n.group === 'belt' ? (forced.beltColor ?? beltColor ?? null) : null, note: n.note, severity: 'warn', ruleId: n.ruleId, delta: n.delta, key: `explain.acc.${n.ruleId}` }));
  // 상황 기본값: 그룹이 비었으면 occasions.accessories에서 창·계절 맞는 것. colorFrom shoes는 가죽 계열 신발 색, 아니면 블랙(C6-06: 흰 스니커즈 → '화이트 가죽 시계' 금지)
  if (occ) for (const accId of occ.accessories) {
    const t = typeOf(accId);
    if (!t || cands.has(t.group) || !fits(t)) continue;
    const colorSpec = t.colorFrom === 'shoes' ? ['shoesFamily', LEATHER_ACCESSORY_DEFAULT] : t.colorFrom === 'bottom' ? 'bottomDarker' : t.colorFrom;
    cands.set(t.group, [{ group: t.group, id: accId, color: deriveAccessoryColor(index, outfit, colorSpec), note: t.note, severity: 'info', ruleId: `occasion.${occ.id}`, delta: 0, sources: 0, key: `explain.acc.occasion`, pick: {} }]);
  }
  const out = [];
  for (const group of ACCESSORY_GROUP_ORDER) {
    const b = best(group);
    if (!b) continue;
    const { pick, sources, ...rest } = b;
    out.push({ ...rest, material: pick.material ? arr(pick.material)[0] : null, finish: pick.finish ?? null });
    if (out.length >= ACCESSORY_LINES_MAX) break;
  }
  return [...out, ...warnings];
}
