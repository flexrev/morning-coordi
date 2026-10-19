// 더미 데이터 — data-schema.md 와 같은 모양(필요한 필드만). 실데이터(src/data)가 오면 main.js 에서 교체된다.
const ALL = ['springFall', 'summer', 'winter'];

export const colors = [
  { id: 'white', labelKo: '화이트', hex: '#FFFFFF', tones: ['neutral', 'mono'], seasons: ALL },
  { id: 'greyMelange', labelKo: '그레이 멜란지', hex: '#A9A9A9', tones: ['mono'], seasons: ALL },
  { id: 'midGrey', labelKo: '미드 그레이', hex: '#808080', tones: ['neutral', 'mono'], seasons: ALL },
  { id: 'lightBlue', labelKo: '라이트 블루', hex: '#ADD8E6', tones: ['neutral', 'navyBase', 'pastel'], seasons: ['springFall', 'summer'] },
  { id: 'beige', labelKo: '베이지', hex: '#F5F5DC', tones: ['neutral', 'earth'], seasons: ALL },
  { id: 'navy', labelKo: '네이비', hex: '#1F2A44', tones: ['neutral', 'navyBase'], seasons: ALL },
  { id: 'indigo', labelKo: '인디고 데님', hex: '#2E4A7D', tones: ['navyBase'], seasons: ALL },
  { id: 'black', labelKo: '블랙', hex: '#000000', tones: ['neutral', 'mono'], seasons: ALL },
  { id: 'brown', labelKo: '브라운', hex: '#8B5A2B', tones: ['neutral', 'earth'], seasons: ALL },
];

export const labels = [
  { id: 'color.white', label: '화이트', shortLabel: '화이트', aliases: ['흰색'], help: '' },
  { id: 'color.greyMelange', label: '그레이 멜란지', shortLabel: '멜란지', aliases: ['회색 멜란지'], help: '' },
  { id: 'color.midGrey', label: '미드 그레이', shortLabel: '미드그레이', aliases: ['회색'], help: '' },
  { id: 'color.lightBlue', label: '라이트 블루', shortLabel: '라이트블루', aliases: ['하늘색'], help: '' },
  { id: 'color.beige', label: '베이지', shortLabel: '베이지', aliases: [], help: '' },
  { id: 'color.navy', label: '네이비', shortLabel: '네이비', aliases: ['남색'], help: '' },
  { id: 'color.indigo', label: '인디고 데님', shortLabel: '인디고', aliases: ['진청'], help: '' },
  { id: 'color.black', label: '블랙', shortLabel: '블랙', aliases: ['검정'], help: '' },
  { id: 'color.brown', label: '브라운', shortLabel: '브라운', aliases: ['갈색'], help: '' },
  { id: 'tone.neutral', label: '뉴트럴' }, { id: 'tone.earth', label: '어스톤' }, { id: 'tone.mono', label: '모노톤' },
  { id: 'tone.navyBase', label: '네이비 베이스' }, { id: 'tone.accent', label: '포인트' }, { id: 'tone.pastel', label: '파스텔' },
  { id: 'explain.analogous', label: '유사색' }, { id: 'explain.complementary', label: '보색' }, { id: 'explain.achromatic', label: '무채색' },
  { id: 'explain.classic', label: '클래식' }, { id: 'explain.universal', label: '누구나 안전한 기본 조합' }, { id: 'explain.variation', label: '변주' },
  { id: 'explain.disputed', label: '의견이 갈리는 조합' }, { id: 'explain.sources2', label: '출처 {n}개 이상' }, { id: 'explain.toneOnTone', label: '톤온톤 ({tone})' },
  { id: 'ui.classicN', label: '클래식 {n}/3' },
];

export const materials = [
  { id: 'denimIndigo', labelKo: '인디고 데님', seasons: ALL },
  { id: 'chino', labelKo: '치노', seasons: ALL },
  { id: 'wool', labelKo: '울 슬랙스', seasons: ['springFall', 'winter'] },
  { id: 'corduroy', labelKo: '코듀로이', seasons: ['springFall', 'winter'] },
  { id: 'jersey', labelKo: '저지/스웻', seasons: ALL },
  { id: 'knitWool', labelKo: '울 니트', seasons: ['springFall', 'winter'] },
  { id: 'knitCotton', labelKo: '코튼 니트', seasons: ['springFall', 'summer'] },
  { id: 'linen', labelKo: '린넨', seasons: ['summer'] },
  { id: 'leather', labelKo: '가죽', seasons: ALL },
  { id: 'nylonTech', labelKo: '나일론/테크', seasons: ALL },
];

