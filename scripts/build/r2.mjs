// R2 style-rules.md → materials / matRules / fitRules / lengthRules / shoes / shoeRules / formality / outerRules / layerRules / adjust
import { readDoc, readTable, camel, sortSeasons, SEASON_ORDER } from './util.mjs';

const doc = readDoc('docs/research/style-rules.md');
const lines = doc.split(/\r?\n/);
const find = (prefix) => lines.findIndex((l) => l.startsWith(prefix));

export const MATERIAL_IDS = ['denimIndigo', 'denimWashed', 'denimBlack', 'corduroy', 'chino', 'wool', 'flannel', 'knitCotton', 'knitWool', 'knitCashmere', 'linen', 'jersey', 'leather', 'nylonTech', 'tweed'];
export const SHOE_IDS = ['sneakerWhite', 'sneakerColor', 'running', 'loaferPenny', 'loaferTassel', 'derby', 'oxford', 'chelsea', 'workboot', 'chukka', 'sandal'];
export const TOP_FITS = ['slim', 'regular', 'loose', 'oversized'];
export const BOTTOM_FITS = ['slim', 'tapered', 'regular', 'straight', 'wide'];
export const TROUSER_LENGTHS = ['crop', 'nobreak', 'half', 'full'];

// ---------------------------------------------------------------- materials (R2 3-1 + data-schema 2-5)
const MAT = {
  denimIndigo: { labelKo: '인디고 데님', seasons: ['springFall', 'winter', 'summer'], seasonNote: '여름은 얇은 것만', weight: 'heavy', texture: 'rough', formality: 4, note: '가장 범용. 블레이저·니트·가죽과 모두 OK', flags: [] },
  denimWashed: { labelKo: '워시드 데님', seasons: ['springFall', 'summer'], seasonNote: null, weight: 'mid', texture: 'smooth', formality: 3, note: '캐주얼 전용. 옥스포드·플란넬 재킷과 충돌', flags: [] },
  denimBlack: { labelKo: '블랙 데님', seasons: ['springFall', 'winter'], seasonNote: null, weight: 'mid', texture: 'smooth', formality: 5, note: '블랙 가죽 신발·첼시 부츠와 최상. 도시적', flags: [] },
  corduroy: { labelKo: '코듀로이', seasons: ['springFall', 'winter'], seasonNote: '봄가을은 늦가을', weight: 'heavy', texture: 'fuzzy', formality: 4, note: "울 니트·트위드·플란넬 등 '보송한' 질감과 묶음. 린넨 금지", flags: [] },
  chino: { labelKo: '치노', seasons: ['springFall', 'summer', 'winter'], seasonNote: '겨울은 두꺼운 것', weight: 'light', texture: 'smooth', formality: 5, note: "사계절 기본. 무엇과도 무난하나 '밋밋' 경고", flags: [] },
  wool: { labelKo: '울 슬랙스', seasons: ['springFall', 'summer', 'winter'], seasonNote: '여름은 트로피컬 울', weight: 'mid', texture: 'smooth', formality: 7, note: '가장 드레시한 하의. 저지·러닝화와 격차 큼', flags: [] },
  flannel: { labelKo: '플란넬', seasons: ['winter', 'springFall'], seasonNote: '봄가을은 늦가을', weight: 'heavy', texture: 'fuzzy', formality: 7, note: '겨울 울 니트·캐시미어·트위드와 최상', flags: [] },
  knitCotton: { labelKo: '코튼 니트', seasons: ['springFall', 'summer'], seasonNote: '여름은 얇은 것', weight: 'light', texture: 'fuzzy', formality: 4, note: '치노·린넨·워시드 데님', flags: [] },
  knitWool: { labelKo: '울 니트', seasons: ['springFall', 'winter'], seasonNote: null, weight: 'mid', texture: 'fuzzy', formality: 5, note: '모든 겨울 하의와 OK. 가죽 재킷 안에', flags: [] },
  knitCashmere: { labelKo: '캐시미어 니트', seasons: ['winter', 'springFall'], seasonNote: null, weight: 'light', texture: 'smooth', formality: 7, note: '플란넬·울 슬랙스·블랙 데님. 워시드 데님·스웻과는 격차', flags: [] },
  linen: { labelKo: '린넨', seasons: ['summer', 'springFall'], seasonNote: '봄가을은 5·9월만', weight: 'light', texture: 'rough', formality: 4, note: '여름 전용. 울 니트·코듀로이·트위드·플란넬과 계절 충돌. 출처 갈림: 레이어링하면 가을도 가능(Sumissura)', flags: ['disputed'] },
  jersey: { labelKo: '저지/스웻', seasons: ['springFall', 'summer', 'winter'], seasonNote: null, weight: 'light', texture: 'smooth', formality: 2, note: '티셔츠·스웻. 데님·치노·나일론. 플란넬·옥스포드와 격차', flags: [] },
  leather: { labelKo: '가죽', seasons: ['springFall', 'winter'], seasonNote: null, weight: 'heavy', texture: 'glossy', formality: 5, note: '아우터로서 데님·울 니트·블랙 데님과 최상. 전신 가죽 금지', flags: [] },
  nylonTech: { labelKo: '나일론/테크', seasons: ['springFall', 'summer', 'winter'], seasonNote: '여름은 얇은 셸, 겨울은 패딩', weight: 'light', texture: 'glossy', formality: 3, note: '스웻·데님·치노. 플란넬·옥스포드와 격차', flags: [] },
  tweed: { labelKo: '트위드', seasons: ['winter', 'springFall'], seasonNote: '봄가을은 늦가을', weight: 'heavy', texture: 'rough', formality: 6, note: '코듀로이·플란넬·데님·울 니트. 린넨·저지 금지', flags: [] },
};
export function buildMaterials() {
  return MATERIAL_IDS.map((id) => ({ id, labelKo: MAT[id].labelKo, seasons: sortSeasons(MAT[id].seasons), seasonNote: MAT[id].seasonNote, weight: MAT[id].weight, texture: MAT[id].texture, formality: MAT[id].formality, note: MAT[id].note, flags: MAT[id].flags }));
}

