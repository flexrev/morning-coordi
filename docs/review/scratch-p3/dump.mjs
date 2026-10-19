// P3 콘텐츠 검토용 덤프 — 실제 엔진 + 실데이터. 실행: node docs/review/scratch-p3/dump.mjs > docs/review/scratch-p3/dump-output.txt
import { data } from '../../../src/data/index.js';
import { createEngine } from '../../../src/engine/index.js';
import { formalityLevel } from '../../../src/engine/lookup.js';

const engine = createEngine(data);
const idx = engine.index;
const L = idx.labelMap;
const SEASONS = ['springFall', 'summer', 'winter'];
const SL = { springFall: '봄가을', summer: '여름', winter: '겨울' };

const BASES = [
  ...['indigo', 'lightDenim', 'blackDenim', 'beige', 'khaki', 'navy', 'midGrey', 'charcoal', 'olive', 'brown', 'black', 'white', 'cream'].map((c) => ({ category: 'bottom', color: c })),
  ...['white', 'black', 'greyMelange', 'navy', 'oatmeal', 'cream', 'lightBlue', 'olive', 'burgundy'].map((c) => ({ category: 'top', color: c })),
  ...['white', 'black', 'brown', 'tan'].map((c) => ({ category: 'shoes', color: c })),
  ...['navy', 'camel', 'black', 'olive'].map((c) => ({ category: 'outer', color: c })),
];

const item = (o, cat) => o.items.find((i) => i.category === cat);
const lvl = (it) => { const l = formalityLevel(idx, it); return l === null ? '-' : l; };
const itemStr = (it) => it ? `${engine.itemCaption(it)}[${lvl(it)}]` : '—';
const line = (o) => [item(o, 'top'), item(o, 'bottom'), item(o, 'shoes'), item(o, 'outer')].map(itemStr).join(' · ');
const warnStr = (c) => c.score.warnings.map((w) => engine.explain({ ...c.score, reasons: [w] }, null)[0]).join(' | ');
const flags = (c) => {
  const o = c.outfit; const s = c.score;
  const f = [];
  if (o.universal) f.push('U');
  if (o.isClassic) f.push('C');
  if (!o.generated) f.push(o.id);
  if (s.style.formality.gap >= 4) f.push(`gap${s.style.formality.gap}`);
  if (s.reasons.some((r) => r.key === 'explain.disputed')) f.push('DISPUTED');
  if (s.reasons.some((r) => r.key === 'explain.seasonItem' || r.key === 'explain.seasonOut')) f.push('SEASON!');
  if (s.reasons.some((r) => r.key === 'explain.ruleMissing')) f.push('rule?');
  const sh = item(o, 'shoes'); const bt = item(o, 'bottom'); const tp = item(o, 'top');
  if (tp && bt && tp.color === bt.color) f.push('SAMECOLOR');
  return f.join(',');
};

const gapRows = [];
const allCards = [];

console.log('==================== 1. QUICK (classic 3) ====================');
for (const base of BASES) {
  for (const season of SEASONS) {
    const r = engine.recommend({ base, season, mode: 'quick' });
    console.log(`\n--- ${base.category}/${base.color} (${L[`color.${base.color}`]}) · ${SL[season]} ---`);
    r.classic.forEach((c, i) => {
      console.log(`  ${i + 1}. ${line(c.outfit)}  => ${c.score.final} [${flags(c)}]`);
      const w = warnStr(c); if (w) console.log(`       warn: ${w}`);
      const cr = c.explain.slice(0, 3).join(' / '); console.log(`       why: ${cr}`);
      allCards.push({ base, season, i, c });
      if (c.score.style.formality.gap >= 4) gapRows.push({ mode: 'quick', base, season, c });
    });
  }
}

