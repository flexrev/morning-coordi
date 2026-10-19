// 통합 테스트 (Phase 3-C, C1) — 실데이터 + 실제 엔진 + UI 카탈로그가 같은 data 로 맞물리는지.
// 네 기준 아이템(하의 인디고 · 상의 화이트 · 신발 화이트 · 아우터 네이비)에 대해 quick 3장, 신발 색 ≥2종, 피할 쌍 없음, 캡션 비어 있지 않음.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { data } from '../src/data/index.js';
import { createEngine, materialize, generateCandidates, groupByTone, groupByHue } from '../src/engine/index.js';
import { createCatalog } from '../src/ui/catalog.js';
import { FORMALITY_BLOCK, FORMALITY_WARN } from '../src/engine/constants.js';

const engine = createEngine(data);
const catalog = createCatalog(data);
const BASES = [
  { category: 'bottom', color: 'indigo' },
  { category: 'top', color: 'white' },
  { category: 'shoes', color: 'white' },
  { category: 'outer', color: 'navy' },
];
const SEASONS = ['springFall', 'summer', 'winter'];
const item = (o, cat) => o.items.find((i) => i.category === cat);

/** colorRules.avoid 에 있는 (base, target) 쌍이 코디 안에 함께 있으면 true */
function hasAvoidPair(outfit) {
  for (const rule of data.colorRules) {
    if (rule.variant) continue;
    const base = outfit.items.find((i) => i.category === rule.baseCategory && i.color === rule.base);
    if (!base) continue;
    for (const a of rule.avoid) {
      if (a.category && a.color && outfit.items.some((i) => i.category === a.category && i.color === a.color)) return `${rule.base}/${rule.baseCategory} × ${a.category}:${a.color}`;
    }
  }
  return null;
}

for (const base of BASES) {
  test(`quick ${base.category}/${base.color}: 3 classic cards, ≥2 shoe colors, no avoid pair, caption non-empty`, () => {
    for (const season of SEASONS) {
      const r = engine.recommend({ base, season, mode: 'quick' });
      const tag = `${base.category}/${base.color}/${season}`;
      assert.equal(r.classic.length, 3, tag);
      const shoeColors = new Set(r.classic.map((c) => item(c.outfit, 'shoes').color));
      // 기준이 신발이면 신발 색은 당연히 1종
      if (base.category !== 'shoes') assert.ok(shoeColors.size >= 2, `${tag}: shoe colors ${[...shoeColors]}`);
      for (const c of r.classic) {
        assert.equal(c.score.blocked, false, `${tag} ${c.outfit.id} blocked`);
        assert.ok(c.outfit.items.some((i) => i.category === base.category && i.color === base.color), `${tag} ${c.outfit.id} base item missing`);
        assert.equal(hasAvoidPair(c.outfit), null, `${tag} ${c.outfit.id}: avoid pair ${hasAvoidPair(c.outfit)}`);
        const cap = engine.caption(c.outfit);
        assert.ok(cap.length > 0 && cap.split(' · ').length === c.outfit.items.length, `${tag} caption "${cap}"`);
        for (const it of c.outfit.items) {
          assert.ok(engine.itemCaption(it).length > 0, `${tag} itemCaption`);
          assert.ok(catalog.shortName(it).length > 0, `${tag} shortName`);
        }
        assert.ok(c.explain.length >= 1, `${tag} explain`);
      }
    }
  });
}

test('deep result carries avoid[] (G1), variations with fromOutfitId/swapped (G2)', () => {
  const r = engine.recommend({ base: { category: 'bottom', color: 'indigo' }, season: 'springFall', mode: 'deep' });
  assert.ok(Array.isArray(r.avoid));
  assert.ok(r.avoid.some((a) => a.target === '아우터 인디고'), JSON.stringify(r.avoid));
  assert.ok(r.avoid.every((a) => typeof a.reason === 'string' && a.reason.length > 0));
  assert.ok(r.variations.length > 0);
  for (const v of r.variations) {
    assert.ok(r.classic.some((c) => c.outfit.id === v.fromOutfitId), v.fromOutfitId);
    assert.ok(['top', 'bottom', 'shoes', 'outer'].includes(v.swapped.category));
    assert.ok(v.swapped.from && v.swapped.to && v.swapped.to.category === v.swapped.category);
  }
  // 역방향 avoid: 신발 탄 ← 차콜 하의 규칙(A7)
  const tan = engine.recommend({ base: { category: 'shoes', color: 'tan' }, season: 'springFall', mode: 'deep' });
  assert.ok(tan.avoid.some((a) => a.target === '하의 차콜'), JSON.stringify(tan.avoid));
});

