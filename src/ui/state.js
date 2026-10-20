// 작은 전역 스토어 — {base, season, theme, motion, recents, installPrompt}. get/set/subscribe. 추천 결과는 키로 메모이즈.
import { read, write, KEYS } from './storage.js';
import * as favorites from './favorites.js';

const listeners = new Set();
const RESULTS = new Map(); // `${category}|${color}|${season}|${style}|${occasion}` → RecommendResult

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
  motion: read(KEYS.motion) === 'reduce' ? 'reduce' : 'auto',
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
/** 설정 "자동으로 되돌리기" */
export function resetSeason() {
  set({ season: seasonForMonth(), seasonIsAuto: true });
  write(KEYS.season, null);
}

export function setTheme(theme) {
  const t = ['dark', 'light', 'auto'].includes(theme) ? theme : 'dark';
  set({ theme: t });
  write(KEYS.theme, t);
}
export function setMotion(pref) {
  const m = pref === 'reduce' ? 'reduce' : 'auto';
  set({ motion: m });
  write(KEYS.motion, m === 'reduce' ? 'reduce' : null);
}

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

/**
 * 엔진 호출 단일 지점 — CX 7-1 시그니처(Query 객체: {base, season, mode, style, occasion, accessories}).
 * CX 가 위치 인자(recommend(base, season, mode, opts))로 바꾸면 이 함수만 고친다.
 */
function callRecommend(engine, base, season, opts = {}) {
  const query = { base, season, mode: 'deep', accessories: true };
  if (opts.style) query.style = opts.style;
  if (opts.occasion) query.occasion = opts.occasion;
  return engine.recommend(query);
}

/**
 * 추천 결과 (deep 모드, 메모이즈). base 없으면 null.
 * @param {{base?:object, season?:string, style?:string|null, occasion?:string|null}} [opts]  생략하면 현재 기준·계절
 */
export function getResult(opts = {}) {
  const base = opts.base || state.base;
  const season = opts.season || state.season;
  const { engine } = state;
  if (!base || !engine) return null;
  const key = `${base.category}|${base.color}|${season}|${opts.style || ''}|${opts.occasion || ''}`;
  if (!RESULTS.has(key)) {
    const t0 = now();
    try {
      RESULTS.set(key, callRecommend(engine, base, season, opts));
    } catch (e) {
      console.error('recommend failed', e);
      RESULTS.set(key, null);
    }
    // 스켈레톤 판단용 (motion-spec 3-11): 실제 계산한 경우만 기록
    const ms = Math.round(now() - t0);
    write(KEYS.perf, { computeMs: ms });
    if (RESULTS.size > 20) RESULTS.delete(RESULTS.keys().next().value);
  }
  return RESULTS.get(key);
}

/** 지난번 계산이 80ms 를 넘었나 (다음 렌더에서 스켈레톤 먼저) */
export function wasSlow() { return ((read(KEYS.perf, {}) || {}).computeMs || 0) > 80; }

/**
 * 카드 참조 문자열로 후보 찾기. ref 형식:
 *   classic.N · tone.<toneId>.N · hue.<relation>.N · var.N · style.<styleId>.N · occ.<occasionId>.N · fav.<outfitId>
 * @returns {{candidate:object, label:string, variation?:object, base?:object, season?:string}|null}
 */
export function findCandidate(ref) {
  if (!ref) return null;
  const parts = String(ref).split('.');
  if (parts[0] === 'fav') {
    const id = parts.slice(1).join('.');
    const f = favorites.find(id);
    if (!f) return null;
    const r = getResult({ base: f.base, season: f.season });
    const c = favorites.findInResult(r, id);
    return c ? { candidate: c, label: favLabel(f), base: f.base, season: f.season } : null;
  }
  const r = getResult();
  if (!r) return null;
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
  if (parts[0] === 'style') {
    const g = (r.byStyle || []).find((t) => t.style === parts[1]);
    const c = g?.candidates?.[n];
    return c ? { candidate: c, label: styleLabel(parts[1]) } : null;
  }
  if (parts[0] === 'occ') {
    const g = (r.byOccasion || []).find((t) => t.occasion === parts[1]);
    const c = g?.candidates?.[n];
    return c ? { candidate: c, label: occasionLabel(parts[1]) } : null;
  }
  if (parts[0] === 'var') {
    const v = (r.variations || [])[n];
    return v ? { candidate: v.candidate, label: variationLabel(v, r), variation: v } : null;
  }
  return null;
}

export function favLabel(f) {
  const cat = state.catalog;
  const season = cat?.label(`season.${f.season}`) || f.season;
  return `${cat ? cat.baseName(f.base) : `${f.base.category} · ${f.base.color}`} · ${season}`;
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
const STYLE_KO = { minimal: '미니멀', amekaji: '아메카지', cityboy: '시티보이', bizcasual: '비즈캐주얼', street: '스트릿', gorpcore: '고프코어', ivy: '아이비', workwear: '워크웨어' };
const OCC_KO = { work: '출근', weekend: '주말', date: '데이트', active: '운동', formal: '격식' };
/** 스타일 라벨: labels.ko style.<id> → 내장 폴백 → id */
export function styleLabel(id) {
  const cat = state.catalog;
  const lab = cat?.plain ? cat.plain(`style.${id}`) : cat?.label(`style.${id}`);
  return (lab && lab !== id) ? lab : (STYLE_KO[id] || id);
}
export function occasionLabel(id) {
  const cat = state.catalog;
  const lab = cat?.plain ? cat.plain(`occasion.${id}`) : cat?.label(`occasion.${id}`);
  return (lab && lab !== id) ? lab : (OCC_KO[id] || id);
}
export function variationLabel(v, r) {
  const idx = (r?.classic || []).findIndex((c) => c.outfit.id === v.fromOutfitId);
  const cat = state.catalog?.label(`category.${v.swapped?.category}`) || v.swapped?.category;
  return `변주 · 클래식 ${idx >= 0 ? idx + 1 : '?'}에서 ${cat}만`;
}
