# 남성복 클래식 컬러 매칭 규칙 (R1 컬러 리서치)

작성일: 2026-10-19
담당: R1 컬러 리서치
용도: C2 데이터/규칙 엔진이 `colorRule`·`outfit` JSON으로 바로 변환할 수 있는 원시 데이터 표

> 표기 규칙
> - 색 이름: 한국어(영어) 형식. JSON에서 쓸 `id`는 1장 표의 `id` 열을 그대로 사용.
> - `score` 1~5: 5 = 거의 항상 안전, 4 = 안전, 3 = 조건부(톤·소재 주의), 2 = 모험, 1 = 비추천.
> - `tag`: **classic** = 출처 2개 이상이 추천하거나 업계 통념으로 확립된 조합 / **variation** = 통하지만 더 과감하거나 출처 1개.
> - 출처 코드([WH1], [GG] 등)는 마지막 "출처" 장의 키와 대응.
> - 출처 간 의견이 갈리는 항목은 "⚠ 이견" 으로 표시하고 8장에 모아 정리.

---

## 1. 표준 컬러 어휘 (32색)

hex 값은 CSS/X11 표준 또는 Wikipedia 등재 값을 우선 채택. 의류 전용 색(데님 워시, 오트밀, 그레이 멜란지 등)은 표준 코드가 없어 **근사값**으로 표시했고, D2가 디자인 토큰 단계에서 미세 조정 가능. hex 값 출처는 [HEX] 참고.

| id | 한국어(영어) | hex | 톤 그룹 | 비고 |
|---|---|---|---|---|
| white | 화이트(White) | #FFFFFF | 뉴트럴 | CSS |
| offWhite | 오프화이트/에크루(Off-white / Ecru) | #F2EDE4 | 뉴트럴 | 근사값. Wikipedia 'Ecru' #C2B280은 의류 에크루보다 훨씬 어두워 미채택 |
| cream | 크림(Cream) | #FFFDD0 | 뉴트럴 | Wikipedia |
| oatmeal | 오트밀(Oatmeal) | #D9CFC1 | 뉴트럴 | 근사값(표준 없음). 니트 전용 |
| beige | 베이지(Beige) | #F5F5DC | 뉴트럴·어스 | CSS. 치노 표시용은 더 어둡게 조정 권장 |
| khaki | 카키(Khaki) | #C3B091 | 어스 | Wikipedia 'Khaki'. 한국에서 '카키'가 올리브를 뜻하기도 하나 본 문서는 **황갈색 치노색**으로 고정 |
| tan | 탄(Tan) | #D2B48C | 어스 | CSS |
| camel | 카멜(Camel) | #C19A6B | 어스 | Wikipedia |
| brown | 브라운(Brown) | #8B5A2B | 어스 | 근사값(중간 갈색, 코듀로이·가죽) |
| chocolate | 초콜릿/다크브라운(Chocolate / Dark brown) | #5C4033 | 어스 | Wikipedia 'Dark brown' |
| lightGrey | 라이트 그레이(Light grey) | #D3D3D3 | 모노 | CSS |
| greyMelange | 그레이 멜란지(Grey melange / Marl) | #A9A9A9 | 모노 | CSS 'darkgray' 근사. 티셔츠·맨투맨 전용 |
| midGrey | 미드 그레이(Mid grey) | #808080 | 모노 | CSS |
| charcoal | 차콜(Charcoal) | #36454F | 모노 | Wikipedia |
| black | 블랙(Black) | #000000 | 모노 | CSS. 화면 표시는 #141414 권장 |
| navy | 네이비(Navy) | #1F2A44 | 네이비 베이스 | 근사값. CSS navy #000080은 채도가 너무 높아 의류 네이비와 괴리 |
| indigo | 인디고 데님(Indigo denim) | #2E4A7D | 네이비 베이스 | 근사값(진청·원워시) |
| midDenim | 미드워시 데님(Mid-wash denim) | #1560BD | 네이비 베이스 | Wikipedia 'Denim' |
| lightDenim | 라이트워시 데님(Light-wash denim) | #9DB9D4 | 네이비 베이스·파스텔 | 근사값(연청) |
| blackDenim | 블랙 데님(Black denim) | #2B2B2B | 모노 | 근사값(워시드 블랙) |
| lightBlue | 라이트 블루(Light blue) | #ADD8E6 | 파스텔 | CSS. 옥스포드 셔츠 |
| skyBlue | 스카이 블루(Sky blue) | #87CEEB | 파스텔 | CSS |
| olive | 올리브(Olive) | #4B5320 | 어스 | Wikipedia 'Olive drab' |
| forestGreen | 포레스트 그린(Forest green) | #228B22 | 포인트 | CSS. 실제 의류는 더 어두운 #1F4D2B 권장 |
| sage | 세이지(Sage) | #BCB88A | 어스·파스텔 | Wikipedia |
| burgundy | 버건디(Burgundy) | #800020 | 포인트 | Wikipedia |
| rust | 러스트/번트오렌지(Rust / Burnt orange) | #B7410E | 포인트·어스 | Wikipedia 'Rust' |
| mustard | 머스터드(Mustard) | #FFDB58 | 포인트 | Wikipedia |
| dustyPink | 더스티 핑크(Dusty pink) | #D8A7A7 | 파스텔 | 근사값 |
| lavender | 라벤더(Lavender) | #E6E6FA | 파스텔 | CSS |
| teal | 틸(Teal) | #008080 | 포인트 | CSS |
| taupe | 토프(Taupe) | #483C32 | 어스 | Wikipedia |

표 1 행 수: 32

---

## 2. 톤 그룹과 섞는 규칙

### 2-1. 톤 그룹 정의

| 톤 그룹 id | 한국어(영어) | 소속 색 id | 성격 |
|---|---|---|---|
| neutral | 뉴트럴(Neutral) | white, offWhite, cream, oatmeal, beige, lightGrey, midGrey, charcoal, black, navy, khaki, tan, brown, olive, lightBlue | 옷장의 뼈대. 서로 거의 다 섞임. RMRS는 블랙·화이트·그레이·네이비·라이트/스카이블루·브라운·카키·올리브를 뉴트럴로 정의 [RMRS1]. Westwood Hart는 '그레이·네이비/블루·화이트/크림/베이지'를 1차 기반, 브라운·블랙을 2차로 둠 [WH2] |
| earth | 어스톤(Earth tone) | beige, khaki, tan, camel, brown, chocolate, olive, sage, rust, taupe, oatmeal | 따뜻하고 탁한 자연색. 서로 톤온톤이 쉬움 [VK2][WH1] |
| mono | 모노톤(Monotone) | white, lightGrey, greyMelange, midGrey, charcoal, black, blackDenim | 무채색. 명도 차이·질감으로 변화를 줘야 '시멘트 덩어리'가 안 됨 [MF][RMRS2] |
| navyBase | 네이비 베이스(Navy base) | navy, indigo, midDenim, lightDenim, lightBlue, skyBlue | 블루 계열 톤온톤. 가장 실패가 적은 기반색 [PS1][WH2] |
| accent | 포인트 컬러(Accent) | burgundy, rust, mustard, forestGreen, teal | 한 아이템에만, 전체의 10~30% 이내 [Vou1][RMRS1] |
| pastel | 파스텔(Pastel) | lightBlue, skyBlue, dustyPink, lavender, sage, lightDenim, cream | 봄·여름용 저채도 밝은 색. 뉴트럴 위에 얹음 [WH1][AtG1] |

(한 색이 두 그룹에 속할 수 있음. JSON에서는 `tone: []` 배열로.)

### 2-2. 톤 그룹 섞기 규칙

| # | 규칙 | 근거 |
|---|---|---|
| T1 | **뉴트럴 + 뉴트럴**은 항상 OK. 단 같은 그룹 내 명도 차를 둘 것 (올화이트, 올그레이 주의) | [RMRS1][MF][FB3] |
| T2 | **어스 + 어스** = 톤온톤. 밝은 색(화이트·아이보리)을 한 점 끼우면 깔끔해짐 | [VK2][AtG1][WK2] |
| T3 | **어스 + 네이비 베이스** = 가장 안정적인 교차 조합 (베이지 치노+네이비 니트, 인디고 데님+브라운 부츠). 블루-오렌지(브라운) 보색 원리 | [GG][Acorn][Celio] |
| T4 | **모노 + 네이비 베이스** = 가능. 블랙과 네이비는 명도 차가 분명한 네이비(밝은 쪽)를 쓸 것 ⚠ 이견(8장) | [MRP][FB4][Esq] |
| T5 | **모노(블랙) + 어스** = 조건부. 블랙+브라운 가죽을 한 코디에 섞지 않기. 블랙 상의+카멜 코트 같은 큰 면적 대비는 '럭셔리' 조합 ⚠ 이견 | [MM][WH2][VK2] |
| T6 | **포인트 컬러는 1개만**, 나머지 2색은 뉴트럴. 3색 규칙 | [Vou1][WH1][RMRS1] |
| T7 | **파스텔은 뉴트럴 하의(화이트·베이지·라이트그레이·네이비) 위에** 상의로. 파스텔끼리 두 개 이상은 변주 | [WH1][AtG1] |
| T8 | 무채색을 섞을 때 **가죽(신발·벨트·시계줄)은 한 색으로** 통일(올블랙 또는 올브라운) | [WH2][MM] |
| T9 | 탁한(muted) 색은 여러 개 섞여도 괜찮지만, 선명한 색은 하나만 | [WH1][RMRS 색상환] |

