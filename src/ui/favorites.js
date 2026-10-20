// 즐겨찾기 — ux-enhancement 4장. mc.v1.favorites: [{id, base:{category,color}, season, at}] 최신순 ≤ MAX.
// 아이템 스냅샷은 저장하지 않고 엔진으로 다시 해석한다(resolve). 저장소가 없으면 세션 메모리로만 동작.
import { read, write, KEYS } from './storage.js';

export const MAX = 30;
const listeners = new Set();
let cache = null;
let storageWarned = false;

function valid(f) {
  return f && typeof f.id === 'string' && f.base && typeof f.base.category === 'string' && typeof f.base.color === 'string'
    ? { id: f.id, base: { category: f.base.category, color: f.base.color }, season: typeof f.season === 'string' ? f.season : 'springFall', at: Number(f.at) || 0 }
    : null;
}

/** 현재 목록(최신순). 저장소에서 1회 읽고 메모리에 둔다. */
export function list() {
  if (!cache) cache = (read(KEYS.favorites, []) || []).map(valid).filter(Boolean).slice(0, MAX);
  return cache;
}

export function count() { return list().length; }
export function has(id) { return list().some((f) => f.id === id); }
export function find(id) { return list().find((f) => f.id === id) || null; }

function commit(next, meta) {
  cache = next;
  const ok = write(KEYS.favorites, next);
  for (const fn of listeners) fn(next, { ...meta, stored: ok });
  return ok;
}

/** 변경 구독: fn(list, {action, id, evicted, stored}) */
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

/**
 * 저장. 같은 id 가 있으면 at 만 갱신(중복 없음). MAX 초과 시 가장 오래된 것 제거.
 * @returns {{evicted:boolean, stored:boolean}}
 */
export function add({ id, base, season, at = Date.now() }) {
  const f = valid({ id, base, season, at });
  if (!f) return { evicted: false, stored: false };
  const rest = list().filter((x) => x.id !== id);
  const evicted = rest.length >= MAX;
  const next = [f, ...rest].slice(0, MAX);
  const stored = commit(next, { action: 'add', id, evicted });
  return { evicted, stored };
}

export function remove(id) {
  const next = list().filter((x) => x.id !== id);
  const stored = commit(next, { action: 'remove', id, evicted: false });
  return { stored };
}

/** 토글. @returns {{saved:boolean, evicted:boolean, stored:boolean}} */
export function toggle(entry) {
  if (has(entry.id)) return { saved: false, ...remove(entry.id) , evicted: false };
  return { saved: true, ...add(entry) };
}

/** 저장 불가 토스트는 1회만 */
export function shouldWarnStorage() {
  if (storageWarned) return false;
  storageWarned = true;
  return true;
}

export function clear() { commit([], { action: 'clear' }); }

/** 초기화 뒤 메모리 캐시도 비운다 */
export function resetCache() { cache = null; }

/**
 * 저장 항목 → 엔진 결과에서 같은 outfit.id 후보 찾기. 결과 집합(classic·byTone·byHue·variations·byStyle) 전부 훑는다.
 * @param {object} result  engine.recommend({base, season, mode:'deep'})
 * @param {string} id
 */
export function findInResult(result, id) {
  if (!result || !id) return null;
  const hit = (c) => c?.outfit?.id === id;
  for (const c of result.classic || []) if (hit(c)) return c;
  for (const g of [...(result.byTone || []), ...(result.byHue || []), ...(result.byStyle || []), ...(result.byOccasion || [])]) {
    for (const c of g?.candidates || []) if (hit(c)) return c;
  }
  for (const v of result.variations || []) if (hit(v?.candidate)) return v.candidate;
  return null;
}
