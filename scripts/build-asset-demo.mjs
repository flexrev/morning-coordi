#!/usr/bin/env node
// docs/phase6/asset-demo.html 생성기 — v1(src/assets/silhouettes)·v2(src/assets/v2) SVG를 문자열로 인라인해
// 디스크에서 바로 열리는 단일 HTML을 만든다. 자산을 고치면 `node scripts/build-asset-demo.mjs` 로 재생성.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const read = (dir) => Object.fromEntries(
  readdirSync(join(ROOT, dir)).filter((f) => f.endsWith('.svg')).map((f) => [f.replace(/\.svg$/, ''), readFileSync(join(ROOT, dir, f), 'utf8')]),
);
const V1 = read('src/assets/silhouettes');
const V2 = read('src/assets/v2');
const INDEX = JSON.parse(readFileSync(join(ROOT, 'src/assets/v2/index-v2.json'), 'utf8'));
const js = (o) => JSON.stringify(o).replace(/<\//g, '<\\/');

const html = `<!doctype html>
<html lang="ko" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>아침 코디 자산 v2 데모</title>
<style>
:root, [data-theme="dark"] {
  --bg-0:#121212; --bg-1:#1C1C1E; --bg-2:#262629;
  --text-1:#F2F1EE; --text-2:#B4B2AD; --text-3:#94928D;
  --accent:#E0BE7E; --border:#33333A; --chip-border:rgba(255,255,255,.28);
  --c-skin:#C9A98C; --c-hair:#2B2420; --c-metal:#C8C6C0; --c-sole:#ECE9E2;
  color-scheme: dark;
}
[data-theme="light"] {
  --bg-0:#F6F5F1; --bg-1:#FFFFFF; --bg-2:#FFFFFF;
  --text-1:#1B1B1A; --text-2:#5A5955; --text-3:#6B6963;
  --accent:#8A6A2E; --border:#E1DED7; --chip-border:rgba(0,0,0,.14);
  color-scheme: light;
}
* { box-sizing:border-box }
body { margin:0; background:var(--bg-0); color:var(--text-1);
  font-family:"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;
  font-size:15px; line-height:1.5; word-break:keep-all; padding:16px; }
header { display:flex; flex-wrap:wrap; align-items:center; gap:8px 16px; margin-bottom:12px; position:sticky; top:0; background:var(--bg-0); padding:8px 0; z-index:2; border-bottom:1px solid var(--border) }
h1 { font-size:20px; margin:0 16px 0 0; letter-spacing:-0.01em }
h2 { font-size:17px; margin:32px 0 6px }
h3 { font-size:13px; font-weight:600; color:var(--text-2); margin:0 0 6px }
p.note { color:var(--text-3); font-size:13px; margin:0 0 10px; max-width:70ch }
label.t { display:inline-flex; align-items:center; gap:6px; font-size:13px; color:var(--text-2); min-height:32px; cursor:pointer }
button { min-height:36px; padding:0 12px; border-radius:10px; border:1px solid var(--border); background:var(--bg-1); color:var(--text-1); font:inherit; font-weight:600; font-size:13px; cursor:pointer }
button[aria-pressed="true"] { outline:2px solid var(--accent); outline-offset:1px }
.outfits { display:grid; gap:12px }
.row { background:var(--bg-1); border:1px solid var(--border); border-radius:12px; padding:12px; }
.row h3 { margin-bottom:8px }
.pairs { display:flex; flex-wrap:wrap; gap:12px; align-items:flex-end }
.pane { background:var(--bg-2); border-radius:8px; padding:8px; display:flex; gap:10px; align-items:flex-end; position:relative }
.pane[data-theme="light"] { background:#FFFFFF; color:#1B1B1A; --c-metal:#A8A6A0 }
.pane[data-theme="dark"] { background:#262629; color:#F2F1EE }
.pane .cap { position:absolute; left:8px; top:6px; font-size:11px; color:var(--text-3) }
.pane[data-theme="light"] .cap { color:#6B6963 } .pane[data-theme="dark"] .cap { color:#94928D }
.fig { display:flex; flex-direction:column; align-items:center; gap:4px; font-size:11px; color:var(--text-3) }
.pane[data-theme="light"] .fig { color:#6B6963 } .pane[data-theme="dark"] .fig { color:#94928D }
svg.sil { display:block; color:inherit }
.catgrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(118px,1fr)); gap:8px }
.cat { margin:0; background:var(--bg-1); border:1px solid var(--border); border-radius:8px; padding:8px 6px; text-align:center }
.cat .figwrap { background:var(--bg-2); border-radius:6px; padding:4px 0; display:flex; justify-content:center }
.cat figcaption { font-size:12px; color:var(--text-2); margin-top:4px; line-height:1.3 }
.cat code { font-size:10px; color:var(--text-3) }
.patgrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(128px,1fr)); gap:8px }
.pat { background:var(--bg-1); border:1px solid var(--border); border-radius:8px; padding:8px; text-align:center; font-size:12px; color:var(--text-2) }
.pat svg { display:block; width:100%; height:72px; border-radius:6px; color:var(--text-1) }
.pat small { display:block; font-size:10px; color:var(--text-3) }
.acc { display:flex; flex-wrap:wrap; gap:16px; align-items:flex-start }
.acc .ctl { display:grid; gap:4px; min-width:200px }
.chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:6px }
.chip { display:inline-flex; align-items:center; gap:5px; font-size:11px; color:var(--text-2) }
.chip i { width:14px; height:14px; border-radius:50%; border:1px solid var(--chip-border); display:inline-block }
table { border-collapse:collapse; font-size:12px; margin-top:8px } td, th { border-bottom:1px solid var(--border); padding:4px 8px; text-align:left } td.n { text-align:right; font-variant-numeric:tabular-nums }
.gridlines line { stroke:var(--accent); stroke-opacity:.5; stroke-width:.6 } .gridlines text { fill:var(--accent); font-size:7px; font-family:system-ui }
</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
  <!-- v1 패턴 (design-tokens 6-2 그대로) -->
  <pattern id="pat-denim" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="1" y1="0" x2="1" y2="6" stroke="currentColor" stroke-opacity="0.18" stroke-width="1.2"/></pattern>
  <pattern id="pat-corduroy" width="5" height="5" patternUnits="userSpaceOnUse"><line x1="1" y1="0" x2="1" y2="5" stroke="currentColor" stroke-opacity="0.16" stroke-width="2"/></pattern>
  <pattern id="pat-knit" width="6" height="4" patternUnits="userSpaceOnUse"><path d="M0 0 L3 3 L6 0" fill="none" stroke="currentColor" stroke-opacity="0.18" stroke-width="0.9" stroke-linejoin="round"/></pattern>
  <pattern id="pat-flannel" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="currentColor" fill-opacity="0.04"/><line x1="9" y1="0" x2="9" y2="18" stroke="currentColor" stroke-opacity="0.10" stroke-width="5"/><line x1="0" y1="9" x2="18" y2="9" stroke="currentColor" stroke-opacity="0.10" stroke-width="5"/></pattern>
  <pattern id="pat-linen" width="10" height="8" patternUnits="userSpaceOnUse"><line x1="0" y1="2" x2="10" y2="2" stroke="currentColor" stroke-opacity="0.10" stroke-width="0.8"/><line x1="0" y1="6" x2="10" y2="6" stroke="currentColor" stroke-opacity="0.14" stroke-width="0.8" stroke-dasharray="3 4"/><line x1="4" y1="0" x2="4" y2="8" stroke="currentColor" stroke-opacity="0.08" stroke-width="0.6" stroke-dasharray="2 3"/></pattern>
  <pattern id="pat-leather" width="1" height="1" patternContentUnits="objectBoundingBox"><path d="M0.18 0 L0.42 0 L0.30 1 L0.06 1 Z" fill="currentColor" fill-opacity="0.08"/><path d="M0.62 0 L0.70 0 L0.58 1 L0.50 1 Z" fill="currentColor" fill-opacity="0.05"/></pattern>

  <!-- v2 소재 패턴 (asset-system.md 5장) — 전부 currentColor, 그라데이션 없음 -->
  <pattern id="pat2-denim" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(62)">
    <line x1="2" y1="0" x2="2" y2="8" stroke="currentColor" stroke-opacity=".15" stroke-width="1.4"/>
    <line x1="6" y1="0" x2="6" y2="8" stroke="currentColor" stroke-opacity=".07" stroke-width=".7"/>
  </pattern>
  <pattern id="pat2-corduroy" width="6" height="6" patternUnits="userSpaceOnUse">
    <rect x="0" y="0" width="2.6" height="6" fill="currentColor" fill-opacity=".13"/>
    <line x1="4.2" y1="0" x2="4.2" y2="6" stroke="currentColor" stroke-opacity=".05" stroke-width=".6"/>
  </pattern>
  <pattern id="pat2-knit" width="12" height="10" patternUnits="userSpaceOnUse">
    <line x1="1" y1="0" x2="1" y2="10" stroke="currentColor" stroke-opacity=".12" stroke-width="1"/>
    <line x1="11" y1="0" x2="11" y2="10" stroke="currentColor" stroke-opacity=".12" stroke-width="1"/>
    <path d="M3 0 L9 5 L3 10 M9 0 L3 5 L9 10" fill="none" stroke="currentColor" stroke-opacity=".14" stroke-width="1" stroke-linejoin="round"/>
  </pattern>
  <pattern id="pat2-flannel" width="24" height="24" patternUnits="userSpaceOnUse">
    <rect width="24" height="24" fill="currentColor" fill-opacity=".03"/>
    <line x1="12" y1="0" x2="12" y2="24" stroke="currentColor" stroke-opacity=".09" stroke-width="8"/>
    <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" stroke-opacity=".09" stroke-width="8"/>
    <line x1="0.6" y1="0" x2="0.6" y2="24" stroke="currentColor" stroke-opacity=".14" stroke-width="1.2"/>
    <line x1="0" y1="0.6" x2="24" y2="0.6" stroke="currentColor" stroke-opacity=".14" stroke-width="1.2"/>
  </pattern>
  <pattern id="pat2-linen" width="12" height="9" patternUnits="userSpaceOnUse">
    <line x1="0" y1="2.5" x2="12" y2="2.5" stroke="currentColor" stroke-opacity=".10" stroke-width=".8"/>
    <line x1="0" y1="6.5" x2="12" y2="6.5" stroke="currentColor" stroke-opacity=".10" stroke-width=".8"/>
    <line x1="0" y1="4.5" x2="12" y2="4.5" stroke="currentColor" stroke-opacity=".16" stroke-width="1.6" stroke-dasharray="3 9"/>
    <line x1="0" y1="8.5" x2="12" y2="8.5" stroke="currentColor" stroke-opacity=".14" stroke-width="1.4" stroke-dasharray="2 10" stroke-dashoffset="5"/>
    <line x1="5" y1="0" x2="5" y2="9" stroke="currentColor" stroke-opacity=".06" stroke-width=".6" stroke-dasharray="2 3"/>
  </pattern>
  <pattern id="pat2-leather" width="1" height="1" patternContentUnits="objectBoundingBox">
    <path d="M.14 0 L.40 0 L.26 1 L0 1 Z" fill="currentColor" fill-opacity=".09"/>
    <path d="M.60 0 L.68 0 L.56 1 L.48 1 Z" fill="currentColor" fill-opacity=".06"/>
    <path d="M.78 0 L.82 0 L.74 1 L.70 1 Z" fill="currentColor" fill-opacity=".04"/>
  </pattern>
  <pattern id="pat2-ripstop" width="8" height="8" patternUnits="userSpaceOnUse">
    <line x1=".5" y1="0" x2=".5" y2="8" stroke="currentColor" stroke-opacity=".10" stroke-width=".8"/>
    <line x1="0" y1=".5" x2="8" y2=".5" stroke="currentColor" stroke-opacity=".10" stroke-width=".8"/>
    <line x1="4.5" y1="0" x2="4.5" y2="8" stroke="currentColor" stroke-opacity=".04" stroke-width=".5"/>
    <line x1="0" y1="4.5" x2="8" y2="4.5" stroke="currentColor" stroke-opacity=".04" stroke-width=".5"/>
  </pattern>
  <pattern id="pat2-tweed" width="10" height="10" patternUnits="userSpaceOnUse">
    <path d="M0 10 L10 0" fill="none" stroke="currentColor" stroke-opacity=".06" stroke-width="1"/>
    <circle cx="2" cy="2" r=".9" fill="currentColor" fill-opacity=".18"/>
    <circle cx="7" cy="6" r="1.1" fill="currentColor" fill-opacity=".12"/>
    <circle cx="4" cy="8" r=".7" fill="currentColor" fill-opacity=".08"/>
    <circle cx="8.5" cy="1" r=".8" fill="currentColor" fill-opacity=".10"/>
  </pattern>

  <!-- 기장 클립 (v1 2개 + v2 tuck 1개) -->
  <clipPath id="clip-crop"><rect x="0" y="0" width="200" height="338"/></clipPath>
  <clipPath id="clip-top-crop"><rect x="0" y="0" width="200" height="184"/></clipPath>
  <clipPath id="clip-top-tuck"><rect x="0" y="0" width="200" height="176"/></clipPath>

  <!-- 그레인 (선택): 그림 alpha 안에만 2~3% 검은 노이즈. 레이어 파일에는 넣지 않고 렌더러가 켠다 -->
  <filter id="f-grain" filterUnits="userSpaceOnUse" x="0" y="0" width="200" height="400" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="7" stitchTiles="stitch" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  .12 0 0 0 0" result="g"/>
    <feComposite in="g" in2="SourceAlpha" operator="in" result="gi"/>
    <feComposite in="gi" in2="SourceGraphic" operator="over"/>
  </filter>
</defs>
</svg>

<header>
  <h1>자산 v2 데모</h1>
  <button id="btnTheme" aria-pressed="false">라이트 배경</button>
  <button id="btnBoth" aria-pressed="false">다크·라이트 나란히</button>
  <button id="btnGrain" aria-pressed="false">그레인 ON</button>
  <button id="btnGrid" aria-pressed="false">마스터 그리드</button>
  <span style="font-size:12px;color:var(--text-3)">v2 ${INDEX.layers.length} 레이어 · ${INDEX.totalPaths} path · ${(INDEX.totalBytes / 1024).toFixed(1)} KB</span>
</header>

<h2>1. v1 vs v2 — 6 코디 · 120px / 300px</h2>
<p class="note">왼쪽 두 개가 120px(카드 썸네일), 오른쪽 두 개가 300px(상세 시트). 각 쌍은 v1 → v2. 색·소재는 동일한 토큰·패턴 규칙으로 주입했다.</p>
<div class="outfits" id="outfits"></div>

<h2>2. v2 레이어 카탈로그</h2>
<p class="note">레이어 하나씩, 기본 몸 위에. 캡션의 숫자는 path 수와 바이트.</p>
<div class="catgrid" id="catalog"></div>

<h2>3. 소재 패턴 v2 — 스와치와 적용 예</h2>
<p class="note">전부 <code>currentColor</code> 저투명도 선·점이라 어떤 옷 색 위에도 얹힌다. 타일은 viewBox 단위라 120px에서는 "결"로만, 300px에서 짜임이 보인다.</p>
<div class="patgrid" id="patterns"></div>
<div class="pairs" id="patternFigs" style="margin-top:12px"></div>

<h2>4. 액세서리 슬롯 — 쌓임 순서 데모</h2>
<p class="note">z: base → cap → socks → shoes → bottom → belt → top → outer → scarf → bag → watch. 벨트는 상의를 <code>clip-top-tuck</code>(y&lt;176)으로 넣었을 때, 양말은 바지가 crop(y&lt;338)일 때만 드러난다.</p>
<div class="acc">
  <div class="ctl" id="accCtl"></div>
  <div class="pairs" id="accFigs"></div>
</div>

<h2>5. 비례 — 마스터 그리드</h2>
<p class="note">8등신 크로키. 머리 48 = 1H. 어깨 1.5H, 바지 허리선 176(계약), 상의 밑단 192(계약), 가랑이 214, 무릎 292, 크롭 클립 338, 신발 윗선 356, 바지 밑단 362, 바닥 392. 주황 선은 토글로 끈다.</p>
<div class="pairs" id="gridFig"></div>

<h2>6. 파일 표</h2>
<table id="tbl"><thead><tr><th>file</th><th>slot</th><th>type</th><th>fit</th><th>length</th><th>paths</th><th>bytes</th><th>shade</th><th>details</th></tr></thead><tbody></tbody></table>

<script>
const V1 = ${js(V1)};
const V2 = ${js(V2)};
const INDEX = ${js(INDEX)};
const NS = 'http://www.w3.org/2000/svg';
const Z1 = ['base','shoes','bottom','top','outer'];
const Z2 = INDEX.zOrder;
const G = { white:'#FFFFFF', offWhite:'#F2EDE4', cream:'#F4ECC9', oatmeal:'#CFC4B4', beige:'#E3D5B5', khaki:'#BFAE8A', tan:'#D2B48C', camel:'#C19A6B', brown:'#8B5A2B', chocolate:'#5C4033', lightGrey:'#D3D3D3', greyMelange:'#A6A7AB', midGrey:'#808080', charcoal:'#36454F', black:'#141414', navy:'#1F2E50', indigo:'#2C4270', midDenim:'#3E6AA6', lightDenim:'#A3B9CF', blackDenim:'#2E2F33', lightBlue:'#B7CDE3', skyBlue:'#8CBDE0', olive:'#4B5320', forestGreen:'#1F4D2B', sage:'#BCB88A', burgundy:'#722F37', rust:'#A94E2B', mustard:'#D4A12A', dustyPink:'#D1A3A3', lavender:'#C7C1E0', teal:'#2A6F6F', taupe:'#483C32' };
const PAT1 = { denim:'pat-denim', corduroy:'pat-corduroy', knit:'pat-knit', flannel:'pat-flannel', tweed:'pat-flannel', linen:'pat-linen', leather:'pat-leather' };
const PAT2 = { denim:'pat2-denim', corduroy:'pat2-corduroy', knit:'pat2-knit', flannel:'pat2-flannel', tweed:'pat2-tweed', linen:'pat2-linen', leather:'pat2-leather', nylon:'pat2-ripstop' };
const state = { grain:false, grid:false, both:false };

const cache = new Map();
function parsed(src, key) {
  if (cache.has(key)) return cache.get(key);
  const doc = new DOMParser().parseFromString(src, 'image/svg+xml');
  cache.set(key, doc.documentElement); return doc.documentElement;
}
function v1Paths(file) { return Array.from(parsed(V1[file], 'v1:' + file).querySelectorAll('path')).map((p) => document.importNode(p, true)); }
function v2Group(file) { return document.importNode(parsed(V2[file], 'v2:' + file).querySelector('g'), true); }

function applyLength(el, it) {
  if (!it) return;
  if (it.slot === 'bottom' && it.length === 'crop') el.setAttribute('clip-path', 'url(#clip-crop)');
  else if (it.slot === 'top' && it.length === 'crop') el.setAttribute('clip-path', 'url(#clip-top-crop)');
  else if (it.slot === 'top' && it.tuck) el.setAttribute('clip-path', 'url(#clip-top-tuck)');
  else if (it.slot === 'top' && it.length === 'long') el.setAttribute('transform', 'translate(0 70) scale(1 1.06) translate(0 -70)');
}

/** items: {slot, file, color(hex), mat?, length?, tuck?, detail?} */
function render(items, { v = 2, size = 120, grain = state.grain, grid = false } = {}) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 400'); svg.setAttribute('width', size / 2); svg.setAttribute('height', size); svg.setAttribute('class', 'sil');
  const by = {}; for (const it of items) by[it.slot] = it;
  for (const it of items) svg.style.setProperty('--c-' + it.slot, it.color);
  const stack = document.createElementNS(NS, 'g');
  if (grain && v === 2) stack.setAttribute('filter', 'url(#f-grain)');
  svg.append(stack);
  const order = v === 1 ? Z1 : Z2;
  for (const slot of order) {
    if (slot === 'base') {
      if (v === 1) { const g = document.createElementNS(NS, 'g'); for (const p of v1Paths('figure-base')) g.append(p.cloneNode(true)); stack.append(g); }
      else stack.append(v2Group('figure-base'));
      continue;
    }
    const it = by[slot]; if (!it) continue;
    if (v === 1) {
      if (!V1[it.file]) continue;
      const g = document.createElementNS(NS, 'g');
      const pat = it.mat && PAT1[it.mat];
      for (const p of v1Paths(it.file)) {
        if (p.dataset.detail && p.dataset.detail !== it.detail) continue;
        const b = p.cloneNode(true); applyLength(b, it); g.append(b);
        if (pat && !p.dataset.detail) { const o = p.cloneNode(true); o.setAttribute('fill', 'url(#' + pat + ')'); o.setAttribute('stroke', 'none'); applyLength(o, it); g.append(o); }
      }
      stack.append(g);
    } else {
      if (!V2[it.file]) continue;
      const g = v2Group(it.file);
      for (const p of Array.from(g.querySelectorAll('[data-detail]'))) if (p.dataset.detail !== it.detail) p.remove();
      const pat = it.mat && PAT2[it.mat];
      if (pat) for (const p of Array.from(g.querySelectorAll('path[data-part="main"]:not([data-kind])'))) {
        const o = p.cloneNode(true); o.setAttribute('fill', 'url(#' + pat + ')'); o.setAttribute('stroke', 'none'); o.dataset.part = 'mat'; o.dataset.mat = it.mat; p.after(o);
      }
      applyLength(g, it); stack.append(g);
    }
  }
  if (grid) svg.append(gridOverlay());
  return svg;
}
function gridOverlay() {
  const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'gridlines');
  const Y = [[8,'머리 8'],[54,'턱 54'],[78,'어깨 78'],[102,'가슴 102'],[168,'허리 168'],[176,'바지 허리 176'],[192,'상의 밑단 192'],[214,'가랑이 214'],[292,'무릎 292'],[338,'crop 338'],[356,'신발 356'],[362,'밑단 362'],[392,'바닥 392']];
  for (const [y, t] of Y) { const l = document.createElementNS(NS, 'line'); l.setAttribute('x1', 0); l.setAttribute('x2', 200); l.setAttribute('y1', y); l.setAttribute('y2', y); g.append(l); const x = document.createElementNS(NS, 'text'); x.setAttribute('x', 162); x.setAttribute('y', y - 1.5); x.textContent = t; g.append(x); }
  const c = document.createElementNS(NS, 'line'); c.setAttribute('x1', 100); c.setAttribute('x2', 100); c.setAttribute('y1', 0); c.setAttribute('y2', 400); c.setAttribute('stroke-dasharray', '2 3'); g.append(c);
  return g;
}

const OUTFITS = [
  { name: '화이트 티 · 인디고 데님 스트레이트 · 흰 스니커즈', items: [
    { slot:'top', file:'top-tee-regular', color:G.white }, { slot:'bottom', file:'bottom-straight', color:G.indigo, mat:'denim' }, { slot:'shoes', file:'shoes-sneaker', color:G.white } ] },
  { name: '라이트블루 옥스포드 · 베이지 치노 테이퍼드 · 브라운 태슬 로퍼 · 네이비 블레이저', items: [
    { slot:'top', file:'top-shirt-regular', color:G.lightBlue }, { slot:'bottom', file:'bottom-tapered', color:G.beige }, { slot:'shoes', file:'shoes-loafer', color:G.brown, mat:'leather', detail:'tassel' }, { slot:'outer', file:'outer-regular', color:G.navy } ] },
  { name: '오트밀 울 니트 · 차콜 플란넬 와이드 · 블랙 더비', items: [
    { slot:'top', file:'top-knit-regular', color:G.oatmeal, mat:'knit' }, { slot:'bottom', file:'bottom-wide', color:G.charcoal, mat:'flannel' }, { slot:'shoes', file:'shoes-derby', color:G.black, mat:'leather' } ] },
  { name: '그레이 후디 · 블랙 데님 테이퍼드 · 네이비 스니커즈 · 올리브 블루종(립스탑)', items: [
    { slot:'top', file:'top-hoodie-regular', color:G.greyMelange }, { slot:'bottom', file:'bottom-tapered', color:G.blackDenim, mat:'denim' }, { slot:'shoes', file:'shoes-sneaker', color:G.navy }, { slot:'outer', file:'outer-short', color:G.olive, mat:'nylon' } ] },
  { name: '네이비 루즈 니트 · 라이트 데님 와이드 크롭 · 흰 스니커즈 · 블랙 패딩', items: [
    { slot:'top', file:'top-knit-loose', color:G.navy, mat:'knit' }, { slot:'bottom', file:'bottom-wide', color:G.lightDenim, mat:'denim', length:'crop' }, { slot:'shoes', file:'shoes-sneaker', color:G.white }, { slot:'outer', file:'outer-puffer', color:G.black, mat:'nylon' } ] },
  { name: '블랙 루즈 티 · 브라운 코듀로이 스트레이트 · 블랙 첼시 · 베이지 트렌치', items: [
    { slot:'top', file:'top-tee-loose', color:G.black }, { slot:'bottom', file:'bottom-straight', color:G.brown, mat:'corduroy' }, { slot:'shoes', file:'shoes-chelsea', color:G.black, mat:'leather' }, { slot:'outer', file:'outer-long', color:G.beige } ] },
];

function fig(svg, label) { const d = document.createElement('div'); d.className = 'fig'; d.append(svg); const s = document.createElement('span'); s.textContent = label; d.append(s); return d; }
function pane(theme, caption, figs) { const p = document.createElement('div'); p.className = 'pane'; if (theme) p.dataset.theme = theme; if (caption) { const c = document.createElement('span'); c.className = 'cap'; c.textContent = caption; p.append(c); } for (const f of figs) p.append(f); return p; }

function buildOutfits() {
  const root = document.getElementById('outfits'); root.innerHTML = '';
  const themes = state.both ? ['dark', 'light'] : [null];
  for (const o of OUTFITS) {
    const row = document.createElement('div'); row.className = 'row';
    const h = document.createElement('h3'); h.textContent = o.name; row.append(h);
    const pairs = document.createElement('div'); pairs.className = 'pairs';
    for (const t of themes) {
      pairs.append(pane(t, '120px', [fig(render(o.items, { v: 1, size: 120 }), 'v1'), fig(render(o.items, { v: 2, size: 120 }), 'v2')]));
      pairs.append(pane(t, '300px', [fig(render(o.items, { v: 1, size: 300 }), 'v1'), fig(render(o.items, { v: 2, size: 300 }), 'v2')]));
    }
    row.append(pairs);
    const chips = document.createElement('div'); chips.className = 'chips';
    for (const it of o.items) { const c = document.createElement('span'); c.className = 'chip'; const i = document.createElement('i'); i.style.background = it.color; c.append(i, it.slot + ' ' + it.file.replace(/^(top|bottom|shoes|outer)-/, '') + (it.mat ? ' · ' + it.mat : '') + (it.length ? ' · ' + it.length : '')); chips.append(c); }
    row.append(chips); root.append(row);
  }
}

const CONTEXT = { base:[], cap:[], socks:[{slot:'bottom',file:'bottom-straight',color:G.charcoal,length:'crop'},{slot:'shoes',file:'shoes-loafer',color:G.black}], shoes:[{slot:'bottom',file:'bottom-straight',color:G.charcoal}], bottom:[], belt:[{slot:'bottom',file:'bottom-straight',color:G.charcoal}], top:[{slot:'bottom',file:'bottom-straight',color:G.charcoal}], outer:[{slot:'top',file:'top-tee-regular',color:G.offWhite},{slot:'bottom',file:'bottom-straight',color:G.charcoal}], scarf:[{slot:'top',file:'top-knit-regular',color:G.oatmeal}], bag:[{slot:'top',file:'top-tee-regular',color:G.offWhite},{slot:'bottom',file:'bottom-straight',color:G.charcoal}], watch:[{slot:'top',file:'top-tee-regular',color:G.offWhite},{slot:'bottom',file:'bottom-straight',color:G.charcoal}] };
const SELF = { top:G.sage, bottom:G.midDenim, shoes:G.chocolate, outer:G.camel, belt:G.chocolate, watch:G.black, socks:G.offWhite, bag:G.oatmeal, cap:G.navy, scarf:G.burgundy };
function buildCatalog() {
  const root = document.getElementById('catalog'); root.innerHTML = '';
  for (const l of INDEX.layers) {
    const file = l.file.replace(/\\.svg$/, '');
    const items = (CONTEXT[l.slot] || []).slice();
    if (l.slot !== 'base') items.push({ slot: l.slot, file, color: SELF[l.slot], detail: l.optionalDetails ? l.optionalDetails[0] : undefined, tuck: l.slot === 'belt' ? undefined : undefined });
    if (l.slot === 'belt') items.push({ slot:'top', file:'top-shirt-regular', color:G.offWhite, tuck:true });
    const f = document.createElement('figure'); f.className = 'cat';
    const w = document.createElement('div'); w.className = 'figwrap'; w.append(render(items, { v: 2, size: 150 })); f.append(w);
    const c = document.createElement('figcaption'); c.innerHTML = l.labelKo + '<br><code>' + l.file + ' · ' + l.paths + 'p · ' + l.bytes + 'B</code>'; f.append(c); root.append(f);
  }
}

const PATS = [['denim','데님 트윌 62°'],['corduroy','코듀로이 웨일'],['knit','니트 케이블·립'],['flannel','플란넬 체크'],['linen','린넨 슬럽'],['leather','가죽 광택 띠'],['nylon','나일론 립스탑'],['tweed','트위드 플렉']];
function buildPatterns() {
  const root = document.getElementById('patterns'); root.innerHTML = '';
  for (const [id, ko] of PATS) {
    const d = document.createElement('div'); d.className = 'pat';
    d.innerHTML = '<svg viewBox="0 0 120 72" preserveAspectRatio="none"><rect width="120" height="72" fill="' + (id === 'leather' ? G.chocolate : id === 'denim' ? G.indigo : id === 'knit' ? G.oatmeal : id === 'flannel' ? G.charcoal : id === 'linen' ? G.beige : id === 'nylon' ? G.olive : id === 'tweed' ? G.taupe : G.brown) + '"/><rect width="120" height="72" fill="url(#' + PAT2[id] + ')"/></svg>' + ko + '<small>' + PAT2[id] + '</small>';
    root.append(d);
  }
  const figs = document.getElementById('patternFigs'); figs.innerHTML = '';
  const demo = [
    ['denim', [{slot:'top',file:'top-shirt-regular',color:G.lightDenim,mat:'denim'},{slot:'bottom',file:'bottom-straight',color:G.indigo,mat:'denim'},{slot:'shoes',file:'shoes-sneaker',color:G.white}]],
    ['corduroy+knit', [{slot:'top',file:'top-knit-regular',color:G.mustard,mat:'knit'},{slot:'bottom',file:'bottom-wide',color:G.brown,mat:'corduroy'},{slot:'shoes',file:'shoes-derby',color:G.chocolate,mat:'leather'}]],
    ['flannel+linen', [{slot:'top',file:'top-shirt-regular',color:G.sage,mat:'linen'},{slot:'bottom',file:'bottom-tapered',color:G.midGrey,mat:'flannel'},{slot:'shoes',file:'shoes-loafer',color:G.burgundy,mat:'leather'}]],
    ['tweed+ripstop', [{slot:'top',file:'top-tee-regular',color:G.offWhite},{slot:'bottom',file:'bottom-straight',color:G.black,mat:'nylon'},{slot:'shoes',file:'shoes-chelsea',color:G.chocolate,mat:'leather'},{slot:'outer',file:'outer-regular',color:G.taupe,mat:'tweed'}]],
  ];
  for (const [n, items] of demo) figs.append(pane(null, n, [fig(render(items, { v: 2, size: 300 }), '300px'), fig(render(items, { v: 2, size: 120 }), '120px')]));
}

const ACC = [['outer','블레이저(아우터)',true],['belt','벨트 (셔츠 tuck)',true],['watch','손목시계',true],['socks','양말 (바지 crop)',true],['bag','토트백',false],['cap','볼캡',false],['scarf','머플러',false]];
const accOn = Object.fromEntries(ACC.map(([k,,d]) => [k, d]));
function buildAcc() {
  const ctl = document.getElementById('accCtl');
  if (!ctl.children.length) for (const [k, ko] of ACC) { const l = document.createElement('label'); l.className = 't'; const i = document.createElement('input'); i.type = 'checkbox'; i.checked = accOn[k]; i.addEventListener('change', () => { accOn[k] = i.checked; buildAcc(); }); l.append(i, ko); ctl.append(l); }
  const items = [
    { slot:'top', file:'top-shirt-regular', color:G.white, tuck: accOn.belt },
    { slot:'bottom', file:'bottom-tapered', color:G.navy, length: accOn.socks ? 'crop' : 'regular' },
    { slot:'shoes', file:'shoes-loafer', color:G.chocolate, mat:'leather' },
  ];
  if (accOn.outer) items.push({ slot:'outer', file:'outer-regular', color:G.charcoal });
  if (accOn.belt) items.push({ slot:'belt', file:'acc-belt', color:G.chocolate });
  if (accOn.watch) items.push({ slot:'watch', file:'acc-watch', color:G.black });
  if (accOn.socks) items.push({ slot:'socks', file:'acc-socks', color:G.offWhite });
  if (accOn.bag) items.push({ slot:'bag', file:'acc-bag', color:G.oatmeal });
  if (accOn.cap) items.push({ slot:'cap', file:'acc-cap', color:G.navy });
  if (accOn.scarf) items.push({ slot:'scarf', file:'acc-scarf', color:G.burgundy });
  const figs = document.getElementById('accFigs'); figs.innerHTML = '';
  figs.append(pane(null, null, [fig(render(items, { v: 2, size: 320 }), '320px'), fig(render(items, { v: 2, size: 120 }), '120px')]));
  if (state.both) figs.append(pane(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', null, [fig(render(items, { v: 2, size: 320 }), '320px')]));
}
function buildGrid() {
  const root = document.getElementById('gridFig'); root.innerHTML = '';
  const items = [{slot:'top',file:'top-tee-regular',color:G.offWhite},{slot:'bottom',file:'bottom-straight',color:G.indigo},{slot:'shoes',file:'shoes-sneaker',color:G.white}];
  root.append(pane(null, null, [fig(render([], { v: 2, size: 400, grid: state.grid }), '몸만'), fig(render(items, { v: 2, size: 400, grid: state.grid }), '기본 코디'), fig(render([{slot:'top',file:'top-shirt-regular',color:G.lightBlue},{slot:'bottom',file:'bottom-straight',color:G.charcoal},{slot:'shoes',file:'shoes-derby',color:G.black},{slot:'outer',file:'outer-long',color:G.camel}], { v: 2, size: 400, grid: state.grid }), '롱 아우터')]));
}
function buildTable() {
  const tb = document.querySelector('#tbl tbody'); tb.innerHTML = '';
  for (const l of INDEX.layers) { const tr = document.createElement('tr'); tr.innerHTML = '<td>' + l.file + '</td><td>' + l.slot + '</td><td>' + l.type + '</td><td>' + (l.fit || '-') + '</td><td>' + (l.length || '-') + '</td><td class="n">' + l.paths + '</td><td class="n">' + l.bytes + '</td><td>' + l.shade + '</td><td>' + l.details + '</td>'; tb.append(tr); }
}
function buildAll() { buildOutfits(); buildCatalog(); buildPatterns(); buildAcc(); buildGrid(); }
buildAll(); buildTable();

const press = (id, fn) => { const b = document.getElementById(id); b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); fn(on); }); };
press('btnTheme', (on) => { document.documentElement.dataset.theme = on ? 'light' : 'dark'; document.getElementById('btnTheme').textContent = on ? '다크 배경' : '라이트 배경'; });
press('btnBoth', (on) => { state.both = on; buildOutfits(); buildAcc(); });
press('btnGrain', (on) => { state.grain = on; document.getElementById('btnGrain').textContent = on ? '그레인 OFF' : '그레인 ON'; buildAll(); });
press('btnGrid', (on) => { state.grid = on; buildGrid(); });
</script>
</body>
</html>
`;

const out = join(ROOT, 'docs', 'phase6', 'asset-demo.html');
writeFileSync(out, html, 'utf8');
console.log(`wrote ${out} (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