test('D1 formality: BLOCK 6 / WARN 4; white tee + navy blazer (gap 5) warns, is not blocked', () => {
  assert.equal(FORMALITY_BLOCK, 6);
  assert.equal(FORMALITY_WARN, 4);
  const idx = engine.index;
  const mk = (spec, season = 'springFall') => ({
    id: 't', items: [
      materialize(idx, 'top', spec.top[0], season, { itemType: spec.top[1] }),
      materialize(idx, 'bottom', spec.bottom[0], season, { material: spec.bottom[1] }),
      materialize(idx, 'shoes', spec.shoes[0], season, { shoeType: spec.shoes[1] }),
      ...(spec.outer ? [materialize(idx, 'outer', spec.outer[0], season, { itemType: spec.outer[1] })] : []),
    ], seasons: [season], tags: [], isClassic: true, universal: false, sources: spec.sources ?? [], flags: [],
  });
  const blazer = engine.score(mk({ top: ['white', 'tee'], bottom: ['lightDenim', 'denimWashed'], shoes: ['white', 'sneakerWhite'], outer: ['navy', 'blazer'] }), 'springFall');
  assert.equal(blazer.style.formality.gap, 5);
  assert.equal(blazer.blocked, false);
  assert.ok(blazer.warnings.some((r) => r.key === 'explain.formalityGap'));
  const trench = engine.score(mk({ top: ['white', 'tee'], bottom: ['indigo', 'denimIndigo'], shoes: ['brown', 'chukka'], outer: ['camel', 'trench'] }), 'springFall');
  assert.equal(trench.style.formality.gap, 5);
  assert.equal(trench.blocked, false);
  // 격차 6: 출처 1개 클래식은 차단, 출처 2개 이상 클래식은 경고(패널티 2)로 완화
  const one = engine.score(mk({ top: ['white', 'tee'], bottom: ['indigo', 'denimIndigo'], shoes: ['brown', 'chukka'], outer: ['navy', 'chesterfield'], sources: ['R1'] }, 'winter'), 'winter');
  assert.equal(one.style.formality.gap, 6);
  assert.equal(one.blocked, true);
  const two = engine.score(mk({ top: ['white', 'tee'], bottom: ['indigo', 'denimIndigo'], shoes: ['brown', 'chukka'], outer: ['navy', 'chesterfield'], sources: ['R1', 'GG'] }, 'winter'), 'winter');
  assert.equal(two.blocked, false);
  assert.equal(two.style.formality.penalty, 2);
});

test('D1 data: c02/c22 restored to universal (12 universal), ladder blazer/trench 7, chesterfield 8', () => {
  const universal = data.outfits.filter((o) => o.universal);
  assert.equal(universal.length, 12);
  const byItems = (top, outer) => data.outfits.find((o) => item(o, 'top')?.itemType === top && item(o, 'outer')?.itemType === outer && item(o, 'top').color === 'white');
  assert.ok(byItems('tee', 'trench')?.universal, 'white tee + camel trench universal');
  assert.ok(byItems('tee', 'blazer')?.universal, 'white tee + navy blazer universal');
  const lvl = (cat, id) => data.formality.find((f) => f.category === cat && f.id === id && !f.when).level;
  assert.equal(lvl('outer', 'blazer'), 7);
  assert.equal(lvl('outer', 'trench'), 7);
  assert.equal(lvl('outer', 'chesterfield'), 8);
  // 복원된 두 코디가 하의 인디고 / 상의 화이트 quick 에서 차단되지 않는다
  for (const o of [byItems('tee', 'trench'), byItems('tee', 'blazer')]) assert.equal(engine.score(o, 'springFall').blocked, false, o.id);
});

