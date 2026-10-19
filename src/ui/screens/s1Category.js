// S1 카테고리 선택 — 첫 실행 홈. 하단 2×2 큰 버튼(엄지 영역).
import { h } from '../dom.js';
import { topbar } from '../components.js';
import * as nav from '../nav.js';
import { get as getState, selectBase } from '../state.js';
import { colorValue } from '../silhouette.js';

const CATS = ['bottom', 'top', 'shoes', 'outer'];

export function s1Category() {
  const st = getState();
  const cat = st.catalog;
  const screen = h('main', { class: 'screen', id: 's1' });
  screen.append(topbar({ title: '아침 코디', app: true, heading: 'div' })); // h1 은 히어로 문장 (P2-06)
  const body = h('div', { class: 'screen__body' });
  body.append(h('div', { class: 's1__hero' }, h('h1', { text: '오늘 입을 옷, 하나만 고르세요' })));

  if (st.recents.length) {
    const rec = h('div', { class: 's1__recents' });
    rec.append(h('div', { class: 'caption', text: '최근 선택' }));
    const row = h('div', { class: 'recents' });
    for (const r of st.recents) {
      row.append(h('button', {
        class: 'pill', type: 'button', onClick: () => { selectBase(r); nav.go('/result'); },
      }, h('span', { class: 'dot', style: `--chip-color:${colorValue(r.color, cat.hex(r.color))}`, 'aria-hidden': 'true' }), cat.baseName(r)));
    }
    rec.append(row);
    body.append(rec);
  }

  body.append(h('div', { class: 'spacer' }));
  body.append(h('p', { class: 's1__hint', text: '색을 고르면 바로 조합이 나와요' }));
  const grid = h('div', { class: 's1__grid', role: 'group', 'aria-label': '기준 아이템 종류' });
  for (const c of CATS) {
    // S1→S2 는 replace: 첫 실행 S1→S2→S3 가 히스토리 한 항목이 된다 (P1-14)
    grid.append(h('button', { class: 'btn btn--big', type: 'button', text: cat.label(`category.${c}`), onClick: () => nav.replace(`/pick/${c}`) }));
  }
  body.append(grid, h('div', { style: `height:max(var(--safe-bottom), var(--sp-5))` }));
  screen.append(body);
  return screen;
}