// ---------------------------------------------------------------- matRules (R2 3-2 행렬 + 3-3 예외)
const MATRIX_COLS = ['denim', 'cord', 'chino', 'wool', 'flan', 'k_cot', 'k_wool', 'k_cash', 'linen', 'jersey', 'leather', 'nylon', 'tweed'];
const COL_TO_IDS = { denim: ['denimIndigo', 'denimWashed', 'denimBlack'], cord: ['corduroy'], chino: ['chino'], wool: ['wool'], flan: ['flannel'], k_cot: ['knitCotton'], k_wool: ['knitWool'], k_cash: ['knitCashmere'], linen: ['linen'], jersey: ['jersey'], leather: ['leather'], nylon: ['nylonTech'], tweed: ['tweed'] };
const ROW_TO_COL = { denim: 'denim', corduroy: 'cord', chino: 'chino', wool: 'wool', flannel: 'flan', knit_cotton: 'k_cot', knit_wool: 'k_wool', knit_cashmere: 'k_cash', linen: 'linen', jersey: 'jersey', leather: 'leather', nylon_tech: 'nylon', tweed: 'tweed' };
const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const expandMat = (tok) => (tok === 'denim' ? COL_TO_IDS.denim : [camel(tok)]);

export function buildMatRules(log) {
  // 행렬
  const { rows } = readTable(lines, find('### 3-2.'));
  const matrix = new Map(); // pairKey → score
  for (const r of rows) {
    const rowName = r[0].replace(/\*/g, '').trim();
    const col = ROW_TO_COL[rowName];
    const vals = r.slice(1).map(Number);
    MATRIX_COLS.forEach((c, i) => {
      for (const a of COL_TO_IDS[col]) for (const b of COL_TO_IDS[c]) matrix.set(pairKey(a, b), vals[i]);
    });
  }
  // 3-3 상세: proposals[pairKey] = [{from, score, note}]
  const { rows: rows33 } = readTable(lines, find('### 3-3.'));
  const proposals = new Map();
  const notes = new Map();
  const propose = (a, b, score, note, from) => {
    const k = pairKey(a, b);
    if (!proposals.has(k)) proposals.set(k, []);
    proposals.get(k).push({ from, score, note });
    if (note) notes.set(k, (notes.get(k) ? `${notes.get(k)}; ` : '') + note);
  };
  const itemRe = /([a-z_]+)\s+(\d)(?:\(([^)]*)\))?/g;
  for (const r of rows33) {
    const m = camel(r[0]);
    for (const cellIdx of [1, 2]) {
      const cell = r[cellIdx];
      let mm;
      while ((mm = itemRe.exec(cell))) {
        const [, tok, s, note] = mm;
        for (const b of expandMat(tok)) propose(m, b, Number(s), note ? `${MAT[m].labelKo}↔${MAT[b].labelKo}: ${note}` : '', m);
      }
    }
  }
  // 최종 점수: 3-3 제안이 있으면 그중 최소값(방향 비대칭 → 낮은 쪽), 없으면 행렬, 둘 다 없으면 3
  const EXPLICIT = { [pairKey('corduroy', 'wool')]: { score: 3, note: '매끈 워스티드 재킷+골덴 바지는 질감 충돌 2, 반대(코듀로이 재킷+울 바지)는 4 → 3으로 절충(P3-10: R1 c20 라이트블루 셔츠+브라운 코듀로이+네이비 블레이저가 GG·HB classic). 재킷이 워스티드면 2' } };
  const score = (a, b) => {
    const k = pairKey(a, b);
    if (EXPLICIT[k]) return EXPLICIT[k].score;
    const p = proposals.get(k);
    if (p && p.length) {
      const s = Math.min(...p.map((x) => x.score));
      if (new Set(p.map((x) => x.score)).size > 1) log.add('matAsym', `${k}: 방향별 ${p.map((x) => `${x.from}:${x.score}`).join(', ')} → ${s}`);
      return s;
    }
    if (matrix.has(k)) return matrix.get(k);
    log.add('matMissing', `${k}: 행렬·3-3 모두 없음 → 3`);
    return 3;
  };
  const AVOID_REASON = {
    [pairKey('denimIndigo', 'denimIndigo')]: "동일 톤 상하 '캐나디안 턱시도'",
    [pairKey('corduroy', 'corduroy')]: '전신 골덴',
    [pairKey('leather', 'leather')]: '전신 가죽',
  };
  return MATERIAL_IDS.map((m) => {
    const pairsWith = MATERIAL_IDS.map((b) => {
      const k = pairKey(m, b);
      const n = [EXPLICIT[k]?.note, notes.get(k)].filter(Boolean).join('; ');
      return { material: b, score: score(m, b), note: n };
    });
    const avoid = pairsWith.filter((p) => p.score <= 2).map((p) => ({ material: p.material, score: p.score, reason: AVOID_REASON[pairKey(m, p.material)] ?? (p.note || '포멀도·계절·질감 격차') }));
    return { material: m, pairsWith, avoid, seasons: sortSeasons(MAT[m].seasons) };
  });
}

