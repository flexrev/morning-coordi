# 아침 코디

출근 전 10초 안에 "오늘 이 바지에 뭘 입지?"에 답하는 남성 코디 가이드 PWA.
서버 없음, 정적 파일만, 오프라인 동작, 홈 화면에 추가해 앱처럼 사용.

## 실행

```bash
npm install          # Node 20 이상
npm run dev          # http://localhost:5173
npm run build        # dist/ 생성 (서비스워커·precache 포함)
npm run preview      # 빌드 결과 확인 (http://localhost:4173 — 포트가 점유 중이면 4174… 로 옮겨가니 출력의 URL을 본다)
npm run validate     # 데이터 JSON 검증 (docs/architecture/data-schema.md 8절)
npm test             # node --test (tests/**/*.test.js 자동 탐색)
npm run build:data   # 리서치 표 → src/data/*.json 재생성 (JSON은 손으로 고치지 않는다)
npm run icons        # docs/design/app-icon.svg → public/icons/*.png (sharp)
```

엔진은 기본이 실제 엔진 + 실데이터다(dev·build 모두). UI만 따로 볼 때는 `VITE_USE_MOCK=true npm run dev`
(PowerShell: `$env:VITE_USE_MOCK='true'; npm run dev`). `.env.production`이 false로 고정하므로 프로덕션 번들에 mock 청크는 들어가지 않는다.

실행 설정(`.claude/launch.json`)은 저장소 루트의 것이 기준이다(`dev` 5173 · `preview` 4173). 상위 작업 폴더(`CODE/.claude/launch.json`)에
같은 이름의 항목이 있는데 그것은 `npm --prefix morning-coordi …` 로 이 저장소를 가리키는 포인터일 뿐이라 설정은 여기서만 고친다.

GitHub Pages 서브경로로 빌드할 때:

```bash
BASE_PATH=/morning-coordi/ npm run build
```

PowerShell: `$env:BASE_PATH='/morning-coordi/'; npm run build`
Git Bash(Windows)는 `/morning-coordi/`를 Windows 경로로 바꿔버리므로 `MSYS_NO_PATHCONV=1 BASE_PATH=/morning-coordi/ npm run build`

## 구조

- `docs/architecture/tech-stack.md` — 스택·폴더·빌드·배포·PWA 완료 기준
- `docs/architecture/data-schema.md` — `src/data/*.json` 형식 (단일 진실)
- `docs/architecture/engine-spec.md` — 추천 엔진 순수 함수 사양
- `src/engine/` — 엔진 (C2), `src/data/` — 데이터 (C2), `src/components/` — 카드 (C3)
- `src/assets/silhouettes/`, `src/styles/tokens.css` — 디자인 (D2)

## 아이콘

`public/icons/*.png`는 `npm run icons`가 `docs/design/app-icon.svg`에서 래스터화한다(192 · 512 · 512 maskable · 180 apple-touch, 전부 불투명).
sharp가 설치되지 않는 환경에서는 `npm run icons:placeholder`로 단색 임시 파일을 만들 수 있다.
