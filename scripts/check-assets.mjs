#!/usr/bin/env node
// 자산 v2 검증기 — src/assets/v2/*.svg 를 읽어 규약(docs/phase6/asset-system.md 9장)을 검사하고 표를 출력한다.
//   node scripts/check-assets.mjs            검사 + 표
//   node scripts/check-assets.mjs --write-index   index-v2.json 재생성 (검사 통과 시)
//   node scripts/check-assets.mjs --json     결과를 JSON으로 출력
// 의존성 없음(정규식 파서). 종료 코드: 오류가 있으면 1.

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const DIR = join(ROOT, 'src', 'assets', 'v2');
const args = new Set(process.argv.slice(2));

const BUDGET_FILE = 1536;      // 1.5 KB / 레이어
const BUDGET_TOTAL = 120 * 1024; // 120 KB / v2 전체
const VIEWBOX = '0 0 200 400';

// 슬롯별 필수 data-* 와 색 변수
const SLOTS = {
  base:   { attrs: ['data-type'], vars: ['--c-skin'] },
  top:    { attrs: ['data-type', 'data-fit', 'data-length'], vars: ['--c-top'] },
  bottom: { attrs: ['data-type', 'data-fit', 'data-length'], vars: ['--c-bottom'] },
  shoes:  { attrs: ['data-type'], vars: ['--c-shoes'] },
  outer:  { attrs: ['data-type', 'data-fit', 'data-length'], vars: ['--c-outer'] },
  belt:   { attrs: ['data-type'], vars: ['--c-belt'] },
  watch:  { attrs: ['data-type'], vars: ['--c-watch'] },
  socks:  { attrs: ['data-type'], vars: ['--c-socks'] },
  bag:    { attrs: ['data-type'], vars: ['--c-bag'] },
  cap:    { attrs: ['data-type'], vars: ['--c-cap'] },
  scarf:  { attrs: ['data-type'], vars: ['--c-scarf'] },
};
const Z_ORDER = ['base', 'cap', 'socks', 'shoes', 'bottom', 'belt', 'top', 'outer', 'scarf', 'bag', 'watch'];

const attr = (tag, name) => { const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`)); return m ? m[1] : null; };

function check(file) {
  const src = readFileSync(file, 'utf8');
  const bytes = statSync(file).size;
  const name = basename(file, '.svg');
  const errors = [], warns = [];

  const svgTag = (src.match(/<svg\b[^>]*>/) || [''])[0];
  if (attr(svgTag, 'viewBox') !== VIEWBOX) errors.push(`viewBox != "${VIEWBOX}"`);
  const label = attr(svgTag, 'aria-label') || '';
  if (!label) warns.push('aria-label 없음');

  const groups = src.match(/<g\b[^>]*>/g) || [];
  if (groups.length !== 1) errors.push(`<g> 는 정확히 1개여야 함 (현재 ${groups.length})`);
  const g = groups[0] || '';
  const slot = attr(g, 'data-slot');
  const spec = SLOTS[slot];
  if (!spec) errors.push(`data-slot 미지정 또는 미등록 (${slot})`);
  else for (const a of spec.attrs) if (attr(g, a) == null) errors.push(`${a} 없음`);
  const [prefix] = name.split('-');
  const expectPrefix = { base: 'figure', top: 'top', bottom: 'bottom', shoes: 'shoes', outer: 'outer' }[slot] || 'acc';
  if (prefix !== expectPrefix) errors.push(`파일명 접두사 "${prefix}-" 가 슬롯 "${slot}" 규약(${expectPrefix}-)과 다름`);

  const paths = src.match(/<path\b[^>]*>/g) || [];
  if (!paths.length) errors.push('path 없음');
  const parts = { main: 0, shade: 0, detail: 0, shadow: 0, other: 0 };
  let cmds = 0;
  for (const p of paths) {
    const part = attr(p, 'data-part');
    if (part in parts) parts[part]++; else { parts.other++; errors.push(`data-part 누락/미지원: ${part}`); }
    const d = attr(p, 'd') || '';
    cmds += (d.match(/[MLHVCSQTAZ]/gi) || []).length;
    const fill = attr(p, 'fill') || '';
    if (part === 'main') {
      if (!/^var\(--c-[a-z]+,#[0-9A-Fa-f]{6}\)$/.test(fill)) errors.push(`main fill 은 var(--c-*,#hex) 여야 함: ${fill}`);
      if (!/vector-effect="non-scaling-stroke"/.test(p)) warns.push('main 에 vector-effect 없음');
    }
    if (part === 'shade' || part === 'shadow') {
      if (!/^rgba\(0,0,0,\.\d+\)$/.test(fill)) errors.push(`${part} fill 은 rgba(0,0,0,.nn) 여야 함: ${fill}`);
      if (!/stroke="none"/.test(p)) warns.push(`${part} 에 stroke="none" 없음`);
    }
    if (part === 'detail' && fill !== 'none') errors.push('detail fill 은 none 이어야 함');
  }
  if (spec) for (const v of spec.vars) if (!src.includes(`var(${v},`)) errors.push(`${v} 변수 미사용`);

  if (/<(linear|radial)Gradient\b/.test(src) && attr(g, 'data-gradient') !== 'ok') errors.push('그라데이션 사용 (data-gradient="ok" 플래그 없음)');
  if (/<(image|filter|foreignObject|text|style|script)\b/.test(src)) errors.push('허용되지 않는 요소 (image/filter/foreignObject/text/style/script)');
  if (/\sid="/.test(src)) errors.push('id 속성 금지 (인라인 중복 방지)');
  if (/xlink:href|href=/.test(src)) errors.push('외부 참조 금지');
  if (/<\?xml/.test(src)) warns.push('XML 선언은 생략 권장 (바이트 절약)');
  if (bytes > BUDGET_FILE) errors.push(`파일 ${bytes} B > 예산 ${BUDGET_FILE} B`);
  if (parts.main === 0) errors.push('main 파트 없음');

  return {
    file: `${name}.svg`, slot, type: attr(g, 'data-type'), fit: attr(g, 'data-fit'), length: attr(g, 'data-length'),
    labelKo: label, paths: paths.length, parts, cmds, bytes,
    shade: parts.shade > 0 || parts.shadow > 0, details: parts.detail > 0,
    detailOptional: [...new Set(paths.map((p) => attr(p, 'data-detail')).filter(Boolean))],
    errors, warns,
  };
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.svg')).sort((a, b) => {
  const za = Z_ORDER.indexOf(check(join(DIR, a)).slot), zb = Z_ORDER.indexOf(check(join(DIR, b)).slot);
  return za - zb || a.localeCompare(b);
});
const rows = files.map((f) => check(join(DIR, f)));
const total = rows.reduce((s, r) => s + r.bytes, 0);
const totalPaths = rows.reduce((s, r) => s + r.paths, 0);
const errCount = rows.reduce((s, r) => s + r.errors.length, 0);
const warnCount = rows.reduce((s, r) => s + r.warns.length, 0);
const totalErr = total > BUDGET_TOTAL ? [`총 ${total} B > 예산 ${BUDGET_TOTAL} B`] : [];

