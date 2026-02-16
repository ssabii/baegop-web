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

-- 2. places
create table places (
  id bigserial primary key,
  name text not null,
  category text,
  address text not null,
  postal_code text,
  lat double precision,
  lng double precision,
  naver_place_id text unique,
  description text,
  kona_card_status text default 'unknown' check (kona_card_status in ('available', 'unavailable', 'unknown')),
  like_count int default 0,
  dislike_count int default 0,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. kona_postal_codes (코나카드 사용가능 우편번호)
create table kona_postal_codes (
  id bigserial primary key,
  postal_code text not null unique,
  dong_name text
);

-- 4. kona_card_votes (코나카드 크라우드소싱 투표)
create table kona_card_votes (
  id bigserial primary key,
  place_id bigint references places(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  vote text not null check (vote in ('available', 'unavailable')),
  created_at timestamptz default now(),
  unique(place_id, user_id)
);

-- 5. reviews (리뷰)
create table reviews (
  id bigserial primary key,
  place_id bigint references places(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  rating int not null check (rating >= 1 and rating <= 5),
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. review_images (리뷰 이미지)
create table review_images (
  id bigserial primary key,
  review_id bigint references reviews(id) on delete cascade not null,
  url text not null,
  display_order int not null default 0,
  created_at timestamptz default now()
);

-- 7. reactions (좋아요/싫어요)
create table reactions (
  id bigserial primary key,
  place_id bigint references places(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  type text not null check (type in ('like', 'dislike')),
  created_at timestamptz default now(),
  unique(place_id, user_id)
);

-- 8. app_config (앱 설정)
create table app_config (
  key text primary key,
  value text not null
);

insert into app_config (key, value) values
  ('kona_vote_threshold', '3');

-- 9. place_menus (장소 메뉴)
create table place_menus (
  id bigserial primary key,
  place_id bigint references places(id) on delete cascade not null,
  name text not null,
  price text,
  description text,
  images text[],
  recommend boolean default false,
  priority int default 0,
  created_at timestamptz default now()
);

-- 인덱스
create index idx_places_category on places(category);
create index idx_places_kona_card_status on places(kona_card_status);
create index idx_places_created_by on places(created_by);
create index idx_reviews_place_id on reviews(place_id);
create index idx_reviews_user_id on reviews(user_id);
create index idx_review_images_review_id on review_images(review_id);
create index idx_reactions_place_id on reactions(place_id);
create index idx_kona_card_votes_place_id on kona_card_votes(place_id);
create index idx_place_menus_place_id on place_menus(place_id);
