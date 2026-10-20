// Phase 6-B (CX) 콘텐츠 확장 테스트 — content-expansion.md 7-5 E-21 ~ E-32 + 게이트 5 지시 추가 케이스. node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { data } from '../src/data/index.js';
import { createEngine, materialize, validateData, styleVector, styleTags, suggestAccessories, evalPatterns, patternExcluded, quickPool, occasionAdjust, occasionAvoidHit } from '../src/engine/index.js';
import { occasionWindow } from '../src/engine/style.js';
import { K_STYLE, STYLE_TAGS_MAX, QUICK_CARDS, OCC_WINDOW_PENALTY, OCC_WINDOW_FLOOR, OCC_RELAX_MAX_STAGE, BY_STYLE_MAX_OVERLAP, LEATHER_FAMILY } from '../src/engine/constants.js';

const engine = createEngine(data);
const index = engine.index;
const SEASONS = ['springFall', 'summer', 'winter'];
const BASES = [{ category: 'bottom', color: 'indigo' }, { category: 'top', color: 'white' }, { category: 'shoes', color: 'white' }, { category: 'outer', color: 'navy' }];
const FIRST_WAVE = ['minimal', 'bizcasual', 'ivy', 'amekaji'];
const item = (o, cat) => o.items.find((i) => i.category === cat);
const line = (o) => o.items.map((i) => `${i.color} ${i.shoeType ?? i.itemType ?? i.material}`).join(' · ');

/** 테스트용 코디 조립 (engine.test.js와 같은 규약 + mid·pattern) */
function outfit(spec, season = 'springFall') {
  const items = [];
  const [tc, tt, to = {}] = spec.top;
  items.push(materialize(index, 'top', tc, season, { itemType: tt, ...to }));
  const [bc, bm, bo = {}] = spec.bottom;
  items.push(materialize(index, 'bottom', bc, season, { material: bm, ...bo }));
  const [sc, st] = spec.shoes;
  items.push(materialize(index, 'shoes', sc, season, { shoeType: st }));
  for (const [i, o] of (spec.outers ?? (spec.outer ? [spec.outer] : [])).entries()) {
    const it = materialize(index, 'outer', o[0], season, { itemType: o[1], ...(o[2] ?? {}) });
    if ((spec.outers ?? []).length > 1) it.layer = i + 1;
    items.push(it);
  }
  if (spec.mid) items.push(materialize(index, 'mid', spec.mid[0], season, { itemType: spec.mid[1] }));
  return { id: 't-' + Math.random().toString(36).slice(2, 6), items, seasons: [season], tags: spec.tags ?? ['neutral'], isClassic: true, universal: false, sources: [], flags: [] };
}
/** 스냅샷과 같은 모양 (tests/fixtures/quick-baseline.json — 변경 전 Phase 4 출력) */
const shape = (r) => r.classic.map((c) => ({ id: c.outfit.id, sig: c.outfit.items.map((i) => `${i.category}:${i.color}:${i.shoeType ?? i.itemType ?? i.material}`).join('|'), final: c.score.final, percent: c.score.percent, blocked: c.score.blocked, explain: c.explain }));

// ---------------------------------------------------------------- 하위 호환
test('E-21 backward-compat: quick without opts is byte-identical to the Phase 4 snapshot (4 bases × 3 seasons)', () => {
  const snap = JSON.parse(fs.readFileSync(new URL('./fixtures/quick-baseline.json', import.meta.url), 'utf8'));
  assert.equal(Object.keys(snap).length, 12);
  for (const [key, want] of Object.entries(snap)) {
    const [category, color, season] = key.split('|');
    assert.deepEqual(shape(engine.recommend({ base: { category, color }, season, mode: 'quick' })), want, key);
  }
});

test('E-21b deep without opts: classic·byTone·byHue·variations identical with or without style data (added fields only)', () => {
  const bare = createEngine({ ...data, styles: [], styleAffinity: [], occasions: [], accessoryTypes: [], accessoryRules: [], patterns: [], patternRules: [], midTypes: [], midLayerRules: [], twoOuterRules: [] });
  const ids = (list) => list.map((c) => c.outfit.id);
  for (const base of BASES) for (const season of SEASONS) {
    const a = engine.recommend({ base, season, mode: 'deep' }); const b = bare.recommend({ base, season, mode: 'deep' });
    const tag = `${base.category}/${base.color}/${season}`;
    assert.deepEqual(ids(a.classic), ids(b.classic), tag);
    assert.deepEqual(a.byTone.map((g) => [g.tone, ...ids(g.candidates)]), b.byTone.map((g) => [g.tone, ...ids(g.candidates)]), `${tag} byTone`);
    assert.deepEqual(a.byHue.map((g) => [g.relation, ...ids(g.candidates)]), b.byHue.map((g) => [g.relation, ...ids(g.candidates)]), `${tag} byHue`);
    assert.deepEqual(a.variations.map((v) => v.candidate.outfit.id), b.variations.map((v) => v.candidate.outfit.id), `${tag} variations`);
    assert.equal(b.byStyle.length, 0, `${tag} bare byStyle`); assert.equal(b.byOccasion.length, 0);
    assert.ok(a.byStyle.length >= 1, `${tag} byStyle`);
  }
});

// ---------------------------------------------------------------- 스타일 벡터·태그
test('E-22 o01 (white tee · indigo · white sneakers): dominant minimal, tags ⊇ {minimal, amekaji}', () => {
  const o01 = data.outfits.find((o) => o.id === 'o01');
  const sv = styleVector(index, o01);
  assert.equal(sv.dominant, 'minimal');
  const tags = styleTags(sv, index).map((t) => t.id);
  assert.ok(tags.includes('minimal') && tags.includes('amekaji'), tags.join(','));
  assert.ok(sv.norm.minimal > 0.4 && sv.norm.minimal <= 1);
});

test('E-23 oxford + blazer + chino + penny loafer → styleTags = {ivy, bizcasual} (C6-05 수정안 B 이후 동점 → 순서 무관)', () => {
  const o = data.outfits.find((x) => item(x, 'top')?.itemType === 'oxfordShirt' && item(x, 'outer')?.itemType === 'blazer' && item(x, 'bottom')?.material === 'chino' && item(x, 'shoes')?.shoeType === 'loaferPenny');
  assert.ok(o, 'outfit exists');
  assert.deepEqual(styleTags(styleVector(index, o), index).map((t) => t.id).sort(), ['bizcasual', 'ivy']);
  assert.deepEqual(o.styles.map((t) => t.id).sort(), ['bizcasual', 'ivy'], 'outfits.json styles[] (build-time) agrees');
});

test('C6-05 mis-tags ≤ 2/52: hoodie·fleece·chore-jacket looks are not ivy, leather jacket is not bizcasual, coach jacket look is street', () => {
  const tags = Object.fromEntries(data.outfits.map((o) => [o.id, o.styles.map((t) => t.id)]));
  const MIS = { o03: 'ivy', o12: 'ivy', o27: 'ivy', o30: 'ivy', o34: 'amekaji', o49: 'ivy', o50: 'bizcasual' };
  const remaining = Object.entries(MIS).filter(([id, bad]) => tags[id].includes(bad)).map(([id]) => id);
  assert.ok(remaining.length <= 2, `mis-tags remaining: ${remaining.join(',')}`);
  assert.ok(!tags.o30.includes('ivy') && !tags.o49.includes('ivy') && !tags.o27.includes('ivy'), 'hoodie/fleece/chore jacket ≠ ivy');
  assert.ok(!tags.o50.includes('bizcasual'), 'leather jacket ≠ bizcasual');
  assert.ok(tags.o34.includes('street'), 'coach jacket + colour sneakers → street');
});

