# 네이버 API 연동 가이드

## 아키텍처 개요

네이버 API는 두 가지 경로로 사용한다:

1. **네이버 플레이스 GraphQL API** (비공식) — 장소 검색 및 상세 정보 조회
2. **네이버 지도 JS API** (공식) — 클라이언트 지도 렌더링

```
클라이언트 (브라우저)
  │
  ├─ /api/naver-search ──→ lib/search.ts ──→ GraphQL (getPlaces)
  │   └─ 자동완성용 프록시
  │
  ├─ lib/naver.ts (서버 컴포넌트에서 직접 호출)
  │   ├─ fetchPlaceDetail() ──→ GraphQL (getPlaceDetail)  ← Tier 1
  │   └─ fetchPlaceBySearch() ──→ GraphQL (getPlaces)     ← Tier 2 폴백
  │
  └─ NaverMap 컴포넌트 ──→ Naver Maps JS API v3
```

### 파일 구조

| 파일 | 용도 |
|------|------|
| `src/lib/search.ts` | `getPlaces` GraphQL 쿼리 (5분 캐시) |
| `src/lib/naver.ts` | 장소 상세 조회 + 폴백 로직, 링크 빌더 |
| `src/app/api/naver-search/route.ts` | 클라이언트 자동완성용 프록시 (`search.ts` 재사용) |
| `src/components/naver-map.tsx` | 네이버 지도 클라이언트 컴포넌트 |

---

## 환경변수

```env
# 네이버 지도 API (클라이언트) — console.ncloud.com에서 발급
NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID=your_ncp_key_id
```

> 검색 API 키(`NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`)는 backfill 스크립트에서만 사용. 장소 검색은 GraphQL API로 대체되어 키 없이 동작한다.

---

## 네이버 플레이스 GraphQL API

비공식 API. 네이버 플레이스 모바일 웹이 내부적으로 사용하는 GraphQL 엔드포인트.

### 엔드포인트

```
POST https://pcmap-api.place.naver.com/place/graphql
```

### 필수 헤더

```ts
{
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) ...",
  "Referer": "https://m.place.naver.com/",
  "Origin": "https://m.place.naver.com"
}
```

### 요청 형식

배열로 감싸서 전송한다 (batch 형태):

```json
[{
  "operationName": "getPlaces",
  "variables": { "input": { ... } },
  "query": "query getPlaces(...) { ... }"
}]
```

응답도 배열: `json[0].data.places.items`

---

### 쿼리 1: `getPlaces` (장소 검색)

**사용처:** `src/lib/search.ts`, `src/app/api/naver-search/route.ts`

```graphql
query getPlaces($input: PlacesInput!) {
  places(input: $input) {
    items {
      id name category address roadAddress
      phone x y imageUrl menus
    }
  }
}
```

**Variables:**

```json
{ "input": { "query": "강남 맛집", "display": 10, "start": 1 } }
```

**반환 필드:**

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 네이버 플레이스 ID |
| `name` | string | 장소명 |
| `category` | string | 카테고리 (예: `"육류,고기요리"`) |
| `address` | string | 지번 주소 |
| `roadAddress` | string | 도로명 주소 |
| `phone` | string | 전화번호 |
| `x` | string | 경도 (longitude) |
| `y` | string | 위도 (latitude) |
| `imageUrl` | string | 대표 이미지 URL (1장) |
| `menus` | string[] | 메뉴 목록 (`"메뉴명 가격"` 형식) |

---

### 쿼리 2: `getPlaceDetail` (장소 상세)

**사용처:** `src/lib/naver.ts` → `fetchPlaceDetail()`

```graphql
query getPlaceDetail($input: PlaceDetailInput!) {
  placeDetail(input: $input) {
    base { id name address roadAddress phone category coordinate { x y } }
    images { images { origin } }
    menus { name price images description recommend }
  }
}
```

**Variables:**

```json
{ "input": { "id": "1234567890" } }
```

**반환 구조:**

| 경로 | 설명 |
|------|------|
| `base.*` | 기본 정보 (이름, 주소, 전화, 카테고리, 좌표) |
| `images.images[].origin` | 이미지 URL 배열 (최대 10장 사용) |
| `menus[].name/price/images/description/recommend` | 메뉴 상세 (이름, 가격, 이미지, 설명, 추천 여부) |

---

### 장소 상세 조회 폴백 전략

`fetchPlaceDetailWithFallback()` (`src/lib/naver.ts`)

```
Tier 1: fetchPlaceDetail(placeId)
  └─ getPlaceDetail GraphQL → 풍부한 데이터 (이미지 10장, 메뉴 상세)

Tier 2: fetchPlaceBySearch(placeId, placeName)
  └─ getPlaces GraphQL → 제한적 (이미지 1장, 메뉴 이름만)

Tier 3: DB 폴백 (page.tsx에서 처리)
  └─ Supabase places 테이블 데이터로 구성
```

---

### 사용 가능한 추가 필드 (PlaceDetail)

`getPlaceDetail` 쿼리에서 현재 사용하지 않지만 가져올 수 있는 필드들. (2026-02 기준 테스트 완료)

#### 데이터 반환 확인