if (args.has('--json')) {
  console.log(JSON.stringify({ rows, total, totalPaths, errCount, warnCount, totalErr }, null, 2));
} else {
  const pad = (s, n, r) => (r ? String(s).padStart(n) : String(s).padEnd(n));
  const head = `${pad('file', 22)} ${pad('slot', 7)} ${pad('type', 8)} ${pad('fit', 8)} ${pad('len', 8)} ${pad('paths', 5, 1)} ${pad('m/s/d', 7, 1)} ${pad('cmds', 5, 1)} ${pad('bytes', 6, 1)}  status`;
  console.log(head); console.log('-'.repeat(head.length));
  for (const r of rows) {
    const status = r.errors.length ? `ERR ${r.errors.join('; ')}` : r.warns.length ? `warn ${r.warns.join('; ')}` : 'ok';
    console.log(`${pad(r.file, 22)} ${pad(r.slot, 7)} ${pad(r.type, 8)} ${pad(r.fit || '-', 8)} ${pad(r.length || '-', 8)} ${pad(r.paths, 5, 1)} ${pad(`${r.parts.main}/${r.parts.shade + r.parts.shadow}/${r.parts.detail}`, 7, 1)} ${pad(r.cmds, 5, 1)} ${pad(r.bytes, 6, 1)}  ${status}`);
  }
  console.log('-'.repeat(head.length));
  console.log(`layers ${rows.length} · paths ${totalPaths} · total ${total} B (${(total / 1024).toFixed(1)} KB, budget ${BUDGET_TOTAL / 1024} KB) · max file ${Math.max(...rows.map((r) => r.bytes))} B (budget ${BUDGET_FILE} B) · errors ${errCount} · warnings ${warnCount}`);
  for (const e of totalErr) console.log(`ERR ${e}`);
}

if (args.has('--write-index') && errCount === 0 && !totalErr.length) {
  const index = {
    viewBox: VIEWBOX,
    zOrder: Z_ORDER,
    cropClip: {
      bottom: 'rect 0 0 200 338 (clipPath id=clip-crop)',
      top: 'rect 0 0 200 184 (clipPath id=clip-top-crop)',
      topTuck: 'rect 0 0 200 176 (clipPath id=clip-top-tuck) — 벨트 노출용',
    },
    colorVars: ['--c-skin', '--c-hair', '--c-top', '--c-bottom', '--c-shoes', '--c-sole', '--c-outer', '--c-belt', '--c-watch', '--c-metal', '--c-socks', '--c-bag', '--c-cap', '--c-scarf'],
    parts: ['main', 'shade', 'detail', 'shadow'],
    totalPaths, totalBytes: total,
    layers: rows.map((r) => ({
      file: r.file, slot: r.slot, type: r.type, fit: r.fit, length: r.length, labelKo: r.labelKo,
      paths: r.paths, bytes: r.bytes, shade: r.shade, details: r.details,
      ...(r.detailOptional.length ? { optionalDetails: r.detailOptional } : {}),
    })),
  };
  writeFileSync(join(DIR, 'index-v2.json'), JSON.stringify(index, null, 2) + '\n', 'utf8');
  console.log(`index-v2.json 갱신 (${rows.length} layers)`);
}

process.exit(errCount || totalErr.length ? 1 : 0);
