// 작은 DOM 헬퍼. 데이터 문자열은 항상 textContent (innerHTML 금지).
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  append(el, children);
  return el;
}

export function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
  return el;
}

/** "a · b · c" 캡션에서 특정 인덱스만 <b>로 */
export function joinBold(parts, boldIndex) {
  const out = [];
  parts.forEach((p, i) => {
    if (i) out.push(' · ');
    out.push(i === boldIndex ? h('b', { text: p }) : p);
  });
  return out;
}
