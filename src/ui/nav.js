// 초소형 라우터 — history.pushState + popstate. 라이브러리 없음 (gate-2 3-4).
// 경로는 location.hash 로 직렬화해 standalone에서도 뒤로 가기·딥링크가 동작한다.
//   #/                       S1 또는 S3 (저장된 선택 유무)
//   #/pick/:category         S2
//   #/result                 S3
//   #/result/:category/:color[/...next]  기준 아이템 선택 후 S3 또는 next 경로 (딥링크)
//   #/result/install         S3 + O1 시트
//   #/more/:tab              S4  (tone | hue | var)
//   #/outfit/:ref            S5  (ref: classic.0 · tone.neutral.1 · hue.analogous.0 · var.2)
//   #/outfit/:ref/:sheet     S5 + S6 시트 (fit | mat | shoe | len | disputed)

let handler = () => {};

export function parse(hash = location.hash) {
  const path = (hash || '#/').replace(/^#/, '') || '/';
  const seg = path.split('/').filter(Boolean);
  return { path, seg, screen: seg[0] || 'home', a: seg[1] || null, b: seg[2] || null };
}

export function current() { return parse(); }

// depth = 앱이 push 한 항목 수. 0 이면 뒤로 갈 앱 항목이 없다(history.length 는 다른 사이트 항목도 세므로 쓰지 않는다, P1-14).
const depth = () => (history.state && history.state.mc ? history.state.depth || 0 : 0);

export function go(path) {
  const h = `#${path}`;
  if (location.hash === h) return handler(parse(h));
  history.pushState({ mc: true, depth: depth() + 1 }, '', h);
  handler(parse(h));
}

export function replace(path) {
  const h = `#${path}`;
  history.replaceState({ mc: true, depth: depth() }, '', h);
  handler(parse(h));
}

/** 시트·탭 닫기용. 앱이 push 한 항목이 있으면 back, 아니면 replace(fallback). */
export function back(fallback = '/') {
  if (depth() > 0) history.back();
  else replace(fallback);
}

export function start(onRoute) {
  handler = onRoute;
  if (!history.state || !history.state.mc) history.replaceState({ mc: true, root: true, depth: 0 }, '', location.hash || '#/');
  window.addEventListener('popstate', () => handler(parse()));
  handler(parse());
}
