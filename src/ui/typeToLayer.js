// 품목 id → 실루엣 v2 레이어 파일 매핑 (asset-system.md 4-4 ⑤ · 9장). 데이터 주도: AS 가 레이어를 더 내면
// `AVAILABLE`(index-v2.json 의 파일 목록)에 자동으로 잡히고, 아래 폴백은 "파일이 없을 때만" 작동한다. v1 로 떨어지지 않는다.
import INDEX from '../assets/v2/index-v2.json' with { type: 'json' };

/** index-v2.json 에 있는 파일(확장자 없음) 집합 — AS 가 파일을 추가하면 index 재생성으로 드롭인 */
export const AVAILABLE = new Set((INDEX.layers || []).map((l) => String(l.file).replace(/\.svg$/, '')));
export const Z_ORDER = INDEX.zOrder || ['stage', 'base', 'cap', 'socks', 'shoes', 'bottom', 'belt', 'top', 'mid', 'outer', 'scarf', 'bag', 'watch'];
/** 무대 레이어 메타(index.stage): 파일·크기별 불투명도·블러 */
export const STAGE = INDEX.stage || null;

/** 원하는 파일 → 없으면 가장 가까운 v2 파일. 후보 순서대로 첫 번째 존재하는 것. */
function pick(...files) {
  for (const f of files) if (f && AVAILABLE.has(f)) return f;
  return files[files.length - 1];
}

/** shoes enum 11 → 파일. loaferTassel 만 태슬 디테일 path 를 켠다. 2차 제작 전 폴백: running→sneaker, workboot·chukka→chelsea, sandal→loafer */
export const SHOE_LAYER = {
  sneakerWhite: { file: 'shoes-sneaker' },
  sneakerColor: { file: 'shoes-sneaker' },
  running: { file: 'shoes-running', fallback: 'shoes-sneaker' },
  loaferPenny: { file: 'shoes-loafer' },
  loaferTassel: { file: 'shoes-loafer', detail: 'tassel' },
  derby: { file: 'shoes-derby' },
  oxford: { file: 'shoes-derby' },
  chelsea: { file: 'shoes-chelsea' },
  workboot: { file: 'shoes-workboot', fallback: 'shoes-chelsea' },
  chukka: { file: 'shoes-chukka', fallback: 'shoes-chelsea' },
  sandal: { file: 'shoes-sandal', fallback: 'shoes-loafer' },
};
const SHOE_FALLBACK = { file: 'shoes-sneaker' };

/** topTypes 16 → 상의 형태 (tee·shirt·knit·hoodie·polo). polo 는 v2 제작 전까지 shirt 폴백 */
export const TOP_SHAPE = {
  tee: 'tee', tank: 'tee', henley: 'tee',
  sweatshirt: 'knit',
  hoodie: 'hoodie',
  knitWool: 'knit', knitCotton: 'knit', knitCashmere: 'knit',
  poloPique: 'polo', poloWool: 'polo',
  oxfordShirt: 'shirt', dressShirt: 'shirt', dressShirtTie: 'shirt',
  linenShirt: 'shirt', flannelShirt: 'shirt', denimShirt: 'shirt',
};
const TOP_SHAPE_FALLBACK = 'tee';
const SHAPE_NEAREST = { polo: 'shirt', shirt: 'tee', hoodie: 'knit', knit: 'tee', tee: 'knit' };

/** topFit 4 → 파일 접미사 2 */
export const TOP_FIT = { slim: 'regular', regular: 'regular', loose: 'loose', oversized: 'loose' };

/** bottomFit 5 → 파일 (slim 은 2차 제작 전까지 tapered 폴백) */
export const BOTTOM_FIT = { slim: 'bottom-slim', tapered: 'bottom-tapered', regular: 'bottom-straight', straight: 'bottom-straight', wide: 'bottom-wide' };
const BOTTOM_NEAREST = { 'bottom-slim': 'bottom-tapered' };
const BOTTOM_FALLBACK = 'bottom-straight';

/** outerTypes 16 → 아우터 형태 4 (short·regular·long·puffer) */
export const OUTER_LAYER = {
  denimJacket: 'outer-short', coachJacket: 'outer-short', blouson: 'outer-short', leatherJacket: 'outer-short',
  cardigan: 'outer-regular', shirtJacket: 'outer-regular', blazer: 'outer-regular', overshirt: 'outer-regular',
  peacoat: 'outer-regular', fleece: 'outer-regular',
  trench: 'outer-long', chesterfield: 'outer-long', balmacaan: 'outer-long', duffle: 'outer-long',
  shortPuffer: 'outer-puffer', longPuffer: 'outer-long-puffer',
};
const OUTER_BY_LENGTH = { short: 'outer-short', regular: 'outer-regular', long: 'outer-long' };
const OUTER_NEAREST = { 'outer-long-puffer': 'outer-puffer' };

/** mid 레이어(CX D-3) → mid-<type>. 없는 type 은 가장 가까운 mid 파일, 그것도 없으면 outer-regular */
export const MID_LAYER = { cardigan: 'mid-cardigan', vest: 'mid-vest', overshirt: 'mid-overshirt', shirt: 'mid-overshirt', fleece: 'mid-cardigan', knit: 'mid-cardigan' };