// ---------------------------------------------------------------- fitRules (R2 1-2)
export function buildFitRules() {
  const { rows } = readTable(lines, find('### 1-2.'));
  return rows.map(([topFit, bottomFit, score, note]) => ({ topFit, bottomFit, score: Number(score), note, flags: topFit === 'slim' && bottomFit === 'slim' ? ['disputed'] : [] }));
}

// ---------------------------------------------------------------- lengthRules (R2 2-1~2-3)
export function buildLengthRules() {
  const out = [];
  for (const [kind, head] of [['top', '### 2-1.'], ['outer', '### 2-2.'], ['trouser', '### 2-3.']]) {
    const { rows } = readTable(lines, find(head));
    for (const [length, bottomFit, score, note] of rows) {
      out.push({ kind, length, bottomFit, score: Number(score), note, flags: kind === 'outer' && length === 'long' && bottomFit === 'wide' ? ['disputed'] : [] });
    }
  }
  return out;
}

// ---------------------------------------------------------------- shoes (R2 4-1 + data-schema 2-8)
const SHOE_META = {
  sneakerWhite: { labelKo: '흰 스니커즈', formality: 3, formalityNote: '캔버스형은 2', seasons: 'all', seasonNote: '겨울은 가죽형', socks: '흰·회 양말, 여름 페이크삭스', note: "2025 기본 신발. 미니멀 가죽형이 '클래식'", flags: [] },
  sneakerColor: { labelKo: '컬러 스니커즈', formality: 2, formalityNote: null, seasons: 'all', seasonNote: null, socks: '양말 색 포인트 가능', note: '레트로 러닝 실루엣. 와이드 데님·스웻과', flags: [] },
  running: { labelKo: '러닝화', formality: 1, formalityNote: null, seasons: 'all', seasonNote: null, socks: '스포츠 양말', note: '고프코어. 테일러드와는 격차 큼', flags: [] },
  loaferPenny: { labelKo: '페니 로퍼', formality: 6, formalityNote: null, seasons: 'all', seasonNote: '겨울은 양말 착용 시', socks: '여름 노삭스/페이크삭스, 가을·겨울 양말', note: '가장 범용적인 가죽 신발. 치노·슬랙스·데님 전부', flags: [] },
  loaferTassel: { labelKo: '태슬 로퍼', formality: 7, formalityNote: null, seasons: 'all', seasonNote: null, socks: '양말 권장', note: '페니보다 드레시. 슬랙스·플란넬', flags: [] },
  derby: { labelKo: '더비', formality: 7, formalityNote: null, seasons: 'all', seasonNote: '여름은 스웨이드', socks: '바지색 양말', note: '가죽 신발 중 가장 범용. 두꺼운 밑창은 데님과', flags: [] },
  oxford: { labelKo: '옥스포드', formality: 9, formalityNote: null, seasons: 'sw', seasonNote: null, socks: '바지색 긴 양말', note: '수트 전용에 가까움. 데님·치노와는 격차', flags: [] },
  chelsea: { labelKo: '첼시 부츠', formality: 6, formalityNote: '출처 갈림: 몽크 위(Bespoke Unit) vs 아래(Mr. Koachman) → 6 중간 처리', seasons: 'sw', seasonNote: null, socks: '보이지 않음', note: '슬림·테이퍼드 전용. 와이드에 묻힘', flags: ['disputed'] },
  workboot: { labelKo: '워크 부츠', formality: 4, formalityNote: null, seasons: 'sw', seasonNote: '봄가을은 늦가을', socks: '두꺼운 양말', note: '스트레이트·와이드 데님·코듀로이. 슬림 금지', flags: [] },
  chukka: { labelKo: '척카 부츠', formality: 5, formalityNote: null, seasons: 'sw', seasonNote: null, socks: '바지색 양말', note: '치노·데님 만능. 스웨이드 기본', flags: [] },
  sandal: { labelKo: '샌들/슬리퍼', formality: 1, formalityNote: null, seasons: 'summer', seasonNote: null, socks: '없음', note: '린넨·쇼츠·크롭. 슬랙스는 변주', flags: [] },
};
const SEASON_SETS = { all: [...SEASON_ORDER], sw: ['springFall', 'winter'], summer: ['summer'] };
export function buildShoes() {
  return SHOE_IDS.map((id) => { const m = SHOE_META[id]; return { id, labelKo: m.labelKo, formality: m.formality, formalityNote: m.formalityNote, seasons: SEASON_SETS[m.seasons], seasonNote: m.seasonNote, socks: m.socks, note: m.note, flags: m.flags }; });
}

