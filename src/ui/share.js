// 공유 카드 — ux-enhancement 5장. 1080×1350 PNG, 배경 #0E0F12 고정, 기기 안에서만 생성(서버 없음).
// shareLayout 은 순수 함수(테스트), buildShareImage 가 캔버스를 그린다.
import { dateStamp, dateSlug } from './today.js';

export const W = 1080;
export const H = 1350;
export const BG = '#0E0F12';
export const INK = '#F4F2ED';
export const INK_2 = '#B9B6AF';
export const ACCENT = '#E8B964';
export const FONT = '"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,Roboto,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif';

/**
 * 캡션 줄바꿈: 단어 경계 "·" 우선, 넘치면 글자 단위. 최대 maxLines 줄(마지막 줄 말줄임).
 * @param {string} text
 * @param {(s:string)=>number} measure  텍스트 폭(px)
 * @param {number} maxWidth
 * @param {number} maxLines
 */
export function wrapCaption(text, measure, maxWidth, maxLines = 3) {
  const parts = String(text || '').split(' · ').filter(Boolean);
  const lines = [];
  let cur = '';
  const push = () => { if (cur) lines.push(cur); cur = ''; };
  for (const part of parts) {
    const cand = cur ? `${cur} · ${part}` : part;
    if (measure(cand) <= maxWidth) { cur = cand; continue; }
    push();
    if (measure(part) <= maxWidth) { cur = part; continue; }
    // 한 조각이 한 줄보다 길면 글자 단위
    let buf = '';
    for (const ch of part) {
      if (measure(buf + ch) > maxWidth) { lines.push(buf); buf = ch; } else buf += ch;
    }
    cur = buf;
  }
  push();
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last.length && measure(`${last}…`) > maxWidth) last = last.slice(0, -1);
    kept[maxLines - 1] = `${last}…`;
    return kept;
  }
  return lines;
}

/**
 * 레이아웃(좌표·줄) 계산 — 캔버스 없이도 돌아간다.
 * @param {{caption:string, label:string, dots:string[], date?:string}} input
 * @param {(s:string, px:number)=>number} measure  (text, fontPx) → width
 */
export function shareLayout({ caption, label, dots = [], date }, measure) {
  const pad = 72;
  const silX = pad, silY = 160, silW = 460, silH = 920;
  const textX = silX + silW + 56;
  const textW = W - textX - pad;
  const capPx = 44, capLh = 60;
  const lines = wrapCaption(caption, (s) => measure(s, capPx), textW, 3);
  const dotY = 560;
  const capY = dotY + 72 + 60;
  return {
    bg: BG,
    sil: { x: silX, y: silY, w: silW, h: silH },
    dots: dots.slice(0, 4).map((c, i) => ({ x: textX + 36 + i * 92, y: dotY + 36, r: 36, color: c })),
    caption: { x: textX, y: capY, px: capPx, lh: capLh, lines },
    label: { x: textX, y: capY + lines.length * capLh + 40, px: 28, text: label },
    mark: { x: pad, y: H - 96, px: 32, text: '아침 코디' },
    date: { x: pad + measure('아침 코디', 32) + 24, y: H - 96, px: 28, text: date || dateStamp() },
    icon: { x: W - pad - 96, y: H - 96 - 72, size: 96 },
  };
}

/** 색 점용 실제 색 값 (CSS 변수 → 계산값) */
function resolveColor(cssValue, el) {
  const m = /^var\((--[\w-]+)\s*(?:,\s*([^)]+))?\)$/.exec(String(cssValue || '').trim());
  if (!m) return cssValue;
  try {
    const v = getComputedStyle(el || document.documentElement).getPropertyValue(m[1]).trim();
    if (v) return v;
  } catch { /* noop */ }
  return m[2] || '#888';
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load failed'));
    img.src = src;
  });
}

/**
 * 공유 PNG 생성.
 * @param {{svgMarkup:string, caption:string, label:string, dotColors:string[], iconUrl?:string, date?:Date}} input
 * @returns {Promise<Blob>}
 */
