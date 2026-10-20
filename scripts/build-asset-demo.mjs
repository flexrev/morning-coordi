#!/usr/bin/env node
// docs/phase6/asset-demo.html 생성기 — v1(src/assets/silhouettes)·v2(src/assets/v2) SVG를 문자열로 인라인해
// 디스크에서 바로 열리는 단일 HTML을 만든다. 자산을 고치면 `node scripts/build-asset-demo.mjs` 로 재생성.
// 6-B: mid 슬롯, stage 레이어(스튜디오 다크), 패턴 5종(pat2-stripe/pinstripe/gingham/plaid/houndstooth) 추가.
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

// v2 패턴 defs — asset-system.md 5장과 동일 문자열. FE 는 이 블록을 patternDefs.js 로 복사한다.
export const PATTERN_DEFS_V2 = `
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

  <!-- v2 "무늬" 패턴 (6-B, asset-system.md 5-1) — 소재 결이 아니라 두 번째 색. currentColor 를 패턴 색으로 쓰므로
       렌더러가 오버레이 path 에 style.color = <패턴 색> 을 준다(기본: 옷 색의 대비색). 타일은 viewBox 유닛(120px=0.3배, 300px=0.75배). -->
  <pattern id="pat2-stripe" width="4" height="14" patternUnits="userSpaceOnUse">
    <rect x="0" y="0" width="4" height="5" fill="currentColor" fill-opacity=".85"/>
  </pattern>
  <pattern id="pat2-pinstripe" width="8" height="8" patternUnits="userSpaceOnUse">
    <line x1="1" y1="0" x2="1" y2="8" stroke="currentColor" stroke-opacity=".55" stroke-width=".9"/>
  </pattern>
  <pattern id="pat2-gingham" width="12" height="12" patternUnits="userSpaceOnUse">
    <rect x="0" y="0" width="6" height="12" fill="currentColor" fill-opacity=".36"/>
    <rect x="0" y="0" width="12" height="6" fill="currentColor" fill-opacity=".36"/>
  </pattern>
  <pattern id="pat2-plaid" width="32" height="32" patternUnits="userSpaceOnUse">
    <rect x="0" y="0" width="14" height="32" fill="currentColor" fill-opacity=".30"/>
    <rect x="0" y="0" width="32" height="14" fill="currentColor" fill-opacity=".30"/>
    <line x1="23" y1="0" x2="23" y2="32" stroke="currentColor" stroke-opacity=".45" stroke-width="1.6"/>
    <line x1="0" y1="23" x2="32" y2="23" stroke="currentColor" stroke-opacity=".45" stroke-width="1.6"/>
  </pattern>
  <pattern id="pat2-houndstooth" width="16" height="16" patternUnits="userSpaceOnUse">
    <path d="M0 0h8v2h-8zM12 0h4v2h-4zM0 2h10v2h-10zM14 2h2v2h-2zM0 4h12v2h-12zM0 6h8v2h-8zM10 6h4v2h-4zM0 8h4v2h-4zM2 10h4v2h-4zM4 12h4v2h-4zM0 14h2v2h-2zM6 14h2v2h-2z" fill="currentColor" fill-opacity=".8"/>
  </pattern>
`;

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
  --stage-glow:#FFE6BE;
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
.cat[data-slot="stage"] .figwrap { background:#0E0F12 }
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

/* ---- 스튜디오 다크 스테이지 (concept-b.html 의 카드·플레이트 언어를 그대로) ---- */
.studio { background:#0E0F12; color:#F4F2ED; border-radius:16px; padding:16px; position:relative; overflow:hidden;
  background-image:radial-gradient(60% 40% at 8% 0%, rgba(255,230,190,.11), rgba(255,230,190,0) 70%); }
.studio::after { content:""; position:absolute; inset:0; pointer-events:none; opacity:.07; mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
.studio .cards { display:flex; flex-wrap:wrap; gap:10px; align-items:flex-start }
.gcard { border-radius:22px; background:rgba(255,255,255,.045); border:1px solid rgba(255,255,255,.09); box-shadow:inset 0 1px 0 rgba(255,255,255,.16);
  backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); padding:10px 14px 10px 10px; display:flex; gap:14px; align-items:stretch; min-height:150px; width:300px }
.plate { width:92px; flex:0 0 92px; border-radius:16px; position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden; background:rgba(0,0,0,.28) }
.plate.css { background:radial-gradient(70% 60% at 50% 34%, rgba(255,230,190,.17), rgba(255,230,190,0) 72%), rgba(0,0,0,.28) }
.plate.css::after { content:""; position:absolute; left:22%; right:22%; bottom:9px; height:8px; border-radius:50%; background:rgba(0,0,0,.55); filter:blur(4px) }
.plate svg.sil { position:relative; z-index:1; filter:drop-shadow(0 6px 10px rgba(0,0,0,.45)) }
.plate.flat svg.sil { filter:none }
.meta { flex:1 1 auto; min-width:0; display:flex; flex-direction:column; justify-content:center; gap:7px }
.lbl { font-size:11px; line-height:16px; letter-spacing:.12em; color:#E8B964; font-weight:700; display:flex; align-items:center; gap:6px }
.lbl::before { content:""; width:5px; height:5px; border-radius:50%; background:#E8B964 }
.capn { font-size:15px; line-height:22px; font-weight:600; color:#F4F2ED }
.why { font-size:13px; line-height:18px; color:#B9B6AF }
.detail { border-radius:22px; background:rgba(255,255,255,.045); border:1px solid rgba(255,255,255,.09); padding:16px; display:flex; gap:16px; align-items:flex-end; flex-wrap:wrap }
.detail .plate { width:220px; flex:0 0 220px; height:340px; border-radius:20px }
.studio .fig { color:#8E8B85 }
.studio code { color:#B9B6AF }
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
${PATTERN_DEFS_V2}
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

<h2>1. v1 vs v2 — 코디 · 120px / 300px</h2>
<p class="note">왼쪽 두 개가 120px(카드 썸네일), 오른쪽 두 개가 300px(상세 시트). 각 쌍은 v1 → v2. 색·소재는 동일한 토큰·패턴 규칙으로 주입했다. 7~12번은 6-B 에 추가된 레이어(폴로·슬림·러닝·워크부츠·척카·샌들·루즈 셔츠/후디·미드 레이어)로 v1 폴백이 사라진 조합.</p>
<div class="outfits" id="outfits"></div>

<h2>2. v2 레이어 카탈로그</h2>
<p class="note">레이어 하나씩, 기본 몸 위에. 캡션의 숫자는 path 수와 바이트. stage 레이어는 #0E0F12 위에서만 의미가 있어 검은 바탕으로 보여준다.</p>
<div class="catgrid" id="catalog"></div>

<h2>3. 소재 패턴 v2 — 스와치와 적용 예</h2>
<p class="note">소재 8종은 <code>currentColor</code> 저투명도 선·점이라 어떤 옷 색 위에도 얹힌다. 무늬 5종(스트라이프·핀스트라이프·깅엄·플레이드·하운드투스)은 두 번째 색이라 렌더러가 오버레이 path 에 <code>style.color</code>(패턴 색)를 준다 — 아래 적용 예는 화이트 티+네이비 브레통, 라이트블루 깅엄 셔츠, 차콜 핀스트라이프 하의, 버건디 버팔로 플레이드 오버셔츠, 블랙·화이트 하운드투스 블레이저. 타일은 viewBox 단위라 120px에서는 "결"로만, 300px에서 짜임이 보인다.</p>
<div class="patgrid" id="patterns"></div>
<div class="pairs" id="patternFigs" style="margin-top:12px"></div>

<h2>4. 액세서리·미드 슬롯 — 쌓임 순서 데모</h2>
<p class="note">z: stage → base → cap → socks → shoes → bottom → belt → top → <b>mid</b> → outer → scarf → bag → watch. 벨트는 상의를 <code>clip-top-tuck</code>(y&lt;176)으로 넣었을 때, 양말은 바지가 crop(y&lt;338)일 때만 드러난다. cap 슬롯은 볼캡/비니, bag 슬롯은 토트/크로스바디/백팩 중 하나.</p>
<div class="acc">
  <div class="ctl" id="accCtl"></div>
  <div class="pairs" id="accFigs"></div>
</div>

<h2>5. 비례 — 마스터 그리드</h2>
<p class="note">8등신 크로키. 머리 48 = 1H. 어깨 1.5H, 바지 허리선 176(계약), 상의 밑단 192(계약), 가랑이 214, 무릎 292, 크롭 클립 338, 신발 윗선 356, 바지 밑단 362, 바닥 392. 주황 선은 토글로 끈다.</p>
<div class="pairs" id="gridFig"></div>

<h2>6. 스튜디오 다크 스테이지 — <code>stage-spotlight</code> · <code>stage-floor</code></h2>
<p class="note">시안 B의 카드(글래스 r22, 플레이트 92×130)와 상세(300px)를 재현. 왼쪽 카드는 시안 B 의 CSS radial-gradient 플레이트, 가운데는 <b>stage 레이어</b>(SVG 타원 5겹, CSS 불투명도)만, 오른쪽은 stage 레이어 + 그레인. 권장값: 120px 카드 spotlight .55 / floor .8 (blur 없음), 300px 상세 spotlight .75 + blur 6px / floor 1 + blur 3px. 스테이지는 그림 뒤(base 앞)에 들어가며 옷에는 그라데이션이 없다.</p>
<div class="studio" id="studio"></div>

<h2>7. 파일 표</h2>
<table id="tbl"><thead><tr><th>file</th><th>slot</th><th>type</th><th>fit</th><th>length</th><th>paths</th><th>bytes</th><th>shade</th><th>details</th></tr></thead><tbody></tbody></table>

<script>
const V1 = ${js(V1)};
const V2 = ${js(V2)};
const INDEX = ${js(INDEX)};
const NS = 'http://www.w3.org/2000/svg';
const Z1 = ['base','shoes','bottom','top','outer'];
const Z2 = INDEX.zOrder;
const STAGE = INDEX.stage;
const G = { white:'#FFFFFF', offWhite:'#F2EDE4', cream:'#F4ECC9', oatmeal:'#CFC4B4', beige:'#E3D5B5', khaki:'#BFAE8A', tan:'#D2B48C', camel:'#C19A6B', brown:'#8B5A2B', chocolate:'#5C4033', lightGrey:'#D3D3D3', greyMelange:'#A6A7AB', midGrey:'#808080', charcoal:'#36454F', black:'#141414', navy:'#1F2E50', indigo:'#2C4270', midDenim:'#3E6AA6', lightDenim:'#A3B9CF', blackDenim:'#2E2F33', lightBlue:'#B7CDE3', skyBlue:'#8CBDE0', olive:'#4B5320', forestGreen:'#1F4D2B', sage:'#BCB88A', burgundy:'#722F37', rust:'#A94E2B', mustard:'#D4A12A', dustyPink:'#D1A3A3', lavender:'#C7C1E0', teal:'#2A6F6F', taupe:'#483C32' };
const PAT1 = { denim:'pat-denim', corduroy:'pat-corduroy', knit:'pat-knit', flannel:'pat-flannel', tweed:'pat-flannel', linen:'pat-linen', leather:'pat-leather' };
const PAT2 = { denim:'pat2-denim', corduroy:'pat2-corduroy', knit:'pat2-knit', flannel:'pat2-flannel', tweed:'pat2-tweed', linen:'pat2-linen', leather:'pat2-leather', nylon:'pat2-ripstop',
  stripe:'pat2-stripe', pinstripe:'pat2-pinstripe', gingham:'pat2-gingham', plaid:'pat2-plaid', houndstooth:'pat2-houndstooth' };
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

/** items: {slot, file, color(hex), mat?(소재), pattern?(무늬), patColor?, length?, tuck?, detail?, opacity?, blur?}
 *  stage 슬롯은 여러 개(spotlight, floor) 가능. opacity/blur 는 stage 전용. */
function render(items, { v = 2, size = 120, grain = state.grain, grid = false, stage = null } = {}) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 400'); svg.setAttribute('width', size / 2); svg.setAttribute('height', size); svg.setAttribute('class', 'sil');
  const groups = {}; for (const it of items) (groups[it.slot] ||= []).push(it);
  if (v === 2 && stage) {
    const k = size >= 240 ? 'detail300' : 'card120';
    groups.stage = [
      { slot:'stage', file:'stage-spotlight', opacity: STAGE.spotlight.opacity[k], blur: STAGE.spotlight.blur[k] },
      { slot:'stage', file:'stage-floor', opacity: STAGE.floor.opacity[k], blur: STAGE.floor.blur[k] },
    ].filter((s) => stage === true || stage === s.file.replace('stage-', ''));
  }
  for (const it of items) if (it.slot !== 'stage') svg.style.setProperty('--c-' + it.slot, it.color);
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
    for (const it of groups[slot] || []) {
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
        if (slot === 'stage') {
          // stage 는 그림 뒤 연출: 불투명도·블러만 CSS 로. 그레인 필터 밖에 두려면 stack 앞에 넣는다.
          if (it.opacity != null) g.style.opacity = it.opacity;
          if (it.blur && it.blur !== '0') g.style.filter = 'blur(' + it.blur + ')';
          stack.append(g); continue;
        }
        for (const p of Array.from(g.querySelectorAll('[data-detail]'))) if (p.dataset.detail !== it.detail) p.remove();
        for (const [kind, key] of [['mat', it.mat], ['pattern', it.pattern]]) {
          const pat = key && PAT2[key]; if (!pat) continue;
          for (const p of Array.from(g.querySelectorAll('path[data-part="main"]:not([data-kind])'))) {
            const o = p.cloneNode(true); o.setAttribute('fill', 'url(#' + pat + ')'); o.setAttribute('stroke', 'none'); o.dataset.part = kind; o.dataset[kind] = key;
            if (kind === 'pattern') o.style.color = it.patColor || contrastOf(it.color);
            p.after(o);
          }
        }
        applyLength(g, it); stack.append(g);
      }
    }
  }
  if (grid) svg.append(gridOverlay());
  return svg;
}
/** 무늬 기본 색: 옷이 밝으면 네이비, 어두우면 오프화이트 (FE 는 patterns.json colorsTypical 로 대체) */
function contrastOf(hex) { const n = parseInt(hex.slice(1), 16); const l = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)); return l > 140 ? G.navy : G.offWhite; }
function gridOverlay() {
  const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'gridlines');
  const Y = [[8,'머리 8'],[54,'턱 54'],[78,'어깨 78'],[102,'가슴 102'],[168,'허리 168'],[176,'바지 허리 176'],[192,'상의 밑단 192'],[214,'가랑이 214'],[292,'무릎 292'],[338,'crop 338'],[356,'신발 356'],[362,'밑단 362'],[392,'바닥 392']];
  for (const [y, t] of Y) { const l = document.createElementNS(NS, 'line'); l.setAttribute('x1', 0); l.setAttribute('x2', 200); l.setAttribute('y1', y); l.setAttribute('y2', y); g.append(l); const x = document.createElementNS(NS, 'text'); x.setAttribute('x', 162); x.setAttribute('y', y - 1.5); x.textContent = t; g.append(x); }
  const c = document.createElementNS(NS, 'line'); c.setAttribute('x1', 100); c.setAttribute('x2', 100); c.setAttribute('y1', 0); c.setAttribute('y2', 400); c.setAttribute('stroke-dasharray', '2 3'); g.append(c);
  return g;
}

const OUTFITS = [
  { name: '1 화이트 티 · 인디고 데님 스트레이트 · 흰 스니커즈', items: [
    { slot:'top', file:'top-tee-regular', color:G.white }, { slot:'bottom', file:'bottom-straight', color:G.indigo, mat:'denim' }, { slot:'shoes', file:'shoes-sneaker', color:G.white } ] },
  { name: '2 라이트블루 옥스포드 · 베이지 치노 테이퍼드 · 브라운 태슬 로퍼 · 네이비 블레이저', items: [
    { slot:'top', file:'top-shirt-regular', color:G.lightBlue }, { slot:'bottom', file:'bottom-tapered', color:G.beige }, { slot:'shoes', file:'shoes-loafer', color:G.brown, mat:'leather', detail:'tassel' }, { slot:'outer', file:'outer-regular', color:G.navy } ] },
  { name: '3 오트밀 울 니트 · 차콜 플란넬 와이드 · 블랙 더비', items: [
    { slot:'top', file:'top-knit-regular', color:G.oatmeal, mat:'knit' }, { slot:'bottom', file:'bottom-wide', color:G.charcoal, mat:'flannel' }, { slot:'shoes', file:'shoes-derby', color:G.black, mat:'leather' } ] },
  { name: '4 그레이 후디 · 블랙 데님 테이퍼드 · 네이비 스니커즈 · 올리브 블루종(립스탑)', items: [
    { slot:'top', file:'top-hoodie-regular', color:G.greyMelange }, { slot:'bottom', file:'bottom-tapered', color:G.blackDenim, mat:'denim' }, { slot:'shoes', file:'shoes-sneaker', color:G.navy }, { slot:'outer', file:'outer-short', color:G.olive, mat:'nylon' } ] },
  { name: '5 네이비 루즈 니트 · 라이트 데님 와이드 크롭 · 흰 스니커즈 · 블랙 패딩', items: [
    { slot:'top', file:'top-knit-loose', color:G.navy, mat:'knit' }, { slot:'bottom', file:'bottom-wide', color:G.lightDenim, mat:'denim', length:'crop' }, { slot:'shoes', file:'shoes-sneaker', color:G.white }, { slot:'outer', file:'outer-puffer', color:G.black, mat:'nylon' } ] },
  { name: '6 블랙 루즈 티 · 브라운 코듀로이 스트레이트 · 블랙 첼시 · 베이지 트렌치', items: [
    { slot:'top', file:'top-tee-loose', color:G.black }, { slot:'bottom', file:'bottom-straight', color:G.brown, mat:'corduroy' }, { slot:'shoes', file:'shoes-chelsea', color:G.black, mat:'leather' }, { slot:'outer', file:'outer-long', color:G.beige } ] },
  // ---- 6-B 신규 레이어 ----
  { name: '7 네이비 피케 폴로 · 베이지 치노 슬림 · 브라운 척카', items: [
    { slot:'top', file:'top-polo-regular', color:G.navy }, { slot:'bottom', file:'bottom-slim', color:G.beige }, { slot:'shoes', file:'shoes-chukka', color:G.brown, mat:'leather' } ] },
  { name: '8 오프화이트 루즈 폴로 · 블랙 데님 슬림 · 흰 러닝화', items: [
    { slot:'top', file:'top-polo-loose', color:G.offWhite }, { slot:'bottom', file:'bottom-slim', color:G.blackDenim, mat:'denim' }, { slot:'shoes', file:'shoes-running', color:G.white } ] },
  { name: '9 세이지 린넨 루즈 셔츠 · 라이트 데님 와이드 · 브라운 샌들', items: [
    { slot:'top', file:'top-shirt-loose', color:G.sage, mat:'linen' }, { slot:'bottom', file:'bottom-wide', color:G.lightDenim, mat:'denim' }, { slot:'shoes', file:'shoes-sandal', color:G.brown, mat:'leather' } ] },
  { name: '10 블랙 루즈 후디 · 카키 스트레이트 · 브라운 워크 부츠 · 데님 재킷', items: [
    { slot:'top', file:'top-hoodie-loose', color:G.black }, { slot:'bottom', file:'bottom-straight', color:G.khaki }, { slot:'shoes', file:'shoes-workboot', color:G.brown, mat:'leather' }, { slot:'outer', file:'outer-short', color:G.indigo, mat:'denim' } ] },
  { name: '11 라이트블루 옥스포드 · 캐멀 가디건(mid) · 차콜 울 테이퍼드 · 블랙 더비 · 네이비 발마칸', items: [
    { slot:'top', file:'top-shirt-regular', color:G.lightBlue }, { slot:'mid', file:'mid-cardigan', color:G.camel, mat:'knit' }, { slot:'bottom', file:'bottom-tapered', color:G.charcoal }, { slot:'shoes', file:'shoes-derby', color:G.black, mat:'leather' }, { slot:'outer', file:'outer-long', color:G.navy } ] },
  { name: '12 화이트 티 · 올리브 퀼팅 베스트(mid) · 인디고 데님 스트레이트 · 흰 스니커즈 / 오트밀 셔츠 · 러스트 오버셔츠(mid) · 베이지 트렌치', items: [
    { slot:'top', file:'top-tee-regular', color:G.white }, { slot:'mid', file:'mid-vest', color:G.olive, mat:'nylon', detail:'quilt' }, { slot:'bottom', file:'bottom-straight', color:G.indigo, mat:'denim' }, { slot:'shoes', file:'shoes-sneaker', color:G.white } ],
    items2: [ { slot:'top', file:'top-shirt-regular', color:G.oatmeal }, { slot:'mid', file:'mid-overshirt', color:G.rust, mat:'flannel' }, { slot:'bottom', file:'bottom-straight', color:G.charcoal, mat:'flannel' }, { slot:'shoes', file:'shoes-chelsea', color:G.chocolate, mat:'leather' }, { slot:'outer', file:'outer-long', color:G.beige } ] },
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
      for (const items of [o.items, o.items2].filter(Boolean)) {
        pairs.append(pane(t, '120px', [fig(render(items, { v: 1, size: 120 }), 'v1'), fig(render(items, { v: 2, size: 120 }), 'v2')]));
        pairs.append(pane(t, '300px', [fig(render(items, { v: 1, size: 300 }), 'v1'), fig(render(items, { v: 2, size: 300 }), 'v2')]));
      }
    }
    row.append(pairs);
    const chips = document.createElement('div'); chips.className = 'chips';
    for (const it of [...o.items, ...(o.items2 || [])]) { const c = document.createElement('span'); c.className = 'chip'; const i = document.createElement('i'); i.style.background = it.color; c.append(i, it.slot + ' ' + it.file.replace(/^(top|bottom|shoes|outer|mid)-/, '') + (it.mat ? ' · ' + it.mat : '') + (it.pattern ? ' · ' + it.pattern : '') + (it.length ? ' · ' + it.length : '') + (it.detail ? ' · ' + it.detail : '')); chips.append(c); }
    row.append(chips); root.append(row);
  }
}