test('every candidate carries styleTags (≤2, with score), tags {style, occasion} and Korean tagLabels', () => {
  for (const base of BASES) for (const season of SEASONS) {
    const r = engine.recommend({ base, season, mode: 'quick' });
    for (const c of r.classic) {
      assert.ok(c.styleTags.length >= 1 && c.styleTags.length <= STYLE_TAGS_MAX, line(c.outfit));
      for (const t of c.styleTags) { assert.ok(index.styles.some((s) => s.id === t.id)); assert.equal(typeof t.score, 'number'); }
      assert.deepEqual(c.tags.style, c.styleTags.map((t) => t.id));
      assert.ok(Array.isArray(c.tags.occasion));
      assert.ok(c.tagLabels.length >= 1 && c.tagLabels.every((l) => /[가-힣]/.test(l) && !/[a-z]/i.test(l)), c.tagLabels.join(','));
      assert.ok(c.styleExplain.every((s) => typeof s === 'string'));
    }
  }
});

// ---------------------------------------------------------------- 스타일 선택 (D-1: 재정렬만)
test('E-24 indigo quick, style amekaji: 3 cards, blocked 0, deterministic, first card tagged amekaji', () => {
  const q = { base: { category: 'bottom', color: 'indigo' }, season: 'springFall', mode: 'quick', style: 'amekaji' };
  const r = engine.recommend(q);
  assert.equal(r.classic.length, 3);
  assert.ok(r.classic.every((c) => !c.score.blocked));
  assert.ok(r.classic[0].styleTags.some((t) => t.id === 'amekaji'), r.classic[0].styleTags.map((t) => t.id).join(','));
  assert.equal(r.applied.style, 'amekaji');
  assert.deepEqual(shape(engine.recommend({ ...q })), shape(r));
  for (const c of r.classic) assert.equal(c.rank.boost, Math.round(K_STYLE * c.styleVec.norm.amekaji * 100) / 100);
});

test('E-25 style reorder stays inside the quick pool: final·percent·blocked untouched, every card ∈ pool, no new cards', () => {
  for (const base of BASES) for (const season of SEASONS) for (const style of FIRST_WAVE) {
    const pool = new Set(quickPool(index, base, season).entries.map(([, o]) => o.id));
    const r = engine.recommend({ base, season, mode: 'quick', style });
    const tag = `${base.category}/${base.color}/${season}/${style}`;
    assert.equal(r.classic.length, 3, tag);
    for (const c of r.classic) {
      assert.ok(pool.has(c.outfit.id), `${tag}: ${c.outfit.id} not in pool`);
      assert.equal(c.score.blocked, false, tag);
      assert.equal(c.score.final, engine.score(c.outfit, season).final, `${tag}: final untouched`);
      assert.equal(c.score.percent, engine.score(c.outfit, season).percent);
    }
  }
});

test('engine.styles() = first-wave 4 (minimal·bizcasual·ivy·amekaji); occasions() = 5; unknown style ignored', () => {
  assert.deepEqual(engine.styles().map((s) => s.id).sort(), [...FIRST_WAVE].sort());
  assert.equal(engine.styles({ all: true }).length, 8);
  assert.deepEqual(engine.occasions().map((o) => o.id), ['work', 'weekend', 'date', 'active', 'formal']);
  assert.ok(engine.styles().every((s) => s.shortLabel.length <= 6 && /[가-힣]/.test(s.label)));
  const base = { category: 'bottom', color: 'indigo' };
  assert.deepEqual(shape(engine.recommend({ base, season: 'summer', mode: 'quick', style: 'nope' })), shape(engine.recommend({ base, season: 'summer', mode: 'quick' })));
});

test('recommend accepts both forms: (query) and (base, season, mode, opts); memoized per option set', () => {
  const a = engine.recommend({ category: 'bottom', color: 'navy' }, 'springFall', 'quick', { style: 'ivy' });
  const b = engine.recommend({ base: { category: 'bottom', color: 'navy' }, season: 'springFall', mode: 'quick', style: 'ivy' });
  assert.equal(a, b, 'same memo entry');
  const c = engine.recommend({ base: { category: 'bottom', color: 'navy' }, season: 'springFall', mode: 'quick' });
  assert.notEqual(a, c);
  assert.equal(a.applied.style, 'ivy'); assert.equal(c.applied.style, null);
});

// ---------------------------------------------------------------- 상황 (D-2: 감점 + avoid 제외 + 단계 완화 → 항상 3장)
test('E-26 charcoal (wool) deep, occasion active: wool bottom re-materialized to tech/sweat pants (C6-02), no leather dress shoes, 3 cards, stage ≤ 2', () => {
  const r = engine.recommend({ base: { category: 'bottom', color: 'charcoal' }, season: 'springFall', mode: 'deep', occasion: 'active' });
  const occ = index.occasions.get('active');
  assert.equal(r.classic.length, 3);
  assert.equal(r.applied.shortfall, false);
  for (const c of r.classic) {
    assert.ok(!occ.avoid.shoeTypes.includes(item(c.outfit, 'shoes').shoeType), line(c.outfit));
    assert.ok(['jersey', 'nylonTech'].includes(item(c.outfit, 'bottom').material), `${line(c.outfit)}: 울 슬랙스는 운동 카드가 아니다`);
    assert.equal(item(c.outfit, 'bottom').color, 'charcoal');
  }
  assert.ok(r.applied.relaxed.length <= OCC_RELAX_MAX_STAGE.active, `relaxed: ${r.applied.relaxed}`);
  assert.equal(r.applied.occasion, 'active');
  assert.ok(r.classic.every((c) => typeof c.rank.occasionAdj === 'number'));
  // deep byOccasion.active도 같은 대체 후보를 쓴다 (옵션 없는 deep 호출)
  const plain = engine.recommend({ base: { category: 'bottom', color: 'charcoal' }, season: 'springFall', mode: 'deep' });
  const g = plain.byOccasion.find((x) => x.occasion === 'active');
  assert.ok(g && g.candidates.length === 3 && g.relaxed.length <= 2 && !g.shortfall, JSON.stringify(g && { n: g.candidates.length, relaxed: g.relaxed }));
  assert.ok(g.candidates.every((c) => !['wool', 'flannel'].includes(item(c.outfit, 'bottom').material)));
  // 대체 후보는 톤별·색상별·스타일 그룹에는 섞이지 않는다
  assert.ok([...plain.byTone, ...plain.byHue, ...plain.byStyle].flatMap((x) => x.candidates).every((c) => !c.outfit.tags.includes('occAlt')));
});

