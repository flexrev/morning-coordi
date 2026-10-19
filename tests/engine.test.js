// 엔진 테스트 — engine-spec.md 9절 E-01~E-20 + 추가 케이스(C2). node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { data } from '../src/data/index.js';
import { createEngine, buildIndex, scoreOutfit, materialize, validateData, generateCandidates } from '../src/engine/index.js';

const engine = createEngine(data);
const index = engine.index;
const BOTTOM_BASES = ['indigo', 'lightDenim', 'blackDenim', 'beige', 'khaki', 'navy', 'midGrey', 'charcoal', 'olive', 'brown', 'black', 'white', 'cream'];

/** 테스트용 코디 조립: spec = { top:[color, itemType, {fit,length,material}], bottom:[color, material, {fit,length}], shoes:[color, shoeType], outer:[color, outerType] | [..2], tags } */
function outfit(spec, season = 'springFall') {
  const items = [];
  const [tc, tt, to = {}] = spec.top;
  items.push(materialize(index, 'top', tc, season, { itemType: tt, ...to }));
  const [bc, bm, bo = {}] = spec.bottom;
  items.push(materialize(index, 'bottom', bc, season, { material: bm, ...bo }));
  const [sc, st] = spec.shoes;
  items.push(materialize(index, 'shoes', sc, season, { shoeType: st }));
  for (const [i, o] of (spec.outers ?? (spec.outer ? [spec.outer] : [])).entries()) {
    const it = materialize(index, 'outer', o[0], season, { itemType: o[1] });
    if ((spec.outers ?? []).length > 1) it.layer = i + 1;
    items.push(it);
  }
  return { id: 't-' + Math.random().toString(36).slice(2, 6), items, seasons: [season], tags: spec.tags ?? [], isClassic: true, universal: false, sources: [], flags: [] };
}
const reasonKeys = (s) => s.reasons.map((r) => r.key);
const adjIds = (s) => s.style.adjust.reasons.map((r) => r.params.id);

test('E-01 indigo quick: classic 3, first = o01, all universal', () => {
  const r = engine.recommend({ base: { category: 'bottom', color: 'indigo' }, season: 'springFall', mode: 'quick' });
  assert.equal(r.classic.length, 3);
  assert.equal(r.classic[0].outfit.id, 'o01');
  assert.ok(r.classic.every((c) => c.outfit.universal), r.classic.map((c) => c.outfit.id).join(','));
  assert.equal(r.byTone, undefined);
});

test('E-02 same query twice → deep-equal', () => {
  const q = { base: { category: 'bottom', color: 'indigo' }, season: 'springFall', mode: 'quick' };
  const a = engine.recommend(q);
  const b = engine.recommend({ ...q });
  assert.deepEqual(a.classic.map((c) => [c.outfit.id, c.score.final]), b.classic.map((c) => [c.outfit.id, c.score.final]));
});

test('E-03 12 bottom bases × 3 seasons × quick → always 3, blocked 0', () => {
  for (const color of BOTTOM_BASES) for (const season of ['springFall', 'summer', 'winter']) {
    const r = engine.recommend({ base: { category: 'bottom', color }, season, mode: 'quick' });
    assert.equal(r.classic.length, 3, `${color}/${season}`);
    assert.ok(r.classic.every((c) => !c.score.blocked), `${color}/${season} blocked`);
  }
});

test('E-04 running + wool → blocked, formalityGap 6', () => {
  const s = engine.score(outfit({ top: ['white', 'tee'], bottom: ['midGrey', 'wool'], shoes: ['black', 'running'] }), 'springFall');
  assert.equal(s.blocked, true);
  const fg = s.blockReasons.find((r) => r.key === 'explain.formalityGap');
  assert.ok(fg);
  assert.equal(fg.params.gap, 6);
});

test('E-05 oxford + chino tapered → warn gap 4, not blocked', () => {
  const s = engine.score(outfit({ top: ['white', 'oxfordShirt'], bottom: ['beige', 'chino', { fit: 'tapered' }], shoes: ['black', 'oxford'] }), 'springFall');
  assert.equal(s.blocked, false);
  const fg = s.warnings.find((r) => r.key === 'explain.formalityGap');
  assert.ok(fg); assert.equal(fg.params.gap, 4);
});

