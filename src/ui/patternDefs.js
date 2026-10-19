// 소재 <pattern> · 크롭 <clipPath> defs — design-tokens.md 6-2 스니펫 그대로. 문서에 한 번만 삽입.
const DEFS_ID = 'mc-svg-defs';

const DEFS = `
<defs>
  <pattern id="pat-denim" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <line x1="1" y1="0" x2="1" y2="6" stroke="currentColor" stroke-opacity="0.18" stroke-width="1.2"/>
  </pattern>
  <pattern id="pat-corduroy" width="5" height="5" patternUnits="userSpaceOnUse">
    <line x1="1" y1="0" x2="1" y2="5" stroke="currentColor" stroke-opacity="0.16" stroke-width="2"/>
  </pattern>
  <pattern id="pat-knit" width="6" height="4" patternUnits="userSpaceOnUse">
    <path d="M0 0 L3 3 L6 0" fill="none" stroke="currentColor" stroke-opacity="0.18" stroke-width="0.9" stroke-linejoin="round"/>
  </pattern>
  <pattern id="pat-flannel" width="18" height="18" patternUnits="userSpaceOnUse">
    <rect x="0" y="0" width="18" height="18" fill="currentColor" fill-opacity="0.04"/>
    <line x1="9" y1="0" x2="9" y2="18" stroke="currentColor" stroke-opacity="0.10" stroke-width="5"/>
    <line x1="0" y1="9" x2="18" y2="9" stroke="currentColor" stroke-opacity="0.10" stroke-width="5"/>
  </pattern>
  <pattern id="pat-linen" width="10" height="8" patternUnits="userSpaceOnUse">
    <line x1="0" y1="2" x2="10" y2="2" stroke="currentColor" stroke-opacity="0.10" stroke-width="0.8"/>
    <line x1="0" y1="6" x2="10" y2="6" stroke="currentColor" stroke-opacity="0.14" stroke-width="0.8" stroke-dasharray="3 4"/>
    <line x1="4" y1="0" x2="4" y2="8" stroke="currentColor" stroke-opacity="0.08" stroke-width="0.6" stroke-dasharray="2 3"/>
  </pattern>
  <pattern id="pat-leather" width="1" height="1" patternContentUnits="objectBoundingBox">
    <path d="M0.18 0 L0.42 0 L0.30 1 L0.06 1 Z" fill="currentColor" fill-opacity="0.08"/>
    <path d="M0.62 0 L0.70 0 L0.58 1 L0.50 1 Z" fill="currentColor" fill-opacity="0.05"/>
  </pattern>
  <clipPath id="clip-crop"><rect x="0" y="0" width="200" height="338"/></clipPath>
  <clipPath id="clip-top-crop"><rect x="0" y="0" width="200" height="184"/></clipPath>
</defs>`;

/** 숨은 <svg> defs를 body에 1회 삽입. 인라인 실루엣이 url(#pat-*)로 참조한다. */
export function ensurePatternDefs() {
  if (typeof document === 'undefined' || document.getElementById(DEFS_ID)) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = DEFS_ID;
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.style.cssText = 'position:absolute;width:0;height:0;color:var(--text-1)';
  svg.innerHTML = DEFS; // 정적 문자열만
  document.body.prepend(svg);
}
