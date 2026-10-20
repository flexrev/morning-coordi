// 공용 컴포넌트: 상단바 · 색 점 · 결과 카드(♥ 포함) · 바텀시트 · 세그먼트 · 토스트. 전부 (props) → HTMLElement.
import { h, append, joinBold } from './dom.js';
import { renderOutfit, colorValue } from './silhouette.js';
import { icon } from './icons.js';
import * as nav from './nav.js';
import { get as getState, styleLabel } from './state.js';
import * as favorites from './favorites.js';
import { haptic, prefersReducedMotion, nextFrame } from './motion.js';

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

const GENERIC = new Set(['클래식', '변주']);
const UNIVERSAL = '누구나 안전한 기본 조합';
const RELATION = /톤온톤|유사색|보색|무채색|\+.*조합$/;
/* 사용자에게 숨기는 내부 설명 (P1-03, ux-flow 3-2 "점수 숫자는 노출하지 않음") */
const INTERNAL = /\d+(?:\.\d+)?\s*\/\s*\d|출처\s*\d|규칙 없음|격식 차이|\d+\s*단계|^[a-z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)+$|\{\w+\}/;
const DELTA = /\s*\(\s*[+−-]\s*\d+(?:\.\d+)?\s*\)\s*$/;

/** 사용자용 설명 줄 (S3 카드 · S5). 점수·내부 설명을 거르고 점수 델타 "(+1)"를 뗀다. */
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

/** 캡션 조각(상의→하의→신발→아우터). short=true 는 컴팩트 카드용 */
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

/**
 * 스타일 태그 (CX candidate.styleTags[] 또는 UX candidate.tags.style[]). 3개 이상 걸치면 "기본" → 숨김(CX 9장). 최대 2개.
 * @returns {string[]} 스타일 id
 */
export function styleTagsOf(candidate, max = 2) {
  const tags = Array.isArray(candidate?.styleTags) ? candidate.styleTags : (candidate?.tags?.style || []);
  if (!Array.isArray(tags) || tags.length === 0 || tags.length >= 3) return [];
  return tags.slice(0, max).map((t) => (typeof t === 'string' ? t : t?.style || t?.id)).filter(Boolean);
}
/** 태그 칩 글자: labels.ko style.<id>.shortLabel → styleLabel */
export function styleShort(id) {
  const rows = getState().catalog?.data?.labels;
  const row = Array.isArray(rows) ? rows.find((l) => l.id === `style.${id}`) : null;
  return row?.shortLabel || styleLabel(id);
}

/** 즐겨찾기 ♥ 버튼 (48×48, aria-pressed). 토글 → 팝 모션 + 토스트. 화면 전환 없음. */
export function favButton(candidate, { label, season, base } = {}) {
  const id = candidate?.outfit?.id;
  const st = getState();
  const on = () => favorites.has(id);
  const btn = h('button', {
    class: `card__fav${on() ? ' is-on' : ''}`, type: 'button',
    'aria-pressed': String(on()), 'aria-label': `저장, ${labelText(label) || '조합'}`,
  });
  btn.append(icon('heart', { filled: on() }));
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const r = favorites.toggle({ id, base: base || st.base, season: season || st.season });
    btn.setAttribute('aria-pressed', String(r.saved));
    btn.classList.toggle('is-on', r.saved);
    btn.replaceChildren(icon('heart', { filled: r.saved }));
    if (r.saved) {
      btn.classList.remove('is-pop'); void btn.offsetWidth; btn.classList.add('is-pop');
      haptic(10);
    }
    toast(r.saved ? (r.evicted ? '30개까지 저장돼요. 오래된 것을 하나 지웠어요' : '저장했어요') : '저장을 해제했어요', 1600);
    if (!r.stored && favorites.shouldWarnStorage()) setTimeout(() => toast('이 기기에선 저장이 안 돼요'), 1700);
  });
  return btn;
}

/**
 * 가로형 컴팩트 카드 (ux-flow 4-1 → ux-enhancement 4-1 구조). div.card > button.card__main + button.card__fav. 본체 탭 → S5.
 * @param {object} candidate  {outfit, score, explain, styleTags?}
 * @param {{label:string|Node[], ref:string, swapped?:object, reason?:boolean, today?:boolean, fav?:boolean, season?:string, base?:object, onOpen?:Function}} opts
 */