// ---------------------------------------------------------------- shoeRules (R2 4-2 + 2-4)
function parseMaterialCell(cell, log, shoe) {
  const t = cell.replace(/\([^)]*\)/g, '').trim();
  if (/어떤 소재든/.test(t)) return MATERIAL_IDS;
  const ids = t.split('/').map((s) => camel(s.trim())).filter(Boolean);
  for (const id of ids) if (!MATERIAL_IDS.includes(id)) log.add('dropped', `shoeRules ${shoe}: 소재 "${id}" 미식별`);
  return ids.filter((id) => MATERIAL_IDS.includes(id));
}
const fitCell = (c) => (/어떤/.test(c) ? '*' : c.trim());
export function buildShoeRules(log) {
  // 2-4 기장
  const { rows: lenRows } = readTable(lines, find('### 2-4.'));
  const lengths = new Map();
  for (const [shoe, length, score, note] of lenRows) {
    const id = camel(shoe);
    if (!lengths.has(id)) lengths.set(id, []);
    lengths.get(id).push({ length, score: Number(score), note });
  }
  // 4-2 신발별 표
  const start = find('### 4-2.');
  const end = find('### 4-3.');
  const bottoms = new Map();
  for (let i = start; i < end; i++) {
    const h = lines[i].match(/^#### ([a-z_]+)/);
    if (!h) continue;
    const shoe = camel(h[1]);
    const { rows } = readTable(lines, i + 1);
    const list = [];
    const seen = new Set();
    for (const [matCell, fit, length, scoreCell, note] of rows) {
      const mats = parseMaterialCell(matCell, log, shoe);
      const f = fitCell(fit);
      const l = fitCell(length);
      const matNote = (matCell.match(/\(([^)]*)\)/) || [])[1];
      for (const material of mats) {
        let score = Number(scoreCell);
        const flags = [];
        if (/~/.test(scoreCell)) { // "1~2": 계절·무게 충돌 — 데님은 2, 코듀로이·플란넬은 1
          score = material === 'denimIndigo' ? 2 : 1; flags.push('approx');
          log.add('approx', `shoeRules ${shoe} ${material}: score "${scoreCell}" → ${score}`);
        }
        if (shoe === 'running' && material === 'wool') flags.push('disputed');
        const key = `${material}|${f}|${l}`;
        if (seen.has(key)) continue;
        seen.add(key);
        list.push({ material, fit: f, length: l, score, note: [matNote, note].filter(Boolean).join(' — '), flags });
      }
    }
    bottoms.set(shoe, list);
  }
  return SHOE_IDS.map((shoe) => ({ shoe, bottoms: bottoms.get(shoe) ?? [], lengths: TROUSER_LENGTHS.map((l) => lengths.get(shoe).find((x) => x.length === l)) }));
}

