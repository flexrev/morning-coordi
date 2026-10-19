# R3 레퍼런스 리서치 — 기존 서비스·UX 패턴·일러스트·PWA·호스팅

작성일: 2026-10-19 · 담당: R3 레퍼런스 리서치 · 독자: D1(UX), D2(비주얼), C1(프론트 아키텍트), PM

> 범위: `docs/00-team-and-plan.md`의 "빠른 길 우선 / 그림이 먼저 / 오프라인 / 한 손 조작" 원칙을 기준으로,
> 기존 코디 앱·사이트의 흐름과 표현 방식, 아침 10초 UX 패턴, 사진 없는 일러스트 접근, PWA 홈화면 추가 조건, 무료 정적 호스팅을 정리했습니다.
> 출처는 문서 끝 "출처" 절에 번호로 모았습니다. 직접 확인하지 못한 항목은 **[미확인]** 으로 표시했습니다.

---

## 1. 기존 코디·옷장 앱/사이트 분석

### 1-1. 분석 기준

| 항목 | 설명 |
|---|---|
| 핵심 흐름 | 사용자가 추천(또는 조합)을 얻기까지의 경로 |
| 탭 수 | 앱 실행 후 "오늘 입을 조합" 1개를 보기까지 최소 탭 수 (옷장 등록이 끝난 상태 가정) |
| 색 조합 표현 | 색 조합을 어떻게 보여주는가 (사진 / 누끼 제품 사진 / 일러스트 / 색 칩 / 텍스트) |
| 아침 적합성 | "7시 10분, 한 손, 어두운 방"에서 10초 안에 답이 나오는가 |
| 비즈니스 모델 | 무료 / 구독 / 일회 결제 / 광고 / 제휴 |

### 1-2. 서비스별 요약

#### (1) Acloset 에이클로젯 — 한국, iOS/Android [1][2][3][4]
- **핵심 흐름**: 옷 사진 촬영(자동 배경 제거) 또는 온라인 검색으로 옷장 등록 → AI가 종류·색·계절 분류 → 홈 "Today's Look"(날씨·일정 기반 데일리 코디) / OOTD 캘린더 / AI 스타일리스트 질문.
- **탭 수**: 옷장 등록 후에는 홈 진입 즉시 "Today's Look" 노출 → **0~1탭**. 다만 처음 옷장을 등록하는 비용(수십 벌 촬영)이 큼. 2025-02 업데이트(5.33.0)에서 "매일 아침 Today's Look, 준비 시간 최대 15분 단축" 및 "안 어울리는 조합 AI 추천 제외" 기능 추가 [3].
- **색 조합 표현**: 사용자 옷의 **누끼(배경 제거) 사진** 콜라주. 색 칩·일러스트 없음.
- **강점**: 내 옷 기반이라 결과가 현실적, 날씨 연동, 한국어 UI, 자동 분류 정확도가 높은 편.
- **약점(아침 관점)**: 옷장 등록 전에는 쓸모없음(콜드 스타트), 무료 100개 아이템 제한 후 구독($3.99~$24.99/월, 옷장 크기별) [4], 네트워크 필요, 홈 화면에 피드·광고·배너가 많아 한 손 즉답형은 아님.
- **비즈니스 모델**: 프리미엄(무료 100개 + 광고) → 구독.

#### (2) Whering — 영국, iOS/Android [5][6][7]
- **핵심 흐름**: 옷 촬영/1억 개 DB 검색으로 옷장 디지털화 → "Dress Me"(셔플) 또는 데일리 아웃핏 제안 → 플래너·패킹·친구 옷장 보기.
- **탭 수**: 홈 → Dress Me → 셔플 결과 **2~3탭**. 셔플은 무작위성이 강해 "그냥 옷장에서 아무거나 집는 것과 비슷하다"는 비판 [7].
- **색 조합 표현**: 누끼 사진 그리드(상의/하의/신발 칸을 슬롯머신처럼 셔플).
- **강점**: 무료, 1천만 사용자, 밝고 재미있는 톤, 앱 평점 4.7(자사 집계) [5].
- **약점**: 자동 태깅 오류 시 수정 부담, 추천이 "내 스타일과 동떨어짐", 디자인이 다소 구식이라는 평 [6][7]. 역시 콜드 스타트 문제.
- **비즈니스 모델**: 기본 무료 + AI 스타일링 크레딧 팩 [6].

#### (3) Stylebook — 미국, iOS 전용 [8][9]
- **핵심 흐름**: 수동 누끼(배경 지우기) → 아이템 카탈로그 → "Looks" 콜라주 직접 제작 → 캘린더 배정, 패킹리스트, 통계(착용 횟수, cost per wear). "Style Shuffle"로 선택한 카테고리를 무작위 조합.
- **탭 수**: 미리 만들어둔 Look을 캘린더에서 보면 **1~2탭**. 새 조합은 직접 드래그해 만들어야 하므로 아침엔 부적합.
- **색 조합 표현**: 누끼 사진 콜라주. 색 분석 없음.
- **강점**: 일회 결제 $4.99, 광고·구독 없음, 오프라인 동작, 단순함을 좋아하는 충성 사용자.
- **약점**: 디자인이 "bare-bones", 배경 제거가 수동, 추천 기능이 사실상 없음(셔플만). Android 없음 [9].
- **비즈니스 모델**: 일회 결제.

#### (4) Cladwell — 미국, iOS/Android [10][11]
- **핵심 흐름**: 사전 구축된 **아이템 라이브러리(제네릭 스톡 이미지)** 에서 내 옷과 비슷한 것을 고르거나(사진 업로드는 보조) 캡슐 옷장 템플릿 선택 → 매일 날씨·착용 빈도 기반 코디 여러 개를 **스와이프**로 제시 → 하나 선택하면 기록.
- **탭 수**: 앱 열면 오늘 코디가 바로 뜸 → **1탭**(선택) + 스와이프. 아침 사용 시나리오에 가장 가까운 흐름.
- **색 조합 표현**: 제네릭 아이템 이미지(사진이 아닌 대표 이미지)를 상·하·신발 순으로 나열. 이 "대표 이미지" 방식이 우리의 실루엣 일러스트 접근과 가장 유사.
- **강점**: 등록이 빠름(라이브러리에서 고르기), 매일 "오늘 입을 것" 중심, 캡슐 옷장 철학.
- **약점**: "대부분 조합이 잘 안 어울린다"는 앱스토어 불만, 제네릭 이미지가 내 옷과 달라 괴리, ChatGPT 즉석 추천에 의존, 무료 아이템 제한·구독 [10].
- **비즈니스 모델**: 구독.