test('catalog and engine share labels: shortName never falls back to raw ids for classic cards', () => {
  const r = engine.recommend({ base: { category: 'bottom', color: 'indigo' }, season: 'springFall', mode: 'quick' });
  for (const c of r.classic) for (const it of c.outfit.items) {
    const s = catalog.shortName(it);
    assert.ok(!/[a-z]/i.test(s), `${c.outfit.id}: "${s}"`);
  }
  assert.equal(catalog.shortName(item(engine.index.outfits.get('o01'), 'shoes')), '흰스니커즈');
  assert.equal(catalog.shortName(item(engine.index.outfits.get('o01'), 'bottom')), '인디고데님');
});

// ---------------------------------------------------------------- Phase 4 (P3/P1 수정) — 전 칩 × 3계절 전수
const CATS = ['bottom', 'top', 'shoes', 'outer'];
const idx = engine.index;
const inSeason = (color, season) => idx.colors.get(color).seasons.includes(season);
const seasonReasons = (c) => c.score.reasons.filter((r) => r.key === 'explain.seasonOut' || r.key === 'explain.seasonItem');
const fromBase = (r, base) => (r.key === 'explain.seasonOut' ? r.params.category === base.category && r.params.color === base.color : r.params.category === base.category);
const mk = (items, season) => ({ id: 't', items, seasons: [season], tags: [], isClassic: false, universal: false, sources: [], flags: [] });

test('P4 helpers: engine.hasBaseRule(category, color) / engine.baseColors(category) — classic 매치 수 내림차순, 예비 색 제외', () => {
  assert.equal(typeof engine.hasBaseRule, 'function');
  assert.equal(engine.hasBaseRule('bottom', 'indigo'), true);
  assert.equal(engine.hasBaseRule('top', 'beige'), false);
  assert.equal(engine.hasBaseRule('shoes', 'white'), false);
  for (const cat of CATS) {
    const list = engine.baseColors(cat);
    assert.ok(Array.isArray(list) && list.length >= 6, cat);
    assert.ok(list.every((c) => typeof c === 'string' && idx.colors.has(c)));
    assert.ok(!list.includes('teal') && !list.includes('taupe'), 'RESERVE_COLORS 제외');
    const classic = (c) => idx.baseStats.get(`${cat}|${c}`).classic;
    for (let i = 1; i < list.length; i++) assert.ok(classic(list[i - 1]) >= classic(list[i]), `${cat}: ${list[i - 1]} ≥ ${list[i]}`);
    assert.ok(list.every((c) => classic(c) >= 1), `${cat}: classic 매치 0인 색은 칩에 안 올림`);
  }
  // P3-01: 규칙 없는 상의 색·하의 lightGrey 가 칩에 포함되고 3장을 만든다
  for (const c of ['beige', 'brown', 'lightGrey', 'midGrey', 'charcoal', 'tan']) assert.ok(engine.baseColors('top').includes(c), `top ${c}`);
  assert.ok(engine.baseColors('bottom').includes('lightGrey'));
  assert.equal(engine.baseColors('top')[0], 'greyMelange');
});

