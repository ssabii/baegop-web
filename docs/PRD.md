# 배곱 - PRD (Product Requirements Document)

## Context

회사 동료들이 매일 점심 메뉴를 고민하는 문제를 해결하기 위한 맛집 추천 웹 서비스.
"배곱" = 배고플 때 찾아보는 서비스. 30~100명 규모의 사내 사용자를 대상으로 하며, 회사 주변 맛집을 등록/공유/추천받을 수 있다.

> **컨셉: "사용자가 함께 만들어가는 맛집 추천 서비스"**
> 관리자 없이 구성원 모두가 맛집을 등록하고, 리뷰와 좋아요로 평가하며, 코나카드 정보까지 투표로 함께 관리한다.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | **배곱** (배고플 때 찾는 맛집) |
| 컨셉 | 사용자가 함께 만들어가는 맛집 추천 서비스 |
| 목적 | 회사 주변 맛집 정보 공유 및 점심 메뉴 추천 |
| 대상 사용자 | 사내 직원 (30~100명) |
| 플랫폼 | 웹 (모바일 반응형) |

---

## 2. 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js (App Router) |
| Backend/DB | Supabase (PostgreSQL + Auth + Storage) |
| 지도 | Naver Maps API |
| 스타일링 | Tailwind CSS + shadcn/ui |
| 배포 | Vercel |
| 패키지 매니저 | pnpm |

---

## 3. 핵심 기능 (MVP)

### 3.1 맛집 검색 및 자동 등록

**별도 맛집 등록 페이지 없음.** 맛집은 리뷰 작성 시 자동으로 DB에 추가된다.

**검색 페이지 (`/search`):**
1. 사용자가 키워드로 맛집 검색
2. **DB에 등록된 맛집 우선 표시** + 네이버 검색 API 결과도 함께 표시
3. 검색 결과에서 맛집 선택 → 맛집 상세 페이지로 이동
4. DB에 없는 네이버 검색 결과 선택 시 → 네이버 정보 기반으로 상세 페이지 표시 (아직 DB 저장 X, 리뷰 작성 시 저장)

**자동 등록 흐름:**
1. 사용자가 맛집 상세에서 리뷰 작성
2. 해당 맛집이 DB에 이미 있으면 → 그대로 리뷰 연결
3. DB에 없으면 → 네이버 검색 정보(이름, 주소, 카테고리, 좌표, 전화번호, 링크)를 저장하여 맛집 자동 생성 후 리뷰 연결

**맛집 상세 페이지:**
- 네이버 기본 정보(이름, 주소, 카테고리, 전화번호) 표시
- 네이버 상세 정보(메뉴, 소식, 리뷰, 사진)는 "네이버에서 보기" 링크로 연결
- 배곱 리뷰 목록 + 평균 별점
- 좋아요/싫어요
- 코나카드 투표

### 3.2 코나카드 결제 가능 여부

회사에서 식대 카드로 코나카드(KB카드 기반)를 사용. 식당마다 결제 가능 여부가 다르므로 이를 표시.

**판별 로직 (우편번호 자동 체크 + 수동 확인 + 크라우드소싱):**
1. **우편번호 자동 판별**: 맛집 주소 등록 시 우편번호 추출 → 사용가능 우편번호 목록과 대조
   - 크몽 사무실(06625) 반경 1km 이내 우편번호만 결제 가능
   - 우편번호 목록 데이터는 추후 제공 예정
2. **등록자 수동 확인**: KB카드 가맹점 조회에서 확인 후 선택
3. **크라우드소싱 투표**: 다른 사용자들이 "코나카드 가능/불가능" 투표 가능
   - 투표 수가 임계값(예: 3표) 이상이고, 등록 정보와 다르면 자동으로 상태 변경
   - 예: 등록 시 "가능"인데 "불가능" 투표 3표 이상 → 상태가 "불가"로 변경

**사용 가능 업종:**
- 음식점: 한식, 중식, 일식/생선회집, 양식, 분식, 패밀리레스토랑, 패스트푸드점, 휴게음식점 등
- 기타: 제과점/아이스크림점, 커피/음료전문점, 슈퍼마켓, 편의점

