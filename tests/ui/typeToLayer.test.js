// typeToLayer.js — v2 매핑은 index-v2.json 주도, 없는 레이어는 가장 가까운 v2 파일로(절대 v1 아님), 소재·무늬 → pat2-*
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layerFor, patternFor, patternForPrint, accessorySlot, AVAILABLE, Z_ORDER } from '../../src/ui/typeToLayer.js';

test('모든 매핑 결과는 index-v2.json 에 있는 파일이다 (v1 폴백 없음)', () => {
  const items = [
    ...['sneakerWhite', 'running', 'loaferTassel', 'derby', 'chelsea', 'workboot', 'chukka', 'sandal', 'zzz'].map((shoeType) => ({ category: 'shoes', shoeType })),
    ...['slim', 'tapered', 'regular', 'straight', 'wide', null].map((fit) => ({ category: 'bottom', fit })),
    ...['tee', 'poloPique', 'hoodie', 'knitWool', 'oxfordShirt', 'unknown'].flatMap((itemType) => ['slim', 'loose', 'oversized'].map((fit) => ({ category: 'top', itemType, fit }))),
    ...['denimJacket', 'blazer', 'trench', 'shortPuffer', 'longPuffer', 'unknown'].map((itemType) => ({ category: 'outer', itemType })),
    ...['cardigan', 'vest', 'overshirt', 'unknown'].map((itemType) => ({ category: 'mid', itemType })),
    ...['belt', 'watch', 'socks', 'bag', 'cap', 'scarf'].map((category) => ({ category })),
    { category: 'bag', type: 'bagBackpack' }, { category: 'cap', type: 'beanie' },
  ];
  for (const it of items) {
    const l = layerFor(it);
    assert.ok(l && AVAILABLE.has(l.file), `${JSON.stringify(it)} → ${l?.file}`);
    assert.ok(!/^(shoes|top|bottom|outer)-/.test(l.file) || !l.file.includes('v1'));
  }
});

test('로퍼 태슬만 detail=tassel', () => {
  assert.equal(layerFor({ category: 'shoes', shoeType: 'loaferTassel' }).detail, 'tassel');
  assert.equal(layerFor({ category: 'shoes', shoeType: 'loaferPenny' }).detail, undefined);
});

test('아우터가 있으면 상의는 regular 파일 (asset-system 4-3)', () => {
  assert.equal(layerFor({ category: 'top', itemType: 'tee', fit: 'loose' }, { forceRegular: true }).file, 'top-tee-regular');
});

test('zOrder 는 stage·base 로 시작하고 mid 가 top 과 outer 사이', () => {
  assert.equal(Z_ORDER[0], 'stage');
  assert.ok(Z_ORDER.indexOf('mid') > Z_ORDER.indexOf('top') && Z_ORDER.indexOf('mid') < Z_ORDER.indexOf('outer'));
});

test('소재 → pat2-*, 무늬(pattern 필드)가 소재보다 우선', () => {
  assert.equal(patternFor('denimIndigo'), 'pat2-denim');
  assert.equal(patternFor('knitWool'), 'pat2-knit');
  assert.equal(patternFor('knitCashmere'), null);
  assert.equal(patternFor('nylonTech'), 'pat2-ripstop');
  assert.equal(patternFor('tweed'), 'pat2-tweed');
  assert.equal(patternForPrint('breton'), 'pat2-stripe');
  assert.equal(patternForPrint('pinstripe'), 'pat2-pinstripe');
  assert.equal(patternForPrint('gingham'), 'pat2-gingham');
  assert.equal(patternForPrint('plaid'), 'pat2-plaid');
  assert.equal(patternForPrint('houndstooth'), 'pat2-houndstooth');
});

test('accessorySlot: CX AccessoryPick.group · items[].category · type 추론', () => {
  assert.equal(accessorySlot({ group: 'belt', id: 'beltLeather' }), 'belt');
  assert.equal(accessorySlot({ category: 'watch' }), 'watch');
  assert.equal(accessorySlot({ type: 'bagTote' }), 'bag');
  assert.equal(accessorySlot({ id: 'socksNoShow' }), null, '노쇼 양말은 안 보인다');
  assert.equal(accessorySlot({ type: 'tie' }), null);
});
