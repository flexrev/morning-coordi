// P3 재검토 기준 4항 자동 확인 (content-check.md 10절 끝) — 실행: node docs/review/scratch-p3/check.mjs
// ① quick 카드에서 SEASON! 이 베이스 자체 때문이 아닌 카드 0
// ② gap5 카드의 lo 가 sneakerColor·running·sandal 0
// ③ 라벨(캡션)에 'a-z'·"인디고 데님 울"·"(울슬랙스)" 0
// ④ 모든 S2 칩(engine.baseColors × 3계절)이 3장 반환
// 대상 = 엔진이 UI에 칩으로 내주는 색 전부(engine.baseColors) × 3계절 (content-check 1절의 270장 + 보조 84장을 포함)
import { data } from '../../../src/data/index.js';
import { createEngine } from '../../../src/engine/index.js';
import { createCatalog } from '../../../src/ui/catalog.js';

const engine = createEngine(data);
const catalog = createCatalog(data);
const SEASONS = ['springFall', 'summer', 'winter'];
const CATS = ['bottom', 'top', 'shoes', 'outer'];
const item = (o, cat) => o.items.find((i) => i.category === cat);
const LO_SHOES = ['sneakerColor', 'running', 'sandal'];

const cards = [];
for (const category of CATS) for (const color of engine.baseColors(category)) for (const season of SEASONS) {
  const base = { category, color };
  const r = engine.recommend({ base, season, mode: 'quick' });
  cards.push({ base, season, n: r.classic.length, classic: r.classic });
}
const flat = cards.flatMap((c) => c.classic.map((x) => ({ ...c, c: x })));
const bad = { s1: [], s2: [], s3: [], s4: [] };
const tag = (x) => `${x.base.category}/${x.base.color}/${x.season}`;
const line = (o) => o.items.map((i) => engine.itemCaption(i)).join(' · ');

for (const x of flat) {
  const { base, c } = x;
  const fromBase = (r) => (r.key === 'explain.seasonOut' ? r.params.category === base.category && r.params.color === base.color : r.params.category === base.category);
  const seasonR = c.score.reasons.filter((r) => (r.key === 'explain.seasonOut' || r.key === 'explain.seasonItem') && !fromBase(r));
  if (seasonR.length) bad.s1.push(`${tag(x)}: ${line(c.outfit)} — ${seasonR.map((r) => engine.explain({ ...c.score, reasons: [r] }, c.outfit)[0]).join(' | ')}`);
  const f = c.score.style.formality;
  if (f.gap >= 5 && LO_SHOES.includes(f.lo?.shoeType)) bad.s2.push(`${tag(x)}: ${line(c.outfit)} (gap${f.gap})`);
  for (const it of c.outfit.items) {
    const texts = [engine.itemCaption(it), catalog.shortName(it), it.itemName];
    for (const t of texts) if (/[a-z]/i.test(t) || /인디고 데님 울/.test(t) || /\(울슬랙스\)/.test(t) || /\(울\)/.test(t) || /데님 데님/.test(t)) bad.s3.push(`${tag(x)}: "${t}"`);
  }
  for (const t of c.explain) if (/[a-z]/i.test(t) && !/^[^a-z]*\d+\/5/.test(t)) bad.s3.push(`${tag(x)} explain: "${t}"`);
}
for (const x of cards) if (x.n !== 3) bad.s4.push(`${tag(x)}: ${x.n}장`);

const extra = [];
for (const x of cards) {
  if (x.base.category === 'shoes') continue;
  const colors = new Set(x.classic.map((c) => item(c.outfit, 'shoes').color));
  const types = new Set(x.classic.map((c) => item(c.outfit, 'shoes').shoeType));
  if (colors.size < 2 && types.size < 2) extra.push(`신발 단조 ${tag(x)}: ${x.classic.map((c) => line(c.outfit)).join(' / ')}`);
}
for (const x of cards) {
  if (x.season !== 'winter' || x.base.category === 'outer') continue;
  if (!x.classic.some((c) => item(c.outfit, 'outer'))) extra.push(`겨울 아우터 없음 ${tag(x)}`);
}
for (const x of cards) {
  const uncl = x.classic.filter((c) => !c.outfit.universal && !c.score.color.detail.allClassic);
  if (uncl.length) extra.push(`non-classic in quick ${tag(x)}: ${uncl.map((c) => line(c.outfit)).join(' / ')}`);
}

const report = (name, list) => { console.log(`${list.length === 0 ? 'PASS' : 'FAIL'} ${name} (${list.length})`); for (const l of list) console.log('   ' + l); };
console.log(`quick cards checked: ${flat.length} (${cards.length} chip×season)`);
report('① SEASON! (베이스 자체 원인 제외) = 0', bad.s1);
report('② gap5 + lo ∈ {sneakerColor, running, sandal} = 0', bad.s2);
report("③ 라벨에 'a-z'·'인디고 데님 울'·'(울슬랙스)' = 0", bad.s3);
report('④ 모든 칩(baseColors × 3계절) 3장', bad.s4);
console.log(`\n-- 참고(기준 외) ${extra.length}건`);
for (const l of extra) console.log('   ' + l);
process.exitCode = Object.values(bad).some((l) => l.length) ? 1 : 0;