// ---------------------------------------------------------------- topTypes / outerTypes (data-schema 2-9·2-10)
export const TOP_TYPES = [
  { id: 'dressShirtTie', labelKo: '드레스 셔츠+타이', material: null, formality: 8 },
  { id: 'dressShirt', labelKo: '드레스 셔츠', material: null, formality: 7 },
  { id: 'oxfordShirt', labelKo: '옥스포드 셔츠', material: null, formality: 6 },
  { id: 'poloWool', labelKo: '울 폴로', material: 'knitWool', formality: 6 },
  { id: 'knitWool', labelKo: '울 니트', material: 'knitWool', formality: 5 },
  { id: 'knitCashmere', labelKo: '캐시미어 니트', material: 'knitCashmere', formality: 7 },
  { id: 'linenShirt', labelKo: '린넨 셔츠', material: 'linen', formality: 5 },
  { id: 'flannelShirt', labelKo: '플란넬 셔츠', material: null, formality: 5 },
  { id: 'knitCotton', labelKo: '코튼 니트', material: 'knitCotton', formality: 4 },
  { id: 'poloPique', labelKo: '피케 폴로', material: 'jersey', formality: 4 },
  { id: 'denimShirt', labelKo: '데님 셔츠', material: 'denimWashed', formality: 4 },
  { id: 'henley', labelKo: '헨리넥/긴팔 티', material: 'jersey', formality: 3 },
  { id: 'tee', labelKo: '티셔츠', material: 'jersey', formality: 2 },
  { id: 'sweatshirt', labelKo: '맨투맨/스웻셔츠', material: 'jersey', formality: 2 },
  { id: 'hoodie', labelKo: '후디', material: 'jersey', formality: 1 },
  { id: 'tank', labelKo: '탱크톱', material: 'jersey', formality: 1 },
];
export const OUTER_TYPES = [
  { id: 'denimJacket', labelKo: '데님 재킷', length: 'short', material: 'denimIndigo', formality: 4, formalityNote: null, seasons: ['springFall'] },
  { id: 'coachJacket', labelKo: '코치 재킷', length: 'short', material: 'nylonTech', formality: 3, formalityNote: null, seasons: ['springFall'] },
  { id: 'blouson', labelKo: '블루종(MA-1·해링턴)', length: 'short', material: 'nylonTech', formality: 4, formalityNote: '3~5 (나일론 MA-1 3, 울 블루종 4~5)', seasons: ['springFall'] },
  { id: 'cardigan', labelKo: '가디건', length: 'regular', material: 'knitWool', formality: 5, formalityNote: null, seasons: ['springFall'] },
  { id: 'shirtJacket', labelKo: '셔츠 재킷', length: 'regular', material: null, formality: 5, formalityNote: '4~6 (코튼 4, 울 6)', seasons: ['springFall'] },
  { id: 'trench', labelKo: '트렌치 코트', length: 'long', material: null, formality: 7, formalityNote: 'R2 원문 8. 캐주얼 착용이 일상적이라 1단계 하향(통합 결정 D1)', seasons: ['springFall'] },
  { id: 'blazer', labelKo: '블레이저', length: 'regular', material: 'wool', formality: 7, formalityNote: 'R2 원문 8. 캐주얼 착용이 일상적이라 1단계 하향(통합 결정 D1)', seasons: ['springFall', 'summer'] },
  { id: 'overshirt', labelKo: '오버셔츠(린넨)', length: 'regular', material: 'linen', formality: 4, formalityNote: '4~5', seasons: ['summer'] },
  { id: 'chesterfield', labelKo: '체스터필드·싱글 코트', length: 'long', material: 'wool', formality: 8, formalityNote: 'R2 원문 9. 캐주얼 착용이 일상적이라 1단계 하향(통합 결정 D1)', seasons: ['winter'] },
  { id: 'balmacaan', labelKo: '발마칸 코트', length: 'long', material: 'wool', formality: 7, formalityNote: null, seasons: ['winter'] },
  { id: 'duffle', labelKo: '더플 코트', length: 'long', material: 'wool', formality: 6, formalityNote: null, seasons: ['winter'] },
  { id: 'peacoat', labelKo: '피코트', length: 'regular', material: 'wool', formality: 7, formalityNote: null, seasons: ['winter'] },
  { id: 'shortPuffer', labelKo: '숏 패딩', length: 'regular', material: 'nylonTech', formality: 2, formalityNote: null, seasons: ['winter'] },
  { id: 'longPuffer', labelKo: '롱 패딩', length: 'long', material: 'nylonTech', formality: 1, formalityNote: null, seasons: ['winter'] },
  { id: 'fleece', labelKo: '플리스', length: 'regular', material: 'nylonTech', formality: 2, formalityNote: '2~3', seasons: ['winter'] },
  { id: 'leatherJacket', labelKo: '가죽 재킷', length: 'short', material: 'leather', formality: 5, formalityNote: null, seasons: ['springFall', 'winter'] },
];

// ---------------------------------------------------------------- formality (R2 5-1~5-4)
export function buildFormality() {
  const out = [];
  for (const s of buildShoes()) out.push({ category: 'shoes', id: s.id, level: s.formality, note: s.formalityNote ?? '' });
  const bottomNote = { wool: '단품 슬랙스. 수트 바지는 8(MVP 미사용)', corduroy: '굵은 골 기준. 가는 골 코듀로이 슬랙스는 6(2차)', denimIndigo: '', denimBlack: '', linen: '', denimWashed: '', nylonTech: '나일론 카고', jersey: '스웻팬츠·트랙팬츠' };
  for (const m of MATERIAL_IDS) {
    if (m === 'chino') {
      out.push({ category: 'bottom', id: 'chino', level: 5, note: '기본(다크·테이퍼드 기준)' });
      out.push({ category: 'bottom', id: 'chino', level: 5, when: { fit: ['slim', 'tapered', 'regular'] }, note: '다크·테이퍼드' });
      out.push({ category: 'bottom', id: 'chino', level: 4, when: { fit: ['straight', 'wide'] }, note: '라이트·와이드' });
    } else {
      out.push({ category: 'bottom', id: m, level: MAT[m].formality, note: bottomNote[m] ?? '소재 기본 포멀도(하의로 쓰일 때)' });
    }
  }
  for (const t of TOP_TYPES) out.push({ category: 'top', id: t.id, level: t.formality, note: '' });
  for (const o of OUTER_TYPES) out.push({ category: 'outer', id: o.id, level: o.formality, note: o.formalityNote ?? '' });
  return out;
}

