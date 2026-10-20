// S5 조합 상세 — 무대 조명 일러스트(36dvh, 그레인 없음) + 색 점 + 캡션 + 소품 줄(있을 때) + 상세 칩 4줄 + 하단 ♥ 저장 · 공유. 코치마크 B 는 제거(U6-11).
import { h, append, joinBold } from '../dom.js';
import { topbar, dots, flag, isDisputed, captionParts, detailReasons, favButton, styleTagsOf, styleShort } from '../components.js';
import { icon } from '../icons.js';
import { renderOutfit, colorValue } from '../silhouette.js';
import * as nav from '../nav.js';
import { get as getState, findCandidate } from '../state.js';
import { accessorySlot } from '../typeToLayer.js';

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
  const base = found.base || st.base;
  const season = found.season || st.season;
  const items = candidate.outfit.items;
  const ordered = cat.ordered(items);
  const parts = captionParts(items);
  const boldIdx = variation ? ordered.findIndex((it) => it.category === variation.swapped.category) : -1;
  const d = isDisputed(candidate);

  screen.append(topbar({ title: typeof label === 'string' ? label : '조합', back: () => nav.back('/result') }));
  const body = h('div', { class: 'screen__body screen__body--scroll' });
  const hero = h('div', { class: 's5__hero' });
  const ill = h('div', { class: 's5__ill' });
  // 그레인은 끈다(식별 불가 + 필터 페인트 비용, 리뷰 4절) — 무대 조명(stage)은 유지
  ill.append(renderOutfit(items, { size: 400, season, hexOf: cat.hex, label: parts.join(', '), stage: true, grain: false, accessories: candidate.accessories }));
  hero.append(ill, dots(items, { base, swapped: variation?.swapped, size: 'lg' }));
  const cap = h('p', { class: 's5__cap' });
  append(cap, joinBold(parts, boldIdx));
  hero.append(cap);
  const tags = styleTagsOf(candidate);
  const why = detailReasons(candidate, tags.length ? 1 : 2).join(' · '); // 태그가 있으면 이유 1개 — 한 줄 유지
  if (why || tags.length) {
    const line = h('p', { class: 's5__why' });
    for (const t of tags) line.append(h('span', { class: 'tag', text: styleShort(t) }));
    if (why) line.append(h('span', { text: why }));
    hero.append(line);
  }
  if (d) {
    hero.append(h('button', { class: 'btn btn--ghost', type: 'button', 'data-focus-key': 's5:disputed', onClick: () => nav.go(`/outfit/${ref}/disputed`) }, flag(), ' 의견 갈림 — 이유 보기'));
  }
  body.append(hero);

  // 소품 줄 (CX accessories[] 가 있을 때만) — 색 점 + 이름 칩
  const acc = Array.isArray(candidate.accessories) ? candidate.accessories.filter(Boolean) : [];
  if (acc.length) {
    const row = h('div', { class: 's5__acc', role: 'list', 'aria-label': '소품', tabindex: '0' }); // 가로 스크롤 영역은 키보드로도 (axe scrollable-region-focusable)
    row.append(h('span', { class: 'eyebrow', text: '소품' }));
    for (const a of acc) {
      const slot = accessorySlot(a) || a.group || a.category || a.type;
      const name = a.label || a.labelKo || cat.plain(`accessory.${a.id || a.type || slot}`) || String(a.type || slot);
      const chip = h('span', { class: 'pill pill--static glass', role: 'listitem', title: a.note || a.text || '' });
      if (a.color) chip.append(h('span', { class: 'dot', 'aria-hidden': 'true', style: `--chip-color:${colorValue(a.color, cat.hex(a.color))}` }));
      chip.append(h('span', { text: a.color ? `${cat.plain(`color.${a.color}`)} ${name}` : name }));
      row.append(chip);
    }
    body.append(row);
  }
  body.append(h('div', { class: 'spacer' }));

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
  const detail = h('div', { class: 'detail', role: 'group', 'aria-label': '상세' }); // button 에 listitem 역할은 허용되지 않음 (axe aria-allowed-role)
  for (const [kind, k, v] of rows) {
    detail.append(h('button', { class: 'drow glass', type: 'button', 'aria-label': `${k}: ${v}. 자세히`, 'data-focus-key': `s5:${kind}`, onClick: () => nav.go(`/outfit/${ref}/${kind}`) },
      h('span', { class: 'drow__k', text: k }), h('span', { class: 'drow__v', text: v }), h('span', { class: 'drow__a', 'aria-hidden': 'true', text: '›' })));
  }
  body.append(detail);
  screen.append(body);

  // 하단 고정 줄: ♥ 저장 · 공유 (각 48px, 반반) — ux-enhancement 4-1
  const bar = h('div', { class: 'bottom bottom--row' });
  const fav = favButton(candidate, { label: typeof label === 'string' ? label : '조합', season, base });
  fav.classList.add('btn', 'btn--half', 'glass');
  fav.classList.remove('card__fav');
  fav.classList.add('favbtn');
  fav.append(h('span', { text: '저장' }));
  fav.dataset.focusKey = 's5:fav';
  const share = h('button', { class: 'btn btn--half glass', type: 'button', 'data-focus-key': 's5:share', onClick: () => nav.go(`/outfit/${ref}/share`) }, icon('share', { size: 20 }), h('span', { text: '공유' }));
  bar.append(fav, share);
  screen.append(bar);
  return screen;
}

