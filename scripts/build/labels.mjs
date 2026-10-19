// labels.ko.json 초안 — data-schema 4-16, R2 8장, R1 A15, gate-2 3절 6항(shortLabel ≤ 6자)
import { TOP_TYPES, OUTER_TYPES } from './r2.mjs';

const L = (id, label, shortLabel, aliases = [], help = '') => ({ id, label, shortLabel, aliases, help });

const COLORS = {
  white: ['화이트', '화이트', ['흰색', '백색']], offWhite: ['오프화이트', '오프화이트', ['에크루', '아이보리']], cream: ['크림', '크림', ['아이보리']],
  oatmeal: ['오트밀', '오트밀', ['귀리색']], beige: ['베이지', '베이지', ['연베이지']], khaki: ['카키', '카키', ['황갈색', '카키 베이지', '베이지 계열'], "베이지 계열 황갈색. 한국에서 흔히 '카키'로 부르는 국방색은 '올리브'를 고르세요"],
  tan: ['탄', '탄', ['황토', '연갈색']], camel: ['카멜', '카멜', ['낙타색']], brown: ['브라운', '브라운', ['갈색']], chocolate: ['초콜릿', '초콜릿', ['다크 브라운', '진갈색']],
  lightGrey: ['라이트 그레이', '라이트그레이', ['연회색']], greyMelange: ['그레이 멜란지', '멜란지', ['멜란지', '마를']], midGrey: ['미드 그레이', '미드그레이', ['회색', '그레이']], charcoal: ['차콜', '차콜', ['진회색']],
  black: ['블랙', '블랙', ['검정']], navy: ['네이비', '네이비', ['곤색', '남색']], indigo: ['인디고', '인디고', ['진청', '생지', '원워시', '인디고 데님']], midDenim: ['미드워시 데님', '중청', ['중청']],
  lightDenim: ['라이트워시 데님', '연청', ['연청', '라이트 워시']], blackDenim: ['블랙 데님', '블랙데님', ['흑청']], lightBlue: ['라이트 블루', '라이트블루', ['하늘색', '옥스포드 블루']], skyBlue: ['스카이 블루', '스카이블루', ['하늘색']],
  olive: ['올리브', '올리브', ['카키그린', '국방색', '카키']], forestGreen: ['포레스트 그린', '포레스트', ['딥그린', '보틀그린']], sage: ['세이지', '세이지', ['세이지 그린']], burgundy: ['버건디', '버건디', ['와인', '보르도']],
  rust: ['러스트', '러스트', ['번트 오렌지', '벽돌색']], mustard: ['머스터드', '머스터드', ['겨자색']], dustyPink: ['더스티 핑크', '더스티핑크', ['더스티 로즈']], lavender: ['라벤더', '라벤더', ['연보라']],
  teal: ['틸', '틸', ['청록']], taupe: ['토프', '토프', ['회갈색']],
};
const TONES = { neutral: ['뉴트럴', '뉴트럴', ['중립색']], earth: ['어스톤', '어스톤', ['흙색', '자연색']], mono: ['모노톤', '모노톤', ['무채색']], navyBase: ['네이비 베이스', '네이비', ['블루 계열']], accent: ['포인트 컬러', '포인트', ['악센트']], pastel: ['파스텔', '파스텔', []] };
const SEASONS = { springFall: ['봄가을', '봄가을', ['간절기'], '3~5월, 10~11월'], summer: ['여름', '여름', [], '6~9월'], winter: ['겨울', '겨울', [], '12~2월'] };
const CATEGORIES = { top: ['상의', '상의', ['탑']], bottom: ['하의', '하의', ['바지', '팬츠']], shoes: ['신발', '신발', ['슈즈']], outer: ['아우터', '아우터', ['겉옷', '재킷', '코트']] };
const MATERIALS = {
  denimIndigo: ['인디고 데님', '인디고데님', ['진청', '생지', '로우 데님', '청바지'], '진청·생지. 가장 포멀한 데님'], denimWashed: ['워시드 데님', '워시드데님', ['연청', '중청', '청바지'], '연청·중청. 가장 캐주얼한 데님'],
  denimBlack: ['블랙 데님', '블랙데님', ['흑청'], ''], corduroy: ['코듀로이', '코듀로이', ['골덴', '코르덴'], ''], chino: ['치노', '치노', ['면바지', '치노 팬츠', '코튼 팬츠'], '면바지'],
  wool: ['울', '울', ['울 슬랙스', '슬랙스', '정장 바지', '트라우저', '울 팬츠'], '하의로 쓰이면 울 슬랙스'], flannel: ['플란넬', '플란넬', ['후란넬', '기모 울'], '바지는 플란넬 슬랙스(울). 코튼 플란넬 셔츠와 다름'],
  knitCotton: ['코튼 니트', '코튼니트', ['면 니트'], ''], knitWool: ['울 니트', '울니트', ['메리노', '램스울'], ''], knitCashmere: ['캐시미어 니트', '캐시미어', [], ''],
  linen: ['린넨', '린넨', ['마'], ''], jersey: ['저지/스웻', '저지', ['티셔츠', '스웻', '트레이닝'], ''], leather: ['가죽', '가죽', ['레더', '스웨이드'], ''],
  nylonTech: ['나일론/테크', '나일론', ['테크', '셸', '패딩'], ''], tweed: ['트위드', '트위드', [], ''],
};
const TOP_FITS = { slim: ['슬림', '슬림', ['스키니', '타이트'], '몸에 붙음'], regular: ['레귤러', '레귤러', ['정핏'], '손가락 2~3개 여유'], loose: ['루즈', '루즈', ['루즈핏', '릴렉스드', '세미오버'], '어깨선이 2~5cm 내려감'], oversized: ['오버', '오버', ['오버핏', '오버사이즈', '박시'], '어깨선 5cm 이상 드롭'] };
const BOTTOM_FITS = { slim: ['슬림', '슬림', ['스키니'], '밑단 단면 17cm 이하'], tapered: ['테이퍼드', '테이퍼드', ['발목으로 좁아지는'], '허벅지 여유, 발목으로 좁아짐'], regular: ['레귤러', '레귤러', ['정핏'], ''], straight: ['스트레이트', '스트레이트', ['일자', '세미와이드'], ''], wide: ['와이드', '와이드', ['통바지', '세미와이드', '배기', '벌룬'], ''] };
const TOP_LEN = { crop: ['크롭', '크롭', [], '벨트 라인 또는 그 위'], regular: ['레귤러', '레귤러', [], '엉덩이 중간'], long: ['롱', '롱', ['롱 셔츠', '롱 니트'], '엉덩이 아래'] };
const OUTER_LEN = { short: ['숏', '숏', ['블루종 기장'], '허리~엉덩이 상단'], regular: ['레귤러', '레귤러', ['하프 코트'], '엉덩이 덮음'], long: ['롱', '롱', ['롱 코트'], '무릎 근처 이상'] };
const TROUSER_LEN = { crop: ['크롭', '크롭', ['9부', '8부', '앵클'], '발목 위 3~6cm'], nobreak: ['노브레이크', '노브레이크', ['발목 기장', '정기장'], '밑단이 신발에 닿을락 말락'], half: ['하프 브레이크', '하프', ['원브레이크'], '신발에 살짝 닿아 주름 한 번'], full: ['풀 브레이크', '풀', ['기장 길게'], '신발 위로 원단이 쌓임'] };
const SHOES = {
  sneakerWhite: ['흰 스니커즈', '흰스니커즈', ['운동화', '화이트 스니커즈'], '가죽형이면 슬랙스 OK'], sneakerColor: ['컬러 스니커즈', '컬러스니커즈', ['레트로 스니커즈', '운동화'], ''], running: ['러닝화', '러닝화', ['런닝화', '러닝 슈즈'], ''],
  loaferPenny: ['페니 로퍼', '페니로퍼', ['로퍼'], ''], loaferTassel: ['태슬 로퍼', '태슬로퍼', ['비트 로퍼'], ''], derby: ['더비', '더비', ['구두', '단화'], '끈 부분이 열린 구두'], oxford: ['옥스포드', '옥스포드', ['구두'], '끈 부분이 닫힌 구두'],
  chelsea: ['첼시 부츠', '첼시부츠', ['첼시', '사이드고어'], ''], workboot: ['워크 부츠', '워크부츠', ['워커', '레드윙', '팀버랜드'], ''], chukka: ['척카 부츠', '척카부츠', ['데저트 부츠', '클락스'], '데저트 부츠 포함'], sandal: ['샌들/슬리퍼', '샌들', ['쪼리', '슬라이드', '버켄'], ''],
};
const TAGS = { neutral: '뉴트럴', earth: '어스톤', mono: '모노톤', navyBase: '네이비 베이스', accent: '포인트', pastel: '파스텔', variation: '변주', street: '스트릿', business: '비즈니스', weekend: '주말', resort: '휴양' };
const OUTER_ALIASES = { denimJacket: ['청자켓', '트러커'], blouson: ['항공점퍼', 'MA-1', '봄버', '해링턴'], shirtJacket: ['셔켓', '오버셔츠'], chesterfield: ['롱코트', '싱글 코트'], balmacaan: ['롱코트', '래글런 코트'], fleece: ['뽀글이', '후리스'], shortPuffer: ['숏 패딩'], longPuffer: ['벤치 파카', '롱 패딩'], trench: ['바바리'] };
const OUTER_SHORT = { denimJacket: '데님재킷', coachJacket: '코치재킷', blouson: '블루종', cardigan: '가디건', shirtJacket: '셔츠재킷', trench: '트렌치', blazer: '블레이저', overshirt: '오버셔츠', chesterfield: '체스터필드', balmacaan: '발마칸', duffle: '더플코트', peacoat: '피코트', shortPuffer: '숏패딩', longPuffer: '롱패딩', fleece: '플리스', leatherJacket: '가죽재킷' };
// 품목명 합성용 라벨(R2 labelKo의 괄호·슬래시 설명 제거 — '그레이 멜란지 맨투맨/스웻셔츠' 방지, P3-16)
const TOP_LABEL = { sweatshirt: '맨투맨', henley: '헨리넥', dressShirtTie: '드레스 셔츠(타이)' };
const OUTER_LABEL = { blouson: '블루종', overshirt: '오버셔츠', chesterfield: '체스터필드 코트' };
const TOP_SHORT = { dressShirtTie: '셔츠+타이', dressShirt: '드레스셔츠', oxfordShirt: '옥스포드', poloWool: '울폴로', knitWool: '울니트', knitCashmere: '캐시미어', linenShirt: '린넨셔츠', flannelShirt: '플란넬셔츠', knitCotton: '코튼니트', poloPique: '피케폴로', denimShirt: '데님셔츠', henley: '헨리넥', tee: '티셔츠', sweatshirt: '맨투맨', hoodie: '후디', tank: '탱크톱' };

