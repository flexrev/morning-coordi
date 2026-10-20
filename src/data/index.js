// 모든 데이터 JSON을 한 객체로 — docs/architecture/data-schema.md 3절. 번들에 정적 포함된다.
// Phase 6-B (CX): 확장 파일 10개 추가 — 빈 배열이면 해당 기능 OFF (content-expansion.md 6-3)
import enums from './enums.json' with { type: 'json' };
import colors from './colors.json' with { type: 'json' };
import toneRules from './toneRules.json' with { type: 'json' };
import colorRules from './colorRules.json' with { type: 'json' };
import materials from './materials.json' with { type: 'json' };
import matRules from './matRules.json' with { type: 'json' };
import fitRules from './fitRules.json' with { type: 'json' };
import lengthRules from './lengthRules.json' with { type: 'json' };
import shoes from './shoes.json' with { type: 'json' };
import shoeRules from './shoeRules.json' with { type: 'json' };
import formality from './formality.json' with { type: 'json' };
import outerRules from './outerRules.json' with { type: 'json' };
import layerRules from './layerRules.json' with { type: 'json' };
import adjust from './adjust.json' with { type: 'json' };
import outfits from './outfits.json' with { type: 'json' };
import labels from './labels.ko.json' with { type: 'json' };
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

export const data = {
  enums,
  colors,
  toneRules,
  colorRules,
  materials,
  matRules,
  fitRules,
  lengthRules,
  shoes,
  shoeRules,
  formality,
  outerRules,
  layerRules,
  adjust,
  outfits,
  labels,
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