표 2-2 행 수: 9

---

## 3. 색상환 논리 (남성복 적용)

| 원리 | 설명 | 남성복 예시 | 근거 |
|---|---|---|---|
| 유사색(Analogous) | 색상환에서 이웃한 색. 대비가 적고 절제된 인상 | 네이비+올리브(블루-그린), 네이비+라벤더/퍼플, 브라운+러스트, 올리브+머스터드 | [RMRS 색상환][WH1] |
| 보색(Complementary, muted) | 반대편 색. 남성복에서는 **탁한 버전**으로만. 선명한 빨강+초록은 크리스마스 룩 | 블루+오렌지 → 인디고 데님+러스트 니트, 네이비+카멜/브라운; 그린+레드 → 올리브+버건디, 포레스트 그린 재킷+버건디 니트 | [WH1][GG][RMRS1] |
| 톤온톤/모노크롬(Tonal) | 한 색상 계열에서 명도만 바꿈. 2~3단계 명도 차 + 질감 차이 필수 | 네이비 재킷+미드 데님+라이트블루 셔츠; 차콜+라이트그레이; 카멜+베이지+크림; 올리브+세이지+카키 | [FB3][WH1][AtG1][Vou2] |
| 3색 최대 규칙 | 눈에 보이는 색 그룹은 3개까지. 2뉴트럴+1비뉴트럴, 또는 보색 2개+뉴트럴 1개. 4번째는 작은 뉴트럴(신발·벨트)이면 허용 | 인디고+화이트+브라운(신발) = 3색 | [Vou1][WH1] |
| 밝은 상의·어두운 하의 | 기본 관례. 시선이 위로 가고 안정감. 반대(어두운 상의+밝은 하의)는 여름·화이트 팬츠 때 변주로 | 화이트 티+인디고 vs 네이비 니트+크림 팬츠 | [Vou2][FB2][WK1] |
| 신발은 바지보다 어둡게 | 클래식 규칙(PS). 밝은 바지+진한 신발이 안정. 예외: 라이트워시·화이트 팬츠엔 화이트 스니커즈·탄 스웨이드도 OK | 차콜 바지엔 블랙 또는 다크브라운, 미드그레이엔 미드/다크브라운 | [PS2][Dapp][Fitville] |
| 피부·머리 대비 | 머리-피부 대비가 큰 사람(검은 머리+밝은 피부=한국인 다수)은 고대비 조합(네이비+화이트, 블랙+화이트)이 어울림. 저대비(밝은 머리·밝은 피부)는 톤온톤·파스텔. 전체 결정의 약 10% 비중 | 한국 사용자 기본값: 고대비 OK. 다만 GG는 중간 톤 피부에 블랙+화이트 극단 대비 주의 | [RMRS3][RMRS1][GG][WH1] |
| 피부 언더톤 | 웜톤: 브라운·러스트·머스터드·올리브 / 쿨톤: 네이비·그레이·버건디·포레스트. 라이트블루 셔츠는 거의 모두에게 무난 | 앱에서는 선택 사항(2차 기능) | [WH1] |

표 3 행 수: 8

---

## 4. 하의 기준 페어링 (12 베이스)

각 베이스마다 상의 / 신발 / 아우터 표 + 피해야 할 조합. `score`·`tag` 열을 그대로 JSON으로.

### 4-1. 인디고 데님 `indigo` (진청)

**상의**

| 상의 색 | score | tag | 근거 |
|---|---|---|---|
| white | 5 | classic | [WK1][GQK][AtG1][Celio] 흰 티+진청은 '불멸의 조합' |
| greyMelange | 5 | classic | [FB1][Hack][Vou1] |
| navy | 4 | classic | 톤온톤. 명도 차 필요 [FB3][Celio] |
| lightBlue | 4 | classic | 블루 톤온톤 셔츠 [WH1][FB1] |
| oatmeal / cream | 4 | classic | 니트 [VK1][AtG4] |
| beige | 4 | classic | [Celio][WH1] |
| olive | 4 | classic | [AtG4][Celio] |
| black | 4 | classic | [FB1][WH1] 블랙 티+진청 |
| burgundy | 4 | classic | 버건디 니트+다크 데님 [AtG4][Studio] |
| rust | 3 | variation | 블루-오렌지 보색 [WH1] |
| brown / chocolate | 3 | variation | 브라운 니트+데님 [AtG4] |
| charcoal | 4 | classic | [FB1][MF] |
| dustyPink | 3 | variation | 뉴트럴 위 파스텔 [WH1] |

**신발**

| 신발 색 | score | tag | 근거 |
|---|---|---|---|
| white (스니커즈) | 5 | classic | [GQK][AtG1][Celio] |
| brown / chocolate (부츠·로퍼) | 5 | classic | [GG][VK1][AtG2] 데님+브라운은 보색 원리 |
| tan (스웨이드) | 4 | classic | [Dalm][GG] |
| black (부츠·더비) | 3 | variation | ⚠ 이견: GG는 데님+블랙 구두 비추천, FB·Allure는 블랙 재킷+구두로 격 올리기 제안. 진청엔 가능, 연청엔 비추천 |
| navy (스니커즈·데크슈즈) | 3 | variation | [FB2] |
| burgundy (로퍼) | 3 | variation | [AtG4] |

**아우터**

| 아우터 색 | score | tag | 근거 |
|---|---|---|---|
| navy (블레이저·필드재킷) | 5 | classic | [Hack][Celio][WH2] |
| camel / beige (코트·트렌치) | 5 | classic | [WH1][VK1] |
| olive (필드재킷·초어) | 4 | classic | [AtG4][MM] |
| charcoal / midGrey (코트·블레이저) | 4 | classic | [FB1][RMRS2] |
| brown (스웨이드·레더) | 4 | classic | [FB1][VK1][AtG1] |
| black (레더·코트) | 3 | variation | 블랙 재킷+진청 [Allure][FB1] |
| indigo (데님 재킷, 더블데님) | 2 | variation | 워시 톤이 달라야 함 [AtG3] |

**피하기**

| 조합 | 이유 |
|---|---|
| 같은 워시의 데님 재킷 | 유니폼처럼 보임 [AtG3] |
| 4색 이상 | 3색 규칙 [Vou1] |

### 4-2. 라이트워시 데님 `lightDenim` (연청)

**상의**

| 상의 색 | score | tag | 근거 |
|---|---|---|---|
| white | 5 | classic | [PM][Allure] |
| greyMelange / lightGrey | 4 | classic | 대비 약해 자연스러움 [PM][Hack] |
| navy | 4 | classic | 명도 대비 안정 [Celio][StyleGF] |
| lightBlue / skyBlue | 4 | classic | 톤온톤 [WH1][PM] |
| beige / oatmeal | 4 | classic | 밝은 뉴트럴끼리 [WK2][PM] |
| black | 3 | variation | PM: 연청과 너무 강한 대비는 '반 잘린' 느낌 → 조건부 |
| sage / dustyPink | 3 | variation | 봄 파스텔 [WH1] |
| olive | 3 | variation | [MM] 데님 재킷 역방향 근거 |

**신발**

| 신발 색 | score | tag | 근거 |
|---|---|---|---|
| white (스니커즈) | 5 | classic | [PM][MSR][VK3] |
| tan / brown (스웨이드 부츠) | 4 | classic | [PM][MSR] |
| navy (캔버스) | 3 | variation | [FB2] |
| black | 2 | variation | ⚠ 이견: 대부분 '어두운 신발은 무겁다'며 비추 [MSR][GG]; 일부는 블랙 로퍼 OK [StyleGF] |

**아우터**

| 아우터 색 | score | tag | 근거 |
|---|---|---|---|
| navy (블레이저·봄버) | 5 | classic | [PM][StyleGF] |
| beige / camel | 4 | classic | 밝은 톤 연결 [WK2] |
| olive | 4 | classic | [MM] |
| midGrey | 3 | variation | [PM] 블레이저 |
| indigo (데님 재킷) | 3 | variation | 진한 워시 재킷+연청 바지 = 톤 차이 있는 더블데님 [AtG3] |
| black | 2 | variation | 연청과 강한 대비 |

**피하기**: 연청+블랙 구두(무거움, [MSR][GG]), 연청+배기핏(PM: 핏이 더 중요), 포멀 자리.

### 4-3. 블랙 데님 `blackDenim`

**상의**

| 상의 색 | score | tag | 근거 |
|---|---|---|---|
| white | 5 | classic | [FB1][AtG1] 흑백 70/30 |
| greyMelange / lightGrey | 5 | classic | [FB1] |
| black | 4 | classic | 올블랙, 질감 차이 필요 [FB1][AtG2]. 여름 블랙 셔츠는 '웨이터' 주의 |
| navy | 4 | classic | FB1: 네이비+블랙 금기 무시하라 ⚠ 이견 |
| olive | 4 | classic | [FB1][MM] |
| charcoal | 4 | classic | 모노 톤온톤 [FB1] |
| tan / beige / camel | 3 | variation | FB1 '샌드·탄·토바코' 어스톤 |
| burgundy | 3 | variation | 블랙 위 포인트 [AtG4] |
| lightBlue | 3 | variation | FB1 레이어드 셔츠 |

