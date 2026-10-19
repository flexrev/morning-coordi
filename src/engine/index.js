// 엔진 공개 API — engine-spec.md 8절 index.js. 앱은 createEngine()만 쓴다.
import { buildIndex } from './lookup.js';
import { scoreOutfit } from './score.js';
import { generateCandidates, pickClassic, materialize, outfitSignature } from './candidates.js';
import { groupByTone, groupByHue, makeVariations } from './groups.js';
import { explainScore, explainShort, formatReason, captionOutfit, itemCaption } from './explain.js';
import { recommend, avoidList } from './recommend.js';
import { validateData } from './validate.js';
import { MEMO_SIZE } from './constants.js';

const baseKey = (b) => ['category', 'color', 'material', 'fit', 'shoeType', 'itemType'].map((k) => b[k] ?? '').join(':');

/**
 * 인덱스 생성 + 메모이즈(LRU 20, 키 = base 시그니처|season|mode).
 * @returns {{ recommend: Function, score: Function, explain: Function, explainShort: Function, caption: Function, itemCaption: Function, materialize: Function, index: object, labels: Record<string,string> }}
 * deep 결과에는 avoid[] (S4 "피할 것")가 실린다 — recommend.js avoidList.
 */
export function createEngine(data) {
  if (!data || !data.colors || !data.colorRules) throw new Error('createEngine: data 객체가 필요합니다 (src/data/index.js의 data)');
  const index = buildIndex(data);
  const labels = index.labelMap;
  const memo = new Map();
  const memoRecommend = (query) => {
    const key = `${baseKey(query.base)}|${query.season}|${query.mode ?? 'quick'}`;
    if (memo.has(key)) { const v = memo.get(key); memo.delete(key); memo.set(key, v); return v; }
    const r = recommend(index, query);
    memo.set(key, r);
    if (memo.size > MEMO_SIZE) memo.delete(memo.keys().next().value);
    return r;
  };
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
    index,
    labels,
  };
}

export { josa } from './explain.js';
export {
  recommend,
  avoidList,
  scoreOutfit,
  generateCandidates,
  pickClassic,
  materialize,
  outfitSignature,
  groupByTone,
  groupByHue,
  makeVariations,
  explainScore,
  explainShort,
  formatReason,
  captionOutfit,
  itemCaption,
  validateData,
  buildIndex,
};
