# 배곱 - 데이터베이스 설계

## 테이블 구조

### profiles
Supabase Auth 연동. `auth.users` 가입 시 트리거로 자동 생성.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK, FK → auth.users) | Auth 유저 ID |
| email | text | 이메일 |
| nickname | text | 닉네임 (Google 이름 또는 이메일 앞부분) |
| avatar_url | text | 프로필 이미지 URL |
| created_at | timestamptz | 생성일 |

### restaurants
등록된 맛집 정보. 네이버 검색 API로 자동 채움.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | serial (PK) | |
| name | text (NOT NULL) | 맛집 이름 |
| category | text | 네이버 API 카테고리 문자열 (예: `음식점>한식`) |
| address | text (NOT NULL) | 도로명 주소 |
| postal_code | text | 우편번호 |
| lat / lng | double precision | 위도/경도 |
| naver_place_id | text (UNIQUE) | 네이버 장소 ID (중복 등록 방지) |
| description | text | 한줄 메모 |
| kona_card_status | text | `available` / `unavailable` / `unknown` |
| like_count | int | 좋아요 수 (반정규화, 트리거 동기화) |
| dislike_count | int | 싫어요 수 (반정규화, 트리거 동기화) |
| created_by | uuid (FK → profiles) | 등록자 |
| created_at / updated_at | timestamptz | 생성/수정일 |

### reviews
맛집 리뷰. 별점 필수, 내용과 이미지는 선택.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | serial (PK) | |
| restaurant_id | int (FK → restaurants) | 맛집 |
| user_id | uuid (FK → profiles) | 작성자 |
| rating | int (1~5, NOT NULL) | 별점 |
| content | text | 리뷰 내용 (선택) |
| created_at / updated_at | timestamptz | 생성/수정일 |

### review_images
리뷰 이미지. 1NF 정규화를 위해 분리. `display_order = 0`이 대표 썸네일.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | serial (PK) | |
| review_id | int (FK → reviews, CASCADE) | 리뷰 |
| url | text (NOT NULL) | 이미지 URL (Supabase Storage) |
| display_order | int (NOT NULL) | 표시 순서 (0 = 썸네일) |
| created_at | timestamptz | 생성일 |

### reactions
맛집 좋아요/싫어요. 유저당 맛집 1개만 (UNIQUE 제약).

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | serial (PK) | |
| restaurant_id | int (FK → restaurants) | 맛집 |
| user_id | uuid (FK → profiles) | 유저 |
| type | text | `like` / `dislike` |
| created_at | timestamptz | 생성일 |

### kona_card_votes
코나카드 사용 가능 여부 크라우드소싱 투표. 유저당 맛집 1표.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | serial (PK) | |
| restaurant_id | int (FK → restaurants) | 맛집 |
| user_id | uuid (FK → profiles) | 유저 |
| vote | text | `available` / `unavailable` |
| created_at | timestamptz | 생성일 |

### kona_postal_codes
코나카드 사용 가능 우편번호 목록 (시드 데이터).

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | serial (PK) | |
| postal_code | text (UNIQUE, NOT NULL) | 우편번호 |
| dong_name | text | 동 이름 |

### app_config
앱 설정 key-value 저장소. 코드 변경 없이 설정값 변경 가능.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| key | text (PK) | 설정 키 |
| value | text (NOT NULL) | 설정 값 |

현재 설정:
| key | value | 설명 |
|-----|-------|------|
| `kona_vote_threshold` | `3` | 코나카드 상태 자동 변경 최소 투표 수 |

---

## 트리거 & 함수

### 1. `handle_new_user()` — 프로필 자동 생성

| 항목 | 내용 |
|------|------|
| 트리거 | `on_auth_user_created` (AFTER INSERT on `auth.users`) |
| 동작 | Google OAuth 가입 시 `profiles`에 닉네임, 아바타 자동 복사 |
| 이유 | `auth.users`는 Supabase 내부 테이블이라 직접 조회/JOIN이 제한적. 앱에서 사용할 유저 정보를 `profiles`로 분리 |

### 2. `update_reaction_counts()` — 좋아요/싫어요 카운트 동기화

| 항목 | 내용 |
|------|------|
| 트리거 | `on_reaction_change` (AFTER INSERT/UPDATE/DELETE on `reactions`) |
| 동작 | `restaurants.like_count`, `dislike_count`를 실시간 갱신 |
| 이유 | 맛집 목록에서 매번 `COUNT(*)` 집계하면 느림. 반정규화된 카운트를 트리거로 동기화하여 조회 성능 확보 |

### 3. `check_kona_votes()` — 코나카드 상태 자동 변경

| 항목 | 내용 |
|------|------|
| 트리거 | `on_kona_vote_change` (AFTER INSERT/UPDATE/DELETE on `kona_card_votes`) |
| 동작 | 투표 수가 임계값 이상이고 한쪽이 더 많으면 `restaurants.kona_card_status` 자동 변경 |
| 임계값 | `app_config` 테이블의 `kona_vote_threshold` 값 (기본 3) |
| 이유 | 프론트에서 처리하면 동시성 문제 발생 가능. DB 레벨에서 데이터 정합성 보장 |

**임계값 변경 방법:**
```sql
update app_config set value = '5' where key = 'kona_vote_threshold';
```

### 4. `update_updated_at()` — 수정 시간 자동 갱신

| 항목 | 내용 |
|------|------|
| 트리거 | `set_restaurants_updated_at`, `set_reviews_updated_at` (BEFORE UPDATE) |
| 동작 | `updated_at`을 현재 시간으로 자동 설정 |
| 이유 | 프론트에서 누락할 수 없도록 DB 레벨에서 보장 |

---

## RLS 정책 요약

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| profiles | 모두 | (트리거) | 본인만 | - |
| restaurants | 모두 | 인증 유저 (created_by = 본인) | 등록자만 | 등록자만 |
| reviews | 모두 | 인증 유저 (user_id = 본인) | 작성자만 | 작성자만 |
| review_images | 모두 | 리뷰 작성자만 | - | 리뷰 작성자만 |
| reactions | 모두 | 인증 유저 (user_id = 본인) | 본인만 | 본인만 |
| kona_card_votes | 모두 | 인증 유저 (user_id = 본인) | 본인만 | 본인만 |
| kona_postal_codes | 모두 | - | - | - |
| app_config | 모두 | - | - | - |

---

## Storage

| 버킷 | 공개 | 설명 |
|------|------|------|
| `review-images` | O | 리뷰 이미지. 누구나 조회, 인증 유저 업로드, 본인 이미지만 삭제 |

---

## SQL 파일

| 파일 | 내용 |
|------|------|
| `supabase/001_schema.sql` | 테이블, 인덱스 |
| `supabase/002_rls.sql` | RLS 정책 |
| `supabase/003_functions.sql` | 함수, 트리거 |
| `supabase/004_storage.sql` | Storage 버킷 |
