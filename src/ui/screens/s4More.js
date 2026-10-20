// S4 더 보기 — 하단 탭 바 톤별 | 색상별 | 변주 | 스타일(S4+, CX 슬롯), 칩 줄, 카드 목록, 맨 아래 접힌 "피할 것 N개".
// 탭 전환은 제자리(지시선 슬라이드 + 패널 스태거). URL 은 nav.replace 로 동기화.
// 스타일 탭(U6-05·06): 칩 줄은 가로 스크롤 + 가장자리 페이드, 선택 칩 아래 도움말 한 줄, 상황은 출근·주말·데이트 + "더"(운동·격식).
// 스타일 × 상황은 클라이언트 교집합 대신 엔진 recommend(base, season, 'deep', {style, occasion}) 의 classic 을 그대로 쓴다(shortfall 안내).
import { h } from '../dom.js';
import { topbar, outfitCard, styleShort } from '../components.js';
import * as nav from '../nav.js';
import { get as getState, getResult, toneLabel, hueLabel, variationLabel, styleLabel, occasionLabel, styleHelp, occasionHelp } from '../state.js';
import { colorValue } from '../silhouette.js';
import { stagger } from '../motion.js';
import { OCC_PRIMARY, OCC_MORE, shortfallText, styleOccasionCards, occasionChipIds } from '../styleText.js';
export { styleOccasionCards, occasionChipIds };

const TABS = [['tone', '톤별'], ['hue', '색상별'], ['var', '변주'], ['style', '스타일']];
const TONE_ORDER = ['neutral', 'earth', 'mono', 'navyBase', 'accent', 'pastel'];
const HUE_ORDER = ['analogous', 'complementary', 'achromatic'];

// 탭 안 칩 선택은 화면 상태(히스토리 항목 아님). 상황은 세션만 유지(아침마다 리셋)
const picked = { tone: null, hue: null, style: null, occasion: null, occMore: false };

const styleGroups = (result) => (Array.isArray(result?.byStyle) ? result.byStyle : []).filter((g) => (g?.candidates || []).length);
const groupCount = (result, tab) => {
  if (tab === 'var') return (result?.variations || []).length;
  if (tab === 'style') return styleGroups(result).length;
  return (tab === 'tone' ? (result?.byTone || []) : (result?.byHue || [])).filter((g) => (g.candidates || []).length).length;
};
/** 엔진이 스타일 필드를 아예 안 주면(CX 미착륙·확장 데이터 없음) 스타일 탭을 숨긴다 */
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
  const note = h('p', { class: 'caption s4__note', role: 'status' });
  const list = h('div', { class: 'cards' });
  const avoidBox = h('div');
  body.append(chips, note, list, avoidBox, h('div', { style: 'height:var(--sp-2)' }));
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
    note.textContent = '';
    note.hidden = true;
    const { items, shortfall } = collect(result, tab);
    if (tab === 'style' && picked.occasion && shortfall) {
      note.textContent = shortfallText(occasionLabel(picked.occasion));
      note.hidden = false;
    }
    if (!items.length) {
      const empty = h('div', { class: 'empty' }, h('p', { text: tab === 'style' && picked.occasion ? shortfallText(occasionLabel(picked.occasion)) : '여기엔 보여줄 조합이 없어요' }));
      if (tab === 'style' && picked.occasion) { note.hidden = true; empty.append(h('button', { class: 'btn', type: 'button', text: '상황 해제', onClick: () => { picked.occasion = null; renderChips(); renderList(); } })); }
      list.append(empty);
    }
    items.forEach(({ candidate, label, ref, swapped, hideTag }) => list.append(outfitCard(candidate, { label, ref, swapped, hideTag })));
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
      const row1 = pillRow(ids, picked.style, styleShort, '스타일', (id) => { picked.style = id; renderChips(); renderList(); });
      row1.prepend(h('span', { class: 'pillrow__k', text: '스타일' }));
      chips.append(row1);
      // 상황 칩: 출근·주말·데이트 + "더"(운동·격식). 선택 해제 가능(같은 칩 다시 탭). 둘 다 고르면 엔진 호출 (U6-05·06)
      const avail = occasionsAvailable(result);
      if (avail.length) {
        const { shown, hidden } = occasionChipIds(avail, { more: picked.occMore, current: picked.occasion });
        const row2 = pillRow(shown, picked.occasion, occasionLabel, '상황', (id) => { picked.occasion = picked.occasion === id ? null : id; renderChips(); renderList(); }, { toggle: true });
        row2.prepend(h('span', { class: 'pillrow__k', text: '상황' }));
        if (hidden.length) {
          row2.append(h('button', { class: 'pill pill--more glass', type: 'button', 'aria-label': `상황 더 보기: ${hidden.map(occasionLabel).join(', ')}`, text: '더', onClick: () => { picked.occMore = true; renderChips(); } }));
        }
        chips.append(row2);
      }
      // 도움말: 선택 스타일(+상황) 한 줄씩 12px (U6-05 ②)
      const help = h('div', { class: 's4__help' });
      if (picked.style) help.append(h('p', { class: 'caption', text: `${styleShort(picked.style)} · ${styleHelp(picked.style)}` }));
      if (picked.occasion) help.append(h('p', { class: 'caption', text: `${occasionLabel(picked.occasion)} · ${occasionHelp(picked.occasion)}` }));
      if (help.childElementCount) chips.append(help);
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
/** 고를 수 있는 상황 id: 엔진 occasions() (데이터 정본) → 없으면 byOccasion 그룹 */
function occasionsAvailable(result) {
  const eng = getState().engine;
  let ids = [];
  try { ids = typeof eng?.occasions === 'function' ? eng.occasions().map((o) => o.id) : []; } catch { ids = []; }
  if (!ids.length) ids = occGroups(result).map((g) => g.occasion);
  return ids.filter(Boolean);
}

