# 스타일 규칙 리서치 (R2) — 핏·기장·소재·신발

작성일: 2026-10-19
담당: R2 스타일 리서치
대상 독자: C2 데이터/규칙 엔진 (JSON 변환), P3 콘텐츠 검토, 팀5 카피
기준: 2025~2026 한국 남성복 "클래식/미니멀" 베이스라인. 유행보다 검증된 조합을 기본값(클래식)으로, 모험적 조합은 '변주'.

---

## 0. 공통 ID 규약 (모든 표에서 동일하게 사용)

엔지니어가 JSON 키로 바로 쓸 수 있도록 영문 id를 고정한다. UI 표기는 8장(용어 표준화) 참조.

### 0-1. 핏 id

| 구분 | id | UI 표기 | 정의 (기준점) |
|---|---|---|---|
| 상의 핏 | `slim` | 슬림 | 몸에 붙음. 어깨선이 정확히 어깨 끝 |
| 상의 핏 | `regular` | 레귤러 | 몸과 손가락 2~3개 여유. 어깨선 어깨 끝 |
| 상의 핏 | `loose` | 루즈 | 어깨선이 어깨 끝보다 2~5cm 내려감. 몸통 여유 |
| 상의 핏 | `oversized` | 오버 | 어깨선 5cm 이상 드롭. 한 치수 이상 큼 |
| 하의 핏 | `slim` | 슬림 | 허벅지·밑단 모두 좁음 (밑단 단면 ≤ 17cm) |
| 하의 핏 | `tapered` | 테이퍼드 | 허벅지 여유, 발목으로 좁아짐 (밑단 단면 17~19cm) |
| 하의 핏 | `regular` | 레귤러 | 허벅지 보통, 아래로 살짝 좁아지거나 일자 (밑단 19~21cm) |
| 하의 핏 | `straight` | 스트레이트 | 허벅지부터 밑단까지 일자 (밑단 20~23cm) |
| 하의 핏 | `wide` | 와이드 | 허벅지부터 밑단까지 넓게 일자 (밑단 ≥ 23cm) |

> 밑단 단면 수치는 국내 쇼핑몰(무신사 등) 실측 표기 관행을 참고한 대략값이며, 브랜드마다 다르다. UI에는 수치를 노출하지 않고 핏 이름만 쓴다.

### 0-2. 기장 id

| 구분 | id | UI 표기 | 정의 |
|---|---|---|---|
| 상의 기장 | `crop` | 크롭 | 벨트 라인 또는 그 위에서 끝남 |
| 상의 기장 | `regular` | 레귤러 | 엉덩이 중간(바지 지퍼 하단 근처) |
| 상의 기장 | `long` | 롱 | 엉덩이 아래로 내려옴 (롱 셔츠, 롱 니트) |
| 아우터 기장 | `short` | 숏 | 허리~엉덩이 상단 (블루종, 데님 재킷, 코치 재킷) |
| 아우터 기장 | `regular` | 레귤러 | 엉덩이 덮음 (셔츠 재킷, 블레이저, 하프 코트, 숏 패딩) |
| 아우터 기장 | `long` | 롱 | 무릎 근처 이상 (롱 코트, 트렌치, 롱 패딩) |
| 바지 기장 | `crop` | 크롭 | 복사뼈 위 3~6cm. 발목 노출 |
| 바지 기장 | `nobreak` | 노브레이크 | 복사뼈~신발 윗선. 주름 없음 |
| 바지 기장 | `half` | 하프 브레이크 | 신발에 살짝 닿아 주름 한 번 |
| 바지 기장 | `full` | 풀 브레이크 | 신발 위로 원단이 쌓임 |

### 0-3. 소재 id

| id | UI 표기 | 비고 |
|---|---|---|
| `denim_indigo` | 인디고 데님 | 생지·진청. 가장 포멀한 데님 |
| `denim_washed` | 워시드 데님 | 연청·중청. 가장 캐주얼한 데님 |
| `denim_black` | 블랙 데님 | 도시적. 검정 가죽 신발과 상성 |
| `corduroy` | 코듀로이 | 구어 '골덴' |
| `chino` | 치노 | 구어 '면바지'. 코튼 트윌 포함 |
| `wool` | 울 슬랙스 | 워스티드(매끈한 울). 사계절 |
| `flannel` | 플란넬 | 기모 울. 겨울용 |
| `knit_cotton` | 코튼 니트 | 봄가을·초여름 |
| `knit_wool` | 울 니트 | 메리노·램스울 |
| `knit_cashmere` | 캐시미어 니트 | 가장 드레시한 니트 |
| `linen` | 린넨 | 여름 전용 |
| `jersey` | 저지/스웻 | 티셔츠, 스웻셔츠, 후디 원단 |
| `leather` | 가죽 | 주로 아우터·신발. 스웨이드 포함 |
| `nylon_tech` | 나일론/테크 | 코치 재킷, 셸, 패딩 겉감 |
| `tweed` | 트위드 | 거친 울. 겨울 재킷·코트 |

> 매트릭스 계산용으로는 데님 3종을 `denim`으로 묶어도 된다(점수 동일). 차이는 포멀도(5장)와 신발 색 상성에서만 난다.

### 0-4. 신발 id

| id | UI 표기 |
|---|---|
| `sneaker_white` | 흰 스니커즈 |
| `sneaker_color` | 컬러/레트로 스니커즈 |
| `running` | 러닝화 |
| `loafer_penny` | 페니 로퍼 |
| `loafer_tassel` | 태슬 로퍼 |
| `derby` | 더비 |
| `oxford` | 옥스포드 |
| `chelsea` | 첼시 부츠 |
| `workboot` | 워크 부츠 |
| `chukka` | 데저트/척카 부츠 |
| `sandal` | 샌들/슬리퍼 |

### 0-5. 계절 id (한국 기후)

| id | UI 표기 | 월 (대략) | 기온 |
|---|---|---|---|
| `spring_fall` | 봄가을 | 3~5월, 10~11월 | 8~22°C |
| `summer` | 여름 | 6~9월 | 23°C 이상, 고습 |
| `winter` | 겨울 | 12~2월 | 7°C 이하 |

### 0-6. 점수 규약

| 점수 | 의미 | 태그 |
|---|---|---|
| 5 | 클래식. 출처 2개 이상 겹침. 기본 추천 | classic |
| 4 | 안전. 무난하게 통함 | classic |
| 3 | 조건부. 노트의 조건을 만족하면 OK. '변주'로 노출 | variation |
| 2 | 비추천. 상급자용 | avoid (경고) |
| 1 | 피함 | avoid (차단) |

---

## 1. 핏 밸런스 규칙 (fitRule)

### 1-1. 핵심 원칙

| 원칙 | 내용 | 출처 합의도 |
|---|---|---|
| 하나는 넉넉하게, 하나는 붙게 | 상·하의 중 한쪽만 볼륨을 준다. 양쪽 다 넉넉하면 실루엣이 사라지고, 양쪽 다 붙으면 2010년대 느낌 | 높음 (Man of Many, Bonne Gueule, MR PORTER, Vogue Korea 모두 동일) |
| 2025~2026 기본 실루엣 | "큰 바지 + 작은(간결한) 상의". 와이드·스트레이트 하의에 레귤러·슬림 상의 | 높음 (MR PORTER, Vogue Korea, Esquire Korea) |
| 역방향도 클래식 | 루즈 상의 + 테이퍼드 하의 (코쿤 실루엣). 입문자에게 가장 쉬움 | 높음 (Bonne Gueule, Real Men Real Style) |
| 풀 슬림 허용 조건 | 마른 체형 + 포멀(수트·재킷) 상황. 2025년 하반기 슬림 재조명(Esquire Korea)이 있으나 기본값은 아님 | 중간 (출처 갈림) |
| 풀 루즈 허용 조건 | 키 175cm 이상 + 구조감 있는 원단 + 상의 기장 짧게 + 신발에 무게감. 스트릿 '변주' | 중간 |
| 상의 기장이 핏보다 먼저 | 루즈 상의일수록 기장이 짧아야 한다(엉덩이 중간 이내). 긴 루즈 상의는 어떤 하의와도 2점 | 높음 |

### 1-2. 상의 핏 × 하의 핏 매트릭스 (20행)

| topFit | bottomFit | score | note |
|---|---|---|---|
| slim | slim | 3 | 마른 체형·재킷 착장에서만. 기본 추천 아님 (2010년대식) |
| slim | tapered | 4 | 깔끔. 로퍼·더비와 좋음. 상의 턱인 권장 |
| slim | regular | 4 | 무난한 클래식 |
| slim | straight | 4 | 안전. 상의가 너무 짧지 않게 |
| slim | wide | 5 | 2025 기본 실루엣 "큰 바지 + 작은 상의". 상의 기장 레귤러 이하 |
| regular | slim | 3 | 상체가 무거워 보임. 숏 아우터 추가 시 4 |
| regular | tapered | 5 | 가장 안전한 클래식 |
| regular | regular | 5 | 누구에게나 통하는 기본값 |
| regular | straight | 5 | 클래식. 아우터 길이 불문 |
| regular | wide | 4 | 턱인 또는 크롭·레귤러 기장이면 5 |
| loose | slim | 3 | 역삼각 실루엣. 상의 기장 짧아야 함. 스트릿 변주 |
| loose | tapered | 5 | 코쿤 실루엣. 입문자용 클래식 (계획서 예시) |
| loose | regular | 4 | 안전. 신발은 볼륨 있는 것으로 |
| loose | straight | 4 | 안전. 소재가 구조감 있어야 함 |
| loose | wide | 3 | 풀 루즈. 키·소재·기장 조건 충족 시 변주 |
| oversized | slim | 3 | 스트릿. 변주 전용 |
| oversized | tapered | 4 | 오버 후디·스웻 + 테이퍼드 = 스트릿 클래식 |
| oversized | regular | 3 | 흐물해 보이기 쉬움 |
| oversized | straight | 3 | 상의 기장 크롭에 가까울 때만 |
| oversized | wide | 2 | 실루엣 실종. 상급자 변주 |