**신발**

| 신발 색 | score | tag | 근거 |
|---|---|---|---|
| black (부츠·스니커즈·로퍼) | 5 | classic | [FB1][AtG2][MM] |
| white (스니커즈) | 4 | classic | [FB1] 흑백 |
| brown / chocolate (워크부츠) | 3 | variation | FB1 Red Wing 예시. 블랙+브라운 가죽 혼용은 ⚠ |
| midGrey (스웨이드 로퍼) | 3 | variation | [FB1] |

**아우터**

| 아우터 색 | score | tag | 근거 |
|---|---|---|---|
| black (레더·봄버·블레이저) | 5 | classic | [FB1][AtG2] |
| midGrey / charcoal (블레이저·코트) | 5 | classic | [FB1] |
| navy (봄버·블레이저) | 4 | classic | [FB1][MRP] |
| camel (코트) | 4 | classic | 블랙+카멜 럭셔리 대비 [VK2] |
| olive (오버셔츠) | 4 | classic | [FB1] |
| tan (스웨이드 봄버) | 3 | variation | [FB1] |
| indigo (데님 재킷) | 3 | variation | [FB1] |

**피하기**: 여름 블랙 셔츠+블랙 데님(너무 어둡고 웨이터 느낌 [FB1]), 스키니 핏(FB1), 블랙 데님+브라운 벨트+블랙 신발(가죽 불일치).

### 4-4. 베이지 치노 `beige`

**상의**

| 상의 색 | score | tag | 근거 |
|---|---|---|---|
| white | 5 | classic | [WH1][Celio][AtG2] |
| navy | 5 | classic | [Celio][AtG2][Vou1] |
| lightBlue | 5 | classic | [AtG2][MF] 옥스포드 |
| olive | 4 | classic | [Celio][AtG1] |
| brown / chocolate | 4 | classic | 베이지+브라운+화이트 [WH1][VK2] |
| greyMelange / midGrey | 4 | classic | 그레이+탄은 저평가된 조합 [TMM-tan][Hack] |
| burgundy | 4 | classic | [AtG4][Studio] |
| black | 3 | variation | 블랙 롤넥+베이지 [AtG2 smart] |
| cream / oatmeal | 3 | variation | 밝은 톤온톤, 명도 차 작음 [WK2] |
| dustyPink / lavender | 3 | variation | [WH1] |
| rust | 3 | variation | 어스톤 보색 변주 [AtG4] |

**신발**

| 신발 색 | score | tag | 근거 |
|---|---|---|---|
| brown (로퍼·부츠) | 5 | classic | [Celio][WH2][PS2] |
| white (스니커즈) | 5 | classic | [Celio][AtG2] |
| tan (스웨이드) | 4 | classic | [PS2] 탄+연한 바지 가능 |
| navy (로퍼·보트슈즈) | 4 | classic | 카키·베이지엔 네이비 신발 [Khaki-guides] |
| burgundy | 3 | variation | [Khaki-guides] |
| black | 3 | variation | 스마트 셋업에만. 캐주얼엔 무거움 ⚠ |

**아우터**

| 아우터 색 | score | tag | 근거 |
|---|---|---|---|
| navy (블레이저·코트) | 5 | classic | [AtG2][WH2][Celio] |
| brown / chocolate (스웨이드·코트) | 4 | classic | [WH1][AtG1] |
| olive (필드·초어) | 4 | classic | [AtG1][Celio] |
| midGrey / charcoal | 4 | classic | [TMM-tan] |
| camel (코트) | 3 | variation | 톤온톤, 상의에 화이트 필요 [WH1] |
| black (레더) | 3 | variation | 블랙+베이지 대비 |

**피하기**: 올베이지(명도 차 없이), 베이지+화이트 셔츠+탄 신발만으로는 밋밋 → 한 점 어두운 색 필요 [WK2].

### 4-5. 카키 치노 `khaki` (황갈색, 베이지보다 어둡고 녹기)

**상의**

| 상의 색 | score | tag | 근거 |
|---|---|---|---|
| white | 5 | classic | [Khaki-guides][AtG2] |
| navy | 5 | classic | [Khaki-guides][AtG2] |
| lightBlue | 5 | classic | [AtG2][GG] 샴브레이+카키 |
| greyMelange | 4 | classic | [Hack][TMM-tan] |
| olive | 3 | variation | 카키+올리브는 근접색, 명도 차 필요 [FB3] |
| burgundy | 4 | classic | [AtG4] |
| black | 3 | variation | '세미포멀' [Khaki-guides] |
| brown | 3 | variation | 어스 톤온톤 |
| cream | 3 | variation | [FB3] |

**신발**

| 신발 색 | score | tag | 근거 |
|---|---|---|---|
| brown / chocolate | 5 | classic | [Khaki-guides][PS2] |
| white | 5 | classic | [AtG2][Khaki-guides] |
| navy | 4 | classic | [Khaki-guides] |
| tan | 4 | classic | [Khaki-guides] |
| burgundy | 3 | variation | [Khaki-guides] |
| black | 2 | variation | 캐주얼 카키엔 무거움 |

**아우터**

| 아우터 색 | score | tag | 근거 |
|---|---|---|---|
| navy | 5 | classic | [AtG2][GG] 네이비 재킷+카키 |
| olive | 4 | classic | [MM] |
| brown | 4 | classic | [WH1] |
| indigo (데님 재킷) | 4 | classic | [MM] |
| charcoal | 3 | variation | |

**피하기**: 카키+올리브+브라운 셋 다 비슷한 명도(흙탕), 카키+블랙 구두 캐주얼.

### 4-6. 네이비 치노 `navy`

**상의**

| 상의 색 | score | tag | 근거 |
|---|---|---|---|
| white | 5 | classic | [Celio][WH2][AtG2] |
| lightBlue | 5 | classic | [Navy-guides][WH1] 톤온톤 |
| greyMelange / lightGrey | 4 | classic | [Hack][RMRS2] |
| beige / oatmeal / cream | 5 | classic | [Celio][AtG2] 케이블 니트 |
| burgundy | 4 | classic | 네이비엔 버건디 [PS1][AtG4] |
| olive | 4 | classic | [AtG4][Celio] |
| black | 3 | variation | 블랙 롤넥+네이비 치노 [AtG2] ⚠ |
| dustyPink | 3 | variation | 네이비+더스티 로즈 [Aza][WH1] |
| rust | 3 | variation | 보색 [AtG4] |
| forestGreen | 3 | variation | 보틀그린 under navy [PS-snippet] |
| navy | 2 | variation | 같은 네이비끼리는 GG가 비추 |

**신발**

| 신발 색 | score | tag | 근거 |
|---|---|---|---|
| brown / chocolate | 5 | classic | [GG][Navy-guides][AtG2] |
| white | 5 | classic | [Celio][Navy-guides] |
| tan (스웨이드) | 4 | classic | [Navy-guides] |
| black | 4 | classic | 스마트/포멀 [AtG2][WH2] |
| burgundy | 3 | variation | |

**아우터**

| 아우터 색 | score | tag | 근거 |
|---|---|---|---|
| midGrey / charcoal | 5 | classic | 그레이 재킷+네이비 바지 [RMRS2][AtG2] |
| camel / beige | 5 | classic | [WH1] |
| olive | 4 | classic | [AtG4] |
| brown | 4 | classic | [WH2] 네이비+브라운 |
| navy | 3 | variation | 톤온톤, 2단계 명도 차 |
| black | 3 | variation | ⚠ 네이비+블랙 |

**피하기**: 네이비 수트 재킷+네이비 치노(세트처럼 보이는 '불일치 수트' [GG]), 그레이 재킷+그레이 바지도 동일 원리 [RMRS2].

### 4-7. 그레이 울 트라우저 (라이트~미드) `midGrey`

**상의**

| 상의 색 | score | tag | 근거 |
|---|---|---|---|
| white | 5 | classic | [MF][RMRS2] 질감·패턴 추가 권장 |
| lightBlue / skyBlue | 5 | classic | [MF][RMRS2] 가장 안전 |
| navy | 5 | classic | [MF][Celio] |
| black | 4 | classic | 블랙+그레이 [WH1][MF] 저녁용 |
| brown / chocolate | 4 | classic | 브라운+그레이 가을·겨울 [WH1][MF][VK2] |
| burgundy | 4 | classic | [PS-snippet 'burgundy under mid-grey'][Burgundy-guides] |
| dustyPink | 4 | classic | [MF] 라이트그레이+더스티핑크 |
| forestGreen | 3 | variation | [MF] 그린 깅엄 |
| mustard / 파스텔 옐로 | 3 | variation | [MF] |
| midGrey / lightGrey | 2 | variation | 올그레이 비추 [RMRS2][MF] |

**신발**

| 신발 색 | score | tag | 근거 |
|---|---|---|---|
| brown (미드~다크) | 5 | classic | [Dapp][Fitville][MF] |
| black | 5 | classic | [MF][Dapp] |
| white (스니커즈) | 4 | classic | 라이트그레이엔 [MF] |
| tan / walnut | 3 | variation | 라이트그레이에만. 차콜엔 ✗ [Dapp] |
| burgundy | 3 | variation | |

