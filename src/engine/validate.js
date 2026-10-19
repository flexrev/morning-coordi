// 데이터 정합성 검사 — docs/architecture/data-schema.md 8절 V-01 ~ V-22. 구현: C2.
// 변경점(데이터 변환 로그 참조): V-08 shoes 임계치(bottom 베이스 ≥1), V-05 variant에 "oxfordShirt" 허용, V-09 sources ≥2는 warn.
import { ADJUST_WHEN_KEYS, RESERVE_COLORS } from './constants.js';

const ID_RE = /^[a-z][a-zA-Z0-9]*$/;
const HEX_RE = /^#[0-9A-F]{6}$/;
const R1_CODES = ['WH1', 'WH2', 'AtG1', 'AtG2', 'AtG3', 'AtG4', 'FB1', 'FB2', 'FB3', 'FB4', 'FB-stripes', 'GG', 'PS1', 'PS2', 'PS3', 'PS-snippet', 'RMRS1', 'RMRS2', 'RMRS3', 'RMRS 색상환', 'MF', 'MM', 'TMM-tan', 'Dapp', 'Fitville', 'MRP', 'MRP-stripes', 'Esq', 'Vou1', 'Vou2', 'Celio', 'Berle', 'HB', 'Acorn', 'Aza', 'Studio', 'Hack', 'PM', 'StyleGF', 'MSR', 'HSS', 'Dalm', 'VK1', 'VK2', 'VK3', 'WK1', 'WK2', 'GQK', 'Allure', 'Khaki-guides', 'Navy-guides', 'Olive-guides', 'Brown-guides', 'Blue-guides', 'Burgundy-guides', 'HEX'];
const R2_CODES = ['MOM', 'BGU', 'RMRSFIT', 'RMRSWIDE1', 'MRPWIDE', 'DIEWW', 'SQM', 'VKFIT', 'ESQK1', 'ESQK2', 'COSK', 'SUIT', 'PSBREAK', 'EGENT', 'SARTORO', 'TIES', 'BLOOM', 'WKCOAT', 'VKCOAT', 'PSCORD', 'PROPER', 'SFORUM', 'MASHBURN', 'FBLAYER', 'FBFABRIC', 'BALTSUN', 'ARMOURY', 'SUMISSURA', 'KHANCORD', 'WKCORD', 'GQKLINEN', 'NAMU', 'BESPOKE', 'KOACHMAN', 'JWHITE', 'FBSHOES', 'FBWIDE', 'RMRSWIDE2', 'SARTOROSHOE', 'MRPCHELSEA', 'MRPBOOTS', 'BOOTSPY', 'RAKE', 'WHSNEAK', 'GGSOCKS', 'MRPSOCKS', 'RMRSSOCK', 'ONDO', 'ALLUREK1', 'GQKSHOE', 'PAPERSTRAIGHT', 'GQKOUTER', 'ESQKCOACH', 'VKCOATJEAN', 'VKTREND', 'ESQKFW', 'ELLEK', 'ALLUREK2', 'KHANOUTER', 'R2 0', 'R2 1-2', 'R2 2-1', 'R2 2-2', 'R2 2-3', 'R2 2-4', 'R2 2-5', 'R2 3-1', 'R2 3-2', 'R2 3-3', 'R2 3-4', 'R2 4-1', 'R2 4-2', 'R2 4-3', 'R2 5', 'R2 6', 'R2 7', 'R1', 'C1', 'C2'];
export const SOURCE_CODES = new Set([...R1_CODES, ...R2_CODES]);