#### (5) Indyx — 미국, iOS/Android [9][12]
- **핵심 흐름**: 옷장 등록(AI 배경 제거) → 직접 코디 제작·캘린더 → 유료로 **사람 스타일리스트**가 내 옷으로 10개 룩북 제작($150~) → (예정) 리세일 마켓.
- **탭 수**: 스타일리스트가 만든 룩북을 열면 **2탭**. 즉시 생성 추천은 아님.
- **색 조합 표현**: 누끼 사진 콜라주 + 스타일리스트 코멘트.
- **강점**: 무료 무제한 아이템, 전문가 결과물 품질.
- **약점**: 유료·비동기(며칠 소요), 분석·커뮤니티 기능은 Insider 멤버십. 아침 즉답과 무관.
- **비즈니스 모델**: 무료 앱 + 스타일링 서비스 판매 + 멤버십.

#### (6) Combyne — 독일, iOS/Android [13][14]
- **핵심 흐름**: 800+ 브랜드의 **제품 누끼 이미지**를 드래그해 콜라주 코디 제작 → 커뮤니티 공유·챌린지 → 제품 구매 링크.
- **탭 수**: 남의 코디 피드 보기는 1탭, 내 조합 만들기는 **5탭 이상**(아이템 검색·배치).
- **색 조합 표현**: 제품 사진 콜라주(무드보드형).
- **강점**: 자산이 풍부해 그림이 예쁨, 소셜 동기.
- **약점**: 내 옷이 아닌 쇼핑 중심, 만드는 데 시간 소요, 아침용 아님.
- **비즈니스 모델**: 무료 + 제휴 커머스.

#### (7) Pureple — 미국, iOS/Android [15][16]
- **핵심 흐름**: 옷장 등록(가격·브랜드·상황 자동 분류) → AI 피드백·AI 모델 피팅·캘린더·여행 패킹 → 날씨 기반 제안.
- **탭 수**: 2~3탭. 무료판은 광고가 많아 실제 체감 시간이 늘어남.
- **색 조합 표현**: 누끼 사진.
- **강점**: 기능 폭이 넓음.
- **약점**: 광고 과다, 크래시·옷 삭제 버그 보고(2023 스탠퍼드 과제 기준), 가상 스타일리스트 품질 낮음, 평점 3.9/5 (6.1K) [16]. 구독 $89.99/년.
- **비즈니스 모델**: 광고 + 구독.

#### (8) Smart Closet — iOS/Android (유사 이름 앱 다수) [17]
- **핵심 흐름**: 옷장 등록 → 트렌드 코디 보기 → 앱 내 쇼핑. Android 버전은 일회 $4 결제로 전체 기능.
- **탭 수**: 2~3탭.
- **색 조합 표현**: 누끼 사진.
- **강점**: 단순 UI, 저렴.
- **약점**: 브랜드가 분산(같은 이름의 앱이 여럿), 추천 로직 불투명.
- **비즈니스 모델**: 프리미엄/일회 결제/인앱 쇼핑.

#### (9) Lookastic — 웹(모바일 웹 포함) [18][19][20] — 2절에서 상세
- **핵심 흐름**: 아이템+색(예: "navy chinos") 페이지 → "how to wear with"(함께 입는 아이템별) / looks(상황별) → 스트리트 사진 카드 + 제품 구매 링크.
- **탭 수**: 검색/홈 → 아이템 → 조합 **2~3탭**. 로그인·옷장 등록 불필요(콜드 스타트 없음).
- **색 조합 표현**: **실제 스트리트 스냅 사진** + 하단에 아이템명(색+품목)을 텍스트로 나열. 색 칩·일러스트 없음.
- **강점**: 아이템·색 단위로 조합이 체계화된 유일한 대형 레퍼런스. 수천 개 조합.
- **약점**: 페이지가 무겁고 광고·제휴 링크 다수, 한 조합이 사진 1장에 묶여 색만 바꾼 변주를 보기 어려움, 영어, 오프라인 불가, 모바일에서 스크롤이 김.
- **비즈니스 모델**: 제휴 커머스(shop the look) + 광고.

#### (10) Mr Porter "The Journal" / Mytheresa 에디토리얼 — 웹 [21][22]
- **핵심 흐름**: 편집 기사(예: "Everything You Ever Wanted To Know About Wearing Colour") → 뉴트럴 3~4색을 기반으로 톤온톤 확장 권고 → 제품 링크.
- **탭 수**: 해당 없음(읽는 콘텐츠). 즉답형 아님.
- **색 조합 표현**: 룩북 사진 + 글. Mytheresa는 모노크롬·텍스처 대비 위주 캠페인.
- **강점**: 클래식 기준의 신뢰도 높은 규칙(뉴트럴 베이스, 톤온톤). R1 컬러 리서치의 근거로 유용.
- **약점**: 매일 쓰는 도구가 아님.
- **비즈니스 모델**: 럭셔리 커머스.

#### (11) 무신사 코디맵 / 스냅 — 한국, 앱/웹 [23][24][25]
- **핵심 흐름**: 상품 상세 "코디" 탭에서 모델샷·코디 영상·코디맵 확인 [23] / 스냅은 2024-08 개편으로 SNS형(팔로우, 스타일별 20여 개 랭킹) [25]. 스냅 게시물마다 착용 상품 구매 페이지 연결 [24].
- **탭 수**: 스냅 피드 1탭이지만 "내 바지에 맞는 상의"처럼 **아이템 기준 역방향 탐색은 불가**(필터는 스타일·브랜드 위주).
- **색 조합 표현**: 실사 스냅 사진.
- **강점**: 한국 남성 취향 레퍼런스가 가장 풍부, 트렌드 반영 빠름.
- **약점**: 쇼핑 유도 중심, 색·소재 규칙이 구조화되어 있지 않음, 무거움.
- **비즈니스 모델**: 커머스.

#### (12) 코디북 Codibook — 한국, 앱 [26]
- **핵심 흐름**: 100만 개 이상의 코디(주로 여성) 피드 → 아이템 즉시 구매 → 코디 저장/공유.
- **탭 수**: 피드 1탭. 개인 옷장 기능 부재에 대한 리뷰 요청 있음 [26].
- **색 조합 표현**: 제품 누끼 콜라주.
- **강점**: 평점 4.6(1.1만), 콜라주 레이아웃이 깔끔.
- **약점**: 여성 중심, 남성 클래식 규칙 없음, 커머스 중심.
- **비즈니스 모델**: 커머스.

### 1-3. 비교표