/** 가로 스크롤 칩 줄: 넘치는 쪽에 페이드 (data-fade = l | r | lr) — CSS mask (U6-05 ①) */
function scrollFade(row) {
  const update = () => {
    const over = row.scrollWidth - row.clientWidth > 1;
    const l = over && row.scrollLeft > 1;
    const r = over && row.scrollLeft + row.clientWidth < row.scrollWidth - 1;
    const v = `${l ? 'l' : ''}${r ? 'r' : ''}`;
    if (v) row.dataset.fade = v; else delete row.dataset.fade;
  };
  row.addEventListener('scroll', update, { passive: true });
  requestAnimationFrame(update);
  setTimeout(update, 80);
  // 선택 칩을 보이는 곳으로 (라벨이 잘린 채 숨지 않게)
  requestAnimationFrame(() => row.querySelector('[aria-checked="true"]')?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' }));
  return row;
}

function pillRow(ids, current, labelOf, ariaLabel, onPick, { toggle = false } = {}) {
  const row = h('div', { class: 'pillrow', role: 'radiogroup', 'aria-label': ariaLabel });
  for (const id of ids) {
    row.append(h('button', {
      class: 'pill glass', type: 'button', role: 'radio', 'aria-checked': String(current === id), text: labelOf(id), 'data-id': id,
      onClick: () => {
        const next = toggle && current === id ? null : id;
        row.querySelectorAll('.pill[role="radio"]').forEach((p) => p.setAttribute('aria-checked', String(p.dataset.id === next)));
        current = next;
        onPick(id);
      },
    }));
  }
  return scrollFade(row);
}

/** @returns {{items:Array<object>, shortfall:boolean}} */
function collect(result, tab) {
  if (!result) return { items: [], shortfall: false };
  if (tab === 'tone') {
    const g = (result.byTone || []).find((t) => t.tone === picked.tone);
    return { items: (g?.candidates || []).map((candidate, i) => ({ candidate, label: toneLabel(g.tone), ref: `tone.${g.tone}.${i}` })), shortfall: false };
  }
  if (tab === 'hue') {
    const g = (result.byHue || []).find((t) => t.relation === picked.hue);
    return { items: (g?.candidates || []).map((candidate, i) => ({ candidate, label: hueLabel(g.relation), ref: `hue.${g.relation}.${i}` })), shortfall: false };
  }
  if (tab === 'style') {
    const style = picked.style;
    if (!style) return { items: [], shortfall: false };
    if (picked.occasion) {
      // 엔진이 정본: recommend(base, season, 'deep', {style, occasion}) → classic (항상 ≤3, 부족하면 shortfall)
      const rs = getResult({ style, occasion: picked.occasion });
      const { cards, shortfall } = styleOccasionCards(rs);
      const label = `${styleLabel(style)} · ${occasionLabel(picked.occasion)}`;
      return { items: cards.map((candidate, i) => ({ candidate, label, ref: `sx.${style}.${picked.occasion}.${i}`, hideTag: style })), shortfall };
    }
    const g = styleGroups(result).find((t) => t.style === style);
    // U6-10: 그룹과 같은 태그는 카드에서 뺀다 (라벨이 이미 그 말)
    return { items: (g?.candidates || []).map((candidate, i) => ({ candidate, label: styleLabel(g.style), ref: `style.${g.style}.${i}`, hideTag: g.style })), shortfall: false };
  }
  const items = (result.variations || []).map((v, i) => {
    const text = variationLabel(v, result);
    const m = text.match(/^(.*에서 )(.+)(만)$/);
    const label = m ? [m[1], h('b', { text: m[2] }), m[3]] : text;
    return { candidate: v.candidate, label, ref: `var.${i}`, swapped: v.swapped };
  });
  return { items, shortfall: false };
}
