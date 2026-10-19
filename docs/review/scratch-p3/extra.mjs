// P3 보조 확인 — 고아 색 베이스 동작, 출처 미기재 classic≥4, note 잔여 기호, disputed 파일별 수, o50 items
import { data } from '../../../src/data/index.js';
import { createEngine } from '../../../src/engine/index.js';
const engine = createEngine(data);
const line = (o) => o.items.map((i) => engine.itemCaption(i)).join(' · ');

console.log('== orphan color bases (quick, springFall)');
for (const b of [{ category: 'bottom', color: 'teal' }, { category: 'bottom', color: 'taupe' }, { category: 'bottom', color: 'midDenim' }, { category: 'top', color: 'teal' }, { category: 'top', color: 'mustard' }, { category: 'top', color: 'tan' }, { category: 'top', color: 'camel' }, { category: 'shoes', color: 'navy' }, { category: 'shoes', color: 'burgundy' }, { category: 'outer', color: 'brown' }, { category: 'outer', color: 'midGrey' }, { category: 'outer', color: 'indigo' }]) {
  for (const season of ['springFall', 'summer', 'winter']) {
    try {
      const r = engine.recommend({ base: b, season, mode: 'quick' });
      console.log(`  ${b.category}/${b.color}/${season}: ${r.classic.length} cards: ` + r.classic.map((c) => `${line(c.outfit)}=>${c.score.final}`).join(' || '));
    } catch (e) { console.log(`  ${b.category}/${b.color}/${season}: ERROR ${e.message}`); }
  }
}

console.log('\n== nosource (sources == [R1]) classic score>=4');
for (const rule of data.colorRules) for (const m of rule.matches) if (m.sources.length === 1 && m.sources[0] === 'R1' && m.tag === 'classic' && m.score >= 4) console.log(`  ${rule.base}|${rule.baseCategory}${rule.variant ? '/' + rule.variant : ''} → ${m.category}:${m.color} ${m.score} note="${m.note}"`);

console.log('\n== notes with stripping artifacts (" .", " ;", "  ", leading punctuation, ends with particle)');
const art = /( \.| ;| ,|  |^[\s—\-·,.;]|[은는이가을를에와과로도의]$|·$)/;
for (const rule of data.colorRules) for (const m of rule.matches) if (m.note && art.test(m.note)) console.log(`  ${rule.base}|${rule.baseCategory}${rule.variant ? '/' + rule.variant : ''} → ${m.category}:${m.color} (${m.score} ${m.tag}) note="${m.note}"`);

console.log('\n== disputed count per file');
import fs from 'node:fs';
for (const f of fs.readdirSync('src/data')) { const t = fs.readFileSync('src/data/' + f, 'utf8'); const n = (t.match(/"disputed"/g) ?? []).length; if (n) console.log(`  ${f}: ${n}`); }

console.log('\n== o50 / o42 / o29 items');
for (const id of ['o50', 'o42', 'o29', 'o14']) console.log(`  ${id}: ${JSON.stringify(data.outfits.find((o) => o.id === id).items.map((i) => [i.category, i.color, i.itemType ?? i.material ?? i.shoeType, i.itemName, i.layer ?? '']))}`);

console.log('\n== khaki/beige in hue groups');
console.log(JSON.stringify(data.toneRules.hue.analogous));

console.log('\n== cream/oatmeal/lightBlue/camel seasons');
for (const c of ['cream', 'oatmeal', 'lightBlue', 'camel', 'chocolate', 'burgundy', 'tan', 'greyMelange']) console.log(`  ${c}: ${JSON.stringify(data.colors.find((x) => x.id === c).seasons)}`);

console.log('\n== tee + wool slacks summer: what if top tee');
const idx = engine.index;
import { materialize, scoreOutfit } from '../../../src/engine/index.js';
const mk = (top, bottom, shoes, season) => ({ id: 't', items: [top, bottom, shoes], seasons: [season], tags: [], isClassic: true, universal: false, sources: [], flags: [] });
for (const [sh, st] of [['white', 'sneakerWhite'], ['black', 'loaferPenny'], ['black', 'sneakerColor'], ['brown', 'loaferPenny']]) {
  const o = mk(materialize(idx, 'top', 'white', 'summer', { itemType: 'tee' }), materialize(idx, 'bottom', 'charcoal', 'summer'), materialize(idx, 'shoes', sh, 'summer', { shoeType: st }), 'summer');
  const s = scoreOutfit(idx, o, 'summer');
  console.log(`  white tee + charcoal wool + ${sh} ${st}: final ${s.final} gap ${s.style.formality.gap} blocked ${s.blocked} warnings: ${s.warnings.map((w) => w.key).join(',')}`);
  const o2 = mk(materialize(idx, 'top', 'white', 'summer', { itemType: 'poloPique' }), materialize(idx, 'bottom', 'charcoal', 'summer'), materialize(idx, 'shoes', sh, 'summer', { shoeType: st }), 'summer');
  const s2 = scoreOutfit(idx, o2, 'summer');
  console.log(`  white polo + charcoal wool + ${sh} ${st}: final ${s2.final} gap ${s2.style.formality.gap}`);
}

console.log('\n== T5 charcoal effect: charcoal + chocolate derby / camel coat');
for (const [shoe, outer] of [['chocolate', null], ['black', 'camel'], ['chocolate', 'camel']]) {
  const items = [materialize(idx, 'top', 'white', 'winter', { itemType: 'knitWool' }), materialize(idx, 'bottom', 'charcoal', 'winter'), materialize(idx, 'shoes', shoe, 'winter', { shoeType: 'derby' })];
  if (outer) items.push(materialize(idx, 'outer', outer, 'winter'));
  const s = scoreOutfit(idx, { id: 't', items, seasons: ['winter'], tags: [], isClassic: true, universal: false, sources: [], flags: [] }, 'winter');
  console.log(`  white knit + charcoal + ${shoe} derby + ${outer ?? '-'}: final ${s.final} color ${s.color.score} toneMod ${s.color.detail.toneMod}`);
}

console.log('\n== burgundy top + burgundy shoes accent check');
{
  const items = [materialize(idx, 'top', 'burgundy', 'springFall'), materialize(idx, 'bottom', 'indigo', 'springFall'), materialize(idx, 'shoes', 'burgundy', 'springFall')];
  const s = scoreOutfit(idx, { id: 't', items, seasons: ['springFall'], tags: [], isClassic: false, universal: false, sources: [], flags: [] }, 'springFall');
  console.log(`  final ${s.final} reasons: ${s.reasons.map((r) => r.key).join(',')}`);
}