**아우터**

| 아우터 색 | score | tag | 근거 |
|---|---|---|---|
| navy (블레이저·코트) | 5 | classic | [RMRS2][MF] |
| camel (코트) | 5 | classic | [WH1] |
| brown | 4 | classic | 브라운 재킷+그레이 바지 [WH2] |
| black | 4 | classic | [WH1] |
| olive | 3 | variation | |
| charcoal | 3 | variation | 톤 차이 2단계 이상 [AtG1] |
| midGrey | 1 | variation | 그레이 재킷+그레이 플란넬 = 불일치 수트 [RMRS2] |

**피하기**: 그레이 셔츠+그레이 바지(RMRS2 'dull and dreary'), 노란기 있는 브라운 구두 [Dapp].

### 4-8. 차콜 트라우저 `charcoal`

**상의**

| 상의 색 | score | tag | 근거 |
|---|---|---|---|
| white | 5 | classic | [MF][Vou1] |
| lightBlue | 5 | classic | [MF][Vou1] |
| navy | 4 | classic | [MF] 마린 블루 |
| lightGrey / greyMelange | 4 | classic | 차콜+라이트그레이 톤온톤 [AtG1] |
| burgundy | 4 | classic | 차콜 수트+클라렛 [Vou1] |
| black | 3 | variation | 어둡고 무거움. 저녁용 [MF] |
| dustyPink | 3 | variation | [MF] 핑크 스트라이프 |
| forestGreen | 2 | variation | 어두운 색끼리 뭉개짐 [MF] |
| cream / oatmeal | 4 | classic | 명도 대비 좋음 |

**신발**

| 신발 색 | score | tag | 근거 |
|---|---|---|---|
| black | 5 | classic | [PS2][Dapp][MF] |
| chocolate (다크브라운) | 4 | classic | [Dapp][Fitville] 밝은 탄은 ✗ |
| white (스니커즈) | 3 | variation | 캐주얼 차콜에만 [MF] |
| tan / walnut | 1 | variation | 비추 [Dapp][Fitville] ⚠ PS도 '차콜엔 브라운 구두 비추'라는 입장 |

**아우터**

| 아우터 색 | score | tag | 근거 |
|---|---|---|---|
| navy | 5 | classic | [MF][RMRS2] |
| camel | 5 | classic | [WH1] |
| black | 4 | classic | [WH1] 모노 |
| lightGrey | 3 | variation | 역톤 |
| olive | 3 | variation | |

**피하기**: 차콜+다크그린(뭉개짐 [MF]), 차콜+월넛/탄 구두 [Dapp], 올차콜.

### 4-9. 올리브 치노 `olive`

**상의**

| 상의 색 | score | tag | 근거 |
|---|---|---|---|
| white / offWhite | 5 | classic | [MM][AtG2][Berle][Celio] |
| beige / tan | 5 | classic | [MM][Celio] |
| navy | 5 | classic | [MM][AtG4][Celio] |
| lightBlue (탁한 블루) | 4 | classic | [MM][Berle] |
| greyMelange / lightGrey | 4 | classic | 봄·여름 라이트그레이, 가을 다크그레이 [MM] |
| black | 4 | classic | [MM][Celio] ⚠ MM은 '블랙+어스톤 덜 어울림' 단서도 |
| brown / chocolate | 4 | classic | 초콜릿 니트+올리브 [AtG4][Olive-guides] |
| burgundy | 4 | classic | 보색(탁한) [MM][AtG4] |
| cream / oatmeal | 4 | classic | [AtG4][Vou1] |
| lavender | 3 | variation | [MM] |
| rust | 2 | variation | ⚠ 이견: MM '오렌지는 거의 모두 ✗', AtG4 '번트오렌지+올리브 OK' |
| olive / forestGreen | 1 | variation | 그린온그린 ✗ [MM] |

**신발**

| 신발 색 | score | tag | 근거 |
|---|---|---|---|
| brown / chocolate | 5 | classic | [MM][Berle][Olive-guides] |
| white | 5 | classic | [MM][AtG2] |
| black | 4 | classic | 뉴트럴·쿨톤 상의와 [MM][AtG2] |
| tan (스웨이드) | 4 | classic | [Olive-guides] |

**아우터**

| 아우터 색 | score | tag | 근거 |
|---|---|---|---|
| navy | 5 | classic | [MM][Celio] |
| brown / chocolate (레더·스웨이드) | 4 | classic | [MM] |
| indigo (데님 재킷) | 4 | classic | [MM] |
| midGrey (블레이저) | 4 | classic | [AtG2] |
| black (레더) | 3 | variation | [MM] |
| tan (봄버) | 3 | variation | [MM] |
| camel | 3 | variation | |

**피하기**: 그린온그린 [MM], 형광 블루·오렌지 [MM], 블랙 가죽+브라운 가죽 혼용 [MM].

### 4-10. 브라운 코듀로이 `brown` (골덴, 미드~다크브라운)

**상의**

| 상의 색 | score | tag | 근거 |
|---|---|---|---|
| cream / oatmeal | 5 | classic | [Brown-guides][HB] 청키 니트 |
| white / offWhite | 5 | classic | [Brown-guides][WH1] |
| lightBlue | 5 | classic | 라이트블루 셔츠+브라운 바지 [GG][HB] |
| navy | 5 | classic | [WH2][Brown-guides] |
| beige / tan | 4 | classic | 톤온톤+화이트 [VK2][WH1] |
| midGrey / greyMelange | 4 | classic | 브라운+그레이 격식 [VK2][HB] |
| burgundy | 3 | variation | [Brown-guides] |
| olive | 3 | variation | [Brown-guides] ⚠ HB는 브라운 바지에 그린 상의 비추 |
| indigo (데님 셔츠) | 4 | classic | [HB] |
| black | 3 | variation | 럭셔리 대비 [VK2] ⚠ |
| rust | 3 | variation | 유사색 |

**신발**

| 신발 색 | score | tag | 근거 |
|---|---|---|---|
| chocolate / brown | 5 | classic | 바지보다 어둡게 [Brown-guides][PS2] |
| tan (스웨이드 로퍼·데저트) | 4 | classic | [Brown-guides][HB] |
| white (스니커즈) | 4 | classic | [Brown-guides] |
| black | 3 | variation | [HB] 가능, 벨트 통일 |
| burgundy / 코도반 | 3 | variation | 적갈색 신발+다크브라운 [Brown-guides] |

**아우터**

| 아우터 색 | score | tag | 근거 |
|---|---|---|---|
| navy (블레이저·코트) | 5 | classic | [Brown-guides][HB][WH2] |
| midGrey / charcoal | 4 | classic | [HB] |
| beige / camel (코트) | 4 | classic | [HB] |
| olive | 3 | variation | |
| black (레더) | 3 | variation | [HB] |
| brown (레더, 톤온톤) | 3 | variation | 질감 차 필수 |

**피하기**: 브라운 바지+그린 상의(HB), 코듀로이+텍스처 재킷+패턴 베스트 과적재 [GG 댓글].

### 4-11. 블랙 트라우저 `black` (울·슬랙스)

**상의**

| 상의 색 | score | tag | 근거 |
|---|---|---|---|
| white | 5 | classic | [AtG1][WH2] |
| lightGrey / greyMelange | 5 | classic | [WH1][WH2] |
| black | 4 | classic | 올블랙, 질감 차 [AtG2][FB3] FB3: 올블랙은 피부에 가혹할 수 있음 |
| charcoal | 4 | classic | 모노 |
| navy | 3 | variation | ⚠ |
| burgundy | 4 | classic | 블랙+버건디 |
| forestGreen | 4 | classic | 그린 블레이저+블랙 롤넥 [AtG1] |
| camel / beige | 3 | variation | 럭셔리 대비 [VK2] |
| lightBlue | 3 | variation | |
| dustyPink | 2 | variation | |

**신발**

| 신발 색 | score | tag | 근거 |
|---|---|---|---|
| black | 5 | classic | [AtG1][AtG2][WH2] |
| white (스니커즈) | 3 | variation | 캐주얼 |
| chocolate | 2 | variation | 블랙+브라운 가죽 ⚠ |

**아우터**

| 아우터 색 | score | tag | 근거 |
|---|---|---|---|
| black | 5 | classic | [AtG1][AtG2] |
| charcoal / midGrey | 5 | classic | [WH1] |
| camel | 4 | classic | 블랙+카멜 코트 |
| navy | 3 | variation | [MRP] 네이비 봄버+블랙 |
| forestGreen | 3 | variation | [AtG1] |

**피하기**: 블랙 바지+브라운 구두(가죽 통일 원칙 [WH2]), 네이비 재킷+블랙 수트 바지(사고처럼 보임 [MRP]).

### 4-12. 화이트/크림 트라우저 `white` / `cream`

**상의**