/** 액세서리 슬롯 → 기본 파일 (asset-system 6장). type 별 변형(acc-beanie·acc-backpack·acc-crossbody)은 있으면 우선 */
export const ACC_LAYER = { belt: 'acc-belt', watch: 'acc-watch', socks: 'acc-socks', bag: 'acc-bag', cap: 'acc-cap', scarf: 'acc-scarf' };
const ACC_BY_TYPE = { beanie: 'acc-beanie', backpack: 'acc-backpack', crossbody: 'acc-crossbody', tote: 'acc-bag' };
function accType(pick) {
  const t = String(pick?.type || pick?.itemType || pick?.id || '').toLowerCase();
  for (const k of Object.keys(ACC_BY_TYPE)) if (t.includes(k)) return k;
  return null;
}

/** 액세서리 데이터(CX AccessoryPick 또는 items[] 항목) → 슬롯 id. 모양이 달라도 type/slot/category 중 하나로 맞춘다. */
export function accessorySlot(pick) {
  if (!pick) return null;
  const s = pick.slot || pick.group || pick.category;
  if (ACC_LAYER[s]) return s;
  const t = String(pick.type || pick.id || '').toLowerCase();
  if (/belt/.test(t)) return 'belt';
  if (/watch/.test(t)) return 'watch';
  if (/sock/.test(t)) return /noshow|invisible/.test(t) ? null : 'socks';
  if (/bag|tote|backpack|crossbody/.test(t)) return 'bag';
  if (/cap|beanie|hat/.test(t)) return 'cap';
  if (/scarf|muffler/.test(t)) return 'scarf';
  return null;
}

/**
 * 아이템 하나 → { file, detail? } 또는 null(그릴 수 없음).
 * @param {{category:string, fit?:string|null, length?:string|null, shoeType?:string|null, itemType?:string|null}} item
 * @param {{forceRegular?:boolean}} [opts]  아우터가 있으면 루즈 상의 대신 regular (asset-system 4-3)
 */
export function layerFor(item, opts = {}) {
  if (!item) return null;
  switch (item.category) {
    case 'shoes': {
      const l = SHOE_LAYER[item.shoeType] || SHOE_FALLBACK;
      return { file: pick(l.file, l.fallback, SHOE_FALLBACK.file), detail: l.detail };
    }
    case 'bottom': {
      const want = BOTTOM_FIT[item.fit] || BOTTOM_FALLBACK;
      return { file: pick(want, BOTTOM_NEAREST[want], BOTTOM_FALLBACK) };
    }
    case 'top': {
      const shape = TOP_SHAPE[item.itemType] || TOP_SHAPE_FALLBACK;
      const fit = opts.forceRegular ? 'regular' : (TOP_FIT[item.fit] || 'regular');
      const near = SHAPE_NEAREST[shape] || TOP_SHAPE_FALLBACK;
      return { file: pick(`top-${shape}-${fit}`, `top-${shape}-regular`, `top-${near}-${fit}`, `top-${near}-regular`, 'top-tee-regular') };
    }
    case 'mid': {
      const want = MID_LAYER[item.itemType] || `mid-${item.itemType || 'cardigan'}`;
      return { file: pick(want, 'mid-cardigan', 'outer-regular') };
    }
    case 'outer': {
      const want = OUTER_LAYER[item.itemType] || OUTER_BY_LENGTH[item.length] || 'outer-regular';
      return { file: pick(want, OUTER_NEAREST[want], OUTER_BY_LENGTH[item.length], 'outer-regular') };
    }
    default: {
      const slot = accessorySlot(item);
      if (!slot) return null;
      const t = accType(item);
      return { file: pick(t ? ACC_BY_TYPE[t] : null, ACC_LAYER[slot]) };
    }
  }
}

/** 소재 id → 패턴 id (asset-system 5장). snake_case·camelCase 둘 다 받는다. */
export function patternFor(material) {
  if (!material) return null;
  const m = String(material);
  if (/^denim/i.test(m)) return 'pat2-denim';
  if (/^corduroy$/i.test(m)) return 'pat2-corduroy';
  if (/^knit(cotton|wool)?$/i.test(m) || /^knit_?(cotton|wool)$/i.test(m)) return 'pat2-knit';
  if (/^flannel$/i.test(m)) return 'pat2-flannel';
  if (/^tweed$/i.test(m)) return 'pat2-tweed';
  if (/^linen$/i.test(m)) return 'pat2-linen';
  if (/^leather$/i.test(m)) return 'pat2-leather';
  if (/^nylon/i.test(m)) return 'pat2-ripstop';
  return null; // chino · wool · jersey · knitCashmere(민무늬)
}

/** 무늬(CX patterns 필드: breton·stripe·pinstripe·gingham·plaid·houndstooth·check) → 패턴 id. 소재 패턴보다 우선. */
export function patternForPrint(pattern) {
  if (!pattern) return null;
  const p = String(pattern).toLowerCase();
  if (/breton|stripe$|^stripe/.test(p) && !/pin/.test(p)) return 'pat2-stripe';
  if (/pin/.test(p)) return 'pat2-pinstripe';
  if (/gingham/.test(p)) return 'pat2-gingham';
  if (/plaid|tartan|check/.test(p)) return 'pat2-plaid';
  if (/hound/.test(p)) return 'pat2-houndstooth';
  return null;
}
