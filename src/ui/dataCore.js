// 핵심 데이터 (Phase 4 범위: 색·규칙·코디·라벨) — 첫 화면과 함께 실리는 청크. 확장 10개는 src/data/expansion.js (지연).
// src/data/index.js 는 손대지 않는다(테스트·스크립트가 쓴다). core ∪ expansion = index.js data (tests/ui/dataSplit.test.js).
import enums from '../data/enums.json' with { type: 'json' };
import colors from '../data/colors.json' with { type: 'json' };
import toneRules from '../data/toneRules.json' with { type: 'json' };
import colorRules from '../data/colorRules.json' with { type: 'json' };
import materials from '../data/materials.json' with { type: 'json' };
import matRules from '../data/matRules.json' with { type: 'json' };
import fitRules from '../data/fitRules.json' with { type: 'json' };
import lengthRules from '../data/lengthRules.json' with { type: 'json' };
import shoes from '../data/shoes.json' with { type: 'json' };
import shoeRules from '../data/shoeRules.json' with { type: 'json' };
import formality from '../data/formality.json' with { type: 'json' };
import outerRules from '../data/outerRules.json' with { type: 'json' };
import layerRules from '../data/layerRules.json' with { type: 'json' };
import adjust from '../data/adjust.json' with { type: 'json' };
import outfits from '../data/outfits.json' with { type: 'json' };
import labels from '../data/labels.ko.json' with { type: 'json' };

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
