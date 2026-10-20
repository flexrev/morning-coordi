// favorites.js + storage.js — 30개 상한·중복 없음·저장소 없을 때 세션 메모리
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// 간단한 localStorage 목 (globalThis.localStorage)
function installStorage() {
  const map = new Map();
  globalThis.localStorage = {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    key: (i) => [...map.keys()][i] ?? null,
    get length() { return map.size; },
  };
  return map;
}

const { default: _unused, ...fav } = await import('../../src/ui/favorites.js');
const storage = await import('../../src/ui/storage.js');
void _unused;

const base = { category: 'bottom', color: 'indigo' };
beforeEach(() => { installStorage(); fav.clear(); fav.resetCache(); });

test('add → has, 같은 id 는 at 만 갱신(중복 없음)', () => {
  fav.add({ id: 'o01', base, season: 'springFall', at: 1 });
  fav.add({ id: 'o01', base, season: 'springFall', at: 2 });
  assert.equal(fav.count(), 1);
  assert.equal(fav.find('o01').at, 2);
  assert.equal(fav.has('o01'), true);
});

test('최신 저장순, 31번째 저장은 가장 오래된 것을 지운다 (evicted=true)', () => {
  for (let i = 0; i < 30; i++) fav.add({ id: `o${i}`, base, season: 'springFall', at: i });
  assert.equal(fav.count(), 30);
  const r = fav.add({ id: 'o30', base, season: 'springFall', at: 100 });
  assert.equal(r.evicted, true);
  assert.equal(fav.count(), 30);
  assert.equal(fav.has('o0'), false, '가장 오래된 o0 제거');
  assert.equal(fav.list()[0].id, 'o30', '맨 앞이 최신');
  assert.equal(JSON.parse(globalThis.localStorage.getItem('mc.v1.favorites')).length, 30);
});

test('toggle: 저장 ↔ 해제', () => {
  assert.equal(fav.toggle({ id: 'x', base, season: 'winter' }).saved, true);
  assert.equal(fav.toggle({ id: 'x', base, season: 'winter' }).saved, false);
  assert.equal(fav.count(), 0);
});

test('저장소가 없어도(localStorage 미지원) 세션 메모리로 동작하고 stored=false 를 돌려준다', () => {
  fav.clear(); fav.resetCache();
  Object.defineProperty(globalThis, 'localStorage', { get() { throw new Error('SecurityError'); }, configurable: true });
  const r = fav.add({ id: 'm1', base, season: 'summer' });
  assert.equal(r.stored, false);
  assert.equal(fav.has('m1'), true, '메모리에는 남는다');
  assert.equal(storage.read('favorites', 'fb'), 'fb');
  assert.equal(storage.write('x', 1), false);
  assert.equal(storage.available(), false);
  delete globalThis.localStorage;
  installStorage();
});

test('잘못된 항목은 걸러진다', () => {
  globalThis.localStorage.setItem('mc.v1.favorites', JSON.stringify([{ id: 1 }, { id: 'ok', base, season: 'summer', at: 1 }, null]));
  fav.resetCache();
  assert.deepEqual(fav.list().map((f) => f.id), ['ok']);
});

test('findInResult: classic·byTone·byStyle·variations 전부 훑는다', () => {
  const c = (id) => ({ outfit: { id } });
  const result = { classic: [c('a')], byTone: [{ tone: 'x', candidates: [c('b')] }], byStyle: [{ style: 's', candidates: [c('c')] }], variations: [{ candidate: c('d') }] };
  for (const id of ['a', 'b', 'c', 'd']) assert.equal(fav.findInResult(result, id)?.outfit.id, id);
  assert.equal(fav.findInResult(result, 'zzz'), null);
});

test('clearAll 은 mc.v1.* 만 지운다', () => {
  globalThis.localStorage.setItem('mc.v1.theme', '"light"');
  globalThis.localStorage.setItem('other', '1');
  storage.clearAll();
  assert.equal(globalThis.localStorage.getItem('mc.v1.theme'), null);
  assert.equal(globalThis.localStorage.getItem('other'), '1');
});
