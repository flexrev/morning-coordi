// 실루엣 렌더러 v2 — docs/phase6/asset-system.md 4장 계약. 레이어 SVG(src/assets/v2)를 빌드 타임에 ?raw 로 인라인하고
// index-v2.json 의 zOrder(stage → base → cap → socks → shoes → bottom → belt → top → mid → outer → scarf → bag → watch)로 쌓는다.
// 색은 --c-* 변수, 소재는 <pattern> 오버레이(main 바로 뒤), 벨트는 상의 tuck 일 때만, 양말은 바지 crop 일 때만.
// 무대(opts.stage)는 AS 의 stage-spotlight / stage-floor 레이어(index.stage 의 불투명도·블러 값)로, 그레인(opts.grain)은 필터로.
import { layerFor, patternFor, patternForPrint, accessorySlot, accessoriesForSize, Z_ORDER, STAGE, ACC_LAYER } from './typeToLayer.js';
import { ensurePatternDefs, cloneDefs } from './patternDefs.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const CLOTH = ['top', 'bottom', 'shoes', 'outer', 'mid'];

// Vite: 레이어 파일을 문자열로 번들에 포함 (런타임 fetch 없음 → 오프라인 안전)
const RAW = import.meta.glob('../assets/v2/*.svg', { query: '?raw', import: 'default', eager: true });

/** 파일명(확장자 없음) → <g data-slot> 템플릿. 최초 1회 파싱. */
const CACHE = new Map();
function groupOf(file) {
  if (!file) return null;
  if (CACHE.has(file)) return CACHE.get(file);
  const raw = RAW[`../assets/v2/${file}.svg`];
  let g = null;
  if (raw && typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(raw, 'image/svg+xml');
    const found = doc.querySelector('g[data-slot]');
    if (found) g = document.importNode(found, true);
  }
  CACHE.set(file, g);
  return g;
}

