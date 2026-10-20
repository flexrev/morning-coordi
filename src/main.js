// 아침 코디 — 앱 부트스트랩 (C3·C1 → 6-B). 토큰/스타일은 index.html <link>, 화면은 src/ui/, 엔진은 아래 USE_MOCK 한 줄에서 선택.
import * as state from './ui/state.js';
import { createCatalog } from './ui/catalog.js';
import { nextFrame } from './ui/motion.js';
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

/**
 * 데이터는 두 청크 (게이트 6 번들 분할): 핵심(src/ui/dataCore.js — 색·규칙·코디·라벨)은 첫 화면과 함께,
 * 확장(src/data/expansion.js — 스타일·상황·소품·무늬·미드)은 S3 첫 페인트 뒤 유휴 시간에(또는 S4·S5 진입 직전에) 불러와 엔진을 다시 만든다.
 * 핵심 엔진만으로도 classic 3장은 같은 결과(pickClassic 은 확장 데이터를 안 쓴다) → ref classic.N 유지.
 */
async function loadEngine() {
  if (USE_MOCK) {
    const mod = await import('./mock/index.js');
    const engine = mod.createEngine(mod.data);
    return { engine, catalog: createCatalog(mod.data, engine), expanded: true };
  }
  const [{ createEngine }, { data: core }] = await Promise.all([import('./engine/index.js'), import('./ui/dataCore.js')]);
  const engine = createEngine(core);
  state.registerExpansionLoader(async () => {
    const { expansion } = await import('./data/expansion.js');
    const full = { ...core, ...expansion };
    const next = createEngine(full);
    state.setEngine({ engine: next, catalog: createCatalog(full, next), expanded: true });
  });
  return { engine, catalog: createCatalog(core, engine), expanded: false };
}

function applyPrefs() {
  const st = state.get();
  applyThemeAttr(st.theme);
  applyMotionPref(st.motion);
  // 그레인 overlay 는 제거(2x 확대에서도 식별 불가 — 리뷰 4절). 저사양 표시만 남긴다
  const html = document.documentElement;
  const lowPerf = html.dataset.perf === 'low' || (navigator.deviceMemory && navigator.deviceMemory <= 2);
  if (lowPerf) html.dataset.perf = 'low';
  delete html.dataset.grain;
}

async function boot() {
  applyPrefs();
  ensurePatternDefs();
  const { engine, catalog, expanded } = await loadEngine();
  state.set({ engine, catalog, expanded });
  countVisit();
  mount(document.getElementById('app'));
  // 확장 청크: 첫 페인트 뒤 유휴 시간에 (S4·S5 는 app.js 가 ensureExpansion 을 기다린다)
  const idle = (fn) => (typeof requestIdleCallback === 'function' ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 600));
  nextFrame(() => idle(() => state.ensureExpansion()));
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

// 서비스워커: 'prompt' 모드 — 새 SW 는 대기(waiting) 상태로 두고 다음 실행에 적용(사용 중 리로드 없음). tech-stack.md 1-2절.
// virtual:pwa-register(workbox-window 2.4 KB gzip) 대신 직접 등록: 같은 동작(installed + 기존 controller → 토스트), SKIP_WAITING 은 보내지 않는다.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL });
      const watch = (w) => w && w.addEventListener('statechange', () => {
        if (w.state === 'installed' && navigator.serviceWorker.controller) toast('새 버전은 다음 실행에 적용돼요');
      });
      if (reg.waiting && navigator.serviceWorker.controller) toast('새 버전은 다음 실행에 적용돼요');
      watch(reg.installing);
      reg.addEventListener('updatefound', () => watch(reg.installing));
    } catch { /* 등록 실패는 조용히 (온라인에서 그대로 동작) */ }
  });
}
