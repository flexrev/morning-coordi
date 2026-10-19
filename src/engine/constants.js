// 엔진 상수 — docs/architecture/engine-spec.md 3-9·3-10·6절. 값 변경은 이 파일에서만.
export const WEIGHTS = { fit: 1.0, len: 0.7, mat: 1.0, shoe: 1.0, outer: 0.7, season: 1.5 };
export const W_COLOR = 1.5;
export const W_STYLE = 1.0;
export const K_ADJ = 2.5;
export const FORMALITY_WARN = 4;           // 격차 4~5 경고 (통합 결정 D1)
export const FORMALITY_BLOCK = 6;          // 격차 ≥6 차단. 단 isClassic && sources ≥2 코디는 경고로 완화
export const FORMALITY_EXEMPT_SOURCES = 2;
export const SEASON_COLOR_PENALTY = { out: -1, accentOut: -2 };
export const DEFAULT_SCORE = 3;
export const QUICK_CARDS = 3;
export const PAIR_WEIGHT_TOP_OUTER = 0.5;   // engine-spec 2절: top↔outer 쌍 가중
export const LAYER_OVER_PENALTY = -2;      // engine-spec 3-6: layerRules.maxLayers 초과
export const MEMO_SIZE = 20;               // engine-spec 7절: recommend() LRU
export const CANDIDATE_MAX = 300;
export const OUTER_CANDIDATES = 4;
// Phase 4 (P3-02): quick 풀에서 제외 — 격차 ≥ QUICK_EXCLUDE_GAP 이면서 낮은 쪽이 아래 신발인 카드(울 슬랙스+컬러 스니커즈). deep에는 남김
export const QUICK_EXCLUDE_GAP = 5;
export const QUICK_EXCLUDE_LO_SHOES = ['sneakerColor', 'running', 'sandal'];
// Phase 4 (P1-06·P3-20): deep 그룹 5장 안 중복 상한 — 같은 아우터 종류·같은 신발 종류 각 2장, 같은 (상의 종류+색) 1장
export const GROUP_MAX_SAME_OUTER = 2;
export const GROUP_MAX_SAME_SHOE = 2;
export const GROUP_MAX_SAME_TOP = 1;
// Phase 4 (P3-25/V-21): 규칙 없이 어휘만 유지하는 예비 색 — 베이스 칩으로 올리지 않음
export const RESERVE_COLORS = ['teal', 'taupe'];

// data-schema 4-14: adjust.when 허용 키
export const ADJUST_WHEN_KEYS = ['season', 'trouserLength', 'topLength', 'outerLength', 'bottomFit', 'topFit', 'shoe', 'bottomMaterial', 'topMaterial', 'outerMaterial', 'bottomWeight', 'materialWeights', 'colorCountMin', 'sameColorTopBottom', 'topColor', 'bottomColor', 'shoesColor', 'outerColor', 'hasOuter'];

