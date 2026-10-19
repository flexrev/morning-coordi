# PWA 완료 기준(DoD) 점검 — Phase 3-C

- 기준: `docs/architecture/tech-stack.md` 6절(16항목) · 7절 iOS 방어(8항목)
- 점검: C1, 2026-10-19. `npm run build` → `npm run preview`(localhost:4176), 브라우저 패널 모바일 프리셋(375×812, Android UA), 콘솔 오류 0건.
- 결과: **6절 13 pass / 3 pending**, **7절 8 pass / 0 fail**. pending은 모두 실배포·실기기가 있어야 확인할 수 있는 항목.

## 6절 PWA DoD

| # | 항목 | 결과 | 근거 |
|---|---|---|---|
| 1 | HTTPS 배포 URL에서 열림 | **pending** | 아직 배포 전. localhost preview에서만 확인(SW는 localhost에서 동작) |
| 2 | manifest 필드(name "아침 코디", short_name "아침코디", id/start_url/scope "./", display standalone, theme_color, background_color, description, icons 192/512 + maskable) | pass | `public/manifest.webmanifest`. 브라우저에서 fetch → name/short_name/lang ko/display standalone/icons 3 |
| 3 | `<link rel="manifest">` + theme-color 라이트/다크 2종(media) | pass | `index.html` (#F5F3EE light / #121212 dark) |
| 4 | apple-touch-icon 180×180 PNG 불투명 | pass | `public/icons/apple-touch-icon.png` 180×180, alpha 없음(`npm run icons`) |
| 5 | apple-mobile-web-app-capable / mobile-web-app-capable / apple-mobile-web-app-title | pass | `index.html`. `apple-mobile-web-app-status-bar-style`은 7절 결정대로 **쓰지 않음**(deprecated, theme-color 2종으로 대체) |
| 6 | viewport-fit=cover | pass | `index.html` |
| 7 | 상단 `max(env(safe-area-inset-top), 44px)` standalone 한정 폴백 + 하단 env(safe-area-inset-bottom) | pass | `base.css`(`@media (display-mode: standalone)`), `tokens.css --safe-top/--safe-bottom`, `app.css` 하단 고정 영역 4곳 |
| 8 | SW precache에 data + 실루엣 + 아이콘 | pass | precache 16 entries 379.8 KiB. 데이터 JSON은 `index-lsZ1nW39.js`(218 KB) 청크로 번들, 실루엣 SVG 27개는 `?raw`로 JS에 인라인, 아이콘 4개 포함. 2회차 로드에서 전 자산 `deliveryType: cache-storage`, transferSize 0 확인 |
| 9 | 설치 상태 감지 `matchMedia('(display-mode: standalone)') \|\| navigator.standalone` | pass | `src/ui/install.js isStandalone()` |
| 10 | 설치 배너: iOS 공유 → 홈 화면에 추가 3단계 / Android beforeinstallprompt 버튼 | pass | `install.js installBanner/installSheet`, `main.js` beforeinstallprompt 저장. 모바일 UA 2회차 방문에서 배너 노출 확인 |
| 11 | 노출 규칙: 2회 방문 후, 하루 1회, 닫으면 7일 (`mc.v1.install`) | pass | `install.js shouldShowBanner()` — 첫 방문엔 없고 두 번째 로드에 나타남(확인) |
| 12 | localStorage 없이도 모든 화면 동작 | pass (코드) | `storage.js` 전부 try/catch, `state.js`는 읽기 실패 시 기본값. 시크릿 모드 실기기 확인은 Phase 4 |
| 13 | 새 버전은 다음 실행에 적용(사용 중 리로드 없음) | pass | `registerType: 'prompt'`. 새 빌드 후 리로드 → 기존 SW가 이전 버전을 계속 서빙하고 "새 버전은 다음 실행에 적용돼요" 토스트, `registration.waiting = true` 확인 |
| 14 | 실기기 iOS 18/26 Safari · Android Chrome, 홈 화면 추가 후 비행기 모드 실행 | **pending** | 실기기 없음. Phase 4 검토자 |
| 15 | DevTools Application > Manifest / Service Workers 경고 0건 | **pending** | 콘솔 오류 0건, SW active, manifest 200. DevTools 패널 자체는 브라우저 패널에서 열 수 없어 미확인 |
| 16 | precache < 2MB, 첫 로딩 < 1s | pass | 379.8 KiB(gzip 합계 ≈ 72 KB). localhost 첫 로딩 수백 ms(3G 측정은 Phase 4) |

오프라인 미캐시 폴백: 라우트는 전부 해시(`#/…`)라 `index.html` precache가 모든 화면을 덮는다. 엔진·데이터 청크 로드 실패 시 `main.js boot().catch`가 "처음 한 번만 인터넷이 필요해요 / 다시 시도"를 보여준다.

## 7절 iOS 방어

| 항목 | 결과 | 근거 |
|---|---|---|
| 아이콘 180×180 불투명, apple-touch-icon 링크 | pass | 위 4 |
| 상태바: status-bar-style 미사용, theme-color 2종 | pass | `index.html` |
| viewport-fit=cover + env(safe-area-inset-*) | pass | 위 6·7 |
| iOS 26.1 회귀: standalone일 때만 44px 하한 | pass | `base.css` |
| 설치 유도: iOS Safari 비설치 감지 → 안내 배너 | pass | `install.js isIOS()`(iPhone/iPad UA + iPadOS MacIntel·터치) |
| 저장소: 잃어도 되는 데이터만 | pass | `mc.v1.last/recent/season/theme/install` |
| 스플래시 생략, background_color 다크 | pass | manifest `#121212` |
| manifest iOS 미지원 필드 유지(Android용) | pass | `background_color, orientation` 유지 |

## 엔진 전환 확인

- `.env.production` `VITE_USE_MOCK=false`; `dist/assets/*.js`에 "mock" 문자열 0건(목 청크 트리셰이킹됨).
- 브라우저 워크(모바일 프리셋): S1 → 하의 → 인디고 데님 → S3 클래식 3장(o01·o09·o03, 실루엣 렌더) → 더 보기 톤별/색상별/변주 → 카드 → S5 → S6 신발(대안 탄/초콜릿 척카) → 뒤로. 상의 화이트(o01·o04·**o02 복원**), 신발 화이트(역조회 o01·o03·o08), 아우터 네이비(o05·o11·생성 1) 모두 3장. 콘솔 오류 0.
- 스크린샷: `docs/design/screenshots/s3-real-indigo.png`, `s3-real-whitetee.png`, `s4-real-tone.png`, `s5-real.png`, `s6-real-shoe.png`.

## 배포 후 갱신 (2026-10-19, PM)

| 항목 | 결과 |
|---|---|
| #1 HTTPS 배포 URL | **pass** — https://flexrev.github.io/morning-coordi/ (GitHub Pages, Actions 워크플로). index/manifest/sw.js/아이콘 200, 자산 경로 `/morning-coordi/` 접두사, manifest `start_url: ./` `scope: ./` |
| #8 SW 캐시 (배포 환경) | **pass** — 서비스워커 activated, 캐시 키 `workbox-precache-v2-https://flexrev.github.io/morning-coordi/`, 프리캐시 11항목(데이터 청크 포함) |
| Quick 경로 (배포 환경) | **pass** — 하의 → 인디고 2탭, 클래식 3장 + 실루엣, 콘솔 오류 0 |
| #14 실기기 (iOS Safari / Android Chrome 홈화면 추가 → 비행기 모드) | **pending** — 사용자 실기기 확인 필요. 절차는 README "핸드폰 홈화면 추가" |
| #15 DevTools Application 패널 | **pending** — 데스크톱 Chrome에서 URL 열고 Application > Manifest/Service Workers 경고 0 확인 |
