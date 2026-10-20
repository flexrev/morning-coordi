// P3 Phase 6-B-3 콘텐츠 확장 검토 덤프 — 실제 엔진 + 실데이터. 실행: node docs/review/scratch-p3-v2/dump.mjs  (docs/review/scratch-p3-v2/*.txt 생성)
import { writeFileSync } from 'node:fs';
import { data } from '../../../src/data/index.js';
import { createEngine } from '../../../src/engine/index.js';
import { formalityLevel } from '../../../src/engine/lookup.js';
import { styleVector } from '../../../src/engine/style.js';

const engine = createEngine(data);
const idx = engine.index;
const L = idx.labelMap;
const OUT = 'docs/review/scratch-p3-v2/';
const SEASONS = ['springFall', 'summer', 'winter'];
const SL = { springFall: '봄가을', summer: '여름', winter: '겨울' };
const STYLES1 = ['minimal', 'bizcasual', 'ivy', 'amekaji'];
const ALL_STYLES = idx.styles.map((s) => s.id);
const OCCS = [...idx.occasions.keys()];
const BASES = [
  { category: 'bottom', color: 'indigo' }, { category: 'bottom', color: 'beige' }, { category: 'bottom', color: 'charcoal' }, { category: 'bottom', color: 'blackDenim' },
  { category: 'bottom', color: 'olive' }, { category: 'top', color: 'white' }, { category: 'top', color: 'navy' }, { category: 'shoes', color: 'white' },
];
const EXTRA_BASES = [{ category: 'bottom', color: 'black' }, { category: 'bottom', color: 'navy' }, { category: 'outer', color: 'camel' }, { category: 'shoes', color: 'brown' }, { category: 'top', color: 'lightBlue' }, { category: 'bottom', color: 'khaki' }];

const item = (o, cat) => o.items.find((i) => i.category === cat);
const lvl = (it) => { const l = formalityLevel(idx, it); return l === null ? '-' : l; };
const itemStr = (it) => (it ? `${engine.itemCaption(it)}[${lvl(it)}]` : '—');
const line = (o) => ['top', 'mid', 'bottom', 'shoes', 'outer'].map((c) => item(o, c)).filter(Boolean).map(itemStr).join(' · ');
const bkey = (b) => `${b.category}/${b.color}`;
const norms = (c, ids = ALL_STYLES) => ids.map((s) => `${s.slice(0, 4)}${(c.styleVec?.norm?.[s] ?? 0).toFixed(2)}`).join(' ');
const avgF = (o) => { const ls = o.items.map((it) => formalityLevel(idx, it)).filter((l) => l !== null); return ls.length ? (ls.reduce((a, b) => a + b, 0) / ls.length).toFixed(2) : '-'; };
const idOf = (c) => c.outfit.id;

// ================================================================ 1. 52 outfits 스타일 태그
{
  const out = ['# 1. outfits.json 52행 — 캡션 · styles[] · occasions[] · 8스타일 norm'];
  const cnt = {};
  for (const o of data.outfits) {
    const c = { styleVec: null };
    const sv = styleVector(idx, o);
    c.styleVec = sv;
    const tags = (o.styles ?? []).map((t) => `${t.id}(${t.score})`).join(',');
    for (const t of o.styles ?? []) cnt[t.id] = (cnt[t.id] ?? 0) + 1;
    out.push(`${o.id} [${o.seasons.map((s) => SL[s]).join('·')}] avgF${avgF(o)} | ${line(o)} | styles=${tags} | occ=${(o.occasions ?? []).join(',') || '-'} | ${norms(c)} | note=${o.note ?? ''}`);
  }
  out.push('', '태그 수: ' + Object.entries(cnt).map(([k, v]) => `${k} ${v}`).join(' · '));
  writeFileSync(OUT + '1-tags.txt', out.join('\n'));
}

