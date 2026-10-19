// S3 결과 (재방문 홈) — 계절 토글 · 기준 아이템 바 · 최근 선택 · 클래식 3장 · 하단 더 보기 + 카테고리 4개.
import { h } from '../dom.js';
import { topbar, outfitCard, seasonSegment } from '../components.js';
import * as nav from '../nav.js';
import { get as getState, getResult, selectBase, setSeason, seasonForMonth } from '../state.js';
import { colorValue } from '../silhouette.js';
import { shouldShowBanner, installBanner } from '../install.js';
import { moreTab } from './s4More.js';

const CATS = ['bottom', 'top', 'shoes', 'outer'];

export function s3Result({ rerender }) {
  const st = getState();
  const cat = st.catalog;
  const base = st.base;
  const screen = h('main', { class: 'screen', id: 's3' });
  screen.append(topbar({
    title: '아침 코디', app: true,
    side: seasonSegment({ value: st.season, autoDiffers: !st.seasonIsAuto && st.season !== seasonForMonth(), onChange: (s) => { setSeason(s); rerender(); } }),
  }));

  const body = h('div', { class: 'screen__body screen__body--scroll' });
  const banner = shouldShowBanner() ? installBanner({ onChange: rerender }) : null;
  if (banner) body.append(banner);

  // 기준 아이템 바
  body.append(h('button', { class: 'basebar', type: 'button', 'aria-label': `${cat.baseName(base)}. 색 바꾸기`, onClick: () => nav.go(`/pick/${base.category}`) },
    h('span', { class: 'dot dot--base', style: `--chip-color:${colorValue(base.color, cat.hex(base.color))}`, 'aria-hidden': 'true' }),
    h('span', { class: 'basebar__text', text: cat.baseName(base) }),
    h('span', { class: 'basebar__cta', text: '색 바꾸기 ›' })));

  // 최근 선택 (0개면 줄 생략)
  if (st.recents.length > 1) {
    const row = h('div', { class: 'recents', role: 'group', 'aria-label': '최근 선택' });
    for (const r of st.recents) {
      const on = r.category === base.category && r.color === base.color;
      // 항상 "카테고리 · 색", 탭해도 순서는 그대로(강조만 이동) (P1-08)
      row.append(h('button', {
        class: 'pill', type: 'button', 'aria-pressed': String(on),
        onClick: () => { if (!on) { selectBase(r, { keepOrder: true }); rerender(); } },
      }, h('span', { class: 'dot', style: `--chip-color:${colorValue(r.color, cat.hex(r.color))}`, 'aria-hidden': 'true' }),
      h('span', { class: 'pill__cat', text: cat.label(`category.${r.category}`) }), cat.plain(`color.${r.color}`)));
    }
    body.append(row);
  }

  // 클래식 3장
  const result = getResult();
  const cards = h('div', { class: 'cards', role: 'list', 'aria-label': '클래식 조합' });
  const classic = result?.classic || [];
  if (!classic.length) {
    const empty = h('div', { class: 'empty', role: 'listitem' },
      h('p', { text: `${cat.label(`season.${st.season}`)}엔 이 조합이 없어요` }),
      h('button', { class: 'btn', type: 'button', text: '다른 계절 보기', onClick: () => { setSeason(st.season === 'winter' ? 'springFall' : st.season === 'summer' ? 'springFall' : 'summer'); rerender(); } }));
    const nv = result?.variations?.length || 0;
    if (nv) empty.append(h('button', { class: 'btn btn--ghost', type: 'button', text: `변주 ${nv}개 보기`, onClick: () => nav.go('/more/var') }));
    cards.append(empty);
  } else {
    classic.forEach((c, i) => {
      const li = h('div', { role: 'listitem' });
      li.append(outfitCard(c, { label: `클래식 ${i + 1}/${classic.length}`, ref: `classic.${i}` }));
      cards.append(li);
    });
    // 클래식이 3장 미만이면 변주(점수순)로 채우고 "변주" 라벨 (P1-18)
    if (classic.length < 3) {
      const seen = new Set(classic.map((c) => c.outfit?.id));
      const fill = (result?.variations || []).map((v, i) => ({ v, i }))
        .filter(({ v }) => v.candidate && !seen.has(v.candidate.outfit?.id))
        .sort((a, b) => (b.v.candidate.score?.final ?? 0) - (a.v.candidate.score?.final ?? 0))
        .slice(0, 3 - classic.length);
      for (const { v, i } of fill) {
        const li = h('div', { role: 'listitem' });
        li.append(outfitCard(v.candidate, { label: '변주', ref: `var.${i}`, swapped: v.swapped }));
        cards.append(li);
      }
    }
  }
  const spacer = h('div', { class: 'spacer' });
  body.append(cards, spacer);
  screen.append(body);

  // 하단 고정: 더 보기 56 + 카테고리 4개 48
  const bottom = h('div', { class: 'bottom' });
  bottom.append(h('button', { class: 'btn btn--primary btn--block', type: 'button', text: '더 보기', onClick: () => nav.go(`/more/${moreTab(result, 'tone')}`) }));
  const cats = h('div', { class: 'cats', role: 'group', 'aria-label': '기준 아이템 바꾸기' });
  for (const c of CATS) {
    cats.append(h('button', { class: `btn${c === base.category ? ' is-on' : ''}`, type: 'button', text: cat.label(`category.${c}`), onClick: () => nav.go(`/pick/${c}`) }));
  }
  bottom.append(cats);
  screen.append(bottom);

  // 배너가 있어도 클래식 3장이 하단 고정 영역 위에 다 들어가야 한다. 안 들어가면 배너를 카드 아래로 내린다 (P1-01 b).
  if (banner) {
    requestAnimationFrame(() => {
      if (!screen.isConnected) return;
      const cb = cards.getBoundingClientRect().bottom;
      const bt = bottom.getBoundingClientRect().top;
      if (cb > bt + 0.5) { banner.classList.add('banner--below'); body.insertBefore(banner, spacer); window.scrollTo(0, 0); }
    });
  }
  return screen;
}
