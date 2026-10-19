// 공통 유틸 — build-data 모듈용
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const readDoc = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

export const camel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

/** 마크다운 표 행 → 셀 배열(앞뒤 | 제거, trim) */
export function splitRow(line) {
  const t = line.trim();
  if (!t.startsWith('|')) return null;
  const cells = t.slice(1, t.endsWith('|') ? -1 : undefined).split('|').map((c) => c.trim());
  return cells;
}
export const isSepRow = (cells) => cells.every((c) => /^:?-{2,}:?$/.test(c));

/** lines[start..] 에서 첫 표를 읽어 {rows, end} 반환 (헤더·구분선 제외) */
export function readTable(lines, start) {
  let i = start;
  while (i < lines.length && !lines[i].trim().startsWith('|')) i++;
  const header = splitRow(lines[i]);
  i++;
  if (i < lines.length) {
    const sep = splitRow(lines[i]);
    if (sep && isSepRow(sep)) i++;
  }
  const rows = [];
  while (i < lines.length && lines[i].trim().startsWith('|')) {
    rows.push(splitRow(lines[i]));
    i++;
  }
  return { header, rows, end: i };
}

export const SEASON_ORDER = ['springFall', 'summer', 'winter'];
export const sortSeasons = (arr) => [...new Set(arr)].sort((a, b) => SEASON_ORDER.indexOf(a) - SEASON_ORDER.indexOf(b));
export const uniqSorted = (arr) => [...new Set(arr)].sort();

/** 계절 표기(한국어/R2 id) → id 배열 */
export function seasonsFrom(text) {
  const t = text.replace(/\s/g, '');
  if (/연중|사계절/.test(t)) return [...SEASON_ORDER];
  const out = [];
  if (/봄가을|spring_fall|springFall|늦가을|가을/.test(t)) out.push('springFall');
  if (/여름|summer/.test(t)) out.push('summer');
  if (/겨울|winter/.test(t)) out.push('winter');
  return sortSeasons(out);
}

/** 결정적 JSON 직렬화: 키 순서는 호출자가 만든 순서 유지, 2칸 들여쓰기 */
export function writeJson(rel, value) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 1) + '\n', 'utf8');
  return Buffer.byteLength(JSON.stringify(value, null, 1) + '\n', 'utf8');
}

export class Log {
  constructor() { this.items = []; }
  add(kind, msg) { this.items.push({ kind, msg }); }
  byKind(kind) { return this.items.filter((i) => i.kind === kind).map((i) => i.msg); }
}
