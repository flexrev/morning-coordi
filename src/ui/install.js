// PWA 설치 안내 (O1) — ux-flow 6장. 노출 규칙: 미설치 · 2회차 방문 이상 · 하루 1회 · 닫은 지 7일 경과.
import { read, write, KEYS } from './storage.js';
import { h } from './dom.js';
import { sheet } from './components.js';
import * as nav from './nav.js';
import { get as getState, set as setState, subscribe } from './state.js';

const DAY = 24 * 60 * 60 * 1000;
const FOREVER = 'forever';

export function isStandalone() {
  try {
    return window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
  } catch { return false; }
}
export function isIOS() {
  const ua = navigator.userAgent || '';
  return /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
export function isAndroid() { return /Android/i.test(navigator.userAgent || ''); }

/** 앱 실행 1회당 방문 수 +1 (세션 중 1회) */
let counted = false;
export function countVisit() {
  if (counted) return;
  counted = true;
  const s = read(KEYS.install, {}) || {};
  write(KEYS.install, { ...s, visits: (s.visits || 0) + 1 });
}

export function shouldShowBanner() {
  if (isStandalone()) return false;
  if (!isIOS() && !isAndroid()) return false; // MVP는 모바일만
  const s = read(KEYS.install, {}) || {};
  if ((s.visits || 0) < 2) return false;
  if (s.dismissedAt === FOREVER) return false;
  const now = Date.now();
  if (s.dismissedAt && now - s.dismissedAt < 7 * DAY) return false;
  if (s.shownAt && now - s.shownAt < DAY && !s.showing) return false;
  write(KEYS.install, { ...s, shownAt: s.showing ? s.shownAt : now, showing: true });
  return true;
}

export function dismissBanner(forever = false) {
  const s = read(KEYS.install, {}) || {};
  write(KEYS.install, { ...s, dismissedAt: forever ? FOREVER : Date.now(), showing: false });
}

/**
 * S3 설치 배너 — 한 줄(≤56px): 문구 + [설치/설치 방법] + ✕ (P1-01).
 * beforeinstallprompt 가 렌더 뒤에 도착하면 버튼을 [설치]로 바꾼다 (P1-15).
 */
export function installBanner({ onChange }) {
  const el = h('div', { class: 'banner', role: 'region', 'aria-label': '설치 안내' });
  const slot = h('span', { class: 'banner__action' });
  const makeBtn = (prompt) => (prompt
    ? h('button', { class: 'btn btn--sm', type: 'button', text: '설치', 'data-focus-key': 'banner:install', onClick: () => triggerAndroidInstall(onChange) })
    : h('button', { class: 'btn btn--sm', type: 'button', text: '설치 방법', 'data-focus-key': 'banner:install', onClick: () => nav.go('/result/install') }));
  slot.append(makeBtn(getState().installPrompt));
  el.append(
    h('span', { class: 'banner__text', text: '홈 화면에 두면 1초 만에 열려요' }),
    slot,
    h('button', { class: 'banner__close', type: 'button', 'aria-label': '닫기', text: '✕', onClick: () => { dismissBanner(false); onChange(); } }));
  let shown = !!getState().installPrompt;
  const off = subscribe((s) => {
    if (!el.isConnected) { off(); return; }
    const now = !!s.installPrompt;
    if (now !== shown) { shown = now; slot.replaceChildren(makeBtn(s.installPrompt)); }
  });
  return el;
}

async function triggerAndroidInstall(onChange) {
  const p = getState().installPrompt;
  if (!p) return nav.go('/result/install');
  try {
    p.prompt();
    const res = await p.userChoice;
    setState({ installPrompt: null });
    dismissBanner(res?.outcome === 'accepted');
  } catch { dismissBanner(false); }
  onChange();
}

function pic(kind) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 56 56');
  svg.setAttribute('aria-hidden', 'true');
  const paths = {
    share: 'M28 8 L28 34 M20 16 L28 8 L36 16 M16 24 L12 24 L12 48 L44 48 L44 24 L40 24',
    add: 'M12 12 H44 V44 H12 Z M28 20 V36 M20 28 H36',
    done: 'M12 14 H44 M14 20 L26 20 M40 10 H52 M46 10 V22 M14 30 L26 30 M14 40 L26 40',
  };
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', paths[kind]);
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', 'currentColor');
  p.setAttribute('stroke-width', '2.5');
  p.setAttribute('stroke-linecap', 'round');
  p.setAttribute('stroke-linejoin', 'round');
  svg.append(p);
  return svg;
}

/** O1 시트: iOS 3단계 그림 / Android 설치 버튼 */
export function installSheet() {
  const prompt = getState().installPrompt;
  const body = [];
  if (prompt) {
    body.push(h('p', { class: 'sheet__note', text: '버튼을 누르면 설치 창이 떠요.' }));
    body.push(h('button', { class: 'btn btn--primary btn--block', type: 'button', text: '설치', onClick: () => triggerAndroidInstall(() => nav.back()) }));
  } else {
    body.push(h('div', { class: 'steps' },
      h('div', { class: 'step' }, h('div', { class: 'step__pic' }, pic('share')), h('span', {}, '1. 아래 ', h('b', { text: '공유' }), ' 버튼')),
      h('div', { class: 'step' }, h('div', { class: 'step__pic' }, pic('add')), h('span', {}, '2. ', h('b', { text: '홈 화면에 추가' }))),
      h('div', { class: 'step' }, h('div', { class: 'step__pic' }, pic('done')), h('span', {}, '3. 오른쪽 위 ', h('b', { text: '추가' })))));
    body.push(h('button', { class: 'btn btn--primary btn--block', type: 'button', text: '다 했어요', onClick: () => { dismissBanner(true); nav.back(); } }));
  }
  return sheet({ title: '홈 화면에 추가하기', body });
}
