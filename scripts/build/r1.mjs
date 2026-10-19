// R1 color-rules.md → colors.json / toneRules.json / colorRules.json
import { readDoc, readTable, sortSeasons, SEASON_ORDER } from './util.mjs';
import { extractSources } from './sources.mjs';

const doc = readDoc('docs/research/color-rules.md');
const lines = doc.split(/\r?\n/);

// ---------------------------------------------------------------- 톤 그룹 (data-schema 2-3)
export const TONE_GROUPS = [
  { id: 'neutral', labelKo: '뉴트럴', colors: ['white', 'offWhite', 'cream', 'oatmeal', 'beige', 'lightGrey', 'midGrey', 'charcoal', 'black', 'navy', 'khaki', 'tan', 'brown', 'olive', 'lightBlue'], note: '옷장의 뼈대. 서로 거의 다 섞임' },
  { id: 'earth', labelKo: '어스톤', colors: ['beige', 'khaki', 'tan', 'camel', 'brown', 'chocolate', 'olive', 'sage', 'rust', 'taupe', 'oatmeal'], note: '따뜻하고 탁한 자연색. 서로 톤온톤이 쉬움' },
  { id: 'mono', labelKo: '모노톤', colors: ['white', 'lightGrey', 'greyMelange', 'midGrey', 'charcoal', 'black', 'blackDenim'], note: '무채색. 명도 차이·질감으로 변화를 줘야 함' },
  { id: 'navyBase', labelKo: '네이비 베이스', colors: ['navy', 'indigo', 'midDenim', 'lightDenim', 'lightBlue', 'skyBlue'], note: '블루 계열 톤온톤. 가장 실패가 적은 기반색' },
  { id: 'accent', labelKo: '포인트 컬러', colors: ['burgundy', 'rust', 'mustard', 'forestGreen', 'teal'], note: '한 아이템에만, 전체의 10~30% 이내' },
  { id: 'pastel', labelKo: '파스텔', colors: ['lightBlue', 'skyBlue', 'dustyPink', 'lavender', 'sage', 'lightDenim', 'cream'], note: '봄·여름용 저채도 밝은 색. 뉴트럴 위에 얹음' },
];
const TONE_ORDER = TONE_GROUPS.map((g) => g.id);
const tonesOf = (id) => TONE_ORDER.filter((t) => TONE_GROUPS.find((g) => g.id === t).colors.includes(id));

// ---------------------------------------------------------------- colors (R1 1장 + data-schema 2-4)
const SEASONS_BY_COLOR = {
  // data-schema 2-4 (R1 6장 반영). P3-14: lightBlue +winter(R1 7장 c16/o10 겨울 universal, 3장 '거의 모두에게 무난'), cream +summer(R1 6장 첫 표 여름 기본 뉴트럴에 cream 포함)
  white: 'all', offWhite: 'all', cream: 'all', oatmeal: 'sw', beige: 'all', khaki: 'all', tan: 'all', camel: 'sw',
  brown: 'all', chocolate: 'sw', lightGrey: 'ss', greyMelange: 'all', midGrey: 'all', charcoal: 'all', black: 'all',
  navy: 'all', indigo: 'all', midDenim: 'all', lightDenim: 'ss', blackDenim: 'sw', lightBlue: 'all', skyBlue: 'ss',
  olive: 'all', forestGreen: 'sw', sage: 'ss', burgundy: 'sw', rust: 'sw', mustard: 'all', dustyPink: 'ss',
  lavender: 'ss', teal: 'all', taupe: 'sw',
};
const SEASON_SETS = { all: [...SEASON_ORDER], sw: ['springFall', 'winter'], ss: ['springFall', 'summer'] };
const SEASON_NOTES = {
  mustard: '봄가을 중심(가을 포인트)', teal: '봄가을 중심', dustyPink: '봄 파스텔', sage: '봄 파스텔',
  cream: '겨울은 니트로, 여름은 치노·린넨', chocolate: '한겨울 중량 색', lightDenim: '겨울엔 계절감 어긋남', lightBlue: '옥스포드 셔츠색(연중)',
};
const HEX_SOURCE = (note) => (/근사|CSS 'darkgray' 근사/.test(note) ? 'approx' : /Wikipedia/.test(note) ? 'wikipedia' : 'css');

