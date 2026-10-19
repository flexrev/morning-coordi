// S4 더 보기 — 탭 바 톤별 | 색상별 | 변주, 칩 줄, 카드 목록, 맨 아래 접힌 "피할 것 N개".
import { h } from '../dom.js';
import { topbar, outfitCard } from '../components.js';
import * as nav from '../nav.js';
import { get as getState, getResult, toneLabel, hueLabel, variationLabel } from '../state.js';
import { colorValue } from '../silhouette.js';

const TABS = [['tone', '톤별'], ['hue', '색상별'], ['var', '변주']];
const TONE_ORDER = ['neutral', 'earth', 'mono', 'navyBase', 'accent', 'pastel'];
const HUE_ORDER = ['analogous', 'complementary', 'achromatic'];

// 탭 안 칩 선택은 화면 상태(히스토리 항목 아님)
const picked = { tone: null, hue: null };

const groupCount = (result, tab) => (tab === 'tone' ? (result?.byTone || []) : tab === 'hue' ? (result?.byHue || []) : (result?.variations || [])).filter((g) => tab === 'var' || (g.candidates || []).length).length;

/** 실제로 보여줄 탭: 원하는 탭이 비어 있으면 색상별 → 변주 순으로 넘어간다 (P1-07 ③). */
export function moreTab(result, want = 'tone') {
  if (!result) return want;
  if (groupCount(result, want) > 0) return want;
  for (const t of ['tone', 'hue', 'var']) if (t !== want && groupCount(result, t) > 0) return t;
  return want;
}

export function s4More(tab = 'tone') {
  const st = getState();
  const cat = st.catalog;
  const result = getResult();
  const screen = h('main', { class: 'screen', id: 's4' });
  screen.append(topbar({
    title: '더 보기', back: () => nav.back('/result'),
    side: [h('span', { class: 'dot dot--base', style: `--chip-color:${colorValue(st.base.color, cat.hex(st.base.color))}`, 'aria-hidden': 'true' }), h('span', { text: cat.plain(`color.${st.base.color}`) })],
  }));

  // 탭 바는 하단 고정(S3 '더 보기'와 같은 자리, 엄지 영역) — P1-13. 빈 탭은 흐리게 + "없음".
  const tabs = h('div', { class: 'tabs', role: 'tablist' });
  for (const [id, label] of TABS) {
    const empty = groupCount(result, id) === 0;
    tabs.append(h('button', {
      class: `tab${empty ? ' tab--off' : ''}`, type: 'button', role: 'tab', 'aria-selected': String(id === tab),
      'aria-disabled': empty ? 'true' : null, disabled: empty,
      onClick: () => nav.replace(`/more/${id}`),
    }, label, empty ? h('span', { class: 'tab__none', text: '없음' }) : null));
  }
  const body = h('div', { class: 'screen__body screen__body--scroll', role: 'tabpanel' });

  const list = h('div', { class: 'cards' });
  const render = () => {
    list.replaceChildren();
    const items = collect(result, tab, st);
    if (!items.length) {
      list.append(h('div', { class: 'empty' }, h('p', { text: '여기엔 보여줄 조합이 없어요' })));
    }
    items.forEach(({ candidate, label, ref, swapped }) => list.append(outfitCard(candidate, { label, ref, swapped })));
  };

  if (tab === 'tone' || tab === 'hue') {
    // 데이터가 있는 그룹만, 순서는 TONE_ORDER/HUE_ORDER 고정. 1개뿐이면 칩 줄 생략(카드 라벨이 이미 그룹명) (P1-07 ①②)
    const groups = (tab === 'tone' ? (result?.byTone || []) : (result?.byHue || [])).filter((g) => (g.candidates || []).length);
    const order = tab === 'tone' ? TONE_ORDER : HUE_ORDER;
    const ids = groups.map((g) => (tab === 'tone' ? g.tone : g.relation)).sort((a, b) => order.indexOf(a) - order.indexOf(b));
    const def = tab === 'tone' ? (ids.find((t) => cat.tonesOf(st.base.color).includes(t)) || ids[0]) : (ids.includes('analogous') ? 'analogous' : ids[0]);
    if (!ids.includes(picked[tab])) picked[tab] = def;
    const row = h('div', { class: 'pillrow', role: 'radiogroup', 'aria-label': tab === 'tone' ? '톤 그룹' : '색상 관계' });
    for (const id of ids) {
      row.append(h('button', {
        class: 'pill', type: 'button', role: 'radio', 'aria-checked': String(picked[tab] === id),
        text: tab === 'tone' ? toneLabel(id) : hueLabel(id),
        onClick: () => { picked[tab] = id; row.querySelectorAll('.pill').forEach((p) => p.setAttribute('aria-checked', String(p.textContent === (tab === 'tone' ? toneLabel(id) : hueLabel(id))))); render(); },
      }));
    }
    if (ids.length > 1) body.append(row);
  }
  body.append(list);
  render();

  // 피할 것 N개 (접힘)
  const avoid = result?.avoid || [];
  if (avoid.length) {
    const box = h('div', { class: 'avoid' });
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
    body.append(box);
  } else {
    body.append(h('div', { style: 'height:var(--sp-4)' }));
  }
  body.append(h('div', { style: 'height:var(--sp-2)' }));
  screen.append(body);
  const bottom = h('div', { class: 'bottom bottom--tabs' });
  bottom.append(tabs);
  screen.append(bottom);
  return screen;
}

function collect(result, tab, st) {
  if (!result) return [];
  if (tab === 'tone') {
    const g = (result.byTone || []).find((t) => t.tone === picked.tone);
    return (g?.candidates || []).map((candidate, i) => ({ candidate, label: toneLabel(g.tone), ref: `tone.${g.tone}.${i}` }));
  }
  if (tab === 'hue') {
    const g = (result.byHue || []).find((t) => t.relation === picked.hue);
    return (g?.candidates || []).map((candidate, i) => ({ candidate, label: hueLabel(g.relation), ref: `hue.${g.relation}.${i}` }));
  }
  return (result.variations || []).map((v, i) => {
    const text = variationLabel(v, result);
    const m = text.match(/^(.*에서 )(.+)(만)$/);
    const label = m ? [m[1], h('b', { text: m[2] }), m[3]] : text;
    return { candidate: v.candidate, label, ref: `var.${i}`, swapped: v.swapped };
  });
}