### 1-3. 체형 보정 (2차용 메모, MVP 미반영)

| 체형 | 가감 |
|---|---|
| 마른 체형 | slim×slim +1, loose×wide −1 |
| 키 170 이하 | wide 하의 −1 (단, 크롭 상의면 0), long 아우터 −1 |
| 키 180 이상 | loose×wide +1, long 아우터 +1 |
| 상체 발달 | oversized 상의 −1, regular×wide +1 |

---

## 2. 기장 규칙 (lengthRule)

### 2-1. 상의 기장 × 하의 핏 (15행)

| topLength | bottomFit | score | note |
|---|---|---|---|
| crop | slim | 4 | 다리 길어 보임. 하이웨이스트 권장 |
| crop | tapered | 4 | 깔끔 |
| crop | regular | 4 | 무난 |
| crop | straight | 5 | 2025 클래식. 하이웨이스트 스트레이트 |
| crop | wide | 5 | 와이드와 가장 잘 맞는 기장 |
| regular | slim | 4 | 기본 |
| regular | tapered | 5 | 기본 |
| regular | regular | 5 | 기본 |
| regular | straight | 5 | 기본 |
| regular | wide | 4 | 턱인이면 5 |
| long | slim | 4 | 롱 셔츠·롱 니트 + 슬림 = 롱앤린 실루엣 |
| long | tapered | 3 | 롱 상의가 테이퍼드 라인을 가림. 변주 |
| long | regular | 3 | 밋밋. 변주 |
| long | straight | 2 | 전체가 길고 평평함 |
| long | wide | 2 | 전체 길고 넓음. 키 185 이상 변주 |

### 2-2. 아우터 기장 × 하의 핏 (15행)

| outerLength | bottomFit | score | note |
|---|---|---|---|
| short | slim | 3 | 2010년대 느낌. 부츠와 함께면 4 |
| short | tapered | 4 | 무난 |
| short | regular | 5 | 숏 아우터의 기본 짝 |
| short | straight | 5 | 숏 재킷 + 스트레이트 데님 = 클래식 (W Korea) |
| short | wide | 5 | 짧은 위 + 넓은 아래 = 2025 기본 비율 |
| regular | slim | 4 | 블레이저·셔츠 재킷 + 슬림. 포멀 쪽 |
| regular | tapered | 5 | 기본 |
| regular | regular | 5 | 기본 |
| regular | straight | 5 | 기본 |
| regular | wide | 4 | 재킷 자체도 여유 있어야 함 |
| long | slim | 5 | 롱 코트 + 슬림 = 클래식 롱앤린 |
| long | tapered | 5 | 롱 코트 + 테이퍼드 슬랙스 = 클래식 |
| long | straight | 4 | 안전. 코트 품이 넉넉해야 |
| long | regular | 4 | 안전 |
| long | wide | 3 | 전체 볼륨. 코트도 오버 핏이어야 하고 신발에 무게 필요. 변주 |

> 출처 간 차이: 롱 코트 + 와이드는 Die Workwear(MR PORTER 기고)에서 "의도된 볼륨 조합"으로 긍정, 국내 매체는 슬림·테이퍼드를 기본으로 제시. 3점(변주)으로 통일.

### 2-3. 바지 기장(브레이크) × 하의 핏 (20행)

| trouserLength | bottomFit | score | note |
|---|---|---|---|
| crop | slim | 4 | 발목 노출. 여름·봄가을 |
| crop | tapered | 5 | 가장 자연스러운 크롭 |
| crop | regular | 4 | 무난 |
| crop | straight | 4 | 2025 스트레이트 크롭 흔함 |
| crop | wide | 3 | 넓고 짧으면 '통바지 7부' 느낌. 발목 바로 위까지만 |
| nobreak | slim | 5 | 기본 |
| nobreak | tapered | 5 | 기본. 2025 표준 기장 |
| nobreak | regular | 5 | 기본 |
| nobreak | straight | 5 | 기본 |
| nobreak | wide | 4 | 밑단이 신발 윗선에 닿는 정도 |
| half | slim | 4 | 포멀 쪽 |
| half | tapered | 5 | 클래식 수트 기장 (Permanent Style Rule 1) |
| half | regular | 5 | 클래식 |
| half | straight | 5 | 클래식 |
| half | wide | 5 | 와이드는 살짝 브레이크가 있어야 선이 산다 |
| full | slim | 2 | 발목에 뭉침 |
| full | tapered | 2 | 테이퍼드 라인 망가짐 |
| full | regular | 3 | 포멀·올드 클래식 |
| full | straight | 4 | 데님 스태킹(stacking) 변주 |
| full | wide | 4 | 와이드 데님 + 부츠 스태킹. 바닥 끌리지 않게 |

### 2-4. 바지 기장 × 신발 (44행 — 11개 신발 × 4 기장)

| shoe | trouserLength | score | note |
|---|---|---|---|
| sneaker_white | crop | 4 | 양말 또는 맨발목. 봄가을·여름 |
| sneaker_white | nobreak | 5 | 기본 |
| sneaker_white | half | 4 | 무난 |
| sneaker_white | full | 2 | 밑단이 신발 위에 뭉침 |
| sneaker_color | crop | 4 | 양말 색 포인트 가능 |
| sneaker_color | nobreak | 5 | 기본 |
| sneaker_color | half | 4 | 무난 |
| sneaker_color | full | 3 | 레트로 스니커즈 + 와이드 스태킹은 스트릿 변주 |
| running | crop | 4 | 러닝화는 발목이 보여야 덜 둔해 보임 |
| running | nobreak | 5 | 기본 |
| running | half | 3 | 두꺼운 밑창에 원단 걸림 |
| running | full | 2 | 피함 |
| loafer_penny | crop | 5 | 여름 클래식. 노삭스/페이크삭스 |
| loafer_penny | nobreak | 5 | 사계절 기본 |
| loafer_penny | half | 4 | 가을·겨울 울 슬랙스 + 양말 |
| loafer_penny | full | 2 | 로퍼 낮은 등판 위로 원단이 덮임 |
| loafer_tassel | crop | 4 | 여름 OK. 페니보다 드레시하므로 양말 권장 |
| loafer_tassel | nobreak | 5 | 기본 |
| loafer_tassel | half | 5 | 슬랙스·플란넬 + 태슬 = 클래식 |
| loafer_tassel | full | 2 | 피함 |
| derby | crop | 3 | 양말 보이기. 변주 |
| derby | nobreak | 5 | 기본 |
| derby | half | 5 | 클래식 |
| derby | full | 3 | 올드 포멀. 두꺼운 밑창 더비 + 와이드 데님이면 4 |
| oxford | crop | 2 | 포멀도 충돌 |
| oxford | nobreak | 4 | 모던 포멀 |
| oxford | half | 5 | 클래식 포멀 기장 |
| oxford | full | 3 | 전통적이지만 올드 |
| chelsea | crop | 3 | 부츠 입구가 드러남. 슬림·테이퍼드에서만 변주 |
| chelsea | nobreak | 5 | 기본. 밑단이 부츠 입구를 살짝 덮는 정도 |
| chelsea | half | 4 | 무난 |
| chelsea | full | 3 | 슬림 바지면 뭉침. 스트레이트면 4 |
| workboot | crop | 2 | 부츠 목이 통째로 보임. 피함 |
| workboot | nobreak | 4 | 스트레이트·와이드 데님에서 |
| workboot | half | 5 | 기본. 밑단이 부츠 위에 한 번 걸침 |
| workboot | full | 4 | 와이드 데님 스태킹. 워크웨어 클래식 |
| chukka | crop | 3 | 봄가을 변주 |
| chukka | nobreak | 5 | 기본 |
| chukka | half | 5 | 치노·데님 + 척카 클래식 |
| chukka | full | 3 | 뭉침 |
| sandal | crop | 5 | 여름 기본 |
| sandal | nobreak | 4 | 무난 |
| sandal | half | 2 | 발등이 가려져 답답 |
| sandal | full | 1 | 피함 |

### 2-5. 기장·핏·신발 상호작용 메모 (엔진 보정 규칙)

| 조건 | 보정 | 근거 |
|---|---|---|
| `crop` 바지 + `summer` + 로퍼/샌들 | +1 (최대 5) | 발목 노출이 여름 클래식 |
| `crop` 바지 + `winter` | −1 | 발목 노출 비실용. 양말 두껍게 보이면 0 |
| `wide` 하의 + 얇은 신발(`sneaker_white` 슬림형, `loafer_*`) | 0 (갈림) | MR PORTER는 슬림 신발 권장, FashionBeans는 두꺼운 신발 권장 → 둘 다 허용, note로 표시 |
| `wide` 하의 + `full` 기장 + 가는 신발 | −1 | 발이 원단에 묻힘 |
| `slim` 하의 + `workboot` | −1 | 부츠가 바지보다 넓어 다리가 가늘어 보임 (1990년대 느낌) |
| `long` 아우터 + `crop` 바지 | −1 | 긴 위 + 짧은 아래 = 비율 불균형. 로퍼 노삭스 여름 변주일 때만 0 |
| `short` 아우터 + `crop` 상의 + `wide` 하의 | 0 | 2025 스트릿 기본형. 감점 없음 |

---

## 3. 소재 매트릭스 (matRule)