test('E-27 beige deep, occasion formal: no sneakers/denim, formality avg ≥ 6, window penalty explained', () => {
  const r = engine.recommend({ base: { category: 'bottom', color: 'beige' }, season: 'springFall', mode: 'deep', occasion: 'formal' });
  const occ = index.occasions.get('formal');
  assert.equal(r.classic.length, 3);
  for (const c of r.classic) {
    assert.ok(!['sneakerWhite', 'sneakerColor', 'running', 'sandal'].includes(item(c.outfit, 'shoes').shoeType), line(c.outfit));
    assert.ok(!/denim/.test(item(c.outfit, 'bottom').material), line(c.outfit));
    const oa = occasionAdjust(index, c.outfit, occ, c.styleVec);
    assert.ok(oa.avg >= 6, `${line(c.outfit)} avg ${oa.avg}`); // 치노(5) 베이스라 ≥7은 불가 — 수트 품목은 2차
    if (oa.outside) assert.ok(c.styleReasons.some((x) => x.key === 'explain.occasion.window'));
  }
  // deep 그룹은 집합 동일·정렬만: byTone 후보가 finalRanked 내림차순
  for (const g of r.byTone) for (let i = 1; i < g.candidates.length; i++) assert.ok(g.candidates[i - 1].rank.finalRanked >= g.candidates[i].rank.finalRanked, g.tone);
});

test('occasion returns 3 cards, or fewer with applied.shortfall for formal/active at the stage-2 cap (C6-01·02): 4 bases × 3 seasons × 5 occasions + all bottom chips × {formal, active}', () => {
  const occIds = engine.occasions().map((o) => o.id);
  const cases = [];
  for (const base of BASES) for (const season of SEASONS) for (const occasion of occIds) cases.push([base, season, occasion]);
  for (const color of engine.baseColors('bottom')) for (const season of SEASONS) for (const occasion of ['formal', 'active']) cases.push([{ category: 'bottom', color }, season, occasion]);
  let shortfalls = 0;
  for (const [base, season, occasion] of cases) {
    const r = engine.recommend({ base, season, mode: 'quick', occasion });
    const occ = index.occasions.get(occasion);
    const tag = `${base.category}/${base.color}/${season}/${occasion}`;
    const cap = OCC_RELAX_MAX_STAGE[occasion] ?? 4;
    assert.ok(r.applied.relaxed.length <= cap, `${tag} relaxed beyond cap: ${r.applied.relaxed}`);
    if (r.applied.shortfall) {
      shortfalls++;
      assert.ok(cap < 4, `${tag}: shortfall only for capped occasions`);
      assert.ok(r.classic.length < QUICK_CARDS, tag);
      assert.ok(/[가-힣]/.test(r.applied.shortfallText) && !/[a-z]/i.test(r.applied.shortfallText), r.applied.shortfallText);
    } else {
      assert.equal(r.classic.length, QUICK_CARDS, tag);
      assert.equal(r.applied.shortfallText, null);
    }
    // 격식·운동 카드는 avoid itemTypes·shoeTypes를 끝까지 지킨다 (스니커즈 '격식', 더비 '운동' 금지)
    if (cap < 4) for (const c of r.classic) assert.ok(!occasionAvoidHit(c.outfit, occ, 2), `${tag}: ${line(c.outfit)} hits ${occasionAvoidHit(c.outfit, occ, 2)}`);
    assert.ok(r.classic.every((c) => !c.score.blocked), `${tag} blocked`);
    assert.ok(r.classic.every((c) => c.outfit.items.some((i) => i.category === base.category && i.color === base.color)), `${tag} base item`);
    assert.ok(new Set(r.classic.map((c) => c.outfit.id)).size === r.classic.length, `${tag} unique`);
  }
  assert.ok(shortfalls >= 1, 'white sneakers × formal must be a shortfall, not a sneaker card');
  const ws = engine.recommend({ base: { category: 'shoes', color: 'white' }, season: 'springFall', mode: 'quick', occasion: 'formal' });
  assert.equal(ws.applied.shortfall, true); assert.equal(ws.classic.length, 0); assert.equal(ws.applied.shortfallText, '격식에 맞는 조합이 더 없어요');
});

test('C6-01 window penalty is proportional to formality distance (tee −1.2 vs linen shirt −0.3 in formal), floored at OCC_WINDOW_FLOOR', () => {
  const formal = index.occasions.get('formal');
  const tee = outfit({ top: ['white', 'tee'], bottom: ['charcoal', 'wool'], shoes: ['black', 'loaferPenny'] }, 'summer');
  const linen = outfit({ top: ['white', 'linenShirt'], bottom: ['charcoal', 'wool'], shoes: ['black', 'loaferPenny'] }, 'summer');
  const wt = occasionWindow(index, tee, formal); const wl = occasionWindow(index, linen, formal);
  assert.equal(wt.outside, 1); assert.equal(wl.outside, 1);
  assert.equal(wt.distance, 4); assert.equal(wl.distance, 1);
  assert.equal(wt.penalty, Math.round(4 * OCC_WINDOW_PENALTY * 100) / 100); assert.equal(wl.penalty, OCC_WINDOW_PENALTY);
  assert.ok(wt.penalty < wl.penalty);
  const all = outfit({ top: ['white', 'tee'], bottom: ['indigo', 'denimIndigo'], shoes: ['white', 'sneakerWhite'] }, 'summer');
  assert.equal(occasionWindow(index, all, formal).penalty, OCC_WINDOW_FLOOR);
  // 차콜 여름 격식: 린넨 셔츠 카드가 티셔츠 카드보다 앞 (C6-01 사례)
  const r = engine.recommend({ base: { category: 'bottom', color: 'charcoal' }, season: 'summer', mode: 'quick', occasion: 'formal' });
  assert.ok(r.classic.every((c) => item(c.outfit, 'top').itemType !== 'tee'), r.classic.map((c) => line(c.outfit)).join(' / '));
});

test('C6-01 summer formal on chino/denim bases uses linen shirt / polo / blazer / derby alternates (occAlt), never a tee or sneakers', () => {
  for (const [category, color] of [['bottom', 'beige'], ['bottom', 'olive'], ['outer', 'navy'], ['bottom', 'white']]) for (const season of ['summer', 'springFall']) {
    const r = engine.recommend({ base: { category, color }, season, mode: 'quick', occasion: 'formal' });
    const tag = `${category}/${color}/${season}`;
    assert.equal(r.classic.length, 3, tag); assert.ok(r.applied.relaxed.length <= 2, tag);
    for (const c of r.classic) {
      assert.ok(!['tee', 'sweatshirt', 'hoodie', 'knitCotton', 'overshirt'].includes(item(c.outfit, 'top').itemType), `${tag}: ${line(c.outfit)}`);
      assert.ok(!/sneaker|running|sandal|chukka|workboot/.test(item(c.outfit, 'shoes').shoeType), `${tag}: ${line(c.outfit)}`);
      assert.equal(c.outfit.items.find((i) => i.category === category).color, color);
    }
  }
});

