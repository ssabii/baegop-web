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
- **컴포넌트**: shadcn/ui 기반, `src/components/ui/`에 위치
- **브랜딩**: 프라이머리 컬러 오렌지/코랄 계열. 라임 계열 사용 금지 (크몽 컬러와 구분)

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL           # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY      # Supabase anon key
NAVER_CLIENT_ID                    # 네이버 검색 API (서버 전용)
NAVER_CLIENT_SECRET                # 네이버 검색 API (서버 전용)
NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID   # 네이버 지도 API (클라이언트)
```
