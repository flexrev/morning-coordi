// JSDoc 타입 전용 모듈 — 런타임 코드 없음. 전체 정의는 docs/architecture/engine-spec.md 8절 (+ Phase 6-B 12절).
/** @typedef {'top'|'bottom'|'shoes'|'outer'|'mid'} Category */
/** @typedef {'springFall'|'summer'|'winter'} Season */
/** @typedef {'quick'|'deep'} Mode */
/** @typedef {{ category: Category, color: string, material?: string|null, fit?: string|null, shoeType?: string|null, itemType?: string|null }} BaseItem */
/** @typedef {{ category: Category, color: string, material: string|null, fit: string|null, length: string|null, shoeType: string|null, itemType: string|null, itemName: string, pattern?: string|null, layer?: 1|2 }} OutfitItem */
/** @typedef {{ id: string, items: OutfitItem[], seasons: Season[], tags: string[], isClassic: boolean, universal: boolean, styles?: Array<{id: string, score: number}>, occasions?: string[], sources: string[], flags: string[], note?: string, generated?: boolean, mergedFrom?: string[] }} Outfit */
/** @typedef {{ key: string, params?: Record<string, string|number>, delta?: number, severity: 'info'|'warn'|'block', sources?: string[] }} Reason */
/** @typedef {{ axis: string, score: number, weight: number, reasons: Reason[] }} AxisScore */
/** @typedef {{ final: number, percent: number, blocked: boolean, color: AxisScore, style: { fit: AxisScore, len: AxisScore, mat: AxisScore, shoe: AxisScore, outer: AxisScore|null, layer: AxisScore|null, season: AxisScore, adjust: AxisScore, formality: AxisScore }, reasons: Reason[], warnings: Reason[], blockReasons: Reason[] }} OutfitScore */
/** @typedef {{ vec: Record<string, number>, norm: Record<string, number>, dominant: string|null, wsum: number }} StyleVector */
/** @typedef {{ group: string, id: string, color: string|null, note: string, severity: 'info'|'warn', ruleId: string, delta: number, key: string, text?: string, material?: string|null, finish?: string|null }} AccessoryPick */
/** @typedef {{ outfit: Outfit, score: OutfitScore, explain: string[], styleVec?: StyleVector|null, styleTags?: Array<{id: string, score: number}>, tags?: { style: string[], occasion: string[] }, tagLabels?: string[], rank?: { boost: number, occasionAdj: number, finalRanked: number }, styleReasons?: Reason[], styleExplain?: string[], accessories?: AccessoryPick[] }} Candidate */
/** @typedef {{ tone: string, labelKey: string, candidates: Candidate[] }} ToneGroup */
/** @typedef {{ relation: 'analogous'|'complementary'|'achromatic', labelKey: string, candidates: Candidate[] }} HueGroup */
/** @typedef {{ style: string, labelKey: string, candidates: Candidate[] }} StyleGroup */
/** @typedef {{ occasion: string, labelKey: string, candidates: Candidate[], relaxed: string[], shortfall: boolean }} OccasionGroup */
/** @typedef {{ fromOutfitId: string, swapped: { category: Category, from: OutfitItem, to: OutfitItem }, candidate: Candidate }} Variation */
/** @typedef {{ base: BaseItem, season: Season, mode: Mode, style?: string|null, occasion?: string|null, accessories?: boolean|{ belt?: string, beltColor?: string, watch?: string, tuckIn?: boolean }, layering?: boolean, patterns?: boolean }} Query */
/**
 * Phase 6-B-3 (C6-01·02): relaxed = 적용된 완화 단계(['patterns','materials',…]). shortfall = 격식·운동이 완화 상한(stage 2)에서도 3장을 못 채움(classic은 0~2장),
 * shortfallText = 그때 UI가 보일 한국어 한 줄("격식에 맞는 조합이 더 없어요"), 아니면 null.
 * @typedef {{ style: string|null, occasion: string|null, accessories: boolean, layering: boolean, patterns: boolean, relaxed: string[], shortfall: boolean, shortfallText: string|null }} Applied
 */
/** @typedef {{ mode: Mode, base: BaseItem, season: Season, classic: Candidate[], applied: Applied, byTone?: ToneGroup[], byHue?: HueGroup[], variations?: Variation[], byStyle?: StyleGroup[], byOccasion?: OccasionGroup[], avoid?: Array<{target: string|null, reason: string, ruleId: string|null}>, stats: { candidates: number, ms: number } }} RecommendResult */
/** @typedef {{ rule: string, severity: 'error'|'warn'|'info', message: string, path: string }} ValidationIssue */
/** @typedef {Record<string, any>} DataIndex */
/** @typedef {Record<string, string>} Labels */
export {};