// engine-spec 6절 — 색만 주어졌을 때 아이템 구체화 기본값
export const DEFAULTS = {
  bottomMaterialByColor: {
    indigo: 'denimIndigo', lightDenim: 'denimWashed', midDenim: 'denimWashed', blackDenim: 'denimBlack',
    beige: 'chino', khaki: 'chino', navy: 'chino', olive: 'chino', white: 'chino', cream: 'chino',
    midGrey: 'wool', charcoal: 'wool', black: 'wool',
    brown: { springFall: 'corduroy', winter: 'corduroy', summer: 'chino' }, // P3-04: 코듀로이는 봄가을·겨울만(R2 3-1), 여름 브라운 하의는 치노
  },
  // 하의 품목명: 소재 라벨이 품목을 담지 못할 때(울 → 울 슬랙스). P3-10
  bottomNameByMaterial: { wool: '울 슬랙스', flannel: '플란넬 슬랙스', linen: '린넨 팬츠', jersey: '스웻팬츠', nylonTech: '테크 팬츠' },
  bottomMaterialFallback: 'chino',
  bottomFitByMaterial: { denimIndigo: 'straight', denimWashed: 'straight', denimBlack: 'straight', chino: 'tapered', wool: 'tapered' },
  bottomFitFallback: 'regular',
  bottomLength: 'nobreak',
  // 계절별 상의: [itemType, material]. 셔츠색(lightBlue·white)은 봄가을에 옥스포드
  topBySeason: { summer: ['tee', 'jersey'], springFall: ['knitCotton', 'knitCotton'], winter: ['knitWool', 'knitWool'] },
  topShirtColors: ['lightBlue', 'white'],
  topShirt: ['oxfordShirt', null],
  // 색이 품목을 정하는 상의(계절별 객체 허용): 데님색은 데님 셔츠(R1 4-10·4-12 '샴브레이'), 멜란지는 티/맨투맨(R1 5-3). P3-05 ②·P3-12
  topTypeByColor: { indigo: 'denimShirt', lightDenim: 'denimShirt', midDenim: 'denimShirt', greyMelange: { springFall: 'sweatshirt', winter: 'sweatshirt', summer: 'tee' } },
  // 셔츠류 품목을 유지할 수 있는 색 — 변주에서 색이 바뀔 때 이 밖이면 계절 기본 상의로 재구체화 (P3-12)
  topShirtTypes: ['oxfordShirt', 'linenShirt', 'dressShirt', 'denimShirt', 'flannelShirt'],
  topShirtOkColors: ['white', 'offWhite', 'lightBlue', 'skyBlue', 'navy', 'olive', 'black', 'cream', 'lightGrey', 'dustyPink', 'indigo', 'lightDenim', 'midDenim', 'sage', 'lavender'],
  // 여름 + 포멀 하의(울·플란넬)일 때 기본 상의(폴로·린넨 셔츠) 외에 티셔츠도 후보로 생성 — 경고 카드로 deep·변주에만 보임 (gate-3 4항)
  topFormalSummerAlt: ['tee', 'jersey'],
  // 포멀도 6 이상 하의(울·플란넬)는 여름에 티셔츠(2) 대신 폴로(4) — 포멀도 격차 5 차단 방지
  topFormalSummer: ['poloPique', 'jersey'],
  topFormalSummerShirt: ['linenShirt', 'linen'],
  topFormalBottomMin: 6,
  topFit: 'regular',
  topLength: 'regular',
  // 색→신발: 값이 객체면 계절별
  shoesByColor: {
    white: 'sneakerWhite',
    brown: { springFall: 'chukka', winter: 'workboot', summer: 'loaferPenny' },
    chocolate: { springFall: 'chukka', winter: 'workboot', summer: 'loaferPenny' },
    tan: { springFall: 'chukka', winter: 'workboot', summer: 'loaferPenny' },
    black: { springFall: 'derby', winter: 'derby', summer: 'loaferPenny' }, // P3-02: 여름 블랙은 페니 로퍼(연중 신발). 컬러 스니커즈는 울 슬랙스와 격차 5
    burgundy: 'loaferPenny',
    navy: 'sneakerColor',
  },
  shoesFallback: 'loaferPenny',
  // P3-08: 브라운 계열 겨울 기본(워크 부츠)은 포멀도 ≥6 하의(울·플란넬)엔 첼시 부츠(R2 3-3 '무거운 신발', R1 c20)
  shoesFormalWinter: { colors: ['brown', 'chocolate', 'tan'], bottomFormalMin: 6, shoeType: 'chelsea' },
  // 하의 규칙이 없어 신발 색을 못 정할 때의 뉴트럴 신발 색 (규칙 없음 info)
  shoesNeutralFallback: ['white', 'brown', 'black'],
  // 가죽 재킷은 이 색만 (P3-12: '미드 그레이 가죽 재킷' 방지)
  leatherColors: ['black', 'brown', 'chocolate', 'tan'],
  shoesMaterialByType: { sneakerWhite: 'leather', sneakerColor: 'leather', running: 'nylonTech', sandal: 'nylonTech' },
  shoesMaterialFallback: 'leather',
  // 계절별 아우터 후보 순서. 카멜·베이지는 코트(트렌치/체스터필드) 우선, 데님색은 데님 재킷
  outerBySeason: { springFall: ['blazer', 'shirtJacket', 'denimJacket', 'trench'], winter: ['chesterfield', 'peacoat', 'duffle', 'leatherJacket'], summer: ['overshirt'] },
  outerCoatColors: ['camel', 'beige'],
  outerCoatBySeason: { springFall: 'trench', winter: 'chesterfield', summer: 'overshirt' },
  outerDenimColors: ['indigo', 'lightDenim', 'midDenim'],
  outerDenim: 'denimJacket', // P3-05 ③·P3-23: 데님색 아우터는 여름(오버셔츠) 외엔 항상 데님 재킷 — '인디고 체스터필드' 방지
};
