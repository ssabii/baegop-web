-- ============================================
-- 배곱 (Baegop) Database Schema
-- Supabase SQL Editor에서 실행
-- ============================================

-- 1. profiles (Supabase Auth 연동)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  nickname text,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. places (telephone, naver_link는 네이버 API에서 실시간 조회)
create table places (
  id text primary key,
  name text not null,
  category text,
  address text not null,
  lat double precision,
  lng double precision,
  image_urls text[],
  kona_card_status text default 'unknown' check (kona_card_status in ('available', 'unavailable', 'unknown')),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. kona_card_votes (코나카드 크라우드소싱 투표)
create table kona_card_votes (
  id bigserial primary key,
  place_id text references places(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  vote text not null check (vote in ('available', 'unavailable')),
  created_at timestamptz default now(),
  unique(place_id, user_id)
);

-- 4. reviews (리뷰)
create table reviews (
  id bigserial primary key,
  place_id text references places(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete set null,
  rating int not null check (rating >= 1 and rating <= 5),
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. review_images (리뷰 이미지)
create table review_images (
  id bigserial primary key,
  review_id bigint references reviews(id) on delete cascade not null,
  url text not null,
  display_order int not null default 0,
  created_at timestamptz default now()
);

-- 6. app_config (앱 설정)
create table app_config (
  key text primary key,
  value text not null
);

insert into app_config (key, value) values
  ('kona_vote_threshold', '3');

-- 인덱스
create index idx_places_category on places(category);
create index idx_places_kona_card_status on places(kona_card_status);
create index idx_places_created_by on places(created_by);
create index idx_reviews_place_id on reviews(place_id);
create index idx_reviews_user_id on reviews(user_id);
create index idx_review_images_review_id on review_images(review_id);
create index idx_kona_card_votes_place_id on kona_card_votes(place_id);