| 상의 색 | score | tag | 근거 |
|---|---|---|---|
| navy | 5 | classic | [FB2][HSS][Celio][AtG1] |
| lightBlue / 샴브레이 | 5 | classic | [FB2][AtG2] |
| cream / oatmeal / beige | 4 | classic | 톤온톤, 정확히 같은 흰색은 ✗ [AtG3][PS3] |
| black | 4 | classic | 그래픽 대비 [HSS] |
| sage | 4 | classic | [HSS] |
| olive | 4 | classic | 올리브 재킷+화이트 팬츠 [AtG1][Celio] |
| greyMelange / midGrey | 4 | classic | [AtG3] |
| brown / chocolate | 4 | classic | [AtG3] |
| white | 2 | variation | 올화이트는 씻겨 보임, 오프화이트로 [FB2] |
| dustyPink | 3 | variation | 핑크+페일블루 등 파스텔 [AtG1] |
| burgundy | 3 | variation | |

**신발**

| 신발 색 | score | tag | 근거 |
|---|---|---|---|
| brown (로퍼, 노삭스) | 5 | classic | [FB2][HSS][VK1][AtG3] |
| tan (스웨이드 첼시·데저트) | 4 | classic | [FB2][AtG2] |
| white (스니커즈) | 4 | classic | [FB2] 다만 '밝은 트레이너는 다리가 땅에 섞임' 주의 |
| navy (데크슈즈) | 3 | variation | [FB2] |
| black (미니멀 스니커즈·로퍼) | 2 | variation | ⚠ 이견: FB2·AtG3는 블랙 OK, Vogue Korea는 '발목에서 끊김, 모나미 룩' 비추 |

**아우터**

| 아우터 색 | score | tag | 근거 |
|---|---|---|---|
| navy (블레이저) | 5 | classic | [AtG1][WH2] |
| cream / beige / lightGrey (언스트럭처드 블레이저) | 4 | classic | [FB2][AtG3] |
| camel (코트) | 4 | classic | [AtG3] 겨울 |
| olive (필드재킷) | 4 | classic | [FB2] |
| forestGreen (블레이저) | 3 | variation | [AtG2] |
| brown (스웨이드) | 3 | variation | [AtG3] |
| indigo (데님 재킷) | 3 | variation | [AtG3] |

**피하기**: 화이트온화이트 정확히 같은 흰색 [AtG3], 로우 데님 염색 이염 [AtG3], 겨울엔 크림이 화이트보다 쉬움 [PS3].

**4장 집계**: 베이스 12개, 상의 페어링 124행, 신발 페어링 57행, 아우터 페어링 74행 = **255 페어링 행**.

---

## 5. 상의 기준 페어링 (10 베이스) → 하의 / 신발

### 5-1. 화이트 티셔츠 `white`

| 하의 색 | score | tag | 근거 | 신발 색 | score | tag |
|---|---|---|---|---|---|---|
| indigo | 5 | classic | [WK1][GQK][AtG1] | white | 5 | classic |
| lightDenim | 5 | classic | [PM] | brown | 5 | classic |
| blackDenim | 5 | classic | [FB1] | black (블랙데님일 때) | 4 | classic |
| beige / khaki | 5 | classic | [WH1][AtG2] | tan | 4 | classic |
| olive | 5 | classic | [MM][AtG2] | navy | 3 | variation |
| navy | 5 | classic | [Celio] | | | |
| midGrey | 4 | classic | [MF] 질감 필요 | | | |
| charcoal | 4 | classic | [MF] | | | |
| black | 4 | classic | [AtG1] | | | |
| brown | 4 | classic | [Brown-guides] | | | |
| white / cream | 2 | variation | 올화이트 [FB2] | | | |

### 5-2. 블랙 티셔츠 `black`

| 하의 색 | score | tag | 근거 | 신발 색 | score | tag |
|---|---|---|---|---|---|---|
| blackDenim / black | 5 | classic | [FB1][AtG2] | black | 5 | classic |
| indigo | 4 | classic | [FB1] | white | 4 | classic |
| midGrey / lightGrey | 4 | classic | [MF][WH1] | chocolate | 2 | variation |
| olive | 4 | classic | [MM] | | | |
| white / cream | 4 | classic | [HSS] 대비 | | | |
| beige / khaki | 3 | variation | [AtG2] | | | |
| navy | 3 | variation | ⚠ | | | |
| lightDenim | 2 | variation | 강한 대비 [PM] | | | |

### 5-3. 그레이 멜란지 티/맨투맨 `greyMelange`

| 하의 색 | score | tag | 근거 | 신발 색 | score | tag |
|---|---|---|---|---|---|---|
| indigo | 5 | classic | [FB1][Hack] | white | 5 | classic |
| blackDenim / black | 5 | classic | [FB1] | black | 4 | classic |
| navy | 5 | classic | [Hack] | brown | 4 | classic |
| beige / tan / khaki | 5 | classic | [TMM-tan][Hack] | | | |
| olive | 4 | classic | [MM] | | | |
| lightDenim | 4 | classic | [PM] | | | |
| white / cream | 4 | classic | [AtG3] | | | |
| charcoal | 3 | variation | 그레이온그레이, 명도 차 2단계 [AtG1] | | | |
| midGrey | 1 | variation | 올그레이 ✗ [RMRS2] | | | |

### 5-4. 네이비 니트 `navy`

| 하의 색 | score | tag | 근거 | 신발 색 | score | tag |
|---|---|---|---|---|---|---|
| beige / khaki | 5 | classic | [Celio][AtG2] | brown | 5 | classic |
| midGrey / lightGrey | 5 | classic | [MF][Celio] | white | 4 | classic |
| white / cream | 5 | classic | [FB2][Celio] | black | 4 | classic |
| indigo | 4 | classic | 톤온톤 [Celio] | tan | 4 | classic |
| olive | 4 | classic | [MM][AtG4] | | | |
| brown | 4 | classic | [WH2] | | | |
| charcoal | 4 | classic | [MF] | | | |
| lightDenim | 4 | classic | 명도 대비 | | | |
| blackDenim / black | 3 | variation | ⚠ 네이비+블랙 | | | |
| navy | 2 | variation | 같은 톤 [GG] | | | |

### 5-5. 오트밀/크림 니트 `oatmeal` / `cream`

| 하의 색 | score | tag | 근거 | 신발 색 | score | tag |
|---|---|---|---|---|---|---|
| indigo | 5 | classic | [VK1][AtG4] | brown | 5 | classic |
| navy | 5 | classic | [AtG2] 케이블 니트 | white | 4 | classic |
| olive | 5 | classic | [Vou1][AtG4] | tan | 4 | classic |
| brown / chocolate | 5 | classic | [Brown-guides][HB] | black | 3 | variation |
| charcoal / midGrey | 4 | classic | 명도 대비 | | | |
| blackDenim | 3 | variation | FB1 어스톤 | | | |
| beige / khaki | 3 | variation | 밝은 톤온톤 [WK2] | | | |
| white | 3 | variation | [AtG3] 톤온톤 | | | |
| burgundy (바지) | 3 | variation | | | | |

### 5-6. 라이트블루 옥스포드 `lightBlue`

| 하의 색 | score | tag | 근거 | 신발 색 | score | tag |
|---|---|---|---|---|---|---|
| beige / khaki | 5 | classic | [AtG2][Blue-guides] | brown | 5 | classic |
| midGrey / charcoal | 5 | classic | [MF][Vou1][Blue-guides] | white | 4 | classic |
| navy | 5 | classic | [Blue-guides][WH1] | black | 4 | classic |
| brown | 5 | classic | [GG] | tan | 4 | classic |
| white / cream | 5 | classic | [AtG2] | | | |
| olive | 4 | classic | [MM][Berle] | | | |
| indigo | 4 | classic | 톤온톤 [WH1] | | | |
| black | 3 | variation | [Blue-guides] | | | |
| lightDenim | 3 | variation | 명도 차 작음 | | | |

### 5-7. 화이트 옥스포드 `white` (셔츠)

| 하의 색 | score | tag | 근거 | 신발 색 | score | tag |
|---|---|---|---|---|---|---|
| navy | 5 | classic | [Celio][WH2] | brown | 5 | classic |
| midGrey / charcoal | 5 | classic | [MF][WH2] | black | 5 | classic |
| beige / khaki | 5 | classic | [Celio][AtG2] | white | 4 | classic |
| olive | 5 | classic | [AtG2][Celio] | | | |
| blackDenim | 5 | classic | [FB1] | | | |
| indigo | 4 | classic | [GQK] | | | |
| brown | 4 | classic | [Brown-guides] | | | |
| black | 4 | classic | [WH2] | | | |
| white / cream | 3 | variation | 톤온톤 [AtG3] | | | |

### 5-8. 브레통 스트라이프 (네이비/화이트) `navy`+`white`

| 하의 색 | score | tag | 근거 | 신발 색 | score | tag |
|---|---|---|---|---|---|---|
| indigo (로우 데님) | 5 | classic | [Dalm][MRP-stripes] | white | 5 | classic |
| beige / khaki | 5 | classic | [Dalm][MRP-stripes] | brown (로퍼) | 4 | classic |
| white | 4 | classic | [FB-stripes] 슬림 화이트+스웨이드 더비 | navy (캔버스·보트) | 4 | classic |
| black | 4 | classic | 블랙 치노+브레통 [AtG2] | black (캔버스) | 3 | variation |
| navy | 4 | classic | 톤온톤 | | | |
| midGrey | 3 | variation | | | | |
| olive | 3 | variation | 밀리터리 니트와 [Dalm] | | | |

