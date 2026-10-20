// S3 높이 가드 결정 — 순수 함수 (테스트 가능). 단계: 배너 아래로 → 여백 줄이기(tight) → 배너 다음 방문으로 미루기 → 컴팩트.
// U6-03: 배너는 하단 고정 영역과 절대 겹치지 않고 스크롤도 만들지 않는다. U6-08: 컴팩트 전에 여백부터 줄인다.

/**
 * @param {{cardsBottom:number, bottomTop:number, hasBanner:boolean, bannerBelow:boolean, bannerBottom?:number, tight:boolean, compact:boolean}} m
 * @returns {'ok'|'banner-below'|'tight'|'defer-banner'|'compact'|'give-up'}
 */
export function guardStep(m) {
  const eps = 0.5;
  const cardsOver = m.cardsBottom > m.bottomTop + eps;
  const bannerOver = m.hasBanner && m.bannerBelow && (m.bannerBottom ?? 0) > m.bottomTop + eps;
  if (!cardsOver && !bannerOver) return 'ok';
  if (cardsOver && m.hasBanner && !m.bannerBelow) return 'banner-below';
  if (!m.tight) return 'tight';
  if (m.hasBanner) return 'defer-banner';
  if (!m.compact) return 'compact';
  return 'give-up';
}

/**
 * 배너 결정만 따로 (U6-03): 위에 두면 카드가 넘침 → 아래로, 아래에서도 하단 뒤로 들어감 → 다음 방문으로 미룸.
 * @returns {'keep'|'below'|'defer'}
 */
export function bannerDecision({ cardsBottom, bottomTop, bannerBottom, below = false }) {
  const eps = 0.5;
  if (!below) return cardsBottom > bottomTop + eps ? 'below' : 'keep';
  return bannerBottom > bottomTop + eps ? 'defer' : 'keep';
}
