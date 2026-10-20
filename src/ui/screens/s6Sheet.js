// S6 상세 시트 — 핏 · 소재 · 신발 스타일 · 기장 · 의견 갈림. 대안 탭 → 그 변주 카드(S5)로 교체, 시트 닫힘.
import { h } from '../dom.js';
import { sheet, dot, isDisputed, userReasons } from '../components.js';
import * as nav from '../nav.js';
import { get as getState, getResult, findCandidate } from '../state.js';

const LEN_HELP = {
  crop: '크롭 = 발목이 보이는 길이',
  nobreak: '노브레이크 = 밑단이 신발에 닿을락 말락',
  half: '하프 브레이크 = 밑단이 신발에 살짝 접힘',
  full: '풀 브레이크 = 밑단이 신발 위로 한 번 접힘',
};
const FIT_ALT = {
  slim: ['regular'], regular: ['slim', 'loose'], loose: ['regular', 'oversized'], oversized: ['loose'],
};

export function s6Sheet(ref, kind) {
  const st = getState();
  const cat = st.catalog;
  const found = findCandidate(ref);
  if (!found) return sheet({ title: '상세', body: h('p', { class: 'sheet__note', text: '정보가 없어요' }) });
  const { candidate } = found;
  const items = candidate.outfit.items;
  const top = items.find((i) => i.category === 'top');
  const bottom = items.find((i) => i.category === 'bottom');
  const shoes = items.find((i) => i.category === 'shoes');
  const outer = items.find((i) => i.category === 'outer');
  const reasons = candidate.score?.reasons || [];

  if (kind === 'shoe') return shoeSheet({ ref, candidate, shoes, bottom, st, cat });
  if (kind === 'disputed') {
    // 실제 엔진: reasons[].key === 'explain.disputed', params {a, b, note}(색 쌍 + 규칙 note). 데이터 코디는 outfit.note 도 있다.
    const r = reasons.find((x) => x.key === 'explain.disputed');
    const pair = r?.params?.a && r?.params?.b ? `${cat.label(`color.${r.params.a}`)} + ${cat.label(`color.${r.params.b}`)}` : '';
    const note = r?.params?.note || candidate.outfit.note || '';
    const detail = [pair, note].filter(Boolean).join(' — ');
    return sheet({ title: '의견 갈림', body: [h('p', { class: 'sheet__note', text: detail ? `출처마다 의견이 갈려요 — ${detail}` : '출처마다 의견이 갈려요' }), h('p', { class: 'caption', text: '차단은 아니에요. 그대로 입어도 돼요.' })] });
  }
  if (kind === 'fit') {
    const line = `${top ? cat.label(`fit.top.${top.fit || 'regular'}`) + ' 상의' : ''}${top && bottom ? ' + ' : ''}${bottom ? cat.label(`fit.bottom.${bottom.fit || 'regular'}`) + ' 하의' : ''}`;
    const fitReason = userReasons(candidate).find((s) => /핏/.test(s)); // 점수 '4/5' 는 거른다 (U6-09)
    const alts = alternatives({ st, ref, category: 'top', pick: (it) => it.fit && it.fit !== top?.fit });
    const body = [h('p', { class: 'sheet__note', text: `${line}${fitReason ? ` · ${fitReason}` : ''}` })];
    if (alts.length) {
      body.push(h('p', { class: 'caption', text: '다른 핏' }));
      body.push(...alts.map(altOpt));
    } else if (top) {
      body.push(h('p', { class: 'caption', text: `대안 핏: ${(FIT_ALT[top.fit] || []).map((f) => cat.label(`fit.top.${f}`)).join(' · ') || '없음'} 상의` }));
    }
    return sheet({ title: '핏 밸런스', body });
  }
  if (kind === 'mat') {
    const body = [];
    for (const it of [top, bottom, shoes, outer].filter(Boolean)) {
      if (!it.material) continue;
      const seasons = cat.data.materials?.find?.((m) => m.id === it.material)?.seasons || ['springFall', 'summer', 'winter'];
      body.push(h('div', { class: 'opt' },
        h('span', { class: 'opt__l' }, dot(it), h('span', { text: cat.label(`material.${it.material}`) })),
        h('span', { class: 'seasons', 'aria-label': `어울리는 계절: ${seasons.map((s) => cat.label(`season.${s}`)).join(', ')}` },
          ...['springFall', 'summer', 'winter'].map((s) => h('span', { class: seasons.includes(s) ? 'is-on' : '', text: cat.label(`season.${s}`) })))));
    }
    const matReason = userReasons(candidate).find((s) => /소재/.test(s));
    if (matReason) body.push(h('p', { class: 'sheet__note', text: matReason }));
    const alts = alternatives({ st, ref, category: 'top', pick: (it) => it.material && it.material !== top?.material });
    if (alts.length) { body.push(h('p', { class: 'caption', text: '어울리는 다른 소재' })); body.push(...alts.map(altOpt)); }
    return sheet({ title: '소재 · 계절', body: body.length ? body : h('p', { class: 'sheet__note', text: '소재 정보가 없어요' }) });
  }
  // len
  const body = [];
  if (bottom) body.push(h('p', { class: 'sheet__note', text: LEN_HELP[bottom.length] || cat.label(`length.trouser.${bottom.length}`) }));
  if (top) body.push(h('p', { class: 'sheet__note', text: `${cat.label(`length.top.${top.length || 'regular'}`)} 상의${outer ? ` · ${cat.label(`length.outer.${outer.length || 'regular'}`)} 아우터` : ''}` }));
  if (shoes && bottom) body.push(h('p', { class: 'caption', text: `${cat.itemName(shoes)}와 ${cat.label(`length.trouser.${bottom.length || 'nobreak'}`)}: ${bottom.length === 'crop' ? '발목이 보여 가벼워요' : '깔끔하게 떨어져요'}` }));
  return sheet({ title: '기장', body });
}

