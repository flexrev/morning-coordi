// P3 v2 — styleAffinity 수정안 시뮬레이션 (데이터는 건드리지 않고 메모리에서 가중치만 바꿔 52개 코디 태그 재계산)
// 실행: node docs/review/scratch-p3-v2/whatif.mjs > docs/review/scratch-p3-v2/whatif-output.txt
import { data } from '../../../src/data/index.js';
import { createEngine } from '../../../src/engine/index.js';
import { styleLookups, styleTags } from '../../../src/engine/style.js';
import { STYLE_NORM_DIV } from '../../../src/engine/constants.js';

const engine = createEngine(data);
const idx = engine.index;
const IDS = idx.styles.map((s) => s.id);
const FIT_KINDS = ['topFit', 'bottomFit', 'trouserLength', 'topLength', 'outerLength'];
const round2 = (v) => Math.round(v * 100) / 100;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** 수정안: cells = [[kind,id,style,newWeight]], fitWeight = 핏·기장 lookup 가중(기본 1) */
function vectorWith(outfit, { cells = [], fitWeight = 1 } = {}) {
  const patch = new Map(cells.map(([k, i, s, w]) => [`${k}|${i}|${s}`, w]));
  const vec = Object.fromEntries(IDS.map((s) => [s, 0]));
  let wsum = 0;
  for (const [kind, id, w0] of styleLookups(outfit)) {
    const w = FIT_KINDS.includes(kind) ? w0 * fitWeight : w0;
    wsum += w;
    const row = idx.affinity.get(`${kind}|${id}`);
    if (!row) continue;
    for (const s of IDS) vec[s] += (patch.get(`${kind}|${id}|${s}`) ?? row.weights[s] ?? 0) * w;
  }
  const norm = {};
  for (const s of IDS) norm[s] = wsum ? round2(clamp(vec[s] / (STYLE_NORM_DIV * wsum), -1, 1)) : 0;
  return { vec, norm, wsum };
}

// P3 판정: 명백한 오태그(스타일 아는 사람이 반박) · 경계
const MISTAG = { o03: 'ivy', o12: 'ivy', o27: 'ivy', o30: 'ivy', o34: 'amekaji', o49: 'ivy', o50: 'bizcasual' };
const WANT = { o03: ['minimal', 'amekaji', 'workwear', 'cityboy'], o12: ['minimal', 'cityboy'], o27: ['workwear', 'amekaji', 'cityboy', 'minimal'], o30: ['street', 'minimal', 'cityboy'], o34: ['street', 'cityboy'], o49: ['minimal', 'cityboy', 'gorpcore'], o50: ['minimal', 'street'] };
const BORDER = { o02: 'ivy', o07: 'ivy', o14: 'bizcasual', o24: 'ivy', o29: 'minimal', o37: 'bizcasual', o41: 'minimal' };

const PROPOSALS = {
  '현행': {},
  'A: 핏·기장 가중 0.5': { fitWeight: 0.5 },
  'B: 셀 10개 수정': { cells: [
    ['outerType', 'shirtJacket', 'ivy', -1], ['outerType', 'fleece', 'ivy', -2], ['topType', 'hoodie', 'ivy', -2], ['topType', 'sweatshirt', 'ivy', 0],
    ['topLength', 'regular', 'ivy', 1], ['outerLength', 'regular', 'ivy', 1], ['outerType', 'leatherJacket', 'bizcasual', -2], ['topType', 'tee', 'bizcasual', -2],
    ['color', 'navy', 'street', 1], ['topType', 'sweatshirt', 'amekaji', 1],
  ] },
  'A+B': { fitWeight: 0.5, cells: [
    ['outerType', 'shirtJacket', 'ivy', -1], ['outerType', 'fleece', 'ivy', -2], ['topType', 'hoodie', 'ivy', -2], ['topType', 'sweatshirt', 'ivy', 0],
    ['topLength', 'regular', 'ivy', 1], ['outerLength', 'regular', 'ivy', 1], ['outerType', 'leatherJacket', 'bizcasual', -2], ['topType', 'tee', 'bizcasual', -2],
    ['color', 'navy', 'street', 1], ['topType', 'sweatshirt', 'amekaji', 1],
  ] },
};

const cur = Object.fromEntries(data.outfits.map((o) => [o.id, (o.styles ?? []).map((t) => t.id)]));
for (const [name, p] of Object.entries(PROPOSALS)) {
  const tags = {}; const dist = {}; let untagged = 0;
  for (const o of data.outfits) {
    const sv = vectorWith(o, p);
    const t = styleTags({ ...sv, dominant: null }, idx).map((x) => x.id);
    tags[o.id] = t;
    if (!t.length) untagged++;
    for (const s of t) dist[s] = (dist[s] ?? 0) + 1;
  }
  const fixed = Object.entries(MISTAG).filter(([id, bad]) => !tags[id].includes(bad) && tags[id].some((s) => WANT[id].includes(s)));
  const stillBad = Object.entries(MISTAG).filter(([id, bad]) => tags[id].includes(bad));
  const borderFixed = Object.entries(BORDER).filter(([id, bad]) => !tags[id].includes(bad));
  const changed = data.outfits.filter((o) => cur[o.id].join() !== tags[o.id].join()).map((o) => o.id);
  const regress = changed.filter((id) => !(id in MISTAG) && !(id in BORDER));
  console.log(`\n## ${name}`);
  console.log(`  분포: ` + IDS.map((s) => `${s} ${dist[s] ?? 0}(${Math.round(100 * (dist[s] ?? 0) / 52)}%)`).join(' · ') + ` · 태그 없음 ${untagged}`);
  console.log(`  오태그 7건 중 해결 ${fixed.length} [${fixed.map(([id]) => id).join(',')}], 잔존 ${stillBad.length} [${stillBad.map(([id]) => id).join(',')}] · 경계 7건 중 변경 ${borderFixed.length} [${borderFixed.map(([id]) => id).join(',')}]`);
  console.log(`  태그가 바뀐 코디 ${changed.length}: ${changed.map((id) => `${id} ${cur[id].join('/')}→${tags[id].join('/')}`).join(' · ')}`);
  console.log(`  오태그·경계 밖에서 바뀐 코디(회귀 점검) ${regress.length}: ${regress.map((id) => `${id} ${cur[id].join('/')}→${tags[id].join('/')}`).join(' · ')}`);
}
// 생성 후보에 대한 효과: shoes/white 여름 bizcasual 그룹 (티셔츠+치노+스니커즈가 bizcasual ≥0.4 였음)
console.log('\n## 생성 카드 예: 화이트 티셔츠 · 네이비 치노 · 흰 스니커즈 (여름)');
const o = { items: [engine.materialize('top', 'white', 'summer'), engine.materialize('bottom', 'navy', 'summer'), engine.materialize('shoes', 'white', 'summer')] };
for (const [name, p] of Object.entries(PROPOSALS)) { const sv = vectorWith(o, p); console.log(`  ${name}: ` + IDS.map((s) => `${s} ${sv.norm[s]}`).join(' · ')); }
console.log('\n## 생성 카드 예: 화이트 옥스포드 셔츠 · 차콜 울 슬랙스 · 블랙 더비 (봄가을)');
const o2 = { items: [engine.materialize('top', 'white', 'springFall'), engine.materialize('bottom', 'charcoal', 'springFall'), engine.materialize('shoes', 'black', 'springFall')] };
for (const [name, p] of Object.entries(PROPOSALS)) { const sv = vectorWith(o2, p); console.log(`  ${name}: ` + IDS.map((s) => `${s} ${sv.norm[s]}`).join(' · ')); }
