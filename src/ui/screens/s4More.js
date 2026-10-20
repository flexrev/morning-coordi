// S4 더 보기 — 하단 탭 바 톤별 | 색상별 | 변주 | 스타일(S4+, CX 슬롯), 칩 줄, 카드 목록, 맨 아래 접힌 "피할 것 N개".
// 탭 전환은 제자리(지시선 슬라이드 + 패널 스태거). URL 은 nav.replace 로 동기화.
import { h } from '../dom.js';
import { topbar, outfitCard, styleShort } from '../components.js';
import * as nav from '../nav.js';
import { get as getState, getResult, toneLabel, hueLabel, variationLabel, styleLabel, occasionLabel } from '../state.js';
import { colorValue } from '../silhouette.js';
import { stagger } from '../motion.js';

const TABS = [['tone', '톤별'], ['hue', '색상별'], ['var', '변주'], ['style', '스타일']];
const TONE_ORDER = ['neutral', 'earth', 'mono', 'navyBase', 'accent', 'pastel'];
const HUE_ORDER = ['analogous', 'complementary', 'achromatic'];
const OCC_ORDER = ['work', 'weekend', 'date', 'active', 'formal'];

// 탭 안 칩 선택은 화면 상태(히스토리 항목 아님). 상황은 세션만 유지(아침마다 리셋)
const picked = { tone: null, hue: null, style: null, occasion: null };

const styleGroups = (result) => (Array.isArray(result?.byStyle) ? result.byStyle : []).filter((g) => (g?.candidates || []).length);
const groupCount = (result, tab) => {
  if (tab === 'var') return (result?.variations || []).length;
  if (tab === 'style') return styleGroups(result).length;
  return (tab === 'tone' ? (result?.byTone || []) : (result?.byHue || [])).filter((g) => (g.candidates || []).length).length;
};
/** 엔진이 스타일 필드를 아예 안 주면(CX 미착륙) 스타일 탭을 숨긴다 */
export const hasStyleField = (result) => !!result && ('byStyle' in result || 'byOccasion' in result);

/** 실제로 보여줄 탭: 원하는 탭이 비어 있으면 색상별 → 변주 순으로 넘어간다 (P1-07 ③). */
export function moreTab(result, want = 'tone') {
  if (!result) return want;
  if (want === 'style' && !hasStyleField(result)) want = 'tone';
  if (groupCount(result, want) > 0) return want;
  for (const t of ['tone', 'hue', 'var', 'style']) if (t !== want && groupCount(result, t) > 0 && (t !== 'style' || hasStyleField(result))) return t;
  return want;
}