// ---------------------------------------------------------------- outerRules (R2 6-1~6-3)
const B = (material, fit, score, note = '') => ({ material, fit, score, note });
const S = (shoe, score) => ({ shoe, score });
const SNEAKERS = (s = 4) => [S('sneakerWhite', s), S('sneakerColor', s)];
const LOAFERS = (s = 4) => [S('loaferPenny', s), S('loaferTassel', s)];
const DENIMS = ['denimIndigo', 'denimWashed', 'denimBlack'];
const OUTER_RULES = {
  denimJacket: { materialNote: '데님', bottoms: [B('chino', 'tapered', 5), B('chino', 'straight', 5), B('wool', 'tapered', 4), B('corduroy', 'straight', 4), B('denimWashed', '*', 3, '다른 톤 데님'), B('denimBlack', '*', 3, '다른 톤 데님'), B('denimIndigo', '*', 1, '같은 톤 데님 상하')], shoes: [S('sneakerWhite', 4), S('chukka', 4), S('derby', 4), S('loaferPenny', 4), S('workboot', 4), S('oxford', 1)], avoid: [{ material: 'denimIndigo', reason: '같은 톤 데님 상하 1' }], sources: ['R2 6'] },
  coachJacket: { materialNote: '나일론', bottoms: [B('denimWashed', 'straight', 5), B('chino', 'wide', 4), B('jersey', '*', 4, '트랙팬츠'), B('wool', '*', 3, '슬랙스는 변주')], shoes: [...SNEAKERS(4), S('running', 4), S('oxford', 1), S('loaferTassel', 1)], avoid: [], sources: ['ESQKCOACH', 'R2 6'] },
  blouson: { materialNote: '나일론 / 코튼 / 울', bottoms: [B('denimIndigo', 'tapered', 5), B('chino', 'tapered', 5), B('wool', 'tapered', 4, '해링턴'), B('denimBlack', 'slim', 4), B('*', 'wide', 4, 'wide+숏 블루종+crop은 OK, full 기장은 2')], shoes: [S('sneakerWhite', 4), S('loaferPenny', 4), S('chelsea', 4), S('derby', 4)], avoid: [], sources: ['R2 6'] },
  cardigan: { materialNote: '울 니트 / 코튼 니트', bottoms: [B('chino', 'tapered', 5), B('wool', 'tapered', 5), B('denimIndigo', 'straight', 5), B('corduroy', '*', 4), B('jersey', '*', 2, '스웻팬츠')], shoes: [...LOAFERS(4), S('derby', 4), S('sneakerWhite', 4)], avoid: [{ material: 'jersey', reason: '스웻팬츠 2' }], sources: ['R2 6'] },
  shirtJacket: { materialNote: '코튼 트윌 / 울 / 코듀로이', bottoms: [B('chino', '*', 5), B('denimIndigo', '*', 5), B('wool', '*', 4), B('corduroy', '*', 4, '코듀로이 셔츠 재킷이면 상하 골덴 2'), B('linen', '*', 3, '코듀로이 셔츠 재킷일 때 피함')], shoes: [S('derby', 4), S('chukka', 4), S('loaferPenny', 4), S('sneakerWhite', 4)], avoid: [{ material: 'linen', reason: '코듀로이 셔츠 재킷일 때' }], sources: ['R2 6'] },
  trench: { materialNote: '코튼 개버딘', bottoms: [B('wool', 'tapered', 5), B('denimIndigo', 'slim', 5), B('denimIndigo', 'straight', 5), B('chino', 'tapered', 5), B('denimBlack', '*', 4), B('jersey', '*', 1, '스웻팬츠'), B('*', 'wide', 3)], shoes: [S('derby', 5), ...LOAFERS(5), S('chelsea', 5), S('oxford', 4), S('running', 1), S('sandal', 1)], avoid: [{ material: 'jersey', reason: '스웻팬츠' }], sources: ['R2 6'] },
  blazer: { materialNote: '울 / 코튼 / 린넨(초여름)', bottoms: [B('wool', '*', 5), B('chino', '*', 5), B('denimIndigo', '*', 4, '재킷과 대비되는 색 데님(GQ Korea)'), B('flannel', '*', 4), B('denimWashed', '*', 2), B('jersey', '*', 2)], shoes: [...LOAFERS(4), S('derby', 4), S('oxford', 4), S('sneakerWhite', 3), S('running', 1)], avoid: [{ material: 'denimWashed', reason: '워시드 데님 2' }], sources: ['GQKOUTER', 'R2 6'] },
  overshirt: { materialNote: '린넨 / 얇은 코튼', bottoms: [B('linen', 'wide', 5), B('linen', 'regular', 5), B('chino', 'tapered', 5), B('denimWashed', 'straight', 4), B('wool', 'wide', 4, '트로피컬 울')], shoes: [S('loaferPenny', 4), S('sandal', 4), S('sneakerWhite', 4)], avoid: [], sources: ['R2 6'] },
  chesterfield: { materialNote: '울 / 캐시미어', bottoms: [B('wool', 'tapered', 5), B('flannel', 'tapered', 5), B('denimIndigo', 'slim', 5), B('denimIndigo', 'straight', 5, '회색 코트+연청도 허용(Vogue Korea)'), B('denimBlack', '*', 5), B('jersey', '*', 1, '스웻팬츠'), B('*', 'wide', 3)], shoes: [S('derby', 4), S('oxford', 4), S('chelsea', 4), S('loaferTassel', 4), S('sneakerWhite', 3), S('running', 1)], avoid: [{ material: 'jersey', reason: '스웻팬츠 1' }], sources: ['VKCOATJEAN', 'R2 6'] },
  balmacaan: { materialNote: '울 / 코튼', bottoms: [B('wool', '*', 4, '4~5'), B('flannel', '*', 4, '4~5'), B('denimIndigo', '*', 4, '4~5'), B('chino', '*', 4, '4~5'), B('corduroy', '*', 4, '4~5')], shoes: [S('derby', 4), S('chukka', 4), S('chelsea', 4), ...LOAFERS(4), S('sneakerWhite', 4), S('running', 2)], avoid: [], sources: ['R2 6'] },
  duffle: { materialNote: '울 멜턴', bottoms: [B('corduroy', 'straight', 5, '국내 매체 기준 클래식'), B('denimIndigo', 'straight', 5), B('chino', '*', 4), B('flannel', '*', 4), B('wool', 'slim', 3, '슬림 슬랙스')], shoes: [S('workboot', 4), S('chukka', 4), S('derby', 4), S('sneakerWhite', 4), S('oxford', 2)], avoid: [], sources: ['R2 6'] },
  peacoat: { materialNote: '울 멜턴', bottoms: [B('denimIndigo', 'slim', 5), B('denimIndigo', 'tapered', 5), B('wool', 'tapered', 5), B('denimBlack', '*', 5), B('corduroy', '*', 4), B('*', 'wide', 2, '숏 코트+와이드는 하체가 과함')], shoes: [S('chelsea', 4), S('derby', 4), S('workboot', 4), S('chukka', 4)], avoid: [], sources: ['R2 6'] },
  shortPuffer: { materialNote: '나일론', bottoms: [...DENIMS.flatMap((d) => [B(d, 'straight', 5), B(d, 'wide', 5)]), B('jersey', 'tapered', 4), B('chino', '*', 4), B('wool', '*', 3, '블랙 팬츠로 안정감(Elle Korea)')], shoes: [...SNEAKERS(4), S('running', 4), S('workboot', 4), S('oxford', 1), S('loaferTassel', 1)], avoid: [], sources: ['ELLEK', 'R2 6'] },
  longPuffer: { materialNote: '나일론', bottoms: [B('jersey', '*', 5), ...DENIMS.map((d) => B(d, '*', 4)), B('nylonTech', '*', 5), B('wool', '*', 2, '슬랙스')], shoes: [S('running', 4), ...SNEAKERS(4), S('workboot', 4), S('derby', 1), S('oxford', 1), S('loaferPenny', 1), S('loaferTassel', 1), S('chelsea', 1)], avoid: [{ material: 'wool', reason: '슬랙스 2' }], sources: ['R2 6'] },
  fleece: { materialNote: '플리스', bottoms: [B('chino', 'straight', 5), ...DENIMS.map((d) => B(d, '*', 5)), B('jersey', '*', 4), B('corduroy', 'wide', 4), B('wool', '*', 3, '플리스+슬림 팬츠+블랙 더비 변주(Elle)')], shoes: [...SNEAKERS(4), S('running', 4), S('workboot', 4), S('chukka', 4), S('oxford', 1)], avoid: [], sources: ['ELLEK', 'ALLUREK2', 'R2 6'] },
  leatherJacket: { materialNote: '가죽', bottoms: [B('denimIndigo', 'slim', 5), B('denimIndigo', 'tapered', 5), B('denimBlack', 'slim', 5), B('wool', 'tapered', 4), B('corduroy', '*', 4), B('linen', '*', 1), B('*', 'wide', 3)], shoes: [S('chelsea', 4), S('derby', 4), S('workboot', 4), S('sneakerWhite', 4)], avoid: [{ material: 'linen', reason: '린넨 1' }], sources: ['R2 6'] },
};
export function buildOuterRules() {
  return OUTER_TYPES.map((o) => {
    const r = OUTER_RULES[o.id];
    return { outer: o.id, labelKo: o.labelKo, length: o.length, material: o.material, materialNote: r.materialNote, formality: o.formality, seasons: sortSeasons(o.seasons), bottoms: r.bottoms, shoes: r.shoes, avoid: r.avoid, sources: r.sources, flags: [] };
  });
}