console.log('\n\n==================== 2. DEEP (6 bases × 봄가을) ====================');
const DEEP = [
  { category: 'bottom', color: 'indigo' }, { category: 'bottom', color: 'beige' }, { category: 'bottom', color: 'charcoal' },
  { category: 'bottom', color: 'blackDenim' }, { category: 'top', color: 'white' }, { category: 'top', color: 'navy' },
];
for (const base of DEEP) {
  const r = engine.recommend({ base, season: 'springFall', mode: 'deep' });
  console.log(`\n##### DEEP ${base.category}/${base.color} (${L[`color.${base.color}`]}) · 봄가을 · candidates=${r.stats.candidates} ms=${r.stats.ms}`);
  console.log('  [톤별]');
  for (const g of r.byTone) {
    console.log(`   ▸ ${L[g.labelKey] ?? g.tone} (${g.tone})`);
    g.candidates.forEach((c) => { console.log(`      - ${line(c.outfit)} => ${c.score.final} [${flags(c)}]`); if (c.score.style.formality.gap >= 4) gapRows.push({ mode: 'deep/tone', base, season: 'springFall', c }); });
  }
  console.log('  [색상별]');
  for (const g of r.byHue) {
    console.log(`   ▸ ${L[g.labelKey] ?? g.relation} (${g.relation})`);
    g.candidates.forEach((c) => { console.log(`      - ${line(c.outfit)} => ${c.score.final} [${flags(c)}]`); if (c.score.style.formality.gap >= 4) gapRows.push({ mode: 'deep/hue', base, season: 'springFall', c }); });
  }
  console.log('  [변주]');
  for (const v of r.variations) {
    const c = v.candidate;
    console.log(`      - ${v.fromOutfitId} ${v.swapped.category}: ${engine.itemCaption(v.swapped.from)} → ${engine.itemCaption(v.swapped.to)} | ${line(c.outfit)} => ${c.score.final} [${flags(c)}]`);
    if (c.score.style.formality.gap >= 4) gapRows.push({ mode: 'deep/var', base, season: 'springFall', c });
  }
  console.log('  [피할 것]');
  for (const a of r.avoid) console.log(`      - ${a.target ?? '(일반)'} — ${a.reason} (${a.ruleId ?? ''})`);
}

console.log('\n\n==================== 3. 포멀도 격차 ≥4 (경고) 전수 ====================');
const seenGap = new Set();
for (const g of gapRows) {
  const f = g.c.score.style.formality;
  const k = `${line(g.c.outfit)}|${g.season}`;
  if (seenGap.has(k)) continue; seenGap.add(k);
  console.log(`  gap${f.gap} ${g.mode.padEnd(9)} ${g.base.category}/${g.base.color}/${SL[g.season]}: ${line(g.c.outfit)} => ${g.c.score.final} ${f.blocked ? 'BLOCKED' : ''}`);
}

console.log('\n\n==================== 4. disputed 플래그 행 (전 데이터) ====================');
let n = 0;
for (const rule of data.colorRules) for (const m of rule.matches) if (m.flags?.includes('disputed')) {
  n++;
  console.log(`  [${n}] colorRules ${rule.base}|${rule.baseCategory}${rule.variant ? '/' + rule.variant : ''} → ${m.category}:${m.color} score ${m.score} ${m.tag} ruleId=${m.ruleId ?? '-'} src=${m.sources.join(',')} note="${m.note}"`);
}
for (const r of data.shoeRules) for (const b of r.bottoms) if (b.flags?.includes('disputed')) { n++; console.log(`  [${n}] shoeRules ${r.shoe} × ${b.material}/${b.fit}/${b.length} score ${b.score} note="${b.note ?? ''}"`); }
for (const key of ['materials', 'fitRules', 'lengthRules', 'shoes', 'adjust', 'formality', 'matRules', 'outfits']) {
  for (const row of data[key]) {
    if (row.flags?.includes('disputed')) { n++; console.log(`  [${n}] ${key} ${JSON.stringify(row).slice(0, 220)}`); }
    if (key === 'matRules') for (const p of row.pairsWith) if (p.flags?.includes('disputed')) { n++; console.log(`  [${n}] matRules ${row.material}↔${p.material} ${p.score} ${p.note ?? ''}`); }
  }
}
console.log(`  total disputed rows: ${n}`);

