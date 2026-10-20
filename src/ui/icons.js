// 인라인 SVG 아이콘 — 폰트 글리프 금지 (motion-spec R8: ♥ 글리프는 플랫폼마다 베이스라인이 튄다). 24px 그리드, 1.8px 선.
const NS = 'http://www.w3.org/2000/svg';

const PATHS = {
  heart: 'M12 20.5s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7.5 2.5c0 5.4-7.5 10-7.5 10z',
  share: 'M12 4v11M8 8l4-4 4 4M5 13v6h14v-6',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  gear: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM4.5 12l1.6-.4.4-1.6-1-1.4 1.4-1.4 1.4 1 1.6-.4L10.6 4h2.8l.7 1.8 1.6.4 1.4-1 1.4 1.4-1 1.4.4 1.6 1.6.4v2.8l-1.6.4-.4 1.6 1 1.4-1.4 1.4-1.4-1-1.6.4-.7 1.8h-2.8l-.7-1.8-1.6-.4-1.4 1-1.4-1.4 1-1.4-.4-1.6L4.5 12z',
  download: 'M12 4v11M7 11l5 5 5-5M5 20h14',
  help: 'M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7M12 17h.01',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  chevron: 'M9 6l6 6-6 6',
};

/**
 * @param {keyof PATHS} name
 * @param {{filled?:boolean, size?:number, class?:string}} [opts]
 */
export function icon(name, { filled = false, size = 24, class: cls } = {}) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('class', `ico ico--${name}${cls ? ` ${cls}` : ''}`);
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', PATHS[name] || '');
  p.setAttribute('fill', filled ? 'currentColor' : 'none');
  p.setAttribute('stroke', 'currentColor');
  p.setAttribute('stroke-width', name === 'more' ? '3' : '1.8');
  p.setAttribute('stroke-linecap', 'round');
  p.setAttribute('stroke-linejoin', 'round');
  svg.append(p);
  return svg;
}
