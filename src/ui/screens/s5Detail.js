// S5 조합 상세 — 일러스트 크게(폭 60%) + 색 점 + 캡션 + 상세 칩 4줄(핏·소재·신발 스타일·기장). 칩 탭 → S6.
import { h, append, joinBold } from '../dom.js';
import { topbar, dots, flag, isDisputed, captionParts, detailReasons } from '../components.js';
import { renderOutfit } from '../silhouette.js';
import * as nav from '../nav.js';
import { get as getState, findCandidate } from '../state.js';

export function s5Detail(ref) {
  const st = getState();
  const cat = st.catalog;
  const found = findCandidate(ref);
  const screen = h('main', { class: 'screen', id: 's5' });
  if (!found) {
    screen.append(topbar({ title: '조합', back: () => nav.back('/result') }));
    screen.append(h('div', { class: 'screen__body' }, h('div', { class: 'empty' }, h('p', { text: '이 조합을 찾을 수 없어요' }), h('button', { class: 'btn', type: 'button', text: '결과로', onClick: () => nav.replace('/result') }))));
    return screen;
  }
  const { candidate, label, variation } = found;
  const items = candidate.outfit.items;
  const ordered = cat.ordered(items);
  const parts = captionParts(items); // 전체 캡션 (엔진 itemCaption)
  const boldIdx = variation ? ordered.findIndex((it) => it.category === variation.swapped.category) : -1;
  const d = disputed(candidate);

  screen.append(topbar({ title: typeof label === 'string' ? label : '조합', back: () => nav.back('/result') }));
  const body = h('div', { class: 'screen__body screen__body--scroll' });
  const hero = h('div', { class: 's5__hero' });
  const ill = h('div', { class: 's5__ill' });
  ill.append(renderOutfit(items, { size: 400, season: st.season, hexOf: cat.hex, label: parts.join(', ') }));
  hero.append(ill, dots(items, { base: st.base, swapped: variation?.swapped, size: 'lg' }));
  const cap = h('p', { class: 's5__cap' });
  append(cap, joinBold(parts, boldIdx));
  hero.append(cap);
  const why = detailReasons(candidate).join(' · '); // '클래식 · 변주' 같은 한 단어 라벨은 제목과 겹치므로 제외
  if (why) hero.append(h('p', { class: 's5__why', text: why }));
  if (d) {
    hero.append(h('button', { class: 'btn btn--ghost', type: 'button', 'data-focus-key': 's5:disputed', onClick: () => nav.go(`/outfit/${ref}/disputed`) }, flag(), ' 의견 갈림 — 이유 보기'));
  }
  body.append(hero, h('div', { class: 'spacer' }));

  const top = items.find((i) => i.category === 'top');
  const bottom = items.find((i) => i.category === 'bottom');
  const shoes = items.find((i) => i.category === 'shoes');
  const outer = items.find((i) => i.category === 'outer');
  const rows = [
    ['fit', '핏', [top && `${cat.label(`fit.top.${top.fit || 'regular'}`)} 상의`, bottom && `${cat.label(`fit.bottom.${bottom.fit || 'regular'}`)} 하의`].filter(Boolean).join(' + ')],
    ['mat', '소재', [top, bottom, shoes, outer].filter(Boolean).map((it) => (it.material ? cat.label(`material.${it.material}`) : null)).filter(Boolean).join(' · ') || '소재 정보 없음'],
    ['shoe', '신발 스타일', shoes ? cat.itemName(shoes) : '—'],
    ['len', '기장', [top && `${cat.label(`length.top.${top.length || 'regular'}`)} 상의`, bottom && cat.label(`length.trouser.${bottom.length || 'nobreak'}`), outer && `${cat.label(`length.outer.${outer.length || 'regular'}`)} 아우터`].filter(Boolean).join(' · ')],
  ];
  const detail = h('div', { class: 'detail', role: 'list' });
  for (const [kind, k, v] of rows) {
    detail.append(h('button', { class: 'drow', type: 'button', role: 'listitem', 'aria-label': `${k}: ${v}. 자세히`, 'data-focus-key': `s5:${kind}`, onClick: () => nav.go(`/outfit/${ref}/${kind}`) },
      h('span', { class: 'drow__k', text: k }), h('span', { class: 'drow__v', text: v }), h('span', { class: 'drow__a', 'aria-hidden': 'true', text: '›' })));
  }
  body.append(detail);
  screen.append(body);
  return screen;
}

function disputed(candidate) { return isDisputed(candidate); }
