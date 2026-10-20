// 확장 데이터 배럴 (Phase 6-B CX 10개) — src/data/index.js 의 재수출. UI 가 S3 첫 페인트 뒤 지연 청크로 불러온다 (게이트 6 번들 분할).
// 핵심 데이터는 src/ui/dataCore.js. 두 파일의 합집합 = index.js 의 data 와 같아야 한다 (tests/ui/dataSplit.test.js 가 확인).
import styles from './styles.json' with { type: 'json' };
import styleAffinity from './styleAffinity.json' with { type: 'json' };
import occasions from './occasions.json' with { type: 'json' };
import accessoryTypes from './accessoryTypes.json' with { type: 'json' };
import accessoryRules from './accessoryRules.json' with { type: 'json' };
import patterns from './patterns.json' with { type: 'json' };
import patternRules from './patternRules.json' with { type: 'json' };
import midTypes from './midTypes.json' with { type: 'json' };
import midLayerRules from './midLayerRules.json' with { type: 'json' };
import twoOuterRules from './twoOuterRules.json' with { type: 'json' };

export const expansion = {
  styles,
  styleAffinity,
  occasions,
  accessoryTypes,
  accessoryRules,
  patterns,
  patternRules,
  midTypes,
  midLayerRules,
  twoOuterRules,
};