export async function buildShareImage({ svgMarkup, caption, label, dotColors = [], iconUrl, date }) {
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');
  const measure = (s, px) => { ctx.font = `600 ${px}px ${FONT}`; return ctx.measureText(s).width; };
  const L = shareLayout({ caption, label, dots: dotColors.map((c) => resolveColor(c)), date: date ? dateStamp(date) : undefined }, measure);

  ctx.fillStyle = L.bg; ctx.fillRect(0, 0, W, H);
  // 아침빛 + 무대 스포트라이트
  const morning = ctx.createRadialGradient(160, -80, 0, 160, -80, 700);
  morning.addColorStop(0, 'rgba(232,185,100,.12)'); morning.addColorStop(1, 'rgba(232,185,100,0)');
  ctx.fillStyle = morning; ctx.fillRect(0, 0, W, H);
  const cx = L.sil.x + L.sil.w / 2, cy = L.sil.y + L.sil.h * .4;
  const spot = ctx.createRadialGradient(cx, cy, 0, cx, cy, L.sil.h * .55);
  spot.addColorStop(0, 'rgba(255,230,190,.18)'); spot.addColorStop(.7, 'rgba(255,230,190,.04)'); spot.addColorStop(1, 'rgba(255,230,190,0)');
  ctx.fillStyle = spot; ctx.fillRect(0, 0, W, H);

  // 실루엣 (data: URL → Image, foreignObject 없음)
  const img = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`);
  ctx.drawImage(img, L.sil.x, L.sil.y, L.sil.w, L.sil.h);

  // 색 점
  for (const d of L.dots) {
    ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fillStyle = d.color; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.stroke();
  }
  // 캡션
  ctx.fillStyle = INK; ctx.textBaseline = 'top';
  ctx.font = `600 ${L.caption.px}px ${FONT}`;
  L.caption.lines.forEach((line, i) => ctx.fillText(line, L.caption.x, L.caption.y + i * L.caption.lh));
  // 라벨 (앰버 아이브로우)
  ctx.fillStyle = ACCENT; ctx.font = `700 ${L.label.px}px ${FONT}`;
  ctx.fillText(L.label.text, L.label.x, L.label.y);
  // 워드마크 + 날짜
  ctx.fillStyle = INK; ctx.font = `800 ${L.mark.px}px ${FONT}`;
  ctx.fillText(L.mark.text, L.mark.x, L.mark.y);
  ctx.fillStyle = INK_2; ctx.font = `500 ${L.date.px}px ${FONT}`;
  ctx.fillText(L.date.text, L.date.x, L.date.y + 4);
  // 앱 아이콘 (같은 출처 → 캔버스 오염 없음). 실패해도 이미지는 만든다
  if (iconUrl) {
    try {
      const ic = await loadImage(iconUrl);
      ctx.save();
      ctx.beginPath(); roundRect(ctx, L.icon.x, L.icon.y, L.icon.size, L.icon.size, 22); ctx.clip();
      ctx.drawImage(ic, L.icon.x, L.icon.y, L.icon.size, L.icon.size);
      ctx.restore();
    } catch { /* 아이콘 없이 */ }
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob null'))), 'image/png');
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

export function fileName(date = new Date()) { return `아침코디-${dateSlug(date)}.png`; }

/** 공유 능력 판정 */
export function shareCapability(blob) {
  const nav = typeof navigator !== 'undefined' ? navigator : null;
  if (!nav || typeof nav.share !== 'function') return 'none';
  try {
    if (blob && typeof nav.canShare === 'function' && nav.canShare({ files: [new File([blob], 'a.png', { type: 'image/png' })] })) return 'files';
  } catch { /* noop */ }
  return 'text';
}

/** Web Share (files → text 폴백). 취소(AbortError)는 false. */
export async function shareBlob(blob, { title, text, url }) {
  const cap = shareCapability(blob);
  if (cap === 'none') return false;
  try {
    if (cap === 'files') await navigator.share({ files: [new File([blob], fileName(), { type: 'image/png' })], title, text });
    else await navigator.share({ title, text, url });
    return true;
  } catch (e) {
    if (e && e.name === 'AbortError') return false;
    throw e;
  }
}

/** <a download> 로 저장 */
export function downloadBlob(blob, name = fileName()) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.rel = 'noopener';
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
