// today.js — 날짜별 결정적 회전 (ux-enhancement 3-2)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fnv1a, dayNumber, todayIndex, dateLabel, dateStamp, dateSlug } from '../../src/ui/today.js';

const base = { category: 'bottom', color: 'indigo' };

test('fnv1a: 같은 입력 → 같은 출력, 다른 입력 → 다른 출력', () => {
  assert.equal(fnv1a('a|b|c'), fnv1a('a|b|c'));
  assert.notEqual(fnv1a('bottom|indigo|springFall'), fnv1a('bottom|indigo|summer'));
  assert.equal(fnv1a(''), 0x811c9dc5);
});

test('같은 날·같은 기준·계절이면 같은 카드', () => {
  const d1 = new Date(2026, 9, 19, 7, 30);
  const d2 = new Date(2026, 9, 19, 22, 10);
  assert.equal(todayIndex(base, 'springFall', 3, d1), todayIndex(base, 'springFall', 3, d2));
});

test('연속된 날은 반드시 다른 카드 (3장 → 1→2→3→1 순환)', () => {
  const idx = [];
  for (let d = 0; d < 6; d++) idx.push(todayIndex(base, 'springFall', 3, new Date(2026, 9, 19 + d)));
  for (let i = 1; i < idx.length; i++) assert.notEqual(idx[i], idx[i - 1], `day ${i}`);
  assert.deepEqual(new Set(idx.slice(0, 3)).size, 3, '3일이면 3장 전부');
  for (const i of idx) assert.ok(i >= 0 && i < 3);
});

test('todayIndex = (dayNumber + fnv1a(category|color|season)) mod n — 계절·기준마다 다른 출발점', () => {
  const d = new Date(2026, 9, 19);
  for (const season of ['springFall', 'winter']) {
    const seed = fnv1a(`bottom|indigo|${season}`);
    assert.equal(todayIndex(base, season, 3, d), (((dayNumber(d) + seed) % 3) + 3) % 3);
  }
  assert.notEqual(fnv1a('bottom|indigo|springFall') % 3 === fnv1a('top|white|springFall') % 3 && fnv1a('bottom|indigo|springFall') === fnv1a('top|white|springFall'), true);
});

test('클래식이 1장이면 0, 0장이면 -1', () => {
  assert.equal(todayIndex(base, 'summer', 1), 0);
  assert.equal(todayIndex(base, 'summer', 0), -1);
});

test('dayNumber 는 자정에서 바뀐다', () => {
  assert.equal(dayNumber(new Date(2026, 9, 19, 0, 0, 1)), dayNumber(new Date(2026, 9, 19, 23, 59)));
  assert.equal(dayNumber(new Date(2026, 9, 20, 0, 0, 1)), dayNumber(new Date(2026, 9, 19)) + 1);
});

test('날짜 문자열: 10월 19일 · 2026.10.19 · 2026-10-19', () => {
  const d = new Date(2026, 9, 19);
  assert.equal(dateLabel(d), '10월 19일');
  assert.equal(dateStamp(d), '2026.10.19');
  assert.equal(dateSlug(d), '2026-10-19');
});
