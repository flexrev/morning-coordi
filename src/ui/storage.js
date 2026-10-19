// localStorage 래퍼 — tech-stack.md 4절. 키 접두사 mc.v1. 전부 try/catch: 저장소가 없어도 앱은 열려야 한다.
const PREFIX = 'mc.v1.';
export const KEYS = {
  last: 'last',       // {category, color, material?, season, at}
  recent: 'recent',   // 위 객체 배열, 최대 3
  season: 'season',   // "springFall"|"summer"|"winter"
  theme: 'theme',     // "dark"|"light"|"auto"
  install: 'install', // {visits, dismissedAt, shownAt}
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