/** 색 id → CSS 값. 토큰이 없으면 hex 폴백(데이터 hex). */
export function colorValue(colorId, hex) {
  if (!colorId) return hex || '#888888';
  if (/^#/.test(colorId)) return colorId;
  return `var(--g-${colorId}${hex ? `, ${hex}` : ''})`;
}

/**
 * @param {Array<object>} items  outfit.items (+ category ∈ mid|belt|watch|socks|bag|cap|scarf 허용)
 * @param {{size?:number, season?:string, figure?:boolean, label?:string, hexOf?:(id:string)=>string|undefined,
 *          accessories?:Array<object>, stage?:boolean, grain?:boolean}} [opts]
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

  // 슬롯별 아이템 (outer 2개면 바깥쪽 layer 2만). 액세서리는 items[] 안이든 opts.accessories 든 슬롯으로 정규화.
  // 액세서리 크기 게이트 (U6-02): 카드(size < 240)는 벨트·양말만, S5·공유는 전부 — items[] 안의 액세서리도 같은 규칙
  const bySlot = {};
  const put = (it) => {
    if (!it) return;
    const slot = CLOTH.includes(it.category) ? it.category : accessorySlot(it);
    if (!slot) return;
    if (slot === 'outer' && bySlot.outer && (bySlot.outer.layer || 1) >= (it.layer || 1)) return;
    bySlot[slot] = { ...it, category: slot };
  };
  const cloth = (items || []).filter((it) => it && CLOTH.includes(it.category));
  const accIn = (items || []).filter((it) => it && !CLOTH.includes(it.category));
  for (const it of cloth) put(it);
  for (const a of accessoriesForSize([...accIn, ...(opts.accessories || [])], size)) put(a);

  // 색 주입: 의류 + 액세서리 슬롯 (--c-<slot>)
  for (const slot of Object.keys(bySlot)) {
    const it = bySlot[slot];
    const col = it.color || it.hex;
    if (col) svg.style.setProperty(`--c-${slot}`, colorValue(col, hexOf(col) || it.hex));
  }

  // 가시성 규칙 (asset-system 4-3)
  const tuck = !!bySlot.top && (bySlot.top.tuck === true || !!bySlot.belt);
  if (bySlot.belt && !tuck) delete bySlot.belt;
  if (bySlot.socks && bySlot.bottom?.length !== 'crop') delete bySlot.socks;
  const covered = !!bySlot.outer || !!bySlot.mid; // 아우터·미드가 있으면 상의는 regular 파일

  const stack = document.createElementNS(SVG_NS, 'g');
  stack.setAttribute('data-stack', '');
  if (opts.grain) stack.setAttribute('filter', 'url(#f-grain)');

  // 백팩(acc-backpack)은 그리지 않는다 — 어깨끈이 상의 위에 오면 멜빵, 상의 아래로 내리면 팩 상단이 목걸이로 읽힌다(U6-02·asset-system 10-7).
  // S5 소품 줄의 텍스트 칩으로만 남긴다. 토트·크로스바디는 S5·공유(≥ 240)에서 그대로.
  if (bySlot.bag && /backpack/i.test(String(bySlot.bag.type || bySlot.bag.itemType || bySlot.bag.id || ''))) delete bySlot.bag;
  for (const slot of Z_ORDER) {
    if (slot === 'stage') {
      if (opts.stage) appendStage(stack, size);
      continue;
    }
    if (slot === 'base') {
      if (opts.figure !== false) appendLayer(stack, groupOf('figure-base'), null, null, null);
      continue;
    }
    const it = bySlot[slot];
    if (!it) continue;
    const layer = layerFor(it, { forceRegular: slot === 'top' && covered });
    if (!layer) continue;
    appendLayer(stack, groupOf(layer.file), it, patternOf(it), layer, { tuck, hexOf });
  }
  svg.append(stack);
  return svg;
}

function patternOf(item) {
  return patternForPrint(item?.pattern) || patternFor(item?.material);
}

/** 무대: AS stage 레이어 2장(spotlight → floor). index.stage 의 크기별 불투명도·블러 적용 */
function appendStage(stack, size) {
  const key = size >= 240 ? 'detail300' : 'card120';
  for (const kind of ['spotlight', 'floor']) {
    const meta = STAGE?.[kind];
    const file = String(meta?.file || `stage-${kind}.svg`).replace(/\.svg$/, '');
    const tpl = groupOf(file);
    if (!tpl) continue;
    const g = tpl.cloneNode(true);
    g.dataset.stage = kind;
    const op = meta?.opacity?.[key];
    if (op != null && op !== 1) g.setAttribute('opacity', String(op));
    const blur = meta?.blur?.[key];
    if (blur && blur !== '0' && blur !== 0) g.style.filter = `blur(${blur})`;
    stack.append(g);
  }
}

/**
 * 레이어 <g> 복제 → 선택 파트 정리 → 패턴 오버레이(main 바로 뒤) → 기장 규칙 → 스택에 추가.
 * 파일 슬롯이 아이템 슬롯과 다르면(폴백 파일) 색 변수를 g 에 직접 넣어 색이 맞게 한다.
 * @returns {SVGGElement|null}
 */
function appendLayer(stack, tpl, item, patternId, layer, rules = {}) {
  if (!tpl) return null;
  const g = tpl.cloneNode(true);
  if (item) {
    g.dataset.cat = item.category;
    const fileSlot = g.dataset.slot;
    if (fileSlot && fileSlot !== item.category && (item.color || item.hex)) {
      g.style.setProperty(`--c-${fileSlot}`, colorValue(item.color || item.hex, rules.hexOf?.(item.color) || item.hex));
    }
  }
  // 선택 파트(data-detail): layer.detail 과 같을 때만 남긴다 (로퍼 태슬)
  for (const p of Array.from(g.querySelectorAll('[data-detail]'))) {
    if (p.dataset.detail !== layer?.detail) p.remove();
  }
  if (patternId) {
    for (const p of Array.from(g.querySelectorAll('path[data-part="main"]:not([data-kind])'))) {
      const over = p.cloneNode(true);
      over.setAttribute('fill', `url(#${patternId})`);
      over.setAttribute('stroke', 'none');
      over.removeAttribute('vector-effect');
      over.dataset.part = 'mat';
      over.dataset.mat = patternId.replace(/^pat2?-/, '');
      p.after(over);
    }
  }
  applyLength(g, item, rules);
  stack.append(g);
  return g;
}

/** 기장 규칙 (design-tokens 7-3 + asset-system 4-3): 바지 crop·상의 crop/tuck 은 clip, 상의 long 은 scaleY(1.06) */
function applyLength(g, item, { tuck } = {}) {
  if (!item) return;
  const len = item.length;
  if (item.category === 'bottom' && len === 'crop') {
    g.dataset.length = 'crop';
    g.setAttribute('clip-path', 'url(#clip-crop)');
  } else if (item.category === 'top' && (len === 'crop' || tuck)) {
    g.dataset.length = len === 'crop' ? 'crop' : 'tuck';
    g.setAttribute('clip-path', len === 'crop' && !tuck ? 'url(#clip-top-crop)' : 'url(#clip-top-tuck)');
  } else if (item.category === 'top' && len === 'long') {
    g.dataset.length = 'long';
    g.setAttribute('transform', 'translate(0 70) scale(1 1.06) translate(0 -70)');
  }
}

/**
 * 공유 이미지용 독립 SVG 문자열 (ux-enhancement 5-2): CSS 변수·currentColor 를 계산값으로 인라인하고 defs 를 복사한다.
 * svg 는 문서에 붙어 있어야(getComputedStyle) 한다. foreignObject 없음 → 캔버스 오염 없음.
 */
export function serializeStandalone(svg, { ink = '#F4F2ED' } = {}) {
  const cs = typeof getComputedStyle === 'function' ? getComputedStyle(svg) : null;
  const resolveVar = (expr) => {
    const m = /^var\((--[\w-]+)\s*(?:,\s*([^)]+))?\)$/.exec(expr.trim());
    if (!m) return expr;
    const v = cs?.getPropertyValue(m[1]).trim();
    return v && !/^var\(/.test(v) ? v : (m[2] ? resolveVar(m[2]) : '#888888');
  };
  const clone = svg.cloneNode(true);
  clone.setAttribute('xmlns', SVG_NS);
  clone.removeAttribute('class');
  clone.removeAttribute('style');
  clone.setAttribute('color', ink);
  for (const el of [clone, ...clone.querySelectorAll('*')]) {
    for (const attr of ['fill', 'stroke']) {
      const v = el.getAttribute(attr);
      if (!v) continue;
      if (/^var\(/.test(v)) el.setAttribute(attr, resolveVar(v));
      else if (v === 'currentColor') el.setAttribute(attr, ink);
    }
    if (el.getAttribute('filter')) el.removeAttribute('filter'); // 그레인은 공유에서 뺀다
    if (el.style?.filter) el.style.filter = '';                   // 무대 블러도 (래스터 필터는 <img> 로딩 시 안전하지만 불필요)
  }
  const defs = cloneDefs();
  if (defs) clone.prepend(defs);
  return new XMLSerializer().serializeToString(clone);
}

export { ACC_LAYER };