// ================================================================ 2. byStyle — 8 bases × 3 seasons
const deepCache = new Map();
const deep = (base, season, opts = {}) => {
  const k = `${bkey(base)}|${season}|${JSON.stringify(opts)}`;
  if (!deepCache.has(k)) deepCache.set(k, engine.recommend({ base, season, mode: 'deep', ...opts }));
  return deepCache.get(k);
};
{
  const out = ['# 2. byStyle (Deep, 옵션 없음) — 8 bases × 3 seasons × 1차 4스타일. 카드: id | caption | norm(그룹 스타일) | 전체 norm'];
  const overlapTotals = {}; let groupsN = 0; let repN = 0; let cardsN = 0; let lowN = 0;
  for (const base of BASES) for (const season of SEASONS) {
    const r = deep(base, season);
    out.push('', `## ${bkey(base)} ${SL[season]} — groups: ${r.byStyle.map((g) => `${g.style}(${g.candidates.length})`).join(' · ')}`);
    const sets = {};
    for (const g of r.byStyle) {
      groupsN++;
      sets[g.style] = new Set(g.candidates.map(idOf));
      out.push(`  [${g.style}]`);
      for (const c of g.candidates) {
        cardsN++;
        const n = c.styleVec?.norm?.[g.style] ?? 0;
        const dom = c.styleVec?.dominant;
        const rep = c.tags.style.includes(g.style);
        if (rep) repN++;
        if (n < 0.5) lowN++;
        out.push(`    ${idOf(c)} ${line(c.outfit)} | norm=${n.toFixed(2)} dom=${dom} tags=${c.tags.style.join(',')}${rep ? '' : ' **NOT-TAGGED**'} | final ${c.score.final} | ${norms(c, STYLES1)}`);
      }
    }
    const keys = Object.keys(sets);
    const ov = [];
    for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
      const a = sets[keys[i]]; const b = sets[keys[j]];
      const n = [...a].filter((x) => b.has(x)).length;
      const pk = `${keys[i]}∩${keys[j]}`;
      overlapTotals[pk] = (overlapTotals[pk] ?? 0) + n;
      ov.push(`${pk}=${n}${n >= 4 ? '!!' : ''}`);
    }
    out.push(`  overlap: ${ov.join(' · ')}`);
  }
  out.push('', `## 합계: 그룹 ${groupsN}, 카드 ${cardsN}, 그룹 스타일이 카드 태그에 포함 ${repN} (${(100 * repN / cardsN).toFixed(0)}%), norm<0.5 카드 ${lowN}`);
  out.push('overlap 합계(24 base×season): ' + Object.entries(overlapTotals).map(([k, v]) => `${k}=${v}`).join(' · '));
  writeFileSync(OUT + '2-bystyle.txt', out.join('\n'));
}

