// R1 7장(c01~c30) ∪ R2 7장(s01~s24) → outfits.json (data-schema 4-15 병합 절차)
// P3-16 ④⑥: R1 품목명 '트라우저' → '울 슬랙스', '흰 티셔츠' → '화이트 티셔츠'(신발 '흰 스니커즈'는 관용 표기 유지)
import { sortSeasons, SEASON_ORDER } from './util.mjs';
import { TOP_TYPES, OUTER_TYPES } from './r2.mjs';

const ALL = [...SEASON_ORDER];
const SF = ['springFall'];
const SU = ['summer'];
const WI = ['winter'];

// ---------------------------------------------------------------- R1 (색 + 품목). 핏·기장은 병합 또는 기본값
// top: [color, itemType, itemName, pattern?]  bottom: [color, material, itemName]  shoes: [color, shoeType, material, itemName]  outer: [color, outerType, itemName] | null
const R1 = [
  { id: 'c01', top: ['white', 'tee', '화이트 티셔츠'], bottom: ['indigo', 'denimIndigo', '인디고 데님'], shoes: ['white', 'sneakerWhite', 'leather', '흰 스니커즈'], outer: null, seasons: ALL, tags: ['neutral', 'navyBase'], universal: true, sources: ['WK1', 'GQK', 'AtG1'], note: '1순위 기본' },
  { id: 'c02', top: ['white', 'tee', '화이트 티셔츠'], bottom: ['indigo', 'denimIndigo', '인디고 데님'], shoes: ['brown', 'chukka', 'leather', '브라운 부츠'], outer: ['camel', 'trench', '카멜 트렌치 코트'], seasons: SF, tags: ['navyBase', 'earth'], universal: true, sources: ['VK1', 'GG'], note: '포멀도 격차 5(티셔츠 2 ↔ 트렌치 7) 경고. 통합 결정 D1로 R1대로 universal 복원', mapped: ['shoes', 'outer'] },
  { id: 'c03', top: ['greyMelange', 'sweatshirt', '그레이 멜란지 맨투맨'], bottom: ['indigo', 'denimIndigo', '인디고 데님'], shoes: ['white', 'sneakerWhite', 'leather', '흰 스니커즈'], outer: ['navy', 'shirtJacket', '네이비 필드 재킷'], seasons: SF, tags: ['mono', 'navyBase'], universal: true, sources: ['Hack', 'FB1'], note: '', mapped: ['outer'] },
  { id: 'c04', top: ['white', 'oxfordShirt', '화이트 옥스포드 셔츠'], bottom: ['navy', 'chino', '네이비 치노'], shoes: ['brown', 'loaferPenny', 'leather', '브라운 로퍼'], outer: null, seasons: ALL, tags: ['neutral', 'business'], universal: true, sources: ['Celio', 'WH2'], note: '', mapped: ['shoes'] },
  { id: 'c05', top: ['lightBlue', 'oxfordShirt', '라이트 블루 옥스포드 셔츠'], bottom: ['beige', 'chino', '베이지 치노'], shoes: ['brown', 'loaferPenny', 'leather', '브라운 로퍼'], outer: ['navy', 'blazer', '네이비 블레이저'], seasons: SF, tags: ['neutral', 'navyBase', 'business'], universal: true, sources: ['AtG2', 'MF'], note: '', mapped: ['shoes'] },
  { id: 'c06', top: ['navy', 'knitWool', '네이비 니트'], bottom: ['beige', 'chino', '베이지 치노'], shoes: ['brown', 'chukka', 'leather', '브라운 부츠'], outer: null, seasons: SF, tags: ['navyBase', 'earth'], universal: true, sources: ['Celio', 'AtG2'], note: '', mapped: ['shoes'] },
  { id: 'c07', top: ['white', 'tee', '화이트 티셔츠'], bottom: ['olive', 'chino', '올리브 치노'], shoes: ['white', 'sneakerWhite', 'leather', '흰 스니커즈'], outer: null, seasons: SU, tags: ['earth', 'neutral'], universal: true, sources: ['AtG2', 'MM', 'Celio'], note: '' },
  { id: 'c08', top: ['white', 'oxfordShirt', '화이트 옥스포드 셔츠'], bottom: ['olive', 'chino', '올리브 치노'], shoes: ['black', 'derby', 'leather', '블랙 더비 부츠'], outer: ['midGrey', 'blazer', '미드 그레이 블레이저'], seasons: SF, tags: ['earth', 'mono'], universal: false, sources: ['AtG2'], note: '더비 부츠는 더비로 근사', mapped: ['shoes'] },
  { id: 'c09', top: ['midGrey', 'knitWool', '미드 그레이 크루넥 니트'], bottom: ['blackDenim', 'denimBlack', '블랙 데님'], shoes: ['black', 'chukka', 'leather', '블랙 스웨이드 척카'], outer: ['navy', 'blouson', '네이비 봄버'], seasons: WI, tags: ['mono', 'navyBase'], universal: false, sources: ['FB1'], note: 'R1 원문은 화이트 옥스포드 위에 미드 그레이 크루넥 레이어. MVP는 상의 1개라 보이는 니트만 기록', mapped: ['top', 'outer'] },
  { id: 'c10', top: ['white', 'tee', '화이트 티셔츠'], bottom: ['blackDenim', 'denimBlack', '블랙 데님'], shoes: ['white', 'sneakerWhite', 'leather', '흰 스니커즈'], outer: ['black', 'leatherJacket', '블랙 가죽 재킷'], seasons: SF, tags: ['mono'], universal: true, sources: ['AtG1', 'FB1'], note: '' },
  { id: 'c11', top: ['black', 'knitWool', '블랙 롤넥 니트'], bottom: ['navy', 'chino', '네이비 치노'], shoes: ['black', 'derby', 'leather', '블랙 더비'], outer: ['midGrey', 'chesterfield', '미드 그레이 더블브레스트 코트'], seasons: WI, tags: ['mono', 'navyBase', 'variation'], universal: false, sources: ['AtG2'], note: '네이비+블랙 변주', mapped: ['outer'] },
  { id: 'c12', top: ['navy', 'knitCotton', '네이비 크루넥 니트'], bottom: ['white', 'denimWashed', '화이트 데님'], shoes: ['brown', 'loaferPenny', 'leather', '브라운 로퍼'], outer: null, seasons: SU, tags: ['navyBase', 'neutral'], universal: false, sources: ['FB2', 'HSS'], note: '화이트 데님은 워시드 데님 소재로 매핑', mapped: ['bottom', 'shoes'] },
  { id: 'c13', top: ['lightBlue', 'denimShirt', '샴브레이 셔츠'], bottom: ['white', 'chino', '화이트 치노'], shoes: ['brown', 'chukka', 'leather', '브라운 스웨이드 데저트 부츠'], outer: null, seasons: SU, tags: ['pastel', 'neutral'], universal: false, sources: ['AtG2'], note: '' },
  { id: 'c14', top: ['cream', 'knitWool', '크림 니트'], bottom: ['olive', 'chino', '올리브 치노'], shoes: ['brown', 'chukka', 'leather', '브라운 부츠'], outer: ['brown', 'shirtJacket', '브라운 재킷'], seasons: SF, tags: ['earth'], universal: false, sources: ['Vou1'], note: '종류 없는 "재킷"은 셔츠 재킷으로 매핑', mapped: ['shoes', 'outer'] },
  { id: 'c15', top: ['oatmeal', 'knitWool', '오트밀 니트'], bottom: ['indigo', 'denimIndigo', '인디고 데님'], shoes: ['brown', 'loaferPenny', 'leather', '브라운 로퍼'], outer: null, seasons: SF, tags: ['earth', 'navyBase'], universal: true, sources: ['VK1', 'AtG4'], note: '', mapped: ['shoes'] },
  { id: 'c16', top: ['lightBlue', 'oxfordShirt', '라이트 블루 셔츠'], bottom: ['charcoal', 'wool', '차콜 울 슬랙스'], shoes: ['black', 'derby', 'leather', '블랙 더비'], outer: ['navy', 'chesterfield', '네이비 코트'], seasons: WI, tags: ['mono', 'navyBase', 'business'], universal: true, sources: ['MF', 'Vou1'], note: '', mapped: ['outer'] },
  { id: 'c17', top: ['white', 'oxfordShirt', '화이트 셔츠'], bottom: ['midGrey', 'flannel', '미드 그레이 플란넬'], shoes: ['brown', 'chukka', 'leather', '브라운 척카'], outer: ['navy', 'blazer', '네이비 블레이저'], seasons: SF, tags: ['mono', 'navyBase', 'business'], universal: true, sources: ['MF', 'RMRS2'], note: '' },
  { id: 'c18', top: ['burgundy', 'knitWool', '버건디 니트'], bottom: ['midGrey', 'wool', '미드 그레이 울 슬랙스'], shoes: ['brown', 'loaferPenny', 'leather', '브라운 로퍼'], outer: null, seasons: WI, tags: ['accent', 'mono'], universal: false, sources: ['Burgundy-guides'], note: '', mapped: ['shoes'] },
  { id: 'c19', top: ['burgundy', 'knitWool', '버건디 니트'], bottom: ['indigo', 'denimIndigo', '인디고 데님'], shoes: ['brown', 'workboot', 'leather', '브라운 부츠'], outer: null, seasons: WI, tags: ['accent', 'navyBase'], universal: false, sources: ['AtG4', 'Studio'], note: '', mapped: ['shoes'] },
  { id: 'c20', top: ['lightBlue', 'oxfordShirt', '라이트 블루 셔츠'], bottom: ['brown', 'corduroy', '브라운 코듀로이'], shoes: ['chocolate', 'chelsea', 'leather', '초콜릿 부츠'], outer: ['navy', 'blazer', '네이비 블레이저'], seasons: WI, tags: ['earth', 'navyBase'], universal: false, sources: ['GG', 'HB'], note: '겨울 부츠, 옥스포드 셔츠(포멀도 6) 문맥이라 첼시로 매핑', mapped: ['shoes'] },
  { id: 'c21', top: ['cream', 'knitWool', '크림 청키 니트'], bottom: ['brown', 'corduroy', '브라운 코듀로이'], shoes: ['tan', 'loaferPenny', 'leather', '탄 스웨이드 로퍼'], outer: null, seasons: WI, tags: ['earth'], universal: false, sources: ['HB', 'Brown-guides'], note: '', mapped: ['shoes'] },
  { id: 'c22', top: ['white', 'tee', '화이트 티셔츠'], bottom: ['lightDenim', 'denimWashed', '라이트워시 데님'], shoes: ['white', 'sneakerWhite', 'leather', '흰 스니커즈'], outer: ['navy', 'blazer', '네이비 블레이저'], seasons: SF, tags: ['navyBase', 'neutral'], universal: true, sources: ['PM'], note: '포멀도 격차 5(티셔츠 2 ↔ 블레이저 7) 경고. 통합 결정 D1로 R1대로 universal 복원' },
  { id: 'c23', top: ['greyMelange', 'tee', '그레이 멜란지 티셔츠'], bottom: ['lightDenim', 'denimWashed', '라이트워시 데님'], shoes: ['tan', 'chukka', 'leather', '탄 스웨이드 부츠'], outer: ['olive', 'shirtJacket', '올리브 필드 재킷'], seasons: SF, tags: ['earth', 'navyBase'], universal: false, sources: ['PM', 'MM'], note: '', mapped: ['shoes', 'outer'] },
  { id: 'c24', top: ['navy', 'tee', '브레통 스트라이프 티', 'breton'], bottom: ['indigo', 'denimIndigo', '인디고 데님'], shoes: ['white', 'sneakerWhite', 'leather', '흰 스니커즈'], outer: null, seasons: SU, tags: ['navyBase'], universal: false, sources: ['Dalm'], note: '' },
  { id: 'c25', top: ['navy', 'tee', '브레통 스트라이프 티', 'breton'], bottom: ['beige', 'chino', '베이지 치노'], shoes: ['brown', 'loaferPenny', 'leather', '브라운 로퍼'], outer: ['navy', 'peacoat', '네이비 피코트'], seasons: SF, tags: ['navyBase', 'neutral'], universal: false, sources: ['Dalm', 'MRP-stripes'], note: '포멀도 격차 5(티셔츠 2 ↔ 피코트 7) 경고. 통합 결정 D1로 클래식 복원', mapped: ['shoes'] },
  { id: 'c26', top: ['black', 'knitWool', '블랙 롤넥 니트'], bottom: ['black', 'wool', '블랙 울 슬랙스'], shoes: ['black', 'chelsea', 'leather', '블랙 첼시 부츠'], outer: ['forestGreen', 'blazer', '포레스트 그린 블레이저'], seasons: WI, tags: ['mono', 'accent'], universal: false, sources: ['AtG1'], note: '' },
  { id: 'c27', top: ['white', 'tee', '화이트 티셔츠'], bottom: ['beige', 'chino', '베이지 카고/치노'], shoes: ['white', 'sneakerWhite', 'leather', '흰 스니커즈'], outer: ['olive', 'shirtJacket', '올리브 초어 재킷'], seasons: SF, tags: ['earth', 'neutral'], universal: false, sources: ['AtG1'], note: '', mapped: ['outer'] },
  { id: 'c28', top: ['lightGrey', 'tee', '라이트 그레이 티셔츠'], bottom: ['charcoal', 'wool', '차콜 울 슬랙스'], shoes: ['white', 'sneakerWhite', 'leather', '흰 스니커즈'], outer: null, seasons: SU, tags: ['mono'], universal: false, sources: ['AtG1', 'MF'], note: '그레이 톤온톤. 포멀도 격차 5(티셔츠 2 ↔ 울 슬랙스 7) 경고. 통합 결정 D1로 클래식 복원' },
  { id: 'c29', top: ['greyMelange', 'hoodie', '그레이 멜란지 후디'], bottom: ['indigo', 'denimIndigo', '인디고 데님'], shoes: ['white', 'sneakerWhite', 'leather', '흰 스니커즈'], outer: ['brown', 'chesterfield', '브라운 코트'], seasons: WI, tags: ['earth', 'navyBase', 'variation'], universal: false, sources: ['AtG1'], note: '종류 없는 겨울 "코트"는 체스터필드로 매핑. R1 태그에 variation 포함', mapped: ['outer'] },
  { id: 'c29v', top: ['forestGreen', 'hoodie', '포레스트 그린 후디'], bottom: ['indigo', 'denimIndigo', '인디고 데님'], shoes: ['white', 'sneakerWhite', 'leather', '흰 스니커즈'], outer: ['brown', 'chesterfield', '브라운 코트'], seasons: WI, tags: ['earth', 'navyBase', 'accent', 'variation'], universal: false, sources: ['AtG1'], note: 'c29의 괄호 변주(브라운+그린)', mapped: ['outer'] },
  { id: 'c30', top: ['dustyPink', 'linenShirt', '더스티 핑크 린넨 셔츠'], bottom: ['white', 'chino', '화이트 치노'], shoes: ['brown', 'loaferPenny', 'leather', '브라운 로퍼'], outer: null, seasons: SU, tags: ['pastel', 'neutral', 'variation'], universal: false, sources: ['AtG1', 'WH1'], note: '', mapped: ['shoes'] },
];