test('P4 전수: 모든 칩(baseColors) × 3계절 → 클래식 3장, 베이스 탓이 아닌 계절 경고 0, 차단 0, 피할 쌍 0, 변주 태그 0', () => {
  let n = 0;
  for (const category of CATS) for (const color of engine.baseColors(category)) for (const season of SEASONS) {
    const base = { category, color };
    const r = engine.recommend({ base, season, mode: 'quick' });
    const tag = `${category}/${color}/${season}`;
    assert.equal(r.classic.length, 3, tag);
    for (const c of r.classic) {
      n++;
      assert.equal(c.score.blocked, false, tag);
      assert.ok(c.outfit.items.some((i) => i.category === category && i.color === color), `${tag} base item`);
      assert.equal(hasAvoidPair(c.outfit), null, `${tag}: ${hasAvoidPair(c.outfit)}`);
      assert.ok(!c.outfit.tags.includes('variation'), `${tag}: 변주 태그 카드가 클래식에`);
      const bad = seasonReasons(c).filter((x) => !fromBase(x, base));
      assert.equal(bad.length, 0, `${tag}: ${engine.caption(c.outfit)} — ${bad.map((x) => x.key).join(',')}`);
      // explain 문구에도 '…에 어색해요'(P3-03·P1-04)가 베이스 탓 외에는 없다
      if (!seasonReasons(c).some((x) => fromBase(x, base))) assert.ok(!c.explain.some((t) => /에 어색해요|용이 아니에요/.test(t)), `${tag}: ${c.explain.join(' / ')}`);
      // 제철 베이스면 3장 전부 클래식(전 쌍 classic 또는 universal)
      if (inSeason(color, season)) assert.ok(c.outfit.universal || c.score.color.detail.allClassic, `${tag}: ${engine.caption(c.outfit)} not classic`);
      for (const it of c.outfit.items) {
        const cap = engine.itemCaption(it);
        assert.ok(!/[a-z]/i.test(cap) && !/\(울\)|\(울슬랙스\)|인디고 데님 울|데님 데님/.test(cap), `${tag}: "${cap}"`);
        assert.ok(!/[a-z]/i.test(catalog.shortName(it)), `${tag}: shortName "${catalog.shortName(it)}"`);
      }
    }
  }
  assert.ok(n >= 400, `checked ${n}`);
});

test('P4 신발 다양성: 클래식 3장은 신발 색 ≥2 또는 신발 종류 ≥2 (풀에 다른 색의 classic 신발이 있을 때)', () => {
  for (const category of ['bottom', 'top', 'outer']) for (const color of engine.baseColors(category)) for (const season of SEASONS) {
    const base = { category, color };
    const r = engine.recommend({ base, season, mode: 'quick' });
    const colors = new Set(r.classic.map((c) => item(c.outfit, 'shoes').color));
    const types = new Set(r.classic.map((c) => item(c.outfit, 'shoes').shoeType));
    if (colors.size >= 2 || types.size >= 2) continue;
    // 불가능한 경우만 허용: 계절에 맞고 전 쌍 classic인 후보 전체의 신발 색이 1종
    const pool = generateCandidates(idx, base, season).filter((o) => o.isClassic && !engine.score(o, season).reasons.some((x) => (x.key === 'explain.seasonOut' || x.key === 'explain.seasonItem') && !fromBase(x, base)));
    const poolColors = new Set(pool.map((o) => item(o, 'shoes').color));
    assert.ok(poolColors.size < 2, `${category}/${color}/${season}: 신발 ${[...colors]} 인데 풀에는 ${[...poolColors]}`);
  }
});

test('P4 겨울: 클래식 3장 중 아우터 1장 이상(하의 규칙이 있는 베이스), 저지 상의 단품 없음', () => {
  for (const category of ['bottom', 'top', 'shoes']) for (const color of engine.baseColors(category)) {
    const r = engine.recommend({ base: { category, color }, season: 'winter', mode: 'quick' });
    const tag = `${category}/${color}/winter`;
    // 역참조로만 만든 하의(lightGrey·chocolate·tan)는 아우터 규칙이 없어 아우터를 못 붙인다 → 하의 규칙이 있는 경우만 검사
    const bottomsHaveRule = r.classic.every((c) => idx.hasBaseRule('bottom', item(c.outfit, 'bottom').color));
    if (!bottomsHaveRule) continue;
    assert.ok(r.classic.some((c) => item(c.outfit, 'outer')), `${tag}: 아우터 없음`);
    for (const c of r.classic) assert.ok(!(item(c.outfit, 'top').material === 'jersey' && !item(c.outfit, 'outer')), `${tag}: ${engine.caption(c.outfit)} 겨울 티 단품`);
  }
});