export const EXPLAIN = {
  'explain.classic': '클래식',
  'explain.universal': '누구나 안전한 기본 조합',
  'explain.variation': '변주',
  'explain.sources2': '출처 {n}개 이상',
  'explain.toneOnTone': '톤온톤 ({tone})',
  'explain.analogous': '유사색',
  'explain.complementary': '보색(탁한)',
  'explain.achromatic': '무채색 조합',
  'explain.toneCross': '{from}+{to} 조합 (+1)',
  'explain.seasonOut': '{color|은는} {season}에 어색해요 ({delta})',
  'explain.seasonItem': '{item|은는} {season}용이 아니에요',
  'explain.formalityGap': '격식 차이 {gap}단계 ({hi} ↔ {lo})',
  'explain.fourColors': '색이 4개 이상',
  'explain.sameColor': '상·하의 같은 색',
  'explain.fitScore': '핏 밸런스 {score}/5',
  'explain.shoeScore': '신발 조합 {score}/5',
  'explain.matScore': '소재 궁합 {score}/5',
  'explain.matClash': '{a}+{b|은는} 소재가 안 맞아요',
  'explain.adventurous': '모험적인 조합',
  'explain.avoid': '피하는 조합: {reason}',
  'explain.disputed': '의견이 갈리는 조합',
  'explain.ruleMissing': '규칙 없음(기본 3)',
  'explain.adjust': '{reason} ({delta})',
  'explain.shoeLength': '바지 기장과 신발이 안 맞아요',
  'explain.layerOver': '{season}에 겹이 너무 많아요 (−2)',
  'explain.accentAccent': '포인트 컬러가 둘 ({a}+{b}) (−2)',
  'explain.outerScore': '아우터 조합 {score}/5',
  'explain.lengthBlock': '기장 조합이 맞지 않아요',
  'explain.seasonBlock': '{season}에 맞지 않는 아이템이 많아요',
};