test('deep byStyle: first-wave groups only, ≤5 each, fillDiverse dedupe (same outer type ≤2, same shoe type ≤2); byOccasion: ≤3 each', () => {
  const r = engine.recommend({ base: { category: 'bottom', color: 'indigo' }, season: 'springFall', mode: 'deep' });
  assert.ok(r.byStyle.length >= 1 && r.byStyle.length <= 4);
  for (const g of r.byStyle) {
    assert.ok(FIRST_WAVE.includes(g.style), g.style);
    assert.equal(g.labelKey, `style.${g.style}`);
    assert.ok(g.candidates.length >= 1 && g.candidates.length <= 5);
    assert.equal(new Set(g.candidates.map((c) => c.outfit.id)).size, g.candidates.length);
    const count = (fn) => { const m = new Map(); for (const c of g.candidates) { const k = fn(c.outfit); if (k) m.set(k, (m.get(k) ?? 0) + 1); } return Math.max(0, ...m.values()); };
    assert.ok(count((o) => item(o, 'outer')?.itemType) <= 2, `${g.style} outer dupes`);
    assert.ok(count((o) => item(o, 'shoes').shoeType) <= 2, `${g.style} shoe dupes`);
    assert.ok(g.candidates.every((c) => c.styleVec.norm[g.style] >= 0.4), `${g.style} norm`);
    assert.ok(g.candidates.every((c) => c.tags.style.includes(g.style)), `${g.style}: every card carries the group style tag (C6-03)`);
  }
  assert.equal(r.byOccasion.length, 5);
  for (const g of r.byOccasion) { assert.ok(g.candidates.length >= 1 && g.candidates.length <= 3, g.occasion); assert.equal(g.labelKey, `occasion.${g.occasion}`); assert.ok(Array.isArray(g.relaxed)); assert.equal(typeof g.shortfall, 'boolean'); }
  const sel = engine.recommend({ base: { category: 'bottom', color: 'indigo' }, season: 'springFall', mode: 'deep', style: 'ivy' });
  assert.equal(sel.byStyle[0].style, 'ivy'); assert.ok(sel.byStyle.length <= 2);
});

test('C6-03 byStyle across 8 bases × 3 seasons: group style ∈ card tags 100%, pairwise overlap ≤ 2, minimal ≠ ivy ≠ bizcasual, norm-first order', () => {
  const bases = [...BASES, { category: 'bottom', color: 'charcoal' }, { category: 'bottom', color: 'beige' }, { category: 'bottom', color: 'blackDenim' }, { category: 'bottom', color: 'olive' }];
  let groups = 0; let fives = 0;
  for (const base of bases) for (const season of SEASONS) {
    const r = engine.recommend({ base, season, mode: 'deep' });
    const tag = `${base.category}/${base.color}/${season}`;
    const sets = r.byStyle.map((g) => [g.style, new Set(g.candidates.map((c) => c.outfit.id))]);
    for (const g of r.byStyle) {
      groups++; if (g.candidates.length === 5) fives++;
      assert.ok(g.candidates.length >= 1 && g.candidates.length <= 5, `${tag} ${g.style}`);
      assert.ok(g.candidates.every((c) => c.tags.style.includes(g.style) && c.styleVec.norm[g.style] >= 0.4), `${tag} ${g.style}: untagged card`);
      for (let i = 1; i < g.candidates.length; i++) assert.ok(g.candidates[i - 1].styleVec.norm[g.style] >= g.candidates[i].styleVec.norm[g.style] - 0.3, `${tag} ${g.style}: roughly norm-desc`);
    }
    for (let i = 0; i < sets.length; i++) for (let j = i + 1; j < sets.length; j++) {
      const n = [...sets[i][1]].filter((x) => sets[j][1].has(x)).length;
      assert.ok(n <= BY_STYLE_MAX_OVERLAP, `${tag} ${sets[i][0]}∩${sets[j][0]} = ${n}`);
    }
  }
  assert.ok(fives >= groups * 0.5, `groups of 5: ${fives}/${groups}`);
});

test('C6-09 date ≠ work: deep byOccasion date/work sets differ for ≥ 80% of base×season; date prefers knit/loafer, work prefers shirt/blazer', () => {
  const bases = [...BASES, { category: 'bottom', color: 'charcoal' }, { category: 'bottom', color: 'beige' }, { category: 'bottom', color: 'blackDenim' }, { category: 'bottom', color: 'olive' }];
  let n = 0; let identical = 0;
  for (const base of bases) for (const season of SEASONS) {
    const r = engine.recommend({ base, season, mode: 'deep' });
    const w = r.byOccasion.find((g) => g.occasion === 'work'); const d = r.byOccasion.find((g) => g.occasion === 'date');
    if (!w || !d) continue;
    n++;
    const ids = new Set(w.candidates.map((c) => c.outfit.id));
    if (d.candidates.length === w.candidates.length && d.candidates.every((c) => ids.has(c.outfit.id))) identical++;
  }
  assert.ok(n >= 20 && (n - identical) / n >= 0.8, `distinct ${n - identical}/${n}`);
  const date = index.occasions.get('date'); const work = index.occasions.get('work');
  const knit = outfit({ top: ['navy', 'knitCotton'], bottom: ['beige', 'chino'], shoes: ['brown', 'loaferPenny'] });
  const shirt = outfit({ top: ['white', 'dressShirt'], bottom: ['charcoal', 'wool'], shoes: ['black', 'derby'], outer: ['navy', 'blazer'] });
  assert.ok(occasionAdjust(index, knit, date, null).preferBonus > 0 && occasionAdjust(index, shirt, work, null).preferBonus > 0);
  assert.ok(occasionAvoidHit(shirt, date, 0) === 'itemTypes', 'dress shirt is avoided on a date (C6-09)');
});

// ---------------------------------------------------------------- 액세서리
test('E-28 brown penny loafer + linen shirt, summer: beltLeather in brown family, socksNoShow; deep attaches accessories[]', () => {
  const o = outfit({ top: ['white', 'linenShirt'], bottom: ['beige', 'chino'], shoes: ['brown', 'loaferPenny'] }, 'summer');
  const acc = suggestAccessories(index, o, 'summer', styleVector(index, o), {});
  const belt = acc.find((a) => a.group === 'belt');
  assert.ok(belt && belt.id === 'beltLeather' && ['brown', 'chocolate', 'tan', 'camel'].includes(belt.color), JSON.stringify(belt));
  assert.ok(acc.some((a) => a.id === 'socksNoShow'), acc.map((a) => a.id).join(','));
  assert.ok(acc.every((a) => a.key.startsWith('explain.acc')));
  assert.ok(!acc.some((a) => a.severity === 'warn'), 'no warnings when nothing is forced');
  const r = engine.recommend({ base: { category: 'bottom', color: 'beige' }, season: 'summer', mode: 'deep', accessories: true });
  assert.ok(r.classic.every((c) => Array.isArray(c.accessories)));
  assert.ok(r.classic.some((c) => c.accessories.length >= 1));
  assert.ok(r.classic.flatMap((c) => c.accessories).every((a) => /[가-힣]/.test(a.text)));
  assert.ok(r.byTone.flatMap((g) => g.candidates).every((c) => Array.isArray(c.accessories)), 'group cards too');
  const q = engine.recommend({ base: { category: 'bottom', color: 'beige' }, season: 'summer', mode: 'quick' });
  assert.ok(q.classic.every((c) => c.accessories === undefined), 'quick: only when requested');
  assert.equal(r.applied.accessories, true);
});

test('E-29 brown shoes + forced black belt → acBeltBrownBlack warn −2 (and black shoes get a black belt)', () => {
  const brown = outfit({ top: ['white', 'oxfordShirt'], bottom: ['beige', 'chino'], shoes: ['brown', 'derby'] });
  const warn = suggestAccessories(index, brown, 'springFall', null, { beltColor: 'black' }).find((a) => a.ruleId === 'acBeltBrownBlack');
  assert.ok(warn && warn.severity === 'warn' && warn.delta === -2, JSON.stringify(warn));
  const black = outfit({ top: ['white', 'oxfordShirt'], bottom: ['midGrey', 'wool'], shoes: ['black', 'derby'] });
  const belt = suggestAccessories(index, black, 'springFall', null, {}).find((a) => a.group === 'belt');
  assert.ok(belt && belt.id === 'beltLeather' && belt.color === 'black', JSON.stringify(belt));
});