console.log('\n\n==================== 5. 잘린 note (colorRules) ====================');
const trunc = /(…|\.\.\.|[은는이가을를에와과로도의]|,|\+|→|\()\s*$/;
for (const rule of data.colorRules) {
  for (const m of rule.matches) if (m.note && trunc.test(m.note)) console.log(`  ${rule.base}|${rule.baseCategory}${rule.variant ? '/' + rule.variant : ''} → ${m.category}:${m.color} (${m.score} ${m.tag}) note="${m.note}"`);
  for (const a of rule.avoid) if (a.reason && trunc.test(a.reason)) console.log(`  AVOID ${rule.base}|${rule.baseCategory} → ${a.category}:${a.color} reason="${a.reason}"`);
}
console.log('  -- notes containing "⚠" remnants or dangling "이견" --');
for (const rule of data.colorRules) for (const m of rule.matches) if (m.note && /이견\s*$|이견:\s*$|주의\s*$|⚠/.test(m.note)) console.log(`  ${rule.base}|${rule.baseCategory} → ${m.category}:${m.color} note="${m.note}"`);

console.log('\n\n==================== 6. labels 샘플 ====================');
for (const l of data.labels) {
  if (l.shortLabel && (l.shortLabel.length > 6 || /\s/.test(l.shortLabel))) console.log(`  LONG/SPACE shortLabel: ${l.id} "${l.shortLabel}"`);
}
const ns = (p) => data.labels.filter((l) => l.id.startsWith(p));
for (const p of ['color.', 'material.', 'shoe.', 'topType.', 'outerType.', 'category.', 'fit.', 'length.', 'tone.', 'season.', 'tag.']) {
  console.log(`  -- ${p}`);
  for (const l of ns(p)) console.log(`     ${l.id.padEnd(26)} label="${l.label}" short="${l.shortLabel ?? ''}" ${l.synonyms ? 'syn=' + JSON.stringify(l.synonyms) : ''} ${l.help ? 'help=' + l.help : ''}`);
}
console.log('  -- explain.* / ui.*');
for (const l of data.labels.filter((x) => x.id.startsWith('explain.') || x.id.startsWith('ui.'))) console.log(`     ${l.id.padEnd(26)} "${l.label}"`);

console.log('\n\n==================== 7. 보조 데이터 ====================');
console.log('  formality ladder:');
for (const f of data.formality) console.log(`     ${f.category}|${f.id}${f.when ? JSON.stringify(f.when) : ''} = ${f.level} ${f.formalityNote ?? f.note ?? ''}`);
console.log('  topTypes:');
for (const t of data.enums.topTypes) console.log(`     ${t.id} material=${t.material} formality=${t.formality ?? ''} seasons=${JSON.stringify(t.seasons ?? '')}`);
console.log('  outerTypes:');
for (const t of data.enums.outerTypes) console.log(`     ${t.id} material=${t.material} length=${t.length} formality=${t.formality ?? ''} seasons=${JSON.stringify(t.seasons ?? '')}`);
console.log('  materials seasons:');
for (const m of data.materials) console.log(`     ${m.id} seasons=${JSON.stringify(m.seasons)} weight=${m.weight} formality=${m.formality}`);
console.log('  shoes seasons:');
for (const s of data.shoes) console.log(`     ${s.id} seasons=${JSON.stringify(s.seasons)} formality=${s.formality ?? ''}`);
console.log('  colors tones/seasons:');
for (const c of data.colors) console.log(`     ${c.id.padEnd(12)} ${L[`color.${c.id}`]} tones=${JSON.stringify(c.tones)} seasons=${JSON.stringify(c.seasons)}`);
console.log('  toneRules:');
for (const r of data.toneRules.rules) console.log(`     ${r.id} ${r.from}↔${r.to} ${r.modifier} ${r.limitColors ? JSON.stringify(r.limitColors) : ''} ${r.note ?? ''}`);
console.log('  hue:', JSON.stringify(data.toneRules.hue));
console.log('  adjust:');
for (const a of data.adjust) console.log(`     ${a.id} delta=${a.delta} when=${JSON.stringify(a.when)} ${a.flags ? JSON.stringify(a.flags) : ''} ${a.reason}`);
console.log('  colorRules avoid:');
for (const rule of data.colorRules) for (const a of rule.avoid) console.log(`     ${rule.base}|${rule.baseCategory} → ${a.category}:${a.color} "${a.reason}" ${a.ruleId ?? ''}`);
console.log('  outfits (all 52):');
for (const o of data.outfits) console.log(`     ${o.id} ${o.universal ? 'U' : ' '} ${o.isClassic ? 'C' : ' '} ${o.seasons.join('/')}: ${line(o)} tags=${o.tags.join(',')} src=${o.sources.join(',')} flags=${(o.flags ?? []).join(',')} ${o.note ? 'note=' + o.note : ''}`);

console.log('\n\n==================== 8. 요약 ====================');
console.log(`  quick cards dumped: ${allCards.length} (${BASES.length} bases × 3 seasons)`);
const dup = new Map();
for (const { base, season, c } of allCards) { const k = `${base.category}/${base.color}/${season}`; const sig = line(c.outfit); dup.set(k, (dup.get(k) ?? []).concat(sig)); }
for (const [k, v] of dup) if (new Set(v).size !== v.length) console.log(`  DUP in ${k}`);
const seasonBad = allCards.filter(({ c }) => c.score.reasons.some((r) => r.key === 'explain.seasonItem' || r.key === 'explain.seasonOut'));
console.log(`  quick cards with season warnings: ${seasonBad.length}`);
for (const { base, season, c } of seasonBad) console.log(`     ${base.category}/${base.color}/${SL[season]}: ${line(c.outfit)}`);
const disputedCards = allCards.filter(({ c }) => c.score.reasons.some((r) => r.key === 'explain.disputed'));
console.log(`  quick cards with disputed pair: ${disputedCards.length}`);
for (const { base, season, c } of disputedCards) console.log(`     ${base.category}/${base.color}/${SL[season]}: ${line(c.outfit)}`);
const sameColor = allCards.filter(({ c }) => item(c.outfit, 'top').color === item(c.outfit, 'bottom').color);
console.log(`  quick cards top==bottom color: ${sameColor.length}`);
