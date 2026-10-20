// 설명 문구 — engine-spec.md 4절 + gate-2 3절 8항(캡션). 구현: C2.
// 한국어 문장은 labels.ko.json의 explain.* 우선, 아래는 폴백.
export const FALLBACK = {
  'explain.classic': '클래식',
  'explain.universal': '누구나 안전한 기본 조합',
  'explain.variation': '변주',
  'explain.sources2': '출처 {n}개 이상',
  'explain.toneOnTone': '톤온톤 ({tone})',
  'explain.analogous': '유사색',
  'explain.complementary': '보색(탁한)',
  'explain.achromatic': '무채색 조합',
  'explain.toneCross': '{from}+{to} 조합 (+1)',
  'explain.seasonOut': '{color|은는} {season}에 어색해요 ({delta})',
  'explain.seasonItem': '{item|은는} {season}용이 아니에요',
  'explain.formalityGap': '격식 차이 {gap}단계 ({hi} ↔ {lo})',
  'explain.fourColors': '색이 4개 이상',
  'explain.sameColor': '상·하의 같은 색',
  'explain.fitScore': '핏 밸런스 {score}/5',
  'explain.shoeScore': '신발 조합 {score}/5',
  'explain.matScore': '소재 궁합 {score}/5',
  'explain.matClash': '{a}+{b|은는} 소재가 안 맞아요',
  'explain.adventurous': '모험적인 조합',
  'explain.avoid': '피하는 조합: {reason}',
  'explain.disputed': '의견이 갈리는 조합',
  'explain.ruleMissing': '규칙 없음(기본 3)',
  'explain.adjust': '{reason} ({delta})',
  'explain.shoeLength': '바지 기장과 신발이 안 맞아요',
  'explain.layerOver': '{season}에 겹이 너무 많아요 (−2)',
  'explain.accentAccent': '포인트 컬러가 둘 ({a}+{b}) (−2)',
  'explain.outerScore': '아우터 조합 {score}/5',
  'explain.lengthBlock': '기장 조합이 맞지 않아요',
  'explain.seasonBlock': '{season}에 맞지 않는 아이템이 많아요',
  // Phase 6-B (CX) — 스타일·상황·소품·패턴·레이어. S3 카드 줄에는 올리지 않는다(candidate.explain 불변, candidate.styleExplain·accessories에만)
  'explain.style.boost': '{style} 스타일 {delta}',
  'explain.style.tag': '{style} 느낌',
  'explain.occasion.adj': '{occasion}에 {delta}',
  'explain.occasion.window': '{occasion} 격식 창 밖 아이템 {n}개 ({delta})',
  'explain.occasion.target': '{occasion}에 딱 맞는 격식 (+0.2)',
  'explain.occasion.relaxed': '{occasion} 조건을 일부 완화했어요 ({stages})',
  'explain.acc': '{accessory}: {reason}',
  'explain.pattern': '{reason} ({delta})',
  'explain.midLayer': '{mid|은는} {reason} ({score}/5)',
  'explain.midLength': '{mid|이가} {outer}보다 길어요',
  'explain.midWeight': '{mid|이가} {outer}보다 두꺼워요',
  'explain.midFormality': '{mid} 격식이 베이스·아우터와 안 맞아요',
  'explain.twoOuter': '{inner}+{outer}: {reason} ({score}/5)',
  'explain.twoOuterLength': '안쪽 {inner|이가} 바깥 {outer}보다 짧지 않아요 ({delta})',
  'explain.layerScore': '레이어링 {score}/5',
};

// 파라미터별 라벨 네임스페이스 (id → 한국어)
const PARAM_NS = { color: 'color', a: 'color', b: 'color', season: 'season', tone: 'tone', from: 'tone', to: 'tone', shoe: 'shoe', outer: 'outerType', inner: 'outerType', style: 'style', occasion: 'occasion', pattern: 'pattern', mid: 'midType', accessory: 'accessory' };
const PARAM_NS_MAT = { a: 'material', b: 'material' };

const fmtDelta = (d) => (typeof d !== 'number' ? String(d) : d > 0 ? `+${d}` : d < 0 ? `−${Math.abs(d)}` : '0');

/** 조사 선택 (P3-16 ①): 템플릿 `{color|은는}` → 치환된 단어의 받침 유무로 은/는·이/가·을/를·과/와 결정. 한글이 아니면 뒤 조사 */
const JOSA = { '은는': ['은', '는'], '이가': ['이', '가'], '을를': ['을', '를'], '과와': ['과', '와'], '으로로': ['으로', '로'] };
export function josa(word, kind) {
  const pair = JOSA[kind];
  if (!pair) return '';
  const last = String(word).replace(/[\s)\]]+$/, '').slice(-1);
  const code = last.charCodeAt(0);
  if (!(code >= 0xac00 && code <= 0xd7a3)) return pair[1];
  const jong = (code - 0xac00) % 28;
  if (jong === 0) return pair[1];
  if (kind === '으로로' && jong === 8) return pair[1]; // ㄹ 받침 + 로
  return pair[0];
}

