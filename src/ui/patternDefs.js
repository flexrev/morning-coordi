// 소재 <pattern> v2 · 크롭/턱 <clipPath> · 무대 조명 · 그레인 필터 defs — docs/phase6/asset-system.md 5장 스니펫 그대로.
// 문서에 한 번만 삽입. v1 pat-* 는 v2 pat2-* 로 대체(별칭 유지: 외부 참조가 남아 있어도 깨지지 않게).
const DEFS_ID = 'mc-svg-defs';

export const PATTERN_IDS = ['pat2-denim', 'pat2-corduroy', 'pat2-knit', 'pat2-flannel', 'pat2-linen', 'pat2-leather', 'pat2-ripstop', 'pat2-tweed',
  'pat2-stripe', 'pat2-pinstripe', 'pat2-gingham', 'pat2-plaid', 'pat2-houndstooth'];

export const DEFS = `
<defs>
  <pattern id="pat2-denim" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(62)">
    <line x1="2" y1="0" x2="2" y2="8" stroke="currentColor" stroke-opacity=".15" stroke-width="1.4"/>
    <line x1="6" y1="0" x2="6" y2="8" stroke="currentColor" stroke-opacity=".07" stroke-width=".7"/>
  </pattern>
  <pattern id="pat2-corduroy" width="6" height="6" patternUnits="userSpaceOnUse">
    <rect width="2.6" height="6" fill="currentColor" fill-opacity=".13"/>
    <line x1="4.2" y1="0" x2="4.2" y2="6" stroke="currentColor" stroke-opacity=".05" stroke-width=".6"/>
  </pattern>
  <pattern id="pat2-knit" width="12" height="10" patternUnits="userSpaceOnUse">
    <line x1="1" y1="0" x2="1" y2="10" stroke="currentColor" stroke-opacity=".12"/>
    <line x1="11" y1="0" x2="11" y2="10" stroke="currentColor" stroke-opacity=".12"/>
    <path d="M3 0 L9 5 L3 10 M9 0 L3 5 L9 10" fill="none" stroke="currentColor" stroke-opacity=".14" stroke-linejoin="round"/>
  </pattern>
  <pattern id="pat2-flannel" width="24" height="24" patternUnits="userSpaceOnUse">
    <rect width="24" height="24" fill="currentColor" fill-opacity=".03"/>
    <line x1="12" y1="0" x2="12" y2="24" stroke="currentColor" stroke-opacity=".09" stroke-width="8"/>
    <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" stroke-opacity=".09" stroke-width="8"/>
    <line x1=".6" y1="0" x2=".6" y2="24" stroke="currentColor" stroke-opacity=".14" stroke-width="1.2"/>
    <line x1="0" y1=".6" x2="24" y2=".6" stroke="currentColor" stroke-opacity=".14" stroke-width="1.2"/>
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
    <path d="M0 10 L10 0" fill="none" stroke="currentColor" stroke-opacity=".06"/>
    <circle cx="2" cy="2" r=".9" fill="currentColor" fill-opacity=".18"/>
    <circle cx="7" cy="6" r="1.1" fill="currentColor" fill-opacity=".12"/>
    <circle cx="4" cy="8" r=".7" fill="currentColor" fill-opacity=".08"/>
    <circle cx="8.5" cy="1" r=".8" fill="currentColor" fill-opacity=".10"/>
  </pattern>
  <!-- 무늬(패턴 필드) 자리표시 — AS 가 정식 타일을 내면 같은 id 로 교체 (CX patterns: stripe·pinstripe·gingham·plaid·houndstooth) -->
  <pattern id="pat2-stripe" width="12" height="12" patternUnits="userSpaceOnUse">
    <rect width="12" height="5" fill="currentColor" fill-opacity=".16"/>
  </pattern>
  <pattern id="pat2-pinstripe" width="8" height="8" patternUnits="userSpaceOnUse">
    <line x1="1" y1="0" x2="1" y2="8" stroke="currentColor" stroke-opacity=".18" stroke-width=".7"/>
  </pattern>
  <pattern id="pat2-gingham" width="12" height="12" patternUnits="userSpaceOnUse">
    <rect width="6" height="12" fill="currentColor" fill-opacity=".10"/>
    <rect width="12" height="6" fill="currentColor" fill-opacity=".10"/>
  </pattern>
  <pattern id="pat2-plaid" width="20" height="20" patternUnits="userSpaceOnUse">
    <line x1="10" y1="0" x2="10" y2="20" stroke="currentColor" stroke-opacity=".10" stroke-width="6"/>
    <line x1="0" y1="10" x2="20" y2="10" stroke="currentColor" stroke-opacity=".10" stroke-width="6"/>
    <line x1="2" y1="0" x2="2" y2="20" stroke="currentColor" stroke-opacity=".14" stroke-width="1"/>
    <line x1="0" y1="2" x2="20" y2="2" stroke="currentColor" stroke-opacity=".14" stroke-width="1"/>
  </pattern>
  <pattern id="pat2-houndstooth" width="8" height="8" patternUnits="userSpaceOnUse">
    <path d="M0 0h4v4H0zM4 4h4v4H4zM4 0l4 4V0zM0 4l4 4H0z" fill="currentColor" fill-opacity=".14"/>
  </pattern>
  <!-- v1 별칭 -->
  <pattern id="pat-denim" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(62)"><line x1="2" y1="0" x2="2" y2="8" stroke="currentColor" stroke-opacity=".15" stroke-width="1.4"/></pattern>
  <pattern id="pat-knit" width="12" height="10" patternUnits="userSpaceOnUse"><path d="M3 0 L9 5 L3 10 M9 0 L3 5 L9 10" fill="none" stroke="currentColor" stroke-opacity=".14"/></pattern>
  <clipPath id="clip-crop"><rect x="0" y="0" width="200" height="338"/></clipPath>
  <clipPath id="clip-top-crop"><rect x="0" y="0" width="200" height="184"/></clipPath>
  <clipPath id="clip-top-tuck"><rect x="0" y="0" width="200" height="176"/></clipPath>
  <!-- 그레인 (opts.grain): 그림 알파 안에서만 2~3% 어두워진다. 300px 상세 ≤3개에서만 -->
  <filter id="f-grain" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .12 0" result="g"/>
    <feComposite in="g" in2="SourceAlpha" operator="in" result="gm"/>
    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gm"/></feMerge>
  </filter>
</defs>`;

/** 숨은 <svg> defs를 body에 1회 삽입. 인라인 실루엣이 url(#pat2-*) 로 참조한다. */
export function ensurePatternDefs() {
  if (typeof document === 'undefined' || document.getElementById(DEFS_ID)) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = DEFS_ID;
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.style.cssText = 'position:absolute;width:0;height:0;color:var(--sil-ink)';
  svg.innerHTML = DEFS; // 정적 문자열만
  document.body.prepend(svg);
}

/** 공유 이미지용: defs 노드 복제 (독립 SVG 에 넣어 url(#…) 참조가 풀리게) */
export function cloneDefs() {
  if (typeof document === 'undefined') return null;
  ensurePatternDefs();
  const d = document.getElementById(DEFS_ID)?.querySelector('defs');
  return d ? d.cloneNode(true) : null;
}
