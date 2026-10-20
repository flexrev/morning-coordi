// 데이터 정합성 검사 — docs/architecture/data-schema.md 8절 V-01 ~ V-22 (+ Phase 6-B V-23 ~ V-33, content-expansion.md 6-5). 구현: C2 · CX.
// 변경점(데이터 변환 로그 참조): V-08 shoes 임계치(bottom 베이스 ≥1), V-05 variant에 "oxfordShirt" 허용, V-09 sources ≥2는 warn.
import { ADJUST_WHEN_KEYS, RESERVE_COLORS, AFFINITY_KINDS, ACCESSORY_WHEN_KEYS, ACCESSORY_PICK_KEYS, ACCESSORY_COLOR_DERIVED, PATTERN_WHEN_KEYS, PATTERN_EFFECTS } from './constants.js';
import { buildIndex } from './lookup.js';
import { styleVector, styleTags, occasionFit } from './style.js';

// Phase 6-B (CX) 출처 코드표 — content-expansion-data.md 7-1 (scripts/build/sources.mjs CX_CODES와 동일) + 내부 참조
const CX_CODES = ['GQK8', 'VKFW26', 'VKMIN', 'VKMIN2', 'WKDENIM', 'WKCHECK', 'ESQMIN', 'VKGORP', 'KHGORP', 'GQKGORP', 'HSSGORP', 'SNKGORP', 'NTAME', 'KHSTYLE6', 'STRUM', 'TRADEJP', 'YOKO', 'POPWIKI', 'SNKCITY', 'ESQCITY', 'VKWIDE', 'WKOVER', 'OPUMOIVY', 'STUIVY', 'VOUIVY', 'STRIDE', 'MRPWORK', 'MOMCHORE', 'DAZEDCW', 'SUITBC', 'ALLWORK', 'ALLBLZ', 'GQKSUM', 'GQKWED', 'GQKSUIT', 'BOSSWED', 'CMTINT', 'HKINT', 'GQKDATE', 'ESQDATE', 'ALLDATE', 'VKCARGO', 'VKNB', 'MYRQ', 'TMMBELT', 'EGSOCK', 'EGNOSHOW', 'WHSOCK', 'MOMBAG', 'FASHBAG', 'MRPBAG', 'LAIRD1', 'ANSIN', 'ASOSSCARF', 'FBPAT', 'BLPAT', 'MRPPAT', 'AOSPAT', 'WHPAT', 'PRIMER', 'SSHOUND', 'ESQLAY', 'ALLCARD', 'KHLAY', 'PTOMID', 'OPUMOLAY', 'IHLAY', 'CX', 'R1 5-8', 'R2 5-5', 'R2 6-2', 'R2 6-3', 'R2 6-4', 'T8', 'T9'];

