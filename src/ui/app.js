// 라우트 → 화면 조립. 시트(S6·O1)는 밑 화면 위에 겹쳐 그린다.
import * as nav from './nav.js';
import { get as getState, getResult, selectBase } from './state.js';
import { takeFocusRequest } from './components.js';
import { s1Category } from './screens/s1Category.js';
import { s2Color } from './screens/s2Color.js';
import { s3Result } from './screens/s3Result.js';
import { s4More, moreTab } from './screens/s4More.js';
import { s5Detail } from './screens/s5Detail.js';
import { s6Sheet } from './screens/s6Sheet.js';
import { installSheet } from './install.js';

const CATS = new Set(['top', 'bottom', 'shoes', 'outer']);
let root;
let lastRoute;

export function mount(el) {
  root = el;
  nav.start(render);
}

function render(route) {
  lastRoute = route || lastRoute;
  const r = lastRoute;
  const st = getState();
  const rerender = () => render(r);
  const nodes = [];

  switch (r.screen) {
    case 'pick':
      nodes.push(CATS.has(r.a) ? s2Color(r.a) : s1Category());
      break;
    case 'result':
      // 딥링크 #/result/:category/:color[/...next] → 기준 아이템 선택 후 결과(또는 next 경로). 테스트·바로가기용
      if (CATS.has(r.a) && r.b) {
        selectBase({ category: r.a, color: r.b });
        const next = r.seg.slice(3).join('/');
        return nav.replace(next ? `/${next}` : '/result');
      }
      if (!st.base) return nav.replace('/');
      nodes.push(s3Result({ rerender }));
      if (r.a === 'install') nodes.push(installSheet());
      break;
    case 'more': {
      if (!st.base) return nav.replace('/');
      // 톤 그룹이 0개면 톤별 탭 대신 색상별/변주로 (P1-07 ③). 딥링크도 같은 규칙.
      const want = ['tone', 'hue', 'var'].includes(r.a) ? r.a : 'tone';
      const tab = moreTab(getResult(), want);
      if (tab !== want) return nav.replace(`/more/${tab}`);
      nodes.push(s4More(tab));
      break;
    }
    case 'outfit':
      if (!st.base) return nav.replace('/');
      nodes.push(s5Detail(r.a));
      if (r.b) nodes.push(s6Sheet(r.a, r.b));
      break;
    default:
      nodes.push(st.base ? s3Result({ rerender }) : s1Category());
  }
  root.replaceChildren(...nodes);
  if (!r.b && r.a !== 'install') window.scrollTo(0, 0);
  // 시트를 닫고 돌아왔을 때 시트를 연 버튼으로 포커스 복귀 (P2-08)
  const key = takeFocusRequest();
  if (key) root.querySelector(`[data-focus-key="${CSS.escape(key)}"]`)?.focus?.({ preventScroll: true });
}
