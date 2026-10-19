// 실루엣 렌더러 — design-tokens.md 6·7장. 레이어 SVG를 빌드 타임에 ?raw로 인라인하고
// base → shoes → bottom → top → outer 순으로 쌓는다. 색은 --c-* 변수, 소재는 <pattern> 오버레이.
import { layerFor, patternFor } from './typeToLayer.js';
import { ensurePatternDefs } from './patternDefs.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const Z_ORDER = ['base', 'shoes', 'bottom', 'top', 'outer'];

// Vite: 27개 파일을 문자열로 번들에 포함 (런타임 fetch 없음 → 오프라인 안전)
const RAW = import.meta.glob('../assets/silhouettes/*.svg', { query: '?raw', import: 'default', eager: true });

/** 파일명(확장자 없음) → <path> 템플릿 배열. 최초 1회 파싱. */
const CACHE = new Map();
function pathsOf(file) {
  if (CACHE.has(file)) return CACHE.get(file);
  const raw = RAW[`../assets/silhouettes/${file}.svg`];
  let paths = [];
  if (raw && typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(raw, 'image/svg+xml');
    paths = Array.from(doc.querySelectorAll('path')).map((p) => document.importNode(p, true));
  }
  CACHE.set(file, paths);
  return paths;
}

/** 색 id → CSS 값. 토큰이 없으면 hex 폴백(데이터 hex). */
export function colorValue(colorId, hex) {
  if (!colorId) return hex || '#888888';
  return `var(--g-${colorId}${hex ? `, ${hex}` : ''})`;
}

/**
 * @param {Array<{category:string,color:string,material?:string|null,fit?:string|null,length?:string|null,shoeType?:string|null,itemType?:string|null,layer?:number}>} items
 * @param {{size?:number, season?:string, figure?:boolean, label?:string, hexOf?:(id:string)=>string|undefined}} [opts]
 * @returns {SVGSVGElement}  viewBox 0 0 200 400, height = size
 */
export function renderOutfit(items, opts = {}) {
  ensurePatternDefs();
  const size = opts.size ?? 120;
  const hexOf = opts.hexOf || (() => undefined);
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 400');
  svg.setAttribute('width', String(Math.round(size / 2)));
  svg.setAttribute('height', String(size));
  svg.setAttribute('class', 'sil');
  if (opts.label) {
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', opts.label);
  } else {
    svg.setAttribute('aria-hidden', 'true');
  }

  // 슬롯별 아이템 (outer 2개면 바깥쪽 layer 2만)
  const bySlot = {};
  for (const it of items || []) {
    if (!it || !it.category) continue;
    if (it.category === 'outer' && bySlot.outer && (bySlot.outer.layer || 1) >= (it.layer || 1)) continue;
    bySlot[it.category] = it;
  }

  // 색 주입
  for (const slot of ['top', 'bottom', 'shoes', 'outer']) {
    const it = bySlot[slot];
    if (it) svg.style.setProperty(`--c-${slot}`, colorValue(it.color, hexOf(it.color)));
  }

  for (const slot of Z_ORDER) {
    if (slot === 'base') {
      if (opts.figure !== false) appendPaths(svg, pathsOf('figure-base'), null, null);
      continue;
    }
    const it = bySlot[slot];
    if (!it) continue;
    const layer = layerFor(it);
    if (!layer) continue;
    const tpl = pathsOf(layer.file).filter((p) => !p.dataset.detail || p.dataset.detail === layer.detail);
    appendPaths(svg, tpl, it, patternFor(it.material));
  }
  return svg;
}

function appendPaths(svg, tpl, item, patternId) {
  const g = document.createElementNS(SVG_NS, 'g');
  if (item) g.dataset.cat = item.category;
  for (const p of tpl) {
    const base = p.cloneNode(true);
    applyLength(base, item);
    g.append(base);
    if (patternId && !p.dataset.detail) {
      const over = p.cloneNode(true);
      over.setAttribute('fill', `url(#${patternId})`);
      over.setAttribute('stroke', 'none');
      over.dataset.mat = patternId.replace('pat-', '');
      applyLength(over, item);
      g.append(over);
    }
  }
  svg.append(g);
}

/** 기장 규칙 (design-tokens 7-3): 바지 crop·상의 crop은 clip, 상의 long은 scaleY(1.06) */
function applyLength(path, item) {
  if (!item) return;
  const len = item.length;
  if (item.category === 'bottom' && len === 'crop') {
    path.dataset.length = 'crop';
    path.setAttribute('clip-path', 'url(#clip-crop)');
  } else if (item.category === 'top' && len === 'crop') {
    path.dataset.length = 'crop';
    path.setAttribute('clip-path', 'url(#clip-top-crop)');
  } else if (item.category === 'top' && len === 'long') {
    path.dataset.length = 'long';
    path.setAttribute('transform', 'translate(0 70) scale(1 1.06) translate(0 -70)');
  }
}
