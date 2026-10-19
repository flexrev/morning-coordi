// 공용 컴포넌트: 상단바 · 색 점 · 결과 카드 · 바텀시트 · 세그먼트. 전부 (props) → HTMLElement.
import { h, append, joinBold } from './dom.js';
import { renderOutfit, colorValue } from './silhouette.js';
import * as nav from './nav.js';
import { get as getState } from './state.js';

/** 상단바. 제목은 기본 h1(P2-06) — 화면에 다른 h1 이 있으면(S1 히어로) heading:'div' 로. */
export function topbar({ title, back, app = false, side, heading = 'h1' } = {}) {
  const bar = h('div', { class: 'topbar' });
  if (back) bar.append(h('button', { class: 'topbar__back', type: 'button', 'aria-label': '뒤로', onClick: back, text: '‹' }));
  bar.append(h(heading, { class: app ? 'topbar__title topbar__title--app' : 'topbar__title', text: title }));
  if (side) bar.append(h('div', { class: 'topbar__side' }, side));
  return bar;
}

/** 카드 안 원형 색 점. aria-label "상의: 화이트" */
export function dot(item, { base, swap, size } = {}) {
  const cat = getState().catalog;
  const el = h('span', {
    class: ['dot', size === 'lg' && 'dot--lg', base && 'dot--base', swap && 'dot--swap'].filter(Boolean).join(' '),
    role: 'img',
    'aria-label': `${cat.label(`category.${item.category}`)}: ${cat.plain(`color.${item.color}`)}`,
    style: `--chip-color:${colorValue(item.color, cat.hex(item.color))}`,
  });
  return el;
}

/** 색 점 줄: 상의 → 하의 → 신발 → 아우터. 기준 아이템은 두 겹 테두리, 바뀐 아이템은 점선 + "바꿈" */
export function dots(items, { base, swapped, size } = {}) {
  const cat = getState().catalog;
  const row = h('div', { class: 'dots' });
  for (const it of cat.ordered(items)) {
    const isSwap = swapped && it.category === swapped.category;
    row.append(dot(it, { base: cat.isBase(it, base), swap: isSwap, size }));
    if (isSwap) row.append(h('span', { class: 'dots__tag', text: '바꿈' }));
  }
  return row;
}

/** 의견 갈림 표식 ⚑ */
export function flag() {
  return h('span', { class: 'card__flag', role: 'img', 'aria-label': '의견 갈림', title: '의견 갈림', text: '⚑' });
}

export function isDisputed(candidate) {
  const o = candidate?.outfit;
  if (o?.flags?.includes('disputed')) return true;
  return (candidate?.score?.reasons || []).some((r) => r.key === 'explain.disputed');
}

/**
 * 가로형 컴팩트 카드 (ux-flow 4-1). 탭 → S5.
 * @param {object} candidate  {outfit, score, explain}
 * @param {{label:string|Node[], ref:string, swapped?:object, reason?:boolean}} opts
 */
const GENERIC = new Set(['클래식', '변주']);
const UNIVERSAL = '누구나 안전한 기본 조합';
const RELATION = /톤온톤|유사색|보색|무채색|\+.*조합$/;
/* 사용자에게 숨기는 내부 설명 (P1-03, ux-flow 3-2 "점수 숫자는 노출하지 않음"):
   "핏 밸런스 5/5" · "출처 3개 이상" · "규칙 없음(기본 3)" · "격식 차이 4단계 (…)" · 영문 키(tone.navyBase) · 미치환 템플릿 {x} */
const INTERNAL = /\d+(?:\.\d+)?\s*\/\s*\d|출처\s*\d|규칙 없음|격식 차이|\d+\s*단계|^[a-z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)+$|\{\w+\}/;
const DELTA = /\s*\(\s*[+\u2212-]\s*\d+(?:\.\d+)?\s*\)\s*$/;

/**
 * 사용자용 설명 줄 (S3 카드 · S5). 점수·내부 설명을 거르고 점수 델타 "(+1)"를 뗀다.
 * 엔진 explain 형식이 바뀌어도 이 한 함수만 고치면 된다. S6 시트는 기술 설명을 그대로 보여준다.
 */
export function userReasons(candidate) {
  const out = [];
  for (const raw of candidate?.explain || []) {
    if (typeof raw !== 'string') continue;
    const s = raw.replace(DELTA, '').trim();
    if (!s || GENERIC.has(s) || INTERNAL.test(s)) continue;
    if (!out.includes(s)) out.push(s);
  }
  return out;
}

/**
 * 캡션 조각(상의→하의→신발→아우터). 엔진이 itemCaption(소재 중복 제거, gate-2 3-8)을 주면 그걸 쓰고, 없으면 카탈로그 폴백.
 * short=true 는 컴팩트 카드용 shortLabel 조합(통합 결정 D3).
 */
export function captionParts(items, { short = false } = {}) {
  const { catalog: cat, engine } = getState();
  const ordered = cat.ordered(items);
  if (short) return ordered.map(cat.cardName || cat.shortName);
  return ordered.map((it) => (engine?.itemCaption ? engine.itemCaption(it) : cat.itemName(it)));
}

/** S5 설명 줄: 한 단어 라벨(클래식/변주)을 뺀 앞 n개 */
export function detailReasons(candidate, n = 2) {
  return userReasons(candidate).slice(0, n);
}

