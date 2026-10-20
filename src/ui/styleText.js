// 스타일·상황 라벨·도움말 폴백 — labels.ko.json 에 행이 없을 때(또는 엔진이 help 를 안 줄 때) 쓰는 내장 문자열. 순수 모듈.
export const STYLE_KO = { minimal: '미니멀', amekaji: '아메카지', cityboy: '시티보이', bizcasual: '비즈캐주얼', street: '스트릿', gorpcore: '고프코어', ivy: '아이비', workwear: '워크웨어' };
export const OCC_KO = { work: '출근', weekend: '주말', date: '데이트', active: '운동·산책', formal: '격식' };

/** 도움말 폴백(4 스타일 + 5 상황) — labels.ko style.*.help / occasion.*.help 가 우선 */
export const STYLE_HELP = {
  minimal: '무채색·뉴트럴, 장식 없는 기본템',
  amekaji: '인디고 데님·플란넬·워크 부츠, 질감과 빈티지 워시',
  bizcasual: '타이 없는 셔츠·니트 + 슬랙스 + 로퍼·블레이저',
  ivy: '옥스포드·치노·페니 로퍼·네이비 블레이저',
};
export const OCC_HELP = {
  work: '셔츠·니트 + 슬랙스·치노 + 로퍼·더비',
  weekend: '티·플란넬·데님, 스니커즈·부츠',
  date: '니트·셔츠, 로퍼·흰 스니커즈, 여유 핏',
  active: '티·후디·플리스, 러닝화',
  formal: '드레스 셔츠 + 블레이저 + 울 슬랙스 + 더비',
};

/** 상황 칩 1차 노출 3개 + "더" 뒤의 2개 (U6-05 축소 결정) */
export const OCC_PRIMARY = ['work', 'weekend', 'date'];
export const OCC_MORE = ['active', 'formal'];

/**
 * labels.ko 행(배열) 또는 엔진 styles()/occasions() 결과에서 필드를 찾고, 없으면 폴백.
 * @param {Array<{id:string}>|null} rows  catalog.data.labels
 * @param {'style'|'occasion'} kind
 * @param {string} id
 * @param {'label'|'shortLabel'|'help'} field
 */
export function labelField(rows, kind, id, field) {
  const row = Array.isArray(rows) ? rows.find((l) => l?.id === `${kind}.${id}`) : null;
  const v = row?.[field];
  if (typeof v === 'string' && v.trim()) return v.trim();
  if (field === 'help') return (kind === 'style' ? STYLE_HELP : OCC_HELP)[id] || '';
  if (field === 'shortLabel' && typeof row?.label === 'string' && row.label.trim()) return row.label.trim();
  return (kind === 'style' ? STYLE_KO : OCC_KO)[id] || id;
}

/**
 * 스타일 × 상황 결과 (엔진이 정본): classic 3장 + shortfall. Fixer A 의 `shortfall` 플래그(result.shortfall 또는 applied.shortfall)를 우선 쓰고,
 * 없으면 applied.relaxed(상황 avoid 완화) 또는 3장 미만을 부족으로 본다.
 * @returns {{cards:Array<object>, shortfall:boolean}}
 */
export function styleOccasionCards(result) {
  const cards = Array.isArray(result?.classic) ? result.classic : [];
  const flag = result?.shortfall ?? result?.applied?.shortfall;
  const shortfall = typeof flag === 'boolean' ? flag : ((result?.applied?.relaxed || []).length > 0 || cards.length < 3);
  return { cards, shortfall };
}

/** 상황 칩 순서: 1차 3개(출근·주말·데이트) + "더" 뒤 2개(운동·격식). 고른 상황이 "더" 쪽이면 펼쳐 둔다 */
export function occasionChipIds(available, { more = false, current = null } = {}) {
  const ids = [...OCC_PRIMARY, ...OCC_MORE].filter((id) => available.includes(id));
  const shown = more || (current && OCC_MORE.includes(current)) ? ids : ids.filter((id) => OCC_PRIMARY.includes(id));
  return { shown, hidden: ids.filter((id) => !shown.includes(id)) };
}

/** 부족 안내 문구 (반말·느낌표 없음): "격식에 맞는 조합이 더 없어요 — 상황을 바꿔 보세요" */
export function shortfallText(occLabel) {
  return `${occLabel}에 맞는 조합이 더 없어요 — 상황을 바꿔 보세요`;
}
