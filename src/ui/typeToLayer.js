// 품목 id → 실루엣 레이어 파일 매핑 (gate-2 2-2). 매핑이 없으면 가장 가까운 형태로 폴백.
// 파일명은 src/assets/silhouettes/index.json 기준 (확장자 제외).

/** shoes enum 11 → 파일 8. loaferTassel만 태슬 디테일 path를 켠다. */
export const SHOE_LAYER = {
  sneakerWhite: { file: 'shoes-sneaker' },
  sneakerColor: { file: 'shoes-sneaker' },
  running: { file: 'shoes-running' },
  loaferPenny: { file: 'shoes-loafer' },
  loaferTassel: { file: 'shoes-loafer', detail: 'tassel' },
  derby: { file: 'shoes-derby' },
  oxford: { file: 'shoes-derby' },
  chelsea: { file: 'shoes-chelsea' },
  workboot: { file: 'shoes-workboot' },
  chukka: { file: 'shoes-chukka' },
  sandal: { file: 'shoes-sandal' },
};
const SHOE_FALLBACK = { file: 'shoes-sneaker' };

/** topTypes 16 → 상의 형태 5 (tee·shirt·knit·hoodie·polo). */
export const TOP_SHAPE = {
  tee: 'tee', tank: 'tee', henley: 'tee',
  sweatshirt: 'knit',                      // 크루넥 긴팔 → 니트 형태가 가장 가깝다 (후드 없음)
  hoodie: 'hoodie',
  knitWool: 'knit', knitCotton: 'knit', knitCashmere: 'knit',
  poloPique: 'polo', poloWool: 'polo',
  oxfordShirt: 'shirt', dressShirt: 'shirt', dressShirtTie: 'shirt',
  linenShirt: 'shirt', flannelShirt: 'shirt', denimShirt: 'shirt',
};
const TOP_SHAPE_FALLBACK = 'tee';

/** topFit 4 → 파일 접미사 2 (slim은 120px에서 차이가 안 보여 regular, oversized는 loose). */
export const TOP_FIT = { slim: 'regular', regular: 'regular', loose: 'loose', oversized: 'loose' };

/** bottomFit 5 → 파일 4 (regular → straight). */
export const BOTTOM_FIT = { slim: 'bottom-slim', tapered: 'bottom-tapered', regular: 'bottom-straight', straight: 'bottom-straight', wide: 'bottom-wide' };
const BOTTOM_FALLBACK = 'bottom-straight';

/** outerTypes 16 → 아우터 형태 4 (short·regular·long·puffer). */
export const OUTER_LAYER = {
  denimJacket: 'outer-short', coachJacket: 'outer-short', blouson: 'outer-short', leatherJacket: 'outer-short',
  cardigan: 'outer-regular', shirtJacket: 'outer-regular', blazer: 'outer-regular', overshirt: 'outer-regular',
  peacoat: 'outer-regular', fleece: 'outer-regular',
  trench: 'outer-long', chesterfield: 'outer-long', balmacaan: 'outer-long', duffle: 'outer-long',
  shortPuffer: 'outer-puffer', longPuffer: 'outer-puffer', // 롱패딩도 누빔선이 보이는 puffer가 더 가깝다
};
const OUTER_BY_LENGTH = { short: 'outer-short', regular: 'outer-regular', long: 'outer-long' };

/**
 * 아이템 하나 → { file, detail? } 또는 null(그릴 수 없음).
 * @param {{category:string, fit?:string|null, length?:string|null, shoeType?:string|null, itemType?:string|null}} item
 */
export function layerFor(item) {
  if (!item) return null;
  switch (item.category) {
    case 'shoes':
      return SHOE_LAYER[item.shoeType] || SHOE_FALLBACK;
    case 'bottom':
      return { file: BOTTOM_FIT[item.fit] || BOTTOM_FALLBACK };
    case 'top': {
      const shape = TOP_SHAPE[item.itemType] || TOP_SHAPE_FALLBACK;
      const fit = TOP_FIT[item.fit] || 'regular';
      return { file: `top-${shape}-${fit}` };
    }
    case 'outer':
      return { file: OUTER_LAYER[item.itemType] || OUTER_BY_LENGTH[item.length] || 'outer-regular' };
    default:
      return null;
  }
}

/** 소재 id → 패턴 id (design-tokens 6-1 ⑥). snake_case(D2 문서)·camelCase(data-schema) 둘 다 받는다. */
export function patternFor(material) {
  if (!material) return null;
  const m = String(material);
  if (/^denim/i.test(m)) return 'pat-denim';
  if (/^corduroy$/i.test(m)) return 'pat-corduroy';
  if (/^knit/i.test(m)) return 'pat-knit';
  if (/^(flannel|tweed)$/i.test(m)) return 'pat-flannel';
  if (/^linen$/i.test(m)) return 'pat-linen';
  if (/^leather$/i.test(m)) return 'pat-leather';
  return null; // chino · wool · jersey · nylonTech · knitCashmere(smooth) 등 민무늬
}
