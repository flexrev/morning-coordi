// Phase 6-B-3 Fixer B — 액세서리 크기 게이트(U6-02) · 오늘 라벨(U6-01) · 배너 미루기 가드(U6-03·08) · 도움말 폴백(U6-05) · 데이터 분할(게이트 6)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accessoriesForSize, CARD_ACC_SLOTS, ACC_FULL_SIZE, accessorySlot } from '../../src/ui/typeToLayer.js';
import { classicLabels, classicOrder, todayIndex } from '../../src/ui/today.js';
import { guardStep, bannerDecision } from '../../src/ui/fit.js';
import { labelField, STYLE_HELP, OCC_HELP, shortfallText, styleOccasionCards, occasionChipIds, OCC_PRIMARY, OCC_MORE } from '../../src/ui/styleText.js';

// ---------------------------------------------------------------- U6-02 액세서리 크기 게이트
const ACC = [
  { group: 'belt', id: 'beltBrown', color: 'brown' },
  { group: 'socks', id: 'socksGrey', color: 'midGrey' },
  { group: 'bag', id: 'backpackBlack', type: 'backpack', color: 'black' },
  { group: 'cap', id: 'capNavy', color: 'navy' },
  { group: 'scarf', id: 'scarfBurgundy', color: 'burgundy' },
  { group: 'watch', id: 'watchLeather', color: 'brown' },
  { category: 'bag', type: 'tote', color: 'oatmeal' },           // items[] 형태
  { type: 'socksNoShow', color: 'white' },                        // 노쇼 양말 → 슬롯 없음
];

test('카드(size < 240)는 벨트·양말만 그린다 — 캡·스카프·가방·시계 제외', () => {
  for (const size of [118, 120, 239]) {
    const kept = accessoriesForSize(ACC, size);
    assert.deepEqual(kept.map(accessorySlot), ['belt', 'socks'], `size ${size}`);
    assert.ok(kept.every((a) => CARD_ACC_SLOTS.has(accessorySlot(a))));
  }
});

test('S5·공유(size ≥ 240)는 전부 그린다 (노쇼 양말은 원래 슬롯이 없어 렌더러가 건너뜀)', () => {
  assert.equal(ACC_FULL_SIZE, 240);
  for (const size of [240, 300, 400, 920]) {
    assert.equal(accessoriesForSize(ACC, size).length, ACC.length, `size ${size}`);
  }
});

test('빈 입력·null 항목에 안전', () => {
  assert.deepEqual(accessoriesForSize(undefined, 120), []);
  assert.deepEqual(accessoriesForSize([null, undefined, { group: 'belt' }], 120).length, 1);
});

// ---------------------------------------------------------------- U6-01 오늘 라벨
test('오늘 카드는 "오늘의 추천"(번호 없음), 나머지는 "다른 클래식 k/2" — ref 인덱스 기준', () => {
  assert.deepEqual(classicLabels(3, 1), ['다른 클래식 1/2', '오늘의 추천', '다른 클래식 2/2']);
  assert.deepEqual(classicLabels(3, 0), ['오늘의 추천', '다른 클래식 1/2', '다른 클래식 2/2']);
  assert.deepEqual(classicLabels(3, 2), ['다른 클래식 1/2', '다른 클래식 2/2', '오늘의 추천']);
  assert.deepEqual(classicLabels(2, 1), ['다른 클래식 1/1', '오늘의 추천']);
  assert.deepEqual(classicLabels(1, 0), ['오늘의 추천']);
});

test('오늘 카드가 없으면(ti<0) "클래식 i/n", 0장이면 빈 배열', () => {
  assert.deepEqual(classicLabels(3, -1), ['클래식 1/3', '클래식 2/3', '클래식 3/3']);
  assert.deepEqual(classicLabels(0, 0), []);
});

test('표시 순서: 오늘 카드 먼저, 나머지는 원래 순서 — 라벨과 todayIndex 가 일치', () => {
  assert.deepEqual(classicOrder(3, 1), [1, 0, 2]);
  assert.deepEqual(classicOrder(3, -1), [0, 1, 2]);
  const base = { category: 'bottom', color: 'indigo' };
  const ti = todayIndex(base, 'springFall', 3, new Date(2026, 9, 20));
  const labels = classicLabels(3, ti);
  assert.equal(labels[classicOrder(3, ti)[0]], '오늘의 추천');
  assert.ok(labels.every((l) => l.length <= 10), '어느 폭에서도 안 잘리는 길이');
});

// ---------------------------------------------------------------- U6-03 · U6-08 높이 가드
test('bannerDecision: 위에 두면 넘침 → below, 아래에서도 하단 뒤로 → defer, 들어가면 keep', () => {
  assert.equal(bannerDecision({ cardsBottom: 642, bottomTop: 670, bannerBottom: 0 }), 'keep');
  assert.equal(bannerDecision({ cardsBottom: 700, bottomTop: 670, bannerBottom: 0 }), 'below');
  assert.equal(bannerDecision({ cardsBottom: 642, bottomTop: 670, bannerBottom: 698, below: true }), 'defer');
  assert.equal(bannerDecision({ cardsBottom: 584, bottomTop: 638, bannerBottom: 634, below: true }), 'keep');
});

