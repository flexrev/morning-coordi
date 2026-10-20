// localStorage 래퍼 — tech-stack.md 4절. 키 접두사 mc.v1. 전부 try/catch: 저장소가 없어도 앱은 열려야 한다.
const PREFIX = 'mc.v1.';
export const KEYS = {
  last: 'last',             // {category, color, material?, season, at}
  recent: 'recent',         // 위 객체 배열, 최대 3
  season: 'season',         // "springFall"|"summer"|"winter"
  theme: 'theme',           // "dark"|"light"|"auto"
  install: 'install',       // {visits, dismissedAt, shownAt}
  favorites: 'favorites',   // [{id, base:{category,color}, season, at}] 최신순 ≤30 (ux-enhancement 2-3)
  onboarded: 'onboarded',   // true — 첫 결과를 본 순간
  hints: 'hints',           // {more: ts, fav: ts} 코치마크 1회성
  motion: 'motion',         // "auto"|"reduce"
  perf: 'perf',             // {computeMs} 마지막 추천 계산 시간 → 스켈레톤 여부
};

function store() {
  try { return globalThis.localStorage || null; } catch { return null; }
}

export function read(key, fallback = null) {
  try {
    const raw = store()?.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  try {
    const s = store();
    if (!s) return false;
    if (value === undefined || value === null) s.removeItem(PREFIX + key);
    else s.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function remove(key) { return write(key, null); }

/** 저장소 사용 가능 여부 (설정·토스트 안내용) */
export function available() {
  try {
    const s = store();
    if (!s) return false;
    s.setItem(PREFIX + '__t', '1'); s.removeItem(PREFIX + '__t');
    return true;
  } catch { return false; }
}

/** 초기화(ST1-r): mc.v1.* 전부 삭제. 다른 키는 건드리지 않는다. */
export function clearAll() {
  try {
    const s = store();
    if (!s) return false;
    const del = [];
    for (let i = 0; i < s.length; i++) { const k = s.key(i); if (k && k.startsWith(PREFIX)) del.push(k); }
    for (const k of del) s.removeItem(k);
    return true;
  } catch { return false; }
}