| 서비스 | 유형 | 추천까지 탭 수* | 색 조합 표현 | 콜드 스타트 | 오프라인 | 아침 적합성 | 비즈니스 모델 |
|---|---|---|---|---|---|---|---|
| Acloset | 내 옷장+AI | 0~1 | 누끼 사진 콜라주 | 큼(옷 촬영) | X | ◎ (등록 후) | 프리미엄 구독 |
| Whering | 내 옷장+셔플 | 2~3 | 누끼 사진 그리드 | 큼 | X | ○ | 무료+크레딧 |
| Stylebook | 내 옷장 수동 | 1~2 (미리 제작) | 누끼 콜라주 | 매우 큼(수동 누끼) | ○ | △ | 일회 $4.99 |
| Cladwell | 라이브러리 옷장+데일리 | 1 + 스와이프 | 제네릭 대표 이미지 | 작음 | X | ◎ | 구독 |
| Indyx | 옷장+사람 스타일리스트 | 2 (비동기) | 누끼 콜라주 | 큼 | X | △ | 무료+서비스 |
| Combyne | 제품 콜라주 소셜 | 5+ | 제품 사진 콜라주 | 없음 | X | X | 제휴 커머스 |
| Pureple | 옷장+AI | 2~3 (+광고) | 누끼 사진 | 큼 | X | △ | 광고+구독 |
| Smart Closet | 옷장 | 2~3 | 누끼 사진 | 큼 | △ | △ | 일회/인앱 |
| Lookastic | 아이템→조합 DB | 2~3 | 스트리트 사진+텍스트 | 없음 | X | ○ (무거움) | 제휴+광고 |
| Mr Porter/Mytheresa | 에디토리얼 | — | 룩북 사진 | 없음 | X | X | 커머스 |
| 무신사 코디맵/스냅 | 커머스 스냅 | 1 (피드) | 실사 스냅 | 없음 | X | △ | 커머스 |
| 코디북 | 커머스 콜라주 | 1 (피드) | 제품 콜라주 | 없음 | X | △ | 커머스 |
| **아침 코디(우리)** | 규칙 기반 아이템→조합 | **≤3** | **실루엣 일러스트+색 칩** | **없음** | **◎** | **◎ 목표** | 무료(정적) |

\* 옷장 등록이 끝난 상태 기준. 일러스트를 쓰는 서비스는 사실상 없고, 전부 **사진(누끼 또는 실사)** 이라는 점이 우리 차별점이자 리스크(일러스트의 설득력 확보 필요).

**관찰 요약**
1. 옷장형 앱은 모두 "등록 → 추천" 구조라 첫 사용에 수십 분이 들고, 아침 즉답은 등록을 끝낸 사용자만 누림. 우리는 **등록 없이** 색·품목만 고르는 방식이라 콜드 스타트가 없다는 것이 핵심 강점.
2. 추천 품질 불만(Whering 셔플, Cladwell "안 어울림", Pureple 스타일리스트)이 반복됨 → 무작위/LLM보다 **검증된 클래식 규칙 고정 노출**이 신뢰를 얻는다.
3. Cladwell의 "앱 열면 오늘 코디, 스와이프로 다음" 과 Acloset의 "Today's Look" 홈 노출이 아침 UX 벤치마크.
4. 사진 기반 서비스는 "같은 조합에서 색만 바꾼 변주"를 보여주기 어렵다. SVG 색 주입은 이 공백을 메운다.

---

## 2. Lookastic 상세 (가장 가까운 레퍼런스)

> 직접 페이지 로드는 Cloudflare ASN 차단(403)으로 실패. 아래는 검색 엔진에 노출된 페이지 제목·URL 구조·요약문 [18][19][20] 과 과거 사용 경험 기반 정리. 세부 필터명은 **[미확인]**.

### 2-1. URL/페이지 구조 (확인됨)

```
/men/navy-chinos                              아이템 허브 (색+품목 단위)
/men/navy-chinos/looks                        "Navy Chinos Outfit For Men (2,000+ Combinations)"
/men/navy-chinos/looks/casual                 상황(occasion)별 룩 목록
/men/navy-chinos/how-to-wear-with/white-t-shirt      함께 입는 아이템별 (1062+)
/men/navy-chinos/how-to-wear-with/white-crew-neck-t-shirt  더 세분화된 품목 (813+)
/men/navy-chinos/how-to-wear-with/white-sneakers     신발과의 조합 (1325+)
/men/white-chinos/how-to-wear-with/navy-long-sleeve-t-shirt  역방향 조합도 별도 페이지
```

- **아이템 ID = 색 + 품목** ("navy chinos", "white crew-neck t-shirt"). 색과 품목을 분리하지 않고 하나의 노드로 다룸 → 페이지 수가 폭발하지만 SEO엔 유리.
- **조합 페이지 = 아이템 A × 아이템 B** ("how to wear with"). 페이지 제목에 조합 수(1062+)를 노출해 신뢰감을 줌.
- 각 룩 카드: 스트리트 사진 1장 + 캡션("olive shirt jacket, white t-shirt, navy chinos, tan leather low top sneakers") + 제품 구매 링크. 캡션은 **색+소재+품목** 어순으로 통일.
- 허브 페이지에는 상황(casual / smart casual / dressy)·계절·함께 입는 품목 카테고리(상의·아우터·신발·액세서리)별 하위 링크 묶음. [세부 필터 UI는 미확인]

### 2-2. 빌려올 것

| 빌려올 요소 | 우리 적용 |
|---|---|
| 아이템을 "색+품목"으로 정의하는 노드 모델 | 데이터 스키마 `item { color, category, material }`을 그대로 쓰되, 색과 품목을 **분리된 축**으로 두어 조합 폭발을 막음 |
| "X와 함께 입기" 역방향 탐색(상의→바지, 바지→상의, 신발→바지) | Quick 경로의 기준 아이템을 상의/하의/신발/아우터 어디서든 시작 가능하게 |
| 캡션의 어순 통일(색 → 소재 → 품목) | 조합 카드 텍스트 라벨 규칙 ("화이트 코튼 티셔츠 · 인디고 데님 · 화이트 스니커즈") → 팀5 카피 가이드에 전달 |
| 상황(casual/smart)·계절 축 | MVP는 계절 토글만, 상황 프리셋은 2차 |
| 조합 수 노출("1062+") | 우리는 소수 정예라 숫자 대신 "클래식 3 · 변주 5"처럼 **개수 고정 노출** |

### 2-3. 너무 무거운 것(버릴 것)

- 수천 개 사진 룩 → 우리는 **규칙으로 생성**하므로 사진 DB 불필요.
- 아이템×아이템 전 조합 페이지(SEO 목적) → SPA 한 화면에서 기준 아이템만 바꿔 재렌더.
- 쇼핑 링크·광고·긴 스크롤 → 제거. 한 화면에 클래식 3개가 들어가야 함.
- 색 변주를 보려면 다른 페이지로 가야 하는 구조 → 같은 카드에서 색 칩을 탭해 즉시 변주.

---

## 3. 빠른 결정 모바일 UX 패턴

### 3-1. "≤3탭"에 대한 근거와 주의

