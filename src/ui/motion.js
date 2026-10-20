// 모션 유틸 — docs/phase6/motion-spec.md 4-1. 기능 감지만(UA 스니핑 없음). DOM 이 없는 환경(node:test)에서도 import 가능.
const doc = () => (typeof document !== 'undefined' ? document : null);
const root = () => doc()?.documentElement || null;

let degraded = false;   // 세션 안에서 두 번 느리면 CSS 폴백으로 고정 (R2)
let slowCount = 0;
let navHint = null;     // 다음 렌더의 전환 종류 힌트 ('fwd' | 'back') — S2 칩 탭 → nav.back('/result') 를 앞으로로 취급 (3-1)

/** 설정(data-motion="reduce") 또는 OS prefers-reduced-motion */
export function prefersReducedMotion() {
  const r = root();
  if (r?.dataset?.motion === 'reduce') return true;
  try { return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
}

export function supportsVT() {
  const d = doc();
  return !!d && typeof d.startViewTransition === 'function' && !degraded && !prefersReducedMotion();
}

/** 테스트·설정용: 현재 강등 상태 */
export function isDegraded() { return degraded; }
export function _resetForTest() { degraded = false; slowCount = 0; navHint = null; }

/**
 * update() 가 DOM 을 바꾼다. type: 'fwd' | 'back' | 'none'.
 * @returns {Promise<void>} 전환이 끝나는 Promise (없으면 resolved)
 */
export function viewTransition(update, type = 'none') {
  if (!supportsVT() || type === 'none') { update(); return Promise.resolve(); }
  const r = root();
  r.dataset.nav = type;
  const t0 = performance.now();
  let vt;
  try { vt = document.startViewTransition(update); } catch { update(); delete r.dataset.nav; return Promise.resolve(); }
  vt.ready?.catch?.(() => {});               // skipTransition 시 ready 가 AbortError 로 거부된다 → 조용히
  vt.updateCallbackDone?.catch?.(() => {});
  const budget = type === 'fwd' ? 320 : 200;
  // 안전장치: 탭이 백그라운드로 가서 프레임이 멈추면 전환이 입력을 계속 막는다 → 예산 + 600ms 뒤 강제 종료
  const guard = setTimeout(() => { try { vt.skipTransition?.(); } catch { /* noop */ } }, budget + 600);
  return vt.finished.catch(() => {}).finally(() => {
    clearTimeout(guard);
    delete r.dataset.nav;
    if (performance.now() - t0 > budget + 120 && ++slowCount >= 2) degraded = true; // 저사양 보호 (6장 R2)
  });
}

/** rAF 가 멈춘 상태(백그라운드 탭)에서도 반드시 한 번 실행되는 다음 프레임 — 둘 중 먼저 오는 쪽 1회 */
export function nextFrame(fn, fallbackMs = 60) {
  let done = false;
  const run = () => { if (done) return; done = true; fn(); };
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run);
  setTimeout(run, fallbackMs);
}

/** 목록 등장 스태거: --i 를 0..max-1 로 (6번째부터는 max-1 과 같은 지연 = 사실상 즉시) */
export function stagger(els, max = 5) {
  let i = 0;
  for (const el of els) { el.style.setProperty('--i', String(Math.min(i, max - 1))); i++; }
}

/** 설정·부트 시 반영. pref: 'auto' | 'reduce' */
export function applyMotionPref(pref) {
  const r = root();
  if (!r) return;
  r.dataset.motion = pref === 'reduce' ? 'reduce' : 'auto';
}

/** 다음 렌더 1회의 전환 종류를 미리 정한다 (app.js render 가 소비) */
export function setNavHint(type) { navHint = type; }
export function takeNavHint() { const t = navHint; navHint = null; return t; }

/** CSS 토큰이 실제로 0 인지 (reduced 두 경로 공통 검증용) */
export function durationMs(token = '--dur-base') {
  const r = root();
  if (!r || typeof getComputedStyle !== 'function') return null;
  const v = getComputedStyle(r).getPropertyValue(token).trim();
  if (!v) return null;
  return v.endsWith('ms') ? parseFloat(v) : v.endsWith('s') ? parseFloat(v) * 1000 : parseFloat(v);
}

/** 햅틱: Android 만, 저장할 때만, reduced 면 생략 (ux-enhancement 4-2) */
export function haptic(ms = 10) {
  if (prefersReducedMotion()) return;
  try { if (/Android/i.test(navigator.userAgent || '') && typeof navigator.vibrate === 'function') navigator.vibrate(ms); } catch { /* noop */ }
}