export function buildColors() {
  const start = lines.findIndex((l) => l.startsWith('## 1. 표준 컬러 어휘'));
  const { rows } = readTable(lines, start);
  const colors = rows.map((r) => {
    const [id, name, hex, , note] = r;
    const m = name.match(/^(.+?)\((.+)\)$/);
    const labelKo = m ? m[1].trim() : name;
    const labelEn = m ? m[2].trim() : name;
    return {
      id,
      labelKo,
      labelEn,
      hex: hex.toUpperCase(),
      hexSource: HEX_SOURCE(note),
      tones: tonesOf(id),
      seasons: SEASON_SETS[SEASONS_BY_COLOR[id]],
      seasonNote: SEASON_NOTES[id] ?? null,
      note: note || '',
    };
  });
  return colors;
}

// ---------------------------------------------------------------- toneRules (R1 2-2, 3장, 9-3)
export function buildToneRules() {
  return {
    groups: TONE_GROUPS,
    rules: [
      { id: 'T1', from: 'neutral', to: 'neutral', modifier: 0, note: '뉴트럴+뉴트럴은 항상 OK. 같은 그룹 내 명도 차를 둘 것(올화이트·올그레이 주의)', sources: ['RMRS1', 'MF', 'FB3'], flags: [] },
      { id: 'T2', from: 'earth', to: 'earth', modifier: 0, note: '어스+어스 = 톤온톤. 밝은 색을 한 점 끼우면 깔끔', sources: ['VK2', 'AtG1', 'WK2'], flags: [] },
      { id: 'T3', from: 'earth', to: 'navyBase', modifier: 1, note: '가장 안정적인 교차 조합. 블루-브라운 보색 원리', sources: ['GG', 'Acorn', 'Celio'], flags: [] },
      { id: 'T4', from: 'mono', to: 'navyBase', modifier: 0, note: '가능. 블랙과 네이비는 명도 차가 분명한 네이비를 쓸 것', sources: ['MRP', 'FB4', 'Esq'], flags: ['disputed'] },
      { id: 'T5', from: 'mono', to: 'earth', modifier: -1, limitColors: ['black', 'blackDenim'], note: '모노(블랙)+어스는 조건부. 블랙+브라운 가죽 혼용 금지. 블랙 상의+카멜 코트 같은 큰 면적 대비는 럭셔리. limitColors: 블랙 계열일 때만 적용(P3-09: 차콜은 초콜릿 더비·카멜 코트가 R1 classic이라 제외)', sources: ['MM', 'WH2', 'VK2'], flags: ['disputed'] },
      { id: 'T6', from: 'accent', to: 'accent', modifier: 0, note: '포인트 컬러는 1개만. 감점(−2)은 toneRules.accentAccent 상수로 한 번만 적용', sources: ['Vou1', 'WH1', 'RMRS1'], flags: [] },
      { id: 'T7', from: 'pastel', to: 'neutral', modifier: 0, note: '파스텔은 뉴트럴 하의 위에 상의로', sources: ['WH1', 'AtG1'], flags: [] },
      { id: 'T8', from: 'mono', to: 'mono', modifier: 0, note: '무채색을 섞을 때 가죽(신발·벨트)은 한 색으로 통일', sources: ['WH2', 'MM'], flags: [] },
      { id: 'T9', from: 'pastel', to: 'pastel', modifier: 0, note: '탁한 색은 여러 개 섞여도 괜찮지만 파스텔끼리 두 개 이상은 변주. 선명한 색은 하나만', sources: ['WH1', 'RMRS 색상환'], flags: [] },
    ],
    sameColorTopBottom: -2,
    accentAccent: -2,
    hue: {
      analogous: [
        { id: 'blue', labelKo: '블루 계열', colors: ['navy', 'indigo', 'midDenim', 'lightDenim', 'lightBlue', 'skyBlue', 'lavender'] },
        { id: 'green', labelKo: '그린 계열', colors: ['olive', 'sage', 'mustard', 'forestGreen'] },
        { id: 'brown', labelKo: '브라운 계열', colors: ['brown', 'rust', 'camel', 'tan', 'chocolate', 'taupe', 'beige', 'khaki', 'oatmeal'] }, // P3-15: khaki는 황갈색(A15·4-5), beige·oatmeal은 브라운 계열 → 네이비 보색 관계가 보이게
      ],
      complementary: [
        { a: 'blue', b: 'brown', tag: 'classic', note: '인디고+러스트, 네이비+카멜', sources: ['WH1', 'GG'] },
        { a: 'green', b: 'burgundy', tag: 'classic', note: '올리브+버건디', sources: ['WH1'] },
        { a: 'charcoal', b: 'mustard', tag: 'variation', note: '', sources: ['RMRS 색상환'] },
      ],
      achromatic: ['white', 'offWhite', 'lightGrey', 'greyMelange', 'midGrey', 'charcoal', 'black', 'blackDenim'],
    },
  };
}