### 3-1. 소재별 속성 (15행)

| material | seasons | 무게/질감 | 포멀도(1~10) | 핵심 메모 |
|---|---|---|---|---|
| denim_indigo | spring_fall, winter, (summer: 얇은 것만) | 중~무거움, 거친 트윌 | 4 | 가장 범용. 블레이저·니트·가죽과 모두 OK |
| denim_washed | spring_fall, summer | 중간, 부드러움 | 3 | 캐주얼 전용. 옥스포드·플란넬 재킷과 충돌 |
| denim_black | spring_fall, winter | 중간, 매끈 | 5 | 블랙 가죽 신발·첼시 부츠와 최상. 도시적 |
| corduroy | spring_fall(늦가을), winter | 무거움, 보풀 질감 | 4 | 울 니트·트위드·플란넬 등 '보송한' 질감과 묶음. 린넨 금지 |
| chino | spring_fall, summer, winter(두꺼운 것) | 가벼움~중간, 매끈 | 5 | 사계절 기본. 무엇과도 무난하나 '밋밋' 경고 |
| wool | spring_fall, summer(트로피컬 울), winter | 가벼움~중간, 매끈 | 7 | 가장 드레시한 하의. 저지·러닝화와 격차 큼 |
| flannel | winter, spring_fall(늦가을) | 무거움, 기모 | 7 | 겨울 울 니트·캐시미어·트위드와 최상 |
| knit_cotton | spring_fall, summer(얇은 것) | 가벼움 | 4 | 치노·린넨·워시드 데님 |
| knit_wool | spring_fall, winter | 중간 | 5 | 모든 겨울 하의와 OK. 가죽 재킷 안에 |
| knit_cashmere | winter, spring_fall | 가벼운데 따뜻, 매끈 | 7 | 플란넬·울 슬랙스·블랙 데님. 워시드 데님·스웻과는 격차 |
| linen | summer, spring_fall(5·9월) | 가벼움, 구김 | 4 | 여름 전용. 울 니트·코듀로이·트위드·플란넬과 계절 충돌 |
| jersey | 사계절 | 가벼움~중간, 부드러움 | 2 | 티셔츠·스웻. 데님·치노·나일론. 플란넬·옥스포드와 격차 |
| leather | spring_fall, winter | 무거움, 매끈/스웨이드 | 5 | 아우터로서 데님·울 니트·블랙 데님과 최상. 전신 가죽 금지 |
| nylon_tech | spring_fall, (summer: 얇은 셸), winter(패딩) | 가벼움, 매끈·광택 | 3 | 스웻·데님·치노. 플란넬·옥스포드와 격차 |
| tweed | winter, spring_fall(늦가을) | 무거움, 거침 | 6 | 코듀로이·플란넬·데님·울 니트. 린넨·저지 금지 |

### 3-2. 소재 × 소재 어울림 매트릭스 (13×13, 대칭)

데님 3종은 `denim` 한 열로 묶음(차이는 3-3 참조). 값 = 함께 입었을 때 점수.

| | denim | cord | chino | wool | flan | k_cot | k_wool | k_cash | linen | jersey | leather | nylon | tweed |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **denim** | 3 | 4 | 4 | 4 | 4 | 5 | 5 | 4 | 4 | 5 | 5 | 4 | 5 |
| **corduroy** | 4 | 2 | 3 | 3 | 4 | 4 | 5 | 4 | 1 | 3 | 4 | 3 | 5 |
| **chino** | 4 | 3 | 3 | 4 | 3 | 5 | 5 | 4 | 5 | 4 | 4 | 4 | 4 |
| **wool** | 4 | 3 | 4 | 5 | 4 | 3 | 5 | 5 | 3 | 3 | 4 | 3 | 4 |
| **flannel** | 4 | 4 | 3 | 4 | 3 | 3 | 5 | 5 | 1 | 3 | 4 | 3 | 5 |
| **knit_cotton** | 5 | 4 | 5 | 3 | 3 | 3 | 3 | 2 | 4 | 3 | 4 | 4 | 3 |
| **knit_wool** | 5 | 5 | 5 | 5 | 5 | 3 | 4 | 4 | 2 | 3 | 5 | 4 | 5 |
| **knit_cashmere** | 4 | 4 | 4 | 5 | 5 | 2 | 4 | 4 | 2 | 2 | 4 | 3 | 4 |
| **linen** | 4 | 1 | 5 | 3 | 1 | 4 | 2 | 2 | 4 | 3 | 2 | 2 | 1 |
| **jersey** | 5 | 3 | 4 | 3 | 3 | 3 | 3 | 2 | 3 | 3 | 4 | 5 | 2 |
| **leather** | 5 | 4 | 4 | 4 | 4 | 4 | 5 | 4 | 2 | 4 | 1 | 3 | 3 |
| **nylon_tech** | 4 | 3 | 4 | 3 | 3 | 4 | 4 | 3 | 2 | 5 | 3 | 4 | 2 |
| **tweed** | 5 | 5 | 4 | 4 | 5 | 3 | 5 | 4 | 1 | 2 | 3 | 2 | 3 |

### 3-3. 소재별 pairsWith / avoid 상세 (15행 → matRule 직접 변환용)

| material | pairsWith (score) | avoid (이유) | 질감·무게 메모 |
|---|---|---|---|
| denim_indigo | knit_wool 5, jersey 5, leather 5, tweed 5, knit_cotton 5, chino 4, corduroy 4, wool 4, flannel 4, linen 4, nylon_tech 4, knit_cashmere 4 | denim_indigo(동일 톤 상하 1 — '캐나디안 턱시도', 톤 차이 크면 3) | 무거운 인디고는 무거운 신발(부츠·더비)과, 얇은 것은 로퍼·스니커즈 |
| denim_washed | jersey 5, knit_cotton 5, nylon_tech 4, chino 4, leather 4, linen 4, knit_wool 4 | flannel 2(포멀도 격차), wool 2(격차), knit_cashmere 2, tweed 3(워크웨어 변주만) | 가볍고 부드러워 여름까지. 드레시한 것과 섞지 않기 |
| denim_black | leather 5, knit_wool 5, knit_cashmere 5, wool 4, jersey 4, nylon_tech 4, tweed 4, chino 3 | linen 2(계절·무드 충돌), corduroy 3(둘 다 어두우면 4) | 블랙 가죽 신발 전용에 가까움. 갈색 신발은 2 |
| corduroy | tweed 5, knit_wool 5, denim 4(재킷), flannel 4, knit_cotton 4, leather 4, knit_cashmere 4 | linen 1(계절), corduroy 2(전신 골덴), wool 3(매끈 워스티드 재킷 + 골덴 바지는 질감 충돌 2, 반대는 4) | 보풀 질감끼리 묶는다. 골 굵을수록 캐주얼, 가늘수록 드레시 |
| chino | knit_cotton 5, knit_wool 5, linen 5, denim 4(재킷), wool 4(재킷), jersey 4, leather 4, nylon_tech 4, tweed 4, knit_cashmere 4 | chino 3(동일 톤 상하 2), flannel 3(겨울엔 코듀로이가 나음) | 가장 중립. 단, 치노+흰 티+흰 스니커즈는 '밋밋' 경고 → 아우터로 질감 추가 |
| wool | wool 5(수트), knit_wool 5, knit_cashmere 5, denim 4(재킷), chino 4, flannel 4, leather 4, tweed 4 | jersey 3(스웻셔츠+슬랙스는 2025 변주로 허용, 러닝화 동반 시 1), nylon_tech 3, knit_cotton 3, linen 3(린넨 셔츠+울 슬랙스 여름 4, 린넨 바지+울 재킷 2) | 매끈한 소재. 거친 것과 섞을 땐 니트 등 완충재 필요 |
| flannel | knit_wool 5, knit_cashmere 5, tweed 5, denim 4(재킷), corduroy 4, wool 4, leather 4 | linen 1, chino 3, jersey 3(스웻+플란넬 변주), knit_cotton 3 | 무거움. 무거운 신발(더비·첼시·태슬로퍼+양말) |
| knit_cotton | denim 5, chino 5, linen 4, corduroy 4, leather 4, nylon_tech 4 | knit_cashmere 2(격차), flannel 3, wool 3 | 가벼움. 봄가을 레이어 베이스 |
| knit_wool | denim 5, corduroy 5, chino 5, wool 5, flannel 5, leather 5, tweed 5, nylon_tech 4, knit_cashmere 4 | linen 2(계절), jersey 3 | 겨울 만능 상의. 니트 위 니트(가디건)는 4 |
| knit_cashmere | wool 5, flannel 5, denim_black 5, denim_indigo 4, corduroy 4, chino 4, leather 4, tweed 4 | knit_cotton 2, jersey 2, linen 2, denim_washed 2 | 드레시. 워시드 데님·스웻과 포멀도 격차 |
| linen | chino 5, denim 4(얇은 워시드·인디고), linen 4(셋업), knit_cotton 4, wool 3(셔츠로만) | corduroy 1, flannel 1, tweed 1, knit_wool 2, leather 2, nylon_tech 2 | 여름 전용. 구김은 허용. 가죽 로퍼·샌들·캔버스 스니커즈 |
| jersey | denim 5, nylon_tech 5, chino 4, leather 4 | tweed 2, knit_cashmere 2, wool 3(변주), flannel 3 | 스웻·후디. 와이드·테이퍼드 하의와 러닝화·스니커즈 |
| leather | denim 5, knit_wool 5, corduroy 4, chino 4, wool 4, flannel 4, jersey 4, knit_cotton 4, knit_cashmere 4 | leather 1(전신 가죽), linen 2 | 아우터로서 거의 만능. 스웨이드는 한 단계 캐주얼·부드러움 |
| nylon_tech | jersey 5, denim 4, chino 4, knit_cotton 4, knit_wool 4, nylon_tech 4(아웃도어 셋업) | tweed 2, linen 2, wool 3(고프코어 변주), flannel 3 | 광택·가벼움. 러닝화·레트로 스니커즈와 짝 |
| tweed | denim 5, corduroy 5, flannel 5, knit_wool 5, chino 4, wool 4, knit_cashmere 4 | linen 1, jersey 2, nylon_tech 2, tweed 3(스리피스 과함) | 거친 질감. 매끈한 워스티드·드레스 셔츠와는 어색(Baltimore Sun). 두꺼운 신발 |

