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

## Step 3: Supabase 프로젝트 연동

- `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정
- Supabase SQL Editor에서 스키마 실행 (`001_schema.sql` ~ `004_storage.sql`)
- Google OAuth Provider 활성화 (Google Cloud Console OAuth 클라이언트 ID/Secret 등록)
- `supabase gen types typescript`로 DB 타입 자동 생성 → `src/types/database.ts`
- 수동 타입(`src/types/index.ts`)을 자동 생성 타입 기반으로 전환
- 연동 테스트 (DB 접근, Auth 흐름)

### 사전 준비 (유저 액션)
- Supabase 프로젝트 생성 (Pro 플랜, Branching 활성화)
- Vercel + Supabase 통합 연결 (Preview Branch 자동 환경변수 주입)
- Google Cloud Console OAuth 2.0 클라이언트 발급
- Supabase Auth에 Google Provider 등록

---

## Step 4: 네이버 API 연동

- `.env.local`에 `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`, `NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID` 설정
- 검색 API: Route Handler 프록시 구현 (`src/app/api/naver-search/route.ts`) + 응답 테스트
- 지도 API: 스크립트 로딩 유틸 + 기본 맵 컴포넌트 (`src/components/naver-map.tsx`)
- 회사 위치(크몽, 06625) 중심 기본 지도 렌더링 확인

### 사전 준비 (유저 액션)
- 네이버 개발자센터에서 검색 API + Maps API 키 발급

---

## Step 5: Google OAuth 인증

- Google OAuth 로그인/로그아웃 구현
- OAuth 콜백 처리 (`src/app/auth/callback/route.ts`)
- 로그인 페이지 (`src/app/login/page.tsx`)
- 세션 상태 관리 (로그인 후 리다이렉트)

### 보호 라우트
- `/restaurants/new`, `/restaurants/[id]/edit`, `/mypage` → 미인증 시 `/login`

---

## Step 6: 레이아웃 + 홈 페이지

- 공통 레이아웃: 헤더 (로고, 네비게이션, 로그인/아바타)
- 모바일 하단 네비게이션
- 홈 페이지 (`src/app/page.tsx`):
  - 랜덤 맛집 추천 CTA ("오늘 뭐 먹지?" 버튼)
  - 최근 등록된 맛집
  - 인기 맛집 TOP (좋아요 기준)
  - 카테고리별 추천 ("xx 어때요?" 큐레이션)

---

## Step 7: 검색 + 맛집 상세

- 검색 페이지 (`/search`) — DB 맛집 우선 + 네이버 API 결과 혼합 표시
- 맛집 상세 페이지 — 네이버 기본 정보(이름, 주소, 카테고리, 전화번호) + "네이버에서 보기" 링크
- 맛집 목록 페이지 (카테고리/코나카드 필터)

### 검색 흐름
1. 검색 입력 → debounce → DB 검색 + `/api/naver-search` 병렬 호출
2. DB 맛집 결과 우선 표시, 네이버 API 결과 아래에 함께 표시
3. 결과 선택 → 맛집 상세 페이지로 이동

---

## Step 8: 상호작용 (리뷰, 좋아요, 코나카드 투표)

- 리뷰 작성: 별점(1-5, 필수) + 설명(선택) + 코나카드 사용 여부(선택) + 사진 다수(선택, 0번째=썸네일)
- **리뷰 작성 시 맛집 자동 등록**: DB에 없는 맛집이면 네이버 정보로 자동 생성 후 리뷰 연결
- 리뷰 수정/삭제 (작성자만)
- 리뷰 이미지 업로드 (Supabase Storage)
- 좋아요/싫어요 토글 (이미 누른 것 취소, 반대로 변경 가능)
- 코나카드 투표 (가능/불가, DB 트리거로 3표 이상 시 자동 상태 변경)

---

## Step 9: 지도 뷰

- 맛집 마커 표시, 클릭 시 InfoWindow (이름, 카테고리, 코나카드 상태)
- 맛집 목록 페이지에 리스트/지도 뷰 전환

---

## Step 10: 랜덤 룰렛

- 카테고리 필터 + 코나카드 필터
- CSS 애니메이션 기반 룰렛 회전
- 결과 → 맛집 상세 페이지 이동 링크

---

## Step 11: 마이페이지

- 내가 등록한 맛집 목록
- 내가 작성한 리뷰 목록
- 프로필 편집 (닉네임)

---

## 배포 전략

### 환경 분리

| 환경 | 브랜치 | Vercel | Supabase | 도메인 |
|------|--------|--------|----------|--------|
| **Production** | `main` | Production 배포 | 메인 DB | 커스텀 도메인 |
| **Development** | `develop` / PR | Preview 배포 | Preview Branch (자동) | `*.vercel.app` (자동) |

### Git 브랜칭
- `main` — 프로덕션. 직접 push 금지, PR merge만 허용
- `develop` — 개발 통합 브랜치. feature 브랜치에서 PR → develop 머지
- `feature/*` — 기능 개발 브랜치

### Supabase (Pro 플랜 + Branching)
- 하나의 Supabase 프로젝트로 dev/prod 통합 관리
- PR 생성 시 Preview Branch가 자동 생성 (임시 DB 인스턴스)
- PR 머지/닫기 시 Preview Branch 자동 삭제
- 스키마 변경은 마이그레이션 파일로 관리, PR 브랜치에서 자동 적용

### Vercel 환경변수
- **Production**: Supabase 메인 프로젝트 URL/Key, 실제 API 키
- **Preview**: Supabase Preview Branch URL/Key (Vercel + Supabase 통합 시 자동 주입)

### 커스텀 도메인
- Vercel Production 배포에 커스텀 도메인 연결
- DNS 설정 (A/CNAME 레코드 → Vercel)
- Supabase Auth redirect URL에 커스텀 도메인 추가

### 배포 흐름
```
feature/* → PR → develop (Vercel Preview + Supabase Preview Branch)
                     ↓ 검증 완료
               PR → main (Vercel Production + Supabase 메인 DB + 커스텀 도메인)
```

---

## 구현 순서 및 의존성

```
Step 1 (초기 세팅) ✅
  └→ Step 2 (DB 스키마) ✅
       └→ Step 3 (Supabase 연동)
            ├→ Step 4 (네이버 API 연동)
            └→ Step 5 (Google OAuth)
                 └→ Step 6 (레이아웃 + 홈)
                      └→ Step 7 (검색 + 맛집 상세) ← Step 4 필요
                           ├→ Step 8 (상호작용: 리뷰 + 맛집 자동 등록)
                           ├→ Step 9 (지도 뷰) ← Step 4 필요
                           └→ Step 10 (룰렛)
                                └→ Step 11 (마이페이지)
```