test('P3-02: 여름 블랙 신발 = 페니 로퍼, 울 슬랙스(차콜·미드그레이·블랙) 여름 클래식에 컬러 스니커즈·러닝화·샌들 없음', () => {
  assert.equal(materialize(idx, 'shoes', 'black', 'summer').shoeType, 'loaferPenny');
  for (const category of CATS) for (const color of engine.baseColors(category)) {
    const r = engine.recommend({ base: { category, color }, season: 'summer', mode: 'quick' });
    for (const c of r.classic) {
      const sh = item(c.outfit, 'shoes');
      if (sh.color === 'black') assert.notEqual(sh.shoeType, 'sneakerColor', `${category}/${color}: ${engine.caption(c.outfit)}`);
      const f = c.score.style.formality;
      assert.ok(!(f.gap >= 5 && ['sneakerColor', 'running', 'sandal'].includes(f.lo?.shoeType)), `${category}/${color}: ${engine.caption(c.outfit)}`);
    }
  }
  for (const color of ['charcoal', 'midGrey', 'black']) {
    const r = engine.recommend({ base: { category: 'bottom', color }, season: 'summer', mode: 'quick' });
    for (const c of r.classic) assert.ok(!['sneakerColor', 'running', 'sandal'].includes(item(c.outfit, 'shoes').shoeType), `${color}: ${engine.caption(c.outfit)}`);
    // gate-3 4항: 폴로가 기본이지만 티셔츠 후보도 deep(변주 태그)에 생성된다
    const d = engine.recommend({ base: { category: 'bottom', color }, season: 'summer', mode: 'deep' });
    const all = [...d.byTone.flatMap((g) => g.candidates), ...d.byHue.flatMap((g) => g.candidates)];
    assert.ok(all.some((c) => item(c.outfit, 'top').itemType === 'tee' && c.outfit.tags.includes('variation')), `${color}: 티셔츠 변주 없음`);
  }
});

test('P3-04/05/08/10 구체화: 브라운 하의 여름=치노·겨울=코듀로이, 인디고 상의=데님 셔츠, 인디고 아우터=데님 재킷(여름 제외), 울 하의 품목명, 겨울 첼시', () => {
  assert.equal(materialize(idx, 'bottom', 'brown', 'summer').material, 'chino');
  assert.equal(materialize(idx, 'bottom', 'brown', 'winter').material, 'corduroy');
  assert.equal(materialize(idx, 'bottom', 'brown', 'springFall').material, 'corduroy');
  const top = materialize(idx, 'top', 'indigo', 'springFall');
  assert.equal(top.itemType, 'denimShirt');
  assert.equal(top.itemName, '인디고 데님 셔츠');
  assert.equal(materialize(idx, 'top', 'greyMelange', 'springFall').itemType, 'sweatshirt');
  assert.equal(materialize(idx, 'outer', 'indigo', 'winter').itemType, 'denimJacket');
  assert.equal(materialize(idx, 'outer', 'indigo', 'springFall').itemType, 'denimJacket');
  assert.equal(materialize(idx, 'outer', 'midGrey', 'winter').itemType, 'chesterfield');
  assert.equal(materialize(idx, 'bottom', 'indigo', 'springFall').itemName, '인디고 데님');
  assert.equal(materialize(idx, 'bottom', 'lightDenim', 'springFall').itemName, '라이트워시 데님');
  const wool = materialize(idx, 'bottom', 'charcoal', 'springFall');
  assert.equal(wool.itemName, '차콜 울 슬랙스');
  assert.equal(engine.itemCaption(wool), '차콜 울 슬랙스');
  assert.equal(engine.labels['material.wool'], '울');
  assert.equal(engine.labels['color.indigo'], '인디고');
  assert.equal(materialize(idx, 'shoes', 'brown', 'winter', { forBottom: 'wool' }).shoeType, 'chelsea');
  assert.equal(materialize(idx, 'shoes', 'brown', 'winter', { forBottom: 'chino' }).shoeType, 'workboot');
});

