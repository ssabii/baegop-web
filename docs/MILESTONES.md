# 배곱 - 구현 마일스톤

## 개요

PRD(`docs/PRD.md`) 기반 MVP 구현 로드맵. 각 스텝은 순서대로 진행하며, 의존성이 있는 단계는 선행 단계 완료 후 진행한다.

---

## Step 1: 프로젝트 초기 세팅 ✅

- Next.js 16 (App Router, React 19) + TypeScript 프로젝트 생성
- shadcn/ui 초기화 및 기본 컴포넌트 설치
- Supabase 클라이언트 패턴 구성 (browser / server / middleware)
- Auth 미들웨어 (세션 갱신 + 보호 라우트 리다이렉트)
- TypeScript 타입 정의 (`src/types/index.ts`)
- 상수 정의 (`src/lib/constants.ts`)
- 브랜딩 테마 (오렌지/코랄 계열, OKLch 컬러 스페이스)
- 환경변수 템플릿

---

## Step 2: Supabase DB 스키마 + RLS ✅

- 테이블: profiles, restaurants, kona_postal_codes, kona_card_votes, reviews, reactions
- RLS 정책: 공개 조회, 인증 사용자 생성, 소유자만 수정/삭제
- 트리거/함수:
  - `handle_new_user()` — OAuth 가입 시 profiles 자동 생성
  - `update_reaction_counts()` — 좋아요/싫어요 카운트 동기화
  - `check_kona_votes()` — 투표 임계값(3) 초과 시 코나카드 상태 자동 변경
  - `update_updated_at()` — updated_at 자동 갱신
- Storage: review-images 버킷 (공개 조회, 인증 업로드, 본인 삭제)

### 참고
- 카테고리 테이블 없음 — 네이버 API 카테고리 문자열을 restaurants.category에 직접 저장
- SQL 파일: `supabase/001_schema.sql` ~ `004_storage.sql`

---

## Step 3: Google OAuth 인증

- Google OAuth 로그인/로그아웃 구현
- OAuth 콜백 처리 (`src/app/auth/callback/route.ts`)
- 로그인 페이지 (`src/app/login/page.tsx`)
- 세션 상태 관리 (로그인 후 리다이렉트)

### 보호 라우트
- `/restaurants/new`, `/restaurants/[id]/edit`, `/mypage` → 미인증 시 `/login`

---

## Step 4: 레이아웃 + 홈 페이지

- 공통 레이아웃: 헤더 (로고, 네비게이션, 로그인/아바타)
- 모바일 하단 네비게이션
- 홈 페이지 (`src/app/page.tsx`):
  - 랜덤 맛집 추천 CTA ("오늘 뭐 먹지?" 버튼)
  - 최근 등록된 맛집
  - 인기 맛집 TOP (좋아요 기준)

---

## Step 5: 맛집 CRUD + 네이버 검색

- 네이버 검색 프록시 API (`src/app/api/naver-search/route.ts`)
- 맛집 등록 페이지 — 네이버 검색 자동완성 → 선택 시 정보 자동 채움
- 맛집 목록 페이지 (카테고리/코나카드 필터)
- 맛집 상세 페이지
- 맛집 수정/삭제 (등록자만)

### 등록 흐름
1. 검색 입력 → debounce → `/api/naver-search` 호출
2. 결과 드롭다운 → 선택 시 name, address, category, lat/lng 자동 채움
3. 코나카드 상태 선택 (가능/불가/모름) + 한줄 메모
4. Supabase insert

---

## Step 6: 상호작용 (리뷰, 좋아요, 코나카드 투표)

- 리뷰 작성: 별점(1-5, 필수) + 내용(선택) + 사진 다수(선택, 0번째=썸네일)
- 리뷰 수정/삭제 (작성자만)
- 리뷰 이미지 업로드 (Supabase Storage)
- 좋아요/싫어요 토글 (이미 누른 것 취소, 반대로 변경 가능)
- 코나카드 투표 (가능/불가, DB 트리거로 3표 이상 시 자동 상태 변경)

---

## Step 7: 네이버 지도 연동

- Naver Maps JavaScript API v3 클라이언트 로딩
- 회사 위치(크몽, 06625) 중심 기본 표시
- 맛집 마커 표시, 클릭 시 InfoWindow (이름, 카테고리, 코나카드 상태)
- 맛집 목록 페이지에 리스트/지도 뷰 전환

---

## Step 8: 랜덤 룰렛

- 카테고리 필터 + 코나카드 필터
- CSS 애니메이션 기반 룰렛 회전
- 결과 → 맛집 상세 페이지 이동 링크

---

## Step 9: 마이페이지

- 내가 등록한 맛집 목록
- 내가 작성한 리뷰 목록
- 프로필 편집 (닉네임)

---

## 구현 순서 및 의존성

```
Step 1 (초기 세팅) ✅
  └→ Step 2 (DB 스키마) ✅
       └→ Step 3 (인증)
            ├→ Step 4 (레이아웃 + 홈)
            └→ Step 5 (맛집 CRUD)
                 ├→ Step 6 (상호작용)
                 ├→ Step 7 (지도)
                 └→ Step 8 (룰렛)
                      └→ Step 9 (마이페이지)
```

---

## 사전 준비 (유저 액션)

- [ ] Supabase 프로젝트 생성 → URL + Anon Key
- [ ] Supabase Google OAuth Provider 활성화
- [ ] Google Cloud Console → OAuth 2.0 클라이언트 ID/Secret
- [ ] 네이버 개발자센터 → 검색 API + Maps API 키
- [ ] 코나카드 사용가능 우편번호 데이터 (`kona_postal_codes` 시드)
