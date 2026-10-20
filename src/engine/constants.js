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

// ---------------------------------------------------------------- Phase 6-B (CX) 콘텐츠 확장 — content-expansion.md 7-2
export const K_STYLE = 0.5;                // 스타일 선택 시 final + K_STYLE × styleNorm[style] (재정렬만, D-1)
export const K_OCC = 0.4;                  // 상황 styleBoost 가중 합 × K_OCC
export const OCC_WINDOW_PENALTY = -0.3;    // 상황 포멀도 창 밖 아이템당 × 창 경계까지의 거리(단계) — C6-01: 티셔츠(4단계 밖)가 린넨 셔츠(1단계 밖)보다 더 깎인다
export const OCC_WINDOW_FLOOR = -1.5;
export const OCC_TARGET_BONUS = 0.2;       // 코디 평균 포멀도가 목표 창 안
export const OCC_PREFER_BONUS = 0.1;       // occasions.prefer 품목·신발 1개당 (C6-09: 데이트는 니트·로퍼, 출근은 셔츠·블레이저가 앞서게)
export const OCC_PREFER_MAX = 0.3;
// C6-01·02: 상황별 완화 상한 단계 (RELAX_STAGES 인덱스). 없는 상황은 끝까지(4). 격식·운동은 itemTypes·shoeTypes를 끝까지 지키고 3장 미만(shortfall)을 허용한다
export const OCC_RELAX_MAX_STAGE = { formal: 2, active: 2 };
// C6-01·02: 상황별 대체 구체화 — 베이스 색은 그대로, 소재·품목만 바꾼 후보를 그 상황의 풀에 더한다
//  active.bottomMaterials: 울·플란넬 하의 → 스웻팬츠·테크 팬츠 ("차콜 테크 팬츠 + 러닝화") · active.tops: 봄가을 옥스포드 셔츠 → 티셔츠
//  formal.tops: 여름 티셔츠 → 린넨 셔츠(셔츠 허용색)·피케 폴로, 봄가을 코튼 니트 → 울(메리노) 니트 · formal.shoeTypes: 척카·워크 부츠 → 더비 · formal.outers: 여름 오버셔츠 → 블레이저 (수트 없는 격식 근사 — 창 감점만 받는다)
//  tops[season] = { from: 기본 품목, shirt?: 셔츠 허용색일 때 [itemType, material], other: 그 외 [itemType, material] }
export const OCC_ALT = {
  active: { bottomMaterials: { from: ['wool', 'flannel'], to: ['jersey', 'nylonTech'] }, tops: { springFall: { from: ['oxfordShirt'], other: ['tee', 'jersey'] } } },
  formal: {
    tops: { summer: { from: ['tee'], shirt: ['linenShirt', 'linen'], other: ['poloPique', 'jersey'] }, springFall: { from: ['knitCotton'], other: ['knitWool', 'knitWool'] } },
    shoeTypes: { from: ['chukka', 'workboot'], to: 'derby' },   // 브라운 척카·워크 부츠 → 브라운 더비
    outers: { summer: { from: ['overshirt'], to: 'blazer' } },  // 여름 오버셔츠 → 블레이저
  },
};
export const BY_STYLE_MAX_OVERLAP = 2;     // C6-03: 스타일 그룹 쌍의 공통 카드 상한 (5장 중)
export const STYLE_TAG_MIN = 0.4;          // styleNorm ≥ 이면 태그 후보
export const STYLE_TAG_RATIO = 0.8;        // 최대값의 80% 이상만
export const STYLE_TAGS_MAX = 2;           // 카드 태그 상위 2개 (gate-5 지시: top-2)
export const STYLE_SHOES_COLOR_WEIGHT = 0.5;
export const STYLE_NORM_DIV = 3;           // styleNorm = vec / (3 × Σ가중) — 가중치 최대 +3
export const BY_STYLE_MAX_GROUPS = 4;
export const BY_STYLE_PER_GROUP = 5;
export const BY_OCCASION_PER_GROUP = 3;
export const W_LAYER = 0.7;                // mid 레이어 축 가중 — mid가 있을 때만 ΣW에 포함 (D-3)
export const PAIR_WEIGHT_MID = 0.5;        // 색 축 top↔mid·mid↔outer 쌍 가중
export const MID_FORMALITY_TOL = 2;        // 미드 포멀도가 베이스·아우터 사이 ±2 밖이면 warn
export const TWO_OUTER_INNER_WEIGHT = 0.5; // 2겹 아우터: 안쪽 twoOuterRules 점수를 outer 축에 섞는 가중
export const TWO_OUTER_LENGTH_PENALTY = { same: -1, longer: -2 }; // 안쪽 아우터 기장 ≥ 바깥
export const PATTERN_DELTA_MIN = -2;       // 패턴 규칙 delta 합 클램프 (adjust 축과 같은 자리)
export const PATTERN_DELTA_MAX = 1;
export const PATTERN_MAX = { quick: 1, deep: 2 }; // 코디 내 패턴 아이템 상한 (patternRules ptQuickMaxOne·ptDeepMaxTwo와 동일)
export const LAYERING_CANDIDATES_MAX = 100; // Deep + layering: 미드 변형 후보 상한
export const ACCESSORY_GROUP_ORDER = ['belt', 'socks', 'watch', 'bag', 'scarf', 'hat'];
export const ACCESSORY_LINES_MAX = 5;
export const AFFINITY_KINDS = ['topType', 'outerType', 'shoeType', 'material', 'topFit', 'bottomFit', 'trouserLength', 'topLength', 'outerLength', 'color', 'pattern', 'accessory'];
export const ACCESSORY_WHEN_KEYS = ['season', 'shoeType', 'shoesColor', 'shoesMaterial', 'shoesFinish', 'bottomMaterial', 'topType', 'outerType', 'outerPattern', 'trouserLength', 'hasOuter', 'formalityMin', 'formalityMax', 'patternCount', 'accentCount', 'style', 'tuckIn', 'belt', 'watch', 'beltColor', 'material'];
export const ACCESSORY_PICK_KEYS = ['color', 'finish', 'material', 'width', 'metal', 'pattern', 'scale', 'knit', 'skip'];
export const ACCESSORY_COLOR_DERIVED = ['shoesFamily', 'bottomDarker', 'outfit', 'outfitSecondary', 'outerTone2', 'outerPick', 'neutral', 'free'];
export const PATTERN_WHEN_KEYS = ['mode', 'patternCount', 'sameFamily', 'scaleDiff', 'sharedColor', 'pattern', 'otherPattern', 'category', 'bottomColor', 'bottomPattern', 'outerType', 'shoeType', 'outfitTones', 'formalityMin', 'formalityMax', 'accentCount'];
export const PATTERN_FORMALITY_TOL = 2;    // C6-11: 패턴 변주는 코디 평균 포멀도가 패턴 포멀도 ±2 안일 때만 (3 → 2)
export const PATTERN_EFFECTS = ['exclude', 'penalty', 'bonus', 'countAs'];
// 한 톤 어두운 색(양말 bottomDarker 파생) — 없으면 같은 색
export const DARKER_OF = { white: 'lightGrey', offWhite: 'lightGrey', cream: 'beige', oatmeal: 'beige', beige: 'khaki', khaki: 'brown', tan: 'brown', camel: 'brown', brown: 'chocolate', lightGrey: 'midGrey', greyMelange: 'midGrey', midGrey: 'charcoal', charcoal: 'black', navy: 'navy', indigo: 'navy', midDenim: 'indigo', lightDenim: 'midDenim', blackDenim: 'black', lightBlue: 'navy', skyBlue: 'navy', olive: 'forestGreen', sage: 'olive', burgundy: 'burgundy', rust: 'brown', mustard: 'brown', dustyPink: 'burgundy', lavender: 'navy', teal: 'navy', taupe: 'chocolate' };
export const NEUTRAL_ACCESSORY_COLOR = 'charcoal';
// C6-06: 가죽 소품(벨트·가죽 시계·가죽 가방)이 따라가는 '신발 가죽 계열'. 밖의 신발 색(흰 스니커즈·네이비 컬러 스니커즈)은 shoesFamily로 색을 내지 않는다
export const LEATHER_FAMILY = ['brown', 'chocolate', 'tan', 'camel', 'black', 'burgundy'];
export const LEATHER_FAMILY_COLOR = { burgundy: 'chocolate' }; // C6-14: 버건디 구두의 가죽 소품은 다크 브라운
export const LEATHER_ACCESSORY_DEFAULT = 'black';              // 가죽 계열 밖 신발에서 상황 기본 가죽 소품 색

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
  // Phase 6-B-3 (C6-04): 겨울 Deep+layering — 니트 상의 코디를 '셔츠(topShirtColors) + 셔츠 위 니트(원래 니트 색) + 코트'로 다시 쌓는다
  layeringKnitTops: ['knitWool', 'knitCotton', 'knitCashmere'],
  layeringShirt: 'oxfordShirt',
  layeringKnitMid: 'knitOverShirt',
};
