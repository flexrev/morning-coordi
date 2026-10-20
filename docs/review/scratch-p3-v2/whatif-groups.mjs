// P3 v2 — byStyle 그룹 구성 대안 시뮬레이션 (엔진 수정 없이 결과 후보를 다시 묶는다)
//  현행: norm ≥ 0.4 → final + 0.5×norm 순 fillDiverse(5)
//  대안 G1: 카드 styleTags(top-2)에 그 스타일이 있는 후보만 → norm 우선(final 보조) fillDiverse(5), 5장 미만 허용
//  대안 G2: norm ≥ 0.5 → final + 2.0×norm 순 fillDiverse(5)
// 실행: node docs/review/scratch-p3-v2/whatif-groups.mjs > docs/review/scratch-p3-v2/whatif-groups-output.txt
import { data } from '../../../src/data/index.js';
import { createEngine } from '../../../src/engine/index.js';
import { fillDiverse } from '../../../src/engine/groups.js';

const engine = createEngine(data);
const SEASONS = ['springFall', 'summer', 'winter'];
const STYLES1 = ['minimal', 'bizcasual', 'ivy', 'amekaji'];
const BASES = [
  { category: 'bottom', color: 'indigo' }, { category: 'bottom', color: 'beige' }, { category: 'bottom', color: 'charcoal' }, { category: 'bottom', color: 'blackDenim' },
  { category: 'bottom', color: 'olive' }, { category: 'top', color: 'white' }, { category: 'top', color: 'navy' }, { category: 'shoes', color: 'white' },
];
const line = (o) => o.items.map((i) => engine.itemCaption(i)).join(' · ');
const ALT = {
  '현행(norm≥0.4, final+0.5norm)': (cands, s) => fillDiverse(cands.filter((c) => (c.styleVec?.norm?.[s] ?? 0) >= 0.4), 5, new Set(), (c) => c.score.final + 0.5 * c.styleVec.norm[s]),
  'G1(태그 포함, norm 우선)': (cands, s) => fillDiverse(cands.filter((c) => c.tags.style.includes(s)), 5, new Set(), (c) => c.styleVec.norm[s] * 10 + c.score.final),
  'G2(norm≥0.5, final+2.0norm)': (cands, s) => fillDiverse(cands.filter((c) => (c.styleVec?.norm?.[s] ?? 0) >= 0.5), 5, new Set(), (c) => c.score.final + 2.0 * c.styleVec.norm[s]),
};
for (const [name, build] of Object.entries(ALT)) {
  let groups = 0; let cardsN = 0; let tagged = 0; let lt5 = 0; let empty = 0; let identical = 0; const ov = {};
  const samples = [];
  for (const base of BASES) for (const season of SEASONS) {
    const r = engine.recommend({ base, season, mode: 'deep' });
    const all = [...new Set([...r.byTone, ...r.byHue, ...r.byStyle, ...r.byOccasion].flatMap((g) => g.candidates))]; // 화면 후보 풀(300장 전체는 못 받으므로 그룹에 실린 후보 합집합)
    const sets = {};
    for (const s of STYLES1) {
      const g = build(all, s);
      if (!g.length) { empty++; continue; }
      groups++; cardsN += g.length; tagged += g.filter((c) => c.tags.style.includes(s)).length; if (g.length < 5) lt5++;
      sets[s] = new Set(g.map((c) => c.outfit.id));
      if (base.color === 'charcoal' && season === 'springFall') samples.push(`  [${s}] ` + g.map((c) => `${line(c.outfit)}(${c.styleVec.norm[s]})`).join(' / '));
      if (base.color === 'beige' && season === 'springFall' && s === 'amekaji') samples.push(`  [beige amekaji] ` + g.map((c) => `${line(c.outfit)}(${c.styleVec.norm[s]})`).join(' / '));
    }
    const ks = Object.keys(sets);
    for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) {
      const n = [...sets[ks[i]]].filter((x) => sets[ks[j]].has(x)).length; const k = `${ks[i]}∩${ks[j]}`; ov[k] = (ov[k] ?? 0) + n;
      if (n >= 5) identical++;
    }
  }
  console.log(`\n## ${name}`);
  console.log(`  그룹 ${groups} (빈 그룹 ${empty}, 5장 미만 ${lt5}), 카드 ${cardsN}, 그룹 스타일 ∈ 카드 태그 ${tagged} (${Math.round((100 * tagged) / cardsN)}%), 동일 그룹 쌍 ${identical}`);
  console.log('  overlap 합계: ' + Object.entries(ov).map(([k, v]) => `${k}=${v}`).join(' · '));
  console.log('  charcoal 봄가을 / beige 봄가을 amekaji 샘플:'); for (const s of samples) console.log(s);
}