// ---------------------------------------------------------------- R2 (핏·소재·기장·신발). 색은 병합 또는 colorRules로 보충
// top: [itemType, fit, length, (itemName)]  outers: [[outerType, itemName?]...]  bottom: [material, fit, length]
const R2 = [
  { id: 's01', season: SF, top: ['tee', 'regular', 'regular'], outers: [], bottom: ['denimIndigo', 'straight', 'nobreak'], shoe: 'sneakerWhite', tag: 'classic', memo: '1순위 기본' },
  { id: 's02', season: SF, top: ['knitCotton', 'regular', 'regular'], outers: [['denimJacket']], bottom: ['chino', 'tapered', 'nobreak'], shoe: 'chukka', tag: 'classic', memo: '봄가을 캐주얼 기본' },
  { id: 's03', season: SF, top: ['oxfordShirt', 'regular', 'regular'], outers: [['blazer']], bottom: ['chino', 'tapered', 'nobreak'], shoe: 'loaferPenny', tag: 'classic', memo: '비즈니스 캐주얼 기본(턱인)', tags: ['business'] },
  { id: 's04', season: SF, top: ['knitWool', 'regular', 'regular'], outers: [['trench']], bottom: ['wool', 'tapered', 'half'], shoe: 'derby', tag: 'classic', memo: '출근 클래식', tags: ['business'] },
  { id: 's05', season: SF, top: ['sweatshirt', 'loose', 'regular'], outers: [['coachJacket']], bottom: ['denimWashed', 'straight', 'nobreak'], shoe: 'sneakerColor', tag: 'classic', memo: '스트릿 기본', tags: ['street'] },
  { id: 's06', season: SF, top: ['oxfordShirt', 'slim', 'regular'], outers: [], bottom: ['wool', 'wide', 'half'], shoe: 'loaferPenny', tag: 'variation', memo: '2025 "큰 바지 + 작은 상의"(턱인)' },
  { id: 's07', season: SF, top: ['tee', 'regular', 'crop'], outers: [['blouson']], bottom: ['chino', 'wide', 'nobreak'], shoe: 'sneakerWhite', tag: 'variation', memo: '숏 위 + 와이드 아래', tags: ['street'] },
  { id: 's08', season: SF, top: ['oxfordShirt', 'loose', 'regular', '코튼 셔츠 재킷'], outers: [], bottom: ['denimIndigo', 'tapered', 'nobreak'], shoe: 'derby', tag: 'classic', memo: '루즈 상의 + 테이퍼드(계획서 예시). 셔츠 재킷을 상의로 입음 → oxfordShirt로 매핑', mapped: ['top'] },
  { id: 's09', season: SF, top: ['knitWool', 'regular', 'regular'], outers: [['cardigan']], bottom: ['corduroy', 'tapered', 'nobreak'], shoe: 'loaferPenny', tag: 'classic', memo: '늦가을(W Korea 조합)', sources: ['WKCORD'] },
  { id: 's10', season: SU, top: ['linenShirt', 'regular', 'regular'], outers: [], bottom: ['chino', 'tapered', 'crop'], shoe: 'loaferPenny', tag: 'classic', memo: '여름 기본(노삭스)' },
  { id: 's11', season: SU, top: ['tee', 'regular', 'regular'], outers: [], bottom: ['denimWashed', 'straight', 'crop'], shoe: 'sneakerWhite', shoeMaterial: null, tag: 'classic', memo: '캔버스 스니커즈' },
  { id: 's12', season: SU, top: ['poloPique', 'regular', 'regular'], outers: [], bottom: ['wool', 'wide', 'nobreak'], shoe: 'loaferTassel', tag: 'classic', memo: '여름 출근(트로피컬 울)', tags: ['business'] },
  { id: 's13', season: SU, top: ['tank', 'slim', 'regular'], outers: [['overshirt', '린넨 오버셔츠']], bottom: ['linen', 'wide', 'crop'], shoe: 'sandal', tag: 'variation', memo: '휴양·주말', tags: ['resort', 'weekend'] },
  { id: 's14', season: SU, top: ['tee', 'regular', 'crop'], outers: [], bottom: ['nylonTech', 'tapered', 'nobreak'], shoe: 'running', tag: 'classic', memo: '고프코어', tags: ['street'] },
  { id: 's15', season: SU, top: ['linenShirt', 'regular', 'regular', '반팔 셔츠'], outers: [], bottom: ['chino', 'wide', 'crop'], shoe: 'sneakerWhite', tag: 'classic', memo: '2025 여름 기본. 반팔 셔츠 → linenShirt로 매핑', mapped: ['top'] },
  { id: 's16', season: WI, top: ['knitWool', 'regular', 'regular'], outers: [['chesterfield']], bottom: ['wool', 'tapered', 'half'], shoe: 'derby', tag: 'classic', memo: '겨울 출근', tags: ['business'] },
  { id: 's17', season: WI, top: ['knitCashmere', 'slim', 'regular'], outers: [['chesterfield', '싱글 코트']], bottom: ['denimBlack', 'slim', 'nobreak'], shoe: 'chelsea', tag: 'classic', memo: '롱 코트 + 슬림' },
  { id: 's18', season: WI, top: ['flannelShirt', 'regular', 'regular'], outers: [['duffle']], bottom: ['corduroy', 'straight', 'half'], shoe: 'workboot', tag: 'classic', memo: '겨울 캐주얼', tags: ['weekend'] },
  { id: 's19', season: WI, top: ['knitWool', 'loose', 'regular'], outers: [['peacoat']], bottom: ['denimIndigo', 'tapered', 'nobreak'], shoe: 'chelsea', tag: 'classic', memo: '' },
  { id: 's20', season: WI, top: ['hoodie', 'oversized', 'regular'], outers: [['shortPuffer']], bottom: ['denimIndigo', 'wide', 'full'], shoe: 'sneakerColor', tag: 'variation', memo: '스트릿 겨울', tags: ['street'] },
  { id: 's21', season: WI, top: ['tee', 'regular', 'regular'], outers: [['fleece']], bottom: ['chino', 'straight', 'nobreak'], shoe: 'sneakerWhite', tag: 'classic', memo: '겨울 주말. 플리스를 상의로 입음 → 티셔츠 + 플리스 아우터로 매핑', tags: ['weekend'], mapped: ['outer'] },
  { id: 's22', season: WI, top: ['tee', 'regular', 'regular'], outers: [['leatherJacket'], ['chesterfield', '롱 코트']], bottom: ['denimBlack', 'slim', 'nobreak'], shoe: 'chelsea', tag: 'variation', memo: '2겹 아우터' },
  { id: 's23', season: WI, top: ['knitWool', 'regular', 'regular'], outers: [['balmacaan']], bottom: ['flannel', 'tapered', 'half'], shoe: 'loaferTassel', tag: 'classic', memo: '드레시 겨울(양말)', tags: ['business'] },
  { id: 's24', season: WI, top: ['sweatshirt', 'loose', 'regular'], outers: [['longPuffer']], bottom: ['jersey', 'tapered', 'nobreak', '스웻팬츠'], shoe: 'running', tag: 'classic', memo: '한파·동네', tags: ['weekend'] },
];