export function buildLabels() {
  const out = [];
  const push = (ns, map, mk) => { for (const [id, v] of Object.entries(map)) out.push(mk ? mk(id, v) : L(`${ns}.${id}`, v[0], v[1], v[2] ?? [], v[3] ?? '')); };
  push('color', COLORS);
  push('tone', TONES);
  push('season', SEASONS);
  push('category', CATEGORIES);
  push('material', MATERIALS);
  push('fit.top', TOP_FITS);
  push('fit.bottom', BOTTOM_FITS);
  push('length.top', TOP_LEN);
  push('length.outer', OUTER_LEN);
  push('length.trouser', TROUSER_LEN);
  push('shoe', SHOES);
  for (const t of TOP_TYPES) out.push(L(`topType.${t.id}`, TOP_LABEL[t.id] ?? t.labelKo, TOP_SHORT[t.id], t.id === 'tee' ? ['티', '반팔'] : t.id === 'sweatshirt' ? ['맨투맨', '스웻셔츠'] : t.id === 'hoodie' ? ['후드티'] : [], ''));
  for (const o of OUTER_TYPES) out.push(L(`outerType.${o.id}`, OUTER_LABEL[o.id] ?? o.labelKo, OUTER_SHORT[o.id], OUTER_ALIASES[o.id] ?? [], o.id === 'overshirt' ? '린넨·얇은 코튼' : o.id === 'blouson' ? 'MA-1·해링턴' : o.id === 'chesterfield' ? '싱글 코트' : ''));
  for (const [id, label] of Object.entries(TAGS)) out.push(L(`tag.${id}`, label, label.length <= 6 ? label : label.replace(/\s/g, '').slice(0, 6), [], ''));
  for (const [id, label] of Object.entries(EXPLAIN)) out.push(L(id, label, null, [], ''));
  for (const [id, label] of Object.entries({ 'ui.classicN': '클래식 {n}/3', 'ui.safety': '안전도 {percent}', 'ui.more': '더 보기', 'ui.byTone': '톤별', 'ui.byHue': '색상별', 'ui.variations': '변주', 'ui.disputed': '의견 갈림', 'ui.avoid': '피하기', 'ui.blocked': '추천하지 않는 조합' })) out.push(L(id, label, null, [], ''));
  return out;
}