/** 카드 한 줄 설명: 색 관계 설명 → 기본 조합 → 나머지 순. 남는 게 없으면 '' (줄 생략). */
export function cardReason(candidate) {
  const ex = userReasons(candidate);
  return ex.find((s) => RELATION.test(s)) ?? ex.find((s) => s === UNIVERSAL) ?? ex[0] ?? '';
}
function labelText(label) {
  return Array.isArray(label) ? label.map((x) => (typeof x === 'string' ? x : x?.textContent || '')).join('') : String(label || '');
}

export function outfitCard(candidate, { label, ref, swapped, reason = true }) {
  const st = getState();
  const cat = st.catalog;
  const items = candidate.outfit.items;
  const parts = captionParts(items, { short: true });
  const boldIdx = swapped ? cat.ordered(items).findIndex((it) => it.category === swapped.category) : -1;
  const caption = st.engine?.caption ? st.engine.caption(candidate.outfit) : captionParts(items).join(' · ');

  const card = h('button', {
    class: 'card', type: 'button',
    'aria-label': `${labelText(label) || '조합'}. ${caption}${isDisputed(candidate) ? '. 의견 갈림' : ''}`,
    onClick: () => nav.go(`/outfit/${ref}`),
  });
  const ill = h('div', { class: 'card__ill', 'aria-hidden': 'true' });
  ill.append(renderOutfit(items, { size: 100, season: st.season, hexOf: cat.hex }));
  const meta = h('div', { class: 'card__meta' });
  const lab = h('div', { class: 'card__label' });
  append(lab, [label]);
  meta.append(lab, dots(items, { base: st.base, swapped }));
  const cap = h('div', { class: 'card__cap' });
  append(cap, joinBold(parts, boldIdx));
  meta.append(cap);
  const why = cardReason(candidate);
  if (reason && why) {
    const line = h('div', { class: 'card__reason', text: why });
    meta.append(line);
    // 캡션이 3줄로 접히면(4아이템 카드) 이유 줄은 생략해 카드 높이를 지킨다 (P1-11: 3줄 허용 + 이유 줄 생략)
    requestAnimationFrame(() => { if (card.isConnected && cap.getBoundingClientRect().height > 41) line.hidden = true; });
  }
  card.append(ill, meta);
  if (isDisputed(candidate)) card.append(flag());
  return card;
}

/** 계절 세그먼트 (role=radiogroup) */
export function seasonSegment({ value, onChange, autoDiffers }) {
  const cat = getState().catalog;
  const seg = h('div', { class: 'seg', role: 'radiogroup', 'aria-label': '계절' });
  for (const s of ['springFall', 'summer', 'winter']) {
    const b = h('button', {
      class: 'seg__opt', type: 'button', role: 'radio', 'aria-checked': String(value === s),
      text: cat.label(`season.${s}`), onClick: () => onChange(s),
    });
    if (s === value && autoDiffers) b.append(h('span', { class: 'seg__dot', title: '지금 달과 달라요', 'aria-label': '지금 달과 달라요' }));
    seg.append(b);
  }
  return seg;
}

/**
 * 바텀시트. 시트 밖 탭·✕·뒤로 가기로 닫힘(닫기는 nav.back → popstate가 화면을 다시 그림).
 * @returns {HTMLElement} #app 에 append 할 루트
 */
let focusRequest = null;
/** 화면을 다시 그린 뒤 돌려줄 포커스 대상(data-focus-key). app.js render 끝에서 소비한다 (P2-08). */
export function takeFocusRequest() { const k = focusRequest; focusRequest = null; return k; }

export function sheet({ title, body, onClose }) {
  const opener = document.activeElement;
  const openerKey = opener?.dataset?.focusKey || null;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKey);
    if (openerKey) focusRequest = openerKey;
    (onClose || (() => nav.back()))();
    // 화면이 안 바뀌는 닫기(onClose 직접 처리)면 지금 바로 복귀
    if (opener?.isConnected && document.contains(opener)) { try { opener.focus({ preventScroll: true }); } catch { /* noop */ } }
  };
  const root = h('div', { class: 'sheet-root' });
  root.append(h('div', { class: 'sheet-root__scrim', onClick: close }));
  const panel = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title });
  panel.append(h('div', { class: 'sheet__grip', 'aria-hidden': 'true' }));
  panel.append(h('div', { class: 'sheet__head' },
    h('h2', { class: 'sheet__title', text: title }),
    h('button', { class: 'sheet__close', type: 'button', 'aria-label': '닫기', text: '✕', onClick: close })));
  const b = h('div', { class: 'sheet__body' });
  append(b, [body]);
  panel.append(b);
  root.append(panel);
  // 아래로 끌어 닫기 (간단 버전)
  let y0 = null;
  panel.addEventListener('touchstart', (e) => { y0 = e.touches[0].clientY; }, { passive: true });
  panel.addEventListener('touchend', (e) => {
    if (y0 != null && e.changedTouches[0].clientY - y0 > 80 && b.scrollTop <= 0) close();
    y0 = null;
  });
  const focusables = () => [...panel.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')];
  const onKey = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    // 포커스 트랩: 시트 안에서만 순환 (P2-08)
    const f = focusables();
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener('keydown', onKey);
  queueMicrotask(() => panel.querySelector('button, [tabindex]')?.focus?.({ preventScroll: true }));
  return root;
}

export function toast(text, ms = 2600) {
  // 하단 고정 영역(.bottom)이 없는 화면(S2·S5)에선 토스트를 아래로 내려 칩 그리드를 가리지 않는다 (P2-13)
  const low = !document.querySelector('.bottom');
  const t = h('div', { class: low ? 'toast toast--low' : 'toast', role: 'status', text });
  document.body.append(t);
  setTimeout(() => t.remove(), ms);
}
