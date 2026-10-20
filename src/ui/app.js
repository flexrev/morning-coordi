// 라우트 → 화면 조립 (motion-spec 4-1·4-2). 밑 화면은 키(`screen/a`)로 재사용하고 시트만 추가·제거한다 → 시트 닫힘 모션·스크롤·라이브 리전 유지.
// 키가 바뀌면 viewTransition(앞으로 슬라이드 / 뒤로 크로스페이드). popstate 는 항상 뒤로.
import * as nav from './nav.js';
import { get as getState, getResult, selectBase, ensureExpansion } from './state.js';
import { read, KEYS } from './storage.js';
import { takeFocusRequest } from './components.js';
import { s1Category } from './screens/s1Category.js';
import { s2Color } from './screens/s2Color.js';
import { s3Result } from './screens/s3Result.js';
import { s4More, moreTab } from './screens/s4More.js';
import { s5Detail } from './screens/s5Detail.js';
import { s6Sheet } from './screens/s6Sheet.js';
import { settingsScreen } from './screens/settings.js';
import { menuSheet, favSheet, shareSheet, resetSheet } from './screens/sheets.js';
import { installSheet } from './install.js';
import { viewTransition, supportsVT, takeNavHint, prefersReducedMotion } from './motion.js';
import { hideCoach } from './coach.js';

const CATS = new Set(['top', 'bottom', 'shoes', 'outer']);
const RESULT_SHEETS = { install: installSheet, menu: menuSheet, fav: favSheet };
const OUTFIT_SHEETS = new Set(['fit', 'mat', 'shoe', 'len', 'disputed', 'share']);
let root;
let lastRoute;
let lastKey = null;
let lastRank = null;
let closing = null; // 닫히는 중인 시트 노드

export function mount(el) {
  root = el;
  nav.start(render);
}

/** 화면 등급 (motion-spec 4-1): S1 0 · S2 1 · S3 2 · S4 3 · 설정 3 · S5 4 */
function rankOf(key) {
  if (key === 's1') return 0;
  if (key.startsWith('s2')) return 1;
  if (key === 's3') return 2;
  if (key.startsWith('s4') || key === 'st1') return 3;
  return 4;
}

/**
 * 라우트 → { key, main: () => HTMLElement, sheet?: () => HTMLElement } 또는 { redirect: path }
 */
function compose(r, st, rerender) {
  switch (r.screen) {
    case 'pick':
      return CATS.has(r.a) ? { key: `s2/${r.a}`, main: () => s2Color(r.a) } : { key: 's1', main: s1Category };
    case 'result': {
      // 딥링크 #/result/:category/:color[/...next] → 기준 아이템 선택 후 결과(또는 next 경로)
      if (CATS.has(r.a) && r.b) {
        selectBase({ category: r.a, color: r.b });
        const next = r.seg.slice(3).join('/');
        return { redirect: next ? `/${next}` : '/result' };
      }
      if (!st.base) return { redirect: '/' };
      return { key: 's3', main: () => s3Result({ rerender }), sheet: RESULT_SHEETS[r.a] || null };
    }
    case 'more': {
      if (!st.base) return { redirect: '/' };
      const want = ['tone', 'hue', 'var', 'style'].includes(r.a) ? r.a : 'tone';
      const tab = moreTab(getResult(), want);
      if (tab !== want) return { redirect: `/more/${tab}` };
      return { key: 's4', main: () => s4More(tab) };
    }
    case 'outfit': {
      if (!st.base && !String(r.a || '').startsWith('fav.')) return { redirect: '/' };
      const sheet = r.b && OUTFIT_SHEETS.has(r.b) ? (r.b === 'share' ? () => shareSheet(r.a) : () => s6Sheet(r.a, r.b)) : null;
      return { key: `s5/${r.a}`, main: () => s5Detail(r.a), sheet };
    }
    case 'settings':
      return { key: 'st1', main: settingsScreen, sheet: r.a === 'reset' ? resetSheet : null };
    default:
      // U6-04: "처음 안내 다시 보기"가 onboarded 를 지우면 기본 경로는 S1(온보딩 스트립)로. 첫 S3 가 다시 onboarded=true 를 쓴다
      return st.base && read(KEYS.onboarded) ? { key: 's3', main: () => s3Result({ rerender }) } : { key: 's1', main: s1Category };
  }
}

/** 확장 데이터(스타일·상황·소품)가 필요한 화면: S4 더 보기 · S5 상세(소품 줄) · 공유 */
const needsExpansion = (r) => r.screen === 'more' || r.screen === 'outfit';

function render(route, { pop = false } = {}) {
  lastRoute = route || lastRoute;
  const r = lastRoute;
  const st = getState();
  if (needsExpansion(r) && !st.expanded) {
    // 지연 청크를 기다렸다가 그린다 (SW 캐시 ≈ 수 ms, 첫 온라인 ≈ 100ms). 실패하면 핵심 엔진으로 그대로 진행
    ensureExpansion().then(() => { if (lastRoute === r) render(r, { pop }); });
    return;
  }
  const rerender = () => { lastKey = null; render(r); };
  const plan = compose(r, st, rerender);
  if (plan.redirect) return nav.replace(plan.redirect);

  const curMain = root.querySelector(':scope > main');
  const curSheet = root.querySelector(':scope > .sheet-root:not(.is-closing)');
  const sameKey = plan.key === lastKey && curMain;

  if (sameKey) {
    // 밑 화면 유지: 시트만 추가·제거·교체
    curMain.__update?.(r);
    if (curSheet && !plan.sheet) closeSheet(curSheet);
    else if (plan.sheet) {
      if (curSheet) { curSheet.cleanup?.(); curSheet.remove(); }
      root.append(plan.sheet());
    }
    restoreFocus();
    return;
  }

  // 전환 종류: 힌트 > popstate(뒤로) > 등급 비교
  const rank = rankOf(plan.key);
  const hint = takeNavHint();
  const type = hint || (pop ? 'back' : lastRank == null ? 'none' : rank > lastRank ? 'fwd' : rank < lastRank ? 'back' : 'none');
  lastKey = plan.key;
  lastRank = rank;
  hideCoach();
  if (closing) { closing.remove(); closing = null; }

  const update = () => {
    const nodes = [plan.main()];
    if (plan.sheet) nodes.push(plan.sheet());
    root.replaceChildren(...nodes);
    if (!plan.sheet) window.scrollTo(0, 0);
    // CSS 폴백(View Transitions 없음·reduced): 새 main 만 불투명도로 들어온다
    if (type !== 'none' && !supportsVT()) nodes[0].classList.add(prefersReducedMotion() ? 'is-entering-fade' : `is-entering-${type}`);
    restoreFocus();
  };
  viewTransition(update, type);
}

/** 시트 닫힘: .is-closing → 닫힘 모션 뒤 제거 (motion-spec 3-9). reduced 면 80ms */
function closeSheet(node) {
  node.cleanup?.();
  node.classList.add('is-closing');
  closing = node;
  const ms = prefersReducedMotion() ? 80 : 140;
  setTimeout(() => { node.remove(); if (closing === node) closing = null; }, ms);
}

/** 시트를 닫고 돌아왔을 때 시트를 연 버튼으로 포커스 복귀 (P2-08) */
function restoreFocus() {
  const key = takeFocusRequest();
  if (key) root.querySelector(`[data-focus-key="${CSS.escape(key)}"]`)?.focus?.({ preventScroll: true });
}