test('P3-09/14/18/21 + disputed 판정 데이터: T5 차콜 제외, lightBlue 겨울·cream 여름, V-18 규칙 3쌍, corduroy↔wool 3, 점수 변경 5행, 잘린 note 0', () => {
  const t5 = data.toneRules.rules.find((r) => r.id === 'T5');
  assert.deepEqual(t5.limitColors, ['black', 'blackDenim']);
  assert.ok(idx.colors.get('lightBlue').seasons.includes('winter'));
  assert.ok(idx.colors.get('cream').seasons.includes('summer'));
  const pair = (b, cat, color) => idx.colorRules.get(`${b}|bottom`).matches.get(`${cat}|${color}`);
  assert.equal(pair('blackDenim', 'top', 'midGrey')?.score, 4);
  assert.equal(pair('beige', 'outer', 'indigo')?.score, 4);
  assert.equal(pair('indigo', 'top', 'forestGreen')?.score, 3);
  assert.equal(idx.matRules.get('corduroy|wool').score, 3);
  const o10 = engine.score(idx.outfits.get('o10'), 'winter');
  assert.ok(!o10.reasons.some((r) => r.key === 'explain.seasonOut'), 'o10 lightBlue winter');
  assert.equal(pair('blackDenim', 'outer', 'navy').score, 4);
  assert.equal(pair('brown', 'top', 'olive').score, 2);
  assert.equal(pair('khaki', 'top', 'olive').score, 2);
  assert.equal(pair('black', 'top', 'burgundy').score, 3);
  assert.equal(idx.colorRules.get('black|top').matches.get('bottom|black').score, 4);
  assert.equal(idx.colorRules.get('olive|top').matches.get('bottom|brown').score, 2);
  assert.ok(idx.colorRules.get('khaki|bottom').avoid.has('top|olive'), 'P3-06 avoid 구조화');
  for (const rule of data.colorRules) for (const m of rule.matches) assert.ok(!/(은|는|와|과|로|도)\s*$|\s[.;,]/.test(m.note), `${rule.base}|${rule.baseCategory} ${m.category}:${m.color} "${m.note}"`);
});

test('P3-11/16/17 설명: 포인트 컬러 2개 감점, 조사 처리, 규칙 없음은 맨 뒤, 상의 베이스 피할 것', () => {
  const two = engine.score(mk([materialize(idx, 'top', 'burgundy', 'springFall'), materialize(idx, 'bottom', 'indigo', 'springFall'), materialize(idx, 'shoes', 'burgundy', 'springFall')], 'springFall'), 'springFall');
  assert.ok(two.warnings.some((r) => r.key === 'explain.accentAccent'), two.reasons.map((r) => r.key).join(','));
  const s = engine.score(mk([materialize(idx, 'top', 'chocolate', 'summer'), materialize(idx, 'bottom', 'indigo', 'summer'), materialize(idx, 'shoes', 'white', 'summer')], 'summer'), 'summer');
  const txt = engine.explain(s);
  assert.ok(txt.includes('초콜릿은 여름에 어색해요 (−1)'), txt.join(' / '));
  const s2 = engine.score(mk([materialize(idx, 'top', 'navy', 'winter'), materialize(idx, 'bottom', 'lightDenim', 'winter'), materialize(idx, 'shoes', 'white', 'winter')], 'winter'), 'winter');
  const txt2 = engine.explain(s2);
  assert.ok(txt2.includes('라이트워시 데님은 겨울에 어색해요 (−1)'), txt2.join(' / '));
  assert.ok(txt2.includes('라이트워시 데님은 겨울용이 아니에요'), txt2.join(' / '));
  const s3 = engine.score(mk([materialize(idx, 'top', 'burgundy', 'summer'), materialize(idx, 'bottom', 'indigo', 'summer'), materialize(idx, 'shoes', 'white', 'summer')], 'summer'), 'summer');
  assert.ok(engine.explain(s3).includes('버건디는 여름에 어색해요 (−2)'), engine.explain(s3).join(' / '));
  const o03 = idx.outfits.get('o03');
  const rm = engine.explain(engine.score(o03, 'springFall'), o03);
  assert.equal(rm.at(-1), '규칙 없음(기본 3)');
  assert.ok(!engine.explainShort(engine.score(o03, 'springFall'), o03).includes('규칙 없음(기본 3)'));
  const navy = engine.recommend({ base: { category: 'top', color: 'navy' }, season: 'springFall', mode: 'deep' });
  assert.ok(navy.avoid.some((a) => a.target === '하의 네이비'), JSON.stringify(navy.avoid));
  assert.equal(new Set(navy.avoid.map((a) => a.target)).size, navy.avoid.length, '같은 대상 중복 없음');
});