test('belt color follows shoe color family across leather shoes (brown chukka, tan loafer, chocolate chelsea, black oxford)', () => {
  const cases = [['brown', 'chukka', 'brown'], ['tan', 'loaferPenny', 'tan'], ['chocolate', 'chelsea', 'chocolate'], ['black', 'oxford', 'black']];
  for (const [color, shoeType, want] of cases) {
    const o = outfit({ top: ['white', 'oxfordShirt'], bottom: ['navy', 'chino'], shoes: [color, shoeType] });
    const belt = suggestAccessories(index, o, 'springFall', null, {}).find((a) => a.group === 'belt');
    assert.ok(belt, `${color} ${shoeType}: belt`);
    assert.equal(belt.color, want, `${color} ${shoeType}`);
  }
  // 티셔츠(벨트 가림)면 벨트 제안 생략
  const tee = outfit({ top: ['white', 'tee'], bottom: ['navy', 'chino'], shoes: ['brown', 'chukka'] });
  assert.ok(!suggestAccessories(index, tee, 'springFall', null, {}).some((a) => a.group === 'belt'));
});

// ---------------------------------------------------------------- 패턴
test('E-30 breton (white tee) + plaid (forestGreen shirt jacket): count 2, ptShareColor warn, quick exclude, deep allowed', () => {
  const o = outfit({ top: ['white', 'tee', { pattern: 'breton' }], bottom: ['indigo', 'denimIndigo'], shoes: ['white', 'sneakerWhite'], outer: ['forestGreen', 'shirtJacket', { pattern: 'plaid' }] });
  const r = evalPatterns(index, o, 'springFall');
  assert.equal(r.count, 2);
  assert.ok(r.hits.includes('ptShareColor'), r.hits.join(','));
  assert.ok(!r.hits.includes('ptSameFamilyScale'));
  assert.ok(r.reasons.some((x) => x.key === 'explain.pattern' && x.params.id === 'ptShareColor' && x.severity === 'warn'));
  assert.equal(r.blocked, false);
  assert.equal(patternExcluded(index, o, 'springFall', 'quick'), true);
  assert.equal(patternExcluded(index, o, 'springFall', 'deep'), false);
  const s = engine.score(o, 'springFall');
  assert.ok(s.style.adjust.reasons.some((x) => x.params?.id === 'ptShareColor'), 'delta lands on the adjust axis');
});

test('pattern max-one: single pattern gets ptSolidGround bonus, breton on bottom is blocked, quick pool never holds 2-pattern outfits', () => {
  const one = outfit({ top: ['navy', 'tee', { pattern: 'breton' }], bottom: ['indigo', 'denimIndigo'], shoes: ['white', 'sneakerWhite'] }, 'summer');
  const r1 = evalPatterns(index, one, 'summer');
  assert.equal(r1.count, 1); assert.ok(r1.hits.includes('ptSolidGround') && r1.hits.includes('ptBretonPairs'));
  assert.equal(patternExcluded(index, one, 'summer', 'quick'), false);
  const bad = outfit({ top: ['white', 'tee'], bottom: ['indigo', 'denimIndigo', { pattern: 'breton' }], shoes: ['white', 'sneakerWhite'] }, 'summer');
  assert.equal(engine.score(bad, 'summer').blocked, true, 'ptBretonTopOnly → block');
  const plain = outfit({ top: ['white', 'tee'], bottom: ['indigo', 'denimIndigo'], shoes: ['white', 'sneakerWhite'] }, 'summer');
  assert.equal(evalPatterns(index, plain, 'summer').reasons.length, 0, 'no pattern → no effect');
  for (const base of BASES) for (const season of SEASONS) for (const [, o] of quickPool(index, base, season).entries) assert.ok(o.items.filter((i) => i.pattern).length <= 1, line(o));
  // Deep + patterns: 패턴 변주 ≤ 1장/카드, 패턴 아이템 1개
  const d = engine.recommend({ base: { category: 'bottom', color: 'beige' }, season: 'springFall', mode: 'deep', patterns: true });
  const pv = d.variations.filter((v) => v.candidate.outfit.tags.includes('pattern'));
  assert.ok(pv.length >= 1 && pv.length <= d.classic.length, `pattern variations ${pv.length}`);
  for (const v of pv) { assert.equal(v.candidate.outfit.items.filter((i) => i.pattern).length, 1); assert.ok(/[가-힣]/.test(v.swapped.to.itemName) && !/[a-z]/i.test(v.swapped.to.itemName), v.swapped.to.itemName); }
  assert.equal(engine.recommend({ base: { category: 'bottom', color: 'beige' }, season: 'springFall', mode: 'deep' }).variations.filter((v) => v.candidate.outfit.tags.includes('pattern')).length, 0, 'opt-in only');
});

// ---------------------------------------------------------------- 미드 레이어 (D-3)
test('E-31 summer + mid (cardigan) → mlSuMidBlock → blocked', () => {
  const o = outfit({ top: ['white', 'tee'], bottom: ['beige', 'chino'], shoes: ['white', 'sneakerWhite'], mid: ['navy', 'cardigan'] }, 'summer');
  const s = engine.score(o, 'summer');
  assert.equal(s.blocked, true);
  assert.ok(s.blockReasons.some((r) => r.key === 'explain.midLayer' && r.params.id === 'mlSuMidBlock'));
  assert.ok(s.style.layer && s.style.layer.weight === 0.7);
});

test('mid layer: layer axis (0.7) only when mid present; winter knit-over-shirt under chesterfield scores 5; caption includes mid', () => {
  const base = outfit({ top: ['white', 'oxfordShirt'], bottom: ['charcoal', 'wool'], shoes: ['black', 'derby'], outer: ['navy', 'chesterfield'] }, 'winter');
  const s0 = engine.score(base, 'winter');
  assert.equal(s0.style.layer, null);
  const withMid = { ...base, items: [...base.items, materialize(index, 'mid', 'navy', 'winter', { itemType: 'knitOverShirt' })] };
  const s1 = engine.score(withMid, 'winter');
  assert.ok(s1.style.layer && s1.style.layer.score === 5, JSON.stringify(s1.style.layer));
  assert.equal(s1.blocked, false);
  assert.ok(s1.reasons.some((r) => r.key === 'explain.midLayer' && r.params.id === 'mlWiKnitOverShirt'));
  assert.equal(engine.caption(withMid).split(' · ').length, 5);
  assert.ok(/니트/.test(engine.caption(withMid)));
  // 미드 기장 ≥ 숏 아우터 → block
  const bad = { ...base, items: [...base.items.filter((i) => i.category !== 'outer'), materialize(index, 'outer', 'navy', 'winter', { itemType: 'blouson' }), materialize(index, 'mid', 'navy', 'winter', { itemType: 'cardigan' })] };
  assert.equal(engine.score(bad, 'winter').blocked, true);
});