// ---------------------------------------------------------------- colorRules (R1 4·5·8장)
const COLOR_IDS = new Set(Object.keys(SEASONS_BY_COLOR));

/** "brown / chocolate (부츠·로퍼)" → { colors:[...], dropped:[...], note } */
function parseColorCell(cell) {
  let note = '';
  const text = cell.replace(/\(([^)]*)\)/g, (_, n) => { note = note ? `${note}; ${n}` : n; return ''; }).trim();
  const tokens = text.split('/').map((t) => t.trim()).filter(Boolean);
  const colors = [];
  const dropped = [];
  for (const t of tokens) (COLOR_IDS.has(t) ? colors : dropped).push(t);
  return { colors, dropped, note };
}

/** 8장 우선 덮어쓰기 + 플래그: key = `${base}|${baseCategory}|${category}|${color}` */
const A_OVERRIDES = {
  'indigo|bottom|shoes|black': { ruleId: 'A3', disputed: true },
  'lightDenim|bottom|shoes|black': { ruleId: 'A3', disputed: true },
  'white|bottom|shoes|black': { ruleId: 'A4', disputed: true },
  'midGrey|bottom|top|midGrey': { score: 1, ruleId: 'A5' },
  'charcoal|bottom|top|lightGrey': { score: 3, ruleId: 'A5' },
  'olive|bottom|top|olive': { ruleId: 'A6' },
  'charcoal|bottom|shoes|tan': { ruleId: 'A7', disputed: true },
  'indigo|bottom|outer|indigo': { ruleId: 'A8' },
  'navy|bottom|top|navy': { ruleId: 'A8' },
  'olive|bottom|top|rust': { ruleId: 'A9', disputed: true },
  'blackDenim|bottom|top|navy': { score: 3, tag: 'variation', ruleId: 'A1', disputed: true },
  'blackDenim|bottom|outer|navy': { ruleId: 'A1', disputed: true }, // P3 disputed #6: A1 '네이비 봄버+블랙 진 ✔'(MRP) → 표 값 4 classic 유지
  'navy|bottom|top|black': { ruleId: 'A1', disputed: true },
  'navy|bottom|outer|black': { ruleId: 'A1', disputed: true },
  'black|bottom|top|navy': { ruleId: 'A1', disputed: true },
  'black|bottom|outer|navy': { ruleId: 'A1', disputed: true },
  'navy|top|bottom|black': { ruleId: 'A1', disputed: true },
  'navy|top|bottom|blackDenim': { ruleId: 'A1', disputed: true },
  'black|top|bottom|navy': { ruleId: 'A1', disputed: true },
  'black|bottom|shoes|chocolate': { ruleId: 'A2', disputed: true },
  'blackDenim|bottom|shoes|brown': { ruleId: 'A2', disputed: true },
  'blackDenim|bottom|shoes|chocolate': { ruleId: 'A2', disputed: true },
  'white|bottom|top|white': { ruleId: 'A12' },
  'white|top|bottom|white': { ruleId: 'A12' },
  // A12 올블랙: 표(4·5)와 8장(2)이 충돌하지만 adjSameColorTopBottom(−2)이 같은 내용을 스타일 축에서 이미 감점하므로 점수는 표 값 유지, 플래그만
  'black|top|bottom|black': { score: 4, ruleId: 'A12', disputed: true }, // P3 disputed #21: 4-11 표(4)와 대칭
  'black|bottom|top|black': { ruleId: 'A12', disputed: true },
  // P3 disputed #13·#25: avoid(브라운 바지+그린 상의, HB)와 match 3이 모순 → 2(경고, 후보 생성 제외)
  'brown|bottom|top|olive': { score: 2, tag: 'variation', ruleId: 'P3-13' },
  'olive|top|bottom|brown': { score: 2, tag: 'variation', ruleId: 'P3-25' },
  // P3 6절: black→burgundy 4 classic은 5-10 burgundy→black 3 variation과 비대칭 → 3 variation
  'black|bottom|top|burgundy': { score: 3, tag: 'variation', ruleId: 'P3-6' },
  // P3-06: 카키+올리브+브라운 흙탕(4-5 피하기) → avoid 구조화 + 2
  'khaki|bottom|top|olive': { score: 2, tag: 'variation', ruleId: 'P3-06' },
  'greyMelange|top|bottom|midGrey': { ruleId: 'A5' },
  'olive|top|bottom|olive': { ruleId: 'A6' },
};
/** 괄호 출처가 없는 행의 수동 출처 보강 */
const SOURCE_FIX = {
  'indigo|bottom|shoes|black': ['GG', 'FB1', 'Allure'],
  'white|bottom|shoes|black': ['FB2', 'AtG3', 'VK1'],
};
/** 8장 A6 제안: olive→sage 3 (표에 없어 추가) */
const EXTRA_MATCHES = {
  'olive|bottom': [{ category: 'top', color: 'sage', score: 3, tag: 'variation', sources: ['FB3'], flags: [], note: '그린 톤온톤은 명도·채도 차가 클 때만', ruleId: 'A6' }],
  // P3-18 (V-18 규칙 누락 3쌍): R1·R2 코디에는 있으나 표에 없던 쌍. 출처 C2 = 변환 담당 판단
  'blackDenim|bottom': [{ category: 'top', color: 'midGrey', score: 4, tag: 'classic', sources: ['FB1', 'C2'], flags: [], note: '모노 톤온톤(R1 c09 미드 그레이 니트+블랙 데님). 4-3 greyMelange/lightGrey 5와 같은 계열' }],
  'beige|bottom': [{ category: 'outer', color: 'indigo', score: 4, tag: 'classic', sources: ['R2 6', 'C2'], flags: [], note: '데님 재킷+치노(R2 6-1 5점, s02)' }],
  'indigo|bottom': [{ category: 'top', color: 'forestGreen', score: 3, tag: 'variation', sources: ['AtG1', 'C2'], flags: [], note: '브라운 코트 변주(R1 c29 괄호 변주)' }],
};

