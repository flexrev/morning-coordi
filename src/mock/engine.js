// 목 엔진 — src/engine/index.js 와 같은 시그니처(createEngine(data) → {recommend, score, explain, index, labels}).
// engine-spec.md 1-2 의 RecommendResult 모양을 그대로 돌려준다. 점수는 그럴듯한 값일 뿐 규칙 계산이 아니다.
// 확장(목에만 있음): result.avoid — colorRules[base].avoid 를 UI 문장으로 편 것. 실제 엔진 결과엔 없다(gap).

export function createEngine(data) {
  const colors = new Map(data.colors.map((c) => [c.id, c]));
  const rules = new Map(data.colorRules.filter((r) => !r.variant).map((r) => [`${r.base}|${r.baseCategory}`, r]));
  const labels = Object.fromEntries((data.labels || []).map((l) => [l.id, l.label]));
  const memo = new Map();

  const tonesOf = (id) => colors.get(id)?.tones || [];
  const seasonsOf = (id) => colors.get(id)?.seasons || [];

  function axis(name, score, weight = 1, reasons = []) { return { axis: name, score, weight, reasons }; }

  /** OutfitScore (engine-spec 1-2) */
  function scoreOutfit(outfit, season) {
    const reasons = [];
    let final = outfit.universal ? 4.8 : outfit.isClassic ? 4.4 : 3.4;
    const top = outfit.items.find((i) => i.category === 'top');
    const bottom = outfit.items.find((i) => i.category === 'bottom');
    if (outfit.flags?.includes('disputed')) { final -= 0.3; reasons.push({ key: 'explain.disputed', severity: 'info', params: { note: outfit.note || '' } }); }
    const out = outfit.items.filter((i) => !seasonsOf(i.color).includes(season));
    if (out.length) { final -= 0.4 * out.length; reasons.push({ key: 'explain.seasonOut', severity: 'warn', params: { color: labels[`color.${out[0].color}`] || out[0].color, season }, delta: -1 }); }
    if (top && bottom) {
      const shared = tonesOf(top.color).filter((t) => tonesOf(bottom.color).includes(t));
      if (shared.length && top.color !== bottom.color) reasons.push({ key: 'explain.toneOnTone', severity: 'info', params: { tone: labels[`tone.${shared[0]}`] || shared[0] } });
      if (top.color === bottom.color) { final -= 0.5; reasons.push({ key: 'explain.sameColor', severity: 'warn', delta: -2 }); }
    }
    if (outfit.universal) reasons.unshift({ key: 'explain.universal', severity: 'info' });
    reasons.unshift({ key: outfit.isClassic ? 'explain.classic' : 'explain.variation', severity: 'info' });
    if ((outfit.sources?.length || 0) >= 2) reasons.push({ key: 'explain.sources2', severity: 'info', params: { n: outfit.sources.length } });
    reasons.push({ key: 'explain.fitScore', severity: 'info', params: { score: 4 } });
    reasons.push({ key: 'explain.shoeScore', severity: 'info', params: { score: outfit.isClassic ? 5 : 3 } });
    final = Math.max(1, Math.min(5, Math.round(final * 100) / 100));
    const colorAxis = axis('color', Math.min(5, final + 0.1), 1.5, reasons.filter((r) => /tone|disputed|seasonOut|sameColor/.test(r.key)));
    return {
      final,
      percent: Math.round(((final - 1) / 4) * 100),
      blocked: false,
      color: colorAxis,
      style: {
        fit: axis('fit', 4), len: axis('len', 4, 0.7), mat: axis('mat', 4), shoe: axis('shoe', outfit.isClassic ? 5 : 3),
        outer: outfit.items.some((i) => i.category === 'outer') ? axis('outer', 4, 0.7) : null,
        season: axis('season', out.length ? 3 : 5, 1.5), adjust: axis('adjust', 0, 1), formality: axis('formality', 5, 1),
      },
      reasons,
      warnings: reasons.filter((r) => r.severity === 'warn'),
      blockReasons: [],
    };
  }

  /** 한국어 문장 (explain.js 폴백과 같은 규칙) */
  const TEXT = {
    'explain.classic': '클래식', 'explain.universal': '누구나 안전한 기본 조합', 'explain.variation': '변주',
    'explain.sources2': '출처 {n}개 이상', 'explain.toneOnTone': '톤온톤 ({tone})', 'explain.disputed': '의견이 갈리는 조합',
    'explain.seasonOut': '{color}는 {season}에 어색해요 (−1)', 'explain.sameColor': '상·하의 같은 색',
    'explain.fitScore': '핏 밸런스 {score}/5', 'explain.shoeScore': '신발 조합 {score}/5',
  };
  function formatReason(r) {
    let t = labels[r.key] || TEXT[r.key] || r.key;
    for (const [k, v] of Object.entries(r.params || {})) t = t.replace(`{${k}}`, k === 'season' ? (labels[`season.${v}`] || { springFall: '봄가을', summer: '여름', winter: '겨울' }[v] || v) : String(v));
    return t;
  }
  function explainScore(score) { return (score.reasons || []).map(formatReason); }
  const candidate = (outfit, season) => { const score = scoreOutfit(outfit, season); return { outfit, score, explain: explainScore(score) }; };

  function hits(base, season) {
    return data.outfits
      .filter((o) => o.seasons.includes(season) && o.items.some((i) => i.category === base.category && i.color === base.color))
      .map((o) => candidate(o, season))
      .sort((a, b) => b.score.final - a.score.final || Number(b.outfit.universal) - Number(a.outfit.universal) || a.outfit.id.localeCompare(b.outfit.id));
  }

  function pickClassic(all) {
    const out = [];
    const shoeColors = new Set();
    for (const c of all.filter((x) => x.outfit.isClassic && !x.outfit.flags?.includes('disputed'))) {
      const sc = c.outfit.items.find((i) => i.category === 'shoes')?.color;
      if (out.length === 2 && shoeColors.size === 1 && shoeColors.has(sc)) continue; // 신발 색 최소 2종
      out.push(c); shoeColors.add(sc);
      if (out.length === 3) break;
    }
    for (const c of all) { if (out.length >= 3) break; if (!out.includes(c)) out.push(c); }
    return out.slice(0, 3);
  }

  function groupByTone(cands) {
    const groups = new Map();
    for (const c of cands) {
      const top = c.outfit.items.find((i) => i.category === 'top'); const bottom = c.outfit.items.find((i) => i.category === 'bottom');
      const shared = top && bottom ? tonesOf(top.color).filter((t) => tonesOf(bottom.color).includes(t)) : [];
      const tags = (c.outfit.tags || []).filter((t) => data.enums.tones.includes(t));
      for (const t of new Set([...shared, ...tags])) { if (!groups.has(t)) groups.set(t, []); if (groups.get(t).length < 5) groups.get(t).push(c); }
    }
    return [...groups].map(([tone, candidates]) => ({ tone, labelKey: `tone.${tone}`, candidates }));
  }

  function groupByHue(cands, base) {
    const hue = data.toneRules.hue;
    const groupOf = (id) => hue.analogous.find((g) => g.colors.includes(id))?.id || null;
    const out = { analogous: [], complementary: [], achromatic: [] };
    for (const c of cands) {
      const partner = c.outfit.items.find((i) => i.category === (base.category === 'bottom' ? 'top' : 'bottom'));
      if (!partner) continue;
      const ga = groupOf(base.color), gb = groupOf(partner.color);
      if (hue.achromatic.includes(partner.color) || hue.achromatic.includes(base.color)) out.achromatic.push(c);
      else if (ga && ga === gb) out.analogous.push(c);
      else if (hue.complementary.some((p) => (p.a === ga && p.b === gb) || (p.a === gb && p.b === ga))) out.complementary.push(c);
    }
    return Object.entries(out).filter(([, v]) => v.length).map(([relation, candidates]) => ({ relation, labelKey: `explain.${relation}`, candidates: candidates.slice(0, 5) }));
  }

  const ALT = { // 색 → 대체 아이템 (목 전용 간이표)
    shoes: { white: ['sneakerWhite', '흰 스니커즈', 'leather'], brown: ['chelsea', '브라운 첼시 부츠', 'leather'], black: ['derby', '블랙 더비', 'leather'] },
    top: { white: ['tee', '흰 티셔츠', 'jersey'], greyMelange: ['sweatshirt', '그레이 멜란지 맨투맨', 'jersey'], navy: ['knitWool', '네이비 울 니트', 'knitWool'], lightBlue: ['oxfordShirt', '라이트블루 옥스포드 셔츠', null], black: ['tee', '블랙 티셔츠', 'jersey'] },
    outer: { navy: ['blazer', '네이비 블레이저', 'wool', 'regular'], beige: ['trench', '베이지 트렌치', null, 'long'], black: ['leatherJacket', '블랙 가죽 재킷', 'leather', 'short'], brown: ['shirtJacket', '브라운 셔츠 재킷', null, 'regular'] },
  };
  function makeVariations(classic, base, season) {
    const rule = rules.get(`${base.color}|${base.category}`);
    const seen = new Set(classic.map((c) => sig(c.outfit)));
    const out = [];
    for (const c of classic) {
      let n = 0;
      for (const cat of ['shoes', 'top', 'outer']) {
        if (cat === base.category || n >= 3) continue;
        const cur = c.outfit.items.find((i) => i.category === cat);
        if (!cur && cat === 'outer') continue;
        const opts = (rule?.matches || []).filter((m) => m.category === cat && m.score >= 3 && m.color !== cur?.color && ALT[cat][m.color]);
        for (const m of opts) {
          const [type, name, material, length] = ALT[cat][m.color];
          const to = { ...cur, color: m.color, material, itemName: name, ...(cat === 'shoes' ? { shoeType: type } : { itemType: type }), ...(length ? { length } : {}) };
          const items = c.outfit.items.map((i) => (i === cur ? to : i));
          const outfit = { ...c.outfit, id: `g-${c.outfit.id}-${cat}-${m.color}`, items, generated: true, sources: [], universal: false, isClassic: m.tag === 'classic', tags: [...(c.outfit.tags || []), 'variation'], flags: m.flags || [], note: m.note || '' };
          const s = sig(outfit);
          if (seen.has(s)) continue;
          seen.add(s);
          const cand = candidate(outfit, season);
          if (m.score <= 2) cand.score.final = 2.6;
          out.push({ fromOutfitId: c.outfit.id, swapped: { category: cat, from: cur, to }, candidate: cand });
          n += 1;
          if (n >= 3) break;
        }
      }
    }
    return out.sort((a, b) => b.candidate.score.final - a.candidate.score.final);
  }
  const sig = (o) => o.items.map((i) => `${i.category}:${i.color}:${i.material}:${i.shoeType}`).sort().join('|');

  function avoidList(base) {
    const rule = rules.get(`${base.color}|${base.category}`);
    const cat = (c) => labels[`category.${c}`] || { top: '상의', bottom: '하의', shoes: '신발', outer: '아우터' }[c];
    return (rule?.avoid || []).map((a) => ({ target: a.category ? `${cat(a.category)} ${labels[`color.${a.color}`] || a.color}` : null, reason: a.reason, ruleId: a.ruleId }));
  }

  function recommend(query) {
    const key = `${query.base.category}|${query.base.color}|${query.season}|${query.mode}`;
    if (memo.has(key)) return memo.get(key);
    const t0 = performance.now();
    const all = hits(query.base, query.season);
    const classic = pickClassic(all);
    const result = { mode: query.mode, base: query.base, season: query.season, classic, stats: { candidates: all.length, ms: 0 } };
    if (query.mode === 'deep') {
      result.byTone = groupByTone(all);
      result.byHue = groupByHue(all, query.base);
      result.variations = makeVariations(classic, query.base, query.season);
      result.avoid = avoidList(query.base);
    }
    result.stats.ms = Math.round((performance.now() - t0) * 100) / 100;
    memo.set(key, result);
    if (memo.size > 20) memo.delete(memo.keys().next().value);
    return result;
  }

  return { recommend, score: scoreOutfit, explain: explainScore, index: {}, labels };
}
