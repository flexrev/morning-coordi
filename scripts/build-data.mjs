// npm run build:data — docs/research/*.md 표 → src/data/*.json (docs/architecture/data-schema.md 형식)
// 결정적 출력: 같은 입력이면 같은 JSON. 변환 로그는 docs/architecture/data-conversion-log.md에 수기로 반영한다.
import { writeJson, Log, SEASON_ORDER } from './build/util.mjs';
import { buildColors, buildToneRules, buildColorRules } from './build/r1.mjs';
import * as r2 from './build/r2.mjs';
import { buildOutfits, MERGE_PAIRS } from './build/outfits.mjs';
import { buildLabels } from './build/labels.mjs';
import { R2_CODES } from './build/sources.mjs';

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
const outfits = buildOutfits({ colorRules, colors }, log);
const labels = buildLabels();

const enums = {
  categories: ['top', 'bottom', 'shoes', 'outer'],
  seasons: [...SEASON_ORDER],
  tones: ['neutral', 'earth', 'mono', 'navyBase', 'accent', 'pastel'],
  topFits: r2.TOP_FITS,
  bottomFits: r2.BOTTOM_FITS,
  topLengths: ['crop', 'regular', 'long'],
  outerLengths: ['short', 'regular', 'long'],
  trouserLengths: r2.TROUSER_LENGTHS,
  tags: ['neutral', 'earth', 'mono', 'navyBase', 'accent', 'pastel', 'variation', 'street', 'business', 'weekend', 'resort'],
  topTypes: r2.TOP_TYPES.map(({ id, labelKo, material, formality: f }) => ({ id, labelKo, material, formality: f })),
  outerTypes: r2.OUTER_TYPES.map(({ id, labelKo, length, material, formality: f, formalityNote, seasons }) => ({ id, labelKo, length, material, formality: f, formalityNote, seasons })),
};

const files = { enums, colors, toneRules, colorRules, materials, matRules, fitRules, lengthRules, shoes, shoeRules, formality, outerRules, layerRules, adjust, outfits, 'labels.ko': labels };
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
const seen = new Set();
for (const kind of ['dropped', 'override', 'nosource', 'dup', 'matAsym', 'matMissing', 'approx', 'colorAssigned', 'outfit']) {
  const items = log.byKind(kind).filter((m) => !seen.has(kind + m) && seen.add(kind + m));
  if (!items.length) continue;
  console.log(`== ${kind} (${items.length})`);
  for (const m of items) console.log('  ' + m);
}
if (process.argv.includes('--codes')) { console.log('== R2 codes'); for (const [k, v] of Object.entries(R2_CODES)) console.log(`  ${k}: ${v}`); }