- **3클릭 규칙 자체는 근거 없음**: NN/g(Page Laubheimer)는 "3-Click Rule for Navigation Is False"에서 Porter의 연구(44명·620과제·8,000+클릭)를 인용해 클릭 수가 늘어도 이탈·불만이 늘지 않았다고 정리. 중요한 건 **클릭 수가 아니라 각 클릭이 확신을 주는가** [27][28].
  → 우리 목표 "≤3탭"은 규칙이 아니라 **아침 10초 예산에서 역산한 제약**으로 문서화할 것. 탭마다 "다음에 뭐가 나올지" 예측 가능해야 함.
- **Hick's Law**: 선택지 수·복잡도에 따라 결정 시간이 증가. "무조건 적게"가 아니라 **추천 옵션을 강조해 기본값을 주는 것**이 핵심 [29][30]. → 첫 화면에 "하의 / 상의" 두 버튼 + 최근 선택 1개만.
- **Citymapper "Get me home"**: 집/회사를 저장하면 어디서든 **1탭**으로 경로 — 2014년 HN에서 "구글맵을 이긴 이유"로 꼽힘, iOS 단축어에도 `HOME_GET_ME_HOME` 액션 노출 [31][32]. → 우리의 "어제 입은 바지로 다시" 1탭 버튼의 선례.
- **Cladwell/Acloset "Today"**: 앱을 열면 오늘 코디가 바로 보이고 스와이프로 다음 [3][11]. → 홈 = 결과 화면이 되게 설계(선택 화면을 거치지 않음).

### 3-2. 엄지 영역(Thumb zone)

- Steven Hoober의 1,333건 관찰(2012–13): 49% 한 손, 36% cradle, 15% 두 손 [33]. 화면 하단·중앙이 닿기 쉽고 상단 모서리가 가장 어렵다. Hoober 본인은 후속 글에서 "도식이 경직된 제약으로 오해됐다"며 **사용자는 콘텐츠를 화면 중앙으로 옮겨 탭하는 경향**을 강조 [33][34].
  → 주요 선택 버튼은 **화면 하단 1/3 + 중앙**에, 탐색 탭 바는 하단에. 상단은 제목·계절 토글 같은 저빈도 조작만.
- **터치 타깃**: Apple HIG 44×44pt, Material 48×48dp, WCAG 2.5.8(AA) 24px 최소/2.5.5(AAA) 44px [35]. 아침 한 손 조작은 더 관대하게 → **최소 48px, 주요 버튼 56px 이상** 권장.

### 3-3. 최근/마지막 사용 단축

- Citymapper 저장 장소, Google Maps 집/회사, Spotify "최근 재생" 같은 **recents-first** 패턴은 반복 사용 앱의 표준. [Google Maps 구체 출처 미확인]
- 적용: 홈 상단(엄지 닿는 하단이 아니어도 됨 — 상단 카드는 "보기"용)에 "어제: 인디고 데님" 카드 1장. 탭하면 결과 즉시. localStorage 3개까지 보관.

### 3-4. 점진적 공개(Progressive disclosure)

- NN/g: 2차 옵션은 보조 화면으로 미뤄 기본 화면엔 1차 옵션만 [36]. 1995년 Nielsen이 오류 감소 목적으로 정립 [37].
- 적용: 결과 화면 = 클래식 3장. "더 보기" 한 번에 톤별/색상별/변주 **섹션 탭**(아코디언이 아니라 가로 탭)으로 펼침. 핏·소재·신발은 조합 카드 안의 **칩을 탭**해야 열리게(Deep 경로 ≤ 6탭 조건 충족).

### 3-5. 다크 모드 우선(아침 어두운 방)

- Material: 순수 검정 대신 **#121212 다크 그레이** 기반, 상승(elevated) 면은 더 밝은 회색, 채도 높은 색은 어두운 배경에서 "진동"하므로 **200–50 톤의 연한 색**을 액센트로 [38][39][40]. 흰 본문 텍스트 대비 15.8:1 이상.
- Apple HIG: 시맨틱 컬러 사용, 대비 최소 4.5:1·권장 7:1, 기본(base)/상승(elevated) 배경 2단 [41].
- 주의: 옷 색 칩은 **정확한 색**을 보여줘야 하므로 다크 배경에서 칩 둘레에 1px 밝은 테두리를 둬 저채도·어두운 색(네이비/차콜/블랙)이 배경에 묻히지 않게 할 것. 라이트 모드도 제공(`prefers-color-scheme` 따르되 기본 다크).

---

## 4. 사진 없이 코디를 보여주는 일러스트 접근

### 4-1. 접근 방식 비교

| 접근 | 설명 | 제작 비용 | 색 조합 자동 생성 | 정보량(핏·소재·기장) | 사례/라이브러리 |
|---|---|---|---|---|---|
| A. 플랫 SVG 실루엣 + 색 채움 | 상의·하의·신발·아우터 실루엣 path를 `fill: var(--c-top)` 등 CSS 변수로 채움 | 낮음(품목당 1 path) | ◎ 완전 자동 | △ (핏은 실루엣 종류로, 소재는 패턴 오버레이로 보완) | Smashing 40 clothing icons(CC BY 3.0, 9스타일 중 flat 포함) [42], SVG Repo CC0 의류 아이콘 [43][44] |
| B. 레이어드 가먼트 아이콘(분리 카드) | 품목별 아이콘을 카드 3~4칸에 나열(Cladwell·Whering 그리드와 동일 구조) | 낮음 | ◎ | ○ (품목마다 아이콘 교체로 핏·기장 표현 가능) | 위와 동일 자산 |
| C. 페이퍼돌 마네킹 | 사람 실루엣 위에 옷 레이어를 겹침(Humaaans·Open Peeps 방식) | 중~높음(포즈·레이어 순서·겹침 처리) | ○ (레이어 z-order 규칙 필요) | ◎ (기장·핏·레이어링이 한눈에) | Open Peeps(CC0, 옷·머리·포즈 조합) [45], Humaaans(CC0 표기, 상의·하의 교체·레고식 조립) [46], Mannequin 게임 SVG 모딩 사례: **그라데이션은 렌더 실패, 단색만 안전** [47] |
| D. 색 칩 전용 카드 | 그림 없이 색 칩 3~4개 + 품목명 | 매우 낮음 | ◎ | X | 색 팔레트 도구 일반 |

### 4-2. 자산·라이선스 메모

