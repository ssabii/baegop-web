# 배곱 (Baegop)

회사 맛집 장소 추천 서비스

## 기술 스택

- **Next.js 16** (App Router, React 19, RSC)
- **Supabase** — PostgreSQL + Auth(소셜 로그인: Google · 카카오 · 네이버) + Storage
- **Tailwind CSS v4** + **shadcn/ui** (New York 스타일, neutral 베이스)
- **React Query** (`@tanstack/react-query`) — 서버 상태 관리
- **Naver APIs** — 검색 API(Local, 서버사이드 프록시), 지도 API(클라이언트)
- **pnpm** — 패키지 매니저
- **Vitest** — 테스트

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 채웁니다.

```bash
NEXT_PUBLIC_SUPABASE_URL           # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY      # Supabase anon key
NAVER_CLIENT_ID                    # 네이버 검색 API (서버 전용)
NAVER_CLIENT_SECRET                # 네이버 검색 API (서버 전용)
NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID   # 네이버 지도 API (클라이언트)
SUPABASE_SERVICE_ROLE_KEY          # Supabase 관리자 (서버 전용, 회원탈퇴 등)
NEXT_PUBLIC_GA_MEASUREMENT_ID      # Google Analytics
```

### 3. 개발 서버 실행

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 명령어

```bash
pnpm dev          # 개발 서버 실행
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버 실행
pnpm lint         # ESLint 실행
pnpm test         # 테스트 실행 (Vitest)
pnpm test:watch   # 테스트 watch 모드
pnpm db:types     # Supabase 타입 재생성 (src/types/database.ts)

pnpm dlx shadcn@latest add <component>  # shadcn/ui 컴포넌트 추가
```

## 프로젝트 구조

```
src/
├─ app/
│  ├─ (main)/         # 공개 라우트 (홈, 검색, 지도 등) — 바텀 네비게이션 레이아웃
│  ├─ (sub)/          # 보호 라우트 (마이페이지, 장소 상세 등) — 서브 헤더 레이아웃
│  └─ api/            # Route Handlers (네이버 검색 프록시, 랭킹, 즐겨찾기 등)
├─ components/        # UI 컴포넌트 (ui/ 는 shadcn/ui)
├─ hooks/             # 공용 커스텀 훅
├─ lib/               # 유틸, Supabase 클라이언트, 쿼리, 상수
├─ providers/         # QueryClient, Theme 등 전역 프로바이더
└─ types/             # 타입 정의 (database.ts 는 Supabase 자동 생성)
```

- **Supabase 클라이언트**: 브라우저용(`lib/supabase/client.ts`), 서버용(`lib/supabase/server.ts`), 미들웨어(`lib/supabase/middleware.ts`)로 분리
- **인증**: 미들웨어가 모든 요청에서 세션을 갱신하고, 보호 라우트(`/mypage`)는 미인증 시 `/signin`으로 리다이렉트
- **네이버 검색 API**: 서버사이드 Route Handler(`api/naver-search`)로 프록시해 CORS 회피 + API 키 보호

프로젝트 규칙과 아키텍처 상세는 [`CLAUDE.md`](./CLAUDE.md)를 참고하세요.

## Git 워크플로우

- feature 브랜치 → `develop` → `main`
- `main`은 완성된 기능만 머지하며, 릴리즈 PR 머지 시 GitHub Release + 태그가 자동 생성됩니다.

## 배포

[Vercel](https://vercel.com)에 배포됩니다.