(패턴이므로 상의가 이미 2색. 하의·신발은 뉴트럴 1색만 추가 [Vou1].)

### 5-9. 올리브 상의 (셔츠/니트) `olive`

| 하의 색 | score | tag | 근거 | 신발 색 | score | tag |
|---|---|---|---|---|---|---|
| beige / khaki | 5 | classic | [Celio][MM] | white | 5 | classic |
| indigo | 5 | classic | [AtG4][AtG1] | brown | 5 | classic |
| white / cream | 5 | classic | [Celio][AtG4] | black | 3 | variation |
| navy | 4 | classic | [AtG4] | | | |
| blackDenim | 4 | classic | [FB1] | | | |
| midGrey / charcoal | 4 | classic | [AtG4] | | | |
| brown | 3 | variation | [Brown-guides] ⚠ HB 반대 | | | |
| olive | 1 | variation | 그린온그린 [MM] | | | |

### 5-10. 버건디 니트 `burgundy`

| 하의 색 | score | tag | 근거 | 신발 색 | score | tag |
|---|---|---|---|---|---|---|
| midGrey / lightGrey | 5 | classic | [Burgundy-guides][PS-snippet] | brown | 5 | classic |
| indigo | 5 | classic | [AtG4][Studio] | black | 4 | classic |
| navy | 5 | classic | [PS1][AtG4] | white | 3 | variation |
| charcoal | 4 | classic | [Vou1] | | | |
| beige / khaki | 4 | classic | [Burgundy-guides] | | | |
| olive | 4 | classic | 탁한 보색 [MM][WH1] | | | |
| black | 3 | variation | | | | |
| white / cream | 3 | variation | | | | |
| brown | 2 | variation | 가까운 난색끼리 뭉개짐 | | | |

**5장 집계**: 베이스 10개, 하의 페어링 89행, 신발 페어링 36행 = **125 페어링 행**.

**4·5장 합계: 380 base→match 페어링** (목표 60 이상 충족).

---

## 6. 계절 팔레트 (한국 기후)

| 계절 | 기본 뉴트럴 | 어스/포인트 | 피하거나 줄일 색 | 근거 |
|---|---|---|---|---|
| 봄가을 (spring_fall) | white, offWhite, beige, khaki, midGrey, charcoal, navy, indigo | olive, camel, brown, burgundy, rust, sage, dustyPink(봄), mustard(가을) | 한겨울 중량 색(초콜릿 울 등)은 가을 후반부터 | [WH1][AtG4][VK2] 어스톤은 가을 대표 |
| 여름 (summer, 고온다습) | white, offWhite, cream, lightGrey, beige, lightDenim, navy(포인트처럼) | skyBlue, lightBlue, sage, lavender, dustyPink | black 대면적(열·무거움), chocolate, 무거운 브라운 [WH2] | [WK2] 화이트·아이보리·베이지 톤온톤이 '무더위 최적', [WH1] 파스텔 |
| 겨울 (winter) | charcoal, black, navy, midGrey, cream(니트), oatmeal | camel, chocolate, burgundy, forestGreen, rust, taupe | 파스텔·연청(계절감 어긋남) [WH1] | [WH1] 가을·겨울 = 버건디·포레스트·카멜·러스트·딥네이비 |

**계절 토글 적용 규칙(엔진용)**: 색 자체를 금지하기보다 `seasons[]`에 없는 색은 score −1, 포인트 컬러가 계절 밖이면 −2.

| id | seasons |
|---|---|
| white, offWhite, navy, indigo, midGrey, charcoal, beige, khaki, black, olive, brown | spring_fall, summer, winter (연중) |
| cream, oatmeal, camel, chocolate, burgundy, forestGreen, rust, taupe, blackDenim | spring_fall, winter |
| lightDenim, lightBlue, skyBlue, sage, lavender, dustyPink, lightGrey | spring_fall, summer |
| mustard, teal, greyMelange, tan, midDenim | spring_fall, summer, winter (greyMelange·tan·midDenim 연중, mustard·teal은 spring_fall 중심) |

표 6 행 수: 3 + 4

---

## 7. 클래식 코디 예시 (30개)

`universal` = "흰 티+인디고" 급으로 누구나 안전한 기본 픽. `isClassic`은 모두 true(변주 예시는 `tags`에 variation 표기).

| id | 상의 (색+아이템) | 하의 (색+아이템) | 신발 (색+종류) | 아우터 | 계절 | tags | universal | 근거 |
|---|---|---|---|---|---|---|---|---|
| o01 | white 티셔츠 | indigo 데님 | white 스니커즈 | – | 연중 | neutral, navyBase | ✔ | [WK1][GQK][AtG1] |
| o02 | white 티셔츠 | indigo 데님 | brown 부츠 | camel 트렌치 | 봄가을 | navyBase, earth | ✔ | [VK1][GG] |
| o03 | greyMelange 맨투맨 | indigo 데님 | white 스니커즈 | navy 필드재킷 | 봄가을 | mono, navyBase | ✔ | [Hack][FB1] |
| o04 | white 옥스포드 | navy 치노 | brown 로퍼 | – | 연중 | neutral | ✔ | [Celio][WH2] |
| o05 | lightBlue 옥스포드 | beige 치노 | brown 로퍼 | navy 블레이저 | 봄가을 | neutral, navyBase | ✔ | [AtG2][MF] |
| o06 | navy 니트 | beige 치노 | brown 부츠 | – | 봄가을 | navyBase, earth | ✔ | [Celio][AtG2] |
| o07 | white 티셔츠 | olive 치노 | white 스니커즈 | – | 여름 | earth, neutral | ✔ | [AtG2][MM][Celio] |
| o08 | white 옥스포드 | olive 치노 | black 더비부츠 | midGrey 블레이저 | 봄가을 | earth, mono | – | [AtG2] |
| o09 | white 옥스포드 + midGrey 크루넥 | blackDenim | black 스웨이드 처카 | navy 봄버 | 겨울 | mono, navyBase | – | [FB1] |
| o10 | white 티셔츠 | blackDenim | white 스니커즈 | black 레더 | 봄가을 | mono | ✔ | [AtG1][FB1] |
| o11 | black 롤넥 | navy 치노 | black 더비 | midGrey 더블브레스트 | 겨울 | mono, navyBase, variation(네이비+블랙) | – | [AtG2] |
| o12 | navy 크루넥 | white 데님 | brown 로퍼 | – | 여름 | navyBase, neutral | – | [FB2][HSS] |
| o13 | 샴브레이(lightBlue) 셔츠 | white 치노 | brown 스웨이드 데저트부츠 | – | 여름 | pastel, neutral | – | [AtG2] |
| o14 | cream 니트 | olive 치노 | brown 부츠 | brown 재킷 | 봄가을 | earth | – | [Vou1] |
| o15 | oatmeal 니트 | indigo 데님 | brown 로퍼 | – | 봄가을 | earth, navyBase | ✔ | [VK1][AtG4] |
| o16 | lightBlue 셔츠 | charcoal 울 트라우저 | black 더비 | navy 코트 | 겨울 | mono, navyBase | ✔ | [MF][Vou1] |
| o17 | white 셔츠 | midGrey 플란넬 | brown 처카 | navy 블레이저 | 봄가을 | mono, navyBase | ✔ | [MF][RMRS2] |
| o18 | burgundy 니트 | midGrey 트라우저 | brown 로퍼 | – | 겨울 | accent, mono | – | [Burgundy-guides] |
| o19 | burgundy 니트 | indigo 데님 | brown 부츠 | – | 겨울 | accent, navyBase | – | [AtG4][Studio] |
| o20 | lightBlue 셔츠 | brown 코듀로이 | chocolate 부츠 | navy 블레이저 | 겨울 | earth, navyBase | – | [GG][HB] |
| o21 | cream 청키 니트 | brown 코듀로이 | tan 스웨이드 로퍼 | – | 겨울 | earth | – | [HB][Brown-guides] |
| o22 | white 티셔츠 | lightDenim | white 스니커즈 | navy 블레이저 | 봄가을 | navyBase, neutral | ✔ | [PM] |
| o23 | greyMelange 티셔츠 | lightDenim | tan 스웨이드 부츠 | olive 필드재킷 | 봄가을 | earth, navyBase | – | [PM][MM] |
| o24 | 브레통 스트라이프 | indigo 데님 | white 스니커즈 | – | 여름 | navyBase | – | [Dalm] |
| o25 | 브레통 스트라이프 | beige 치노 | brown 로퍼 | navy 피코트 | 봄가을 | navyBase, neutral | – | [Dalm][MRP-stripes] |
| o26 | black 롤넥 | black 트라우저 | black 첼시부츠 | forestGreen 블레이저 | 겨울 | mono, accent | – | [AtG1] |
| o27 | white 티셔츠 | beige 카고/치노 | white 스니커즈 | olive 초어재킷 | 봄가을 | earth, neutral | – | [AtG1 beige+olive] |
| o28 | lightGrey 티셔츠 | charcoal 트라우저 | white 스니커즈 | – | 여름 | mono (그레이 톤온톤) | – | [AtG1][MF] |
| o29 | greyMelange 후디/티 | indigo 데님 | white 스니커즈 | brown 코트 + (forestGreen 후디 변주) | 겨울 | earth, navyBase, variation | – | [AtG1 brown+green] |
| o30 | dustyPink 린넨 셔츠 | white 치노 | brown 로퍼 | – | 여름 | pastel, neutral, variation | – | [AtG1 pink+blue 응용][WH1] |

