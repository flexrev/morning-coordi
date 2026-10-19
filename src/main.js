// 아침 코디 — 앱 부트스트랩 (C3·C1). 토큰/스타일은 index.html <link>, 화면은 src/ui/, 엔진은 아래 USE_MOCK 한 줄에서 선택.
import { registerSW } from 'virtual:pwa-register';
import * as state from './ui/state.js';
import { createCatalog } from './ui/catalog.js';
import { ensurePatternDefs } from './ui/patternDefs.js';
import { mount } from './ui/app.js';
import { countVisit, dismissBanner } from './ui/install.js';
import { toast } from './ui/components.js';

/**
 * 엔진 선택 — 단일 전환점 (Phase 3-C 이후).
 *   기본(미설정)         → 실제 엔진(src/engine/index.js createEngine) + 실데이터(src/data/index.js data). dev·build 모두.
 *   VITE_USE_MOCK=true   → 목 엔진 + 더미 데이터 (src/mock). UI만 따로 볼 때: `VITE_USE_MOCK=true npm run dev`.
 * .env.production 은 false 로 고정. 비교는 빌드 타임 상수로 접히므로 프로덕션 번들에 mock 청크가 들어가지 않는다.
 * 엔진과 카탈로그는 반드시 같은 data 객체를 받는다(G4: shortLabel·라벨 출처 일치).
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

async function loadEngine() {
  // 카탈로그는 엔진을 받아 S2 정렬(index.baseColors)에 쓴다. 없으면 data 에서 직접 센다 (P1-02).
  if (USE_MOCK) {
    const mod = await import('./mock/index.js');
    const engine = mod.createEngine(mod.data);
    return { engine, catalog: createCatalog(mod.data, engine) };
  }
  const [{ createEngine }, { data }] = await Promise.all([import('./engine/index.js'), import('./data/index.js')]);
  const engine = createEngine(data);
  return { engine, catalog: createCatalog(data, engine) };
}

function applyTheme() {
  const t = state.get().theme;
  document.documentElement.dataset.theme = ['dark', 'light', 'auto'].includes(t) ? t : 'dark';
}

async function boot() {
  applyTheme();
  ensurePatternDefs();
  const { engine, catalog } = await loadEngine();
  state.set({ engine, catalog });
  countVisit();
  mount(document.getElementById('app'));
}

// Android: beforeinstallprompt 를 저장해 두고 배너 버튼을 [설치]로 (ux-flow 6-3)
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); state.set({ installPrompt: e }); });
window.addEventListener('appinstalled', () => { dismissBanner(true); state.set({ installPrompt: null }); });

boot().catch((err) => {
  console.error(err);
  const app = document.getElementById('app');
  app.replaceChildren();
  const box = document.createElement('div');
  box.className = 'empty';
  box.style.margin = '48px 16px';
  const p = document.createElement('p');
  p.textContent = '처음 한 번만 인터넷이 필요해요';
  const b = document.createElement('button');
  b.className = 'btn btn--primary';
  b.type = 'button';
  b.textContent = '다시 시도';
  b.addEventListener('click', () => location.reload());
  box.append(p, b);
  app.append(box);
});

// 서비스워커: 'prompt' 모드. 새 버전은 다음 실행에 적용(사용 중 리로드 없음). tech-stack.md 1-2절.
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() { toast('새 버전은 다음 실행에 적용돼요'); },
    onOfflineReady() { /* 조용히 */ },
  });
}