// 베이스 3개: 하의 인디고 · 하의 베이지 · 상의 네이비
export const colorRules = [
  { base: 'indigo', baseCategory: 'bottom', variant: null, labelKo: '인디고 데님',
    matches: [
      { category: 'top', color: 'white', score: 5, tag: 'classic', sources: ['WK1', 'GQK', 'AtG1'], flags: [], note: '불멸의 조합' },
      { category: 'top', color: 'greyMelange', score: 5, tag: 'classic', sources: ['WK1', 'GG'], flags: [], note: '' },
      { category: 'top', color: 'navy', score: 4, tag: 'classic', sources: ['Hack'], flags: [], note: '톤온톤' },
      { category: 'top', color: 'lightBlue', score: 4, tag: 'classic', sources: ['GQK'], flags: [], note: '옥스포드' },
      { category: 'top', color: 'black', score: 3, tag: 'variation', sources: ['GG'], flags: [], note: '' },
      { category: 'shoes', color: 'white', score: 5, tag: 'classic', sources: ['WK1', 'GQK'], flags: [], note: '스니커즈' },
      { category: 'shoes', color: 'brown', score: 5, tag: 'classic', sources: ['GG', 'AtG1'], flags: [], note: '부츠·로퍼' },
      { category: 'shoes', color: 'black', score: 3, tag: 'variation', sources: ['GG', 'FB1'], flags: ['disputed'], note: '진청엔 가능, 연청엔 비추천' },
      { category: 'outer', color: 'navy', score: 5, tag: 'classic', sources: ['Hack', 'WH2'], flags: [], note: '블레이저' },
      { category: 'outer', color: 'beige', score: 4, tag: 'classic', sources: ['GG'], flags: [], note: '트렌치' },
      { category: 'outer', color: 'black', score: 3, tag: 'variation', sources: ['FB1'], flags: [], note: '가죽 재킷' },
    ],
    avoid: [
      { category: 'outer', color: 'indigo', reason: '같은 워시의 데님 재킷은 유니폼처럼 보임', sources: ['AtG3'], ruleId: 'A8' },
      { category: null, color: null, reason: '4색 이상', sources: ['Vou1'], ruleId: 'A11' },
    ] },
  { base: 'beige', baseCategory: 'bottom', variant: null, labelKo: '베이지 치노',
    matches: [
      { category: 'top', color: 'white', score: 5, tag: 'classic', sources: ['WK1', 'GG'], flags: [], note: '' },
      { category: 'top', color: 'navy', score: 5, tag: 'classic', sources: ['GG', 'Acorn', 'Celio'], flags: [], note: '블루-브라운 보색' },
      { category: 'top', color: 'lightBlue', score: 4, tag: 'classic', sources: ['GQK'], flags: [], note: '' },
      { category: 'top', color: 'greyMelange', score: 4, tag: 'classic', sources: ['WK1'], flags: [], note: '' },
      { category: 'shoes', color: 'brown', score: 5, tag: 'classic', sources: ['GG', 'AtG1'], flags: [], note: '로퍼' },
      { category: 'shoes', color: 'white', score: 5, tag: 'classic', sources: ['WK1'], flags: [], note: '' },
      { category: 'shoes', color: 'black', score: 2, tag: 'variation', sources: ['GG'], flags: [], note: '무거워 보임' },
      { category: 'outer', color: 'navy', score: 5, tag: 'classic', sources: ['Hack'], flags: [], note: '' },
      { category: 'outer', color: 'brown', score: 4, tag: 'classic', sources: ['GG'], flags: [], note: '스웨이드' },
    ],
    avoid: [
      { category: 'top', color: 'beige', reason: '상·하 같은 베이지는 밋밋함', sources: ['GG'], ruleId: 'A4' },
    ] },
  { base: 'navy', baseCategory: 'top', variant: null, labelKo: '네이비 니트',
    matches: [
      { category: 'bottom', color: 'beige', score: 5, tag: 'classic', sources: ['GG', 'Acorn'], flags: [], note: '' },
      { category: 'bottom', color: 'indigo', score: 4, tag: 'classic', sources: ['Hack'], flags: [], note: '톤온톤' },
      { category: 'bottom', color: 'midGrey', score: 5, tag: 'classic', sources: ['WH1'], flags: [], note: '슬랙스' },
      { category: 'bottom', color: 'white', score: 4, tag: 'classic', sources: ['GQK'], flags: [], note: '여름' },
      { category: 'shoes', color: 'brown', score: 5, tag: 'classic', sources: ['GG'], flags: [], note: '' },
      { category: 'shoes', color: 'white', score: 4, tag: 'classic', sources: ['WK1'], flags: [], note: '' },
      { category: 'shoes', color: 'black', score: 4, tag: 'classic', sources: ['WH1'], flags: [], note: '슬랙스와' },
    ],
    avoid: [
      { category: 'bottom', color: 'black', reason: '네이비+블랙은 흐릿하게 섞여 보임', sources: ['GG'], ruleId: 'A6' },
    ] },
];

