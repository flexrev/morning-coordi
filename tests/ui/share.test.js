// share.js — 순수 레이아웃(캔버스 없이): 1080×1350, 줄바꿈, 파일명. 캔버스 PNG 생성은 DOM 이 필요해 브라우저 QA 항목.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shareLayout, wrapCaption, fileName, W, H, BG, shareCapability } from '../../src/ui/share.js';

// 글자당 폭 = px*0.55 (한글은 px), 공백·점은 0.3
const measure = (s, px) => [...s].reduce((w, ch) => w + (/[가-힣]/.test(ch) ? px : /[ ·]/.test(ch) ? px * 0.3 : px * 0.55), 0);

test('캔버스 크기·배경 상수', () => {
  assert.equal(W, 1080);
  assert.equal(H, 1350);
  assert.equal(BG, '#0E0F12');
});

test('wrapCaption: "·" 경계에서 접고 3줄을 넘기면 말줄임', () => {
  const m = (s) => measure(s, 44);
  const lines = wrapCaption('화이트 티셔츠 · 인디고 데님 · 흰 스니커즈', m, 480, 3);
  assert.ok(lines.length >= 2 && lines.length <= 3);
  for (const l of lines) assert.ok(m(l) <= 480, l);
  const long = wrapCaption(Array.from({ length: 8 }, () => '오트밀 울 니트').join(' · '), m, 300, 3);
  assert.equal(long.length, 3);
  assert.ok(long[2].endsWith('…'));
});

test('shareLayout: 실루엣 460×920 왼쪽, 글은 오른쪽, 워드마크·날짜 아래', () => {
  const L = shareLayout({ caption: '오트밀 울 니트 · 인디고 데님 · 브라운 페니 로퍼', label: '클래식 2/3 · 봄가을', dots: ['#CFC4B4', '#2C4270', '#8B5A2B'], date: '2026.10.19' }, measure);
  assert.deepEqual(L.sil, { x: 72, y: 160, w: 460, h: 920 });
  assert.ok(L.caption.x > L.sil.x + L.sil.w, '글은 실루엣 오른쪽');
  assert.ok(L.caption.lines.length >= 1 && L.caption.lines.length <= 3);
  assert.equal(L.dots.length, 3);
  assert.ok(L.dots.every((d) => d.r === 36 && d.x + d.r <= W));
  assert.ok(L.label.y > L.caption.y);
  assert.ok(L.mark.y < H && L.date.x > L.mark.x);
  assert.equal(L.date.text, '2026.10.19');
  assert.ok(L.icon.x + L.icon.size <= W && L.icon.y + L.icon.size <= H);
});

test('fileName: 아침코디-YYYY-MM-DD.png', () => {
  assert.equal(fileName(new Date(2026, 9, 19)), '아침코디-2026-10-19.png');
});

test('shareCapability: navigator.share 없음 → none', () => {
  const nav = globalThis.navigator;
  Object.defineProperty(globalThis, 'navigator', { value: {}, configurable: true });
  assert.equal(shareCapability(null), 'none');
  Object.defineProperty(globalThis, 'navigator', { value: { share: () => {} }, configurable: true });
  assert.equal(shareCapability(null), 'text');
  Object.defineProperty(globalThis, 'navigator', { value: nav, configurable: true });
});