| 필드 | 타입 | 반환 예시 |
|------|------|-----------|
| `keywords` | scalar (string[]) | `["삼겹살", "한우", "고깃집", "돼지갈비"]` |
| `description` | scalar (string) | `"숯불갈비명가 국보가든"` |
| `visitorReviews` | object | 방문자 리뷰 목록 (아래 참조) |
| `hasCoupon` | scalar | 쿠폰 존재 여부 |
| `nPayPromotion` | object | N페이 프로모션 (해당 시 데이터 반환) |

#### `visitorReviews` 구조

```graphql
visitorReviews {
  items {
    body      # 리뷰 본문
    rating    # 별점 (null인 경우 많음)
    created   # 작성일 (예: "2.15.일")
    tags      # 태그
  }
}
```

#### 존재하지만 하위 필드 탐색 필요

| 필드 | 타입명 | 설명 |
|------|--------|------|
| `naverBooking` | PlaceDetailNaverBooking | 네이버 예약 |
| `shopWindow` | ShopWindow | 쇼핑윈도 (total, url 확인) |
| `businessHours` | BusinessHour | 영업시간 |
| `businessStats` | 미확인 | 비즈니스 통계 |
| `businessTools` | 미확인 | 비즈니스 도구 |
| `visitorReviewStats` | VisitorReviewStatsResult | 리뷰 통계 (id만 확인) |
| `visitorReviewPhotos` | PhotoViewerResult | 리뷰 사진 (하위 필드 미확인) |
| `fsasReviews` | 미확인 | 예약자 리뷰 |
| `jto` | Jto | 미확인 (link 필드 존재) |
| `POS` | POS | POS 정보 |
| `exp` | EventSearchBusinessResult | 이벤트 (total 필드 존재) |
| `hotel` | Naverhotel3 | 호텔 정보 |
| `cesco` | Cesco | 세스코 인증 |

#### 존재하지 않는 필드 (테스트 완료)

소식(뉴스/피드) 관련: `news`, `feed`, `notice`, `notices`, `blog`, `blogPosts`, `ownerNotice`, `ownerNews`, `placeNotice`, `timeline`, `businessPhotos`, `photoList`, `newsList` — **모두 PlaceDetail에 없음.**

> 소식 데이터는 네이버 플레이스 웹이 다른 내부 API 엔드포인트에서 가져오는 것으로 추정. `pcmap-api.place.naver.com/place/graphql`에서는 제공하지 않음.

---

### GraphQL 필드 탐색 방법

Introspection이 비활성화되어 있으므로, 존재하지 않는 필드를 요청하면 에러 메시지의 "Did you mean..." 힌트를 활용한다:

```bash
# 1. 요청 파일 작성
cat > /tmp/probe.json << 'EOF'
[{"operationName":"getPlaceDetail","variables":{"input":{"id":"PLACE_ID"}},"query":"query getPlaceDetail($input:PlaceDetailInput!){placeDetail(input:$input){필드명}}"}]
EOF

# 2. 요청
curl -s -X POST "https://pcmap-api.place.naver.com/place/graphql" \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" \
  -H "Referer: https://m.place.naver.com/" \
  -H "Origin: https://m.place.naver.com" \
  -d @/tmp/probe.json

# 3. 에러 응답 확인
# "Did you mean \"businessHours\", \"businessStats\"?" → 유사 필드 힌트
# "must have a selection of subfields" → 필드 존재, 하위 필드 필요
```

---

## 검색 API 프록시 (`/api/naver-search`)

클라이언트에서 GraphQL API를 직접 호출하면 CORS 에러가 발생하므로, Route Handler로 프록시한다. 내부적으로 `lib/search.ts`의 `searchPlaces()`를 재사용.

### 사용처

`src/components/place-search/use-place-suggestions.ts` — 검색창 자동완성 (300ms 디바운스, 2글자 이상)

### 사용법

```
GET /api/naver-search?query=역삼맛집&display=5
```

### 응답

`NaverSearchResult[]` (`src/types/index.ts`)

---

## 지도 컴포넌트 (`NaverMap`)

Naver Maps JS API v3를 동적으로 로딩하여 지도를 렌더링하는 Client Component.

### 파일

`src/components/naver-map.tsx`

### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `center` | `{ lat: number; lng: number }` | `COMPANY_LOCATION` | 지도 중심 좌표 |
| `zoom` | `number` | `15` | 줌 레벨 (1~21) |
| `markers` | `Marker[]` | `[]` | 마커 목록 |
| `className` | `string` | — | 컨테이너 CSS 클래스 |

```ts
interface Marker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  category?: string | null;
}
```

### 사용법

```tsx
import NaverMap from "@/components/naver-map";

<NaverMap className="h-[400px] w-full" />

<NaverMap
  markers={[{ id: "1", lat: 37.492, lng: 127.026, title: "크몽" }]}
  zoom={16}
  className="h-full w-full"
/>
```

### 주의사항

- 부모 요소에 명시적 높이 필수 (`h-screen`, `h-[400px]` 등)
- 다크모드 자동 지원 (useTheme 연동)

---

## API 키 발급

### 지도 API (네이버 클라우드 플랫폼)

1. https://console.ncloud.com 접속 → 로그인
2. **Services → AI·NAVER API** → **Application 등록**
3. API 선택에서 **Dynamic Map** 체크
4. 서비스 환경 → Web 서비스 URL에 `http://localhost:3000` 추가
5. 등록 후 Client ID (= `ncpKeyId`) 확인

> 키 발급 후 반영까지 수 분 걸릴 수 있음