test('mid never in quick (even with layering:true); deep + layering adds mid cards (≤ +100), none in summer', () => {
  for (const base of BASES) for (const season of SEASONS) {
    const r = engine.recommend({ base, season, mode: 'quick', layering: true });
    assert.ok(r.classic.every((c) => !c.outfit.items.some((i) => i.category === 'mid')), `${base.category}/${base.color}/${season}`);
    const d = engine.recommend({ base, season, mode: 'deep' });
    assert.ok([...d.byTone, ...d.byHue, ...d.byStyle].flatMap((g) => g.candidates).every((c) => !c.outfit.items.some((i) => i.category === 'mid')), 'deep without layering has no mid');
  }
  const d = engine.recommend({ base: { category: 'bottom', color: 'beige' }, season: 'springFall', mode: 'deep', layering: true });
  const mids = [...d.byTone, ...d.byHue, ...d.byStyle].flatMap((g) => g.candidates).filter((c) => c.outfit.items.some((i) => i.category === 'mid'));
  assert.ok(mids.length >= 1, 'springFall beige: mid cards in deep groups');
  assert.ok(d.stats.candidates <= 400);
  for (const c of mids) { assert.equal(c.outfit.items.filter((i) => i.category === 'mid').length, 1); assert.ok(c.score.style.layer.score >= 4); assert.ok(c.outfit.tags.includes('layering')); }
  const su = engine.recommend({ base: { category: 'bottom', color: 'beige' }, season: 'summer', mode: 'deep', layering: true });
  assert.ok([...su.byTone, ...su.byHue].flatMap((g) => g.candidates).every((c) => !c.outfit.items.some((i) => i.category === 'mid')));
});

test('two outers (winter leather + chesterfield): twoOuterRules variation reason, not blocked; summer two outers blocked', () => {
  // 티(2)+체스터필드(8)는 격차 6 차단(기존 규칙, o50은 variation 태그로 면제) → 니트 상의로
  const o = outfit({ top: ['black', 'knitWool'], bottom: ['blackDenim', 'denimBlack'], shoes: ['black', 'chelsea'], outers: [['black', 'leatherJacket'], ['midGrey', 'chesterfield']] }, 'winter');
  const s = engine.score(o, 'winter');
  assert.ok(s.style.outer.reasons.some((r) => r.key === 'explain.twoOuter' && r.params.id === 'toLeatherLongCoat'));
  assert.equal(s.blocked, false);
  assert.ok(s.style.outer.score < 4.5, 'inner outer blends into the outer axis');
  const su = outfit({ top: ['white', 'tee'], bottom: ['beige', 'chino'], shoes: ['white', 'sneakerWhite'], outers: [['navy', 'overshirt'], ['navy', 'blazer']] }, 'summer');
  assert.equal(engine.score(su, 'summer').blocked, true);
});

// ---------------------------------------------------------------- 데이터
test('E-32 validateData: V-23~V-33 → 0 errors; outfits.styles[]·occasions[] match recomputation; every outfit tagged', () => {
  const issues = validateData(data);
  const errors = issues.filter((i) => i.severity === 'error');
  assert.deepEqual(errors, []);
  assert.equal(data.styles.length, 8); assert.equal(data.styleAffinity.length, 126); assert.equal(data.occasions.length, 5);
  assert.equal(data.accessoryTypes.length, 19); assert.equal(data.accessoryRules.length, 36); assert.equal(data.patterns.length, 9); assert.equal(data.patternRules.length, 21);
  assert.equal(data.midTypes.length, 5); assert.equal(data.midLayerRules.length, 15); assert.equal(data.twoOuterRules.length, 6);
  for (const r of data.accessoryRules) { const l = data.labels.find((x) => x.id === `explain.acc.${r.id}`); assert.ok(l && /[가-힣]/.test(l.label) && !/T8|−1|포멀도|[a-z]/i.test(l.label), `explain.acc.${r.id}: ${l?.label}`); }
  assert.deepEqual(data.enums.categories, ['top', 'bottom', 'shoes', 'outer', 'mid']);
  for (const o of data.outfits) {
    assert.ok(o.styles.length >= 1 && o.styles.length <= 2, o.id);
    assert.deepEqual(o.styles, styleTags(styleVector(index, o), index), o.id);
  }
  // 스타일 태그 분포: 어떤 스타일도 > 60% 또는 < 3% 아님 (check.mjs ⑤와 동일)
  const n = data.outfits.length;
  for (const s of data.styles) { const k = data.outfits.filter((o) => o.styles.some((t) => t.id === s.id)).length / n; assert.ok(k <= 0.6 && k >= 0.03, `${s.id} ${(k * 100).toFixed(0)}%`); }
  assert.ok(data.styles.filter((s) => s.phase === 1).map((s) => s.id).every((id) => FIRST_WAVE.includes(id)));
  // 라벨: 새 id 전부 + shortLabel ≤ 6
  for (const ns of [['style', data.styles], ['occasion', data.occasions], ['pattern', data.patterns], ['midType', data.midTypes], ['accessory', data.accessoryTypes]]) for (const rec of ns[1]) {
    const l = data.labels.find((x) => x.id === `${ns[0]}.${rec.id}`);
    assert.ok(l && l.shortLabel && l.shortLabel.length <= 6 && /[가-힣]/.test(l.label), `${ns[0]}.${rec.id}`);
  }
  assert.ok(data.styles.every((s) => data.labels.some((l) => l.id === `explain.style.${s.id}`)));
});

// ---------------------------------------------------------------- Phase 6-B-3 (P3 콘텐츠 재검토 C6-xx) — 소품·레이어링·패턴·라벨
test('C6-06 leather accessories follow the shoe leather family: never a white/navy leather tote or watch strap; material=null never fires the leather-bag rule', () => {
  const LEATHER_IDS = ['beltLeather', 'watchLeather', 'bagBriefcase'];
  const isLeather = (a) => LEATHER_IDS.includes(a.id) || (a.id === 'bagTote' && a.material === 'leather');
  for (const [category, color] of [['shoes', 'white'], ['bottom', 'beige'], ['top', 'white'], ['shoes', 'navy'], ['bottom', 'indigo']]) for (const season of SEASONS) for (const occasion of [undefined, 'work', 'date', 'formal']) {
    const r = engine.recommend({ base: { category, color }, season, mode: 'deep', occasion });
    const shown = new Set([...r.classic, ...r.byTone.flatMap((g) => g.candidates), ...r.byStyle.flatMap((g) => g.candidates), ...r.byOccasion.flatMap((g) => g.candidates)]);
    for (const c of shown) {
      const sh = item(c.outfit, 'shoes');
      for (const a of c.accessories ?? []) {
        if (a.severity === 'warn' || !isLeather(a) || !a.color) continue;
        assert.ok(LEATHER_FAMILY.includes(a.color), `${category}/${color}/${season}/${occasion ?? '-'}: ${line(c.outfit)} → ${a.id} ${a.color} (${a.ruleId})`);
        if (LEATHER_FAMILY.includes(sh.color)) {
          const fam = (x) => (['brown', 'chocolate', 'tan', 'camel'].includes(x) ? 'brown' : x);
          assert.ok(fam(a.color) === fam(sh.color) || (sh.color === 'burgundy' && ['brown', 'black', 'burgundy'].includes(fam(a.color))), `${line(c.outfit)} → ${a.id} ${a.color} vs shoes ${sh.color}`);
        }
        assert.ok(a.ruleId !== 'acBagLeatherUnify' || (sh.material === 'leather' && LEATHER_FAMILY.includes(sh.color)));
      }
    }
  }
  // 흰 스니커즈 + 출근 기본값(가죽 시계): 블랙, 화이트 아님
  const o = outfit({ top: ['white', 'oxfordShirt'], bottom: ['beige', 'chino'], shoes: ['white', 'sneakerWhite'], outer: ['navy', 'blazer'] });
  const acc = suggestAccessories(index, o, 'springFall', styleVector(index, o), { occasion: 'work' });
  const watch = acc.find((a) => a.group === 'watch');
  assert.ok(!watch || watch.color !== 'white', JSON.stringify(watch));
  assert.ok(!acc.some((a) => a.ruleId === 'acBagLeatherUnify'), 'leather-bag rule needs a decided leather bag material');
});