**UI 표시:**
- 맛집 카드/상세에 코나카드 뱃지 표시 (가능 / 불가 / 미확인)
- 맛집 목록, 지도, 룰렛에서 코나카드 필터링 가능
- 상세 페이지에 "코나카드 가능/불가능" 투표 버튼

**주의사항 안내:**
- 가맹점 정보는 전영업일 기준이며, 실제 결제 시 다를 수 있음
- 사업자 등록 주소지와 실제 주소가 다르면 결제 불가할 수 있음

### 3.3 리뷰 및 상호작용
- **리뷰**: 여러 번 작성 가능 (리뷰 작성이 맛집 등록을 겸함)
  - 별점(1~5) — 필수
  - 설명 (텍스트) — 선택
  - 코나카드 사용 여부 (사용함 / 사용 안 함 / 모름) — 선택
  - 사진 (여러 장 업로드 가능) — 선택. 0번째 이미지가 대표 썸네일
- **좋아요/싫어요**: 맛집에 대한 간단한 평가 (1인 1회)
- **코나카드 투표**: 결제 가능/불가능 투표 (3.2 참조)
- 맛집 상세에 평균 별점 표시

### 3.4 맛집 추천 (랜덤 룰렛)
- "오늘 뭐 먹지?" 버튼 → 등록된 맛집 중 랜덤 추천
- 카테고리 필터 적용 후 랜덤 추천 가능
- **코나카드 결제 가능 식당만 필터링** 옵션
- 룰렛 애니메이션으로 재미 요소 추가

### 3.5 지도 기반 탐색
- 회사 위치 기준 주변 맛집 지도 표시
- 맛집까지 도보 거리/시간 표시
- 카테고리별 마커 색상 구분
- 마커 클릭 시 간단 정보 표시

### 3.6 사용자 인증
- Supabase Auth를 활용한 **Google OAuth** 로그인 (소셜 로그인만 지원)
- 이메일/비밀번호 가입 없음 — Google 계정으로 원클릭 로그인
- 이메일 도메인 제한 없음 (추후 다른 회사 확장 고려)

---

## 4. 페이지 구조

```
/                    → 홈 (랜덤 추천 CTA + 최근/인기 맛집 + 카테고리별 추천 "xx 어때요?")
/login               → 로그인
/search              → 맛집 검색 (DB 맛집 우선 + 네이버 API 결과 혼합)
/restaurants          → 맛집 목록 (리스트 + 지도 뷰 전환)
/restaurants/[id]     → 맛집 상세 (네이버 정보 + 배곱 리뷰 + 좋아요/싫어요 + 코나카드 투표)
/random              → 랜덤 추천 (룰렛)
/mypage              → 내 리뷰, 내가 등록한 맛집
```

---

## 5. 데이터 모델

### profiles (Supabase Auth 확장)
- id, email, nickname, avatar_url, created_at

### restaurants
- id, name, category (text, 네이버 API 원본 카테고리. 예: "음식점>한식"), address, postal_code, lat, lng
- naver_place_id (네이버 검색 결과 연동용)
- naver_link (text, 네이버 플레이스 URL — 메뉴/소식/리뷰/사진 연결용)
- telephone (text, 전화번호)
- kona_card_status (enum: 'available' | 'unavailable' | 'unknown')
- kona_card_zone (boolean, 우편번호 기반 자동 판별 결과)
- like_count, dislike_count
- created_by (FK → users), created_at, updated_at

### kona_postal_codes (코나카드 사용가능 우편번호)
- id, postal_code, dong_name (동명)

### kona_card_votes (코나카드 크라우드소싱 투표)
- id, restaurant_id (FK), user_id (FK)
- vote (enum: 'available' | 'unavailable')
- created_at
- UNIQUE(restaurant_id, user_id) — 1인 1투표

### reviews (리뷰)
- id, restaurant_id (FK), user_id (FK)
- rating (1~5, 필수)
- content (nullable, 설명)
- kona_card_used (enum: 'yes' | 'no' | 'unknown', nullable — 코나카드 사용 여부)
- image_urls (text[], 이미지 URL 배열. 0번째가 대표 썸네일)
- created_at, updated_at