const AVOIDS = {
  'indigo|bottom': [
    { category: 'outer', color: 'indigo', reason: '같은 워시의 데님 재킷은 유니폼처럼 보임', sources: ['AtG3'], ruleId: 'A8' },
    { category: null, color: null, reason: '4색 이상', sources: ['Vou1'], ruleId: 'A11' },
  ],
  'lightDenim|bottom': [
    { category: 'shoes', color: 'black', reason: '연청+블랙 구두는 무거움', sources: ['MSR', 'GG'], ruleId: 'A3' },
    { category: null, color: null, reason: '연청+배기핏(핏이 더 중요), 포멀 자리', sources: ['PM'], ruleId: null },
  ],
  'blackDenim|bottom': [
    { category: 'top', color: 'black', reason: '여름 블랙 셔츠+블랙 데님은 너무 어둡고 웨이터 느낌', sources: ['FB1'], ruleId: 'A13' },
    { category: null, color: null, reason: '스키니 핏, 블랙 데님+브라운 벨트+블랙 신발(가죽 불일치)', sources: ['FB1'], ruleId: 'A2' },
  ],
  'beige|bottom': [
    { category: null, color: null, reason: '올베이지(명도 차 없이). 베이지+화이트 셔츠+탄 신발만으로는 밋밋 → 한 점 어두운 색 필요', sources: ['WK2'], ruleId: null },
  ],
  'khaki|bottom': [
    { category: 'top', color: 'olive', reason: '카키+올리브+브라운 셋 다 비슷한 명도(흙탕)', sources: ['R1'], ruleId: null }, // P3-06 구조화
    { category: 'shoes', color: 'black', reason: '카키+블랙 구두 캐주얼은 무거움', sources: ['R1'], ruleId: null },
  ],
  'navy|bottom': [
    { category: 'outer', color: 'navy', reason: '네이비 수트 재킷+네이비 치노는 세트처럼 보이는 불일치 수트', sources: ['GG'], ruleId: 'A8' },
  ],
  'midGrey|bottom': [
    { category: 'top', color: 'midGrey', reason: '그레이 셔츠+그레이 바지는 dull and dreary', sources: ['RMRS2'], ruleId: 'A5' },
    { category: 'outer', color: 'midGrey', reason: '그레이 재킷+그레이 플란넬 = 불일치 수트', sources: ['RMRS2'], ruleId: 'A5' },
    { category: 'shoes', color: 'tan', reason: '노란기 있는 브라운 구두', sources: ['Dapp'], ruleId: null },
  ],
  'charcoal|bottom': [
    { category: 'top', color: 'forestGreen', reason: '차콜+다크그린은 뭉개짐', sources: ['MF'], ruleId: null },
    { category: 'shoes', color: 'tan', reason: '차콜+월넛/탄 구두', sources: ['Dapp', 'Fitville'], ruleId: 'A7' },
    { category: null, color: null, reason: '올차콜', sources: ['R1'], ruleId: 'A5' },
  ],
  'olive|bottom': [
    { category: 'top', color: 'olive', reason: '그린온그린', sources: ['MM'], ruleId: 'A6' },
    { category: 'top', color: 'forestGreen', reason: '그린온그린', sources: ['MM'], ruleId: 'A6' },
    { category: null, color: null, reason: '형광 블루·오렌지, 블랙 가죽+브라운 가죽 혼용', sources: ['MM'], ruleId: 'A2' },
  ],
  'brown|bottom': [
    { category: 'top', color: 'olive', reason: '브라운 바지+그린 상의', sources: ['HB'], ruleId: null },
    { category: null, color: null, reason: '코듀로이+텍스처 재킷+패턴 베스트 과적재', sources: ['GG'], ruleId: null },
  ],
  'black|bottom': [
    { category: 'shoes', color: 'chocolate', reason: '블랙 바지+브라운 구두(가죽 통일 원칙)', sources: ['WH2'], ruleId: 'A2' },
    { category: 'outer', color: 'navy', reason: '네이비 재킷+블랙 수트 바지는 사고처럼 보임', sources: ['MRP'], ruleId: 'A1' },
  ],
  'white|bottom': [
    { category: 'top', color: 'white', reason: '화이트온화이트 정확히 같은 흰색', sources: ['AtG3'], ruleId: 'A12' },
    { category: null, color: null, reason: '로우 데님 염색 이염. 겨울엔 크림이 화이트보다 쉬움', sources: ['AtG3', 'PS3'], ruleId: null },
  ],
  'cream|bottom': [
    { category: null, color: null, reason: '겨울엔 크림이 화이트보다 쉬움', sources: ['PS3'], ruleId: null },
  ],
};

