// S1 카테고리 선택 — 첫 실행 홈. 큰 제목(30/38 800) + 온보딩 스트립(첫 실행만, ux-enhancement 6장) + 하단 2×2 글래스 타일.
import { h } from '../dom.js';
import { topbar } from '../components.js';
import * as nav from '../nav.js';
import { get as getState, selectBase } from '../state.js';
import { colorValue } from '../silhouette.js';
import { read, KEYS } from '../storage.js';

const CATS = ['bottom', 'top', 'shoes', 'outer'];
const STEPS = [
  ['하나 고르면', '하의·상의·신발·아우터 중 하나'],
  ['바로 세 가지 조합', '색만 고르면 끝'],
  ['더 보기에서 더 많은 조합', '톤별·색상별·변주'],
];

export function s1Category() {
  const st = getState();
  const cat = st.catalog;
  const screen = h('main', { class: 'screen', id: 's1' });
  screen.append(topbar({ title: '아침 코디', app: true, heading: 'div' })); // h1 은 히어로 문장 (P2-06)
  const body = h('div', { class: 'screen__body' });
  body.append(h('div', { class: 's1__hero' },
    h('div', { class: 'eyebrow', text: '오늘 아침' }),
    h('h1', { text: '오늘 입을 옷, 하나만 고르세요' })));

  if (st.recents.length) {
    const rec = h('div', { class: 's1__recents' });
    rec.append(h('div', { class: 'caption', text: '최근 선택' }));
    const row = h('div', { class: 'recents' });
    for (const r of st.recents) {
      row.append(h('button', {
        class: 'pill glass', type: 'button', onClick: () => { selectBase(r); nav.go('/result'); },
      }, h('span', { class: 'dot', style: `--chip-color:${colorValue(r.color, cat.hex(r.color))}`, 'aria-hidden': 'true' }), cat.baseName(r)));
    }
    rec.append(row);
    body.append(rec);
  }

  body.append(h('div', { class: 'spacer' }));
  // 온보딩 스트립 (ON): 첫 실행만. 장식 — 누를 것 없음, 건너뛰기 = 카테고리 탭. 힌트 바로 위(U6-17: 빈 216px 제거, 눈이 타일로 이어짐)
  if (!read(KEYS.onboarded)) {
    const strip = h('ol', { class: 'onb', 'aria-label': '처음 안내' });
    STEPS.forEach(([t, s], i) => {
      strip.append(h('li', { class: 'onb__step', style: `--i:${i}` },
        h('span', { class: 'onb__num', 'aria-hidden': 'true', text: String(i + 1) }),
        h('span', { class: 'onb__text' }, h('b', { text: t }), h('small', { text: s }))));
    });
    body.append(strip);
  }
  body.append(h('p', { class: 's1__hint', text: '색을 고르면 바로 조합이 나와요' }));
  const grid = h('div', { class: 's1__grid', role: 'group', 'aria-label': '기준 아이템 종류' });
  for (const c of CATS) {
    // S1→S2 는 replace: 첫 실행 S1→S2→S3 가 히스토리 한 항목이 된다 (P1-14)
    grid.append(h('button', { class: 'btn btn--big glass', type: 'button', text: cat.label(`category.${c}`), onClick: () => nav.replace(`/pick/${c}`) }));
  }
  body.append(grid, h('div', { style: `height:max(var(--safe-bottom), var(--sp-5))` }));
  screen.append(body);
  return screen;
}
