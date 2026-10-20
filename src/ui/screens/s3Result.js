// S3 결과 / S3′ 오늘의 추천 홈 — 날짜 제목 · 계절 세그먼트 · ⋯ 메뉴 · 기준 아이템 바(히어로급) · 바로가기 줄(♥ 저장 N + 최근) ·
// 클래식 3장(오늘 카드 맨 위) · 하단 더 보기(부제) + 카테고리 4. 제자리 갱신(계절·pill·♥)은 카드 영역만 교체 + 스태거.
import { h } from '../dom.js';
import { topbar, outfitCard, seasonSegment } from '../components.js';
import { icon } from '../icons.js';
import * as nav from '../nav.js';
import { get as getState, getResult, selectBase, setSeason, seasonForMonth, wasSlow } from '../state.js';
import { colorValue } from '../silhouette.js';
import { shouldShowBanner, installBanner } from '../install.js';
import { moreTab } from './s4More.js';
import { todayIndex, dateLabel } from '../today.js';
import { read, write, KEYS } from '../storage.js';
import * as favorites from '../favorites.js';
import { stagger, nextFrame } from '../motion.js';
import { showCoach, seen as coachSeen } from '../coach.js';

const CATS = ['bottom', 'top', 'shoes', 'outer'];

export function s3Result({ rerender }) {
  const st = getState();
  const cat = st.catalog;
  const screen = h('main', { class: 'screen', id: 's3' });
  const firstResult = !read(KEYS.onboarded);
  if (firstResult) write(KEYS.onboarded, true); // 첫 결과를 본 순간 (ux-enhancement 6-2)

  // 상단: 날짜 · 앱 이름 / 계절 / ⋯
  const seg = seasonSegment({
    value: st.season, autoDiffers: !st.seasonIsAuto && st.season !== seasonForMonth(),
    onChange: (s) => { setSeason(s); refresh({ reason: 'season' }); },
  });
  const menuBtn = h('button', { class: 'topbar__icon', type: 'button', 'aria-label': '메뉴', 'data-focus-key': 's3:menu', onClick: () => nav.go('/result/menu') }, icon('more'));
  const bar = topbar({ title: dateLabel(), app: true, side: [seg, menuBtn] });
  bar.querySelector('.topbar__title').append(h('span', { class: 'topbar__app', text: ' · 아침 코디' }));
  screen.append(bar);

  const body = h('div', { class: 'screen__body screen__body--scroll' });
  const live = h('div', { class: 'visually-hidden', 'aria-live': 'polite', id: 's3-live' });
  body.append(live);
  const banner = shouldShowBanner() ? installBanner({ onChange: rerender }) : null;
  if (banner) body.append(banner);

  const head = h('div', { class: 's3__head' });   // 기준 바 + 바로가기 줄 (제자리 갱신 대상)
  const cards = h('div', { class: 'cards', role: 'list', 'aria-label': '클래식 조합' });
  const spacer = h('div', { class: 'spacer' });
  body.append(head, cards, spacer);
  screen.append(body);

  // 하단 고정: 더 보기 56(부제 포함) + 카테고리 4개 48
  const bottom = h('div', { class: 'bottom' });
  const moreBtn = h('button', { class: 'btn btn--primary btn--block btn--more', type: 'button', 'data-focus-key': 's3:more', onClick: () => nav.go(`/more/${moreTab(getResult(), 'tone')}`) },
    h('span', { class: 'btn__t', text: '더 보기' }), h('span', { class: 'btn__sub', text: '톤별 · 색상별 · 변주' }));
  bottom.append(moreBtn);
  const cats = h('div', { class: 'cats glass', role: 'group', 'aria-label': '기준 아이템 바꾸기' });
  const catBtns = {};
  for (const c of CATS) {
    catBtns[c] = h('button', { class: 'btn', type: 'button', text: cat.label(`category.${c}`), onClick: () => nav.go(`/pick/${c}`) });
    cats.append(catBtns[c]);
  }
  bottom.append(cats);
  screen.append(bottom);

  function renderHead() {
    const base = getState().base;
    head.replaceChildren();
    // 기준 아이템 바 — 히어로 타이틀급 (A의 위계)
    head.append(h('button', { class: 'basebar glass', type: 'button', 'aria-label': `${cat.baseName(base)}. 색 바꾸기`, 'data-focus-key': 's3:base', onClick: () => nav.go(`/pick/${base.category}`) },
      h('span', { class: 'dot dot--base basebar__sw', style: `--chip-color:${colorValue(base.color, cat.hex(base.color))}`, 'aria-hidden': 'true' }),
      h('span', { class: 'basebar__t' },
        h('span', { class: 'eyebrow', text: `${cat.label(`category.${base.category}`)} · 기준` }),
        h('span', { class: 'basebar__text', text: cat.plain(`color.${base.color}`) })),
      h('span', { class: 'basebar__cta', text: '바꾸기 ›' })));
    // 바로가기 줄: ♥ 저장 N (≥1) + 최근 선택 (2개 이상일 때) — 한 줄 48px
    const recents = getState().recents;
    const nFav = favorites.count();
    if (nFav >= 1 || recents.length > 1) {
      const row = h('div', { class: 'recents', role: 'group', 'aria-label': '바로가기' });
      if (nFav >= 1) {
        row.append(h('button', { class: 'pill pill--fav glass', type: 'button', 'data-focus-key': 's3:fav', 'aria-label': `저장한 조합 ${nFav}개 보기`, onClick: () => nav.go('/result/fav') },
          icon('heart', { filled: true, size: 16 }), h('span', { text: `저장 ${nFav}` })));
      }
      if (recents.length > 1) {
        for (const r of recents) {
          const on = r.category === base.category && r.color === base.color;
          row.append(h('button', {
            class: 'pill glass', type: 'button', 'aria-pressed': String(on),
            onClick: () => { if (!on) { selectBase(r, { keepOrder: true }); refresh({ reason: 'pill' }); } },
          }, h('span', { class: 'dot', style: `--chip-color:${colorValue(r.color, cat.hex(r.color))}`, 'aria-hidden': 'true' }),
          h('span', { class: 'pill__cat', text: cat.label(`category.${r.category}`) }), cat.plain(`color.${r.color}`)));
        }
      }
      head.append(row);
    }
    for (const c of CATS) catBtns[c].classList.toggle('is-on', c === base.category);
  }

  function renderCards() {
    const s = getState();
    const base = s.base;
    const result = getResult();
    cards.replaceChildren();
    const classic = result?.classic || [];
    if (!classic.length) {
      const empty = h('div', { class: 'empty', role: 'listitem' },
        h('p', { text: `${cat.label(`season.${s.season}`)}엔 이 조합이 없어요` }),
        h('button', { class: 'btn', type: 'button', text: '다른 계절 보기', onClick: () => { const n = s.season === 'summer' ? 'springFall' : s.season === 'winter' ? 'springFall' : 'summer'; setSeason(n); seg.setValue?.(n); refresh({ reason: 'season' }); } }));
      const nv = result?.variations?.length || 0;
      if (nv) empty.append(h('button', { class: 'btn btn--ghost', type: 'button', text: `변주 ${nv}개 보기`, onClick: () => nav.go('/more/var') }));
      cards.append(empty);
    } else {
      // 오늘 카드: 날짜로 정한 1장이 맨 위 (표시 순서만, ref 는 원래 인덱스)
      const ti = todayIndex(base, s.season, classic.length);
      const order = ti >= 0 ? [ti, ...classic.map((_, i) => i).filter((i) => i !== ti)] : classic.map((_, i) => i);
      for (const i of order) {
        const li = h('div', { role: 'listitem' });
        const n = `클래식 ${i + 1}/${classic.length}`;
        const isToday = i === ti;
        li.append(outfitCard(classic[i], { label: isToday ? `오늘의 추천 · ${n}` : n, ref: `classic.${i}`, today: isToday }));
        cards.append(li);
      }
      // 클래식이 3장 미만이면 변주(점수순)로 채우고 "변주" 라벨 (P1-18)
      if (classic.length < 3) {
        const seenIds = new Set(classic.map((c) => c.outfit?.id));
        const fill = (result?.variations || []).map((v, i) => ({ v, i }))
          .filter(({ v }) => v.candidate && !seenIds.has(v.candidate.outfit?.id))
          .sort((a, b) => (b.v.candidate.score?.final ?? 0) - (a.v.candidate.score?.final ?? 0))
          .slice(0, 3 - classic.length);
        for (const { v, i } of fill) {
          const li = h('div', { role: 'listitem' });
          li.append(outfitCard(v.candidate, { label: '변주', ref: `var.${i}`, swapped: v.swapped }));
          cards.append(li);
        }
      }
    }
    stagger(cards.children);
    cards.classList.remove('is-enter'); void cards.offsetWidth; cards.classList.add('is-enter');
    live.textContent = `${cat.label(`season.${s.season}`)} 조합 ${classic.length}개, 기준 ${cat.baseName(base)}`;
    guard();
  }

  /** 제자리 갱신 — 전환 없이 머리·카드만 교체 (motion-spec 4-2 ③) */
  function refresh() {
    renderHead();
    renderCards();
  }

  /** 높이 가드: 배너가 있으면 카드 3장이 하단 위에 다 들어가야(P1-01 b) · 안 들어가면 컴팩트 모드(ux-enhancement 12-4) */
  function guard() {
    // 카드의 이유 줄 생략(outfitCard 의 nextFrame)이 먼저 끝난 뒤 재는다 → 두 프레임 뒤
    nextFrame(() => nextFrame(() => {
      if (!screen.isConnected) return;
      const cb = cards.getBoundingClientRect().bottom;
      const bt = bottom.getBoundingClientRect().top;
      if (cb > bt + 0.5 && banner && !banner.classList.contains('banner--below')) {
        banner.classList.add('banner--below'); body.insertBefore(banner, spacer); window.scrollTo(0, 0);
        return guard();
      }
      if (cb > bt + 0.5 && !screen.classList.contains('is-compact')) { screen.classList.add('is-compact'); return guard(); }
    }));
  }

  renderHead();
  if (wasSlow()) {
    // 지난 계산 > 80ms: 틀 + 스켈레톤 3장을 먼저 그리고 다음 프레임에 계산 (motion-spec 3-11)
    for (let i = 0; i < 3; i++) cards.append(h('div', { class: 'skeleton', role: 'listitem', 'aria-hidden': 'true' }));
    nextFrame(() => { if (screen.isConnected) renderCards(); });
  } else {
    renderCards();
  }

  // 즐겨찾기 변화 → 바로가기 줄만 갱신 (카드는 건드리지 않음: 스크롤·스태거 유지)
  const off = favorites.subscribe(() => { if (!screen.isConnected) { off(); return; } renderHead(); });

  // 코치마크 A: 2회차 방문의 첫 S3, 배너 없는 날만, 카드 스태거 뒤 +400ms (ux-enhancement 7-2)
  const visits = (read(KEYS.install, {}) || {}).visits || 0;
  if (!firstResult && visits >= 2 && !banner && !coachSeen('more')) showCoach('more', moreBtn, { delay: 280 + 400 });

  screen.__update = () => {};
  return screen;
}

