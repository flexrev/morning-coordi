// 엔진 공개 API — engine-spec.md 8절 index.js. 앱은 createEngine()만 쓴다.
// Phase 6-B (CX): recommend(query) 또는 recommend(base, season, mode, { style, occasion, accessories, layering, patterns }) — content-expansion.md 7-1
import { buildIndex } from './lookup.js';
import { scoreOutfit } from './score.js';
import { generateCandidates, pickClassic, quickPool, materialize, outfitSignature } from './candidates.js';
import { groupByTone, groupByHue, makeVariations, groupByStyle, groupByOccasion, makePatternVariations } from './groups.js';
import { explainScore, explainShort, formatReason, captionOutfit, itemCaption } from './explain.js';
import { recommend, avoidList, normalizeOptions } from './recommend.js';
import { validateData } from './validate.js';
import { MEMO_SIZE } from './constants.js';
import { styleVector, styleTags, styleBoost, occasionFit, occasionAdjust, occasionAvoidHit, suggestAccessories, evalPatterns, patternExcluded, midLayerScore, twoOuterScore } from './style.js';

const baseKey = (b) => ['category', 'color', 'material', 'fit', 'shoeType', 'itemType'].map((k) => b[k] ?? '').join(':');
const accKey = (a) => (!a ? '0' : a === true ? '1' : JSON.stringify(a));

/** 두 호출 형태를 하나의 query로: (query) | (query, opts) | (base, season, mode, opts) */
export function toQuery(a, b, c, d) {
  if (a && typeof a === 'object' && 'base' in a) return { ...a, ...(b && typeof b === 'object' ? b : {}) };
  return { base: a, season: b, mode: c ?? 'quick', ...(d && typeof d === 'object' ? d : {}) };
}

/**
 * 인덱스 생성 + 메모이즈(LRU 20, 키 = base 시그니처|season|mode|style|occasion|accessories|layering|patterns).
 * @returns {{ recommend: Function, score: Function, explain: Function, explainShort: Function, caption: Function, itemCaption: Function, materialize: Function, styles: Function, occasions: Function, index: object, labels: Record<string,string> }}
 * deep 결과에는 avoid[] (S4 "피할 것"), byStyle[]·byOccasion[] (Phase 6-B)가 실린다.
 */
export function createEngine(data) {
  if (!data || !data.colors || !data.colorRules) throw new Error('createEngine: data 객체가 필요합니다 (src/data/index.js의 data)');
  const index = buildIndex(data);
  const labels = index.labelMap;
  const memo = new Map();
  const memoRecommend = (...args) => {
    const query = toQuery(...args);
    const o = normalizeOptions(index, query);
    const key = `${baseKey(query.base)}|${query.season}|${query.mode ?? 'quick'}|${o.style ?? ''}|${o.occasion ?? ''}|${accKey(query.accessories)}|${o.layering ? 1 : 0}|${o.patterns ? 1 : 0}`;
    if (memo.has(key)) { const v = memo.get(key); memo.delete(key); memo.set(key, v); return v; }
    const r = recommend(index, query);
    memo.set(key, r);
    if (memo.size > MEMO_SIZE) memo.delete(memo.keys().next().value);
    return r;
  };
  const styleInfo = (s) => ({ id: s.id, label: labels[`style.${s.id}`] ?? s.labelKo, shortLabel: index.labels.get(`style.${s.id}`)?.shortLabel ?? s.labelKo, help: index.labels.get(`style.${s.id}`)?.help ?? '', phase: s.phase });
  return {
    recommend: memoRecommend,
    score: (outfit, season) => scoreOutfit(index, outfit, season),
    explain: (score, outfit) => explainScore(score, labels, outfit),
    explainShort: (score, outfit) => explainShort(score, labels, outfit),
    caption: (outfit) => captionOutfit(outfit, labels, index),
    itemCaption: (item) => itemCaption(item, labels, index),
    materialize: (category, color, season, overrides) => materialize(index, category, color, season, overrides),
    // Phase 4 (P3-01) — UI 칩 정렬·필터용
    /** @param {'top'|'bottom'|'shoes'|'outer'} category @param {string} color @returns {boolean} colorRules에 `${color}|${category}` 베이스 규칙이 있는가 (bottom·top만 true 가능) */
    hasBaseRule: index.hasBaseRule,
    /** @param {'top'|'bottom'|'shoes'|'outer'} category @returns {string[]} 그 카테고리에서 베이스로 쓸 수 있는 색 id — 자기 규칙 또는 역참조(score ≥3)로 후보가 생기는 색. classic 매치 수 내림차순 → 전체 매치 수 → id. 예비 색(teal·taupe) 제외 */
    baseColors: index.baseColors,
    // Phase 6-B (CX) — UI 칩용. 데이터 없으면 빈 배열(기능 OFF)
    /** @param {{ all?: boolean }} [o] @returns {Array<{ id, label, shortLabel, help, phase }>} 1차 범위(phase 1) 스타일. all: true면 8개 전부 */
    styles: (o = {}) => (index.styles ?? []).filter((s) => o.all || s.phase === 1).map(styleInfo),
    /** @returns {Array<{ id, label, shortLabel, help }>} 상황 프리셋 5개 (occasions.json 순) */
    occasions: () => [...(index.occasions?.values() ?? [])].map((oc) => ({ id: oc.id, label: labels[`occasion.${oc.id}`] ?? oc.labelKo, shortLabel: index.labels.get(`occasion.${oc.id}`)?.shortLabel ?? oc.labelKo, help: index.labels.get(`occasion.${oc.id}`)?.help ?? '' })),
    index,
    labels,
  };
}

export { josa } from './explain.js';
export {
  recommend,
  avoidList,
  normalizeOptions,
  scoreOutfit,
  generateCandidates,
  pickClassic,
  quickPool,
  materialize,
  outfitSignature,
  groupByTone,
  groupByHue,
  makeVariations,
  groupByStyle,
  groupByOccasion,
  makePatternVariations,
  explainScore,
  explainShort,
  formatReason,
  captionOutfit,
  itemCaption,
  validateData,
  buildIndex,
  // Phase 6-B (CX)
  styleVector,
  styleTags,
  styleBoost,
  occasionFit,
  occasionAdjust,
  occasionAvoidHit,
  suggestAccessories,
  evalPatterns,
  patternExcluded,
  midLayerScore,
  twoOuterScore,
};