test('P1-06/P3-12/P3-20 deep 그룹: ≤5장, 같은 아우터·신발 종류 상한, 유사색 ≠ 톤별, 변주 품목 재구체화', () => {
  const DEEP = [['bottom', 'indigo'], ['bottom', 'beige'], ['bottom', 'charcoal'], ['bottom', 'blackDenim'], ['top', 'white'], ['top', 'navy'], ['shoes', 'white'], ['outer', 'navy']];
  const count = (list, fn) => { const m = new Map(); for (const c of list) { const k = fn(c); if (k) m.set(k, (m.get(k) ?? 0) + 1); } return Math.max(0, ...m.values()); };
  for (const [category, color] of DEEP) for (const season of SEASONS) {
    const base = { category, color };
    const d = engine.recommend({ base, season, mode: 'deep' });
    const tag = `${category}/${color}/${season}`;
    const toneSets = d.byTone.map((g) => g.candidates.map((c) => c.outfit.id).sort().join(','));
    // 그룹의 전체 풀(상한 없이)과 비교: 풀에 신발·아우터 종류가 3가지 이상 있으면 5장 안에 같은 종류는 3장 이하
    const all = generateCandidates(idx, base, season).map((o) => ({ outfit: o, score: engine.score(o, season) }));
    const pools = new Map([...groupByTone(idx, all, base, Infinity).map((g) => [g.tone, g.candidates]), ...groupByHue(idx, all, base, Infinity).map((g) => [g.relation, g.candidates])]);
    const distinct = (list, fn) => new Set(list.map(fn).filter(Boolean)).size;
    for (const g of [...d.byTone, ...d.byHue]) {
      assert.ok(g.candidates.length <= 5, tag);
      const ids = new Set(g.candidates.map((c) => c.outfit.id));
      assert.equal(ids.size, g.candidates.length, `${tag}: 그룹 내 중복 id`);
      const pool = pools.get(g.tone ?? g.relation) ?? [];
      const shoeFn = (c) => item(c.outfit, 'shoes').shoeType; const outerFn = (c) => item(c.outfit, 'outer')?.itemType;
      if (g.candidates.length === 5 && distinct(pool, shoeFn) >= 3) assert.ok(count(g.candidates, shoeFn) <= 3, `${tag} ${g.tone ?? g.relation}: 신발 종류 중복`);
      if (g.candidates.length === 5 && distinct(pool, outerFn) >= 3) assert.ok(count(g.candidates, outerFn) <= 3, `${tag} ${g.tone ?? g.relation}: 아우터 종류 중복`);
    }
    for (const g of d.byHue) {
      const key = g.candidates.map((c) => c.outfit.id).sort().join(',');
      assert.ok(!toneSets.includes(key), `${tag}: 색상별 ${g.relation} = 톤별 그룹과 동일`);
    }
    for (const v of d.variations) {
      const top = item(v.candidate.outfit, 'top'); const outer = item(v.candidate.outfit, 'outer');
      assert.ok(!(top.color === 'greyMelange' && /Shirt$/.test(top.itemType)), `${tag}: 멜란지 셔츠 ${engine.caption(v.candidate.outfit)}`);
      if (outer) assert.ok(!(outer.itemType === 'leatherJacket' && !['black', 'brown', 'chocolate', 'tan'].includes(outer.color)), `${tag}: ${engine.caption(v.candidate.outfit)}`);
      if (outer && ['indigo', 'lightDenim', 'midDenim'].includes(outer.color) && season !== 'summer') assert.equal(outer.itemType, 'denimJacket', `${tag}: ${engine.caption(v.candidate.outfit)}`);
      assert.equal(v.candidate.score.blocked, false);
    }
  }
});