export function s4More(initialTab = 'tone') {
  const st = getState();
  const cat = st.catalog;
  let tab = initialTab;
  const baseResult = getResult();
  const screen = h('main', { class: 'screen', id: 's4' });
  screen.append(topbar({
    title: '더 보기', back: () => nav.back('/result'),
    side: [h('span', { class: 'dot dot--base', style: `--chip-color:${colorValue(st.base.color, cat.hex(st.base.color))}`, 'aria-hidden': 'true' }), h('span', { text: cat.plain(`color.${st.base.color}`) })],
  }));

  const visibleTabs = TABS.filter(([id]) => id !== 'style' || hasStyleField(baseResult));
  const tabs = h('div', { class: 'tabs', role: 'tablist', style: `--tabs:${visibleTabs.length}` });
  const tabBtns = {};
  for (const [id, label] of visibleTabs) {
    const empty = groupCount(baseResult, id) === 0;
    tabBtns[id] = h('button', {
      class: `tab${empty ? ' tab--off' : ''}`, type: 'button', role: 'tab', 'aria-selected': String(id === tab),
      'aria-disabled': empty ? 'true' : null, disabled: empty, 'aria-controls': 's4-panel',
      onClick: () => { if (tab !== id) { nav.replace(`/more/${id}`); } },
    }, label, empty ? h('span', { class: 'tab__none', text: '없음' }) : null);
    tabs.append(tabBtns[id]);
  }
  const body = h('div', { class: 'screen__body screen__body--scroll', role: 'tabpanel', id: 's4-panel' });
  const chips = h('div', { class: 's4__chips' });
  const list = h('div', { class: 'cards' });
  const avoidBox = h('div');
  body.append(chips, list, avoidBox, h('div', { style: 'height:var(--sp-2)' }));
  screen.append(body);
  const bottom = h('div', { class: 'bottom bottom--tabs' });
  bottom.append(tabs);
  screen.append(bottom);

  function placeIndicator() {
    const i = visibleTabs.findIndex(([id]) => id === tab);
    tabs.style.setProperty('--tab-i', String(Math.max(0, i)));
  }

  function renderList() {
    const result = baseResult;
    list.replaceChildren();
    const items = collect(result, tab);
    if (!items.length) {
      const empty = h('div', { class: 'empty' }, h('p', { text: tab === 'style' && picked.occasion ? '이 조합은 아직 없어요' : '여기엔 보여줄 조합이 없어요' }));
      if (tab === 'style' && picked.occasion) empty.append(h('button', { class: 'btn', type: 'button', text: '상황 해제', onClick: () => { picked.occasion = null; renderChips(); renderList(); } }));
      list.append(empty);
    }
    items.forEach(({ candidate, label, ref, swapped }) => list.append(outfitCard(candidate, { label, ref, swapped })));
    stagger(list.children);
    list.classList.remove('is-enter'); void list.offsetWidth; list.classList.add('is-enter');
  }

  function renderChips() {
    chips.replaceChildren();
    const result = baseResult;
    if (tab === 'tone' || tab === 'hue') {
      const groups = (tab === 'tone' ? (result?.byTone || []) : (result?.byHue || [])).filter((g) => (g.candidates || []).length);
      const order = tab === 'tone' ? TONE_ORDER : HUE_ORDER;
      const ids = groups.map((g) => (tab === 'tone' ? g.tone : g.relation)).sort((a, b) => order.indexOf(a) - order.indexOf(b));
      const def = tab === 'tone' ? (ids.find((t) => cat.tonesOf(st.base.color).includes(t)) || ids[0]) : (ids.includes('analogous') ? 'analogous' : ids[0]);
      if (!ids.includes(picked[tab])) picked[tab] = def;
      if (ids.length > 1) chips.append(pillRow(ids, picked[tab], (id) => (tab === 'tone' ? toneLabel(id) : hueLabel(id)), tab === 'tone' ? '톤 그룹' : '색상 관계', (id) => { picked[tab] = id; renderList(); }));
      return;
    }
    if (tab === 'style') {
      const groups = styleGroups(result);
      const ids = groups.map((g) => g.style);
      if (!ids.includes(picked.style)) picked.style = ids[0] || null;
      const row1 = pillRow(ids, picked.style, styleShort, '스타일', (id) => { picked.style = id; renderList(); });
      row1.prepend(h('span', { class: 'pillrow__k', text: '스타일' }));
      chips.append(row1);
      // 상황 칩: result.byOccasion 이 있을 때만. 선택 해제 가능(같은 칩 다시 탭). 둘 다 고르면 교집합 (ux-enhancement 7-5)
      const occIds = occasionIds(result);
      if (occIds.length) {
        const row2 = pillRow(occIds, picked.occasion, occasionLabel, '상황', (id) => { picked.occasion = picked.occasion === id ? null : id; renderChips(); renderList(); }, { toggle: true });
        row2.prepend(h('span', { class: 'pillrow__k', text: '상황' }));
        chips.append(row2);
      }
    }
  }

  function renderAvoid() {
    avoidBox.replaceChildren();
    const avoid = baseResult?.avoid || [];
    if (!avoid.length) { avoidBox.append(h('div', { style: 'height:var(--sp-4)' })); return; }
    const box = h('div', { class: 'avoid glass' });
    const ul = h('ul', { class: 'avoid__list', hidden: true });
    for (const a of avoid) {
      const li = h('li');
      if (a.target) li.append(h('b', { text: a.target }), ' — ');
      li.append(a.reason || a.text || '');
      ul.append(li);
    }
    const btn = h('button', { class: 'avoid__toggle', type: 'button', 'aria-expanded': 'false' }, h('span', { text: `이 아이템과 피할 것 ${avoid.length}개` }), h('span', { 'aria-hidden': 'true', text: '▸' }));
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      btn.lastChild.textContent = open ? '▸' : '▾';
      ul.hidden = open;
    });
    box.append(btn, ul);
    avoidBox.append(box);
  }

  function setTab(next) {
    tab = next;
    for (const [id, b] of Object.entries(tabBtns)) b.setAttribute('aria-selected', String(id === tab));
    placeIndicator();
    renderChips();
    renderList();
    body.scrollTop = 0;
  }

  renderAvoid();
  setTab(tab);
  // 라우트가 /more/:tab 으로 바뀌면 제자리 전환 (app.js 가 같은 키로 호출)
  screen.__update = (route) => { const want = moreTab(baseResult, route.a || 'tone'); if (want !== tab) setTab(want); };
  return screen;
}