/** 근거 셀에서 출처 괄호·⚠ 제거 — P3-21: 괄호를 지우며 생긴 " ." " ;" 를 붙이고, ⚠ 자리의 문장 경계를 복원 */
const cleanBasis = (basis) => basis.replace(/\[[^\]]*\]/g, '').replace(/⚠\s*(이견:?)?/g, '').replace(/\s+/g, ' ').replace(/\s+([.;,])/g, '$1').trim();
/** P3 4절: 원문 자체가 "⚠"로 끝나 불완전한 문장의 수기 보정 (끝 문자열 일치) */
const NOTE_FIX = [
  ['블랙+브라운 가죽 혼용은', '블랙+브라운 가죽 혼용은 의견이 갈림(벨트·신발 가죽 통일 권장)'],
  ["MM은 '블랙+어스톤 덜 어울림' 단서도", "MM은 '블랙+어스톤 덜 어울림' 단서도 있음"],
  ['뉴트럴·쿨톤 상의와', '뉴트럴·쿨톤 상의와 함께'],
  ['올화이트는 씻겨 보임, 오프화이트로', '올화이트는 씻겨 보임, 오프화이트로 대체'],
  ['밀리터리 니트와', '밀리터리 니트와 함께'],
  ['비추 PS도', '비추. PS도'],
  ['질감 차 FB3:', '질감 차. FB3:'],
];
function fixNote(note) {
  let n = note;
  for (const [from, to] of NOTE_FIX) {
    if (n.endsWith(from)) n = n.slice(0, -from.length) + to;
    else if (n.includes(from) && !n.includes(to)) n = n.replace(from, to);
  }
  return n;
}

