// JSDoc 타입 전용 모듈 — 런타임 코드 없음. 전체 정의는 docs/architecture/engine-spec.md 8절.
/** @typedef {'top'|'bottom'|'shoes'|'outer'} Category */
/** @typedef {'springFall'|'summer'|'winter'} Season */
/** @typedef {'quick'|'deep'} Mode */
/** @typedef {{ category: Category, color: string, material?: string|null, fit?: string|null, shoeType?: string|null, itemType?: string|null }} BaseItem */
/** @typedef {{ category: Category, color: string, material: string|null, fit: string|null, length: string|null, shoeType: string|null, itemType: string|null, itemName: string, pattern?: string|null, layer?: 1|2 }} OutfitItem */
/** @typedef {{ id: string, items: OutfitItem[], seasons: Season[], tags: string[], isClassic: boolean, universal: boolean, sources: string[], flags: string[], note?: string, generated?: boolean, mergedFrom?: string[] }} Outfit */
/** @typedef {{ key: string, params?: Record<string, string|number>, delta?: number, severity: 'info'|'warn'|'block', sources?: string[] }} Reason */
/** @typedef {{ axis: string, score: number, weight: number, reasons: Reason[] }} AxisScore */
/** @typedef {{ final: number, percent: number, blocked: boolean, color: AxisScore, style: { fit: AxisScore, len: AxisScore, mat: AxisScore, shoe: AxisScore, outer: AxisScore|null, season: AxisScore, adjust: AxisScore, formality: AxisScore }, reasons: Reason[], warnings: Reason[], blockReasons: Reason[] }} OutfitScore */
/** @typedef {{ outfit: Outfit, score: OutfitScore, explain: string[] }} Candidate */
/** @typedef {{ tone: string, labelKey: string, candidates: Candidate[] }} ToneGroup */
/** @typedef {{ relation: 'analogous'|'complementary'|'achromatic', labelKey: string, candidates: Candidate[] }} HueGroup */
/** @typedef {{ fromOutfitId: string, swapped: { category: Category, from: OutfitItem, to: OutfitItem }, candidate: Candidate }} Variation */
/** @typedef {{ base: BaseItem, season: Season, mode: Mode }} Query */
/** @typedef {{ mode: Mode, base: BaseItem, season: Season, classic: Candidate[], byTone?: ToneGroup[], byHue?: HueGroup[], variations?: Variation[], stats: { candidates: number, ms: number } }} RecommendResult */
/** @typedef {{ rule: string, severity: 'error'|'warn', message: string, path: string }} ValidationIssue */
/** @typedef {Record<string, any>} DataIndex */
/** @typedef {Record<string, string>} Labels */
export {};