### 3-4. 질감·무게 원칙 (엔진 보정)

| 원칙 | 규칙 | 출처 |
|---|---|---|
| 무거운 것끼리 | 무거움(코듀로이·플란넬·트위드·헤비 데님)끼리 +0, 무거움+가벼움(린넨·저지) −1 | Mashburn, Baltimore Sun |
| 보송함 레벨 맞추기 | 보풀(코듀로이·플란넬·트위드·스웨이드) vs 매끈(워스티드·포플린·나일론) 섞을 땐 니트로 완충 | Baltimore Sun, StyleForum |
| 계절 인접 | 인접 계절 소재끼리만(봄가을↔여름, 봄가을↔겨울). 여름↔겨울 소재 직접 조합 1 | Mashburn |
| 사계절 소재 | 치노·울 슬랙스(워스티드)·인디고 데님·저지는 어느 계절 소재와도 계절 감점 없음 | Mashburn |
| 신발 무게 동조 | 무거운 하의 소재(플란넬·트위드·코듀로이·헤비 데님) → 무거운 신발(더비·부츠·두꺼운 로퍼) +1 | FashionBeans |

---

## 4. 신발 규칙 (shoeRule)

### 4-1. 신발 속성 요약 (11행)

| shoe | 포멀도(1~10) | seasons | 양말 | 한 줄 메모 |
|---|---|---|---|---|
| sneaker_white | 3 | 사계절 (겨울 가죽형) | 흰·회 양말, 여름 페이크삭스 | 2025 기본 신발. 미니멀 가죽형이 '클래식' |
| sneaker_color | 2 | 사계절 | 양말 색 포인트 가능 | 레트로 러닝 실루엣. 와이드 데님·스웻과 |
| running | 1 | 사계절 | 스포츠 양말 | 고프코어. 테일러드와는 격차 큼 |
| loafer_penny | 6 | 봄가을·여름 (겨울 양말 착용 시 OK) | 여름 노삭스/페이크삭스, 가을·겨울 양말 | 가장 범용적인 가죽 신발. 치노·슬랙스·데님 전부 |
| loafer_tassel | 7 | 봄가을·겨울·여름 | 양말 권장 | 페니보다 드레시. 슬랙스·플란넬 |
| derby | 7 | 사계절 (여름 스웨이드) | 바지색 양말 | 가죽 신발 중 가장 범용. 두꺼운 밑창은 데님과 |
| oxford | 9 | 봄가을·겨울 | 바지색 긴 양말 | 수트 전용에 가까움. 데님·치노와는 격차 |
| chelsea | 6 | 봄가을·겨울 | 보이지 않음 | 슬림·테이퍼드 전용. 와이드에 묻힘 |
| workboot | 4 | 겨울·늦가을 | 두꺼운 양말 | 스트레이트·와이드 데님·코듀로이. 슬림 금지 |
| chukka | 5 | 봄가을·겨울 | 바지색 양말 | 치노·데님 만능. 스웨이드 기본 |
| sandal | 1 | 여름 | 없음 | 린넨·쇼츠·크롭. 슬랙스는 변주 |

### 4-2. 신발 × 하의(소재 × 핏 × 기장) 상세

핏·기장은 대표 조합만 적음. 표에 없는 조합은 **기본값 3** + 2-4 기장 보정 + 3-4 무게 보정으로 계산.

#### sneaker_white (12행)

| material | fit | length | score | note |
|---|---|---|---|---|
| denim_indigo | tapered | nobreak | 5 | 흰 티 + 인디고 + 흰 스니커즈 = 1순위 클래식 |
| denim_indigo | straight | nobreak | 5 | 2025 기본 |
| denim_indigo | wide | half | 4 | 슬림형 스니커즈면 발이 묻힘 → 볼륨형 권장 |
| denim_washed | straight | crop | 5 | 봄·여름 |
| denim_black | slim | nobreak | 4 | 도시적 |
| chino | tapered | nobreak | 5 | 봄가을 기본 |
| chino | wide | nobreak | 4 | 크롭 상의와 |
| wool | tapered | nobreak | 4 | 가죽 미니멀 스니커즈만. 캔버스는 3 |
| wool | wide | half | 3 | 스니커즈가 가늘면 2 |
| corduroy | straight | nobreak | 4 | 가을 |
| linen | regular | crop | 4 | 여름. 캔버스형 5 |
| jersey(트랙팬츠) | tapered | nobreak | 4 | 스트릿 |

#### sneaker_color (8행)

| material | fit | length | score | note |
|---|---|---|---|---|
| denim_washed | wide | full | 4 | 레트로 러닝 + 와이드 데님 스태킹 = 스트릿 클래식 |
| denim_washed | straight | nobreak | 5 | 가장 안전 |
| denim_indigo | straight | nobreak | 4 | |
| chino | wide | nobreak | 4 | 2025 캐주얼 |
| jersey(스웻팬츠) | tapered | nobreak | 5 | 애슬레저 기본 |
| nylon_tech | tapered | nobreak | 5 | 고프코어 |
| wool | tapered | crop | 3 | '슬랙스 + 레트로' 변주. 양말 포인트 |
| corduroy | wide | half | 3 | 변주 |

#### running (6행)

| material | fit | length | score | note |
|---|---|---|---|---|
| jersey(트랙·스웻) | tapered | nobreak | 5 | 기본 |
| nylon_tech | tapered | nobreak | 5 | 고프코어 클래식 |
| denim_washed | straight | nobreak | 4 | 캐주얼 |
| chino | wide | crop | 3 | 변주 |
| wool | 어떤 핏이든 | 어떤 기장이든 | 2 | 포멀도 격차 경고 ("러닝화 + 울 슬랙스") |
| flannel / tweed | 어떤 핏이든 | 어떤 기장이든 | 1 | 피함 |

#### loafer_penny (12행)

| material | fit | length | score | note |
|---|---|---|---|---|
| chino | tapered | nobreak | 5 | 계획서 예시 "치노 + 로퍼". 사계절 |
| chino | tapered | crop | 5 | 여름 노삭스 |
| chino | wide | half | 4 | 2025 와이드 치노 + 로퍼 |
| wool | tapered | nobreak | 5 | 비즈니스 캐주얼 기본 |
| wool | wide | half | 5 | 2025 와이드 슬랙스 + 로퍼 (양말 또는 노삭스) |
| denim_indigo | straight | nobreak | 5 | 아이비 클래식 |
| denim_indigo | tapered | crop | 4 | 봄가을 |
| denim_washed | straight | nobreak | 3 | 밝은 워시드는 로퍼와 격차. 스웨이드 로퍼면 4 |
| denim_black | slim | nobreak | 4 | 블랙 로퍼 |
| corduroy | tapered | nobreak | 5 | 가을 클래식 (W Korea: 코듀로이 + 브라운 로퍼) |
| flannel | tapered | half | 4 | 겨울 + 양말 |
| linen | regular | crop | 5 | 여름 클래식 |

#### loafer_tassel (8행)

| material | fit | length | score | note |
|---|---|---|---|---|
| wool | tapered | half | 5 | 클래식 |
| wool | wide | half | 5 | 2025 |
| flannel | tapered | half | 5 | 겨울 클래식 |
| chino | tapered | nobreak | 4 | |
| corduroy | tapered | nobreak | 4 | |
| denim_indigo | straight | nobreak | 4 | 생지·진청만 |
| denim_washed | 어떤 핏이든 | 어떤 기장이든 | 2 | 격차 |
| linen | regular | crop | 3 | 양말 없이 태슬은 어색. 변주 |

#### derby (12행)

| material | fit | length | score | note |
|---|---|---|---|---|
| wool | tapered | half | 5 | 비즈니스 기본 |
| wool | straight | half | 5 | |
| wool | wide | half | 4 | 두꺼운 밑창 더비면 5 |
| flannel | tapered | half | 5 | 겨울 클래식 |
| chino | tapered | nobreak | 5 | 사계절 |
| chino | straight | nobreak | 4 | |
| denim_indigo | straight | nobreak | 5 | 두꺼운 밑창(플레인 토) 더비가 최적 |
| denim_indigo | wide | half | 4 | 두꺼운 밑창 |
| denim_black | slim | nobreak | 5 | 블랙 더비 |
| denim_washed | straight | nobreak | 3 | 스웨이드 더비면 4 |
| corduroy | straight | half | 5 | 가을·겨울 |
| tweed(바지) | straight | half | 4 | |

#### oxford (7행)

| material | fit | length | score | note |
|---|---|---|---|---|
| wool(수트) | tapered | half | 5 | 유일한 '기본' |
| wool | slim | nobreak | 4 | 모던 포멀 |
| wool | wide | half | 4 | |
| flannel | tapered | half | 4 | |
| chino | tapered | nobreak | 3 | 포멀도 격차. 다크 치노 + 블레이저일 때만 |
| denim_indigo | 어떤 핏이든 | 어떤 기장이든 | 2 | 격차 경고 |
| denim_washed / jersey / nylon_tech | 어떤 핏이든 | 어떤 기장이든 | 1 | 피함 |