/** @returns {string}  한 개의 Reason → 문장 (폴백 포함) */
export function formatReason(reason, labels) {
  const L = labels ?? {};
  const tpl = L[reason.key] ?? FALLBACK[reason.key] ?? reason.key;
  const params = reason.params ?? {};
  const ns = reason.key === 'explain.matClash' ? { ...PARAM_NS, ...PARAM_NS_MAT } : PARAM_NS;
  return tpl.replace(/\{(\w+)(?::\+d)?(?:\|([가-힣]+))?\}/g, (_, k, j) => {
    if (k === 'delta') return fmtDelta(reason.delta ?? params.delta);
    const v = params[k];
    if (v === undefined || v === null) return '';
    if (typeof v === 'number') return String(v);
    const n = ns[k];
    const word = (n && L[`${n}.${v}`]) ?? v;
    return j ? word + josa(word, j) : word;
  });
}

const PRIORITY = ['explain.classic', 'explain.universal', 'explain.variation', 'explain.toneOnTone', 'explain.complementary', 'explain.analogous', 'explain.achromatic', 'explain.toneCross', 'explain.sources2'];
const SEV = { block: 0, warn: 1, info: 2 };
// P3-16 ③: '규칙 없음(기본 3)'은 디버그 정보 — 맨 뒤 (explainShort·카드 이유에서 제외)
const LAST = ['explain.ruleMissing'];
const rank = (r) => { if (LAST.includes(r.key)) return 1000; const i = PRIORITY.indexOf(r.key); return i >= 0 ? i : 100 + SEV[r.severity] * 10; };
// P3-19: 격차 4(info로 강등된 것)는 allClassic 카드 문구에서 숨김 — score.reasons에는 남아 S6가 쓴다
const hidden = (r) => r.key === 'explain.formalityGap' && r.severity === 'info';

/** @returns {string[]}  한국어 문장 배열, 우선순위 정렬 (classic/universal → 톤·색상환 → 출처 → 경고·차단 → 상세) */
export function explainScore(score, labels, outfit) {
  const reasons = score.reasons.filter((r) => !hidden(r));
  if (outfit?.universal) reasons.unshift({ key: 'explain.universal', severity: 'info' });
  if (outfit?.tags?.includes('variation') && !reasons.some((r) => r.key === 'explain.variation')) reasons.push({ key: 'explain.variation', severity: 'info' });
  const sorted = reasons.map((r, i) => [rank(r), i, r]).sort((x, y) => x[0] - y[0] || x[1] - y[1]).map((x) => x[2]);
  const out = [];
  for (const r of sorted) {
    const s = formatReason(r, labels);
    if (s && !out.includes(s)) out.push(s);
  }
  return out;
}

/** Quick 카드용 앞 2개 (규칙 없음 info 제외) */
export function explainShort(score, labels, outfit) {
  const skip = new Set(LAST.map((k) => formatReason({ key: k }, labels)));
  return explainScore(score, labels, outfit).filter((s) => !skip.has(s)).slice(0, 2);
}

/** 아이템 캡션: 품목명 + (품목명에 소재가 없을 때만) 소재 — gate-2 3절 8항 */
export function itemCaption(item, labels, index) {
  const L = labels ?? {};
  let name = item.itemName;
  if (item.category === 'shoes' || !item.material) return name;
  const implied = item.category === 'top' && index?.topTypes?.get(item.itemType)?.material === item.material;
  const implied2 = (item.category === 'outer' && index?.outerTypes?.get(item.itemType)?.material === item.material) || (item.category === 'mid' && index?.midTypes?.get(item.itemType)?.material === item.material);
  const mLabel = L[`material.${item.material}`] ?? item.material;
  const mShort = index?.labels?.get(`material.${item.material}`)?.shortLabel ?? mLabel;
  const parts = [mLabel, mShort, ...mLabel.split(/[\s/]/).filter((p) => p.length >= 2)].filter(Boolean); // '울'(1자)은 전체 라벨로만 비교
  if (implied || implied2 || parts.some((p) => name.includes(p))) return name;
  return `${name}(${mShort})`;
}

/** 코디 캡션: "흰 티 · 인디고 데님 · 흰 스니커즈" */
export function captionOutfit(outfit, labels, index) {
  const order = { top: 0, mid: 1, bottom: 2, shoes: 3, outer: 4 };
  return [...outfit.items].sort((a, b) => order[a.category] - order[b.category] || (a.layer ?? 0) - (b.layer ?? 0)).map((i) => itemCaption(i, labels, index)).join(' · ');
}