export function outfitCard(candidate, { label, ref, swapped, reason = true, today = false, fav = true, season, base, onOpen }) {
  const st = getState();
  const cat = st.catalog;
  const items = candidate.outfit.items;
  const parts = captionParts(items, { short: true });
  const curBase = base || st.base;
  const boldIdx = swapped ? cat.ordered(items).findIndex((it) => it.category === swapped.category) : -1;
  const caption = st.engine?.caption ? st.engine.caption(candidate.outfit) : captionParts(items).join(' · ');
  const disputed = isDisputed(candidate);

  const card = h('div', { class: `card${today ? ' card--today' : ''}` });
  const main = h('button', {
    class: 'card__main', type: 'button',
    'aria-label': `${today ? '오늘의 추천. ' : ''}${labelText(label) || '조합'}. ${caption}${disputed ? '. 의견 갈림' : ''}`,
    onClick: () => (onOpen ? onOpen() : nav.go(`/outfit/${ref}`)),
  });
  const plate = h('div', { class: 'card__ill plate', 'aria-hidden': 'true' });
  plate.append(renderOutfit(items, { size: 118, season: season || st.season, hexOf: cat.hex, accessories: candidate.accessories }));
  const meta = h('div', { class: 'card__meta' });
  const lab = h('div', { class: 'card__label' });
  const labIn = h('span', { class: 'card__labeltext' });
  append(labIn, [label]);
  lab.append(labIn);
  if (disputed) lab.append(flag());
  lab.append(h('span', { class: 'card__detail', 'aria-hidden': 'true', text: '자세히 ›' }));
  meta.append(lab, dots(items, { base: curBase, swapped }));
  const cap = h('div', { class: 'card__cap' });
  append(cap, joinBold(parts, boldIdx));
  meta.append(cap);
  const why = cardReason(candidate);
  // 카드는 dominant 태그 1개(+이유 한 줄), 이유가 없으면 2개까지 (CX 9장 · 높이 0 추가)
  const tags = styleTagsOf(candidate, reason && why ? 1 : 2);
  if ((reason && why) || tags.length) {
    const line = h('div', { class: 'card__reason' });
    for (const t of tags) line.append(h('span', { class: 'tag', text: styleShort(t) }));
    if (reason && why) line.append(h('span', { text: why }));
    meta.append(line);
    // 캡션이 3줄로 접히면(4아이템 카드) 이유 줄은 생략해 카드 높이를 지킨다 (P1-11)
    // 캡션 15/22: 2줄 = 44, 3줄 = 66 → 3줄이면 이유 줄 생략
    nextFrame(() => { if (card.isConnected && cap.getBoundingClientRect().height > 50) line.hidden = true; });
  }
  main.append(plate, meta);
  card.append(main);
  if (fav) card.append(favButton(candidate, { label, season, base: curBase }));
  return card;
}

/** 세그먼트 (role=radiogroup) — 계절·설정 공용. 썸(.seg__thumb)이 선택 옵션으로 슬라이드 (motion-spec 3-8) */
export function segment({ options, value, onChange, label, autoDiffers, name }) {
  const seg = h('div', { class: 'seg', role: 'radiogroup', 'aria-label': label });
  const thumb = h('span', { class: 'seg__thumb', 'aria-hidden': 'true' });
  seg.append(thumb);
  const btns = [];
  for (const [id, text] of options) {
    const b = h('button', {
      class: 'seg__opt', type: 'button', role: 'radio', 'aria-checked': String(value === id), text, 'data-value': id,
      onClick: () => { if (b.getAttribute('aria-checked') !== 'true') { setValue(id); onChange(id); } },
    });
    if (id === value && autoDiffers) b.append(h('span', { class: 'seg__dot', title: '지금 달과 달라요', 'aria-label': '지금 달과 달라요' }));
    btns.push(b);
    seg.append(b);
  }
  const place = () => {
    const on = btns.find((b) => b.getAttribute('aria-checked') === 'true');
    if (!on) return;
    thumb.style.transform = `translateX(${on.offsetLeft}px)`;
    thumb.style.width = `${on.offsetWidth}px`;
  };
  function setValue(id) {
    for (const b of btns) b.setAttribute('aria-checked', String(b.dataset.value === id));
    place();
  }
  seg.setValue = setValue;
  seg.place = place;
  // 레이아웃 읽기 1회(렌더 직후) — 첫 배치는 전환 없이
  requestAnimationFrame(() => { thumb.classList.add('is-still'); place(); requestAnimationFrame(() => thumb.classList.remove('is-still')); });
  // 화살표 이동
  seg.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const i = btns.findIndex((b) => b === document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    const n = btns[(i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length];
    n.focus(); n.click();
  });
  if (name) seg.dataset.name = name;
  return seg;
}