표 7 행 수: 30 (universal 13개)

---

## 8. 흔한 실수와 논쟁 (피해야 할 조합)

| # | 조합 | 주류 판정 | 이견 / 조건 | 엔진 처리 제안 |
|---|---|---|---|---|
| A1 | 네이비 + 블랙 | **가능. '금기'는 낡은 규칙** (MR PORTER, Esquire AU, FashionBeans 2017) | FashionBeans 2010은 '까다롭다' 입장. MRP: 블랙으로 오인될 어두운 네이비는 ✗, 네이비 블레이저+블랙 수트바지 ✗, 네이비 봄버+블랙 진 ✔ | score 3, tag variation. 둘 중 하나는 캐주얼 아이템(봄버·진)일 때만 노출 |
| A2 | 블랙 + 브라운 (가죽 혼용) | **같은 코디 안에서 가죽(신발·벨트·시계줄)은 한 색으로** (WH2, MM). 옷 면적에서의 블랙+브라운(블랙 니트+카멜 코트)은 OK (VK2 '럭셔리', FashionBeans '낡은 규칙') | MM은 올리브 바지 문맥에서 블랙+어스톤 전반을 덜 추천 | 신발-벨트 색 일치 규칙을 별도 체크. 옷 영역 블랙+카멜은 score 3~4 |
| A3 | 블랙 구두 + 데님 | **진청(indigo)·블랙 데님엔 OK, 연청(lightDenim)엔 비추** | GG는 데님 전반에 블랙 구두 ✗(대비 과함). FB·Allure는 블랙 재킷+구두로 격 올리기 ✔ | indigo→black 신발 score 3, lightDenim→black 신발 score 2 |
| A4 | 화이트 팬츠 + 블랙 신발 | ⚠ **이견 큼**. Vogue Korea: '발목에서 끊김, 모나미 룩' ✗ / FashionBeans·AtG: 미니멀 블랙 스니커즈·로퍼 ✔ | 한국 사용자 대상이므로 보수적으로 | score 2, variation |
| A5 | 올그레이 (그레이 셔츠+그레이 바지, 그레이 재킷+그레이 플란넬) | **비추** (RMRS2 'dull', Mensflair '시멘트 덩어리') | 차콜+라이트그레이처럼 명도 차 2단계 이상이면 톤온톤으로 OK (AtG1) | 같은 id끼리 score 1, charcoal↔lightGrey는 3 |
| A6 | 그린온그린 (올리브 바지+올리브/포레스트 상의) | **비추** (MM) | FashionBeans 톤온톤 가이드는 '카키+포레스트 그린' 톤온톤 ✔ → 명도·채도 차가 크면 가능 | olive→olive score 1, olive→sage 3 |
| A7 | 차콜 + 탄/월넛 구두 | **비추** (Dappered, Fitville). 차콜엔 블랙 또는 다크초콜릿 | PS: 차콜은 브라운 구두와 안 어울리는 유일한 색. 반면 라이트그레이+탄은 OK | charcoal→tan 1, charcoal→chocolate 4 |
| A8 | 같은 네이비 재킷+네이비 바지 / 같은 데님 워시 더블데님 | **비추** — 세트 아닌 세트처럼 보임 (GG, AtG3) | 워시·명도가 다르면 OK | 같은 id의 상·하 조합은 score 2 이하 |
| A9 | 올리브 + 오렌지 | ⚠ **이견**. MM '거의 모든 오렌지 ✗' / AtG4 '번트오렌지+올리브 ✔' | 탁한 러스트만 허용 | olive→rust score 2 variation |
| A10 | 선명한 보색 (빨강+초록, 쨍한 블루+오렌지) | **비추** — 코스튬 느낌 (WH1, RMRS1) | 탁한 버전(버건디+올리브, 네이비+러스트)은 클래식 | accent 그룹끼리는 score ≤2 |
| A11 | 4색 이상 | **비추** (Vou1, WH1) | 4번째가 작은 뉴트럴(신발·벨트)이면 허용 | 엔진에서 색 그룹 수 계산, 4개부터 −1 |
| A12 | 올화이트 / 올블랙 | 올화이트는 피부톤에 묻힘(FB2), 올블랙은 피부에 가혹(FB3) | 오프화이트·크림 섞기, 블랙은 질감 차 | 같은 id 상·하 score 2 |
| A13 | 여름 블랙 셔츠 + 블랙 데님 | 비추 — '웨이터 룩' (FB1) | 겨울엔 OK | summer 토글에서 black 상의+black 하의 −1 |
| A14 | 겨울 파스텔·연청 / 여름 초콜릿·헤비 브라운 | 계절감 어긋남 (WH1, WH2) | – | 6장 seasons 필터 |
| A15 | '카키' 용어 혼동 | 한국에서 '카키'가 올리브 그린을 뜻하는 경우 많음 | – | labels.ko.json에서 khaki=황갈색, olive=올리브/국방색으로 명시 (팀5 과제) |

표 8 행 수: 15

---

## 9. 데이터 변환 메모 (C2 엔진 담당자용)

### 9-1. 스키마 매핑

```
colorRule {
  base: <1장 id>,                 // 예: "indigo"
  baseCategory: "bottom"|"top",   // 4장 = bottom, 5장 = top
  matches: [
    { category: "top"|"shoes"|"outer"|"bottom",
      color: <id>, score: 1..5, tag: "classic"|"variation",
      sources: ["WH1","GG"] }     // 근거 열의 코드 그대로
  ],
  avoid: [ { color: <id>, category, reason } ]
}
```

- 4장 각 베이스의 세 표(상의/신발/아우터)를 `matches[]`에 `category`로 구분해 합침. 5장은 `category: "bottom"`과 `"shoes"`.
- 표 셀에 `a / b` 처럼 두 id가 묶인 행(예: `brown / chocolate`)은 **두 개의 match 항목으로 분리**하고 같은 score·tag 부여.
- "피하기" 표 + 8장의 조합 → `avoid[]`. 8장 '엔진 처리 제안' 열의 score 값이 4·5장 표와 충돌하면 **8장 우선**.
- `tag`가 variation이면서 score ≥ 4인 항목은 없음(정합성 체크용). classic인데 score 3인 항목은 "조건부 클래식"(톤·소재 주의) — UI에서 '클래식' 영역에 넣되 마지막 순서.
- ⚠ 표시 행은 `flags: ["disputed"]` 를 추가해 P3 콘텐츠 검토 때 재확인.

### 9-2. 색 데이터

```
color { id, labelKo, labelEn, hex, tones: [toneId...], seasons: [...] }
```
- 1장 표 → `colors.json`. `tones`는 2-1 표에서 역산(한 색이 여러 톤 그룹 가능).
- `seasons`는 6장 두 번째 표.
- hex 중 '근사값' 표시는 D2 토큰 단계에서 조정 가능하므로 `hexSource: "css"|"wikipedia"|"approx"` 필드 권장.

### 9-3. 톤·색상환 규칙

```
toneRule { from: toneId, to: toneId, modifier: -2..+1, note }
```
- 2-2 표 T1~T9를 modifier로: 뉴트럴↔뉴트럴 +0, 어스↔네이비 +1, 모노(black)↔어스 −1, accent↔accent −2, 같은 id 상·하 −2.
- 3장 색상환은 '더 보기 > 색상별' 탭의 설명 텍스트 + 분류 기준(유사/보색/무채)으로만 사용. 자동 계산보다 1장 id별 수동 매핑 권장:
  - 유사색 그룹: {navy, indigo, lightBlue, lavender}, {olive, sage, khaki, mustard}, {brown, rust, camel, tan}
  - 탁한 보색 쌍: navy↔rust/camel/brown, olive↔burgundy, charcoal↔mustard(변주)
  - 무채: mono 그룹 전부

### 9-4. 추천 점수 합산 제안

`최종 = colorRule.score + toneRule.modifier + seasonModifier(0 / −1 / −2) + 3색 초과 패널티(−1)`.
"클래식 조합 3개 고정 노출"은 7장 `universal: ✔` 행 중 선택한 베이스를 포함하는 것을 우선 꺼내고, 없으면 score 5 & classic 조합에서 생성.

### 9-5. 예시 코디

7장 → `outfits.json` : `{ id, items:[{category,color,itemName}], seasons[], tags[], isClassic:true, universal:bool, sources[] }`.
'brown 코트 + forestGreen 후디 변주'(o29)처럼 괄호 변주가 있는 행은 기본형과 변주형 2개 레코드로 분리.

---

## 10. 출처