const BASIC = [{slot:'top',file:'top-tee-regular',color:G.offWhite},{slot:'bottom',file:'bottom-straight',color:G.charcoal}];
const CONTEXT = { stage:[{slot:'top',file:'top-tee-regular',color:G.offWhite},{slot:'bottom',file:'bottom-straight',color:G.charcoal},{slot:'shoes',file:'shoes-sneaker',color:G.white}], base:[], cap:[], socks:[{slot:'bottom',file:'bottom-straight',color:G.charcoal,length:'crop'},{slot:'shoes',file:'shoes-loafer',color:G.black}], shoes:[{slot:'bottom',file:'bottom-straight',color:G.charcoal}], bottom:[], belt:[{slot:'bottom',file:'bottom-straight',color:G.charcoal}], top:[{slot:'bottom',file:'bottom-straight',color:G.charcoal}], mid:[{slot:'top',file:'top-shirt-regular',color:G.lightBlue},{slot:'bottom',file:'bottom-straight',color:G.charcoal}], outer:BASIC, scarf:[{slot:'top',file:'top-knit-regular',color:G.oatmeal}], bag:BASIC, watch:BASIC };
const SELF = { top:G.sage, bottom:G.midDenim, shoes:G.chocolate, outer:G.camel, mid:G.burgundy, belt:G.chocolate, watch:G.black, socks:G.offWhite, bag:G.oatmeal, cap:G.navy, scarf:G.burgundy };
function buildCatalog() {
  const root = document.getElementById('catalog'); root.innerHTML = '';
  for (const l of INDEX.layers) {
    const file = l.file.replace(/\\.svg$/, '');
    const items = (CONTEXT[l.slot] || []).slice();
    let opts = { v: 2, size: 150 };
    if (l.slot === 'stage') opts.stage = l.type;
    else if (l.slot !== 'base') items.push({ slot: l.slot, file, color: SELF[l.slot], detail: l.optionalDetails ? l.optionalDetails[0] : undefined });
    if (l.slot === 'belt') items.push({ slot:'top', file:'top-shirt-regular', color:G.offWhite, tuck:true });
    const f = document.createElement('figure'); f.className = 'cat'; f.dataset.slot = l.slot;
    const w = document.createElement('div'); w.className = 'figwrap'; w.append(render(items, opts)); f.append(w);
    const c = document.createElement('figcaption'); c.innerHTML = l.labelKo + '<br><code>' + l.file + ' · ' + l.paths + 'p · ' + l.bytes + 'B</code>'; f.append(c); root.append(f);
  }
}