test('E-06 sneakerWhite + wool → gap 4, penalty 1; allClassic 카드는 문구만 info로 숨김(P3-19), variation 쌍이면 warn', () => {
  const s = engine.score(outfit({ top: ['navy', 'knitWool'], bottom: ['midGrey', 'wool'], shoes: ['white', 'sneakerWhite'] }), 'springFall');
  assert.equal(s.blocked, false);
  assert.equal(s.style.formality.gap, 4);
  assert.equal(s.style.formality.penalty, 1);
  const fg = s.reasons.find((r) => r.key === 'explain.formalityGap');
  assert.ok(fg && fg.params.gap === 4);
  assert.equal(fg.severity, s.color.detail.allClassic ? 'info' : 'warn');
  // 전 쌍 classic 코디(o01 변형: 흰 티+인디고+브라운 페니 로퍼 gap 4)에서는 explain 문구에 '격식 차이'가 없다
  const c = engine.score(outfit({ top: ['white', 'tee'], bottom: ['indigo', 'denimIndigo'], shoes: ['brown', 'loaferPenny'] }, 'summer'), 'summer');
  assert.ok(c.color.detail.allClassic);
  assert.ok(!engine.explain(c).some((t) => /격식 차이/.test(t)), engine.explain(c).join(' / '));
  assert.ok(c.reasons.some((r) => r.key === 'explain.formalityGap'), 'S6용 reasons에는 남는다');
});

test('E-07 hoodie(oversized) + wool + variation tag → warn, not blocked', () => {
  const s = engine.score(outfit({ top: ['navy', 'hoodie', { fit: 'oversized' }], bottom: ['midGrey', 'wool', { fit: 'tapered' }], shoes: ['white', 'sneakerWhite'], tags: ['variation'] }), 'springFall');
  assert.equal(s.blocked, false);
  assert.ok(s.warnings.some((r) => r.key === 'explain.formalityGap' && r.params.gap >= 5));
  assert.equal(s.style.formality.penalty, 2);
});

test('E-08 o01 springFall: final ≥ 4.5, explain[0] ∈ {클래식, 누구나 안전한 기본 조합}', () => {
  const o = index.outfits.get('o01');
  const s = engine.score(o, 'springFall');
  assert.ok(s.final >= 4.5, String(s.final));
  const ex = engine.explain(s, o);
  assert.ok(['클래식', '누구나 안전한 기본 조합'].includes(ex[0]), ex.join('/'));
});

test('E-09 black tee + blackDenim, summer → adjSummerBlackBlack −1 only', () => {
  const s = engine.score(outfit({ top: ['black', 'tee'], bottom: ['blackDenim', 'denimBlack'], shoes: ['black', 'sneakerColor'] }, 'summer'), 'summer');
  assert.deepEqual(adjIds(s), ['adjSummerBlackBlack']);
  assert.equal(s.style.adjust.score, -1);
});

test('E-10 white tee + white chino → adjSameColorTopBottom −2', () => {
  const s = engine.score(outfit({ top: ['white', 'tee'], bottom: ['white', 'chino'], shoes: ['brown', 'loaferPenny'] }, 'summer'), 'summer');
  assert.ok(adjIds(s).includes('adjSameColorTopBottom'));
  assert.ok(s.reasons.some((r) => r.key === 'explain.sameColor' && r.delta === -2));
});

test('E-11 charcoal wool + tan shoes → color pair 1 → blocked (A7)', () => {
  const s = engine.score(outfit({ top: ['white', 'oxfordShirt'], bottom: ['charcoal', 'wool'], shoes: ['tan', 'chukka'] }), 'springFall');
  assert.equal(s.blocked, true);
  assert.ok(s.blockReasons.some((r) => r.key === 'explain.avoid'));
});

test('E-12 lightDenim + black derby → pair 2 → warn adventurous', () => {
  const s = engine.score(outfit({ top: ['white', 'tee'], bottom: ['lightDenim', 'denimWashed'], shoes: ['black', 'derby'] }), 'springFall');
  assert.ok(s.warnings.some((r) => r.key === 'explain.adventurous'));
});

test('E-13 beige chino + navy knit → toneModifier +1, explain mentions 조합', () => {
  const o = outfit({ top: ['navy', 'knitWool'], bottom: ['beige', 'chino'], shoes: ['brown', 'loaferPenny'] });
  const s = engine.score(o, 'springFall');
  assert.ok(s.reasons.some((r) => r.key === 'explain.toneCross' && r.delta === 1));
  const ex = engine.explain(s, o).join(' ');
  assert.ok(/보색|\+/.test(ex), ex);
});

