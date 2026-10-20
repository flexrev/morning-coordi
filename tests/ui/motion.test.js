// motion.js — reduced-motion 판정·viewTransition 폴백·스태거·강등 (DOM 최소 목)
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import * as motion from '../../src/ui/motion.js';

function mockDocument({ vt = null, reduceAttr = false, mediaReduce = false } = {}) {
  const dataset = reduceAttr ? { motion: 'reduce' } : {};
  globalThis.document = { documentElement: { dataset }, startViewTransition: vt || undefined };
  globalThis.matchMedia = (q) => ({ matches: q.includes('reduced-motion') ? mediaReduce : false });
  globalThis.performance = globalThis.performance || { now: () => Date.now() };
  return dataset;
}

beforeEach(() => motion._resetForTest());
afterEach(() => { delete globalThis.document; delete globalThis.matchMedia; });

test('prefersReducedMotion: 설정(data-motion=reduce) 또는 OS 둘 중 하나면 true', () => {
  mockDocument({ reduceAttr: true });
  assert.equal(motion.prefersReducedMotion(), true);
  mockDocument({ mediaReduce: true });
  assert.equal(motion.prefersReducedMotion(), true);
  mockDocument();
  assert.equal(motion.prefersReducedMotion(), false);
});

test('reduced 면 View Transitions 를 호출하지 않고 즉시 교체한다 (길이 0 경로)', async () => {
  let called = 0;
  const vt = () => { called++; return { finished: Promise.resolve() }; };
  mockDocument({ vt, reduceAttr: true });
  let updated = 0;
  await motion.viewTransition(() => { updated++; }, 'fwd');
  assert.equal(updated, 1);
  assert.equal(called, 0, 'startViewTransition 호출 없음');
  assert.equal(motion.supportsVT(), false);
});

test('지원 환경·type=fwd 면 startViewTransition 으로 감싸고 data-nav 를 세웠다 지운다', async () => {
  let seenNav = null;
  const ds = mockDocument({ vt: (cb) => { seenNav = ds.nav; cb(); return { finished: Promise.resolve(), ready: Promise.resolve(), updateCallbackDone: Promise.resolve() }; } });
  let updated = 0;
  await motion.viewTransition(() => { updated++; }, 'fwd');
  assert.equal(updated, 1);
  assert.equal(seenNav, 'fwd');
  assert.equal(ds.nav, undefined, '끝나면 data-nav 제거');
});

test('type=none 이면 전환 없이 update 만', async () => {
  let called = 0;
  mockDocument({ vt: () => { called++; return { finished: Promise.resolve() }; } });
  await motion.viewTransition(() => {}, 'none');
  assert.equal(called, 0);
});

test('예산을 두 번 넘기면 세션 동안 CSS 폴백으로 강등된다', async () => {
  let t = 0;
  globalThis.performance = { now: () => t };
  mockDocument({ vt: (cb) => { cb(); t += 1000; return { finished: Promise.resolve() }; } });
  await motion.viewTransition(() => {}, 'back');
  assert.equal(motion.isDegraded(), false, '1회는 허용');
  await motion.viewTransition(() => {}, 'back');
  assert.equal(motion.isDegraded(), true, '2회째 강등');
  assert.equal(motion.supportsVT(), false);
});

test('stagger: --i 는 0..max-1, 6번째부터 max-1', () => {
  const els = Array.from({ length: 7 }, () => { const vars = {}; return { style: { setProperty: (k, v) => { vars[k] = v; } }, vars }; });
  motion.stagger(els);
  assert.deepEqual(els.map((e) => e.vars['--i']), ['0', '1', '2', '3', '4', '4', '4']);
});

test('setNavHint 는 1회만 소비된다', () => {
  motion.setNavHint('fwd');
  assert.equal(motion.takeNavHint(), 'fwd');
  assert.equal(motion.takeNavHint(), null);
});

test('nextFrame: rAF 가 없어도(백그라운드) setTimeout 으로 1회 실행', async () => {
  delete globalThis.requestAnimationFrame;
  let n = 0;
  motion.nextFrame(() => { n++; }, 5);
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(n, 1);
});