- **Open Peeps** — CC0, Figma/Sketch/XD 호환, SVG/PNG 제공. 손그림 톤, 옷 종류가 제한적 [45].
- **Humaaans** — 사이트에 "Free for commercial or personal use" + CC0 링크. 단, 일부 2차 출처는 "경쟁 라이브러리로 재배포 금지"라 함 → 실루엣 **참고용**으로만 쓰고 자체 제작 권장 [46][48].
- **Smashing Magazine 의류 아이콘 40종** — CC BY 3.0, 재판매 금지, flat 스타일 포함. 2017년 자산이라 품목(코듀로이·첼시부츠 등) 보강 필요 [42].
- **SVG Repo** — 아이콘별 라이선스 상이(CC0/MIT/CC BY 혼재). 사용 시 **아이콘 페이지의 라이선스 캡처 보관** [43][44].
- **Noun Project** — 아이콘별 CC BY 또는 유료 로열티프리. 이번 검색에서 직접 확인 못함 **[미확인]**.
- **패션 테크니컬 플랫(technical flats)** — 대부분 유료(Gumroad 번들 $3~, FUP Studio 1,600종) 또는 라이선스 불명 스크랩 사이트. 상업용 무료 남성복 플랫은 사실상 없음 → 직접 그리는 게 안전 [49].

### 4-3. 권장안

**A(플랫 SVG 실루엣 + CSS 변수 색 주입)를 기본으로, 결과 카드는 "상반신+하반신+신발이 한 덩어리인 단일 토르소 실루엣"으로 그리고, Deep 경로에서만 B(품목 분리 아이콘)로 전환.**

이유:
1. 솔로/소규모 프로젝트에서 **모든 색 조합을 자동 생성**하려면 품목당 path 1개가 한계 비용. 페이퍼돌(C)은 레이어 순서·겹침·포즈 때문에 품목 수가 늘수록 QA 비용이 기하급수.
2. 사진 기반 경쟁 앱이 못 하는 "같은 조합에서 색만 바꾼 변주"를 즉시 렌더할 수 있음.
3. 핏(슬림/레귤러/와이드)은 실루엣 path를 3종으로, 기장(크롭/레귤러/롱)은 path 높이 변형으로, 소재는 `<pattern>` 오버레이(데님 트윌 사선, 코듀로이 세로줄, 니트 격자)로 표현 → 계획서 5절의 기술 방향과 일치.
4. 제작 범위 제안(D2): 상의 5종(티셔츠·셔츠·니트·후디·폴로) × 핏 2 + 하의 4종(데님·치노·슬랙스·와이드) × 핏 2 + 신발 7종 + 아우터 4종 ≈ **35개 path** 이내.
5. 구현 규칙(C3): 단색 fill만 사용(그라데이션 금지 — 렌더 호환·다크모드 대비 문제 [47]), 선 두께는 다크/라이트에서 `currentColor`, 각 path에 `data-slot="top|bottom|shoes|outer"` 속성.

---

## 5. PWA 홈화면 추가 — 2025–2026 기준 정리

### 5-1. iOS Safari (iOS 17 → 18 → 26) [50][51][52]

| 항목 | 상태 |
|---|---|
| 설치 방법 | 공유 시트 → "홈 화면에 추가". **`beforeinstallprompt` 없음, `appinstalled` 없음** → 앱 내 안내 UI 필수 |
| iOS 26 변화 | **모든 사이트가 manifest 없이도 웹앱으로 설치됨**(사용자가 북마크로 옵트아웃 가능). manifest `icons`에 SVG 허용 |
| manifest 지원 | `name, short_name, scope, display, start_url, icons(15.4+), id(16.4+), theme_color(15.0+)`. **미지원**: `background_color, orientation, shortcuts, lang, dir`. `minimal-ui/fullscreen`은 `standalone`으로 폴백 |
| 아이콘 | `<link rel="apple-touch-icon" sizes="180x180">` 가 있으면 manifest 아이콘보다 우선. PNG만(SVG link는 무시). maskable 무시 |
| 상태바 | `apple-mobile-web-app-status-bar-style`은 15.0부터 deprecated → `<meta name="theme-color">` 사용. `black-translucent`만 콘텐츠를 상태바 아래까지 확장(풀스크린 느낌) |
| 스플래시 | `apple-touch-startup-image`만 동작하며 **`apple-mobile-web-app-capable=yes`가 있어야 함**(manifest 있어도) |
| safe-area | `viewport-fit=cover` + `env(safe-area-inset-*)`. **iOS 26.0→26.1에서 `safe-area-inset-top`이 0을 반환하는 회귀 버그 보고(2025-11)** → 상단 inset에 `max(env(...), 44px)` 류 폴백 [53] |
| 저장소 | 비설치 Safari 탭: 약 50MB(Cache+IDB 합산, 비공식). ITP **7일 미사용 시 스크립트 저장소 삭제**는 Safari 기준이며, **홈화면 앱은 자체 사용일 카운터**를 가져 실사용 시 리셋(WebKit 공식 입장) [54][55]. 단 iOS 15.3에서 열기만 해도 리셋 안 됐다는 보고 있음 → **localStorage 데이터(최근 선택)는 잃어도 되는 것만** 저장 |
| 설치 앱 저장소 격리 | 설치된 웹앱은 Safari와 저장소를 공유하지 않음(쿠키는 17.2부터 복사) [51][56] |
| 푸시/배지 | 16.4+ 설치 앱만. MVP 불필요 |
| 기타 제약 | 링크 캡처 없음, App Library 폴더에 안 보임, Background Sync 없음 |

### 5-2. Android Chrome [57][58][59]

- `beforeinstallprompt` 발화 조건: 미설치 + HTTPS + manifest(`name|short_name`, `icons` 192·512px, `start_url`, `display` ∈ standalone/fullscreen/minimal-ui/window-controls-overlay, `prefer_related_applications` ≠ true) + **사용자가 페이지를 1회 이상 탭 & 누적 30초 이상 체류**.
- 서비스워커 fetch 핸들러는 **설치 조건에서 제외**(Chrome 108 모바일/112 데스크톱, Lighthouse 11에서 체크 삭제) — 하지만 오프라인은 우리 핵심이므로 당연히 구현.
- **Richer Install UI**: manifest에 `description` + `screenshots`(form_factor: narrow, 320~3840px, 최대 8장) 넣으면 스토어식 하단 시트. 1장만 있어도 발동 [59].
- **Lighthouse**: PWA 카테고리는 11.2에서 제거, PSI/API는 12.0(2024-05)에서 삭제 [60][61]. → P2 검토는 Lighthouse 대신 **Chrome DevTools > Application > Manifest/Service Workers 패널 + 실기기 설치 테스트**로 대체. 성능·접근성 카테고리는 계속 사용.

### 5-3. 서비스워커 캐싱 전략(정적 사이트) [62]

- `vite-plugin-pwa` `generateSW` 모드: 빌드 산출물 **precache**(기본 css/js/html → `globPatterns`에 svg/json/woff2 추가). `registerType: 'autoUpdate'` + `cleanupOutdatedCaches: true`.
- 데이터(JSON)·SVG는 precache로 **설치 시점에 전부 받아두기**(총 용량 < 2MB 목표라 가능). 런타임 캐시는 폰트 정도만 CacheFirst.
- `navigateFallback: '/index.html'`(SPA) — GitHub Pages 서브경로 배포 시 `base` 경로 일치 확인.
- 업데이트 UX: autoUpdate면 새 버전 적용 시 리로드 → 아침 사용 중 리로드가 거슬릴 수 있으므로 **다음 실행 시 적용**(`skipWaiting` 지연) 검토.

