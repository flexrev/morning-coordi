// 아침 코디 — 앱 부트스트랩 (C3·C1 → 6-B). 토큰/스타일은 index.html <link>, 화면은 src/ui/, 엔진은 아래 USE_MOCK 한 줄에서 선택.
import { registerSW } from 'virtual:pwa-register';
import * as state from './ui/state.js';
import { createCatalog } from './ui/catalog.js';
import { ensurePatternDefs } from './ui/patternDefs.js';
import { mount } from './ui/app.js';
import { countVisit, dismissBanner } from './ui/install.js';
import { toast } from './ui/components.js';
import { applyMotionPref } from './ui/motion.js';
import { applyThemeAttr } from './ui/screens/settings.js';

/**
 * 엔진 선택 — 단일 전환점 (Phase 3-C 이후).
 *   기본(미설정)         → 실제 엔진(src/engine/index.js createEngine) + 실데이터(src/data/index.js data). dev·build 모두.
 *   VITE_USE_MOCK=true   → 목 엔진 + 더미 데이터 (src/mock). UI만 따로 볼 때: `VITE_USE_MOCK=true npm run dev`.
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

async function loadEngine() {
  if (USE_MOCK) {
    const mod = await import('./mock/index.js');
    const engine = mod.createEngine(mod.data);
    return { engine, catalog: createCatalog(mod.data, engine) };
  }
  const [{ createEngine }, { data }] = await Promise.all([import('./engine/index.js'), import('./data/index.js')]);
  const engine = createEngine(data);
  return { engine, catalog: createCatalog(data, engine) };
}

function applyPrefs() {
  const st = state.get();
  applyThemeAttr(st.theme);
  applyMotionPref(st.motion);
  // 그레인(시안 B 7% 상한 → 5%): 다크에서만, 저사양(data-perf=low)·투명도 줄이기면 끔
  const html = document.documentElement;
  let noTransparency = false;
  try { noTransparency = matchMedia('(prefers-reduced-transparency: reduce)').matches; } catch { /* noop */ }
  const lowPerf = html.dataset.perf === 'low' || (navigator.deviceMemory && navigator.deviceMemory <= 2);
  if (lowPerf) html.dataset.perf = 'low';
  if (!noTransparency && !lowPerf) html.dataset.grain = 'on'; else delete html.dataset.grain;
}

async function boot() {
  applyPrefs();
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
