// Phase 6-B (CX): docs/phase6/content-expansion-data.md 표 → styles / styleAffinity / occasions / accessoryTypes / accessoryRules /
// patterns / patternRules / midTypes / midLayerRules / twoOuterRules (+ CX 출처 코드표). 설계: docs/phase6/content-expansion.md 1~6절.
// 표 규약: `### N-M.` 제목 아래 첫 표. 다중 값 `,`, 빈 값 `-`, 조건 `키=값;키=값`(; = AND, 쉼표 = OR).
import { readDoc, readTable, sortSeasons } from './util.mjs';

const DOC = 'docs/phase6/content-expansion-data.md';
const STYLE_IDS = ['minimal', 'amekaji', 'cityboy', 'bizcasual', 'street', 'gorpcore', 'ivy', 'workwear'];
// PM 결정(gate-5 2절 D-1): 1차 범위 4개. 표의 phase는 이 목록이 우선한다
export const PHASE1_STYLES = ['minimal', 'bizcasual', 'ivy', 'amekaji'];

const lines = () => readDoc(DOC).split(/\r?\n/);

/** `### N-M.` 제목으로 표 찾기 */
function table(sectionNo) {
  const ls = lines();
  const i = ls.findIndex((l) => l.startsWith(`### ${sectionNo}.`));
  if (i < 0) throw new Error(`styles.mjs: 표 ${sectionNo} 없음 (${DOC})`);
  const { header, rows } = readTable(ls, i + 1);
  return rows.map((r) => Object.fromEntries(header.map((h, j) => [h.trim(), (r[j] ?? '').trim()])));
}

const empty = (v) => v === '' || v === '-';
const list = (v) => (empty(v) ? [] : v.split(',').map((s) => s.trim()).filter(Boolean));
const int = (v, path) => { const n = Number(v); if (!Number.isInteger(n)) throw new Error(`styles.mjs: 정수 아님 ${path}: ${v}`); return n; };
const nullable = (v) => (empty(v) || v === 'null' ? null : v);
/** `키=값;키=값` → { 키: 값 | [값...] } (쉼표 = OR → 배열) */
function cond(text) {
  const out = {};
  if (empty(text)) return out;
  for (const part of text.split(';')) {
    const [k, v] = part.split('=').map((s) => s.trim());
    if (!k) continue;
    if (v === undefined) { out[k] = true; continue; }
    const vals = v.split(',').map((s) => s.trim());
    const cast = (x) => (x === 'true' ? true : x === 'false' ? false : x === 'null' ? null : /^-?\d+$/.test(x) ? Number(x) : x);
    out[k] = vals.length > 1 ? vals.map(cast) : cast(vals[0]);
  }
  return out;
}
/** `bizcasual=2,minimal=1` → { bizcasual: 2, minimal: 1 } */
function weightsMap(text) {
  const out = {};
  for (const p of list(text)) { const [k, v] = p.split('='); out[k.trim()] = int(v, `styleBoost ${k}`); }
  return out;
}

// ---------------------------------------------------------------- 1-1 styles
export function buildStyles() {
  return table('1-1').map((r) => ({
    id: r.id, labelKo: r.labelKo, labelEn: r.labelEn,
    phase: PHASE1_STYLES.includes(r.id) ? 1 : 2,
    formality: { min: int(r.formalityMin, `${r.id}.formalityMin`), max: int(r.formalityMax, `${r.id}.formalityMax`) },
    tones: list(r.tones), seasons: sortSeasons(list(r.seasons)),
    fits: { top: list(r.topFit), bottom: list(r.bottomFit), trouserLength: list(r.trouserLength) },
    signature: { top: list(r.signatureTop), bottom: list(r.signatureBottom), shoes: list(r.signatureShoes), outer: list(r.signatureOuter) },
    avoid: list(r.avoid),
    sources: list(r.sources), flags: [], note: '',
  }));
}

// ---------------------------------------------------------------- 2-1 styleAffinity
export function buildStyleAffinity() {
  return table('2-1').map((r) => ({
    kind: r.kind, id: r.id,
    weights: Object.fromEntries(STYLE_IDS.map((s) => [s, int(r[s], `affinity ${r.kind}|${r.id}.${s}`)])),
    note: empty(r.note) ? '' : r.note,
  }));
}

