// 스모크 테스트 — 데이터가 로드되고 엔진이 생성되는지. 상세는 tests/engine.test.js (E-01~E-20).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { data } from '../src/data/index.js';
import { createEngine, recommend } from '../src/engine/index.js';

test('data loads all 16 files', () => {
  const keys = ['enums', 'colors', 'toneRules', 'colorRules', 'materials', 'matRules', 'fitRules', 'lengthRules', 'shoes', 'shoeRules', 'formality', 'outerRules', 'layerRules', 'adjust', 'outfits', 'labels'];
  for (const k of keys) assert.ok(data[k], k);
  assert.equal(data.colors.length, 32);
});

test('createEngine rejects empty data and recommend rejects bad query', () => {
  assert.throws(() => createEngine({}), /data/);
  const e = createEngine(data);
  assert.throws(() => recommend(e.index, { base: {}, season: 'summer' }), /base/);
  assert.throws(() => e.recommend({ base: { category: 'top', color: 'neon' }, season: 'summer', mode: 'quick' }), /neon/);
});