/** 변주 목록에서 "같은 카드에서 category만 바꾼" 대안을 모은다 (엔진 결과만 사용) */
function alternatives({ st, ref, category, pick }) {
  const r = getResult();
  const found = findCandidate(ref);
  if (!r || !found) return [];
  const fromId = found.variation ? found.variation.fromOutfitId : found.candidate.outfit.id;
  const cur = found.candidate.outfit.items.find((i) => i.category === category);
  const same = (a, b) => !!a && !!b && a.color === b.color && a.shoeType === b.shoeType && a.itemType === b.itemType && a.material === b.material;
  return (r.variations || [])
    .map((v, i) => ({ v, i }))
    .filter(({ v }) => v.fromOutfitId === fromId && v.swapped.category === category && !same(v.swapped.to, cur) && (!pick || pick(v.swapped.to)))
    .slice(0, 4)
    .map(({ v, i }) => ({ ref: `var.${i}`, item: v.swapped.to, candidate: v.candidate }));
}

function altOpt({ ref, item, candidate }) {
  const cat = getState().catalog;
  const dim = (candidate.score?.final ?? 5) < 3;
  const badge = candidate.outfit.isClassic ? '클래식' : dim ? '비추' : '변주';
  return h('button', {
    class: `opt${dim ? ' is-dim' : ''}`, type: 'button',
    onClick: () => nav.replace(`/outfit/${ref}`),
  }, h('span', { class: 'opt__l' }, dot(item), h('span', { text: cat.itemName(item) }), isDisputed(candidate) ? h('span', { class: 'flag', 'aria-label': '의견 갈림', text: '⚑' }) : null),
  h('span', { class: 'opt__b', text: badge }));
}

function shoeSheet({ ref, candidate, shoes, bottom, st, cat }) {
  const body = [];
  if (shoes) {
    body.push(h('div', { class: 'opt is-now' }, h('span', { class: 'opt__l' }, dot(shoes), h('span', { text: `${cat.itemName(shoes)} (지금)` })), h('span', { class: 'opt__b', text: candidate.outfit.isClassic ? '클래식' : '변주' })));
  }
  const alts = alternatives({ st, ref, category: 'shoes' });
  body.push(...alts.map(altOpt));
  const shoeReason = userReasons(candidate).find((s) => /신발/.test(s)); // '신발 조합 4/5' 제외 (U6-09)
  const fallback = shoes?.shoeType === 'sneakerWhite' ? '가죽형 흰 스니커즈면 슬랙스에도 OK' : '';
  if (shoeReason || fallback) body.push(h('p', { class: 'sheet__note', text: shoeReason || fallback }));
  // 제목은 "신발 스타일" 한 줄, 하의 정보는 본문 첫 줄로 (P1-16 · P2-04)
  if (bottom) body.unshift(h('p', { class: 'caption', text: `${cat.itemName(bottom)} · ${cat.label(`fit.bottom.${bottom.fit || 'regular'}`)} · ${cat.label(`length.trouser.${bottom.length || 'nobreak'}`)}` }));
  return sheet({ title: '신발 스타일', body });
}
