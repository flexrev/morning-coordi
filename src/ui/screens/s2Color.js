// S2 색 칩 그리드 — 4열 × 52px + 이름 1줄, 최대 12칩, 하단 정렬. 칩 탭 즉시 S3.
import { h } from '../dom.js';
import { topbar } from '../components.js';
import * as nav from '../nav.js';
import { get as getState, selectBase } from '../state.js';
import { colorValue } from '../silhouette.js';

const TITLE = { bottom: '하의 색은?', top: '상의 색은?', shoes: '신발 색은?', outer: '아우터 색은?' };

export function s2Color(category) {
  const st = getState();
  const cat = st.catalog;
  const screen = h('main', { class: 'screen', id: 's2' });
  screen.append(topbar({ title: TITLE[category] || '색은?', back: () => nav.back('/') }));
  const body = h('div', { class: 'screen__body' });
  body.append(h('div', { class: 'spacer' }));

  const list = cat.colorsFor(category, st.season);
  const grid = h('div', { class: 'chipgrid', role: 'radiogroup', 'aria-label': `${cat.label(`category.${category}`)} 색` });
  const current = st.base && st.base.category === category ? st.base.color : null;
  for (const { id, inSeason } of list) {
    const selected = id === current;
    const tones = cat.tonesOf(id).map((t) => cat.label(`tone.${t}`)).join(', ');
    const chip = h('button', {
      class: `chip${inSeason ? '' : ' chip--off'}`, type: 'button', role: 'radio',
      'aria-checked': String(selected),
      'aria-label': tones ? `${cat.plain(`color.${id}`)}, ${tones}` : cat.plain(`color.${id}`),
      // S3 에서 열었으면(push) 뒤로 가서 S3 를 새 기준으로 다시 그림, 첫 실행(S1→replace)이면 /result 로 교체 (P1-14)
      onClick: () => { selectBase({ category, color: id }); nav.back('/result'); },
    });
    const sw = h('span', { class: 'chip__swatch', style: `--chip-color:${colorValue(id, cat.hex(id))}` });
    if (selected) sw.append(h('span', { class: 'chip__check', 'aria-hidden': 'true', text: '✓' }));
    chip.append(sw, h('span', { class: 'chip__label', text: cat.shortLabel(id) }));
    grid.append(chip);
  }
  if (!list.length) body.append(h('div', { class: 'empty' }, h('p', { text: '아직 고를 색이 없어요' })));
  body.append(grid, h('div', { style: 'height:max(var(--safe-bottom), 8px)' }));
  screen.append(body);
  return screen;
}
