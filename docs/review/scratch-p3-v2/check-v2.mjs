// P3 Phase 6-B-3 재검토 기준 — scratch-p3/check.mjs ①~⑤ 그대로 + ⑥ ⑦ 추가. 실행: node docs/review/scratch-p3-v2/check-v2.mjs
// ⑥ 상황: 전 칩(engine.baseColors × 3계절) × 5상황에서 항상 3장이고 relaxed ≤ stage 2 인 비율 ≥ 90% (quick+occasion = S3 칩 경로, deep byOccasion 둘 다 집계)
// ⑦ 소품: Deep 결과(전 칩 × 3계절)에 실리는 카드의 가죽 소품(가죽 벨트·가죽 시계·브리프케이스·가죽 토트) 제안이 신발 가죽 계열을 어기는 건 0 (브라운 계열↔브라운 계열, 블랙↔블랙, 버건디↔다크 브라운·버건디, 흰·네이비 스니커즈에 '화이트' 가죽 소품 금지) — Phase 6-B-3에서 벨트 밖 가죽 소품으로 확장(C6-06)
// ⑥ 보충: 격식·운동은 완화 상한 stage 2에서 3장 미만(shortfall)을 허용한다 — shortfall은 ⑥에서 실패로 센다(상황별 비율을 함께 출력)
import { data } from '../../../src/data/index.js';
import { createEngine } from '../../../src/engine/index.js';
import { createCatalog } from '../../../src/ui/catalog.js';

const engine = createEngine(data);
const catalog = createCatalog(data);
const SEASONS = ['springFall', 'summer', 'winter'];
const CATS = ['bottom', 'top', 'shoes', 'outer'];
const item = (o, cat) => o.items.find((i) => i.category === cat);
const LO_SHOES = ['sneakerColor', 'running', 'sandal'];
const line = (o) => o.items.map((i) => engine.itemCaption(i)).join(' · ');

const cards = [];
for (const category of CATS) for (const color of engine.baseColors(category)) for (const season of SEASONS) {
  const base = { category, color };
  const r = engine.recommend({ base, season, mode: 'quick' });
  cards.push({ base, season, n: r.classic.length, classic: r.classic });
}
const flat = cards.flatMap((c) => c.classic.map((x) => ({ ...c, c: x })));
const bad = { s1: [], s2: [], s3: [], s4: [], s5: [], s6: [], s7: [] };
const tag = (x) => `${x.base.category}/${x.base.color}/${x.season}`;

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

const N = data.outfits.length;
const dist = (data.styles ?? []).map((s) => {
  const tagged = data.outfits.filter((o) => (o.styles ?? []).some((t) => t.id === s.id)).length;
  const dominant = data.outfits.filter((o) => o.styles?.[0]?.id === s.id).length;
  return { id: s.id, phase: s.phase, tagged, dominant, pct: (100 * tagged) / N };
});
for (const d of dist) {
  if (d.pct > 60) bad.s5.push(`${d.id}: ${d.tagged}/${N} = ${d.pct.toFixed(0)}% > 60%`);
  if (d.pct < 3) bad.s5.push(`${d.id}: ${d.tagged}/${N} = ${d.pct.toFixed(0)}% < 3%`);
}
const untagged = data.outfits.filter((o) => !(o.styles ?? []).length).length;
if (untagged) bad.s5.push(`태그 없는 코디 ${untagged}장`);

// ⑥ 상황 — quick+occasion (S3 칩) · deep byOccasion
const OCCS = engine.occasions().map((o) => o.id);
const q = { n: 0, ok: 0, lt3: 0, byStage: [0, 0, 0, 0, 0], byOcc: {} };
const d = { n: 0, ok: 0, lt3: 0, byStage: [0, 0, 0, 0, 0], byOcc: {} };
const deepResults = [];
for (const category of CATS) for (const color of engine.baseColors(category)) for (const season of SEASONS) {
  const base = { category, color };
  for (const occasion of OCCS) {
    const r = engine.recommend({ base, season, mode: 'quick', occasion });
    const stage = r.applied.relaxed.length;
    q.n++; q.byStage[stage]++;
    q.byOcc[occasion] = q.byOcc[occasion] ?? { n: 0, ok: 0, short: 0 }; q.byOcc[occasion].n++;
    if (r.classic.length < 3) q.lt3++;
    if (r.applied.shortfall) { q.short = (q.short ?? 0) + 1; q.byOcc[occasion].short++; if (r.classic.length >= 3 || !r.applied.shortfallText) bad.s6.push(`${category}/${color}/${season}/${occasion}: shortfall 플래그 불일치 (n=${r.classic.length})`); }
    if (r.classic.length >= 3 && stage <= 2) { q.ok++; q.byOcc[occasion].ok++; }
  }
  const dr = engine.recommend({ base, season, mode: 'deep' });
  deepResults.push({ base, season, r: dr });
  for (const occasion of OCCS) {
    const g = dr.byOccasion.find((x) => x.occasion === occasion);
    const stage = g ? g.relaxed.length : 4; const n = g ? g.candidates.length : 0;
    d.n++; d.byStage[stage]++;
    d.byOcc[occasion] = d.byOcc[occasion] ?? { n: 0, ok: 0, short: 0 }; d.byOcc[occasion].n++;
    if (n < 3) d.lt3++;
    if (!g || g.shortfall) { d.short = (d.short ?? 0) + 1; d.byOcc[occasion].short++; }
    if (n >= 3 && stage <= 2) { d.ok++; d.byOcc[occasion].ok++; }
  }
}
const pctQ = (100 * q.ok) / q.n; const pctD = (100 * d.ok) / d.n;
if (pctQ < 90) bad.s6.push(`quick+occasion: 3장·stage≤2 ${q.ok}/${q.n} = ${pctQ.toFixed(1)}% < 90% (3장 미만 ${q.lt3}, stage 분포 ${q.byStage.join('/')}) · 상황별 ` + OCCS.map((o) => `${o} ${Math.round((100 * q.byOcc[o].ok) / q.byOcc[o].n)}%`).join(' '));
if (pctD < 90) bad.s6.push(`deep byOccasion: 3장·stage≤2 ${d.ok}/${d.n} = ${pctD.toFixed(1)}% < 90% (3장 미만 ${d.lt3}, stage 분포 ${d.byStage.join('/')}) · 상황별 ` + OCCS.map((o) => `${o} ${Math.round((100 * d.byOcc[o].ok) / d.byOcc[o].n)}%`).join(' '));

