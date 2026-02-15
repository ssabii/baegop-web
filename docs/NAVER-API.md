# 네이버 API 연동 가이드

## 환경변수

```env
# 네이버 검색 API (서버사이드 전용) — developers.naver.com에서 발급
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret

# 네이버 지도 API (클라이언트) — console.ncloud.com에서 발급
NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID=your_ncp_key_id
```

## API 키 발급

### 1. 검색 API (네이버 개발자센터)

1. https://developers.naver.com 접속 → 로그인
2. **Application → 애플리케이션 등록**
3. 애플리케이션 이름 입력, **사용 API**에서 **검색** 체크
4. **비로그인 오픈 API 서비스 환경** → WEB 설정 → `http://localhost:3000`
5. 등록 후 Client ID / Client Secret 확인

### 2. 지도 API (네이버 클라우드 플랫폼)

1. https://console.ncloud.com 접속 → 로그인
2. **Services → AI·NAVER API** → **Application 등록**
3. API 선택에서 **Dynamic Map** 체크
4. 서비스 환경 → Web 서비스 URL에 `http://localhost:3000` 추가
5. 등록 후 Client ID (= `ncpKeyId`) 확인

> **참고**: 키 발급 후 반영까지 수 분 걸릴 수 있음

---

## 검색 API (`/api/naver-search`)

서버사이드 Route Handler를 통해 네이버 Local Search API를 프록시한다. CORS 회피 + API 키 보호 목적.

### 파일

`src/app/api/naver-search/route.ts`

### 사용법

```
GET /api/naver-search?query=역삼맛집
```

### 응답

`NaverSearchResult[]` (타입: `src/types/index.ts`)

```json
[
  {
    "title": "<b>역삼</b> 맛집",
    "link": "https://...",
    "category": "음식점>한식",
    "description": "",
    "telephone": "",
    "address": "서울특별시 강남구 역삼동 ...",
    "roadAddress": "서울특별시 강남구 테헤란로 ...",
    "mapx": "1270268075",
    "mapy": "374924644"
  }
]
```

> **참고**: `title`에 HTML 태그(`<b>`)가 포함되어 있으므로 렌더링 시 strip 처리 필요

### 클라이언트에서 호출 예시

```tsx
const res = await fetch(`/api/naver-search?query=${encodeURIComponent(query)}`);
const results: NaverSearchResult[] = await res.json();
```

---

## 지도 컴포넌트 (`NaverMap`)

Naver Maps JS API v3를 동적으로 로딩하여 지도를 렌더링하는 Client Component.

### 파일

`src/components/naver-map.tsx`

### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `center` | `{ lat: number; lng: number }` | `COMPANY_LOCATION` (크몽 사무실) | 지도 중심 좌표 |
| `zoom` | `number` | `15` | 줌 레벨 (1~21) |
| `markers` | `{ lat: number; lng: number; title?: string }[]` | `[]` | 마커 목록 |
| `className` | `string` | — | 컨테이너 CSS 클래스 |

### 기본 사용법

```tsx
import NaverMap from "@/components/naver-map";

// 크몽 사무실 중심, 기본 줌
<NaverMap className="h-[400px] w-full" />
```

### 마커 표시

```tsx
<NaverMap
  className="h-full w-full"
  markers={[{ lat: 37.4924644, lng: 127.0268075, title: "크몽" }]}
  zoom={16}
/>
```

### 전체 화면 지도

```tsx
<div className="h-screen w-screen">
  <NaverMap
    className="h-full w-full"
    markers={[{ lat: 37.4924644, lng: 127.0268075, title: "크몽" }]}
    zoom={16}
  />
</div>
```

### 커스텀 중심 좌표

```tsx
<NaverMap
  center={{ lat: 37.5665, lng: 126.9780 }}
  zoom={14}
  className="h-[500px] w-full"
/>
```

### 주의사항

- **부모 요소에 높이 필수**: `NaverMap`은 `h-full`로 부모 높이를 따르므로, 부모에 명시적 높이(`h-screen`, `h-[400px]` 등)가 있어야 지도가 보인다.
- **API 키 미설정 시**: 에러 메시지가 컴포넌트 내부에 표시된다.
- **Server Component에서 사용 가능**: `NaverMap`이 `"use client"` 컴포넌트이므로 Server Component에서 import하여 props만 전달하면 된다.

---

## 네이버 좌표계 변환

네이버 검색 API의 `mapx`/`mapy`는 **카텍(KATEC) 좌표**이며, 네이버 지도 API는 **WGS84 (위경도)**를 사용한다.

- `mapx`: 경도 × 10^7 (예: `1270268075` → `127.0268075`)
- `mapy`: 위도 × 10^7 (예: `374924644` → `37.4924644`)

변환 공식:

```ts
const lat = Number(mapy) / 10_000_000;
const lng = Number(mapx) / 10_000_000;
```