const PATS = [['denim','데님 트윌 62°'],['corduroy','코듀로이 웨일'],['knit','니트 케이블·립'],['flannel','플란넬 체크'],['linen','린넨 슬럽'],['leather','가죽 광택 띠'],['nylon','나일론 립스탑'],['tweed','트위드 플렉'],
  ['stripe','브레통 스트라이프'],['pinstripe','핀스트라이프'],['gingham','깅엄'],['plaid','플레이드(버팔로)'],['houndstooth','하운드투스']];
const PAT_BG = { leather:G.chocolate, denim:G.indigo, knit:G.oatmeal, flannel:G.charcoal, linen:G.beige, nylon:G.olive, tweed:G.taupe, corduroy:G.brown, stripe:G.white, pinstripe:G.charcoal, gingham:G.white, plaid:G.burgundy, houndstooth:G.offWhite };
const PAT_FG = { stripe:G.navy, pinstripe:G.offWhite, gingham:G.midDenim, plaid:G.black, houndstooth:G.black };
function buildPatterns() {
  const root = document.getElementById('patterns'); root.innerHTML = '';
  for (const [id, ko] of PATS) {
    const d = document.createElement('div'); d.className = 'pat';
    d.innerHTML = '<svg viewBox="0 0 120 72" preserveAspectRatio="none"' + (PAT_FG[id] ? ' style="color:' + PAT_FG[id] + '"' : '') + '><rect width="120" height="72" fill="' + PAT_BG[id] + '"/><rect width="120" height="72" fill="url(#' + PAT2[id] + ')"/></svg>' + ko + '<small>' + PAT2[id] + '</small>';
    root.append(d);
  }
  const figs = document.getElementById('patternFigs'); figs.innerHTML = '';
  const demo = [
    ['denim', [{slot:'top',file:'top-shirt-regular',color:G.lightDenim,mat:'denim'},{slot:'bottom',file:'bottom-straight',color:G.indigo,mat:'denim'},{slot:'shoes',file:'shoes-sneaker',color:G.white}]],
    ['corduroy+knit', [{slot:'top',file:'top-knit-regular',color:G.mustard,mat:'knit'},{slot:'bottom',file:'bottom-wide',color:G.brown,mat:'corduroy'},{slot:'shoes',file:'shoes-derby',color:G.chocolate,mat:'leather'}]],
    ['flannel+linen', [{slot:'top',file:'top-shirt-regular',color:G.sage,mat:'linen'},{slot:'bottom',file:'bottom-tapered',color:G.midGrey,mat:'flannel'},{slot:'shoes',file:'shoes-loafer',color:G.burgundy,mat:'leather'}]],
    ['tweed+ripstop', [{slot:'top',file:'top-tee-regular',color:G.offWhite},{slot:'bottom',file:'bottom-straight',color:G.black,mat:'nylon'},{slot:'shoes',file:'shoes-chelsea',color:G.chocolate,mat:'leather'},{slot:'outer',file:'outer-regular',color:G.taupe,mat:'tweed'}]],
    ['breton', [{slot:'top',file:'top-tee-regular',color:G.white,pattern:'stripe',patColor:G.navy},{slot:'bottom',file:'bottom-straight',color:G.indigo,mat:'denim'},{slot:'shoes',file:'shoes-sneaker',color:G.white}]],
    ['gingham+pinstripe', [{slot:'top',file:'top-shirt-regular',color:G.white,pattern:'gingham',patColor:G.midDenim},{slot:'bottom',file:'bottom-tapered',color:G.charcoal,pattern:'pinstripe',patColor:G.offWhite},{slot:'shoes',file:'shoes-loafer',color:G.chocolate,mat:'leather'}]],
    ['plaid(mid)', [{slot:'top',file:'top-tee-regular',color:G.offWhite},{slot:'mid',file:'mid-overshirt',color:G.burgundy,pattern:'plaid',patColor:G.black},{slot:'bottom',file:'bottom-straight',color:G.blackDenim,mat:'denim'},{slot:'shoes',file:'shoes-workboot',color:G.brown,mat:'leather'}]],
    ['houndstooth', [{slot:'top',file:'top-knit-regular',color:G.black,mat:'knit'},{slot:'bottom',file:'bottom-tapered',color:G.charcoal},{slot:'shoes',file:'shoes-derby',color:G.black,mat:'leather'},{slot:'outer',file:'outer-regular',color:G.offWhite,pattern:'houndstooth',patColor:G.black}]],
  ];
  for (const [n, items] of demo) figs.append(pane(null, n, [fig(render(items, { v: 2, size: 300 }), '300px'), fig(render(items, { v: 2, size: 120 }), '120px')]));
}