// ---------------------------------------------------------------- layerRules (R2 6-4)
export function buildLayerRules() {
  return [
    { season: 'springFall', maxLayers: 3, order: ['base', 'mid', 'outer'], note: '안쪽일수록 얇고 매끈, 바깥일수록 두껍고 질감. 기장은 안 < 밖' },
    { season: 'summer', maxLayers: 2, order: ['base', 'outer'], note: '2겹 초과 금지. 아우터는 오버셔츠' },
    { season: 'winter', maxLayers: 3, order: ['base', 'mid', 'outer'], note: '니트 기장이 코트 밖으로 나오지 않게. 롱 코트 안 숏 아우터는 변주' },
  ];
}

// ---------------------------------------------------------------- adjust (R2 2-5, 3-4, R1 8장)
export function buildAdjust() {
  return [
    { id: 'adjCropSummerLoafer', when: { trouserLength: 'crop', season: 'summer', shoe: ['loaferPenny', 'loaferTassel', 'sandal'] }, delta: 1, reason: '발목 노출이 여름 클래식', sources: ['R2 2-5'], flags: [] },
    { id: 'adjCropWinter', when: { trouserLength: 'crop', season: 'winter' }, delta: -1, reason: '겨울 발목 노출은 비실용', sources: ['R2 2-5'], flags: [] },
    { id: 'adjWideThinShoe', when: { bottomFit: 'wide', shoe: ['sneakerWhite', 'loaferPenny', 'loaferTassel'] }, delta: 0, reason: '와이드 하의에 가는 신발 — 슬림 신발(MR PORTER) vs 볼륨 신발(FashionBeans) 의견 갈림', sources: ['MRPWIDE', 'FBWIDE', 'R2 4-3'], flags: ['disputed'] },
    { id: 'adjWideFullThinShoe', when: { bottomFit: 'wide', trouserLength: 'full', shoe: ['sneakerWhite', 'loaferPenny', 'loaferTassel', 'chelsea', 'chukka'] }, delta: -1, reason: '와이드+풀 기장에 가는 신발은 발이 원단에 묻힘', sources: ['R2 2-5', 'R2 4-3'], flags: [] },
    { id: 'adjSlimWorkboot', when: { bottomFit: 'slim', shoe: 'workboot' }, delta: -1, reason: '부츠가 바지보다 넓어 다리가 가늘어 보임', sources: ['R2 2-5'], flags: [] },
    { id: 'adjLongOuterCrop', when: { outerLength: 'long', trouserLength: 'crop' }, delta: -1, reason: '긴 위 + 짧은 아래 = 비율 불균형', sources: ['R2 2-5'], flags: [] },
    { id: 'adjShortCropWide', when: { outerLength: 'short', topLength: 'crop', bottomFit: 'wide' }, delta: 0, reason: '숏 아우터+크롭 상의+와이드 = 2025 스트릿 기본형', sources: ['R2 2-5'], flags: [] },
    { id: 'adjHeavyLight', when: { bottomMaterial: ['corduroy', 'flannel', 'tweed'], topMaterial: ['linen', 'jersey'] }, delta: -1, reason: '무거운 소재(코듀로이·플란넬·트위드)+가벼운 소재(린넨·저지) 혼합', sources: ['MASHBURN', 'BALTSUN', 'R2 3-4'], flags: [] },
    { id: 'adjHeavyLightOuter', when: { outerMaterial: ['tweed', 'leather'], bottomMaterial: ['linen', 'jersey'] }, delta: -1, reason: '무거운 아우터(트위드·가죽)+가벼운 하의(린넨·저지) 혼합', sources: ['MASHBURN', 'BALTSUN', 'R2 3-4'], flags: [] },
    { id: 'adjHeavyShoe', when: { bottomWeight: 'heavy', shoe: ['derby', 'chelsea', 'workboot', 'chukka', 'loaferTassel'] }, delta: 1, reason: '무거운 하의 + 무거운 신발', sources: ['FBSHOES', 'R2 3-4'], flags: [] },
    { id: 'adjFourColors', when: { colorCountMin: 4 }, delta: -1, reason: '색이 4개 이상(3색 규칙)', sources: ['Vou1', 'WH1'], flags: [] },
    { id: 'adjSummerBlackBlack', when: { season: 'summer', topColor: 'black', bottomColor: ['black', 'blackDenim'] }, delta: -1, reason: '여름 블랙 상의+블랙 하의는 웨이터 룩', sources: ['FB1'], flags: [] },
    { id: 'adjSameColorTopBottom', when: { sameColorTopBottom: true }, delta: -2, reason: '상·하의 같은 색(올화이트·올블랙·같은 워시 더블데님)', sources: ['FB2', 'FB3', 'AtG3'], flags: [] },
  ];
}
