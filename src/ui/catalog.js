// 데이터 조회 헬퍼 — 라벨·색 목록·캡션. 엔진 인덱스(내부 구조는 C2 소유)를 건드리지 않고 data 객체만 읽는다.

// labels.ko.json 에 행이 없을 때의 한국어 폴백 (enum 전부 커버)
const FALLBACK = {
  'category.top': '상의', 'category.bottom': '하의', 'category.shoes': '신발', 'category.outer': '아우터',
  'season.springFall': '봄가을', 'season.summer': '여름', 'season.winter': '겨울',
  'tone.neutral': '뉴트럴', 'tone.earth': '어스톤', 'tone.mono': '모노톤', 'tone.navyBase': '네이비 베이스', 'tone.accent': '포인트', 'tone.pastel': '파스텔',
  'explain.analogous': '유사색', 'explain.complementary': '보색', 'explain.achromatic': '무채색',
  'fit.top.slim': '슬림', 'fit.top.regular': '레귤러', 'fit.top.loose': '루즈', 'fit.top.oversized': '오버사이즈',
  'fit.bottom.slim': '슬림', 'fit.bottom.tapered': '테이퍼드', 'fit.bottom.regular': '레귤러', 'fit.bottom.straight': '스트레이트', 'fit.bottom.wide': '와이드',
  'length.top.crop': '크롭', 'length.top.regular': '레귤러', 'length.top.long': '롱',
  'length.outer.short': '숏', 'length.outer.regular': '레귤러', 'length.outer.long': '롱',
  'length.trouser.crop': '크롭', 'length.trouser.nobreak': '노브레이크', 'length.trouser.half': '하프 브레이크', 'length.trouser.full': '풀 브레이크',
  'material.denimIndigo': '인디고 데님', 'material.denimWashed': '워시드 데님', 'material.denimBlack': '블랙 데님', 'material.corduroy': '코듀로이',
  'material.chino': '치노', 'material.wool': '울', 'material.flannel': '플란넬', 'material.knitCotton': '코튼 니트', 'material.knitWool': '울 니트',
  'material.knitCashmere': '캐시미어', 'material.linen': '린넨', 'material.jersey': '저지', 'material.leather': '가죽', 'material.nylonTech': '나일론', 'material.tweed': '트위드',
  'shoe.sneakerWhite': '흰 스니커즈', 'shoe.sneakerColor': '컬러 스니커즈', 'shoe.running': '러닝화', 'shoe.loaferPenny': '페니 로퍼', 'shoe.loaferTassel': '태슬 로퍼',
  'shoe.derby': '더비', 'shoe.oxford': '옥스포드', 'shoe.chelsea': '첼시 부츠', 'shoe.workboot': '워크 부츠', 'shoe.chukka': '척카 부츠', 'shoe.sandal': '샌들',
  'topType.tee': '티셔츠', 'topType.sweatshirt': '맨투맨', 'topType.hoodie': '후디', 'topType.knitWool': '울 니트', 'topType.knitCotton': '코튼 니트',
  'topType.knitCashmere': '캐시미어 니트', 'topType.oxfordShirt': '옥스포드 셔츠', 'topType.dressShirt': '드레스 셔츠', 'topType.dressShirtTie': '셔츠+타이',
  'topType.linenShirt': '린넨 셔츠', 'topType.flannelShirt': '플란넬 셔츠', 'topType.denimShirt': '데님 셔츠', 'topType.poloPique': '피케 폴로', 'topType.poloWool': '울 폴로',
  'topType.henley': '헨리넥', 'topType.tank': '탱크톱',
  'outerType.denimJacket': '데님 재킷', 'outerType.coachJacket': '코치 재킷', 'outerType.blouson': '블루종', 'outerType.cardigan': '가디건', 'outerType.shirtJacket': '셔츠 재킷',
  'outerType.trench': '트렌치 코트', 'outerType.blazer': '블레이저', 'outerType.overshirt': '오버셔츠', 'outerType.chesterfield': '체스터필드 코트', 'outerType.balmacaan': '발마칸 코트',
  'outerType.duffle': '더플 코트', 'outerType.peacoat': '피코트', 'outerType.shortPuffer': '숏 패딩', 'outerType.longPuffer': '롱 패딩', 'outerType.fleece': '플리스', 'outerType.leatherJacket': '가죽 재킷',
};

const SEASON_ORDER = ['springFall', 'summer', 'winter'];
/** 하의는 품목 enum 이 없어 소재가 이름이 된다. 소재만으로 품목이 안 읽히는 것엔 명사를 붙인다 (U6-16: "차콜 울" → "차콜 울 슬랙스") */
const BOTTOM_NOUN = { wool: '울 슬랙스', flannel: '플란넬 슬랙스', corduroy: '코듀로이 팬츠', linen: '린넨 팬츠', nylonTech: '나일론 팬츠', jersey: '저지 팬츠', tweed: '트위드 팬츠', leather: '가죽 팬츠' };
const TONE_ORDER = ['neutral', 'earth', 'mono', 'navyBase', 'pastel', 'accent'];

