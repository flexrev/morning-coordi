// Phase 6-B (CX) 콘텐츠 확장 테스트 — content-expansion.md 7-5 E-21 ~ E-32 + 게이트 5 지시 추가 케이스. node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { data } from '../src/data/index.js';
import { createEngine, materialize, validateData, styleVector, styleTags, suggestAccessories, evalPatterns, patternExcluded, quickPool, occasionAdjust } from '../src/engine/index.js';
import { K_STYLE, STYLE_TAGS_MAX, QUICK_CARDS } from '../src/engine/constants.js';

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

test('E-23 oxford + blazer + chino + penny loafer → styleTags = [ivy, bizcasual] in that order', () => {
  const o = data.outfits.find((x) => item(x, 'top')?.itemType === 'oxfordShirt' && item(x, 'outer')?.itemType === 'blazer' && item(x, 'bottom')?.material === 'chino' && item(x, 'shoes')?.shoeType === 'loaferPenny');
  assert.ok(o, 'outfit exists');
  assert.deepEqual(styleTags(styleVector(index, o), index).map((t) => t.id), ['ivy', 'bizcasual']);
  assert.deepEqual(o.styles.map((t) => t.id), ['ivy', 'bizcasual'], 'outfits.json styles[] (build-time) agrees');
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
test('E-26 charcoal (wool) deep, occasion active: no avoided leather shoes in classic, 3 cards, relaxation logged', () => {
  const r = engine.recommend({ base: { category: 'bottom', color: 'charcoal' }, season: 'springFall', mode: 'deep', occasion: 'active' });
  const occ = index.occasions.get('active');
  assert.equal(r.classic.length, 3);
  for (const c of r.classic) assert.ok(!occ.avoid.shoeTypes.includes(item(c.outfit, 'shoes').shoeType), line(c.outfit));
  assert.ok(r.applied.relaxed.includes('materials'), `relaxed: ${r.applied.relaxed}`); // 울 하의 베이스라 materials 완화가 필요
  assert.equal(r.applied.occasion, 'active');
  assert.ok(r.classic.every((c) => typeof c.rank.occasionAdj === 'number'));
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

test('occasion always returns 3 cards: 4 bases × 3 seasons × 5 occasions + all bottom chips × 3 seasons × {formal, active}', () => {
  const occIds = engine.occasions().map((o) => o.id);
  const cases = [];
  for (const base of BASES) for (const season of SEASONS) for (const occasion of occIds) cases.push([base, season, occasion]);
  for (const color of engine.baseColors('bottom')) for (const season of SEASONS) for (const occasion of ['formal', 'active']) cases.push([{ category: 'bottom', color }, season, occasion]);
  for (const [base, season, occasion] of cases) {
    const r = engine.recommend({ base, season, mode: 'quick', occasion });
    const tag = `${base.category}/${base.color}/${season}/${occasion}`;
    assert.equal(r.classic.length, QUICK_CARDS, tag);
    assert.ok(r.classic.every((c) => !c.score.blocked), `${tag} blocked`);
    assert.ok(r.classic.every((c) => c.outfit.items.some((i) => i.category === base.category && i.color === base.color)), `${tag} base item`);
    assert.ok(new Set(r.classic.map((c) => c.outfit.id)).size === 3, `${tag} unique`);
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
  }
  assert.equal(r.byOccasion.length, 5);
  for (const g of r.byOccasion) { assert.ok(g.candidates.length >= 1 && g.candidates.length <= 3, g.occasion); assert.equal(g.labelKey, `occasion.${g.occasion}`); assert.ok(Array.isArray(g.relaxed)); }
  const sel = engine.recommend({ base: { category: 'bottom', color: 'indigo' }, season: 'springFall', mode: 'deep', style: 'ivy' });
  assert.equal(sel.byStyle[0].style, 'ivy'); assert.ok(sel.byStyle.length <= 2);
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
  assert.equal(data.accessoryTypes.length, 19); assert.equal(data.accessoryRules.length, 32); assert.equal(data.patterns.length, 9); assert.equal(data.patternRules.length, 19);
  assert.equal(data.midTypes.length, 5); assert.equal(data.midLayerRules.length, 12); assert.equal(data.twoOuterRules.length, 6);
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