test('C6-14 burgundy penny loafer → beltLeather chocolate; watch strap follows (dark brown)', () => {
  const o = outfit({ top: ['white', 'oxfordShirt'], bottom: ['beige', 'chino'], shoes: ['burgundy', 'loaferPenny'], outer: ['beige', 'trench'] });
  const acc = suggestAccessories(index, o, 'springFall', null, {});
  const belt = acc.find((a) => a.group === 'belt');
  assert.ok(belt && belt.id === 'beltLeather' && belt.color === 'chocolate', JSON.stringify(belt));
  const watch = acc.find((a) => a.group === 'watch');
  if (watch && watch.id === 'watchLeather') assert.equal(watch.color, 'chocolate');
});

test('C6-07 socks: dress shoes/boots get plain socks (match or neutral), never pattern; pattern socks only with sneakers in springFall; summer wool+loafer → no-show (C6-18)', () => {
  const dress = [['brown', 'loaferPenny'], ['black', 'derby'], ['brown', 'chukka'], ['brown', 'workboot'], ['burgundy', 'loaferPenny']];
  for (const [color, shoeType] of dress) for (const season of SEASONS) {
    const o = outfit({ top: ['navy', season === 'winter' ? 'knitWool' : 'knitCotton'], bottom: ['beige', 'chino'], shoes: [color, shoeType] }, season);
    const socks = suggestAccessories(index, o, season, null, {}).find((a) => a.group === 'socks');
    assert.ok(!socks || socks.id !== 'socksPattern', `${season} ${color} ${shoeType}: ${socks?.id}`);
    if (season !== 'summer') assert.ok(socks && ['socksNeutral', 'socksMatch'].includes(socks.id) && socks.color, `${season} ${color} ${shoeType}: ${JSON.stringify(socks)}`);
  }
  const wool = outfit({ top: ['navy', 'knitWool'], bottom: ['charcoal', 'wool'], shoes: ['black', 'loaferPenny'] }, 'winter');
  assert.equal(suggestAccessories(index, wool, 'winter', null, {}).find((a) => a.group === 'socks')?.id, 'socksMatch');
  const summerWool = outfit({ top: ['white', 'linenShirt'], bottom: ['charcoal', 'wool'], shoes: ['black', 'loaferPenny'] }, 'summer');
  assert.equal(suggestAccessories(index, summerWool, 'summer', null, {}).find((a) => a.group === 'socks')?.id, 'socksNoShow');
  for (const season of SEASONS) {
    const sn = outfit({ top: ['white', 'knitCotton'], bottom: ['indigo', 'denimIndigo'], shoes: ['white', 'sneakerWhite'] }, season);
    const socks = suggestAccessories(index, sn, season, null, {}).find((a) => a.group === 'socks');
    if (season !== 'springFall') assert.ok(!socks || socks.id !== 'socksPattern', `${season}: ${socks?.id}`);
  }
});

test('C6-08·15·16 accessory type windows: no cap with blazer/trench/coat, no webbing belt on oxford+chino (F>4), no scarf without an outer or on a springFall shirt jacket', () => {
  const blazer = outfit({ top: ['white', 'oxfordShirt'], bottom: ['indigo', 'denimIndigo'], shoes: ['burgundy', 'loaferPenny'], outer: ['camel', 'trench'] });
  const acc1 = suggestAccessories(index, blazer, 'springFall', styleVector(index, blazer), { occasion: 'weekend' });
  assert.ok(!acc1.some((a) => a.id === 'cap' || a.id === 'bucketHat'), acc1.map((a) => a.id).join(','));
  assert.ok(!acc1.some((a) => a.id === 'beltWebbing'), acc1.map((a) => a.id).join(','));
  const noOuter = outfit({ top: ['rust', 'knitCotton'], bottom: ['indigo', 'denimIndigo'], shoes: ['white', 'sneakerWhite'] });
  assert.ok(!suggestAccessories(index, noOuter, 'springFall', null, {}).some((a) => a.group === 'scarf'));
  const sj = outfit({ top: ['white', 'tee'], bottom: ['beige', 'chino'], shoes: ['white', 'sneakerWhite'], outer: ['olive', 'shirtJacket'] });
  assert.ok(!suggestAccessories(index, sj, 'springFall', null, {}).some((a) => a.group === 'scarf'));
  const coat = outfit({ top: ['white', 'oxfordShirt'], bottom: ['charcoal', 'wool'], shoes: ['black', 'derby'], outer: ['navy', 'chesterfield'] }, 'winter');
  assert.ok(suggestAccessories(index, coat, 'winter', null, {}).some((a) => a.group === 'scarf'));
  // 모든 제안은 accessoryTypes의 계절·포멀도 창 안
  for (const base of BASES) for (const season of SEASONS) {
    const r = engine.recommend({ base, season, mode: 'deep' });
    for (const c of [...r.classic, ...r.byTone.flatMap((g) => g.candidates)]) {
      const f = occasionAdjust(index, c.outfit, index.occasions.get('work'), null).avg;
      for (const a of c.accessories ?? []) { if (a.severity === 'warn') continue; const t = index.accessoryTypes.get(a.id); assert.ok(t.seasons.includes(season) && (f === null || (f >= t.formality.min && f <= t.formality.max)), `${line(c.outfit)} F${f} → ${a.id} (${t.formality.min}-${t.formality.max})`); }
    }
  }
});

test('C6-10·16 accessory sentences are user Korean (explain.acc.<ruleId>): no T8/−1/포멀도/latin ids; occasion defaults say "<occasion> 기본 소품"', () => {
  for (const base of BASES) for (const season of SEASONS) for (const occasion of [undefined, 'active', 'work']) {
    const r = engine.recommend({ base, season, mode: 'deep', occasion });
    for (const c of [...r.classic, ...r.byOccasion.flatMap((g) => g.candidates)]) for (const a of c.accessories ?? []) {
      assert.ok(/[가-힣]/.test(a.text) && !/T8|−1|포멀도|\(3색 규칙\)|[a-z]/i.test(a.text), a.text);
      assert.ok(typeof a.reason === 'string' && a.reason.length);
      if (a.ruleId.startsWith('occasion.')) assert.ok(a.text.includes('기본 소품'), a.text);
    }
  }
});