/** 병합 쌍 (조인 키 = bottom.material + shoeType + outerType|none, 같은 classic 여부) — C2 판단 */
export const MERGE_PAIRS = [['c01', 's01'], ['c05', 's03'], ['c16', 's16']];

const REP_COLOR = { denimIndigo: 'indigo', denimWashed: 'lightDenim', denimBlack: 'blackDenim', chino: 'beige', wool: 'midGrey', flannel: 'charcoal', corduroy: 'brown', linen: 'white', jersey: 'greyMelange', nylonTech: 'black' };
const MAT_LABEL = { denimIndigo: '인디고 데님', denimWashed: '워시드 데님', denimBlack: '블랙 데님', chino: '치노', wool: '울 슬랙스', flannel: '플란넬 슬랙스', corduroy: '코듀로이', linen: '린넨 팬츠', jersey: '스웻팬츠', nylonTech: '테크 팬츠' };
const SHOE_LABEL = { sneakerWhite: '흰 스니커즈', sneakerColor: '컬러 스니커즈', running: '러닝화', loaferPenny: '페니 로퍼', loaferTassel: '태슬 로퍼', derby: '더비', oxford: '옥스포드', chelsea: '첼시 부츠', workboot: '워크 부츠', chukka: '척카 부츠', sandal: '샌들' };
const COLOR_NAME = { white: '화이트', offWhite: '오프화이트', cream: '크림', oatmeal: '오트밀', beige: '베이지', khaki: '카키', tan: '탄', camel: '카멜', brown: '브라운', chocolate: '초콜릿', lightGrey: '라이트 그레이', greyMelange: '그레이 멜란지', midGrey: '미드 그레이', charcoal: '차콜', black: '블랙', navy: '네이비', indigo: '인디고', midDenim: '중청', lightDenim: '연청', blackDenim: '블랙', lightBlue: '라이트 블루', skyBlue: '스카이 블루', olive: '올리브', forestGreen: '포레스트 그린', sage: '세이지', burgundy: '버건디', rust: '러스트', mustard: '머스터드', dustyPink: '더스티 핑크', lavender: '라벤더', teal: '틸', taupe: '토프' };
const TOP_NAME = { dressShirtTie: '드레스 셔츠+타이', dressShirt: '드레스 셔츠', oxfordShirt: '옥스포드 셔츠', poloWool: '울 폴로', knitWool: '울 니트', knitCashmere: '캐시미어 니트', linenShirt: '린넨 셔츠', flannelShirt: '플란넬 셔츠', knitCotton: '코튼 니트', poloPique: '피케 폴로', denimShirt: '데님 셔츠', henley: '헨리넥', tee: '티셔츠', sweatshirt: '맨투맨', hoodie: '후디', tank: '탱크톱' };
const OUTER_NAME = { denimJacket: '데님 재킷', coachJacket: '코치 재킷', blouson: '블루종', cardigan: '가디건', shirtJacket: '셔츠 재킷', trench: '트렌치 코트', blazer: '블레이저', overshirt: '오버셔츠', chesterfield: '체스터필드 코트', balmacaan: '발마칸 코트', duffle: '더플 코트', peacoat: '피코트', shortPuffer: '숏 패딩', longPuffer: '롱 패딩', fleece: '플리스', leatherJacket: '가죽 재킷' };
const SHOE_MATERIAL = (s) => (['running', 'sandal'].includes(s) ? 'nylonTech' : 'leather');
const topType = (id) => TOP_TYPES.find((t) => t.id === id);
const outerType = (id) => OUTER_TYPES.find((o) => o.id === id);