const ACC = [['outer','발마칸(아우터)',true],['mid','가디건 (mid)',true],['belt','벨트 (셔츠 tuck)',true],['watch','손목시계',true],['socks','양말 (바지 crop)',true],['bag','가방',false],['cap','모자',false],['scarf','머플러',false]];
const accOn = Object.fromEntries(ACC.map(([k,,d]) => [k, d]));
const accVar = { bag:'acc-bag', cap:'acc-cap', mid:'mid-cardigan' };
function buildAcc() {
  const ctl = document.getElementById('accCtl');
  if (!ctl.children.length) {
    for (const [k, ko] of ACC) { const l = document.createElement('label'); l.className = 't'; const i = document.createElement('input'); i.type = 'checkbox'; i.checked = accOn[k]; i.addEventListener('change', () => { accOn[k] = i.checked; buildAcc(); }); l.append(i, ko); ctl.append(l); }
    for (const [k, opts] of [['bag', ['acc-bag','acc-crossbody','acc-backpack']], ['cap', ['acc-cap','acc-beanie']], ['mid', ['mid-cardigan','mid-vest','mid-overshirt']]]) {
      const s = document.createElement('select'); s.style.cssText = 'min-height:32px;font:inherit;font-size:12px;background:var(--bg-1);color:var(--text-1);border:1px solid var(--border);border-radius:8px';
      for (const o of opts) { const op = document.createElement('option'); op.value = o; op.textContent = k + ' → ' + o; s.append(op); }
      s.addEventListener('change', () => { accVar[k] = s.value; buildAcc(); }); ctl.append(s);
    }
  }
  const items = [
    { slot:'top', file:'top-shirt-regular', color:G.white, tuck: accOn.belt },
    { slot:'bottom', file:'bottom-tapered', color:G.navy, length: accOn.socks ? 'crop' : 'regular' },
    { slot:'shoes', file:'shoes-loafer', color:G.chocolate, mat:'leather' },
  ];
  if (accOn.mid) items.push({ slot:'mid', file:accVar.mid, color:G.camel, detail: accVar.mid === 'mid-vest' ? 'quilt' : undefined });
  if (accOn.outer) items.push({ slot:'outer', file:'outer-long', color:G.charcoal });
  if (accOn.belt) items.push({ slot:'belt', file:'acc-belt', color:G.chocolate });
  if (accOn.watch) items.push({ slot:'watch', file:'acc-watch', color:G.black });
  if (accOn.socks) items.push({ slot:'socks', file:'acc-socks', color:G.offWhite });
  if (accOn.bag) items.push({ slot:'bag', file:accVar.bag, color:G.oatmeal });
  if (accOn.cap) items.push({ slot:'cap', file:accVar.cap, color:G.navy });
  if (accOn.scarf) items.push({ slot:'scarf', file:'acc-scarf', color:G.burgundy });
  const figs = document.getElementById('accFigs'); figs.innerHTML = '';
  figs.append(pane(null, null, [fig(render(items, { v: 2, size: 320 }), '320px'), fig(render(items, { v: 2, size: 120 }), '120px')]));
  if (state.both) figs.append(pane(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', null, [fig(render(items, { v: 2, size: 320 }), '320px')]));
}
function buildGrid() {
  const root = document.getElementById('gridFig'); root.innerHTML = '';
  const items = [{slot:'top',file:'top-tee-regular',color:G.offWhite},{slot:'bottom',file:'bottom-straight',color:G.indigo},{slot:'shoes',file:'shoes-sneaker',color:G.white}];
  root.append(pane(null, null, [fig(render([], { v: 2, size: 400, grid: state.grid }), '몸만'), fig(render(items, { v: 2, size: 400, grid: state.grid }), '기본 코디'), fig(render([{slot:'top',file:'top-shirt-regular',color:G.lightBlue},{slot:'mid',file:'mid-cardigan',color:G.camel},{slot:'bottom',file:'bottom-straight',color:G.charcoal},{slot:'shoes',file:'shoes-derby',color:G.black},{slot:'outer',file:'outer-long',color:G.camel}], { v: 2, size: 400, grid: state.grid }), '미드 + 롱 아우터')]));
}

// ---- 6. 스튜디오 다크 스테이지 ----
const STUDIO_OUTFITS = [
  ['클래식 01', '화이트 티 · 인디고 데님 · 흰 스니커즈', '색 온도가 같은 뉴트럴 3색', [{slot:'top',file:'top-tee-regular',color:G.white},{slot:'bottom',file:'bottom-straight',color:G.indigo,mat:'denim'},{slot:'shoes',file:'shoes-sneaker',color:G.white}]],
  ['클래식 02', '네이비 니트 · 차콜 울 · 블랙 첼시', '어두운 옷 — 바닥 그림자와 스포트라이트로 배경에서 분리', [{slot:'top',file:'top-knit-regular',color:G.navy,mat:'knit'},{slot:'bottom',file:'bottom-tapered',color:G.charcoal},{slot:'shoes',file:'shoes-chelsea',color:G.black,mat:'leather'}]],
  ['변주 03', '브레통 티 · 라이트 데님 와이드 · 샌들', '무늬 패턴 + 미드 없음', [{slot:'top',file:'top-tee-loose',color:G.offWhite,pattern:'stripe',patColor:G.navy},{slot:'bottom',file:'bottom-wide',color:G.lightDenim,mat:'denim',length:'crop'},{slot:'shoes',file:'shoes-sandal',color:G.brown,mat:'leather'}]],
];
function gcard(label, cap, why, items, mode) {
  const c = document.createElement('div'); c.className = 'gcard';
  const p = document.createElement('div'); p.className = 'plate ' + (mode === 'css' ? 'css' : mode === 'flat' ? 'flat' : '');
  const grain = mode === 'grain';
  p.append(render(items, { v: 2, size: 132, stage: mode === 'css' ? null : true, grain }));
  const m = document.createElement('div'); m.className = 'meta';
  m.innerHTML = '<div class="lbl">' + label + '</div><div class="capn">' + cap + '</div><div class="why">' + why + '</div><div class="why"><code>' + (mode === 'css' ? 'CSS radial-gradient 플레이트 (시안 B 원본)' : mode === 'grain' ? 'stage 레이어 + 그레인 + drop-shadow' : 'stage 레이어 (spotlight .55 / floor .8)') + '</code></div>';
  c.append(p, m); return c;
}
function buildStudio() {
  const root = document.getElementById('studio'); root.innerHTML = '';
  for (const [label, cap, why, items] of STUDIO_OUTFITS) {
    const row = document.createElement('div'); row.className = 'cards'; row.style.marginBottom = '12px';
    row.append(gcard(label, cap, why, items, 'css'), gcard(label, cap, why, items, 'stage'), gcard(label, cap, why, items, 'grain'));
    root.append(row);
  }
  const d = document.createElement('div'); d.className = 'detail';
  for (const [i, [label, cap, , items]] of STUDIO_OUTFITS.entries()) {
    const p = document.createElement('div'); p.className = 'plate';
    p.append(render(items, { v: 2, size: 300, stage: true, grain: i === 1 }));
    const f = fig(p, '300px 상세 · spotlight .75 + blur 6px · floor 1 + blur 3px' + (i === 1 ? ' · 그레인' : '') + ' — ' + cap);
    d.append(f);
  }
  root.append(d);
}
function buildTable() {
  const tb = document.querySelector('#tbl tbody'); tb.innerHTML = '';
  for (const l of INDEX.layers) { const tr = document.createElement('tr'); tr.innerHTML = '<td>' + l.file + '</td><td>' + l.slot + '</td><td>' + l.type + '</td><td>' + (l.fit || '-') + '</td><td>' + (l.length || '-') + '</td><td class="n">' + l.paths + '</td><td class="n">' + l.bytes + '</td><td>' + l.shade + '</td><td>' + l.details + (l.optionalDetails ? ' (' + l.optionalDetails.join(',') + ')' : '') + '</td>'; tb.append(tr); }
}
function buildAll() { buildOutfits(); buildCatalog(); buildPatterns(); buildAcc(); buildGrid(); buildStudio(); }
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