test('C6-04·12 winter layering: mid cards > 0 for the 8 review bases (shirt + knit-over-shirt + coat), quilted vest only in navy/olive/black/charcoal/brown, mid pair ruleMissing hidden', () => {
  const bases = [...BASES.filter((b) => b.category !== 'outer'), { category: 'bottom', color: 'beige' }, { category: 'bottom', color: 'charcoal' }, { category: 'bottom', color: 'blackDenim' }, { category: 'bottom', color: 'olive' }, { category: 'top', color: 'navy' }];
  for (const base of bases) {
    const r = engine.recommend({ base, season: 'winter', mode: 'deep', layering: true });
    const shown = [...r.classic, ...r.byTone.flatMap((g) => g.candidates), ...r.byHue.flatMap((g) => g.candidates), ...r.byStyle.flatMap((g) => g.candidates), ...r.byOccasion.flatMap((g) => g.candidates), ...r.variations.map((v) => v.candidate)];
    const mids = shown.filter((c) => item(c.outfit, 'mid'));
    assert.ok(mids.length >= 1, `${base.category}/${base.color} winter: no mid cards`);
    for (const c of mids) {
      const mid = item(c.outfit, 'mid'); const top = item(c.outfit, 'top');
      assert.ok(c.score.style.layer.score >= 4, line(c.outfit));
      if (mid.itemType === 'knitOverShirt') { assert.ok(['oxfordShirt', 'dressShirt'].includes(top.itemType), line(c.outfit)); assert.notEqual(mid.color, top.color); }
      const midMissing = c.score.reasons.filter((x) => x.key === 'explain.ruleMissing' && (x.params.aCategory === 'mid' || x.params.bCategory === 'mid'));
      assert.ok(midMissing.length >= 1, 'mid pairs have no colour rule (expected)');
      assert.ok(c.explain.filter((s) => /규칙 없음/.test(s)).length <= c.score.reasons.filter((x) => x.key === 'explain.ruleMissing').length - midMissing.length + 1);
    }
  }
  for (const base of [{ category: 'bottom', color: 'indigo' }, { category: 'bottom', color: 'olive' }, { category: 'shoes', color: 'white' }, { category: 'bottom', color: 'blackDenim' }]) {
    const r = engine.recommend({ base, season: 'springFall', mode: 'deep', layering: true });
    const shown = [...r.byTone.flatMap((g) => g.candidates), ...r.byHue.flatMap((g) => g.candidates), ...r.byStyle.flatMap((g) => g.candidates), ...r.byOccasion.flatMap((g) => g.candidates), ...r.variations.map((v) => v.candidate)];
    for (const c of shown) { const mid = item(c.outfit, 'mid'); if (mid?.itemType === 'quiltedVest') assert.ok(['navy', 'olive', 'black', 'charcoal', 'brown'].includes(mid.color), line(c.outfit)); }
  }
});

test('C6-11·17 patterns: houndstooth knit + workboot/denim casual blocked; pattern variation name "라이트 블루 잔줄 셔츠" (no duplicated 셔츠)', () => {
  const hs = outfit({ top: ['white', 'knitWool', { pattern: 'houndstooth' }], bottom: ['indigo', 'denimIndigo'], shoes: ['brown', 'workboot'] }, 'winter');
  assert.equal(engine.score(hs, 'winter').blocked, true, 'ptHoundstoothCasual / ptHoundstoothCasualShoes');
  const ok = outfit({ top: ['white', 'knitWool', { pattern: 'houndstooth' }], bottom: ['charcoal', 'wool'], shoes: ['black', 'derby'] }, 'winter');
  assert.equal(engine.score(ok, 'winter').blocked, false);
  for (const base of [{ category: 'bottom', color: 'indigo' }, { category: 'bottom', color: 'blackDenim' }, { category: 'shoes', color: 'white' }, { category: 'bottom', color: 'beige' }]) for (const season of ['winter', 'springFall']) {
    const r = engine.recommend({ base, season, mode: 'deep', patterns: true });
    for (const v of r.variations.filter((x) => x.candidate.outfit.tags.includes('pattern'))) {
      const top = item(v.candidate.outfit, 'top');
      assert.ok(!(top.pattern === 'houndstooth' && /workboot|chukka|sneakerColor/.test(item(v.candidate.outfit, 'shoes').shoeType)), line(v.candidate.outfit));
      assert.ok(!/셔츠 .*셔츠/.test(top.itemName), top.itemName);
    }
  }
  // o10 "라이트 블루 셔츠"(품목 라벨이 통째로 없음) → "라이트 블루 잔줄 셔츠"
  const r = engine.recommend({ base: { category: 'bottom', color: 'charcoal' }, season: 'winter', mode: 'deep', patterns: true });
  const names = r.variations.filter((x) => x.candidate.outfit.tags.includes('pattern')).map((v) => item(v.candidate.outfit, 'top').itemName);
  assert.ok(names.every((n) => !/잔줄 셔츠 .*셔츠/.test(n)), names.join(' / '));
});

test('U6-13·C6-19·22 labels: ivy "아이비", bizcasual "비즈캐주얼", active shortLabel "운동", help ≤ 24 chars and free of internal ids for first-wave styles · occasions · mid types · accessories', () => {
  const st = Object.fromEntries(engine.styles().map((s) => [s.id, s]));
  assert.equal(st.ivy.label, '아이비'); assert.equal(st.bizcasual.label, '비즈캐주얼');
  for (const s of engine.styles()) { assert.equal(s.label, s.shortLabel, s.id); assert.ok(s.help.length > 0 && [...s.help].length <= 24, `${s.id} help ${s.help}`); assert.ok(!/[a-z]|2차|T8/i.test(s.help), s.help); }
  const oc = Object.fromEntries(engine.occasions().map((o) => [o.id, o]));
  assert.equal(oc.active.shortLabel, '운동'); assert.ok(!/수트는 2차/.test(oc.formal.help));
  for (const o of engine.occasions()) assert.ok(o.help.length > 0 && [...o.help].length <= 24 && !/[a-z]|2차/i.test(o.help), `${o.id} help ${o.help}`);
  for (const l of data.labels.filter((x) => /^(midType|accessory)\./.test(x.id))) assert.ok(!/[a-z]|T8|=/i.test(l.help), `${l.id} help: ${l.help}`);
  assert.equal(data.labels.find((l) => l.id === 'midType.knitOverShirt').shortLabel, '이너 니트');
  const L = engine.labels;
  assert.ok(!/격식 창/.test(L['explain.occasion.window']) && /\{occasion\}/.test(L['explain.occasion.window']));
  assert.equal(L['explain.occasion.shortfall'], '{occasion}에 맞는 조합이 더 없어요');
  // 상황 문구: '격식 격식' 중복 없음, 창 밖 카드에 '딱 맞아요' 없음, 숫자만 있는 문장 없음
  const r = engine.recommend({ base: { category: 'bottom', color: 'charcoal' }, season: 'summer', mode: 'deep', occasion: 'formal' });
  for (const c of r.classic) {
    assert.ok(!c.styleExplain.some((s) => /격식 격식/.test(s)), c.styleExplain.join(' / '));
    if (c.styleReasons.some((x) => x.key === 'explain.occasion.window')) assert.ok(!c.styleReasons.some((x) => x.key === 'explain.occasion.target'));
    assert.ok(!c.styleExplain.some((s) => /^[^가-힣]*[+−]\d/.test(s)), 'no number-only sentence');
  }
});