// ⑦ 가죽 소품(벨트·시계·브리프케이스·가죽 토트)↔신발 가죽 계열
const BROWN = ['brown', 'chocolate', 'tan', 'camel'];
const LEATHER_OK = [...BROWN, 'black', 'burgundy'];
const family = (c) => (BROWN.includes(c) ? 'brown' : c === 'black' ? 'black' : c === 'burgundy' ? 'burgundy' : c);
const isLeatherAcc = (a) => a.id === 'beltLeather' || a.id === 'watchLeather' || a.id === 'bagBriefcase' || (a.id === 'bagTote' && a.material === 'leather');
let beltLines = 0; let leatherLines = 0; let shownCards = 0;
for (const { base, season, r } of deepResults) {
  const shown = new Set([...r.classic, ...r.byTone.flatMap((g) => g.candidates), ...r.byHue.flatMap((g) => g.candidates), ...r.byStyle.flatMap((g) => g.candidates), ...r.byOccasion.flatMap((g) => g.candidates), ...r.variations.map((v) => v.candidate)]);
  for (const c of shown) {
    shownCards++;
    const sh = item(c.outfit, 'shoes');
    for (const a of c.accessories ?? []) {
      if (a.severity === 'warn') continue;
      if (a.group === 'belt') beltLines++;
      if (!isLeatherAcc(a) || !a.color) continue;
      leatherLines++;
      const sf = family(sh.color); const bf = family(a.color);
      const ok = LEATHER_OK.includes(a.color) && (sf === bf || (sf === 'burgundy' && ['brown', 'black', 'burgundy'].includes(bf)) || (!['brown', 'black', 'burgundy'].includes(sf) && ['brown', 'black'].includes(bf)));
      if (!ok) bad.s7.push(`${base.category}/${base.color}/${season}: ${line(c.outfit)} → ${a.id} ${a.color} (신발 ${sh.color}/${sh.shoeType}, ${a.ruleId})`);
      if (/T8|−1|포멀도|[a-z]/.test(a.text)) bad.s7.push(`${base.category}/${base.color}/${season}: 내부 문구 "${a.text}"`);
    }
  }
}

const report = (name, list) => { console.log(`${list.length === 0 ? 'PASS' : 'FAIL'} ${name} (${list.length})`); for (const l of list.slice(0, 40)) console.log('   ' + l); if (list.length > 40) console.log(`   … +${list.length - 40}`); };
console.log(`quick cards checked: ${flat.length} (${cards.length} chip×season)`);
report('① SEASON! (베이스 자체 원인 제외) = 0', bad.s1);
report('② gap5 + lo ∈ {sneakerColor, running, sandal} = 0', bad.s2);
report("③ 라벨에 'a-z'·'인디고 데님 울'·'(울슬랙스)' = 0", bad.s3);
report('④ 모든 칩(baseColors × 3계절) 3장', bad.s4);
report('⑤ 스타일 태그 분포: 3% ≤ 스타일별 코디 비율 ≤ 60%, 태그 없는 코디 0', bad.s5);
console.log(`   분포 (outfits ${N}): ` + dist.map((dd) => `${dd.id}${dd.phase === 1 ? '*' : ''} ${dd.tagged}(${dd.pct.toFixed(0)}%)/${dd.dominant}`).join(' · '));
report('⑥ 상황: 전 칩×3계절×5상황에서 3장 + relaxed ≤ stage 2 비율 ≥ 90% (quick 칩 경로 · deep byOccasion)', bad.s6);
console.log(`   quick+occasion ${q.ok}/${q.n} = ${pctQ.toFixed(1)}% (stage0..4 = ${q.byStage.join('/')}) · 상황별 ` + OCCS.map((o) => `${o} ${Math.round((100 * q.byOcc[o].ok) / q.byOcc[o].n)}%`).join(' · '));
console.log(`   deep byOccasion ${d.ok}/${d.n} = ${pctD.toFixed(1)}% (stage0..4 = ${d.byStage.join('/')}) · 상황별 ` + OCCS.map((o) => `${o} ${Math.round((100 * d.byOcc[o].ok) / d.byOcc[o].n)}%`).join(' · '));
report('⑦ 소품: 가죽 소품(벨트·시계·가방) 색이 신발 가죽 계열을 어기거나 흰·네이비인 제안 0, 내부 문구 0', bad.s7);
console.log(`   deep 카드 ${shownCards}, 벨트 제안 ${beltLines}, 가죽 소품 제안 ${leatherLines}`);
console.log(`   ⑥ shortfall(격식·운동 완화 상한 stage 2에서 3장 미만): quick ${q.short ?? 0} · deep ${d.short ?? 0} — 상황별 quick ` + OCCS.map((o) => `${o} ${q.byOcc[o].short}`).join(' · '));
process.exitCode = Object.values(bad).some((l) => l.length) ? 1 : 0;