test('E-14 indigo deep → byHue.complementary includes rust top', () => {
  const r = engine.recommend({ base: { category: 'bottom', color: 'indigo' }, season: 'springFall', mode: 'deep' });
  const comp = r.byHue.find((g) => g.relation === 'complementary');
  assert.ok(comp && comp.candidates.length > 0);
  const all = generateCandidates(index, { category: 'bottom', color: 'indigo' }, 'springFall');
  assert.ok(all.some((o) => o.items.some((i) => i.category === 'top' && i.color === 'rust')));
  assert.ok(comp.candidates.every((c) => ['brown', 'rust', 'camel', 'tan', 'chocolate', 'taupe', 'beige', 'khaki', 'oatmeal'].includes(c.outfit.items.find((i) => i.category === 'top').color)));
});

test('E-15 indigo + lightBlue shirt deep → byHue.analogous, explain 톤온톤/유사색', () => {
  const r = engine.recommend({ base: { category: 'bottom', color: 'indigo' }, season: 'springFall', mode: 'deep' });
  const ana = r.byHue.find((g) => g.relation === 'analogous');
  assert.ok(ana);
  const c = ana.candidates.find((x) => x.outfit.items.some((i) => i.category === 'top' && i.color === 'lightBlue'));
  assert.ok(c, '라이트블루 상의 후보');
  assert.ok(c.explain.some((e) => /톤온톤|유사색/.test(e)), c.explain.join('/'));
});

test('E-16 deep indigo → each variation differs from its classic card in exactly one item', () => {
  const r = engine.recommend({ base: { category: 'bottom', color: 'indigo' }, season: 'springFall', mode: 'deep' });
  assert.ok(r.variations.length > 0);
  for (const v of r.variations) {
    const from = r.classic.find((c) => c.outfit.id === v.fromOutfitId).outfit;
    const to = v.candidate.outfit;
    assert.equal(from.items.length, to.items.length);
    const diff = from.items.filter((a) => !to.items.some((b) => b.category === a.category && b.color === a.color && b.material === a.material && b.shoeType === a.shoeType && b.itemType === a.itemType));
    assert.equal(diff.length, 1, `${v.fromOutfitId} → ${v.swapped.category}`);
    assert.equal(diff[0].category, v.swapped.category);
  }
});

test('E-17 deep arbitrary base → stats.ms < 50 (warm)', () => {
  engine.recommend({ base: { category: 'top', color: 'navy' }, season: 'winter', mode: 'deep' });
  const r = engine.recommend({ base: { category: 'top', color: 'burgundy' }, season: 'winter', mode: 'deep' });
  assert.ok(r.stats.ms < 50, `ms=${r.stats.ms}`);
});

test('E-18 winter lightDenim → seasonModifier −1, explain seasonOut', () => {
  const o = outfit({ top: ['white', 'knitWool'], bottom: ['lightDenim', 'denimWashed'], shoes: ['white', 'sneakerWhite'] }, 'winter');
  const s = engine.score(o, 'winter');
  assert.equal(s.color.detail.seasonMod, -1);
  assert.ok(s.warnings.some((r) => r.key === 'explain.seasonOut' && r.params.color === 'lightDenim'));
});

test('E-19 summer + 2 outers → layer over −2', () => {
  const o = outfit({ top: ['white', 'tee'], bottom: ['beige', 'chino'], shoes: ['white', 'sneakerWhite'], outers: [['navy', 'overshirt'], ['navy', 'blazer']] }, 'summer');
  const s = engine.score(o, 'summer');
  assert.ok(s.style.season.reasons.some((r) => r.key === 'explain.layerOver' && r.delta === -2));
  assert.ok(s.style.season.score <= 3);
});

test('E-20 validateData(data) → no errors', () => {
  const issues = validateData(data);
  assert.deepEqual(issues.filter((i) => i.severity === 'error'), []);
});

// ---------------------------------------------------------------- 추가 케이스
test('indigo denim quick → 3 cards, all classic, ≥2 distinct shoe colors', () => {
  for (const season of ['springFall', 'summer', 'winter']) {
    const r = engine.recommend({ base: { category: 'bottom', color: 'indigo' }, season, mode: 'quick' });
    assert.equal(r.classic.length, 3);
    assert.ok(r.classic.every((c) => c.outfit.isClassic), season);
    const shoeColors = new Set(r.classic.map((c) => c.outfit.items.find((i) => i.category === 'shoes').color));
    assert.ok(shoeColors.size >= 2, `${season}: ${[...shoeColors]}`);
  }
});