function it(category, color, extra = {}) {
  return { category, color, material: null, fit: null, length: null, shoeType: null, itemType: null, itemName: '', pattern: null, ...extra };
}
const tee = (color, name) => it('top', color, { material: 'jersey', fit: 'regular', length: 'regular', itemType: 'tee', itemName: name });
const sweat = (color, name) => it('top', color, { material: 'jersey', fit: 'loose', length: 'regular', itemType: 'sweatshirt', itemName: name });
const knit = (color, name, m = 'knitWool') => it('top', color, { material: m, fit: 'regular', length: 'regular', itemType: m === 'knitCotton' ? 'knitCotton' : 'knitWool', itemName: name });
const oxford = (color, name) => it('top', color, { material: null, fit: 'regular', length: 'regular', itemType: 'oxfordShirt', itemName: name });
const linenShirt = (color, name) => it('top', color, { material: 'linen', fit: 'loose', length: 'regular', itemType: 'linenShirt', itemName: name });
const denim = (fit = 'straight', length = 'nobreak') => it('bottom', 'indigo', { material: 'denimIndigo', fit, length, itemName: '인디고 데님' });
const chino = (color, name, fit = 'tapered', length = 'nobreak') => it('bottom', color, { material: 'chino', fit, length, itemName: name });
const slacks = (color, name) => it('bottom', color, { material: 'wool', fit: 'tapered', length: 'nobreak', itemName: name });
const cord = (color, name) => it('bottom', color, { material: 'corduroy', fit: 'straight', length: 'nobreak', itemName: name });
const shoe = (color, shoeType, name, material = 'leather') => it('shoes', color, { material, shoeType, itemName: name });
const outer = (color, itemType, name, material, length = 'regular') => it('outer', color, { material, itemType, length, itemName: name });

