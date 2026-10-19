// 모든 데이터 JSON을 한 객체로 — docs/architecture/data-schema.md 3절. 번들에 정적 포함된다.
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
};
