// 오늘의 추천 — 날짜별 결정적 회전 (ux-enhancement 3-2). 서버·난수 없음. DOM 의존 없음(테스트 가능).

/** FNV-1a 32-bit */
export function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** 기기 로컬 자정 기준 일 수 */
export function dayNumber(date = new Date()) {
  const local = date.getTime() - date.getTimezoneOffset() * 60_000;
  return Math.floor(local / 86_400_000);
}

/**
 * 오늘 카드 인덱스. 같은 날·같은 기준·계절이면 같은 카드, 연속된 날은 반드시 다른 카드(n ≥ 2).
 * @param {{category:string,color:string}} base
 * @param {string} season
 * @param {number} n  classic.length
 * @param {Date} [date]
 * @returns {number} 0..n-1 (n ≤ 0 이면 -1)
 */
export function todayIndex(base, season, n, date = new Date()) {
  if (!n || n <= 0) return -1;
  const seed = fnv1a(`${base?.category || ''}|${base?.color || ''}|${season || ''}`);
  return (((dayNumber(date) + seed) % n) + n) % n;
}

/** 상단 제목용 "10월 19일" */
export function dateLabel(date = new Date()) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/** 공유 이미지용 "2026.10.19" */
export function dateStamp(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}.${p(date.getMonth() + 1)}.${p(date.getDate())}`;
}

/** 파일명용 "2026-10-19" */
export function dateSlug(date = new Date()) {
  return dateStamp(date).replaceAll('.', '-');
}