export const outfits = [
  { id: 'o01', items: [tee('white', '흰 티셔츠'), denim(), shoe('white', 'sneakerWhite', '흰 스니커즈')], seasons: ALL, tags: ['neutral', 'navyBase'], isClassic: true, universal: true, sources: ['WK1', 'GQK', 'AtG1'], flags: [], note: '1순위 기본' },
  { id: 'o02', items: [sweat('greyMelange', '그레이 멜란지 맨투맨'), denim(), shoe('white', 'sneakerWhite', '흰 스니커즈'), outer('navy', 'blazer', '네이비 블레이저', 'wool')], seasons: ['springFall', 'winter'], tags: ['mono', 'navyBase'], isClassic: true, universal: true, sources: ['WK1', 'GG'], flags: [], note: '' },
  { id: 'o03', items: [knit('navy', '네이비 울 니트'), denim(), shoe('brown', 'chukka', '브라운 척카 부츠'), outer('beige', 'trench', '베이지 트렌치', null, 'long')], seasons: ['springFall', 'winter'], tags: ['navyBase', 'earth'], isClassic: true, universal: true, sources: ['Hack', 'GG'], flags: [], note: '' },
  { id: 'o04', items: [oxford('lightBlue', '라이트블루 옥스포드 셔츠'), denim('straight', 'crop'), shoe('brown', 'loaferPenny', '브라운 페니 로퍼')], seasons: ['springFall', 'summer'], tags: ['navyBase'], isClassic: true, universal: false, sources: ['GQK'], flags: [], note: '' },
  { id: 'o05', items: [tee('black', '블랙 티셔츠'), denim('slim'), shoe('black', 'derby', '블랙 더비')], seasons: ['springFall'], tags: ['mono', 'navyBase'], isClassic: false, universal: false, sources: ['GG', 'FB1'], flags: ['disputed'], note: '진청엔 가능, 연청엔 비추천' },
  { id: 'o06', items: [tee('white', '흰 티셔츠'), chino('beige', '베이지 치노'), shoe('white', 'sneakerWhite', '흰 스니커즈')], seasons: ALL, tags: ['neutral', 'earth'], isClassic: true, universal: true, sources: ['WK1', 'GG'], flags: [], note: '' },
  { id: 'o07', items: [knit('navy', '네이비 울 니트'), chino('beige', '베이지 치노'), shoe('brown', 'loaferPenny', '브라운 페니 로퍼'), outer('navy', 'blazer', '네이비 블레이저', 'wool')], seasons: ['springFall', 'winter'], tags: ['neutral', 'earth', 'navyBase'], isClassic: true, universal: true, sources: ['GG', 'Acorn', 'Celio'], flags: [], note: '블루-브라운 보색' },
  { id: 'o08', items: [oxford('lightBlue', '라이트블루 옥스포드 셔츠'), chino('beige', '베이지 치노'), shoe('brown', 'chukka', '브라운 척카 부츠')], seasons: ['springFall', 'summer'], tags: ['neutral', 'pastel'], isClassic: true, universal: false, sources: ['GQK'], flags: [], note: '' },
  { id: 'o09', items: [knit('navy', '네이비 울 니트'), slacks('midGrey', '그레이 울 슬랙스'), shoe('black', 'derby', '블랙 더비'), outer('black', 'chesterfield', '블랙 체스터필드 코트', 'wool', 'long')], seasons: ['winter', 'springFall'], tags: ['mono', 'navyBase', 'business'], isClassic: true, universal: true, sources: ['WH1'], flags: [], note: '' },
  { id: 'o10', items: [knit('navy', '네이비 코튼 니트', 'knitCotton'), chino('white', '화이트 치노'), shoe('brown', 'loaferPenny', '브라운 페니 로퍼')], seasons: ['summer', 'springFall'], tags: ['neutral', 'navyBase', 'resort'], isClassic: true, universal: false, sources: ['GQK'], flags: [], note: '' },
  { id: 'o11', items: [linenShirt('white', '화이트 린넨 셔츠'), chino('beige', '베이지 치노', 'straight', 'crop'), shoe('brown', 'sandal', '브라운 샌들', 'leather')], seasons: ['summer'], tags: ['neutral', 'earth', 'resort'], isClassic: true, universal: false, sources: ['GG'], flags: [], note: '' },
  { id: 'o12', items: [sweat('greyMelange', '그레이 멜란지 맨투맨'), cord('brown', '브라운 코듀로이'), shoe('white', 'sneakerWhite', '흰 스니커즈')], seasons: ['springFall', 'winter'], tags: ['mono', 'earth'], isClassic: true, universal: false, sources: ['VK1'], flags: [], note: '' },
];

export const enums = {
  categories: ['top', 'bottom', 'shoes', 'outer'],
  seasons: ALL,
  tones: ['neutral', 'earth', 'mono', 'navyBase', 'accent', 'pastel'],
};

export const toneRules = {
  hue: {
    analogous: [
      { id: 'blue', labelKo: '블루 계열', colors: ['navy', 'indigo', 'lightBlue'] },
      { id: 'brown', labelKo: '브라운 계열', colors: ['brown', 'beige'] },
    ],
    complementary: [{ a: 'blue', b: 'brown', tag: 'classic' }],
    achromatic: ['white', 'greyMelange', 'midGrey', 'black'],
  },
};

export const data = { enums, colors, labels, materials, colorRules, toneRules, outfits, shoes: [] };