/** data-schema.md 8절 V-01~V-22 @returns {import('./types.js').ValidationIssue[]} 빈 배열이면 통과 */
export function validateData(data) {
  const issues = [];
  const err = (rule, path, message) => issues.push({ rule, severity: 'error', message, path });
  const warn = (rule, path, message) => issues.push({ rule, severity: 'warn', message, path });
  const { enums, colors, toneRules, colorRules, materials, matRules, fitRules, lengthRules, shoes, shoeRules, formality, outerRules, layerRules, adjust, outfits, labels } = data;

  const colorIds = new Set(colors.map((c) => c.id));
  const materialIds = new Set(materials.map((m) => m.id));
  const shoeIds = new Set(shoes.map((s) => s.id));
  const topTypeIds = new Set(enums.topTypes.map((t) => t.id));
  const outerTypeIds = new Set(enums.outerTypes.map((t) => t.id));
  const tones = new Set(enums.tones);
  const seasons = new Set(enums.seasons);
  const cats = new Set(enums.categories);
  const topFits = new Set(enums.topFits);
  const bottomFits = new Set(enums.bottomFits);
  const lengthsOf = { top: new Set(enums.topLengths), outer: new Set(enums.outerLengths), trouser: new Set(enums.trouserLengths) };

  // ---- V-01 camelCase ids
  const checkId = (id, path) => { if (typeof id !== 'string' || !ID_RE.test(id)) err('V-01', path, `id가 camelCase가 아님: ${JSON.stringify(id)}`); };
  for (const k of ['categories', 'seasons', 'tones', 'topFits', 'bottomFits', 'topLengths', 'outerLengths', 'trouserLengths', 'tags']) enums[k].forEach((v, i) => checkId(v, `enums.${k}[${i}]`));
  enums.topTypes.forEach((t, i) => checkId(t.id, `enums.topTypes[${i}]`));
  enums.outerTypes.forEach((t, i) => checkId(t.id, `enums.outerTypes[${i}]`));
  colors.forEach((c, i) => checkId(c.id, `colors[${i}]`));
  materials.forEach((m, i) => checkId(m.id, `materials[${i}]`));
  shoes.forEach((s, i) => checkId(s.id, `shoes[${i}]`));
  adjust.forEach((a, i) => checkId(a.id, `adjust[${i}]`));
  outfits.forEach((o, i) => { if (!/^o\d{2,}$/.test(o.id)) err('V-01', `outfits[${i}]`, `outfit id 형식 오류: ${o.id}`); });
  toneRules.rules.forEach((r, i) => { if (!/^T\d+$/.test(r.id)) err('V-01', `toneRules.rules[${i}]`, `rule id 형식 오류: ${r.id}`); });

  // ---- V-02 참조 무결성 (helper)
  const ref = (set, v, path, { star = false, nullable = false } = {}) => {
    if (v === null || v === undefined) { if (!nullable) err('V-02', path, 'null 불가'); return; }
    if (v === '*') { if (!star) err('V-02', path, '"*" 불가'); return; }
    if (!set.has(v)) err('V-02', path, `참조 없음: ${v}`);
  };
  const refSeasons = (arr, path) => { if (!Array.isArray(arr)) return err('V-02', path, 'seasons 배열 아님'); arr.forEach((s, i) => ref(seasons, s, `${path}[${i}]`)); };

  // ---- V-03 colors
  if (colors.length !== 32) err('V-03', 'colors', `32개여야 함: ${colors.length}`);
  colors.forEach((c, i) => {
    const p = `colors[${i}](${c.id})`;
    c.tones.forEach((t, j) => ref(tones, t, `${p}.tones[${j}]`));
    refSeasons(c.seasons, `${p}.seasons`);
    if (!HEX_RE.test(c.hex)) err('V-03', p, `hex 형식 오류: ${c.hex}`);
    if (!['css', 'wikipedia', 'approx'].includes(c.hexSource)) err('V-03', p, `hexSource 오류: ${c.hexSource}`);
  });

  // ---- V-04 colors.tones ↔ toneRules.groups 양방향
  for (const g of toneRules.groups) {
    ref(tones, g.id, `toneRules.groups(${g.id})`);
    for (const cid of g.colors) {
      ref(colorIds, cid, `toneRules.groups(${g.id}).colors`);
      const c = colors.find((x) => x.id === cid);
      if (c && !c.tones.includes(g.id)) err('V-04', `colors(${cid})`, `toneRules.groups(${g.id})에는 있는데 colors.tones에 없음`);
    }
  }
  for (const c of colors) for (const t of c.tones) {
    const g = toneRules.groups.find((x) => x.id === t);
    if (!g || !g.colors.includes(c.id)) err('V-04', `colors(${c.id})`, `tones에 ${t}가 있는데 toneRules.groups(${t}).colors에 없음`);
  }
  toneRules.rules.forEach((r, i) => {
    ref(tones, r.from, `toneRules.rules[${i}].from`); ref(tones, r.to, `toneRules.rules[${i}].to`);
    if (!Number.isInteger(r.modifier) || r.modifier < -2 || r.modifier > 1) err('V-02', `toneRules.rules[${i}]`, `modifier 범위(−2..+1) 밖: ${r.modifier}`);
    (r.limitColors ?? []).forEach((c, j) => ref(colorIds, c, `toneRules.rules[${i}].limitColors[${j}]`));
  });
  const hueGroupIds = new Set(toneRules.hue.analogous.map((g) => g.id));
  toneRules.hue.analogous.forEach((g) => g.colors.forEach((c, j) => ref(colorIds, c, `toneRules.hue.analogous(${g.id}).colors[${j}]`)));
  toneRules.hue.complementary.forEach((p, i) => { for (const k of ['a', 'b']) if (!hueGroupIds.has(p[k]) && !colorIds.has(p[k])) err('V-02', `toneRules.hue.complementary[${i}].${k}`, `그룹/색 참조 없음: ${p[k]}`); });
  toneRules.hue.achromatic.forEach((c, j) => ref(colorIds, c, `toneRules.hue.achromatic[${j}]`));

  // ---- V-05 ~ V-09 colorRules
  const baseKeys = new Set();
  const colorUse = new Set();
  const bottomBases = colorRules.filter((r) => r.baseCategory === 'bottom' && r.variant === null);
  const topBases = colorRules.filter((r) => r.baseCategory === 'top' && r.variant === null);
  colorRules.forEach((r, i) => {
    const p = `colorRules[${i}](${r.base}|${r.baseCategory}|${r.variant})`;
    ref(colorIds, r.base, `${p}.base`);
    colorUse.add(r.base);
    if (!['bottom', 'top'].includes(r.baseCategory)) err('V-05', p, `baseCategory 오류: ${r.baseCategory}`);
    if (r.variant !== null && !['bretonStripe', 'oxfordShirt'].includes(r.variant)) err('V-05', p, `variant 허용값 아님: ${r.variant}`);
    const key = `${r.base}|${r.baseCategory}|${r.variant}`;
    if (baseKeys.has(key)) err('V-05', p, '(base, baseCategory, variant) 중복');
    baseKeys.add(key);
    const allowed = r.baseCategory === 'bottom' ? ['top', 'shoes', 'outer'] : ['bottom', 'shoes'];
    const seen = new Set();
    r.matches.forEach((m, j) => {
      const q = `${p}.matches[${j}](${m.category}|${m.color})`;
      if (!allowed.includes(m.category)) err('V-05', q, `category 허용 안 됨: ${m.category}`);
      ref(colorIds, m.color, `${q}.color`);
      colorUse.add(m.color);
      const mk = `${m.category}|${m.color}`;
      if (seen.has(mk)) err('V-05', q, '(category,color) 중복');
      seen.add(mk);
      if (!Number.isInteger(m.score) || m.score < 1 || m.score > 5) err('V-05', q, `score 범위 오류: ${m.score}`);
      if (m.tag === 'variation' && m.score > 3) err('V-06', q, `variation인데 score ${m.score}`);
      if (m.score >= 4 && m.tag !== 'classic') err('V-06', q, `score ${m.score}인데 tag ${m.tag}`);
      if (!Array.isArray(m.sources) || m.sources.length < 1) err('V-09', q, 'sources 비어 있음');
      else if (m.tag === 'classic' && m.score === 5 && m.sources.length < 2) warn('V-09', q, `classic·5점인데 출처 ${m.sources.length}개`);
      (m.sources ?? []).forEach((s) => { if (!SOURCE_CODES.has(s)) warn('V-20', q, `출처 코드 없음: ${s}`); });
      if (!Array.isArray(m.flags)) err('V-02', q, 'flags 배열 아님');
    });
    r.avoid.forEach((a, j) => {
      const q = `${p}.avoid[${j}]`;
      if (a.category !== null) ref(cats, a.category, `${q}.category`);
      if (a.color !== null) ref(colorIds, a.color, `${q}.color`);
      (a.sources ?? []).forEach((s) => { if (!SOURCE_CODES.has(s)) warn('V-20', q, `출처 코드 없음: ${s}`); });
    });
  });
  // V-07 disputed 필수 행
  const needDisputed = [
    ['indigo', 'bottom', 'shoes', 'black', 'A3'], ['lightDenim', 'bottom', 'shoes', 'black', 'A3'], ['white', 'bottom', 'shoes', 'black', 'A4'],
    ['charcoal', 'bottom', 'shoes', 'tan', 'A7'], ['olive', 'bottom', 'top', 'rust', 'A9'], ['navy', 'bottom', 'top', 'black', 'A1'], ['black', 'bottom', 'shoes', 'chocolate', 'A2'],
  ];
  for (const [base, bc, cat, color, rid] of needDisputed) {
    const r = colorRules.find((x) => x.base === base && x.baseCategory === bc && x.variant === null);
    const m = r?.matches.find((x) => x.category === cat && x.color === color);
    if (!m) err('V-07', `colorRules(${base}|${bc})`, `${rid} 행(${cat}|${color}) 없음`);
    else if (!m.flags.includes('disputed')) err('V-07', `colorRules(${base}|${bc}).${cat}|${color}`, `${rid} 행인데 disputed 없음`);
  }
  // V-08 베이스별 classic 최소 수 (shoes 임계치는 실데이터 기준 1 — 변환 로그 참조)
  if (bottomBases.length !== 13) err('V-08', 'colorRules', `bottom 베이스는 13개(12 + white/cream 분리)여야 함: ${bottomBases.length}`);
  if (topBases.length !== 9) err('V-08', 'colorRules', `top 베이스(variant null)는 9개(10 − 브레통·옥스포드 variant + oatmeal/cream 분리)여야 함: ${topBases.length}`);
  const countClassic = (r, cat) => r.matches.filter((m) => m.category === cat && m.tag === 'classic').length;
  for (const r of bottomBases) {
    for (const [cat, min] of [['top', 3], ['shoes', 1], ['outer', 3]]) if (countClassic(r, cat) < min) err('V-08', `colorRules(${r.base}|bottom)`, `${cat} classic ${countClassic(r, cat)} < ${min}`);
  }
  for (const r of topBases) {
    for (const [cat, min] of [['bottom', 3], ['shoes', 2]]) if (countClassic(r, cat) < min) err('V-08', `colorRules(${r.base}|top)`, `${cat} classic ${countClassic(r, cat)} < ${min}`);
  }

  // ---- V-10 matRules
  if (matRules.length !== 15) err('V-10', 'matRules', `15개여야 함: ${matRules.length}`);
  const matIdx = new Map();
  matRules.forEach((r, i) => {
    const p = `matRules[${i}](${r.material})`;
    ref(materialIds, r.material, `${p}.material`);
    refSeasons(r.seasons, `${p}.seasons`);
    if (r.pairsWith.length !== 15) err('V-10', p, `pairsWith 15개여야 함: ${r.pairsWith.length}`);
    const pw = new Set();
    r.pairsWith.forEach((pr, j) => { ref(materialIds, pr.material, `${p}.pairsWith[${j}]`); pw.add(pr.material); matIdx.set(`${r.material}|${pr.material}`, pr.score); });
    if (pw.size !== materialIds.size) err('V-10', p, 'pairsWith가 15개 소재 전부를 덮지 않음');
    const lows = r.pairsWith.filter((x) => x.score <= 2).map((x) => x.material).sort().join(',');
    const av = r.avoid.map((x) => x.material).sort().join(',');
    if (lows !== av) err('V-10', p, `avoid(${av}) ≠ pairsWith≤2(${lows})`);
  });
  for (const [k, s] of matIdx) { const [a, b] = k.split('|'); if (matIdx.get(`${b}|${a}`) !== s) err('V-10', `matRules(${a}|${b})`, `비대칭: ${s} vs ${matIdx.get(`${b}|${a}`)}`); }

  // ---- V-11 fitRules / lengthRules
  const fitKeys = new Set(fitRules.map((f) => `${f.topFit}|${f.bottomFit}`));
  if (fitRules.length !== 20 || fitKeys.size !== 20) err('V-11', 'fitRules', `20행 유일이어야 함: ${fitRules.length}/${fitKeys.size}`);
  for (const t of enums.topFits) for (const b of enums.bottomFits) if (!fitKeys.has(`${t}|${b}`)) err('V-11', 'fitRules', `${t}|${b} 없음`);
  fitRules.forEach((f, i) => { ref(topFits, f.topFit, `fitRules[${i}].topFit`); ref(bottomFits, f.bottomFit, `fitRules[${i}].bottomFit`); });
  const lenKeys = new Set(lengthRules.map((l) => `${l.kind}|${l.length}|${l.bottomFit}`));
  if (lengthRules.length !== 50 || lenKeys.size !== 50) err('V-11', 'lengthRules', `50행 유일이어야 함: ${lengthRules.length}/${lenKeys.size}`);
  for (const kind of ['top', 'outer', 'trouser']) for (const l of lengthsOf[kind]) for (const b of enums.bottomFits) if (!lenKeys.has(`${kind}|${l}|${b}`)) err('V-11', 'lengthRules', `${kind}|${l}|${b} 없음`);
  lengthRules.forEach((l, i) => { if (!lengthsOf[l.kind]) err('V-02', `lengthRules[${i}]`, `kind 오류: ${l.kind}`); else ref(lengthsOf[l.kind], l.length, `lengthRules[${i}].length`); ref(bottomFits, l.bottomFit, `lengthRules[${i}].bottomFit`); });

  // ---- V-12 labels
  const labelIds = new Set();
  labels.forEach((l, i) => { if (labelIds.has(l.id)) err('V-12', `labels[${i}]`, `id 중복: ${l.id}`); labelIds.add(l.id); if (!l.label) err('V-12', `labels[${i}]`, `label 비어 있음: ${l.id}`); });
  const need = [];
  colors.forEach((c) => need.push(`color.${c.id}`));
  enums.tones.forEach((t) => need.push(`tone.${t}`));
  enums.seasons.forEach((s) => need.push(`season.${s}`));
  enums.categories.forEach((c) => need.push(`category.${c}`));
  materials.forEach((m) => need.push(`material.${m.id}`));
  enums.topFits.forEach((f) => need.push(`fit.top.${f}`));
  enums.bottomFits.forEach((f) => need.push(`fit.bottom.${f}`));
  enums.topLengths.forEach((l) => need.push(`length.top.${l}`));
  enums.outerLengths.forEach((l) => need.push(`length.outer.${l}`));
  enums.trouserLengths.forEach((l) => need.push(`length.trouser.${l}`));
  shoes.forEach((s) => need.push(`shoe.${s.id}`));
  enums.topTypes.forEach((t) => need.push(`topType.${t.id}`));
  enums.outerTypes.forEach((t) => need.push(`outerType.${t.id}`));
  enums.tags.forEach((t) => need.push(`tag.${t}`));
  for (const id of need) if (!labelIds.has(id)) err('V-12', 'labels', `label 없음: ${id}`);
  const shortNs = ['color.', 'category.', 'shoe.', 'material.', 'fit.', 'length.', 'tone.', 'season.'];
  labels.forEach((l) => { if (shortNs.some((ns) => l.id.startsWith(ns))) { if (typeof l.shortLabel !== 'string' || !l.shortLabel) err('V-12', `labels(${l.id})`, 'shortLabel 없음'); else if (l.shortLabel.length > 6) err('V-12', `labels(${l.id})`, `shortLabel 6자 초과: ${l.shortLabel}`); } });

  // ---- V-13 shoeRules
  if (shoeRules.length !== 11) err('V-13', 'shoeRules', `11개여야 함: ${shoeRules.length}`);
  shoeRules.forEach((r, i) => {
    const p = `shoeRules[${i}](${r.shoe})`;
    ref(shoeIds, r.shoe, `${p}.shoe`);
    const ls = r.lengths.map((l) => l.length).sort().join(',');
    if (ls !== [...enums.trouserLengths].sort().join(',')) err('V-13', p, `lengths 4행(crop/nobreak/half/full) 아님: ${ls}`);
    r.bottoms.forEach((b, j) => {
      const q = `${p}.bottoms[${j}]`;
      ref(materialIds, b.material, `${q}.material`);
      ref(bottomFits, b.fit, `${q}.fit`, { star: true });
      ref(lengthsOf.trouser, b.length, `${q}.length`, { star: true });
      if (!Number.isInteger(b.score) || b.score < 1 || b.score > 5) err('V-13', q, `score 오류: ${b.score}`);
    });
  });
  if (!shoeRules.some((r) => r.shoe === 'running' && r.bottoms.some((b) => b.material === 'wool' && b.flags?.includes('disputed')))) err('V-07', 'shoeRules(running)', '러닝화+슬랙스 행에 disputed 없음');
  if (!shoes.find((s) => s.id === 'chelsea')?.flags?.includes('disputed')) err('V-07', 'shoes(chelsea)', '첼시 포멀도 disputed 없음');
  if (!fitRules.find((f) => f.topFit === 'slim' && f.bottomFit === 'slim')?.flags?.includes('disputed')) err('V-07', 'fitRules(slim|slim)', '풀 슬림 disputed 없음');
  if (!lengthRules.find((l) => l.kind === 'outer' && l.length === 'long' && l.bottomFit === 'wide')?.flags?.includes('disputed')) err('V-07', 'lengthRules(outer|long|wide)', '롱코트+와이드 disputed 없음');
  if (!materials.find((m) => m.id === 'linen')?.flags?.includes('disputed')) err('V-07', 'materials(linen)', '린넨 계절 disputed 없음');
  if (!adjust.find((a) => a.id === 'adjWideThinShoe')?.flags?.includes('disputed')) err('V-07', 'adjust(adjWideThinShoe)', '와이드+신발 폭 disputed 없음');

  // ---- V-14 formality
  const fIdx = new Map();
  formality.forEach((f, i) => {
    const p = `formality[${i}](${f.category}|${f.id})`;
    ref(cats, f.category, `${p}.category`);
    const set = { shoes: shoeIds, bottom: materialIds, top: topTypeIds, outer: outerTypeIds }[f.category];
    if (set) ref(set, f.id, `${p}.id`);
    if (!Number.isInteger(f.level) || f.level < 1 || f.level > 10) err('V-14', p, `level 범위 오류: ${f.level}`);
    if (f.when?.fit) f.when.fit.forEach((x, j) => ref(bottomFits, x, `${p}.when.fit[${j}]`));
    const k = `${f.category}|${f.id}`;
    if (!f.when) { if (fIdx.has(k)) err('V-14', p, 'when 없는 기본 행 중복'); fIdx.set(k, true); }
  });
  for (const s of shoeIds) if (!fIdx.has(`shoes|${s}`)) err('V-14', 'formality', `shoes|${s} 기본 행 없음`);
  for (const m of materialIds) if (!fIdx.has(`bottom|${m}`)) err('V-14', 'formality', `bottom|${m} 기본 행 없음`);
  for (const t of topTypeIds) if (!fIdx.has(`top|${t}`)) err('V-14', 'formality', `top|${t} 기본 행 없음`);
  for (const o of outerTypeIds) if (!fIdx.has(`outer|${o}`)) err('V-14', 'formality', `outer|${o} 기본 행 없음`);

  // ---- V-15 outerRules
  if (outerRules.length !== 16) err('V-15', 'outerRules', `16개여야 함: ${outerRules.length}`);
  const outerSeen = new Set();
  outerRules.forEach((r, i) => {
    const p = `outerRules[${i}](${r.outer})`;
    ref(outerTypeIds, r.outer, `${p}.outer`);
    if (outerSeen.has(r.outer)) err('V-15', p, 'outer 중복'); outerSeen.add(r.outer);
    if (!Array.isArray(r.seasons) || r.seasons.length === 0) err('V-15', p, 'seasons 비어 있음'); else refSeasons(r.seasons, `${p}.seasons`);
    ref(lengthsOf.outer, r.length, `${p}.length`);
    ref(materialIds, r.material, `${p}.material`, { nullable: true });
    r.bottoms.forEach((b, j) => { ref(materialIds, b.material, `${p}.bottoms[${j}].material`, { star: true }); ref(bottomFits, b.fit, `${p}.bottoms[${j}].fit`, { star: true }); });
    r.shoes.forEach((s, j) => ref(shoeIds, s.shoe, `${p}.shoes[${j}].shoe`));
    r.avoid.forEach((a, j) => ref(materialIds, a.material, `${p}.avoid[${j}].material`));
    (r.sources ?? []).forEach((s) => { if (!SOURCE_CODES.has(s)) warn('V-20', p, `출처 코드 없음: ${s}`); });
  });
  for (const o of outerTypeIds) if (!outerSeen.has(o)) err('V-15', 'outerRules', `${o} 규칙 없음`);
  layerRules.forEach((l, i) => ref(seasons, l.season, `layerRules[${i}].season`));

  // ---- V-16 adjust
  const adjIds = new Set();
  adjust.forEach((a, i) => {
    const p = `adjust[${i}](${a.id})`;
    if (adjIds.has(a.id)) err('V-16', p, 'id 중복'); adjIds.add(a.id);
    for (const k of Object.keys(a.when)) if (!ADJUST_WHEN_KEYS.includes(k)) err('V-16', p, `when 키 허용 안 됨: ${k}`);
    if (!Number.isInteger(a.delta) || a.delta < -2 || a.delta > 1) err('V-16', p, `delta 범위 오류: ${a.delta}`);
    const arr = (v) => (Array.isArray(v) ? v : [v]);
    if (a.when.shoe) arr(a.when.shoe).forEach((s) => ref(shoeIds, s, `${p}.when.shoe`));
    for (const k of ['topColor', 'bottomColor', 'shoesColor', 'outerColor']) if (a.when[k]) arr(a.when[k]).forEach((c) => ref(colorIds, c, `${p}.when.${k}`));
    if (a.when.season) arr(a.when.season).forEach((s) => ref(seasons, s, `${p}.when.season`));
    (a.sources ?? []).forEach((s) => { if (!SOURCE_CODES.has(s)) warn('V-20', p, `출처 코드 없음: ${s}`); });
  });

  // ---- V-17 ~ V-19 outfits
  const pairScore = (a, b) => {
    const tryRule = (x, y) => {
      if (!['bottom', 'top'].includes(x.category)) return null;
      const r = colorRules.find((rr) => rr.base === x.color && rr.baseCategory === x.category && rr.variant === null);
      return r?.matches.find((m) => m.category === y.category && m.color === y.color)?.score ?? null;
    };
    return tryRule(a, b) ?? tryRule(b, a);
  };
  const fLevel = (it) => {
    const id = it.category === 'bottom' ? it.material : it.category === 'shoes' ? it.shoeType : it.itemType;
    const rows = formality.filter((f) => f.category === it.category && f.id === id);
    const w = rows.find((f) => f.when?.fit && it.fit && f.when.fit.includes(it.fit));
    return (w ?? rows.find((f) => !f.when))?.level ?? null;
  };
  const outfitIds = new Set();
  if (outfits.length < 40) err('V-17', 'outfits', `전체 ≥ 40이어야 함: ${outfits.length}`);
  if (outfits.filter((o) => o.universal).length < 10) err('V-17', 'outfits', `universal ≥ 10이어야 함: ${outfits.filter((o) => o.universal).length}`);
  outfits.forEach((o, i) => {
    const p = `outfits[${i}](${o.id})`;
    if (outfitIds.has(o.id)) err('V-17', p, 'id 중복'); outfitIds.add(o.id);
    const by = (c) => o.items.filter((it) => it.category === c);
    if (by('top').length !== 1 || by('bottom').length !== 1 || by('shoes').length !== 1) err('V-17', p, 'top·bottom·shoes 정확히 1개씩이어야 함');
    if (by('outer').length > 2) err('V-17', p, 'outer는 0~2개');
    if (!Array.isArray(o.seasons) || o.seasons.length === 0) err('V-17', p, 'seasons 비어 있음'); else refSeasons(o.seasons, `${p}.seasons`);
    o.tags.forEach((t, j) => { if (!enums.tags.includes(t)) err('V-02', `${p}.tags[${j}]`, `tag 없음: ${t}`); });
    if (o.universal && !o.isClassic) err('V-17', p, 'universal인데 isClassic false');
    if (o.tags.includes('variation') && o.isClassic) err('V-17', p, 'variation 태그인데 isClassic true');
    (o.sources ?? []).forEach((s) => { if (!SOURCE_CODES.has(s)) warn('V-20', p, `출처 코드 없음: ${s}`); });
    o.items.forEach((it, j) => {
      const q = `${p}.items[${j}](${it.category})`;
      ref(cats, it.category, `${q}.category`);
      ref(colorIds, it.color, `${q}.color`);
      colorUse.add(it.color);
      ref(materialIds, it.material, `${q}.material`, { nullable: true });
      if (it.category === 'top') { ref(topFits, it.fit, `${q}.fit`); ref(lengthsOf.top, it.length, `${q}.length`); ref(topTypeIds, it.itemType, `${q}.itemType`); }
      if (it.category === 'bottom') { ref(bottomFits, it.fit, `${q}.fit`); ref(lengthsOf.trouser, it.length, `${q}.length`); if (it.itemType !== null) err('V-17', q, 'bottom itemType은 null'); }
      if (it.category === 'outer') { ref(lengthsOf.outer, it.length, `${q}.length`); ref(outerTypeIds, it.itemType, `${q}.itemType`); if (it.fit !== null) err('V-17', q, 'outer fit은 null'); }
      if (it.category === 'shoes') { ref(shoeIds, it.shoeType, `${q}.shoeType`); if (it.fit !== null || it.length !== null) err('V-17', q, 'shoes fit·length는 null'); }
      else if (it.shoeType !== null && it.shoeType !== undefined) err('V-17', q, 'shoeType은 shoes에만');
      if (it.pattern !== null && it.pattern !== undefined && it.pattern !== 'breton') err('V-17', q, `pattern 허용값 아님: ${it.pattern}`);
    });
    // V-18 색 쌍
    const top = by('top')[0]; const bottom = by('bottom')[0]; const shoesIt = by('shoes')[0];
    const outer = by('outer').length === 2 ? by('outer').find((x) => x.layer === 2) ?? by('outer')[1] : by('outer')[0];
    const pairs = [[bottom, top], [bottom, shoesIt]];
    if (outer) pairs.push([bottom, outer], [top, outer]);
    for (const [a, b] of pairs) {
      if (!a || !b) continue;
      const s = pairScore(a, b);
      if (s === null) { if (!(a.category === 'top' && b.category === 'outer')) warn('V-18', p, `규칙 없음: ${a.category}:${a.color} ↔ ${b.category}:${b.color}`); }
      else if (s <= 2) err('V-18', p, `색 규칙 ${s}점: ${a.category}:${a.color} ↔ ${b.category}:${b.color}`);
    }
    // V-19 포멀도 격차
    const levels = o.items.map(fLevel).filter((x) => x !== null);
    if (levels.length) {
      const gap = Math.max(...levels) - Math.min(...levels);
      // 통합 결정 D1: 차단 임계 6, 출처 2개 이상 클래식은 면제
      const exempt = o.isClassic && (o.sources?.length ?? 0) >= 2;
      if (gap >= 6 && !o.tags.includes('variation') && !exempt) err('V-19', p, `포멀도 격차 ${gap}인데 variation 태그 없음`);
    }
  });

  // ---- V-21 고아 색
  for (const c of colorIds) if (!colorUse.has(c)) {
    // Phase 4 (P3-25/V-21): teal·taupe는 2차용 예비 어휘 — 규칙이 없어 UI 칩에 오르지 않으므로 info
    if (RESERVE_COLORS.includes(c)) issues.push({ rule: 'V-21', severity: 'info', message: '예비 색(규칙 없음, 베이스 칩 미노출 — RESERVE_COLORS)', path: `colors(${c})` });
    else warn('V-21', `colors(${c})`, 'colorRules·outfits 어디에도 등장하지 않음');
  }

  // ---- V-22 용량
  const bytes = Object.values(data).reduce((a, v) => a + new TextEncoder().encode(JSON.stringify(v)).length, 0);
  if (bytes > 300 * 1024) warn('V-22', 'data', `JSON 총합 ${(bytes / 1024).toFixed(0)} KB > 300 KB`);

  return issues;
}