### 5-4. 체크리스트

```
[ ] HTTPS (호스팅 기본 제공)
[ ] manifest.webmanifest: name, short_name(한글 8자 이내 권장), start_url, scope, display:"standalone",
    theme_color, background_color(Android용), icons 192/512 PNG + maskable 512, id, description, screenshots[narrow]
[ ] <link rel="manifest">, <meta name="theme-color" media="(prefers-color-scheme: dark)"> 2종
[ ] <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">  (PNG, 투명 없음)
[ ] <meta name="apple-mobile-web-app-capable" content="yes">, apple-mobile-web-app-title
[ ] <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
[ ] CSS: padding-top: max(env(safe-area-inset-top), 44px) 류 폴백, 하단 탭바 padding-bottom: env(safe-area-inset-bottom)
[ ] apple-touch-startup-image (선택; 없으면 마지막 스크린샷 사용됨)
[ ] 서비스워커 precache에 data/*.json, assets/silhouettes/*.svg 포함
[ ] 설치 상태 감지: matchMedia('(display-mode: standalone)') || navigator.standalone
[ ] 미설치 시 안내 배너: iOS = "공유 → 홈 화면에 추가" 그림 안내 / Android = beforeinstallprompt 저장 후 버튼으로 prompt()
[ ] 배너는 2회 방문 후·하루 1회만, 닫으면 7일 숨김(localStorage)
[ ] iOS 저장소 손실 대비: localStorage는 '최근 선택·즐겨찾기'만, 없어도 동작
[ ] 실기기 테스트: iOS 18/26 Safari, Android Chrome 최신, 비행기 모드에서 홈 아이콘 실행
[ ] DevTools Application 패널 manifest 경고 0건 (Lighthouse PWA 카테고리는 없음)
```

---

## 6. 무료 HTTPS 정적 호스팅 비교 (Vite 정적 PWA 기준)

| 항목 | GitHub Pages [63] | Cloudflare Pages [64] | Vercel Hobby [65] | Netlify Free [65] |
|---|---|---|---|---|
| 대역폭 | 100GB/월(소프트) | **무제한(정적)** | 100GB/월 | 300 크레딧/월 → 약 15~30GB |
| 빌드 | 10회/시간(소프트), Actions로 배포 시 Actions 분 사용 | 500회/월, 동시 1, 20분 제한 | 100 배포/일 | 크레딧 소모(빌드당 15) |
| 용량 | 사이트 1GB | 파일 20,000개, 파일당 25MiB | — | — |
| 상업적 사용 | **금지**(ToS) | 허용 | **비상업 한정** | 허용 |
| HTTPS/커스텀 도메인 | 자동 Let's Encrypt | 자동, 100 도메인 | 자동 | 자동 |
| SPA 폴백/헤더 | `404.html` 트릭만, 커스텀 헤더 불가 | `_redirects`, `_headers` 지원 | `vercel.json` | `_redirects`, `_headers` |
| 서브경로 | `user.github.io/repo/` (base 설정 필요) | 루트 도메인 `*.pages.dev` | 루트 `*.vercel.app` | 루트 `*.netlify.app` |
| 배포 방식 | git push + Actions | git 연동 또는 wrangler CLI 직접 업로드 | git 연동 | git 연동 / CLI |
| 리스크 | 상업화 시 이전 필요 | 2025-04부터 Workers로 통합 중(기능은 유지) | 상업화 시 Pro $20 | 2025-09 크레딧제 전환으로 예측 어려움 |

**권장 기본값: Cloudflare Pages.** 이유: 루트 도메인(서브경로 `base` 문제 없음 → SW scope·manifest `start_url` 단순), `_headers`로 `Cache-Control`·`Service-Worker-Allowed` 제어 가능, 대역폭 무제한, 상업화해도 그대로. 코드 저장소는 GitHub에 두고 Cloudflare가 가져가게 연결. **대안**: 저장소만 있으면 끝나는 GitHub Pages(비상업 전제, `vite.config` `base: '/morning-coordi/'` 필요).

---

## 7. 한국 남성이 아침에 실제로 겪는 어려움 (커뮤니티·매체)

출처: 블라인드 "내일 뭐입징"(2022) [66], GQ Korea "매일 입을 옷 고민 줄이는 법 7" [67], GQ "사무실 복장" [68], 머니투데이 [69], 블라인드 "상하의 컬러 조합" [70], 클리앙 강좌 [71], 브런치 [72], 다모앙 [73]. 남성 직장인 대상 정량 설문은 찾지 못함 **[갭]**.

- **전날 안 정하면 아침에 허둥댐**: "전날에 뭐 입을지 미리 생각 안 해두면 아침에 허둥대서 싫더라" — 가장 많이 공감받은 대응은 주말에 일주일치 미리 정하기·전날 밤 준비 [66][67]. → 우리 앱은 "전날 밤 미리 보기"와 "아침 즉답" 둘 다 1탭이어야 함.
- **옷은 많은데 입을 옷이 없다**: 정리가 안 돼 조합이 안 보임. GQ는 "블랙·화이트·네이비·베이지처럼 **색감별로 정리**하면 조합이 빨리 보인다"고 조언 [67]. → 색 축 중심 IA의 근거.
- **색 조합 자신감 부족**: "상하의 컬러 조합 궁금한 게 있어 패션전공자들" 류 질문 반복. 답변은 "명도 대비(진한 상의엔 연한 하의)" "흰·크림은 어디든" "회색 상하의는 명도·질감 차이" 등 **규칙 몇 개로 수렴** [70][71]. 검은색·밤색 계열은 초보가 다루기 까다롭다는 조언도 [68 계열]. → 클래식 규칙 3개 고정 노출이 답.
- **비즈니스 캐주얼 전환으로 코디가 더 어려워짐**: 예전엔 정장+흰 셔츠+넥타이로 끝났지만 캐주얼화되며 선택지가 폭증 [69]. → 상황 프리셋(출근) 2차 반영.
- **결정 피로 → '퍼스널 유니폼'**: 잡스식 같은 옷 반복, "실패 확률 낮은 조합 몇 개(데님+셔츠, 슬랙스+니트)를 정해두면 고민 시간이 크게 줄어든다" [67]. 블라인드에서도 "유니폼 있었으면", "같은 스타일 색만 바꿔 요일별 로테이션" [66]. → **같은 조합의 색 변주**가 핵심 기능이라는 뒷받침.
- **옷장 앱의 초기 등록 부담**: "옷 전부 등록하는 게 처음에 귀찮다"는 댓글 [66]. → 등록 없는 구조의 가치.
- **계절·날씨 변동기 레이어링 고민**: 환절기 아우터 유무 판단이 어렵다는 언급(매체) [67]. → 계절 토글 + 아우터 색 추천 포함.
- **입던 옷만 입게 됨(편중)**: 사진으로 기록해 두지 않으면 같은 옷만 반복 [66]. → "최근 선택" 기록이 역으로 "다른 색도 시도" 넛지로 쓰일 수 있음(2차).