test('white tee quick → includes indigo or navy bottom', () => {
  const r = engine.recommend({ base: { category: 'top', color: 'white' }, season: 'springFall', mode: 'quick' });
  assert.ok(r.classic.some((c) => ['indigo', 'navy'].includes(c.outfit.items.find((i) => i.category === 'bottom').color)));
});

test('formality gap case blocked: sandal + flannel', () => {
  const s = engine.score(outfit({ top: ['white', 'tee'], bottom: ['charcoal', 'flannel'], shoes: ['brown', 'sandal'] }, 'summer'), 'summer');
  assert.equal(s.blocked, true);
});

test('avoid pair never appears in quick (olive bottom → no olive/forestGreen top)', () => {
  for (const season of ['springFall', 'summer', 'winter']) {
    const r = engine.recommend({ base: { category: 'bottom', color: 'olive' }, season, mode: 'quick' });
    for (const c of r.classic) {
      assert.ok(!['olive', 'forestGreen'].includes(c.outfit.items.find((i) => i.category === 'top').color));
      assert.equal(c.score.blocked, false);
    }
  }
  const r = engine.recommend({ base: { category: 'bottom', color: 'charcoal' }, season: 'springFall', mode: 'quick' });
  for (const c of r.classic) assert.notEqual(c.outfit.items.find((i) => i.category === 'shoes').color, 'tan');
});

test('reverse lookup: base shoes white → results; base outer navy → results', () => {
  const r = engine.recommend({ base: { category: 'shoes', color: 'white' }, season: 'springFall', mode: 'quick' });
  assert.equal(r.classic.length, 3);
  assert.ok(r.classic.every((c) => c.outfit.items.find((i) => i.category === 'shoes').color === 'white'));
  const d = engine.recommend({ base: { category: 'outer', color: 'navy' }, season: 'winter', mode: 'deep' });
  assert.equal(d.classic.length, 3);
  assert.ok(d.stats.candidates > 0);
  assert.ok(d.classic.every((c) => c.outfit.items.some((i) => i.category === 'outer' && i.color === 'navy')));
});

test('deep mode: classic equals quick classic; groups non-empty', () => {
  const q = engine.recommend({ base: { category: 'bottom', color: 'beige' }, season: 'springFall', mode: 'quick' });
  const d = engine.recommend({ base: { category: 'bottom', color: 'beige' }, season: 'springFall', mode: 'deep' });
  assert.deepEqual(q.classic.map((c) => c.outfit.id), d.classic.map((c) => c.outfit.id));
  assert.ok(d.byTone.length > 0 && d.byHue.length > 0);
  assert.ok(d.byTone.every((g) => g.candidates.length <= 5));
});

test('caption rule drops implied material: o01 → 화이트 티셔츠 · 인디고 데님 · 흰 스니커즈', () => {
  assert.equal(engine.caption(index.outfits.get('o01')), '화이트 티셔츠 · 인디고 데님 · 흰 스니커즈');
});

test('pure/deterministic: buildIndex + scoreOutfit without engine', () => {
  const idx = buildIndex(data);
  const o = idx.outfits.get('o04');
  const a = scoreOutfit(idx, o, 'springFall'); const b = scoreOutfit(idx, o, 'springFall');
  assert.deepEqual(a, b);
  assert.ok(a.percent >= 0 && a.percent <= 100);
});

test('perf: warm recommend (quick + deep) < 50ms each', () => {
  const q = { base: { category: 'bottom', color: 'khaki' }, season: 'springFall' };
  engine.recommend({ ...q, mode: 'deep' });
  let t = performance.now(); engine.recommend({ ...q, base: { ...q.base, color: 'navy' }, mode: 'quick' }); const quick = performance.now() - t;
  t = performance.now(); engine.recommend({ ...q, base: { ...q.base, color: 'navy' }, mode: 'deep' }); const deep = performance.now() - t;
  assert.ok(quick < 50, `quick ${quick.toFixed(1)}ms`);
  assert.ok(deep < 50, `deep ${deep.toFixed(1)}ms`);
});