// ================================================================ 3. byOccasion — 8 bases × 3 seasons × 5 occasions (+ quick+occasion applied.relaxed)
{
  const out = ['# 3. byOccasion (Deep) — 8 bases × 3 seasons. 각 상황 3장 + relaxed 단계. 뒤에 quick+occasion applied.relaxed 전수'];
  const SNEAK = ['sneakerWhite', 'sneakerColor', 'running', 'sandal'];
  const LOAF = ['loaferPenny', 'loaferTassel', 'derby', 'oxford', 'chelsea', 'chukka'];
  const viol = []; const relaxedCases = []; const dateEqWork = [];
  const stageCount = [0, 0, 0, 0, 0]; let groupsN = 0;
  for (const base of BASES) for (const season of SEASONS) {
    const r = deep(base, season);
    out.push('', `## ${bkey(base)} ${SL[season]}`);
    const byOcc = Object.fromEntries(r.byOccasion.map((g) => [g.occasion, g]));
    for (const g of r.byOccasion) {
      groupsN++;
      const stage = g.relaxed.length; stageCount[stage]++;
      out.push(`  [${g.occasion}] relaxed=${g.relaxed.join('>') || 'none'} (stage ${stage})${g.candidates.length < 3 ? ' **<3**' : ''}`);
      if (stage >= 2) relaxedCases.push(`${bkey(base)} ${SL[season]} ${g.occasion} stage${stage}(${g.relaxed.join('>')}) → ${g.candidates.map((c) => line(c.outfit)).join(' / ')}`);
      for (const c of g.candidates) {
        const o = c.outfit; const sh = item(o, 'shoes'); const top = item(o, 'top'); const outer = item(o, 'outer');
        const probs = [];
        if (g.occasion === 'formal' && (SNEAK.includes(sh.shoeType) || ['hoodie', 'sweatshirt', 'tee', 'henley'].includes(top.itemType) || ['denimIndigo', 'denimWashed'].includes(item(o, 'bottom').material))) probs.push('FORMAL-CASUAL');
        if (g.occasion === 'formal' && sh.shoeType === 'workboot') probs.push('FORMAL-WORKBOOT');
        if (g.occasion === 'active' && (LOAF.includes(sh.shoeType) || ['blazer', 'trench', 'chesterfield', 'balmacaan', 'peacoat'].includes(outer?.itemType) || ['wool', 'flannel'].includes(item(o, 'bottom').material) || ['oxfordShirt', 'dressShirt', 'knitCashmere', 'poloWool'].includes(top.itemType))) probs.push('ACTIVE-DRESSY');
        if (g.occasion === 'work' && (['hoodie', 'sweatshirt'].includes(top.itemType) || ['sneakerColor', 'running', 'sandal'].includes(sh.shoeType))) probs.push('WORK-CASUAL');
        if (g.occasion === 'date' && (['hoodie', 'sweatshirt'].includes(top.itemType) || ['running', 'sandal'].includes(sh.shoeType))) probs.push('DATE-CASUAL');
        const oa = c.rank; void oa;
        out.push(`    ${idOf(c)} ${line(o)} | avgF ${avgF(o)} tags=${c.tags.occasion.join(',') || '-'} final ${c.score.final}${probs.length ? ' **' + probs.join(',') + '**' : ''}`);
        if (probs.length) viol.push(`${bkey(base)} ${SL[season]} ${g.occasion} stage${stage}: ${line(o)} — ${probs.join(',')}`);
      }
    }
    if (byOcc.date && byOcc.work) {
      const a = byOcc.date.candidates.map(idOf).sort().join(','); const b = byOcc.work.candidates.map(idOf).sort().join(',');
      const common = byOcc.date.candidates.map(idOf).filter((x) => byOcc.work.candidates.map(idOf).includes(x)).length;
      out.push(`  date∩work = ${common}/3${a === b ? ' **IDENTICAL**' : ''}`);
      if (common >= 2) dateEqWork.push(`${bkey(base)} ${SL[season]} date∩work=${common}${a === b ? ' IDENTICAL' : ''}`);
    }
  }
  out.push('', `## Deep byOccasion stage 분포 (그룹 ${groupsN}): ` + stageCount.map((n, i) => `stage${i}=${n}`).join(' · '));
  out.push('', '## 격식 위반 (사람이 보면 이상한 카드)'); out.push(...viol.map((v) => '  ' + v));
  out.push('', '## relaxed ≥ stage 2 사례'); out.push(...relaxedCases.map((v) => '  ' + v));
  out.push('', '## date≈work'); out.push(...dateEqWork.map((v) => '  ' + v));

  // quick + occasion 전수: engine.baseColors × 3 seasons × 5 occasions
  out.push('', '# 3b. Quick + occasion — 전 칩(baseColors × 3계절 × 5상황) applied.relaxed');
  const qStage = [0, 0, 0, 0, 0]; const qWorst = []; let qN = 0; let qLt3 = 0;
  for (const category of ['bottom', 'top', 'shoes', 'outer']) for (const color of engine.baseColors(category)) for (const season of SEASONS) for (const occasion of OCCS) {
    const r = engine.recommend({ base: { category, color }, season, mode: 'quick', occasion });
    qN++;
    const stage = r.applied.relaxed.length; qStage[stage]++;
    if (r.classic.length < 3) qLt3++;
    if (stage >= 3) qWorst.push(`${category}/${color} ${SL[season]} ${occasion} stage${stage}(${r.applied.relaxed.join('>')}) n=${r.classic.length} → ${r.classic.map((c) => line(c.outfit)).join(' / ')}`);
  }
  out.push(`quick 호출 ${qN}: ` + qStage.map((n, i) => `stage${i}=${n}`).join(' · ') + ` · 3장 미만 ${qLt3}`);
  out.push('## quick stage ≥3 사례'); out.push(...qWorst.map((v) => '  ' + v));
  writeFileSync(OUT + '3-byoccasion.txt', out.join('\n'));
}

