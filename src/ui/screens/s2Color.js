// S2 색 칩 그리드 — 아이브로우 "2 / 2 · 색 고르기" + 큰 제목 + 보조문, 4열 칩(r=20 스쿼클), 하단 정렬. 칩 탭 즉시 S3.
import { h } from '../dom.js';
import { topbar } from '../components.js';
import * as nav from '../nav.js';
import { get as getState, selectBase } from '../state.js';
import { colorValue } from '../silhouette.js';
import { setNavHint, supportsVT } from '../motion.js';

const TITLE = { bottom: '하의 색은?', top: '상의 색은?', shoes: '신발 색은?', outer: '아우터 색은?' };

export function s2Color(category) {
  const st = getState();
  const cat = st.catalog;
  const screen = h('main', { class: 'screen', id: 's2' });
  screen.append(topbar({ title: cat.label(`category.${category}`), back: () => nav.back('/'), heading: 'div' }));
  const body = h('div', { class: 'screen__body' });
  body.append(h('div', { class: 's2__head' },
    h('div', { class: 'eyebrow', text: '2 / 2 · 색 고르기' }),
    h('h1', { class: 'display', text: TITLE[category] || '색은?' }),
    h('p', { class: 's2__help', text: '탭하면 바로 조합 3가지가 나와요' })));
  body.append(h('div', { class: 'spacer' }));

  const list = cat.colorsFor(category, st.season);
  const grid = h('div', { class: 'chipgrid', role: 'radiogroup', 'aria-label': `${cat.label(`category.${category}`)} 색` });
  const current = st.base && st.base.category === category ? st.base.color : null;
  list.forEach(({ id, inSeason }, i) => {
    const selected = id === current;
    const tones = cat.tonesOf(id).map((t) => cat.label(`tone.${t}`)).join(', ');
    const sw = h('span', { class: 'chip__swatch', style: `--chip-color:${colorValue(id, cat.hex(id))}` });
    const chip = h('button', {
      class: `chip${inSeason ? '' : ' chip--off'}`, type: 'button', role: 'radio',
      'aria-checked': String(selected), style: `--i:${Math.min(i, 11)}`,
      'aria-label': tones ? `${cat.plain(`color.${id}`)}, ${tones}` : cat.plain(`color.${id}`),
      // S3 에서 열었으면(push) 뒤로 가서 S3 를 새 기준으로 다시 그림, 첫 실행(S1→replace)이면 /result 로 교체 (P1-14).
      // 등급이 오르므로 전환은 "앞으로"(motion-spec 3-1). 공유 요소 이름은 탭한 칩 하나에만 (3-3).
      onClick: () => {
        if (supportsVT()) {
          for (const s of grid.querySelectorAll('.chip__swatch')) s.style.viewTransitionName = 'none';
          sw.style.viewTransitionName = 'base-swatch';
        }
        setNavHint('fwd');
        selectBase({ category, color: id });
        nav.back('/result');
      },
    });
    if (selected) sw.append(h('span', { class: 'chip__check', 'aria-hidden': 'true', text: '✓' }));
    chip.append(sw, h('span', { class: 'chip__label', text: cat.shortLabel(id) }));
    grid.append(chip);
  });
  if (!list.length) body.append(h('div', { class: 'empty' }, h('p', { text: '아직 고를 색이 없어요' })));
  body.append(grid, h('div', { style: 'height:max(var(--safe-bottom), 8px)' }));
  screen.append(body);
  return screen;
}
