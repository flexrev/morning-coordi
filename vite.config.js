// 아침 코디 — Vite + PWA 설정 (docs/architecture/tech-stack.md 1·3절)
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { readFile } from 'node:fs/promises';

// GitHub Pages 서브경로 배포: BASE_PATH=/morning-coordi/ npm run build
// Cloudflare Pages(루트): 환경변수 없음 → '/'
const base = process.env.BASE_PATH || '/';

/**
 * 실루엣 v2 레이어(src/assets/v2/*.svg?raw)를 번들에 넣을 때 주석·aria-label·viewBox·줄바꿈을 뗀다 (게이트 6 번들).
 * 렌더러(silhouette.js groupOf)는 <g data-slot> 만 쓰므로 xmlns 가 있는 <svg> 래퍼만 남기면 된다.
 */
const V2_RAW = /[\\/]src[\\/]assets[\\/]v2[\\/][^\\/?]+\.svg\?raw$/;
function trimSvgRaw() {
  return {
    name: 'mc-trim-svg-raw',
    enforce: 'pre',
    async load(id) {
      if (!V2_RAW.test(id)) return null;
      let svg = await readFile(id.replace(/\?raw$/, ''), 'utf8');
      svg = svg
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<svg[^>]*>/, '<svg xmlns="http://www.w3.org/2000/svg">')
        .replace(/\r?\n\s*/g, '');
      return `export default ${JSON.stringify(svg)};`;
    },
  };
}

export default defineConfig({
  base,
  build: {
    target: 'es2020',
    sourcemap: false,
  },
  plugins: [
    trimSvgRaw(),
    VitePWA({
      // manifest는 public/manifest.webmanifest를 그대로 쓴다(상대 start_url로 호스팅 비의존).
      // 플러그인이 manifest를 생성·주입하지 않도록 끈다. <link rel="manifest">는 index.html에 직접.
      manifest: false,
      strategies: 'generateSW',
      // 'prompt': 새 SW는 대기 상태로 두고 다음 실행 때 적용 → 아침 사용 중 리로드 없음
      registerType: 'prompt',
      // 등록은 src/main.js 가 직접(navigator.serviceWorker.register) — virtual:pwa-register/workbox-window 청크(2.4 KB gzip)를 뺀다 (게이트 6)
      injectRegister: null,
      // includeAssets 는 쓰지 않는다 — globPatterns 가 png·webmanifest 를 이미 포함해 precache 가 중복됐었다 (P2-03)
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,woff2}'],
        // 스토어용 스크린샷(manifest screenshots)은 설치 UI에서만 쓰이므로 precache 에서 뺀다 (P2-12)
        globIgnores: ['**/screenshots/**'],
        cleanupOutdatedCaches: true,
        // precache 총량 상한(2MB). 넘으면 빌드 경고로 알아챈다.
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        // 폰트 등 외부 런타임 캐시는 MVP에서 없음(시스템 폰트만 사용)
        runtimeCaching: [],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