// ================================================================ 4. 액세서리 — 30 deep results
{
  const out = ['# 4. 액세서리 — 30 Deep 결과(8 bases×3 seasons + 6 extra × springFall). 카드: caption | avgF | 소품 줄 [group:id color note]'];
  const BROWN = ['brown', 'chocolate', 'tan', 'camel'];
  const DRESS = ['loaferPenny', 'loaferTassel', 'derby', 'oxford', 'chelsea', 'chukka', 'workboot'];
  const viol = []; const stats = {}; let cards = 0; let linesN = 0;
  const results = [...BASES.flatMap((b) => SEASONS.map((s) => [b, s])), ...EXTRA_BASES.map((b) => [b, 'springFall'])];
  const seenCard = new Set();
  for (const [base, season] of results) {
    const r = deep(base, season);
    out.push('', `## ${bkey(base)} ${SL[season]}`);
    const shown = [...r.classic, ...r.byTone.flatMap((g) => g.candidates), ...r.byStyle.flatMap((g) => g.candidates), ...r.byOccasion.flatMap((g) => g.candidates)];
    for (const c of shown) {
      const key = `${bkey(base)}|${season}|${idOf(c)}`;
      if (seenCard.has(key)) continue; seenCard.add(key);
      if (!c.accessories) { out.push(`  ${idOf(c)} ${line(c.outfit)} | (no accessories)`); continue; }
      cards++;
      const o = c.outfit; const sh = item(o, 'shoes'); const top = item(o, 'top'); const outer = item(o, 'outer'); const f = Number(avgF(o));
      const acc = c.accessories;
      linesN += acc.length;
      const accStr = acc.map((a) => `${a.group}:${a.id}${a.color ? '/' + a.color : ''}${a.severity === 'warn' ? '(warn)' : ''}`).join(' · ');
      const probs = [];
      for (const a of acc) {
        stats[a.id] = (stats[a.id] ?? 0) + 1;
        const t = idx.accessoryTypes.get(a.id);
        if (a.group === 'belt') {
          if (a.id === 'beltLeather' && sh.material === 'leather' && DRESS.includes(sh.shoeType)) {
            if (BROWN.includes(sh.color) && a.color && !BROWN.includes(a.color)) probs.push(`BELT-FAMILY(${a.color} vs ${sh.color})`);
            if (sh.color === 'black' && a.color && a.color !== 'black') probs.push(`BELT-FAMILY(${a.color} vs black)`);
            if (!a.color) probs.push(`BELT-NOCOLOR(shoes ${sh.color})`);
          }
          if (['tee', 'sweatshirt', 'hoodie', 'tank'].includes(top.itemType)) probs.push('BELT-HIDDEN-TEE');
          if (t && (f < t.formality.min || f > t.formality.max)) probs.push(`BELT-TYPE-FORMALITY(${a.id} ${t.formality.min}-${t.formality.max} vs ${f})`);
        }
        if (a.group === 'socks') {
          if (a.id === 'socksNoShow' && season === 'winter') probs.push('NOSHOW-WINTER');
          if (a.id === 'socksWhite' && DRESS.includes(sh.shoeType)) probs.push('WHITE-SOCKS-DRESS');
          if (a.id === 'socksMatch' && season === 'summer' && ['loaferPenny', 'loaferTassel'].includes(sh.shoeType)) probs.push('SUMMER-LOAFER-SOCKS(match)');
          if (a.id === 'socksNeutral' && season === 'summer' && ['loaferPenny', 'loaferTassel'].includes(sh.shoeType)) probs.push('SUMMER-LOAFER-SOCKS(neutral)');
          if (a.id === 'socksPattern' && (f > 7)) probs.push('PATTERN-SOCKS-FORMAL');
          if (sh.shoeType === 'sandal') probs.push('SOCKS-SANDAL');
        }
        if (a.group === 'watch') {
          if (a.id === 'watchNato' && f >= 6) probs.push(`NATO-FORMAL(${f})`);
          if (a.id === 'watchLeather' && sh.material === 'leather' && DRESS.includes(sh.shoeType) && a.color && ((BROWN.includes(sh.color) && !BROWN.includes(a.color)) || (sh.color === 'black' && a.color !== 'black'))) probs.push(`WATCH-FAMILY(${a.color} vs ${sh.color})`);
        }
        if (a.group === 'bag') {
          if (a.id === 'bagBackpack' && (['blazer', 'chesterfield', 'trench', 'balmacaan', 'peacoat'].includes(outer?.itemType) || f >= 6)) probs.push(`BACKPACK-DRESSY(${outer?.itemType ?? '-'} f${f})`);
          if (a.id === 'bagBriefcase' && (f < 6 || ['tee', 'hoodie', 'sweatshirt'].includes(top.itemType))) probs.push(`BRIEFCASE-CASUAL(f${f})`);
          if (t && (f < t.formality.min || f > t.formality.max)) probs.push(`BAG-TYPE-FORMALITY(${a.id} ${t.formality.min}-${t.formality.max} vs ${f})`);
        }
        if (a.group === 'hat') {
          if (a.id === 'beanie' && season === 'summer') probs.push('BEANIE-SUMMER');
          if (a.id === 'bucketHat' && season === 'winter') probs.push('BUCKET-WINTER');
          if (['blazer', 'chesterfield', 'trench', 'balmacaan'].includes(outer?.itemType) || f >= 6) probs.push(`HAT-DRESSY(${a.id} with ${outer?.itemType ?? '-'} f${f})`);
          if (t && (f < t.formality.min || f > t.formality.max)) probs.push(`HAT-TYPE-FORMALITY(${a.id} ${t.formality.min}-${t.formality.max} vs ${f})`);
        }
        if (a.group === 'scarf') {
          if (season === 'summer') probs.push('SCARF-SUMMER');
          if (!outer) probs.push('SCARF-NO-OUTER');
        }
        if (t && !t.seasons.includes(season)) probs.push(`TYPE-SEASON(${a.id} ${season})`);
      }
      out.push(`  ${idOf(c)} ${line(o)} | avgF ${f} | ${accStr}${probs.length ? ' **' + probs.join(',') + '**' : ''}`);
      if (probs.length) viol.push(`${bkey(base)} ${SL[season]} ${idOf(c)}: ${line(o)} | ${accStr} — ${probs.join(', ')}`);
      // 텍스트 샘플
      if (cards <= 3) for (const a of acc) out.push(`      text: ${a.text}`);
    }
  }
  out.push('', `## 합계: 카드 ${cards}, 소품 줄 ${linesN} (${(linesN / cards).toFixed(2)}/카드). 소품별: ` + Object.entries(stats).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · '));
  const vk = {}; for (const v of viol) for (const m of v.split(' — ')[1].split(', ')) { const k = m.split('(')[0]; vk[k] = (vk[k] ?? 0) + 1; }
  out.push(`## 위반 카드 ${viol.length}: ` + Object.entries(vk).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · '));
  out.push(...viol.map((v) => '  ' + v));
  writeFileSync(OUT + '4-accessories.txt', out.join('\n'));
}

// ================================================================ 5. 패턴 (patterns: true)
{
  const out = ['# 5. Deep + patterns:true — 패턴 변주 카드 전수 (8 bases × 3 seasons + extra). 검사: 패턴 ≤1(quick) ≤2(deep), 브레통 하의 0, 패턴+패턴'];
  const viol = []; let n = 0; const byPattern = {};
  const results = [...BASES.flatMap((b) => SEASONS.map((s) => [b, s])), ...EXTRA_BASES.map((b) => [b, 'springFall'])];
  for (const [base, season] of results) {
    const r = deep(base, season, { patterns: true });
    const pv = r.variations.filter((v) => v.candidate.outfit.tags?.includes('pattern'));
    out.push('', `## ${bkey(base)} ${SL[season]} — 패턴 변주 ${pv.length} / 변주 ${r.variations.length}`);
    for (const v of pv) {
      n++;
      const o = v.candidate.outfit;
      const pats = o.items.filter((it) => it.pattern).map((it) => `${it.category}:${it.pattern}`);
      for (const p of pats) byPattern[p] = (byPattern[p] ?? 0) + 1;
      const probs = [];
      if (pats.length > 1) probs.push('TWO-PATTERNS');
      if (o.items.some((it) => it.pattern === 'breton' && it.category !== 'top')) probs.push('BRETON-NOT-TOP');
      const top = item(o, 'top'); const p = idx.patterns.get(top.pattern);
      if (p && !p.seasons.includes(season)) probs.push('PATTERN-SEASON');
      if (p && !p.itemTypes.includes(top.itemType)) probs.push('PATTERN-ITEMTYPE');
      const f = Number(avgF(o));
      if (p && Math.abs(f - p.formality) > 3) probs.push(`PATTERN-FORMALITY(${p.id} ${p.formality} vs ${f})`);
      const pr = v.candidate.score.reasons.filter((x) => x.key === 'explain.pattern').map((x) => `${x.params.id}(${x.delta})`).join(',');
      out.push(`  ${idOf(v.candidate)} ← ${v.fromOutfitId} | ${line(o)} | top.itemName="${top.itemName}" | avgF ${f} | rules=${pr} | final ${v.candidate.score.final}${probs.length ? ' **' + probs.join(',') + '**' : ''}`);
      if (probs.length) viol.push(`${bkey(base)} ${SL[season]}: ${line(o)} — ${probs.join(',')}`);
    }
    // 모든 보이는 카드(byTone/byStyle/byOccasion/classic) 중 패턴 2개 이상
    const shown = [...r.classic, ...r.byTone.flatMap((g) => g.candidates), ...r.byStyle.flatMap((g) => g.candidates), ...r.byOccasion.flatMap((g) => g.candidates), ...r.variations.map((v) => v.candidate)];
    for (const c of shown) {
      const k = c.outfit.items.filter((it) => it.pattern).length;
      if (k >= 2) viol.push(`${bkey(base)} ${SL[season]}: 패턴 ${k}개 ${line(c.outfit)}`);
    }
  }
  // quick with patterns:true → 패턴 카드 0?
  let qPat = 0;
  for (const base of BASES) for (const season of SEASONS) {
    const r = engine.recommend({ base, season, mode: 'quick', patterns: true });
    qPat += r.classic.filter((c) => c.outfit.items.some((it) => it.pattern && it.pattern !== 'breton')).length;
  }
  // outfits.json 패턴 아이템
  const dataPat = data.outfits.filter((o) => o.items.some((it) => it.pattern)).map((o) => `${o.id} ${o.items.filter((it) => it.pattern).map((it) => it.category + ':' + it.pattern).join(',')}`);
  out.push('', `## 합계: 패턴 변주 ${n}. 패턴별: ` + Object.entries(byPattern).map(([k, v]) => `${k} ${v}`).join(' · '));
  out.push(`quick(patterns:true) 비브레통 패턴 카드: ${qPat}`);
  out.push(`outfits.json 패턴 코디: ${dataPat.join(' · ')}`);
  out.push(`## 위반 ${viol.length}`); out.push(...viol.map((v) => '  ' + v));
  writeFileSync(OUT + '5-patterns.txt', out.join('\n'));
}

// ================================================================ 6. 미드 레이어 (layering: true)
{
  const out = ['# 6. Deep + layering:true — mid 카드 (8 bases × 3 seasons). 검사: 여름 0, quick 0, 포멀도 경고, mid 기장/무게'];
  const viol = []; let n = 0; const byMid = {}; const bySeason = {}; let quickMid = 0;
  for (const base of BASES) for (const season of SEASONS) {
    const q = engine.recommend({ base, season, mode: 'quick', layering: true });
    quickMid += q.classic.filter((c) => item(c.outfit, 'mid')).length;
    const r = deep(base, season, { layering: true });
    const shown = [...r.classic, ...r.byTone.flatMap((g) => g.candidates), ...r.byHue.flatMap((g) => g.candidates), ...r.byStyle.flatMap((g) => g.candidates), ...r.byOccasion.flatMap((g) => g.candidates), ...r.variations.map((v) => v.candidate)];
    const seen = new Set(); const mids = [];
    for (const c of shown) { if (item(c.outfit, 'mid') && !seen.has(idOf(c))) { seen.add(idOf(c)); mids.push(c); } }
    const total = r.stats.candidates;
    out.push('', `## ${bkey(base)} ${SL[season]} — 후보 ${total}, 화면에 실린 mid 카드 ${mids.length} (classic ${r.classic.filter((c) => item(c.outfit, 'mid')).length})`);
    bySeason[season] = (bySeason[season] ?? 0) + mids.length;
    for (const c of mids) {
      n++;
      const o = c.outfit; const mid = item(o, 'mid'); const top = item(o, 'top'); const outer = item(o, 'outer');
      byMid[mid.itemType] = (byMid[mid.itemType] ?? 0) + 1;
      const probs = [];
      if (season === 'summer') probs.push('MID-SUMMER');
      const mt = idx.midTypes.get(mid.itemType);
      if (mt && !mt.seasons.includes(season)) probs.push('MIDTYPE-SEASON');
      const warn = c.score.reasons.filter((x) => /^explain\.mid/.test(x.key)).map((x) => `${x.key.replace('explain.', '')}${x.severity === 'warn' || x.severity === 'block' ? '!' : ''}`).join(',');
      if (c.score.reasons.some((x) => x.key === 'explain.midFormality')) probs.push('MID-FORMALITY-WARN');
      if (c.score.reasons.some((x) => x.key === 'explain.midWeight')) probs.push('MID-WEIGHT');
      if (c.score.reasons.some((x) => x.key === 'explain.midLength')) probs.push('MID-LENGTH');
      const fm = lvl(mid); const ft = lvl(top); const fo = outer ? lvl(outer) : '-';
      if (mid.itemType === 'knitOverShirt' && !['oxfordShirt', 'dressShirt'].includes(top.itemType)) probs.push('KNITOVERSHIRT-NO-SHIRT');
      if (mid.itemType === 'cardigan' && outer?.itemType === 'cardigan') probs.push('CARDIGAN-ON-CARDIGAN');
      if (mid.color === top.color || mid.color === outer?.color) probs.push('MID-SAME-COLOR');
      const groupsIn = ['byStyle', 'byOccasion', 'byTone', 'byHue'].filter((k) => r[k].some((g) => g.candidates.includes(c)));
      out.push(`  ${idOf(c)} ${line(o)} | F top${ft} mid${fm} outer${fo} | layer ${c.score.style.layer?.score ?? '-'} rule=${warn || '-'} | final ${c.score.final} C=${o.isClassic ? 1 : 0} | in ${groupsIn.join(',') || 'variations/classic'}${probs.length ? ' **' + probs.join(',') + '**' : ''}`);
      if (probs.length) viol.push(`${bkey(base)} ${SL[season]}: ${line(o)} — ${probs.join(',')}`);
    }
  }
  out.push('', `## 합계: mid 카드 ${n}, quick mid ${quickMid}. 계절별: ` + Object.entries(bySeason).map(([k, v]) => `${SL[k]} ${v}`).join(' · ') + '. 종류별: ' + Object.entries(byMid).map(([k, v]) => `${k} ${v}`).join(' · '));
  out.push(`## 위반/경고 ${viol.length}`); out.push(...viol.map((v) => '  ' + v));
  writeFileSync(OUT + '6-layering.txt', out.join('\n'));
}

// ================================================================ 7. 라벨
{
  const out = ['# 7. 신규 라벨 — shortLabel 길이(공백·중점 포함 ≤6?), label, help'];
  const rows = data.labels.filter((l) => /^(style|occasion|accessory|accessoryGroup|pattern|midType)\./.test(l.id));
  for (const l of rows) {
    const s = l.shortLabel ?? '';
    const len = [...s].length;
    out.push(`${l.id} | label="${l.label}" | short="${s}"(${len})${len > 6 ? ' **>6**' : ''} | help="${l.help}" | aliases=${(l.aliases ?? []).join(',')}`);
  }
  out.push('', '## explain.* 신규');
  for (const l of data.labels.filter((x) => /^explain\.(style|occasion|acc|pattern|mid|twoOuter)/.test(x.id))) out.push(`${l.id} | "${l.label}"`);
  // 실제 렌더 샘플
  out.push('', '## 실제 문구 샘플 (styleExplain · accessories.text)');
  const samples = [
    [{ category: 'bottom', color: 'beige' }, 'springFall', { style: 'ivy', occasion: 'work' }],
    [{ category: 'bottom', color: 'indigo' }, 'winter', { style: 'amekaji', occasion: 'weekend' }],
    [{ category: 'bottom', color: 'charcoal' }, 'summer', { occasion: 'formal' }],
    [{ category: 'top', color: 'white' }, 'summer', { occasion: 'active' }],
  ];
  for (const [base, season, opts] of samples) {
    const r = engine.recommend({ base, season, mode: 'deep', ...opts });
    out.push(`-- ${bkey(base)} ${SL[season]} ${JSON.stringify(opts)} relaxed=${r.applied.relaxed.join('>') || 'none'}`);
    for (const c of r.classic) {
      out.push(`   ${line(c.outfit)} | tagLabels=${c.tagLabels.join('/')}`);
      for (const s of c.styleExplain) out.push(`      style: ${s}`);
      for (const a of c.accessories ?? []) out.push(`      acc: ${a.text}`);
      for (const s of c.explain) if (/패턴|미드|레이어/.test(s)) out.push(`      explain: ${s}`);
    }
  }
  // mid/pattern 설명 샘플
  const r1 = deep({ category: 'bottom', color: 'beige' }, 'springFall', { layering: true, patterns: true });
  const midC = [...r1.byTone.flatMap((g) => g.candidates), ...r1.variations.map((v) => v.candidate)].filter((c) => item(c.outfit, 'mid')).slice(0, 3);
  for (const c of midC) { out.push(`   mid: ${line(c.outfit)}`); for (const s of c.explain) out.push(`      explain: ${s}`); }
  const patC = r1.variations.filter((v) => v.candidate.outfit.tags?.includes('pattern')).slice(0, 3);
  for (const v of patC) { out.push(`   pattern: ${line(v.candidate.outfit)}`); for (const s of v.candidate.explain) out.push(`      explain: ${s}`); }
  // 전 스타일·상황 라벨(UI 칩)
  out.push('', '## engine.styles()/occasions()');
  out.push(JSON.stringify(engine.styles({ all: true })));
  out.push(JSON.stringify(engine.occasions()));
  writeFileSync(OUT + '7-labels.txt', out.join('\n'));
}

// ================================================================ 9. Gate-4 이월 항목
{
  const out = ['# 9. Gate-4 이월 — 확장 데이터로 해결 가능한가'];
  // (a) 블랙 슬랙스 quick 3장 신발 전부 블랙?
  for (const season of SEASONS) {
    const r = engine.recommend({ base: { category: 'bottom', color: 'black' }, season, mode: 'quick' });
    out.push(`black slacks ${SL[season]} quick: ` + r.classic.map((c) => line(c.outfit)).join(' / '));
    for (const st of STYLES1) { const rs = engine.recommend({ base: { category: 'bottom', color: 'black' }, season, mode: 'quick', style: st }); out.push(`   style=${st}: ` + rs.classic.map((c) => itemStr(item(c.outfit, 'shoes'))).join(' / ')); }
    for (const oc of OCCS) { const ro = engine.recommend({ base: { category: 'bottom', color: 'black' }, season, mode: 'quick', occasion: oc }); out.push(`   occasion=${oc} relaxed=${ro.applied.relaxed.join('>') || '-'}: ` + ro.classic.map((c) => itemStr(item(c.outfit, 'shoes'))).join(' / ')); }
    const d = deep({ category: 'bottom', color: 'black' }, season);
    const shoeSet = new Set([...d.byTone, ...d.byStyle, ...d.byOccasion].flatMap((g) => g.candidates).map((c) => `${item(c.outfit, 'shoes').color}/${item(c.outfit, 'shoes').shoeType}`));
    out.push(`   deep 신발 종류: ${[...shoeSet].join(', ')}`);
  }
  // (b) lightGrey·chocolate·tan 하의 겨울 아우터
  out.push('');
  for (const color of ['lightGrey', 'chocolate', 'tan', 'brown']) {
    const has = engine.baseColors('bottom').includes(color);
    out.push(`bottom/${color} 칩 노출=${has}`);
    if (!has) continue;
    const r = engine.recommend({ base: { category: 'bottom', color }, season: 'winter', mode: 'quick' });
    out.push('   winter quick: ' + r.classic.map((c) => line(c.outfit)).join(' / '));
    const d = deep({ category: 'bottom', color }, 'winter', { layering: true });
    const withOuter = [...d.byTone, ...d.byStyle, ...d.byOccasion].flatMap((g) => g.candidates).filter((c) => item(c.outfit, 'outer')).length;
    const withMid = [...d.byTone, ...d.byStyle, ...d.byOccasion].flatMap((g) => g.candidates).filter((c) => item(c.outfit, 'mid')).length;
    out.push(`   winter deep(+layering): 아우터 있는 카드 ${withOuter}, mid 카드 ${withMid}`);
  }
  // (c) 겨울 데님 재킷 (아우터 인디고)
  out.push('');
  const r = engine.recommend({ base: { category: 'outer', color: 'indigo' }, season: 'winter', mode: 'quick' });
  out.push('outer/indigo winter quick: ' + r.classic.map((c) => `${line(c.outfit)} (${c.tags.style.join(',')})`).join(' / '));
  const d = deep({ category: 'outer', color: 'indigo' }, 'winter', { layering: true });
  const two = [...d.byTone, ...d.byStyle].flatMap((g) => g.candidates).filter((c) => c.outfit.items.filter((i) => i.category === 'outer').length >= 2);
  out.push(`   deep(+layering) 2겹 아우터 카드 ${two.length}: ` + two.slice(0, 5).map((c) => line(c.outfit)).join(' / '));
  const mids = [...d.byTone, ...d.byStyle].flatMap((g) => g.candidates).filter((c) => item(c.outfit, 'mid'));
  out.push(`   mid 카드 ${mids.length}: ` + mids.slice(0, 5).map((c) => line(c.outfit)).join(' / '));
  // (d) 울 슬랙스 + 멜란지 티 격차 5
  const q = engine.recommend({ base: { category: 'bottom', color: 'charcoal' }, season: 'summer', mode: 'quick' });
  out.push('', 'charcoal summer quick: ' + q.classic.map((c) => `${line(c.outfit)} gap${c.score.style.formality.gap}`).join(' / '));
  for (const oc of ['work', 'formal', 'date']) { const ro = engine.recommend({ base: { category: 'bottom', color: 'charcoal' }, season: 'summer', mode: 'quick', occasion: oc }); out.push(`   occasion=${oc}: ` + ro.classic.map((c) => `${line(c.outfit)} gap${c.score.style.formality.gap}`).join(' / ')); }
  writeFileSync(OUT + '9-carryover.txt', out.join('\n'));
}
console.log('done');
