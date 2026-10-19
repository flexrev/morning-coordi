// 작은 전역 스토어 — {base, season, theme, recents, installPrompt}. get/set/subscribe. 추천 결과는 키로 메모이즈.
import { read, write, KEYS } from './storage.js';

const listeners = new Set();
const RESULTS = new Map(); // `${category}|${color}|${season}` → RecommendResult

/** 현재 월로 계절 추정 (ux-flow 2-4): 3~5·10~11 봄가을, 6~9 여름, 12~2 겨울 */
export function seasonForMonth(m = new Date().getMonth() + 1) {
  if (m >= 6 && m <= 9) return 'summer';
  if (m === 12 || m <= 2) return 'winter';
  return 'springFall';
}

const VALID_SEASON = new Set(['springFall', 'summer', 'winter']);
const VALID_CAT = new Set(['top', 'bottom', 'shoes', 'outer']);

function validBase(b) {
  return b && VALID_CAT.has(b.category) && typeof b.color === 'string' && b.color ? { category: b.category, color: b.color } : null;
}

const savedSeason = read(KEYS.season);
const state = {
  base: validBase(read(KEYS.last)),
  season: VALID_SEASON.has(savedSeason) ? savedSeason : seasonForMonth(),
  seasonIsAuto: !VALID_SEASON.has(savedSeason),
  recents: (read(KEYS.recent, []) || []).map(validBase).filter(Boolean).slice(0, 3),
  theme: read(KEYS.theme) || 'dark',
  installPrompt: null, // Android beforeinstallprompt 이벤트
  engine: null,
  catalog: null,
};

export function get() { return state; }

export function set(patch) {
  Object.assign(state, patch);
  for (const fn of listeners) fn(state);
}

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

/**
 * 기준 아이템 선택 → last·recent 저장.
 * keepOrder: 이미 recents 에 있는 항목을 고를 때(최근 선택 pill 탭) 순서를 바꾸지 않는다 (P1-08).
 */
export function selectBase(base, { keepOrder = false } = {}) {
  const b = validBase(base);
  if (!b) return;
  const has = state.recents.some((r) => r.category === b.category && r.color === b.color);
  const recents = keepOrder && has
    ? state.recents.map((r) => (r.category === b.category && r.color === b.color ? b : r))
    : [b, ...state.recents.filter((r) => !(r.category === b.category && r.color === b.color))].slice(0, 3);
  set({ base: b, recents });
  write(KEYS.last, { ...b, season: state.season, at: Date.now() });
  write(KEYS.recent, recents);
}

export function setSeason(season) {
  if (!VALID_SEASON.has(season)) return;
  set({ season, seasonIsAuto: false });
  write(KEYS.season, season);
}

/** 추천 결과 (deep 모드 1회 호출, 메모이즈). base 없으면 null. */
export function getResult() {
  const { base, season, engine } = state;
  if (!base || !engine) return null;
  const key = `${base.category}|${base.color}|${season}`;
  if (!RESULTS.has(key)) {
    try {
      RESULTS.set(key, engine.recommend({ base, season, mode: 'deep' }));
    } catch (e) {
      console.error('recommend failed', e);
      RESULTS.set(key, null);
    }
    if (RESULTS.size > 20) RESULTS.delete(RESULTS.keys().next().value);
  }
  return RESULTS.get(key);
}

/**
 * 카드 참조 문자열로 후보 찾기. ref 형식:
 *   classic.N · tone.<toneId>.N · hue.<relation>.N · var.N
 * @returns {{candidate:object, label:string, variation?:object}|null}
 */
export function findCandidate(ref) {
  const r = getResult();
  if (!r || !ref) return null;
  const parts = String(ref).split('.');
  const n = Number(parts[parts.length - 1]);
  if (parts[0] === 'classic') {
    const c = r.classic?.[n];
    return c ? { candidate: c, label: `클래식 ${n + 1}/${r.classic.length}` } : null;
  }
  if (parts[0] === 'tone') {
    const g = (r.byTone || []).find((t) => t.tone === parts[1]);
    const c = g?.candidates?.[n];
    return c ? { candidate: c, label: toneLabel(parts[1]) } : null;
  }
  if (parts[0] === 'hue') {
    const g = (r.byHue || []).find((t) => t.relation === parts[1]);
    const c = g?.candidates?.[n];
    return c ? { candidate: c, label: hueLabel(parts[1]) } : null;
  }
  if (parts[0] === 'var') {
    const v = (r.variations || [])[n];
    return v ? { candidate: v.candidate, label: variationLabel(v, r), variation: v } : null;
  }
  return null;
}

export function toneLabel(id) {
  const lab = state.catalog?.label(`tone.${id}`);
  return lab || id;
}
export function hueLabel(id) {
  // "보색(탁한)" 같은 괄호 보충은 칩에서 뺀다 (P1-16)
  const cat = state.catalog;
  return (cat?.plain ? cat.plain(`explain.${id}`) : cat?.label(`explain.${id}`)) || { analogous: '유사색', complementary: '보색', achromatic: '무채색' }[id] || id;
}
export function variationLabel(v, r) {
  const idx = (r?.classic || []).findIndex((c) => c.outfit.id === v.fromOutfitId);
  const cat = state.catalog?.label(`category.${v.swapped?.category}`) || v.swapped?.category;
  return `변주 · 클래식 ${idx >= 0 ? idx + 1 : '?'}에서 ${cat}만`;
}
