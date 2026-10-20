// npm run build:data — docs/research/*.md 표 → src/data/*.json (docs/architecture/data-schema.md 형식)
// 결정적 출력: 같은 입력이면 같은 JSON. 변환 로그는 docs/architecture/data-conversion-log.md에 수기로 반영한다.
// Phase 6-B (CX): docs/phase6/content-expansion-data.md 표 → 확장 JSON 10개 + enums 확장 + outfits.styles[]·occasions[] 계산(src/engine/style.js, V-31)
import { writeJson, Log, SEASON_ORDER } from './build/util.mjs';
import { buildColors, buildToneRules, buildColorRules } from './build/r1.mjs';
import * as r2 from './build/r2.mjs';
import { buildOutfits, MERGE_PAIRS } from './build/outfits.mjs';
import { buildLabels } from './build/labels.mjs';
import { R2_CODES, CX_CODES } from './build/sources.mjs';
import { buildExpansion } from './build/styles.mjs';
import { buildIndex } from '../src/engine/lookup.js';
import { styleVector, styleTags, occasionFit } from '../src/engine/style.js';

const log = new Log();
const colors = buildColors();
const toneRules = buildToneRules();
const colorRules = buildColorRules(log);
const materials = r2.buildMaterials();
const matRules = r2.buildMatRules(log);
const fitRules = r2.buildFitRules();
const lengthRules = r2.buildLengthRules();
const shoes = r2.buildShoes();
const shoeRules = r2.buildShoeRules(log);
const formality = r2.buildFormality();
const outerRules = r2.buildOuterRules();
const layerRules = r2.buildLayerRules();
const adjust = r2.buildAdjust();
const outfitsRaw = buildOutfits({ colorRules, colors }, log);
const exp = buildExpansion();
const labels = buildLabels(exp);

const enums = {
  categories: ['top', 'bottom', 'shoes', 'outer', 'mid'], // D-3: mid 5번째 카테고리
  seasons: [...SEASON_ORDER],
  tones: ['neutral', 'earth', 'mono', 'navyBase', 'accent', 'pastel'],
  topFits: r2.TOP_FITS,
  bottomFits: r2.BOTTOM_FITS,
  topLengths: ['crop', 'regular', 'long'],
  outerLengths: ['short', 'regular', 'long'],
  trouserLengths: r2.TROUSER_LENGTHS,
  tags: ['neutral', 'earth', 'mono', 'navyBase', 'accent', 'pastel', 'variation', 'street', 'business', 'weekend', 'resort', 'layering', 'pattern'],
  topTypes: r2.TOP_TYPES.map(({ id, labelKo, material, formality: f }) => ({ id, labelKo, material, formality: f })),
  outerTypes: r2.OUTER_TYPES.map(({ id, labelKo, length, material, formality: f, formalityNote, seasons }) => ({ id, labelKo, length, material, formality: f, formalityNote, seasons })),
  // Phase 6-B (CX)
  styles: exp.styles.map((s) => s.id),
  occasions: exp.occasions.map((o) => o.id),
  patterns: exp.patterns.map((p) => p.id),
  midTypes: exp.midTypes.map((m) => m.id),
  accessoryTypes: exp.accessoryTypes.map((a) => a.id),
  accessoryGroups: [...new Set(exp.accessoryTypes.map((a) => a.group))],
};

// outfits.styles[]·occasions[] — 손 태깅 금지, 엔진 함수로 계산 (content-expansion 6-4)
const dataForIndex = { enums, colors, toneRules, colorRules, materials, matRules, fitRules, lengthRules, shoes, shoeRules, formality, outerRules, layerRules, adjust, outfits: outfitsRaw, labels, ...exp };
const index = buildIndex(dataForIndex);
const outfits = outfitsRaw.map(({ id, mergedFrom, items, seasons, tags, isClassic, universal, sources, flags, note }) => {
  const o = { id, mergedFrom, items, seasons, tags, isClassic, universal, sources, flags, note };
  const sv = styleVector(index, o);
  return { id, mergedFrom, items, seasons, tags, isClassic, universal, styles: styleTags(sv, index), occasions: occasionFit(index, o), sources, flags, note };
});

const files = { enums, colors, toneRules, colorRules, materials, matRules, fitRules, lengthRules, shoes, shoeRules, formality, outerRules, layerRules, adjust, outfits, 'labels.ko': labels, ...exp };
let total = 0;
const counts = [];
for (const [name, value] of Object.entries(files)) {
  const bytes = writeJson(`src/data/${name}.json`, value);
  total += bytes;
  const n = Array.isArray(value) ? value.length : Object.keys(value).length;
  counts.push(`${name}.json: ${n} ${Array.isArray(value) ? '레코드' : '키'} (${(bytes / 1024).toFixed(1)} KB)`);
}

const matchCount = colorRules.reduce((a, r) => a + r.matches.length, 0);
console.log('== counts');
for (const c of counts) console.log('  ' + c);
console.log(`  colorRules matches 합계: ${matchCount}, avoid 합계: ${colorRules.reduce((a, r) => a + r.avoid.length, 0)}`);
console.log(`  shoeRules bottoms 합계: ${shoeRules.reduce((a, r) => a + r.bottoms.length, 0)}, lengths: ${shoeRules.reduce((a, r) => a + r.lengths.length, 0)}`);
console.log(`  outfits: ${outfits.length} (universal ${outfits.filter((o) => o.universal).length}, 병합 ${MERGE_PAIRS.length}쌍)`);
console.log(`  총 용량 ${(total / 1024).toFixed(1)} KB`);
// Phase 6-B: 스타일 태그·상황 분포 (게이트 5·6 자료)
const styleCount = Object.fromEntries(enums.styles.map((s) => [s, 0]));
const dominantCount = Object.fromEntries(enums.styles.map((s) => [s, 0]));
for (const o of outfits) { for (const t of o.styles) styleCount[t.id]++; if (o.styles[0]) dominantCount[o.styles[0].id]++; }
const occCount = Object.fromEntries(enums.occasions.map((s) => [s, 0]));
for (const o of outfits) for (const t of o.occasions) occCount[t]++;
console.log('== styles (태그 수 / dominant 수, 전체 ' + outfits.length + ')');
for (const s of enums.styles) console.log(`  ${s}: ${styleCount[s]} (${(100 * styleCount[s] / outfits.length).toFixed(0)}%) / dominant ${dominantCount[s]}`);
console.log(`  태그 없는 코디: ${outfits.filter((o) => !o.styles.length).length}`);
console.log('== occasions');
for (const s of enums.occasions) console.log(`  ${s}: ${occCount[s]}`);
console.log(`  상황 없는 코디: ${outfits.filter((o) => !o.occasions.length).length}`);
const seen = new Set();
for (const kind of ['dropped', 'override', 'nosource', 'dup', 'matAsym', 'matMissing', 'approx', 'colorAssigned', 'outfit']) {
  const items = log.byKind(kind).filter((m) => !seen.has(kind + m) && seen.add(kind + m));
  if (!items.length) continue;
  console.log(`== ${kind} (${items.length})`);
  for (const m of items) console.log('  ' + m);
}
if (process.argv.includes('--codes')) { console.log('== R2 codes'); for (const [k, v] of Object.entries(R2_CODES)) console.log(`  ${k}: ${v}`); console.log('== CX codes'); for (const [k, v] of Object.entries(CX_CODES)) console.log(`  ${k}: ${v}`); }