| 코드 | 출처 | URL |
|---|---|---|
| WH1 | Westwood Hart – Men's fashion colour combinations guide | https://westwoodhart.com/blogs/westwood-hart/mens-fashion-color-combinations-guide-pairing-colours |
| WH2 | Westwood Hart – Classic menswear palette | https://westwoodhart.com/blogs/westwood-hart/mens-wardrobe-color-combinations-classic-menswear-palette |
| AtG1 | Ape to Gentleman – 8 outfit colour combinations | https://www.apetogentleman.com/outfit-colour-combinations/ |
| AtG2 | Ape to Gentleman – 5 chino colours | https://www.apetogentleman.com/best-chino-colours-how-to-wear/ |
| AtG3 | Ape to Gentleman – What to wear with white jeans | https://www.apetogentleman.com/what-to-wear-white-jeans/ |
| AtG4 | Ape to Gentleman – Autumn colours | https://www.apetogentleman.com/mens-fashion-autumn-colours/ |
| FB1 | FashionBeans – Black jeans outfits | https://www.fashionbeans.com/article/best-black-jeans-outfits-men/ |
| FB2 | FashionBeans – How to wear white jeans | https://www.fashionbeans.com/article/how-to-wear-white-jeans |
| FB3 | FashionBeans – Tonal dressing guide | https://www.fashionbeans.com/article/tonal-dressing-guide |
| FB4 | FashionBeans – 11 outdated style rules | https://www.fashionbeans.com/article/outdated-style-rules-should-break/ |
| FB-stripes | FashionBeans – 5 ways to wear stripes (검색 요약) | https://www.fashionbeans.com/2015/5-easy-ways-to-wear-stripes-this-summer/ |
| GG | Gentleman's Gazette – How to pair brown and blue | https://www.gentlemansgazette.com/matching-colors-for-men/ |
| PS1 | Permanent Style – Green is the third colour (검색 요약; 본문 403) | https://www.permanentstyle.com/2013/11/green-is-the-third-colour.html |
| PS2 | Permanent Style – Tan shoes with pale trousers / How to wear brown shoes (검색 요약) | https://www.permanentstyle.com/2008/09/the-rules-and-how-to-break-them-8-tan-shoes-with-pale-trousers , https://www.permanentstyle.com/2009/07/how-to-wear-brown-shoes.html |
| PS3 | Permanent Style – White jeans (검색 요약) | https://www.permanentstyle.com/2021/04/white-jeans-how-to-buy-wash-and-wear.html |
| PS-snippet | Permanent Style – 퍼플/보틀그린 under navy, 버건디 under mid-grey (검색 요약) | https://www.permanentstyle.com/?p=37245 |
| RMRS1 | Real Men Real Style – Match colors style rules (with Effortless Gent) | https://www.realmenrealstyle.com/match-colors-style-rules/ |
| RMRS2 | Real Men Real Style – How to wear gray | https://www.realmenrealstyle.com/how-to-wear-gray/ |
| RMRS3 | Real Men Real Style – Contrast (skin/hair) (검색 요약) | https://www.realmenrealstyle.com/?p=1602 |
| RMRS 색상환 | Real Men Real Style – Color wheel (검색 요약) | https://www.realmenrealstyle.com/?p=2742 |
| MF | Mensflair – Shirt colours for grey pants | https://mensflair.com/shirt-colours-grey-pants/ |
| MM | The Modest Man – What to wear with olive green pants | https://www.themodestman.com/what-to-wear-with-olive-green-pants/ |
| TMM-tan | The Modest Man – Grey jacket + tan chinos (검색 요약) | https://www.themodestman.com/outfits/grey-jacket-tan-chinos/ |
| Dapp | Dappered – Brown and grey | https://dappered.com/2015/09/brown-and-grey-how-to-wear-it/ |
| Fitville | The Fitville – Brown shoes with grey pants FAQ (검색 요약) | https://thefitville.com/pages/faqs-do-brown-dress-shoes-go-with-grey-pants |
| MRP | MR PORTER – Can you wear black and navy together (검색 요약; 본문 403) | https://www.mrporter.com/en-es/journal/fashion/you-asked-can-you-wear-black-and-navy-together-762234 |
| MRP-stripes | MR PORTER – Three ways to wear stripes (검색 요약) | https://www.mrporter.com/en-at/journal/fashion/three-ways-men-can-wear-stripes-in-spring-2018-513930 |
| Esq | Esquire AU – Callum Turner / navy+black (검색 요약) | https://esquire.com.au/callum-turner-tailoring/ |
| Vou1 | The VOU – 3 colour rule | https://thevou.com/blog/3-color-rule-outfits/ |
| Vou2 | The VOU – Tonal / monochrome dressing (검색 요약) | https://thevou.com/blog/tonal-dressing-style-guide-men/ |
| Celio | Celio – How to style neutral colours (beige, olive, white, navy) | https://celio.in/blogs/mens-trendy-clothing/how-to-style-neutral-colours-like-beige-olive-white-navy |
| Berle | Berle – What to wear with olive pants | https://berle.com/blogs/announcements/wear-olive-pants-men-outfits-style-tips |
| HB | Hugo Boss – What to wear with brown trousers (검색 요약; 본문 403) | https://www.hugoboss.com/uk/v/inspiration-what-to-wear-with-brown-trousers |
| Acorn | Acorn Fabrics – Pairing brown and blue (검색 요약) | https://www.acornfabrics.com/blog/the-secrets-to-pairing-brown-and-blue-for-your-outfits/ |
| Aza | Aza Fashions – Menswear colour cheat sheet (검색 요약) | https://www.azafashions.com/blog/menswear-colour-cheat-sheet/ |
| Studio | StudioSuits – Best color combinations (검색 요약) | https://www.studiosuits.com/en-in/blogs/articles/best-color-combinations |
| Hack | Hackett – Grey T-shirts (검색 요약) | https://www.hackett.com/eu/en_ie/men/b/grey-t-shirts/ |
| PM | Peter Manning NYC – Lighter wash jeans | https://www.petermanningnyc.com/blogs/news/114659652-when-and-how-to-wear-lighter-wash-jeans |
| StyleGF | Style Girlfriend – Light wash jeans (검색 요약) | https://stylegirlfriend.com/what-to-wear-with-light-wash-jeans/ |
| MSR | myshoesreview – Shoes with jeans (검색 요약, 저품질 주의) | https://myshoesreview.com/?p=12000 |
| HSS | He Spoke Style – What to wear with white jeans (검색 요약) | https://hespokestyle.com/what-to-wear-with-white-jeans/ |
| Dalm | Dalmard Marine – How to wear a Breton shirt (검색 요약; 본문 404) | https://dalmardmarine.com/en/our-logbook/article/mens-breton-shirt-how-to-wear-it |
| VK1 | Vogue Korea – 흰 청바지에도 파란 청바지에도 '이 신발'(브라운 스니커즈) | https://www.vogue.co.kr/2026/03/16/ (전체 URL은 본문 참조) |
| VK2 | Vogue Korea – 브라운과 가장 잘 어울리는 컬러 5 | https://www.vogue.co.kr/2023/10/25/ |
| VK3 | Vogue Korea – 청바지에 딱인 운동화 컬러 6 | https://www.vogue.co.kr/2026/03/24/ |
| WK1 | W Korea – 화이트 톱+데님 팬츠 불멸의 조합 | https://www.wkorea.com/2025/04/01/ |
| WK2 | W Korea – 뉴트럴 컬러 조합 | https://www.wkorea.com/2026/08/01/ |
| GQK | GQ Korea – 흰 티에 청바지 쿨하게 입는 법 | https://www.gqkorea.co.kr/2023/06/27/ |
| Allure | Allure Korea – 청바지에 가장 잘 어울리는 신발 (검색 요약) | https://www.allurekorea.com/?p=243038 |
| Khaki-guides / Navy-guides / Olive-guides / Brown-guides / Blue-guides / Burgundy-guides | SEO성 가이드 묶음(동일 내용 반복, 저품질). 단독 근거로 쓰지 않고 다른 출처와 겹칠 때만 classic 판정에 보조로 사용 | (생략) |
| HEX | CSS/X11 색 이름, Wikipedia 'List of colors', htmlcolorcodes.com | https://htmlcolorcodes.com/colors/ |

---

## 11. 채우지 못한 부분 (갭)

1. **Permanent Style, MR PORTER, Hugo Boss, Dalmard 본문**은 403/404로 직접 읽지 못하고 검색 요약으로만 반영. 핵심 주장(네이비·그레이가 왕, 그린이 제3색, 차콜+브라운 구두 비추, 네이비+블랙 조건부 OK)은 여러 검색 결과에서 일관되게 확인됨.
2. **Put This On, Articles of Style**은 검색에 유의미한 색 조합 글이 잡히지 않아 미반영.
3. **한국 남성복 커뮤니티(디젤매니아·무신사 매거진 등)** 는 검색 결과에 노출되지 않음. 한국 자료는 Vogue/W/GQ/Allure Korea 매거진으로 대체했고, 그중 일부(브라운 컬러 5, 뉴트럴 조합)는 여성복 기사라 아이템만 남성용으로 치환해 적용.
4. **오트밀·그레이 멜란지·라이트워시·인디고·네이비(의류용)·더스티핑크 hex**는 표준값이 없어 근사값. D2가 토큰 확정 시 조정 필요.
5. 상의 기준 5장은 '하의+신발'만 작성(아우터는 4장 하의 기준 아우터 표를 역참조하면 충분).
6. 피부·머리 대비는 개요만(3장 1행). 퍼스널컬러 세부는 2차 범위로 제안.