const ID_RE = /^[a-z][a-zA-Z0-9]*$/;
const HEX_RE = /^#[0-9A-F]{6}$/;
const R1_CODES = ['WH1', 'WH2', 'AtG1', 'AtG2', 'AtG3', 'AtG4', 'FB1', 'FB2', 'FB3', 'FB4', 'FB-stripes', 'GG', 'PS1', 'PS2', 'PS3', 'PS-snippet', 'RMRS1', 'RMRS2', 'RMRS3', 'RMRS 색상환', 'MF', 'MM', 'TMM-tan', 'Dapp', 'Fitville', 'MRP', 'MRP-stripes', 'Esq', 'Vou1', 'Vou2', 'Celio', 'Berle', 'HB', 'Acorn', 'Aza', 'Studio', 'Hack', 'PM', 'StyleGF', 'MSR', 'HSS', 'Dalm', 'VK1', 'VK2', 'VK3', 'WK1', 'WK2', 'GQK', 'Allure', 'Khaki-guides', 'Navy-guides', 'Olive-guides', 'Brown-guides', 'Blue-guides', 'Burgundy-guides', 'HEX'];
const R2_CODES = ['MOM', 'BGU', 'RMRSFIT', 'RMRSWIDE1', 'MRPWIDE', 'DIEWW', 'SQM', 'VKFIT', 'ESQK1', 'ESQK2', 'COSK', 'SUIT', 'PSBREAK', 'EGENT', 'SARTORO', 'TIES', 'BLOOM', 'WKCOAT', 'VKCOAT', 'PSCORD', 'PROPER', 'SFORUM', 'MASHBURN', 'FBLAYER', 'FBFABRIC', 'BALTSUN', 'ARMOURY', 'SUMISSURA', 'KHANCORD', 'WKCORD', 'GQKLINEN', 'NAMU', 'BESPOKE', 'KOACHMAN', 'JWHITE', 'FBSHOES', 'FBWIDE', 'RMRSWIDE2', 'SARTOROSHOE', 'MRPCHELSEA', 'MRPBOOTS', 'BOOTSPY', 'RAKE', 'WHSNEAK', 'GGSOCKS', 'MRPSOCKS', 'RMRSSOCK', 'ONDO', 'ALLUREK1', 'GQKSHOE', 'PAPERSTRAIGHT', 'GQKOUTER', 'ESQKCOACH', 'VKCOATJEAN', 'VKTREND', 'ESQKFW', 'ELLEK', 'ALLUREK2', 'KHANOUTER', 'R2 0', 'R2 1-2', 'R2 2-1', 'R2 2-2', 'R2 2-3', 'R2 2-4', 'R2 2-5', 'R2 3-1', 'R2 3-2', 'R2 3-3', 'R2 3-4', 'R2 4-1', 'R2 4-2', 'R2 4-3', 'R2 5', 'R2 6', 'R2 7', 'R1', 'C1', 'C2'];
export const SOURCE_CODES = new Set([...R1_CODES, ...R2_CODES, ...CX_CODES]);

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
  const shortNs = ['color.', 'category.', 'shoe.', 'material.', 'fit.', 'length.', 'tone.', 'season.', 'style.', 'occasion.', 'pattern.', 'midType.', 'accessory.'];
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

  // ---- Phase 6-B 확장 파일 (없으면 빈 배열 = 기능 OFF)
  const styles = data.styles ?? []; const styleAffinity = data.styleAffinity ?? []; const occasions = data.occasions ?? [];
  const accessoryTypes = data.accessoryTypes ?? []; const accessoryRules = data.accessoryRules ?? [];
  const patterns = data.patterns ?? []; const patternRules = data.patternRules ?? [];
  const midTypes = data.midTypes ?? []; const midLayerRules = data.midLayerRules ?? []; const twoOuterRules = data.twoOuterRules ?? [];
  const styleIds = new Set(styles.map((s) => s.id));
  const patternIds = new Set(patterns.length ? patterns.map((p) => p.id) : ['breton']);
  const midTypeIds = new Set(midTypes.map((m) => m.id));
  const accessoryIds = new Set(accessoryTypes.map((a) => a.id));
  const expansionOn = styles.length > 0;

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
    if (by('mid').length > 1) err('V-31', p, 'mid는 0~1개'); // D-3
    if (o.items.filter((it) => it.pattern).length > 2) err('V-31', p, '패턴 아이템은 ≤ 2');
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
      if (it.category === 'mid') { ref(midTypeIds, it.itemType, `${q}.itemType`); ref(lengthsOf.outer, it.length, `${q}.length`); if (it.fit !== null) err('V-31', q, 'mid fit은 null'); }
      // V-17(수정, Phase 6-B 4-3): pattern 허용값은 enums.patterns(없으면 breton만)
      if (it.pattern !== null && it.pattern !== undefined && !patternIds.has(it.pattern)) err('V-17', q, `pattern 허용값 아님: ${it.pattern}`);
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

  // ---- V-22 용량 (기존 16개 파일) · V-33 전체 합 < 360KB (Phase 6-B)
  const BASE_FILES = ['enums', 'colors', 'toneRules', 'colorRules', 'materials', 'matRules', 'fitRules', 'lengthRules', 'shoes', 'shoeRules', 'formality', 'outerRules', 'layerRules', 'adjust', 'outfits', 'labels'];
  const size = (v) => new TextEncoder().encode(JSON.stringify(v)).length;
  const baseBytes = BASE_FILES.reduce((a, k) => a + (data[k] ? size(data[k]) : 0), 0);
  if (baseBytes > 300 * 1024) warn('V-22', 'data', `기존 JSON 합 ${(baseBytes / 1024).toFixed(0)} KB > 300 KB`);
  const bytes = Object.values(data).reduce((a, v) => a + size(v), 0);
  if (bytes > 360 * 1024) warn('V-33', 'data', `JSON 총합 ${(bytes / 1024).toFixed(0)} KB > 360 KB`);

  // ================================================================ Phase 6-B (CX) V-23 ~ V-32 — content-expansion.md 6-5
  if (expansionOn) {
    const src = (arr, p) => (arr ?? []).forEach((s) => { if (!SOURCE_CODES.has(s)) warn('V-20', p, `출처 코드 없음: ${s}`); });
    const topOrOuter = new Set([...topTypeIds, ...outerTypeIds]);
    const inRange = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
    const kindSet = { topType: topTypeIds, outerType: outerTypeIds, shoeType: shoeIds, material: materialIds, topFit: topFits, bottomFit: bottomFits, trouserLength: lengthsOf.trouser, topLength: lengthsOf.top, outerLength: lengthsOf.outer, color: colorIds, pattern: patternIds, accessory: accessoryIds };
    const affinity = new Map();
    // ---- V-24 styleAffinity
    styleAffinity.forEach((a, i) => {
      const p = `styleAffinity[${i}](${a.kind}|${a.id})`;
      if (!AFFINITY_KINDS.includes(a.kind)) err('V-24', p, `kind 허용 안 됨: ${a.kind}`);
      else ref(kindSet[a.kind], a.id, `${p}.id`);
      const k = `${a.kind}|${a.id}`;
      if (affinity.has(k)) err('V-24', p, '(kind,id) 중복'); affinity.set(k, a.weights);
      const keys = Object.keys(a.weights ?? {});
      if (keys.length !== styleIds.size || keys.some((s) => !styleIds.has(s))) err('V-24', p, `weights 키가 styles와 1:1 아님: ${keys.join(',')}`);
      for (const [s, w] of Object.entries(a.weights ?? {})) if (!inRange(w, -2, 3)) err('V-24', `${p}.${s}`, `가중치 범위(−2..+3) 밖: ${w}`);
    });
    // ---- V-25 커버리지
    const BOTTOM_MATERIALS = [...materialIds].filter((m) => !['knitCotton', 'knitWool', 'knitCashmere', 'leather'].includes(m));
    const coverage = [['topType', topTypeIds], ['outerType', outerTypeIds], ['shoeType', shoeIds], ['material', BOTTOM_MATERIALS], ['topFit', topFits], ['bottomFit', bottomFits], ['trouserLength', lengthsOf.trouser], ['topLength', lengthsOf.top], ['outerLength', lengthsOf.outer], ['color', colorIds]];
    for (const [kind, set] of coverage) for (const id of set) if (!affinity.has(`${kind}|${id}`)) err('V-25', 'styleAffinity', `${kind}|${id} 행 없음`);
    // ---- V-23 · V-26 styles
    const SPECIAL_AVOID = new Set(['accent2', 'pattern2', 'logo', 'fourColors', 'black2']);
    const styleSeen = new Set();
    styles.forEach((s, i) => {
      const p = `styles[${i}](${s.id})`;
      checkId(s.id, p);
      if (styleSeen.has(s.id)) err('V-23', p, 'id 중복'); styleSeen.add(s.id);
      if (!(s.formality && inRange(s.formality.min, 1, 10) && inRange(s.formality.max, 1, 10) && s.formality.min <= s.formality.max)) err('V-23', p, 'formality.min ≤ max 아님');
      if (![1, 2].includes(s.phase)) err('V-23', p, `phase ∈ 1,2 아님: ${s.phase}`);
      if (!Array.isArray(s.sources) || s.sources.length < 2) err('V-23', p, `sources ≥ 2 아님: ${s.sources?.length ?? 0}`);
      src(s.sources, p);
      (s.tones ?? []).forEach((t, j) => ref(tones, t, `${p}.tones[${j}]`));
      refSeasons(s.seasons, `${p}.seasons`);
      const sig = { top: ['topType', topTypeIds], bottom: ['material', materialIds], shoes: ['shoeType', shoeIds], outer: ['outerType', outerTypeIds] };
      for (const [slot, [kind, set]] of Object.entries(sig)) for (const id of s.signature?.[slot] ?? []) {
        ref(set, id, `${p}.signature.${slot}`);
        const w = affinity.get(`${kind}|${id}`)?.[s.id];
        if (w !== undefined && w < 2) err('V-26', `${p}.signature.${slot}(${id})`, `시그니처 품목인데 ${s.id} 가중 ${w} < +2`);
      }
      for (const id of s.avoid ?? []) {
        if (SPECIAL_AVOID.has(id)) continue;
        const kinds = AFFINITY_KINDS.filter((k) => kindSet[k]?.has?.(id));
        if (!kinds.length) err('V-23', `${p}.avoid(${id})`, 'avoid id가 어떤 enum에도 없음');
        for (const k of kinds) { const w = affinity.get(`${k}|${id}`)?.[s.id]; if (w !== undefined && w > 0) err('V-26', `${p}.avoid(${id})`, `avoid 품목인데 ${s.id} 가중 ${w} > 0 (${k})`); }
      }
    });
    if (enums.styles && enums.styles.join(',') !== styles.map((s) => s.id).join(',')) err('V-23', 'enums.styles', 'styles.json id 순서와 다름');
    // ---- V-27 occasions
    if (occasions.length < 5) err('V-27', 'occasions', `5개 이상이어야 함: ${occasions.length}`);
    occasions.forEach((o, i) => {
      const p = `occasions[${i}](${o.id})`;
      checkId(o.id, p);
      const f = o.formality ?? {};
      if (!(inRange(f.min, 1, 10) && inRange(f.max, 1, 10) && inRange(f.targetLo, 1, 10) && inRange(f.targetHi, 1, 10) && f.min <= f.targetLo && f.targetLo <= f.targetHi && f.targetHi <= f.max)) err('V-27', p, 'formality min ≤ targetLo ≤ targetHi ≤ max 아님');
      for (const [s, b] of Object.entries(o.styleBoost ?? {})) { ref(styleIds, s, `${p}.styleBoost`); if (!inRange(b, 1, 3)) err('V-27', `${p}.styleBoost.${s}`, `범위(1..3) 밖: ${b}`); }
      (o.avoid?.itemTypes ?? []).forEach((x) => ref(topOrOuter, x, `${p}.avoid.itemTypes`));
      (o.avoid?.shoeTypes ?? []).forEach((x) => ref(shoeIds, x, `${p}.avoid.shoeTypes`));
      (o.avoid?.materials ?? []).forEach((x) => ref(materialIds, x, `${p}.avoid.materials`));
      (o.avoid?.patterns ?? []).forEach((x) => ref(patternIds, x, `${p}.avoid.patterns`));
      (o.prefer?.itemTypes ?? []).forEach((x) => { ref(topOrOuter, x, `${p}.prefer.itemTypes`); if (o.avoid?.itemTypes?.includes(x)) err('V-27', p, `avoid와 prefer에 동시 등장: ${x}`); });
      (o.prefer?.shoeTypes ?? []).forEach((x) => { ref(shoeIds, x, `${p}.prefer.shoeTypes`); if (o.avoid?.shoeTypes?.includes(x)) err('V-27', p, `avoid와 prefer에 동시 등장: ${x}`); });
      (o.accessories ?? []).forEach((x) => ref(accessoryIds, x, `${p}.accessories`));
      if (!inRange(o.patternMax, 0, 3)) err('V-27', p, `patternMax 범위 오류: ${o.patternMax}`);
      src(o.sources, p);
    });
    // ---- V-28 accessoryTypes · accessoryRules
    const groups = new Set();
    accessoryTypes.forEach((a, i) => {
      const p = `accessoryTypes[${i}](${a.id})`;
      checkId(a.id, p); groups.add(a.group);
      if (!(inRange(a.formality?.min, 1, 10) && inRange(a.formality?.max, 1, 10) && a.formality.min <= a.formality.max)) err('V-28', p, 'formality 창 오류');
      refSeasons(a.seasons, `${p}.seasons`);
      if (a.colorFrom !== null && !['shoes', 'bottom', 'outfit', 'neutral', 'free'].includes(a.colorFrom)) err('V-28', p, `colorFrom 오류: ${a.colorFrom}`);
    });
    const acIds = new Set();
    accessoryRules.forEach((r, i) => {
      const p = `accessoryRules[${i}](${r.id})`;
      checkId(r.id, p);
      if (acIds.has(r.id)) err('V-28', p, 'id 중복'); acIds.add(r.id);
      for (const k of Object.keys(r.when ?? {})) if (!ACCESSORY_WHEN_KEYS.includes(k)) err('V-28', p, `when 키 허용 안 됨: ${k}`);
      (r.accessory ?? []).forEach((a) => ref(accessoryIds, a, `${p}.accessory`));
      if (!inRange(r.delta, -2, 1)) err('V-28', p, `delta 범위(−2..+1) 밖: ${r.delta}`);
      if (!['info', 'warn'].includes(r.severity)) err('V-28', p, `severity 오류: ${r.severity}`);
      for (const k of Object.keys(r.pick ?? {})) if (!ACCESSORY_PICK_KEYS.includes(k)) err('V-28', p, `pick 키 허용 안 됨: ${k}`);
      if (r.pick?.color !== undefined) for (const c of (Array.isArray(r.pick.color) ? r.pick.color : [r.pick.color])) if (!colorIds.has(c) && !ACCESSORY_COLOR_DERIVED.includes(c)) err('V-28', p, `pick.color 값 오류: ${c}`);
      const w = r.when ?? {};
      const arr = (v) => (Array.isArray(v) ? v : [v]);
      if (w.shoeType) arr(w.shoeType).forEach((s) => ref(shoeIds, s, `${p}.when.shoeType`));
      if (w.shoesColor) arr(w.shoesColor).forEach((c) => ref(colorIds, c, `${p}.when.shoesColor`));
      if (w.beltColor) arr(w.beltColor).forEach((c) => ref(colorIds, c, `${p}.when.beltColor`));
      if (w.topType) arr(w.topType).forEach((t) => ref(topTypeIds, t, `${p}.when.topType`));
      if (w.outerType) arr(w.outerType).forEach((t) => ref(outerTypeIds, t, `${p}.when.outerType`));
      if (w.bottomMaterial) arr(w.bottomMaterial).forEach((m) => ref(materialIds, m, `${p}.when.bottomMaterial`));
      if (w.season) arr(w.season).forEach((s) => ref(seasons, s, `${p}.when.season`));
      if (w.style) arr(w.style).forEach((s) => ref(styleIds, s, `${p}.when.style`));
      if (w.belt) arr(w.belt).forEach((s) => ref(accessoryIds, s, `${p}.when.belt`));
      if (w.watch) arr(w.watch).forEach((s) => ref(accessoryIds, s, `${p}.when.watch`));
      if (w.outerPattern !== undefined && w.outerPattern !== null) arr(w.outerPattern).forEach((x) => ref(patternIds, x, `${p}.when.outerPattern`));
      src(r.sources, p);
    });
    if (enums.accessoryGroups && enums.accessoryGroups.some((g) => !groups.has(g))) err('V-28', 'enums.accessoryGroups', 'accessoryTypes.group에 없는 그룹');
    // ---- V-29 patterns · patternRules
    if (patterns.length !== 9) err('V-29', 'patterns', `9개여야 함: ${patterns.length}`);
    patterns.forEach((pt, i) => {
      const p = `patterns[${i}](${pt.id})`;
      checkId(pt.id, p);
      if (!['stripe', 'check', 'texture', 'print'].includes(pt.family)) err('V-29', p, `family 오류: ${pt.family}`);
      if (!['small', 'mid', 'large'].includes(pt.scale)) err('V-29', p, `scale 오류: ${pt.scale}`);
      (pt.categories ?? []).forEach((c) => ref(cats, c, `${p}.categories`));
      (pt.itemTypes ?? []).forEach((t) => { if (!topOrOuter.has(t) && !materialIds.has(t)) err('V-02', `${p}.itemTypes`, `참조 없음: ${t}`); });
      if (!inRange(pt.formality, 1, 10)) err('V-29', p, `formality 오류: ${pt.formality}`);
      refSeasons(pt.seasons, `${p}.seasons`);
      (pt.colorsTypical ?? []).forEach((c) => ref(colorIds, c, `${p}.colorsTypical`));
      src(pt.sources, p);
    });
    const ptIds = new Set();
    patternRules.forEach((r, i) => {
      const p = `patternRules[${i}](${r.id})`;
      checkId(r.id, p);
      if (ptIds.has(r.id)) err('V-29', p, 'id 중복'); ptIds.add(r.id);
      for (const k of Object.keys(r.when ?? {})) if (!PATTERN_WHEN_KEYS.includes(k)) err('V-29', p, `when 키 허용 안 됨: ${k}`);
      if (!PATTERN_EFFECTS.includes(r.effect)) err('V-29', p, `effect 오류: ${r.effect}`);
      if (r.effect === 'exclude' && r.severity !== 'block') err('V-29', p, 'exclude인데 severity block 아님');
      if (!inRange(r.delta, -2, 1)) err('V-29', p, `delta 범위 오류: ${r.delta}`);
      const arr = (v) => (Array.isArray(v) ? v : [v]);
      const w = r.when ?? {};
      if (w.pattern !== undefined && w.pattern !== 'any') arr(w.pattern).forEach((x) => ref(patternIds, x, `${p}.when.pattern`));
      if (w.otherPattern !== undefined) arr(w.otherPattern).forEach((x) => ref(patternIds, x, `${p}.when.otherPattern`));
      if (w.category !== undefined) arr(w.category).forEach((x) => ref(cats, x, `${p}.when.category`));
      if (w.outerType !== undefined) arr(w.outerType).forEach((x) => ref(outerTypeIds, x, `${p}.when.outerType`));
      if (w.bottomColor !== undefined) arr(w.bottomColor).forEach((x) => ref(colorIds, x, `${p}.when.bottomColor`));
      if (w.outfitTones !== undefined) arr(w.outfitTones).forEach((x) => ref(tones, x, `${p}.when.outfitTones`));
      if (w.mode !== undefined && !['quick', 'deep'].includes(w.mode)) err('V-29', p, `when.mode 오류: ${w.mode}`);
      src(r.sources, p);
    });
    if (enums.patterns && enums.patterns.join(',') !== patterns.map((x) => x.id).join(',')) err('V-29', 'enums.patterns', 'patterns.json id 순서와 다름');
    // ---- V-30 midTypes · midLayerRules · twoOuterRules
    midTypes.forEach((m, i) => {
      const p = `midTypes[${i}](${m.id})`;
      checkId(m.id, p);
      ref(materialIds, m.material, `${p}.material`, { nullable: true });
      if (!inRange(m.formality, 1, 10)) err('V-30', p, `formality 오류: ${m.formality}`);
      ref(lengthsOf.outer, m.length, `${p}.length`);
      if (!['light', 'mid', 'heavy'].includes(m.weight)) err('V-30', p, `weight 오류: ${m.weight}`);
      refSeasons(m.seasons, `${p}.seasons`);
    });
    if (enums.midTypes && enums.midTypes.join(',') !== midTypes.map((x) => x.id).join(',')) err('V-30', 'enums.midTypes', 'midTypes.json id 순서와 다름');
    const listOr = (v, set, p, extra) => { if (typeof v === 'string') { if (!extra.includes(v)) err('V-30', p, `값 오류: ${v}`); } else if (Array.isArray(v)) v.forEach((x) => { if (!(x === 'none' && extra.includes('none'))) ref(set, x, p); }); else err('V-30', p, '배열 또는 any/none 아님'); };
    midLayerRules.forEach((r, i) => {
      const p = `midLayerRules[${i}](${r.id})`;
      checkId(r.id, p);
      ref(seasons, r.season, `${p}.season`);
      listOr(r.base, topTypeIds, `${p}.base`, ['any']);
      listOr(r.mid, midTypeIds, `${p}.mid`, ['none']);
      listOr(r.outer, outerTypeIds, `${p}.outer`, ['any', 'none']);
      if (!inRange(r.score, 1, 5)) err('V-30', p, `score 범위 오류: ${r.score}`);
      if (!['classic', 'variation', 'block'].includes(r.tag)) err('V-30', p, `tag 오류: ${r.tag}`);
      if (r.season === 'summer' && r.mid !== 'none' && !(r.score === 1 && r.tag === 'block')) err('V-30', p, '여름 미드 행은 score 1·block이어야 함');
      src(r.sources, p);
    });
    twoOuterRules.forEach((r, i) => {
      const p = `twoOuterRules[${i}](${r.id})`;
      checkId(r.id, p);
      ref(seasons, r.season, `${p}.season`);
      listOr(r.inner, outerTypeIds, `${p}.inner`, ['any']);
      listOr(r.outer, outerTypeIds, `${p}.outer`, ['any']);
      if (!inRange(r.score, 1, 5)) err('V-30', p, `score 범위 오류: ${r.score}`);
      src(r.sources, p);
    });
    // ---- V-31 outfits.styles[]·occasions[] = 재계산 (손 태깅 탐지)
    let idx = null;
    try { idx = buildIndex(data); } catch (e) { err('V-31', 'data', `buildIndex 실패: ${e.message}`); }
    if (idx) outfits.forEach((o, i) => {
      const p = `outfits[${i}](${o.id})`;
      const want = JSON.stringify(styleTags(styleVector(idx, o), idx));
      const got = JSON.stringify(o.styles ?? null);
      if (want !== got) err('V-31', p, `styles[] 재계산 불일치: 기록 ${got} ≠ 계산 ${want}`);
      const wantO = JSON.stringify(occasionFit(idx, o)); const gotO = JSON.stringify(o.occasions ?? null);
      if (wantO !== gotO) err('V-31', p, `occasions[] 재계산 불일치: 기록 ${gotO} ≠ 계산 ${wantO}`);
    });
    // ---- V-32 labels
    const needCx = [];
    styles.forEach((s) => { needCx.push(`style.${s.id}`, `explain.style.${s.id}`); });
    occasions.forEach((o) => needCx.push(`occasion.${o.id}`));
    patterns.forEach((pt) => needCx.push(`pattern.${pt.id}`));
    midTypes.forEach((m) => needCx.push(`midType.${m.id}`));
    accessoryTypes.forEach((a) => needCx.push(`accessory.${a.id}`));
    if (cats.has('mid')) needCx.push('category.mid');
    for (const id of needCx) if (!labelIds.has(id)) err('V-32', 'labels', `label 없음: ${id}`);
  }

  return issues;
}