function makeMatch(category, color, score, tag, sources, flags, note, ruleId) {
  const m = { category, color, score, tag, sources, flags, note };
  if (ruleId) m.ruleId = ruleId;
  return m;
}

export function buildColorRules(log) {
  const records = [];
  const dropped = [];

  // ----- 4장 (bottom base)
  const sec4 = lines.findIndex((l) => l.startsWith('## 4.'));
  const sec5 = lines.findIndex((l) => l.startsWith('## 5.'));
  const sec6 = lines.findIndex((l) => l.startsWith('## 6.'));
  const headingRe = /^### (\d+)-(\d+)\. (.+)$/;
  for (let i = sec4; i < sec5; i++) {
    const h = lines[i].match(headingRe);
    if (!h) continue;
    const ids = [...h[3].matchAll(/`([a-zA-Z]+)`/g)].map((m) => m[1]);
    const labelKo = h[3].replace(/`[^`]*`/g, '').replace(/\(.*\)/g, '').replace(/\//g, '').trim();
    const matches = [];
    let j = i + 1;
    while (j < sec5 && !headingRe.test(lines[j])) {
      const sub = lines[j].match(/^\*\*(상의|신발|아우터)\*\*$/);
      if (sub) {
        const category = { 상의: 'top', 신발: 'shoes', 아우터: 'outer' }[sub[1]];
        const { rows, end } = readTable(lines, j + 1);
        for (const r of rows) {
          const [cell, scoreS, tag, basis] = r;
          const { colors, dropped: d, note: cellNote } = parseColorCell(cell);
          for (const x of d) dropped.push(`4장 ${ids.join('/')}·${category}: "${x}" (id 아님, 같은 행의 ${colors.join('/') || '없음'}만 사용)`);
          const score = Number(scoreS);
          const sources = extractSources(basis);
          const flags = /⚠/.test(basis) ? ['disputed'] : [];
          const note = fixNote([cellNote, cleanBasis(basis)].filter(Boolean).join(' — '));
          for (const color of colors) matches.push(makeMatch(category, color, score, tag, sources, flags, note));
        }
        j = end;
        continue;
      }
      j++;
    }
    for (const base of ids) records.push({ base, baseCategory: 'bottom', variant: null, labelKo: ids.length > 1 ? null : labelKo, matches: matches.map((m) => ({ ...m, sources: [...m.sources], flags: [...m.flags] })), avoid: AVOIDS[`${base}|bottom`] ?? [] });
  }

  // ----- 5장 (top base)
  for (let i = sec5; i < sec6; i++) {
    const h = lines[i].match(headingRe);
    if (!h) continue;
    const ids = [...h[3].matchAll(/`([a-zA-Z]+)`/g)].map((m) => m[1]);
    const num = Number(h[2]);
    const { rows } = readTable(lines, i + 1);
    const matches = [];
    for (const r of rows) {
      const [bCell, bScore, bTag, basis, sCell, sScore, sTag] = r;
      if (bCell) {
        const { colors, dropped: d, note: cellNote } = parseColorCell(bCell);
        for (const x of d) dropped.push(`5장 ${ids.join('/')}·bottom: "${x}" (id 아님, 같은 행의 ${colors.join('/') || '없음'}만 사용)`);
        const sources = extractSources(basis);
        const flags = /⚠/.test(basis) ? ['disputed'] : [];
        const note = fixNote([cellNote, cleanBasis(basis)].filter(Boolean).join(' — '));
        for (const color of colors) matches.push(makeMatch('bottom', color, Number(bScore), bTag, sources, flags, note));
      }
      if (sCell) {
        const { colors, dropped: d, note: cellNote } = parseColorCell(sCell);
        for (const x of d) dropped.push(`5장 ${ids.join('/')}·shoes: "${x}"`);
        // 신발 열에는 근거가 없음 → 같은 베이스의 하의 근거 출처를 공유하지 않고 R1 판단 코드
        for (const color of colors) matches.push(makeMatch('shoes', color, Number(sScore), sTag, ['R1'], [], cellNote));
      }
    }
    let variant = null;
    let bases = ids;
    if (num === 8) { variant = 'bretonStripe'; bases = ['navy']; }
    if (num === 7) { variant = 'oxfordShirt'; }
    const labelKo = h[3].replace(/`[^`]*`/g, '').replace(/\(.*?\)/g, '').replace(/[/+]/g, '').trim();
    for (const base of bases) records.push({ base, baseCategory: 'top', variant, labelKo, matches: matches.map((m) => ({ ...m, sources: [...m.sources], flags: [...m.flags] })), avoid: [] });
  }

  // ----- 8장 덮어쓰기 + 출처 보강 + 추가 행 + 중복 제거
  for (const rec of records) {
    const extra = rec.variant ? [] : (EXTRA_MATCHES[`${rec.base}|${rec.baseCategory}`] ?? []);
    rec.matches.push(...extra.map((m) => ({ ...m, sources: [...m.sources], flags: [...m.flags] })));
    const seen = new Map();
    const out = [];
    for (const m of rec.matches) {
      const key = `${m.category}|${m.color}`;
      if (seen.has(key)) { log.add('dup', `${rec.base}|${rec.baseCategory}: ${key} 중복 — 첫 행 유지`); continue; }
      seen.set(key, true);
      if (!rec.variant) {
        const okey = `${rec.base}|${rec.baseCategory}|${key}`;
        const ov = A_OVERRIDES[okey];
        if (ov) {
          if (ov.score !== undefined && ov.score !== m.score) { log.add('override', `${okey}: score ${m.score}→${ov.score} (8장 ${ov.ruleId} 우선)`); m.score = ov.score; }
          if (ov.tag && ov.tag !== m.tag) { log.add('override', `${okey}: tag ${m.tag}→${ov.tag} (${ov.ruleId})`); m.tag = ov.tag; }
          if (ov.disputed && !m.flags.includes('disputed')) m.flags.push('disputed');
          m.ruleId = ov.ruleId;
        }
        if (SOURCE_FIX[okey]) m.sources = [...SOURCE_FIX[okey]];
      }
      if (m.sources.length === 0) { m.sources = ['R1']; log.add('nosource', `${rec.base}|${rec.baseCategory} ${key} (score ${m.score} ${m.tag}) — 출처 미기재 → ["R1"]`); }
      // V-06 정합성: variation은 ≤3, ≥4는 classic
      if (m.tag === 'variation' && m.score >= 4) { log.add('override', `${rec.base}|${rec.baseCategory} ${key}: variation인데 score ${m.score} → classic`); m.tag = 'classic'; }
      if (m.score <= 2 && m.tag === 'classic') { log.add('override', `${rec.base}|${rec.baseCategory} ${key}: classic인데 score ${m.score} → variation`); m.tag = 'variation'; }
      out.push(m);
    }
    rec.matches = out;
  }
  for (const d of dropped) log.add('dropped', d);
  return records;
}