#### chelsea (10행)

| material | fit | length | score | note |
|---|---|---|---|---|
| denim_black | slim | nobreak | 5 | 첼시의 대표 조합 |
| denim_indigo | slim | nobreak | 5 | |
| denim_indigo | tapered | nobreak | 5 | |
| denim_indigo | straight | half | 4 | |
| wool | tapered | nobreak | 5 | 겨울 비즈니스 캐주얼 |
| wool | slim | nobreak | 5 | |
| flannel | tapered | half | 4 | |
| chino | tapered | nobreak | 4 | |
| corduroy | tapered | nobreak | 4 | |
| 어떤 소재든 | wide | 어떤 기장이든 | 2 | 부츠가 바지에 묻힘 (MR PORTER, Bootspy) |

#### workboot (9행)

| material | fit | length | score | note |
|---|---|---|---|---|
| denim_indigo | straight | half | 5 | 계획서 예시 "와이드 데님 + 묵직한 부츠"의 안전판 |
| denim_indigo | wide | full | 5 | 워크웨어 클래식 (스태킹) |
| denim_washed | straight | half | 4 | |
| corduroy | straight | half | 5 | 늦가을·겨울 |
| corduroy | wide | half | 4 | |
| chino(두꺼운 트윌) | straight | half | 4 | |
| flannel | straight | half | 3 | 질감 OK, 포멀도 격차. 변주 |
| wool | 어떤 핏이든 | 어떤 기장이든 | 2 | 격차 |
| 어떤 소재든 | slim | 어떤 기장이든 | 2 | 부츠 > 바지 폭. 다리 가늘어 보임 |

#### chukka (9행)

| material | fit | length | score | note |
|---|---|---|---|---|
| chino | tapered | nobreak | 5 | 척카의 대표 조합 |
| chino | straight | half | 5 | |
| denim_indigo | tapered | nobreak | 5 | |
| denim_indigo | straight | half | 5 | |
| denim_washed | straight | nobreak | 4 | 스웨이드 데저트 부츠 |
| corduroy | tapered | nobreak | 5 | 가을 |
| wool | tapered | nobreak | 4 | 매끈한 가죽 척카만. 스웨이드 데저트 부츠 3 |
| flannel | tapered | half | 3 | 변주 |
| 어떤 소재든 | wide | 어떤 기장이든 | 3 | 와이드엔 묻힘. 두꺼운 밑창이면 4 |

#### sandal (7행)

| material | fit | length | score | note |
|---|---|---|---|---|
| linen | regular | crop | 5 | 여름 클래식 |
| linen | wide | crop | 5 | |
| chino(쇼츠·크롭) | regular | crop | 5 | |
| denim_washed | straight | crop | 4 | 캐주얼 |
| jersey | tapered | crop | 4 | 홈웨어 느낌 주의 |
| wool | wide | crop | 3 | '슬랙스 + 샌들' 2025 변주. 가죽 샌들만 |
| denim_indigo / corduroy / flannel | 어떤 핏이든 | 어떤 기장이든 | 1~2 | 계절·무게 충돌 |

### 4-3. 와이드 하의 + 신발 폭 (출처 갈림 메모)

| 입장 | 주장 | 출처 |
|---|---|---|
| 슬림 신발 | 와이드의 볼륨을 상쇄하려면 날렵한 로퍼·저먼 트레이너 | MR PORTER 스타일리스트 인용 |
| 볼륨 신발 | 밑창이 두꺼울수록 다리 폭이 넓어도 됨. "신발이 가늘수록 바지 라인은 정리돼야" | FashionBeans, PaperStraight |
| 엔진 처리 | 둘 다 허용(점수 4). 단 `wide`+`full`+가는 신발은 −1. 첼시·척카처럼 목 있는 가는 부츠만 2 | — |

---

## 5. 포멀도 사다리 (formalityLadder)

엔진은 아이템 간 포멀도 차이가 **4 이상**이면 경고, **5 이상**이면 차단한다. (예: 러닝화 1 + 울 슬랙스 7 = 차 6 → 차단. 흰 스니커즈 3 + 울 슬랙스 7 = 차 4 → 경고 후 '가죽 미니멀형'이면 허용.)

### 5-1. 신발 (11행)

| level | shoe |
|---|---|
| 9 | oxford |
| 7 | loafer_tassel, derby |
| 6 | loafer_penny, chelsea |
| 5 | chukka |
| 4 | workboot |
| 3 | sneaker_white (가죽 미니멀형). 캔버스형은 2 |
| 2 | sneaker_color |
| 1 | running, sandal |

> 출처 갈림: 첼시 부츠를 몽크 위(Bespoke Unit)로 보기도, 아래(Mr. Koachman)로 보기도 함. 6으로 중간 처리.

### 5-2. 하의 (10행)

| level | 하의 |
|---|---|
| 8 | wool 슬랙스 (수트 바지) |
| 7 | flannel 슬랙스, wool 단품 슬랙스 |
| 6 | 코듀로이 슬랙스(가는 골), 트위드 바지 |
| 5 | chino (다크·테이퍼드), denim_black |
| 4 | chino (라이트·와이드), corduroy (굵은 골), denim_indigo, linen |
| 3 | denim_washed, 나일론 카고 |
| 2 | jersey 스웻팬츠, 트랙팬츠 |
| 1 | 쇼츠(스웻), 슬리퍼 급 |

### 5-3. 상의 (9행)

| level | 상의 |
|---|---|
| 8 | 드레스 셔츠(포플린·트윌) + 타이 |
| 7 | 드레스 셔츠 노타이, knit_cashmere |
| 6 | 옥스포드 버튼다운 셔츠, 울 폴로 |
| 5 | knit_wool, 린넨 셔츠, 플란넬 셔츠 |
| 4 | knit_cotton, 피케 폴로, 데님 셔츠 |
| 3 | 헨리넥, 긴팔 티 |
| 2 | jersey 티셔츠, 스웻셔츠 |
| 1 | 후디, 탱크톱 |

### 5-4. 아우터 (10행)

| level | 아우터 |
|---|---|
| 9 | 체스터필드 코트, 수트 재킷 |
| 8 | 블레이저, 트렌치 코트 |
| 7 | 발마칸·싱글 코트, 피코트 |
| 6 | 더플 코트, 셔츠 재킷(울) |
| 5 | 가죽 재킷(미니멀), 가디건 |
| 4 | 데님 재킷, 셔츠 재킷(코튼), 블루종(울) |
| 3 | 블루종(나일론 MA-1), 코치 재킷, 플리스(미니멀) |
| 2 | 숏 패딩, 플리스(아웃도어) |
| 1 | 롱 패딩(벤치 파카), 윈드브레이커 |

### 5-5. 격차 경고 예시 (엔진 테스트 케이스)

| 조합 | 격차 | 처리 |
|---|---|---|
| running(1) + wool 슬랙스(7) | 6 | 차단 |
| sandal(1) + flannel(7) | 6 | 차단 |
| oxford(9) + denim_washed(3) | 6 | 차단 |
| oxford(9) + chino(5) | 4 | 경고 ("다크 치노 + 블레이저일 때만") |
| sneaker_white(3) + wool(7) | 4 | 경고 ("가죽 미니멀형 권장") |
| 후디(1) + wool(7) | 6 | 차단 (오버 후디 + 슬랙스 스트릿은 변주 태그로 별도 허용) |
| workboot(4) + wool(7) | 3 | 통과하되 3-4 질감 보정으로 −1 |

---

## 6. 계절별 레이어링·아우터 규칙 (outerRule)

### 6-1. 봄가을 (spring_fall) — 아우터 7종

| outer | outerLength | 소재 | 포멀도 | 어울리는 하의 (소재·핏) | 어울리는 신발 | 피함 |
|---|---|---|---|---|---|---|
| 데님 재킷 | short | denim | 4 | chino tapered/straight 5, wool tapered 4, corduroy straight 4, denim 다른 톤 3 | sneaker_white, chukka, derby, loafer_penny, workboot | 같은 톤 데님 상하 1, 옥스포드 |
| 코치 재킷 | short | nylon_tech | 3 | denim_washed straight 5, chino wide 4, jersey 트랙 4 | sneaker_*, running | 슬랙스(변주 3), 옥스포드·태슬 로퍼 |
| 블루종(MA-1·해링턴) | short | nylon_tech / 코튼 / 울 | 3~5 | denim_indigo tapered 5, chino tapered 5, wool tapered 4(해링턴), denim_black slim 4 | sneaker_white, loafer_penny(해링턴), chelsea, derby | wide + 숏 블루종 + crop은 OK, full 기장은 2 |
| 가디건 | regular | knit_wool / knit_cotton | 5 | chino tapered 5, wool tapered 5, denim_indigo straight 5, corduroy 4 | loafer_*, derby, sneaker_white | 스웻팬츠 2 |
| 셔츠 재킷(오버셔츠) | regular | 코튼 트윌 / 울 / 코듀로이 | 4~6 | chino 5, denim_indigo 5, wool 4, corduroy 4(코듀로이 셔츠 재킷이면 상하 골덴 2) | derby, chukka, loafer_penny, sneaker_white | 린넨 바지(코듀로이 셔츠 재킷일 때) |
| 트렌치 코트 | long | 코튼 개버딘 | 8 | wool tapered 5, denim_indigo slim/straight 5, chino tapered 5, denim_black 4 | derby, loafer_*, chelsea, oxford | 스웻팬츠·러닝화·샌들 1, wide 3 |
| 블레이저(단품) | regular | wool / 코튼 / 린넨(초여름) | 8 | wool 5, chino 5, denim_indigo 4(GQ Korea: 재킷과 대비되는 색 데님), flannel 4 | loafer_*, derby, oxford(울 바지일 때), sneaker_white 가죽형 3 | denim_washed 2, 러닝화 1 |