/**
 * @param {object} data  data/index.js 또는 mock/data.js 의 data 객체
 * @param {object} [engine]  createEngine(data) 결과 (선택). index.baseColors / hasBaseRule 가 있으면 S2 정렬에 쓴다(P1-02).
 */
export function createCatalog(data, engine) {
  const colors = new Map((data.colors || []).map((c) => [c.id, c]));
  const labels = new Map((Array.isArray(data.labels) ? data.labels : []).map((l) => [l.id, l]));
  const PAREN = /\s*[(（][^)）]*[)）]\s*$/;

  function label(id) {
    const row = labels.get(id);
    if (row?.label) return row.label;
    if (id.startsWith('color.')) return colors.get(id.slice(6))?.labelKo || FALLBACK[id] || id.slice(6);
    return FALLBACK[id] || id.split('.').pop();
  }
  /** 화면 표시용 라벨: 괄호 보충 설명("카키(베이지 계열)", "블루종(MA-1·해링턴)")을 뗀다 (P1-16). */
  function plain(id) { return label(id).replace(PAREN, ''); }
  function shortLabel(colorId) {
    const row = labels.get(`color.${colorId}`);
    return row?.shortLabel || row?.label || colors.get(colorId)?.labelKo || colorId;
  }
  function hex(colorId) { return colors.get(colorId)?.hex; }
  function tonesOf(colorId) { return colors.get(colorId)?.tones || []; }
  function seasonsOf(colorId) { return colors.get(colorId)?.seasons || SEASON_ORDER; }

  /**
   * 베이스 규칙이 있는 색 목록(카테고리별), 클래식 매칭 수 내림차순 (P1-02).
   * 엔진 index.baseColors(category) 가 있으면 그걸 쓰고, 없으면 data.colorRules 에서 직접 센다.
   */
  function baseColors(category) {
    const fromEngine = engine?.index?.baseColors;
    if (typeof fromEngine === 'function') {
      try {
        const list = fromEngine.call(engine.index, category);
        if (Array.isArray(list)) return list.map((x) => (typeof x === 'string' ? x : x?.id ?? x?.color)).filter((id) => typeof id === 'string');
      } catch { /* 폴백 */ }
    }
    const count = new Map();
    for (const r of data.colorRules || []) {
      if (r.variant || r.baseCategory !== category) continue;
      const n = (r.matches || []).filter((m) => m.tag === 'classic' || (m.score ?? 0) >= 4).length;
      count.set(r.base, Math.max(count.get(r.base) || 0, n));
    }
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
  }
  function hasBaseRule(category, color) {
    const fn = engine?.index?.hasBaseRule;
    if (typeof fn === 'function') { try { return !!fn.call(engine.index, category, color); } catch { /* 폴백 */ } }
    return baseColors(category).includes(color);
  }

  /**
   * 카테고리별 선택 가능한 색 (P1-02 정렬 규칙).
   *   ① 베이스 규칙 있는 색 먼저 — 클래식 조합 수 내림차순(baseColors 순서), 그 안에서 현재 계절 포함 색 먼저
   *   ② 역참조 색(매칭에만 등장) — 계절 포함 먼저, 점수 내림차순, 동점은 톤 순
   * 상한: 기본 12, 베이스 규칙 색이 더 많으면 그만큼(최대 16) — 베이스 규칙 색은 절대 잘리지 않는다(lightDenim).
   */
  const CAP_MIN = 12;
  const CAP_MAX = 16;
  function colorsFor(category, season) {
    const score = new Map();
    for (const r of data.colorRules || []) {
      if (r.variant) continue;
      if (r.baseCategory === category) score.set(r.base, (score.get(r.base) || 0) + 100);
      for (const m of r.matches || []) {
        if (m.category === category && m.score >= 3) score.set(m.color, (score.get(m.color) || 0) + m.score);
      }
    }
    if (score.size === 0) for (const id of colors.keys()) score.set(id, 1);
    const ids = [...score.keys()].filter((id) => colors.has(id));
    // 엔진 baseColors 는 "카테고리에 쓸 수 있는 색"을 클래식 조합 수 순으로 준다(베이스 규칙 없는 역참조 색 포함 가능).
    // 베이스 규칙 유무는 hasBaseRule 로 따로 판정한다.
    const ranking = baseColors(category).filter((id) => colors.has(id));
    const baseSet = new Set([...ranking, ...ids].filter((id) => hasBaseRule(category, id)));
    const inSeason = (id) => !season || seasonsOf(id).includes(season);
    const toneRank = (id) => Math.min(...tonesOf(id).map((t) => TONE_ORDER.indexOf(t)).filter((i) => i >= 0), 99);
    const rank = (id) => { const i = ranking.indexOf(id); return i < 0 ? 999 : i; };
    const all = [...new Set([...ranking, ...ids])];
    all.sort((a, b) => {
      const ba = baseSet.has(a) ? 0 : 1, bb = baseSet.has(b) ? 0 : 1;
      if (ba !== bb) return ba - bb;
      const sa = inSeason(a) ? 0 : 1, sb = inSeason(b) ? 0 : 1;
      if (sa !== sb) return sa - sb;
      return rank(a) - rank(b) || (score.get(b) || 0) - (score.get(a) || 0) || toneRank(a) - toneRank(b);
    });
    const cap = Math.min(CAP_MAX, Math.max(CAP_MIN, baseSet.size));
    return all.slice(0, cap).map((id) => ({ id, inSeason: inSeason(id) }));
  }

  /** 아이템 한 개 표시 이름: itemName 우선, 없으면 "색 품목" (캡션 규칙 gate-2 3-8) */
  function itemName(it) {
    if (!it) return '';
    if (it.itemName) return it.itemName;
    const c = shortLabel(it.color);
    const kind = it.category === 'shoes' ? label(`shoe.${it.shoeType}`)
      : it.category === 'top' ? label(`topType.${it.itemType}`)
      : it.category === 'outer' ? label(`outerType.${it.itemType}`)
      : (it.material ? (BOTTOM_NOUN[it.material] || label(`material.${it.material}`)) : label('category.bottom'));
    return `${c} ${kind}`;
  }

  /** 컴팩트 카드용 짧은 이름: 색 shortLabel + 품목 shortLabel. 품목명이 색을 이미 담으면(인디고데님·흰스니커즈) 품목만 (통합 결정 D3) */
  function shortName(it) {
    if (!it) return '';
    const c = shortLabel(it.color);
    const kindId = it.category === 'shoes' ? `shoe.${it.shoeType}` : it.category === 'top' ? `topType.${it.itemType}` : it.category === 'outer' ? `outerType.${it.itemType}` : (it.material ? `material.${it.material}` : null);
    if (!kindId) return `${c} ${label('category.bottom')}`;
    const kind = labels.get(kindId)?.shortLabel || label(kindId);
    if (kind.includes(c) || (it.shoeType === 'sneakerWhite' && it.color === 'white')) return kind;
    return `${c} ${kind}`;
  }

  /**
   * 컴팩트 카드 표시 이름 (P1-11): 색 shortLabel + 품목 정식 라벨(띄어쓰기 유지, 괄호 설명 제거).
   * 품목명이 색을 이미 담으면("인디고 데님", "흰 스니커즈") 품목만. shortName 은 데이터 검증·테스트용으로 그대로 둔다.
   */
  function cardName(it) {
    if (!it) return '';
    const c = shortLabel(it.color);
    const kindId = it.category === 'shoes' ? `shoe.${it.shoeType}` : it.category === 'top' ? `topType.${it.itemType}` : it.category === 'outer' ? `outerType.${it.itemType}` : (it.material ? `material.${it.material}` : null);
    if (!kindId) return `${c} ${label('category.bottom')}`;
    const kind = (it.category === 'bottom' && !it.itemType && BOTTOM_NOUN[it.material]) || plain(kindId);
    const squash = (t) => t.replace(/\s+/g, '');
    if (squash(kind).includes(squash(c)) || (it.shoeType === 'sneakerWhite' && it.color === 'white')) return kind;
    return `${c} ${kind}`;
  }

  /** 카드 순서: 상의 → 하의 → 신발 → 아우터 */
  const ORDER = { top: 0, bottom: 1, shoes: 2, outer: 3 };
  function ordered(items) {
    return [...(items || [])].sort((a, b) => (ORDER[a.category] ?? 9) - (ORDER[b.category] ?? 9) || (a.layer || 1) - (b.layer || 1));
  }

  function caption(items) { return ordered(items).map(itemName).join(' · '); }

  function baseName(base) { return `${label(`category.${base.category}`)} · ${plain(`color.${base.color}`)}`; }

  /** 아이템 ↔ 기준 아이템 일치 */
  function isBase(it, base) { return !!base && it.category === base.category && it.color === base.color; }

  return { data, label, plain, shortLabel, hex, tonesOf, seasonsOf, baseColors, hasBaseRule, colorsFor, itemName, shortName, cardName, ordered, caption, baseName, isBase };
}