const item = (category, color, material, fit, length, shoeType, itemType, itemName, pattern = null, layer) => {
  const it = { category, color, material, fit, length, shoeType, itemType, itemName, pattern };
  if (layer) it.layer = layer;
  return it;
};

export function buildOutfits({ colorRules, colors }, log) {
  const colorLabel = (id) => COLOR_NAME[id] ?? colors.find((c) => c.id === id)?.labelKo ?? id;
  const ruleOf = (base, cat) => colorRules.find((r) => r.base === base && r.baseCategory === cat && r.variant === null);
  const classicMatches = (base, category, min = 5) => (ruleOf(base, 'bottom')?.matches ?? []).filter((m) => m.category === category && m.tag === 'classic' && m.score >= min);
  const pickTop = (base) => (classicMatches(base, 'top', 5)[0] ?? classicMatches(base, 'top', 4)[0])?.color ?? null;
  const pickShoes = (base, shoeType) => {
    if (shoeType === 'sneakerWhite') return 'white';
    const ms = [...classicMatches(base, 'shoes', 5), ...classicMatches(base, 'shoes', 4)];
    if (['sneakerColor', 'running'].includes(shoeType)) {
      const any = (ruleOf(base, 'bottom')?.matches ?? []).filter((m) => m.category === 'shoes' && m.score >= 3);
      return ['navy', 'black', 'white'].find((c) => any.some((m) => m.color === c)) ?? ms[0]?.color ?? 'black';
    }
    return ms.find((m) => m.color !== 'white')?.color ?? ms[0]?.color ?? 'brown';
  };
  const pickOuter = (base, type, exclude = []) => {
    if (type === 'denimJacket') return 'indigo';
    const ms = [...classicMatches(base, 'outer', 5), ...classicMatches(base, 'outer', 4)].filter((m) => !exclude.includes(m.color));
    if (['leatherJacket'].includes(type)) return ms.find((m) => ['black', 'brown', 'chocolate'].includes(m.color))?.color ?? ms[0]?.color ?? 'black';
    if (['shortPuffer', 'longPuffer', 'fleece', 'coachJacket', 'blouson'].includes(type)) return ms.find((m) => ['black', 'navy', 'olive'].includes(m.color))?.color ?? ms[0]?.color ?? 'navy';
    return ms[0]?.color ?? 'navy';
  };

  const tonesOf = (id) => colors.find((c) => c.id === id)?.tones ?? [];
  const toneTags = (items) => {
    const top = items.find((i) => i.category === 'top');
    const bottom = items.find((i) => i.category === 'bottom');
    const shared = tonesOf(top.color).filter((t) => tonesOf(bottom.color).includes(t) && t !== 'pastel' && t !== 'accent');
    const out = shared.length ? shared : [tonesOf(bottom.color)[0], tonesOf(top.color)[0]];
    if (items.filter((i) => tonesOf(i.color).includes('accent')).length === 1) out.push('accent');
    return [...new Set(out.filter(Boolean))];
  };

  const r2ById = new Map(R2.map((s) => [s.id, s]));
  const mergedS = new Map(MERGE_PAIRS.map(([c, s]) => [c, s]));
  const consumed = new Set(MERGE_PAIRS.map(([, s]) => s));

  const fromR1 = (c) => {
    const s = mergedS.has(c.id) ? r2ById.get(mergedS.get(c.id)) : null;
    const flags = [];
    const [tc, tt, tn, pattern] = c.top;
    const tType = topType(tt);
    const top = item('top', tc, tType.material, s ? s.top[1] : 'regular', s ? s.top[2] : 'regular', null, tt, tn, pattern ?? null);
    const [bc, bm, bn] = c.bottom;
    const bottom = item('bottom', bc, s ? s.bottom[0] : bm, s ? s.bottom[1] : 'regular', s ? s.bottom[2] : 'nobreak', null, null, bn);
    const [sc, st, sm, sn] = c.shoes;
    const shoes = item('shoes', sc, sm, null, null, st, null, sn);
    const items = [top, bottom, shoes];
    if (c.outer) { const [oc, ot, on] = c.outer; items.push(item('outer', oc, outerType(ot).material, null, outerType(ot).length, null, ot, on)); }
    if (c.mapped) flags.push('mapped');
    if (!s) flags.push('styleAssigned');
    const tags = [...c.tags];
    if (s?.tags) for (const t of s.tags) if (!tags.includes(t)) tags.push(t);
    const isClassic = !tags.includes('variation');
    const sources = [...c.sources];
    if (s) { sources.push('R2 7'); if (s.sources) sources.push(...s.sources); }
    return { id: null, mergedFrom: s ? [c.id, s.id] : [c.id], items, seasons: sortSeasons(c.seasons), tags, isClassic, universal: c.universal && isClassic, sources: [...new Set(sources)], flags, note: [c.note, s?.memo].filter(Boolean).join(' / ') };
  };

  const fromR2 = (s) => {
    const [bm, bf, bl, bName] = s.bottom;
    const bc = REP_COLOR[bm];
    const flags = ['colorAssigned'];
    if (s.mapped) flags.push('mapped');
    const [tt, tf, tl, tName] = s.top;
    const tType = topType(tt);
    let tc = pickTop(bc);
    if (!tc) { tc = 'black'; log.add('colorAssigned', `${s.id}: 하의 ${bc}(${bm})에 colorRules 베이스 없음 → 상의 black 수동 지정`); }
    const shoeMaterial = s.shoeMaterial === null ? null : SHOE_MATERIAL(s.shoe);
    let sc = ruleOf(bc, 'bottom') ? pickShoes(bc, s.shoe) : (s.shoe === 'sneakerWhite' ? 'white' : 'black');
    const top = item('top', tc, tType.material, tf, tl, null, tt, `${colorLabel(tc)} ${tName ?? TOP_NAME[tt]}`);
    const bottom = item('bottom', bc, bm, bf, bl, null, null, bName ? `${colorLabel(bc)} ${bName}` : (bm.startsWith('denim') ? colors.find((c) => c.id === bc).labelKo : `${colorLabel(bc)} ${MAT_LABEL[bm]}`));
    const shoes = item('shoes', sc, shoeMaterial, null, null, s.shoe, null, s.shoe === 'sneakerWhite' ? '흰 스니커즈' : `${colorLabel(sc)} ${SHOE_LABEL[s.shoe]}`);
    const items = [top, bottom, shoes];
    const usedOuter = [tc];
    s.outers.forEach(([ot, oName], i) => {
      const o = outerType(ot);
      const oc = ruleOf(bc, 'bottom') ? pickOuter(bc, ot, usedOuter) : 'black';
      usedOuter.push(oc);
      items.push(item('outer', oc, o.material, null, o.length, null, ot, `${colorLabel(oc)} ${oName ?? OUTER_NAME[ot]}`, null, s.outers.length > 1 ? i + 1 : undefined));
    });
    const tags = toneTags(items);
    if (s.tag === 'variation') tags.push('variation');
    if (s.tags) tags.push(...s.tags);
    const isClassic = s.tag === 'classic';
    return { id: null, mergedFrom: [s.id], items, seasons: sortSeasons(s.season), tags: [...new Set(tags)], isClassic, universal: false, sources: ['R2 7', ...(s.sources ?? [])], flags, note: s.memo };
  };

  const r1 = R1.map(fromR1);
  const r2 = R2.filter((s) => !consumed.has(s.id)).map(fromR2);
  const ordered = [...r1.filter((o) => o.universal), ...r1.filter((o) => !o.universal), ...r2];
  ordered.forEach((o, i) => { o.id = `o${String(i + 1).padStart(2, '0')}`; });
  for (const o of ordered) log.add('outfit', `${o.id} ← ${o.mergedFrom.join('+')}${o.universal ? ' ★' : ''}${o.flags.length ? ` [${o.flags.join(',')}]` : ''}: ${o.items.map((i) => i.itemName).join(' · ')}`);
  return ordered.map(({ id, mergedFrom, items, seasons, tags, isClassic, universal, sources, flags, note }) => ({ id, mergedFrom, items, seasons, tags, isClassic, universal, sources, flags, note }));
}