### 6-2. 여름 (summer) — 오버셔츠 1종 + 베이스

| outer | 소재 | 포멀도 | 어울리는 하의 | 신발 | 메모 |
|---|---|---|---|---|---|
| 오버셔츠(린넨·얇은 코튼) | linen / 코튼 | 4~5 | linen wide/regular crop 5, chino tapered crop 5, denim_washed straight 4, wool(트로피컬) wide 4 | loafer_penny(노삭스), sandal, sneaker_white 캔버스 | 안에는 티셔츠·탱크. 버튼 풀어 레이어 |
| (아우터 없음) 반팔 셔츠·티·폴로 | 코튼·린넨·저지 | 2~6 | 위와 동일 | 위와 동일 | 여름은 "상의 1장 + 하의 + 신발" 3요소. 한국 여름은 아우터가 짐이 됨 |

### 6-3. 겨울 (winter) — 아우터 8종

| outer | outerLength | 소재 | 포멀도 | 어울리는 하의 | 어울리는 신발 | 피함 |
|---|---|---|---|---|---|---|
| 체스터필드·싱글 코트 | long | wool / 캐시미어 | 9 | wool tapered 5, flannel tapered 5, denim_indigo slim/straight 5(Vogue Korea: 회색 코트 + 연청도 허용), denim_black 5 | derby, oxford, chelsea, loafer_tassel, sneaker_white 가죽형 3 | 스웻팬츠 1, 러닝화 1, wide 3 |
| 발마칸·래글런 코트 | long | wool / 코튼 | 7 | wool, flannel, denim_indigo, chino, corduroy 모두 4~5 | derby, chukka, chelsea, loafer_*, sneaker_white 4 | 러닝화 2 |
| 더플 코트 | regular~long | 울 멜턴 | 6 | corduroy straight 5(국내 매체 기준 클래식), denim_indigo straight 5, chino 4, flannel 4 | workboot, chukka, derby, sneaker_white | 슬림 슬랙스 3, 옥스포드 2 |
| 피코트 | regular | 울 멜턴 | 7 | denim_indigo slim/tapered 5, wool tapered 5, denim_black 5, corduroy 4 | chelsea, derby, workboot, chukka | wide 2 (숏 코트 + 와이드는 하체가 과함) |
| 숏 패딩 | regular | nylon_tech | 2 | denim_* straight/wide 5, jersey tapered 4, chino 4, wool 3(블랙 팬츠로 안정감 — Elle Korea) | sneaker_*, running, workboot | 옥스포드·태슬 로퍼 1 |
| 롱 패딩 | long | nylon_tech | 1 | jersey 5, denim 4, nylon_tech 5 | running, sneaker_*, workboot | 슬랙스 2, 가죽 구두 1 |
| 플리스(풀집·하프집) | regular | 플리스 | 2~3 | chino straight 5, denim 5, jersey 4, corduroy wide 4, wool 3(Elle: 플리스 + 슬림 팬츠 + 블랙 더비 변주) | sneaker_*, running, workboot, chukka | 옥스포드 1 |
| 가죽 재킷(겨울 레이어) | short | leather | 5 | denim_indigo slim/tapered 5, denim_black slim 5, wool tapered 4, corduroy 4 | chelsea, derby, workboot, sneaker_white | 린넨 1, wide 3 |

### 6-4. 레이어 순서 규칙 (3겹 기본)

| 계절 | 1겹(베이스) | 2겹(미드) | 3겹(아우터) | 규칙 |
|---|---|---|---|---|
| 봄가을 | 티셔츠·셔츠 | 니트·가디건·셔츠 재킷 (선택) | 6-1 아우터 | 안쪽일수록 얇고 매끈, 바깥일수록 두껍고 질감. 기장은 안 < 밖 |
| 여름 | 티셔츠·셔츠 1장 | 없음 | 오버셔츠 (실내 냉방용) | 2겹 초과 금지 |
| 겨울 | 티셔츠·셔츠 | 니트(울·캐시미어) | 코트·패딩 | 니트 기장이 코트 밖으로 나오지 않게. 롱 코트 안 숏 아우터(가죽·블루종)는 변주 |

---

## 7. 스타일 중심 코디 예시 (outfit, 24행)

색은 R1 담당이므로 여기선 핏·소재·기장·신발만. `tag`: classic = 출처 2개 이상 겹침 / variation = 2025~2026 흐름이지만 출처 1개 또는 조건부.

| id | season | 상의 (소재·핏·기장) | 아우터 (종류·기장) | 하의 (소재·핏·기장) | 신발 | tag | 메모 |
|---|---|---|---|---|---|---|---|
| o01 | spring_fall | jersey 티 · regular · regular | 없음 | denim_indigo · straight · nobreak | sneaker_white | classic | 1순위 기본 |
| o02 | spring_fall | knit_cotton · regular · regular | 데님 재킷 · short | chino · tapered · nobreak | chukka | classic | 봄가을 캐주얼 기본 |
| o03 | spring_fall | 옥스포드 셔츠 · regular · regular (턱인) | 블레이저 · regular | chino · tapered · nobreak | loafer_penny | classic | 비즈니스 캐주얼 기본 |
| o04 | spring_fall | knit_wool · regular · regular | 트렌치 · long | wool · tapered · half | derby | classic | 출근 클래식 |
| o05 | spring_fall | jersey 스웻 · loose · regular | 코치 재킷 · short | denim_washed · straight · nobreak | sneaker_color | classic | 스트릿 기본 |
| o06 | spring_fall | 셔츠 · slim · regular (턱인) | 없음 | wool · wide · half | loafer_penny | variation | 2025 "큰 바지 + 작은 상의" |
| o07 | spring_fall | jersey 티 · regular · crop | 블루종 · short | chino · wide · nobreak | sneaker_white | variation | 숏 위 + 와이드 아래 |
| o08 | spring_fall | 셔츠 재킷(코튼) · loose · regular | 없음 | denim_indigo · tapered · nobreak | derby | classic | 루즈 상의 + 테이퍼드 (계획서 예시) |
| o09 | spring_fall | knit_wool · regular · regular | 가디건 · regular | corduroy · tapered · nobreak | loafer_penny | classic | 늦가을 (W Korea 조합) |
| o10 | summer | 린넨 셔츠 · regular · regular | 없음 | chino · tapered · crop | loafer_penny (노삭스) | classic | 여름 기본 |
| o11 | summer | jersey 티 · regular · regular | 없음 | denim_washed · straight · crop | sneaker_white (캔버스) | classic | |
| o12 | summer | 피케 폴로 · regular · regular | 없음 | wool(트로피컬) · wide · nobreak | loafer_tassel | classic | 여름 출근 |
| o13 | summer | 탱크·티 · slim · regular | 린넨 오버셔츠 · regular | linen · wide · crop | sandal | variation | 휴양·주말 |
| o14 | summer | jersey 티 · regular · crop | 없음 | nylon_tech · tapered · nobreak | running | classic | 고프코어 |
| o15 | summer | 반팔 셔츠 · regular · regular | 없음 | chino · wide · crop | sneaker_white | classic | 2025 여름 기본 |
| o16 | winter | knit_wool · regular · regular | 체스터필드 코트 · long | wool · tapered · half | derby | classic | 겨울 출근 |
| o17 | winter | knit_cashmere · slim · regular | 싱글 코트 · long | denim_black · slim · nobreak | chelsea | classic | 롱 코트 + 슬림 |
| o18 | winter | 플란넬 셔츠 · regular · regular | 더플 코트 · long | corduroy · straight · half | workboot | classic | 겨울 캐주얼 |
| o19 | winter | knit_wool · loose · regular | 피코트 · regular | denim_indigo · tapered · nobreak | chelsea | classic | |
| o20 | winter | 후디 · oversized · regular | 숏 패딩 · regular | denim_indigo · wide · full | sneaker_color | variation | 스트릿 겨울 |
| o21 | winter | 플리스 · regular · regular | 없음 | chino · straight · nobreak | sneaker_white | classic | 겨울 주말 |
| o22 | winter | 티 · regular · regular | 가죽 재킷 · short + 롱 코트 · long | denim_black · slim · nobreak | chelsea | variation | 2겹 아우터 |
| o23 | winter | knit_wool · regular · regular | 발마칸 코트 · long | flannel · tapered · half | loafer_tassel (양말) | classic | 드레시 겨울 |
| o24 | winter | jersey 스웻 · loose · regular | 롱 패딩 · long | jersey 스웻팬츠 · tapered · nobreak | running | classic | 한파·동네 |

---

## 8. 한국어 용어 표준화 (labels.ko 입력)

### 8-1. 구어 ↔ 표준 용어 (18행)