const occGroups = (result) => (Array.isArray(result?.byOccasion) ? result.byOccasion : []).filter((g) => (g?.candidates || []).length);
function occasionIds(result) {
  return occGroups(result).map((g) => g.occasion).filter(Boolean).sort((a, b) => OCC_ORDER.indexOf(a) - OCC_ORDER.indexOf(b));
}

function pillRow(ids, current, labelOf, ariaLabel, onPick, { toggle = false } = {}) {
  const row = h('div', { class: 'pillrow', role: 'radiogroup', 'aria-label': ariaLabel });
  for (const id of ids) {
    row.append(h('button', {
      class: 'pill glass', type: 'button', role: 'radio', 'aria-checked': String(current === id), text: labelOf(id),
      onClick: () => {
        const next = toggle && current === id ? null : id;
        row.querySelectorAll('.pill').forEach((p) => p.setAttribute('aria-checked', String(p.textContent === (next == null ? '' : labelOf(next)))));
        current = next;
        onPick(id);
      },
    }));
  }
  return row;
}

function collect(result, tab) {
  if (!result) return [];
  if (tab === 'tone') {
    const g = (result.byTone || []).find((t) => t.tone === picked.tone);
    return (g?.candidates || []).map((candidate, i) => ({ candidate, label: toneLabel(g.tone), ref: `tone.${g.tone}.${i}` }));
  }
  if (tab === 'hue') {
    const g = (result.byHue || []).find((t) => t.relation === picked.hue);
    return (g?.candidates || []).map((candidate, i) => ({ candidate, label: hueLabel(g.relation), ref: `hue.${g.relation}.${i}` }));
  }
  if (tab === 'style') {
    const g = styleGroups(result).find((t) => t.style === picked.style);
    const og = picked.occasion ? occGroups(result).find((t) => t.occasion === picked.occasion) : null;
    const occ = picked.occasion ? ` · ${occasionLabel(picked.occasion)}` : '';
    // 교집합: byOccasion 그룹(≤3장)에 있거나 candidate.tags.occasion 에 그 상황이 달린 카드
    const inOcc = og ? new Set((og.candidates || []).map((c) => c.outfit?.id)) : null;
    const fits = (c) => !picked.occasion || inOcc?.has(c.outfit?.id) || (Array.isArray(c.tags?.occasion) && c.tags.occasion.includes(picked.occasion));
    return (g?.candidates || [])
      .map((candidate, i) => ({ candidate, label: `${styleLabel(g.style)}${occ}`, ref: `style.${g.style}.${i}` }))
      .filter(({ candidate }) => fits(candidate));
  }
  return (result.variations || []).map((v, i) => {
    const text = variationLabel(v, result);
    const m = text.match(/^(.*에서 )(.+)(만)$/);
    const label = m ? [m[1], h('b', { text: m[2] }), m[3]] : text;
    return { candidate: v.candidate, label, ref: `var.${i}`, swapped: v.swapped };
  });
}

