# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**배곱 (Baegop)** — 사용자가 함께 만들어가는 회사 주변 장소 추천 웹 서비스. PRD는 `PRD.md` 참조.

## Commands

```bash
pnpm dev          # 개발 서버 실행
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버 실행
pnpm lint         # ESLint 실행
pnpm dlx shadcn@latest add <component>  # shadcn/ui 컴포넌트 추가
```

## Tech Stack

- **Next.js 16** (App Router, React 19, RSC)
- **Supabase** (PostgreSQL + Auth with Google OAuth + Storage)
- **Tailwind CSS v4** + **shadcn/ui** (New York style, neutral base)
- **Naver APIs** — Search API (Local, server-side proxy), Maps API (client-side)
- **pnpm** package manager

## Architecture

### Supabase Client Pattern
- `src/lib/supabase/client.ts` — 브라우저용 (Client Components)
- `src/lib/supabase/server.ts` — 서버용 (Server Components, Route Handlers)
- `src/lib/supabase/middleware.ts` — Auth 세션 갱신 + 보호 라우트 리다이렉트

### Auth & Protected Routes
미들웨어(`src/middleware.ts`)가 모든 요청에서 Supabase 세션을 갱신. 보호 라우트(`/mypage`)는 미인증 시 `/login`으로 리다이렉트.

### Naver Search API Proxy
네이버 검색 API는 서버사이드 Route Handler(`src/app/api/naver-search/route.ts`)를 통해 프록시. CORS 회피 + API 키 보호 목적.

### Category Handling
카테고리 테이블 없음. 네이버 API가 반환하는 카테고리 문자열(예: `"음식점>한식"`)을 `places.category`에 직접 저장.

### Kona Card Crowdsourcing
코나카드 결제 가능 여부는 등록자 입력 + 사용자 투표로 관리. 투표 임계값(`KONA_VOTE_THRESHOLD = 3`) 초과 시 상태 자동 변경.

## Key Files

- `src/types/index.ts` — 전체 TypeScript 타입 정의
- `src/lib/constants.ts` — 상수 (코나카드 라벨, 회사 좌표, 투표 임계값)
- `src/app/globals.css` — 테마 CSS 변수 (OKLch 컬러 스페이스)

## Conventions

- **언어**: 코드는 영어, UI 텍스트와 커밋 메시지는 한국어
- **Import alias**: `@/*` → `src/*`
- **컴포넌트**: 모든 UI 컴포넌트는 shadcn/ui를 우선 사용한다. shadcn/ui에 없는 경우에만 외부 라이브러리 또는 커스텀 컴포넌트를 사용한다. `src/components/ui/`에 위치.
- **className**: 조건부 클래스가 포함되면 템플릿 리터럴 대신 `cn()`을 사용한다. 삼항 연산자 대신 객체 구문을 사용한다. (`cn("base", { "class-a": condition, "class-b": !condition })`)
- **페이지 레이아웃**: 페이지 콘텐츠 영역은 `px-4 pt-4 pb-23`을 기본으로 사용한다. (`pb-23` = 바텀 네비 60px + 여백 32px). 지도 페이지는 예외로 `fixed inset-x-0 top-0 bottom-15`으로 전체 화면을 사용한다.
- **레이아웃 패딩은 페이지에서 처리**: 검색바(`pt-17`) 등 고정 요소의 오프셋 패딩은 공통 레이아웃이 아닌 각 페이지에서 직접 적용한다. 페이지별로 레이아웃을 커스텀하거나 독립적으로 변경할 수 있도록 한다.
- **브랜딩**: 프라이머리 컬러 오렌지/코랄 계열. 라임 계열 사용 금지 (크몽 컬러와 구분)
- **빈 상태 페이지**: 콘텐츠가 없는 화면(검색 전, 데이터 없음 등)은 `h-dvh` + `flex flex-col` + `flex-1`로 뷰포트 높이에 딱 맞춰 스크롤이 생기지 않게 한다.
- **서버 액션 단일 책임**: 서버 액션(`"use server"`)은 데이터 변경만 담당한다. `revalidatePath`/`revalidateTag` 등 캐시 무효화는 서버 액션 내부에 넣지 않고 호출하는 쪽에서 결정한다. 같은 페이지 갱신은 `router.refresh()`, 다른 페이지로 이동은 `router.back()`을 사용한다. `startTransition` 내에서 서버 액션의 `revalidatePath`와 `router.back()`이 함께 실행되면 히스토리가 오염될 수 있다.
- **UI와 로직 분리**: 커스텀 훅은 데이터 페칭/상태 관리 등 로직만 담당한다. IntersectionObserver, DOM 조작 등 UI 관심사는 훅에 포함하지 않고 사용하는 컴포넌트에서 처리한다.
- **쿼리 훅 분리**: React Query(`useQuery`, `useInfiniteQuery` 등) 로직은 항상 `use-*.ts` 커스텀 훅으로 분리한다. 컴포넌트에 직접 작성하지 않는다.
- **버튼 사이즈**: 모든 액션 버튼(BottomActionBar, 독립 액션 등)과 다이어로그 버튼은 `size="xl"`을 사용한다.
- **Empty 컴포넌트 패턴**: 빈 상태 UI는 반드시 아래 형태를 따른다. 아이콘은 `variant="icon"` + `size-12 rounded-none bg-transparent`, 내부 아이콘은 `size-12 text-primary`, 타이틀은 `font-bold`. 텍스트에 마침표를 사용하지 않는다.
  ```tsx
  <Empty className="border-none">
    <EmptyHeader className="gap-1">
      <EmptyMedia variant="icon" className="size-12 rounded-none bg-transparent">
        <Icon className="size-12 text-primary" />
      </EmptyMedia>
      <EmptyTitle className="font-bold">타이틀</EmptyTitle>
      <EmptyDescription>설명 텍스트</EmptyDescription>
    </EmptyHeader>
    {/* 액션이 필요한 경우에만 EmptyContent 추가 */}
    <EmptyContent>
      <Button>액션</Button>
    </EmptyContent>
  </Empty>
  ```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL           # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY      # Supabase anon key
NAVER_CLIENT_ID                    # 네이버 검색 API (서버 전용)
NAVER_CLIENT_SECRET                # 네이버 검색 API (서버 전용)
NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID   # 네이버 지도 API (클라이언트)
```