| 구어(흔히 쓰는 말) | 동의어 | id | UI 권장 표기 | 이유 |
|---|---|---|---|---|
| 골덴 | 코듀로이, 코르덴 | corduroy | **코듀로이** | 쇼핑몰·매체 표준. '골덴'은 보조 표기로 검색 동의어에 넣기 |
| 면바지 | 치노, 치노 팬츠, 코튼 팬츠 | chino | **치노** | '면바지'는 코튼 전반(코듀로이도 면)이라 모호. 단 도움말에 "면바지" 병기 |
| 슬랙스 | 울 팬츠, 정장 바지, 트라우저 | wool | **슬랙스** | 국내에서 가장 통용. 단 소재 표기는 '울 슬랙스' |
| 플란넬 | 후란넬, 기모 울 | flannel | **플란넬** | 소재명. 플란넬 '셔츠'(코튼 체크)와 혼동 주의 → 바지는 "플란넬 슬랙스" |
| 청바지 | 데님, 진 | denim_* | **데님** (소재), 청바지 (도움말) | 색 변형이 핵심이라 '인디고 데님/워시드 데님/블랙 데님'으로 |
| 생지 | 로우 데님, 논워시 | denim_indigo | **인디고 데님** | 생지는 하위 개념 |
| 연청/중청/진청 | 라이트·미디엄·다크 워시 | denim_washed / denim_indigo | 연청·중청 → **워시드 데님**, 진청 → **인디고 데님** | 색 칩(R1)에서 세분 |
| 흑청 | 블랙 데님 | denim_black | **블랙 데님** | |
| 와이드 | 통바지, 세미와이드 | wide | **와이드** | 세미와이드는 `straight`로 흡수 |
| 배기 / 벌룬 / 배럴 | 카브라, 커브드 | (없음) | 2차 검토 | 허벅지 볼륨 + 밑단 조임. MVP에선 `wide`(배기) 또는 `tapered`(배럴)로 근사. 별도 핏 추가는 2차 |
| 일자 | 스트레이트, 레귤러 스트레이트 | straight | **스트레이트** | |
| 테이퍼드 | 조거핏(X), 발목으로 좁아지는 | tapered | **테이퍼드** | 조거는 밑단 시보리 있는 별개 |
| 스키니 | 슬림, 타이트 | slim | **슬림** | 스키니는 2025 기준 비추천이라 UI에서 제외. 슬림으로 흡수 |
| 오버핏 | 오버사이즈, 박시 | oversized | **오버** | '오버핏'은 콩글리시지만 통용. UI는 '오버', 도움말에 '오버핏' |
| 루즈핏 | 릴렉스드, 세미오버 | loose | **루즈** | |
| 9부 / 8부 | 크롭, 앵클 | crop | **크롭** | 9부·8부는 국내 통용. 도움말에 "9부(발목 위)" 병기 |
| 노브레이크 | 발목 기장, 정기장 | nobreak | **노브레이크** | 도움말: "밑단이 신발에 닿을락 말락" |
| 기장 길게 / 원브레이크 | 하프 브레이크, 풀 브레이크 | half / full | **하프 브레이크 / 풀 브레이크** | 도움말로 설명 필수 |

### 8-2. 신발·아우터 용어 (14행)

| 구어 | 동의어 | id | UI 권장 표기 |
|---|---|---|---|
| 운동화 | 스니커즈 | sneaker_* | **스니커즈** (흰 스니커즈 / 컬러 스니커즈) |
| 런닝화 | 러닝화, 러닝 슈즈 | running | **러닝화** |
| 로퍼 | 페니 로퍼, 태슬 로퍼, 비트 로퍼 | loafer_penny / loafer_tassel | **페니 로퍼 / 태슬 로퍼** (비트는 태슬로 흡수) |
| 구두 | 더비, 옥스포드, 단화 | derby / oxford | **더비 / 옥스포드** (도움말: 더비 = 끈 부분이 열린 구두) |
| 첼시 | 첼시 부츠, 사이드고어 | chelsea | **첼시 부츠** |
| 워커 | 워크 부츠, 레드윙, 팀버랜드 | workboot | **워크 부츠** ('워커'는 검색 동의어) |
| 데저트 부츠 | 척카, 클락스 | chukka | **척카 부츠** (도움말: 데저트 부츠 포함) |
| 쪼리 / 슬리퍼 / 샌들 | 슬라이드, 버켄 | sandal | **샌들/슬리퍼** |
| 청자켓 | 데님 재킷, 트러커 | — | **데님 재킷** |
| 항공점퍼 | MA-1, 봄버, 블루종 | — | **블루종** (도움말: MA-1·해링턴 포함) |
| 야상 | 필드 재킷, M-65 | — | 2차 (MVP 미포함) |
| 셔켓 | 셔츠 재킷, 오버셔츠 | — | **셔츠 재킷** (여름 얇은 것은 '오버셔츠') |
| 롱코트 / 반코트 | 체스터·발마칸 / 하프 코트 | — | **롱 코트 / 하프 코트** (세부 종류는 도움말) |
| 뽀글이 | 플리스, 후리스 | — | **플리스** |

### 8-3. 혼동 주의 (P3·팀5 공유)

| 항목 | 주의 |
|---|---|
| 플란넬 | 바지(울 플란넬, 겨울·드레시)와 셔츠(코튼 플란넬 체크, 캐주얼)는 포멀도가 정반대. UI에서 "플란넬 슬랙스" / "플란넬 셔츠"로 반드시 구분 |
| 코듀로이 | 골 굵기(웨일)에 따라 포멀도 4~6. MVP는 한 등급(4)으로 처리하고 2차에서 '가는 골/굵은 골' 분기 |
| 로퍼 | 페니(캐주얼~비즈캐주얼) vs 태슬(드레시)을 UI에서 합치면 치노·워시드 데님 추천이 흐려짐. 분리 유지 권장 |
| 와이드 vs 배기 | 국내 커뮤니티에서 경계 불명확. MVP는 '와이드' 하나로 통일, 배기·벌룬·배럴은 검색 동의어로만 |
| 흰 스니커즈 | 가죽 미니멀형(포멀도 3)과 캔버스형(2)의 차이가 큼. MVP는 하나로 두되 note에 "가죽형이면 슬랙스 OK" 표기 |

---

## 9. 데이터 변환 메모 (C2용)

| 표 | 스키마 | 변환 방법 |
|---|---|---|
| 0-1 ~ 0-5 | enum 상수 | `fit.json`, `length.json`, `material.json`, `shoe.json`, `season.json`에 id·label 저장. 8장 동의어는 `labels.ko.json`의 `aliases[]` |
| 1-2 | `fitRule { topFit, bottomFit, score, note }` | 20행 그대로. score ≥ 4 → classic, 3 → variation, ≤ 2 → avoid |
| 1-3 | (2차) `bodyAdjust` | MVP 미사용 |
| 2-1 | `lengthRule { kind:"top", topLength, bottomFit, score, note }` | 15행 |
| 2-2 | `lengthRule { kind:"outer", outerLength, bottomFit, score, note }` | 15행 |
| 2-3 | `lengthRule { kind:"trouser", trouserLength, bottomFit, score, note }` | 20행 |
| 2-4 | `shoeRule.lengths[] { trouserLength, score, note }` | 신발별 4행 → shoeRule에 중첩 |
| 2-5 | `adjust[] { when:{...}, delta, reason }` | 7행. 조건은 AND. 최종 점수는 1~5로 clamp |
| 3-1 | `material { id, seasons[], weight, texture, formality }` | 15행. weight: light/mid/heavy, texture: smooth/fuzzy/rough/glossy |
| 3-2 | `matRule.pairsWith[] { material, score }` | 13×13 대칭 행렬. denim 한 행을 denim_indigo/washed/black 3개로 복제한 뒤 3-3의 예외만 덮어쓰기 |
| 3-3 | `matRule { material, pairsWith[], avoid[{material, reason}], seasons[] }` | 15행 직접 변환. `avoid`는 score ≤ 2 |
| 3-4 | `adjust[]` | 5행. 2-5와 같은 배열에 합침 |
| 4-1 | `shoe { id, formality, seasons[], socks, note }` | 11행 |
| 4-2 | `shoeRule { shoe, bottoms[{material, fit, length, score, note}] }` | 신발별 6~12행. 와일드카드("어떤 핏이든")는 `fit:"*"`로 저장, 조회 시 구체 행 우선 → 와일드카드 → 기본 3 |
| 4-3 | 메모 | 코드 주석 |
| 5-1 ~ 5-4 | `formality { category, id, level }` | 40행. 아이템 레벨은 `item.formality`로 복사 |
| 5-5 | 엔진 규칙 | `maxGap = 4 → warn`, `≥ 5 → block`. '변주' 태그 아이템은 block을 warn으로 완화 |
| 6-1 ~ 6-3 | `outerRule { outer, outerLength, material, formality, seasons[], bottoms[{material, fit, score}], shoes[], avoid[] }` | 16행 (봄가을 7 + 여름 1 + 겨울 8) |
| 6-4 | `layerRule { season, maxLayers, order[] }` | 3행 |
| 7 | `outfit { id, items[], tags[], isClassic, season }` | 24행. items는 R1 색 데이터와 조인해 완성 |
| 8 | `labels.ko.json` | `{ id, label, aliases[], help }` |

### 점수 합산 제안

```
score(outfit) =
    w_fit   * fitRule(top.fit, bottom.fit)                       // 1-2
  + w_len   * mean(lengthRule(top), lengthRule(outer), lengthRule(trouser))  // 2-1~2-3
  + w_mat   * mean(matRule(각 소재 쌍))                           // 3-2
  + w_shoe  * shoeRule(shoe, bottom.material, bottom.fit, bottom.length)      // 4-2 + 2-4
  + w_season* seasonFit(모든 아이템 seasons ∋ 현재 계절)           // 3-1, 4-1, 6-x
  + Σ adjust.delta (2-5, 3-4)
  - formalityPenalty (5-5: gap ≥ 5 → 제외, gap = 4 → −1)

권장 가중치 (MVP): w_fit 1.0, w_len 0.7, w_mat 1.0, w_shoe 1.0, w_season 1.5
```

---

## 10. 출처