test('guardStep 순서: 배너 아래로 → tight → 배너 미루기 → 컴팩트 → give-up (겹침·스크롤 0)', () => {
  const m = (o) => ({ cardsBottom: 700, bottomTop: 670, hasBanner: true, bannerBelow: false, bannerBottom: 0, tight: false, compact: false, ...o });
  assert.equal(guardStep(m({ cardsBottom: 642, bannerBelow: false })), 'ok');
  assert.equal(guardStep(m()), 'banner-below');
  // 배너를 내렸더니 배너가 하단 뒤로 (375: 650–698 > 670) → 먼저 여백 줄이기
  assert.equal(guardStep(m({ cardsBottom: 642, bannerBelow: true, bannerBottom: 698 })), 'tight');
  // 여백을 줄여도 안 들어가면 배너를 다음 방문으로
  assert.equal(guardStep(m({ cardsBottom: 642, bannerBelow: true, bannerBottom: 682, tight: true })), 'defer-banner');
  // 배너 없이 2px 초과(360 + 바로가기 줄) → tight 로 해결, 컴팩트는 그다음
  assert.equal(guardStep(m({ hasBanner: false, cardsBottom: 640, bottomTop: 638 })), 'tight');
  assert.equal(guardStep(m({ hasBanner: false, cardsBottom: 640, bottomTop: 638, tight: true })), 'compact');
  assert.equal(guardStep(m({ hasBanner: false, cardsBottom: 640, bottomTop: 638, tight: true, compact: true })), 'give-up');
  assert.equal(guardStep(m({ hasBanner: false, cardsBottom: 624, bottomTop: 638, tight: true })), 'ok');
});

// ---------------------------------------------------------------- U6-05 도움말 폴백 · U6-06 엔진 결과 · 상황 칩 축소
test('labelField: labels.ko 행이 있으면 그 값, 없으면 내장 폴백(4 스타일 + 5 상황)', () => {
  const rows = [{ id: 'style.ivy', label: '아이비(클래식)', shortLabel: '아이비', help: '옥스포드·치노·페니 로퍼·네이비 블레이저' }, { id: 'occasion.work', label: '출근' }];
  assert.equal(labelField(rows, 'style', 'ivy', 'shortLabel'), '아이비');
  assert.equal(labelField(rows, 'style', 'ivy', 'help'), '옥스포드·치노·페니 로퍼·네이비 블레이저');
  assert.equal(labelField(rows, 'occasion', 'work', 'shortLabel'), '출근', 'shortLabel 없으면 label');
  assert.equal(labelField(rows, 'occasion', 'work', 'help'), OCC_HELP.work, 'help 없으면 폴백');
  assert.equal(labelField(null, 'style', 'bizcasual', 'help'), STYLE_HELP.bizcasual);
  assert.equal(labelField(undefined, 'style', 'minimal', 'shortLabel'), '미니멀');
  assert.equal(labelField([], 'occasion', 'formal', 'shortLabel'), '격식');
  assert.equal(Object.keys(STYLE_HELP).length, 4);
  assert.equal(Object.keys(OCC_HELP).length, 5);
  for (const v of [...Object.values(STYLE_HELP), ...Object.values(OCC_HELP)]) assert.doesNotMatch(v, /!|요$/, '느낌표·반말 없음');
});

test('shortfallText: 반말·느낌표 없이 한 줄', () => {
  const t = shortfallText('격식');
  assert.equal(t, '격식에 맞는 조합이 더 없어요 — 상황을 바꿔 보세요');
  assert.doesNotMatch(t, /!/);
});

test('styleOccasionCards: 엔진 shortfall 플래그 우선, 없으면 relaxed·3장 미만으로 판단', () => {
  const c = (id) => ({ outfit: { id, items: [] } });
  assert.deepEqual(styleOccasionCards({ classic: [c(1), c(2), c(3)], shortfall: true }).shortfall, true);
  assert.deepEqual(styleOccasionCards({ classic: [c(1)], shortfall: false }).shortfall, false, '엔진이 false 면 false');
  assert.deepEqual(styleOccasionCards({ classic: [c(1), c(2), c(3)], applied: { shortfall: true } }).shortfall, true);
  assert.deepEqual(styleOccasionCards({ classic: [c(1), c(2), c(3)], applied: { relaxed: [] } }).shortfall, false);
  assert.deepEqual(styleOccasionCards({ classic: [c(1), c(2), c(3)], applied: { relaxed: ['avoidSoft'] } }).shortfall, true);
  assert.deepEqual(styleOccasionCards({ classic: [c(1), c(2)], applied: { relaxed: [] } }).shortfall, true);
  assert.deepEqual(styleOccasionCards(null), { cards: [], shortfall: true });
});

test('occasionChipIds: 출근·주말·데이트 + "더"(운동·격식); 고른 상황이 더 쪽이면 펼침', () => {
  const all = ['work', 'weekend', 'date', 'active', 'formal'];
  assert.deepEqual(occasionChipIds(all), { shown: OCC_PRIMARY, hidden: OCC_MORE });
  assert.deepEqual(occasionChipIds(all, { more: true }).shown, all);
  assert.deepEqual(occasionChipIds(all, { current: 'formal' }).shown, all);
  assert.deepEqual(occasionChipIds(['weekend', 'formal']), { shown: ['weekend'], hidden: ['formal'] });
  assert.deepEqual(occasionChipIds([]), { shown: [], hidden: [] });
});

// ---------------------------------------------------------------- 게이트 6 데이터 분할
test('dataCore ∪ expansion === src/data/index.js data (키·참조 동일)', async () => {
  const [{ data: full }, { data: core }, { expansion }] = await Promise.all([
    import('../../src/data/index.js'), import('../../src/ui/dataCore.js'), import('../../src/data/expansion.js'),
  ]);
  const merged = { ...core, ...expansion };
  assert.deepEqual(Object.keys(merged).sort(), Object.keys(full).sort());
  for (const k of Object.keys(full)) assert.equal(merged[k], full[k], `${k} 가 같은 JSON 모듈`);
  for (const k of Object.keys(expansion)) assert.ok(!(k in core), `${k} 는 확장에만`);
});