---

## 우리 서비스에 적용할 결정 제안

**UX (D1)**
1. **홈 = 결과 화면.** 첫 실행만 "하의/상의 중 하나 고르기", 이후엔 마지막 선택의 클래식 3조합이 바로 보이고(Acloset Today's Look·Cladwell 방식), 상단 작은 카드로 "다른 아이템으로" 전환. 최근 선택 3개는 localStorage.
2. **Quick 경로 탭 수를 고정**: ① 카테고리(하의/상의/신발/아우터 — 하단 2×2 큰 버튼) → ② 색 칩 그리드(최대 12색, 56px 이상) → 결과. 2탭. 계절 토글은 결과 화면 상단에서 사후 변경.
3. **클릭 수보다 예측 가능성**: 각 버튼에 "다음에 뭐가 나오는지"가 보이게(색 칩에 색 이름 병기, 결과 카드에 "클래식 1/3" 라벨). 3클릭 규칙은 근거가 아니라 10초 예산의 결과임을 UX 문서에 명시.
4. **점진적 공개 2단계만**: 결과(클래식 3) → "더 보기" 탭 바(톤별 | 색상별 | 변주) → 카드 내 칩 탭(핏·소재·신발 상세). Deep 경로 ≤ 6탭.
5. **설치 안내 배너**: iOS는 공유 아이콘 그림 + "홈 화면에 추가" 3단계 그림, Android는 `beforeinstallprompt` 저장 후 버튼. 2회 방문 후 노출, 닫으면 7일 숨김.

**비주얼 (D2)**
6. **일러스트 = 플랫 SVG 실루엣 단일 토르소 + CSS 변수 색 주입(4-3절 A안)**. 단색 fill만, 그라데이션 금지, 소재는 `<pattern>` 오버레이. 품목 path 35개 이내로 시작. 외부 아이콘은 CC0(SVG Repo 개별 확인, Open Peeps)만 참고하고 최종 path는 자체 제작.
7. **색 칩 규칙**: 카드마다 칩 3~4개(상·하·신발·아우터 순, Lookastic 캡션 어순 "색·소재·품목"으로 라벨), 다크 배경에서 1px 밝은 테두리. 팀5와 색 이름 표준표 공유.
8. **다크 모드 기본**: 배경 #121212 계열(순흑 금지), 상승면 2단, 액센트는 저채도 밝은 톤, 텍스트 대비 ≥ 7:1 권장. `theme-color` 메타를 라이트/다크 2종.

**기술 (C1/C2/C3)**
9. **호스팅 = Cloudflare Pages**(루트 도메인, `_headers`, 대역폭 무제한). 저장소는 GitHub. 상업화 가능성이 0이고 최단 경로를 원하면 GitHub Pages + `base` 설정.
10. **PWA 구성**: `vite-plugin-pwa generateSW`, precache에 JSON·SVG 포함(총 < 2MB), `autoUpdate`이되 활성 세션 중 리로드 금지(다음 실행 적용). 5-4 체크리스트를 C1 DoD로 채택. Lighthouse PWA 카테고리는 없으므로 P2는 DevTools Application 패널 + 실기기 비행기 모드 테스트.
11. **iOS 방어**: `apple-touch-icon` 180px PNG, `apple-mobile-web-app-capable`, `viewport-fit=cover` + `max(env(safe-area-inset-top), 44px)` 폴백(iOS 26.1 회귀), localStorage는 잃어도 되는 데이터만.
12. **데이터 모델에서 색과 품목을 분리**(Lookastic은 "navy-chinos"를 한 노드로 묶어 페이지가 폭발). `item = category × color × material × fit`, 조합 규칙은 색·소재·핏 축별 점수 합산 → 변주 생성이 공짜가 되게.

---

## 갭 (추가 조사 필요)
- Lookastic 실제 페이지 UI(필터 명칭·정렬)는 봇 차단으로 직접 확인 못함 → 팀원 중 한 명이 모바일 브라우저로 스크린샷 3장(허브·how-to-wear-with·looks) 확보 권장.
- 한국 남성 직장인의 "아침 옷 고르는 시간" 정량 설문 없음. 체감 근거는 커뮤니티 정성 자료.
- Noun Project 의류 아이콘 라이선스·품질, Figma Community의 남성 플랫 템플릿 라이선스는 직접 확인 못함.
- Acloset·Cladwell의 결과 화면 실제 스크린샷(탭 수 검증)은 앱 설치 후 재확인 필요.

---

## 출처

**1절 — 앱/사이트**
1. Acloset App Store(KR): https://apps.apple.com/kr/app/id1542311809
2. Alta Daily, Best Closet Apps in 2025: https://altadaily.com/blog/best-closet-apps
3. Acloset 5.33.0 업데이트 공지(Today's Look): https://www.acloset.app/announcements/5-33-0-update-news-674a9a
4. Fits, Top 8 closet & outfit planner apps reviewed: https://www.fits-app.com/posts/top-8-closet-outfit-planning-apps-reviewed
5. Whering, Best wardrobe apps 2025: https://whering.co.uk/best-wardrobe-apps-2025
6. Stork.ai Whering: https://www.stork.ai/en/whering
7. Indyx, Whering vs Indyx: https://myindyx.com/versus/whering-vs-indyx
8. Indyx, Stylebook vs Cladwell: https://myindyx.com/versus/stylebook-vs-cladwell
9. Indyx, Indyx vs Stylebook: https://www.myindyx.com/versus/indyx-vs-stylebook
10. Indyx, Cladwell vs Indyx: https://www.myindyx.com/versus/indyx-vs-cladwell
11. Stork.ai Cladwell: https://www.stork.ai/en/cladwell
12. Whering 공식 사이트(구): https://whering.co.uk/
13. Geekflare, Outfit planner apps: https://geekflare.com/outfit-planner-apps
14. StartupHub Combyne: https://www.startuphub.ai/startups/combyne.md
15. Pureple App Store: https://apps.apple.com/app/id628106373
16. Stanford CS147 #OOTD 프로젝트(Pureple 평가): https://web.stanford.edu/class/cs147/projects23/UnintentionalGood/%23OOTD/assets/slides/a4.pdf
17. AlternativeTo, Smart Closet: https://alternativeto.net/software/smart-closet--fashion-style/about
18. Lookastic Navy Chinos looks: https://lookastic.com/men/navy-chinos/looks
19. Lookastic Navy Chinos with White T-shirt: https://lookastic.com/men/navy-chinos/how-to-wear-with/white-t-shirt
20. Lookastic Navy Chinos with White Sneakers: https://lookastic.com/men/navy-chinos/how-to-wear-with/white-sneakers
21. Mr Porter, Everything You Ever Wanted To Know About Wearing Colour: https://www.mrporter.com/en-kr/journal/fashion/how-to-wear-bold-colour-770058
22. Man of Many, Mytheresa menswear edit: https://manofmany.com/style/mytheresa-professional-edit-menswear
23. 무신사 뉴스룸(상품 상세 코디 탭): https://newsroom.musinsa.com/newsroom-menu/2021-1028-03
24. 바이라인네트워크(스냅-구매 연결): https://byline.network/2022/02/4-123
25. 이투데이, 무신사 스토어 UI·UX 개편: https://www.etoday.co.kr/news/view/2390140
26. 코디북 App Store: https://apps.apple.com/kr/app/id1052178370

**3절 — UX 패턴**
27. Wikipedia, Three-click rule(NN/g Laubheimer 인용): https://en.wikipedia.org/wiki/Three-click_rule
28. Elezea, Not about the clicks: https://elezea.com/2019/08/not-about-the-clicks/
29. Laws of UX, Hick's Law: https://lawsofux.com/hicks-law/
30. Uxcel, Hick's Law in UX design: https://uxcel.com/blog/hicks-law-in-ux-design-simplifying-choices-for-faster-decisions
31. Citymapper(집/회사 1탭): https://citymapper.com/news/710/welcome-hong-kong
32. alexwlchan, Home: Get me home 단축어: https://alexwlchan.net/notes/2026/home-get-me-home/
33. Monterail, Thumb-friendly navigation(Hoober 연구 요약): https://www.monterail.com/blog/thumb-friendly-navigation-word-oriented-design
34. Addy Osmani, Modern touch-friendly design: https://addyosmani.com/blog/touch-friendly-design/
35. Front-End Checklist, Touch targets(HIG 44pt/Material 48dp/WCAG 2.5.8): https://frontendchecklist.io/rules/accessibility/touch-targets
36. NN/g, Progressive Disclosure(video): https://www.nngroup.com/videos/progressive-disclosure/
37. UXPin, What is Progressive Disclosure: https://www.uxpin.com/studio/?p=41489
38. Material Design 2, Dark theme: https://m2.material.io/design/color/dark-theme
39. Google Codelab, Design a dark theme: https://codelabs.developers.google.com/codelabs/design-material-darktheme/
40. UX Planet, 8 tips for dark theme design: https://uxplanet.org/8-tips-for-dark-theme-design-8dfc2f8f7ab6
41. Apple HIG, Dark Mode: https://developer.apple.com/design/human-interface-guidelines/dark-mode

**4절 — 일러스트 자산**
42. Smashing Magazine, Clothing Icons freebie(CC BY 3.0): https://www.smashingmagazine.com/2017/01/freebie-clothing-icons-9-styles-ai-eps-svg-png/
43. SVG Repo clothes(filled): https://www.svgrepo.com/vectors/clothes/filled/3
44. AllSVGIcons, SVGRepo 라이선스 비교: https://allsvgicons.com/compare/svgrepo-alternatives/
45. Open Peeps(CC0): https://www.openpeeps.com/
46. Humaaans: https://www.humaaans.com/
47. itch.io Mannequin 커스텀 SVG 옷(그라데이션 미렌더): https://itch.io/t/1773975/custom-clothing-inkscape-gradients
48. AllSVGIcons, CC0 illustration libraries: https://allsvgicons.com/cc0-illustrations/
49. Techpacker, Fashion flat sketches: https://techpacker.com/blog/what-you-need-to-know-about-fashion-flat-sketches/

**5절 — PWA**
50. firt.dev, PWA on iOS 현황(2026-10 갱신): https://firt.dev/notes/pwa-ios/
51. MagicBell, PWA iOS limitations: https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide
52. Apple, Configuring Web Applications(apple-touch-icon 등): https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html
53. WebKit Bugzilla, iOS 26.1 safe-area-inset-top 0 회귀: https://bugs.webkit.org/show_bug.cgi?id=301994
54. The Register, Apple ITP 7일 저장소 해명: https://www.theregister.com/2020/03/26/apple_relax_were_not_totally/
55. WebKit Bugzilla, 홈화면 앱 7일 로그아웃 보고: https://bugs.webkit.org/show_bug.cgi?id=237350
56. web.dev, PWA detection(display-mode, 저장소 격리): https://web.dev/learn/pwa/detection
57. web.dev, Install criteria: https://web.dev/articles/install-criteria
58. Chrome blog, Update install criteria(SW fetch 요건 제거): https://developer.chrome.com/blog/update-install-criteria
59. web.dev, Richer install UI: https://web.dev/articles/web-apps/richer-install-ui
60. Chrome blog, What's new in Lighthouse 11: https://developer.chrome.com/blog/lighthouse-11-0/
61. PageSpeed Insights release notes(Lighthouse 12, PWA 카테고리 제거): https://developers.google.com/speed/docs/insights/release_notes
62. vite-plugin-pwa 설정 문서: https://tessl.io/registry/tessl/npm-vite-plugin-pwa/files/docs/plugin-configuration.md

**6절 — 호스팅**
63. GitHub Docs, GitHub Pages limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
64. Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits
65. Agentdeals, Hosting free tier comparison 2026(Vercel/Netlify): https://agentdeals.dev/hosting-free-tier-comparison-2026

**7절 — 한국 커뮤니티**
66. 블라인드, 내일 뭐입징: https://www.teamblind.com/kr/post/내일-뭐입징-zqJBsdqt
67. GQ Korea, 매일 입을 옷 고민 줄이는 법 7: https://www.gqkorea.co.kr/?p=377891
68. GQ Korea, 사무실 복장 진짜 중요할까: https://www.gqkorea.co.kr/?p=304150
69. 머니투데이, 남자들이여 자존심 버리고 따라해: https://www.mt.co.kr/living/2010/04/08/2010040809082223646
70. 블라인드, 상하의 컬러 조합 질문: https://www.teamblind.com/kr/post/상하의-컬러-조합-궁금한게-있어-패션전공자들-dMyvTpz8
71. 클리앙 강좌(상하의 명도 조합): https://www.clien.net/service/board/lecture/14975675
72. 브런치, 나를 고르는 아침의 문턱: https://brunch.co.kr/@cphchoi/168
73. 다모앙 자유게시판: https://damoang.net/free/453717