### 핏·비율
- Man of Many — Men's style relaxed fit guide (stylist Dirk Fourie "one loose element, one fitted element"): https://manofmany.com/style/mens-style-relaxed-fit-guide
- Bonne Gueule — How to create oversized and loose looks: https://bonnegueule.fr/en/blogs/medias/conseils-comment-creer-des-looks-oversized-et-loose
- Real Men Real Style — Relaxed fit trend: https://www.realmenrealstyle.com/relaxed-fit-trend/
- Real Men Real Style — Slim vs wide trousers: https://www.realmenrealstyle.com/slim-vs-wide-trousers/
- MR PORTER — How To Get Wide-Leg Trousers Right: https://www.mrporter.com/journal/fashion/wide-leg-pants-men-guide-25329258
- MR PORTER (Die Workwear 기고) — How To Experiment With The Oversized Look: https://www.mrporter.com/en-gr/journal/fashion/dieworkwear-how-to-experiment-with-oversized-24929938
- Square Mile — How to wear loose clothes: https://squaremile.com/style/how-to-wear-loose-clothes/
- Vogue Korea — 헐렁한 바지에 간결한 상의: https://www.vogue.co.kr/2025/06/17/올여름에도-요긴할-헐렁한-바지에-간결한-상의-패션/
- Esquire Korea — 슬림 핏 vs 와이드 핏 팬츠: https://www.esquirekorea.co.kr/article/1909314
- Esquire Korea — 스트레이트 핏·슬림 재조명: https://www.esquirekorea.co.kr/article/1899688
- COS Korea — Jeans fit guide (테이퍼드·스트레이트 정의): https://www.cos.com/ko-kr/fitguide/men/jeans-fit-guide.html
- Suitsupply — Trousers fit guide: https://suitsupply.com/ko-kr/journal/trousers-fit-guide.html

### 기장·브레이크
- Permanent Style — Rule 1: Trousers should have one clean break at the front: https://www.permanentstyle.com/2021/06/the-rules-and-how-to-break-them-no-1
- Effortless Gent — Suit pant length / trouser break: https://effortlessgent.com/suit-trousers-break-trouser-length/
- Sartoro — How long should suit pants be (로퍼 + 노브레이크): https://sartoro.co/blogs/sartorial/how-long-should-suit-pants-be
- Ties.com — Guide to trouser length: https://www.ties.com/blog/breaking-it-down-a-guide-to-trouser-length
- Bloomberg — What length should your pants break be: https://www.bloomberg.com/news/articles/2019-08-21/what-length-should-your-pants-break-be-a-proper-tailored-guide
- W Korea — 숏 코트 + 스트레이트 데님: https://www.wkorea.com/?p=402844
- Vogue Korea — 롱 코트로 무게중심 잡기: https://www.vogue.co.kr/?p=745815

### 소재
- Permanent Style — A guide to corduroy: https://www.permanentstyle.com/2023/05/a-guide-to-corduroy-colours-wales-fibres-bunches
- Proper Cloth — Men's Fall Layering Guide 2025: https://propercloth.com/reference/mens-fall-layering-guide-fabrics-style-tips-for-2025/
- StyleForum — How to Pair Fabric Textures: https://journal.styleforum.net/how-to-pair-fabric-textures-choosing-a-suit-fabric-pt-2/
- Sid Mashburn — Matching fabrics 101: https://shopmashburn.com/blogs/hey-sid-advice-column/matching-fabrics-101
- FashionBeans — Layering & fabric combinations: https://www.fashionbeans.com/2024/mens-fashion-basics-layering-fabric-combinations/
- FashionBeans — Notoriously difficult menswear fabrics: https://www.fashionbeans.com/2017/notoriously-difficult-menswear-fabrics/
- Baltimore Sun — Textures and colors (1993, 트위드 질감 규칙): https://develop.baltimoresun.com/1993/10/21/textures-and-colors
- The Armoury — Wool linen check three ways: https://thearmoury.com/journal/wool-linen-check-three-ways
- Sumissura — Linen rules debunked: https://www.sumissura.com/en/blog/dress-in-linen
- 경향 — 골덴 날씬하게 소화하려면: https://lady.khan.co.kr/fashion/article/202510161622001
- W Korea — 코듀로이의 계절: https://www.wkorea.com/?p=215742
- GQ Korea — 여름 비즈니스 캐주얼(린넨): https://www.gqkorea.co.kr/?p=290029
- 나무위키 — 치노: https://namu.moe/w/치노

### 신발
- Bespoke Unit — Shoe formality: https://bespokeunit.com/shoes/formality
- Mr. Koachman — Shoe formality guide: https://www.mrkoachman.com/shoe-formality-guide/
- John White Shoes — The formality spectrum: https://www.johnwhiteshoes.com/blogs/guides/the-formality-spectrum-a-definitive-ranking-of-mens-dress-shoes
- FashionBeans — What shoes to wear with every style of trousers: https://www.fashionbeans.com/article/what-shoes-to-wear-with-trousers/
- FashionBeans — Wide-leg pants (신발 폭 규칙): https://www.fashionbeans.com/article/wide-leg-pants/
- Real Men Real Style — Best shoes wide leg trousers: https://www.realmenrealstyle.com/best-shoes-wide-leg-trousers-men/
- Sartoro — How to match shoes with pants: https://sartoro.co/blogs/sartorial/how-to-match-shoes-with-pants
- MR PORTER — How do I style Chelsea boots: https://www.mrporter.com/en-ca/journal/fashion/you-asked-how-do-i-style-chelsea-boots-375162
- MR PORTER — The ultimate guide to boots: https://www.mrporter.com/en-it/journal/fashion/the-ultimate-guide-to-boots-701028
- Bootspy — How to style boots: https://bootspy.com/how-to-style-boots/
- The Rake — Tailored and Trainered (스니커즈 + 테일러링): https://therake.com/stories/tailored-and-trainered
- Westwood Hart — Sneakers with suit rules: https://westwoodhart.com/blogs/westwood-hart/westwood-hart-com-wear-sneakers-suit-men-rules-guide
- Gentleman's Gazette — How To Combine Shoes, Socks, and Pants (eBook 안내): https://www.gentlemansgazette.com/how-to-combine-shoes-socks-pants-ebook/
- MR PORTER — Men's socks: what to wear and when: https://www.mrporter.com/journal/fashion/mens-socks-what-to-wear-and-when-758924
- Real Men Real Style — Right sock length: https://www.realmenrealstyle.com/right-sock-length/
- Ondo — Best socks for loafers: https://ondo.com/blogs/guides/best-socks-for-loafers
- Allure Korea — 2026 봄 로퍼 트렌드: https://www.allurekorea.com/?p=329109
- GQ Korea — 2025 여름 신발(미니멀 로퍼): https://www.gqkorea.co.kr/?p=329733

### 아우터·계절·트렌드
- GQ Korea — 초봄까지 입는 남자 아우터 5 (2026.02): https://www.gqkorea.co.kr/2026/02/24/내일-당장-꺼내세요-지금부터-초봄까지-입기-좋은-남/
- Esquire Korea — 코치 재킷: https://www.esquirekorea.co.kr/article/1901625
- Vogue Korea — 코트와 청바지 조합 7: https://www.vogue.co.kr/2024/10/21/올겨울-틈만-나면-입게-될-코트와-청바지-조합-7/
- Vogue Korea — 2026 가을/겨울 남성복 트렌드 12: https://www.vogue.co.kr/2026/09/08/2026-가을-겨울-남성복-트렌드-12/
- Esquire Korea — 2026 FW 슬릭 미니멀리즘: https://www.esquirekorea.co.kr/article/1896507
- Elle Korea — 플리스·패딩 레이어드: https://www.elle.co.kr/article/1891663
- Allure Korea — 플리스 트렌드(2026.10): https://www.allurekorea.com/?p=323573
- 경향 — 겨울 아우터 종류: https://lady.khan.co.kr/fashion/article/3823

### 출처 간 불일치 요약

| 쟁점 | 입장 A | 입장 B | 본 문서 처리 |
|---|---|---|---|
| 와이드 하의에 맞는 신발 폭 | 슬림 신발 (MR PORTER) | 볼륨 신발 (FashionBeans, PaperStraight) | 둘 다 4점. 4-3 참조 |
| 첼시 부츠 포멀도 | 몽크 위 (Bespoke Unit) | 몽크 아래·척카 위 (Mr. Koachman) | 6 (로퍼와 동급) |
| 풀 슬림 실루엣 | 올드 (대부분 해외 매체) | 2025 하반기 재조명 (Esquire Korea) | 3점, 포멀·마른 체형 조건부 |
| 롱 코트 + 와이드 | 의도된 볼륨 (Die Workwear) | 슬림·테이퍼드가 기본 (국내 매체) | 3점 변주 |
| 린넨의 계절 | 여름 전용 (전통) | 레이어링하면 가을도 가능 (Sumissura 등) | summer + spring_fall(5·9월)로 한정 |
| 러닝화 + 슬랙스 | 피함 (대부분) | 낮고 미니멀한 러닝화면 가능 (The Rake 등) | 2점 경고. 미니멀 가죽 스니커즈는 별도 id로 3점 |

### 리서치로 채우지 못한 부분
- 국내 매체에서 남성 기준 **바지 기장 cm 수치**를 명시한 자료가 없어 0-2의 크롭 "3~6cm"는 해외 자료 + 쇼핑몰 관행 기반 추정.
- **배기/벌룬/배럴 핏**의 국내 정의가 통일되지 않아 MVP에서 제외(8-1). 2차에 별도 리서치 필요.
- **데저트 부츠 vs 척카** 구분, **코듀로이 골 굵기별 포멀도**는 MVP에서 단일 등급으로 처리.
- Put This On, Articles of Style의 직접 인용은 검색 결과에서 확보 못 함 (동일 취지의 Permanent Style·MR PORTER·FashionBeans 자료로 대체).
