// 코치마크 — ux-enhancement 7-2 · motion-spec 3-15. 평생 2개(more·fav), role=status, 포커스 안 뺏음, 스크림 없음.
import { h } from './dom.js';
import { read, write, KEYS } from './storage.js';

export const TEXT = {
  more: '세 장이 전부가 아니에요 — 톤별·변주는 여기에',
  fav: '마음에 들면 여기에 모아 두세요',
};

export function seen(key) { return !!(read(KEYS.hints, {}) || {})[key]; }
export function markSeen(key) { write(KEYS.hints, { ...(read(KEYS.hints, {}) || {}), [key]: Date.now() }); }
export function resetAll() { write(KEYS.hints, null); }

let current = null;

/**
 * 대상 위에 말풍선 1개. 아무 탭·6초·화면 전환(노드 분리)에 사라짐.
 * @param {'more'|'fav'} key
 * @param {HTMLElement} target  하단 40% 안의 요소 (더 보기 버튼 · ♥ 저장)
 * @param {{delay?:number}} [opts]
 */
export function showCoach(key, target, { delay = 0 } = {}) {
  if (!target || seen(key) || current) return;
  markSeen(key);
  const el = h('div', { class: 'coach', role: 'status', text: TEXT[key] });
  current = el;
  let timer = null;
  const dismiss = () => {
    if (current !== el) return;
    current = null;
    clearTimeout(timer);
    document.removeEventListener('pointerdown', dismiss, true);
    document.removeEventListener('keydown', dismiss, true);
    el.classList.add('is-out');
    setTimeout(() => el.remove(), 140);
  };
  setTimeout(() => {
    if (!target.isConnected) { current = null; return; }
    const r = target.getBoundingClientRect();
    el.style.bottom = `${Math.max(0, window.innerHeight - r.top) + 10}px`;
    document.body.append(el);
    document.addEventListener('pointerdown', dismiss, true);
    document.addEventListener('keydown', dismiss, true);
    timer = setTimeout(dismiss, 6000);
    // 화면 전환으로 대상이 사라지면 함께
    const watch = setInterval(() => { if (!target.isConnected) { clearInterval(watch); dismiss(); } if (current !== el) clearInterval(watch); }, 500);
  }, delay);
}

export function hideCoach() {
  if (current) { const el = current; current = null; el.remove(); }
}