// ---------------------------------------------------------------- 3-1 occasions
export function buildOccasions() {
  return table('3-1').map((r) => ({
    id: r.id, labelKo: r.labelKo,
    formality: { min: int(r.formalityMin, `${r.id}.formalityMin`), max: int(r.formalityMax, `${r.id}.formalityMax`), targetLo: int(r.targetLo, `${r.id}.targetLo`), targetHi: int(r.targetHi, `${r.id}.targetHi`) },
    styleBoost: weightsMap(r.styleBoost),
    avoid: { itemTypes: list(r.avoidItemTypes), shoeTypes: list(r.avoidShoeTypes), materials: list(r.avoidMaterials), patterns: list(r.avoidPatterns) },
    prefer: { itemTypes: list(r.preferItemTypes), shoeTypes: list(r.preferShoeTypes) },
    patternMax: int(r.patternMax, `${r.id}.patternMax`),
    accessories: list(r.accessories),
    sources: list(r.sources), flags: r.id === 'formal' ? ['approx'] : [], note: empty(r.note) ? '' : r.note,
  }));
}

// ---------------------------------------------------------------- 4-1 accessoryTypes · 4-2 accessoryRules
export function buildAccessoryTypes() {
  return table('4-1').map((r) => ({
    id: r.id, labelKo: r.labelKo, group: r.group,
    formality: { min: int(r.formalityMin, `${r.id}.formalityMin`), max: int(r.formalityMax, `${r.id}.formalityMax`) },
    seasons: sortSeasons(list(r.seasons)), colorFrom: nullable(r.colorFrom), note: empty(r.note) ? '' : r.note,
  }));
}
export function buildAccessoryRules() {
  return table('4-2').map((r) => ({
    id: r.id, accessory: list(r.accessory), when: cond(r.when),
    pick: r.pick === 'skip' ? { skip: true } : cond(r.pick),
    delta: int(r.delta, `${r.id}.delta`), severity: r.severity,
    note: empty(r.note) ? '' : r.note, sources: list(r.sources), flags: [],
  }));
}

// ---------------------------------------------------------------- 5-1 patterns · 5-2 patternRules
export function buildPatterns() {
  return table('5-1').map((r) => ({
    id: r.id, labelKo: r.labelKo, family: r.family, scale: r.scale,
    categories: list(r.categories), itemTypes: list(r.itemTypes),
    formality: int(r.formality, `${r.id}.formality`), seasons: sortSeasons(list(r.seasons)), colorsTypical: list(r.colorsTypical),
    note: empty(r.note) ? '' : r.note, sources: list(r.sources), flags: [],
  }));
}
export function buildPatternRules() {
  return table('5-2').map((r) => {
    const [effect, countAs] = r.effect.split('=');
    return {
      id: r.id, when: cond(r.when), effect, ...(countAs ? { countAs } : {}),
      delta: int(r.delta, `${r.id}.delta`), severity: r.severity,
      note: empty(r.note) ? '' : r.note, sources: list(r.sources), flags: [],
    };
  });
}

// ---------------------------------------------------------------- 6-1 midTypes · 6-2 midLayerRules · 6-3 twoOuterRules
export function buildMidTypes() {
  return table('6-1').map((r) => ({
    id: r.id, labelKo: r.labelKo, material: nullable(r.material), formality: int(r.formality, `${r.id}.formality`),
    length: r.length, weight: r.weight, seasons: sortSeasons(list(r.seasons)), note: empty(r.note) ? '' : r.note,
  }));
}
const anyOrList = (v) => (v === 'any' || v === 'none' ? v : list(v));
export function buildMidLayerRules() {
  return table('6-2').map((r) => ({
    id: r.id, season: r.season, base: anyOrList(r.base), mid: r.mid === 'none' ? 'none' : list(r.mid), outer: anyOrList(r.outer),
    score: int(r.score, `${r.id}.score`), tag: r.tag, note: empty(r.note) ? '' : r.note, sources: list(r.sources), flags: [],
  }));
}
export function buildTwoOuterRules() {
  return table('6-3').map((r) => ({
    id: r.id, season: r.season, inner: r.inner === 'any' ? 'any' : list(r.inner), outer: anyOrList(r.outer),
    score: int(r.score, `${r.id}.score`), tag: r.tag, note: empty(r.note) ? '' : r.note, sources: list(r.sources), flags: [],
  }));
}

// ---------------------------------------------------------------- 7-1 CX 출처 코드표 (V-20)
export function buildCxCodes() {
  return Object.fromEntries(table('7-1').map((r) => [r.code, r['출처']]));
}
// 표 안에서 코드 없이 쓰인 내부 참조(절 번호·톤 규칙 id)
export const CX_INTERNAL_CODES = ['CX', 'R1 5-8', 'R2 5-5', 'R2 6-2', 'R2 6-3', 'R2 6-4', 'T8', 'T9'];

export function buildExpansion() {
  return {
    styles: buildStyles(), styleAffinity: buildStyleAffinity(), occasions: buildOccasions(),
    accessoryTypes: buildAccessoryTypes(), accessoryRules: buildAccessoryRules(),
    patterns: buildPatterns(), patternRules: buildPatternRules(),
    midTypes: buildMidTypes(), midLayerRules: buildMidLayerRules(), twoOuterRules: buildTwoOuterRules(),
  };
}