/** 계절 세그먼트 */
export function seasonSegment({ value, onChange, autoDiffers }) {
  const cat = getState().catalog;
  return segment({ label: '계절', value, onChange, autoDiffers, name: 'season', options: ['springFall', 'summer', 'winter'].map((s) => [s, cat.label(`season.${s}`)]) });
}

/**
 * 바텀시트. 시트 밖 탭·✕·뒤로 가기로 닫힘(닫기는 nav.back → popstate → app.js 가 시트 노드만 제거하며 닫힘 모션).
 * @returns {HTMLElement} #app 에 append 할 루트
 */
let focusRequest = null;
/** 화면을 다시 그린 뒤 돌려줄 포커스 대상(data-focus-key). app.js render 끝에서 소비한다 (P2-08). */
export function takeFocusRequest() { const k = focusRequest; focusRequest = null; return k; }

export function sheet({ title, body, onClose, className }) {
  const opener = document.activeElement;
  const openerKey = opener?.dataset?.focusKey || null;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKey);
    if (openerKey) focusRequest = openerKey;
    (onClose || (() => nav.back()))();
    if (opener?.isConnected && document.contains(opener)) { try { opener.focus({ preventScroll: true }); } catch { /* noop */ } }
  };
  const root = h('div', { class: `sheet-root${className ? ` ${className}` : ''}` });
  root.append(h('div', { class: 'sheet-root__scrim', onClick: close }));
  const panel = h('div', { class: 'sheet glass', role: 'dialog', 'aria-modal': 'true', 'aria-label': title });
  panel.append(h('div', { class: 'sheet__grip', 'aria-hidden': 'true' }));
  panel.append(h('div', { class: 'sheet__head' },
    h('h2', { class: 'sheet__title', text: title }),
    h('button', { class: 'sheet__close', type: 'button', 'aria-label': '닫기', text: '✕', onClick: close })));
  const b = h('div', { class: 'sheet__body' });
  append(b, [body]);
  panel.append(b);
  root.append(panel);
  // 아래로 끌어 닫기 (따라오는 드래그 없음 — motion-spec 3-9)
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
    const f = focusables();
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener('keydown', onKey);
  root.close = close;
  root.cleanup = () => document.removeEventListener('keydown', onKey);
  queueMicrotask(() => panel.querySelector('button, [tabindex]')?.focus?.({ preventScroll: true }));
  return root;
}

/** 토스트 — 연속 토스트는 교체 (motion-spec 3-13). 등장 translateY(8→0)+fade, 사라짐 fade */
let toastEl = null;
let toastTimer = null;
export function toast(text, ms = 2600) {
  if (toastEl) { clearTimeout(toastTimer); toastEl.remove(); toastEl = null; }
  // 하단 고정 영역(.bottom)이 없는 화면(S2·S5 기존)에선 아래로 (P2-13)
  const low = !document.querySelector('.bottom');
  const t = h('div', { class: low ? 'toast toast--low' : 'toast', role: 'status', text });
  document.body.append(t);
  toastEl = t;
  const outMs = prefersReducedMotion() ? 80 : 120;
  toastTimer = setTimeout(() => {
    t.classList.add('is-out');
    setTimeout(() => { t.remove(); if (toastEl === t) toastEl = null; }, outMs);
  }, ms);
}