### reactions (좋아요/싫어요)
- id, restaurant_id (FK), user_id (FK)
- type (enum: 'like' | 'dislike')
- UNIQUE(restaurant_id, user_id) — 1인 1반응

*(categories 테이블 없음 — 네이버 API 카테고리 문자열을 restaurants.category에 직접 저장)*

---

## 6. 외부 API

### Naver Search API (Local Search)
- 검색 페이지에서 맛집 검색 + 리뷰 작성 시 맛집 자동 등록에 사용
- 응답: 가게명, 주소, 카테고리, 도로명주소, 좌표, 전화번호, 링크 등
- API URL: https://openapi.naver.com/v1/search/local.json

### Naver Maps API
- 지도 표시, 마커, 거리 계산
- Web Dynamic Map 사용

---

## 7. 프로젝트 초기 세팅 단계

### Step 1: 프로젝트 생성
- `pnpm create next-app@latest baegop-web --typescript --tailwind --app --src-dir`
- `pnpm dlx shadcn@latest init`
- Supabase 프로젝트 생성 및 연동

### Step 2: 기본 구조 세팅
- 폴더 구조, 환경변수, Supabase 클라이언트 설정
- shadcn/ui 컴포넌트 설치

### Step 3: 인증 구현
- Supabase Auth (Google OAuth) + 미들웨어로 보호 라우트 설정

### Step 4: 검색 + 맛집 상세
- 네이버 검색 API 연동 (검색 페이지)
- DB 맛집 + 네이버 API 결과 혼합 검색
- 맛집 상세 페이지 (네이버 기본 정보 + "네이버에서 보기" 링크)

### Step 5: 리뷰 및 상호작용 기능
- 리뷰 (별점 + 설명 + 코나카드 사용 여부 + 사진) CRUD
- 리뷰 작성 시 맛집 자동 등록 (DB에 없으면 네이버 정보로 생성)
- 좋아요/싫어요
- 코나카드 투표

### Step 6: 지도 연동
- Naver Maps API 연동
- 맛집 마커 표시 + 거리 계산

### Step 7: 랜덤 추천
- 룰렛 UI + 필터 기반 랜덤 로직

### Step 8: 배포
- Vercel 배포 + 환경변수 설정

---

## 8. 디자인

- **프라이머리 컬러**: 따뜻한 오렌지/코랄 계열 (식욕 자극 + 배고픔 연상)
- **톤**: 따뜻하고 친근한 느낌
- **라임 계열 사용 금지** (크몽 프라이머리 컬러와 구분)
- shadcn/ui 기본 컴포넌트 활용, 커스텀 테마 적용

---

## 9. 사전 준비 (개발 시작 전 필요)

- [ ] **Supabase 프로젝트 생성** → URL + Anon Key 획득
  - Google OAuth Provider 활성화 (Authentication → Providers → Google)
- [ ] **Google Cloud Console** → OAuth 2.0 클라이언트 ID 발급
  - Supabase 콜백 URL을 승인된 리디렉션 URI에 추가
- [ ] **네이버 개발자 API 키 발급** → https://developers.naver.com 에서 애플리케이션 등록
  - 검색 API (Local Search) 사용 설정
  - Maps API (Web Dynamic Map) 사용 설정
  - 허용 도메인에 localhost + 배포 도메인 추가

---

## 10. 비기능 요구사항

- **반응형**: 모바일에서도 편하게 사용 (점심시간에 폰으로 확인)
- **성능**: 페이지 로딩 2초 이내
- **보안**: 이메일 인증 필수, RLS(Row Level Security) 적용
- **접근성**: 맛집 등록/리뷰 작성이 최대한 간편해야 함 (플로팅 버튼, 목록에서 바로 반응 가능)

---

## 11. 향후 확장 (Post-MVP)

- 투표 기능 (오늘 점심 투표)
- 메뉴 사진 갤러리
- 점심 그룹 만들기 (같이 먹을 사람 모집)
- 슬랙 연동 (점심 알림)
- AI 기반 취향 추천
- **회사별 식대 카드 설정** — 코나카드 외 다른 회사 식대 카드도 지원 (범용 서비스 확장 시)
