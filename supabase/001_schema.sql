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

-- 2. restaurants
create table restaurants (
  id serial primary key,
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
  id serial primary key,
  postal_code text not null unique,
  dong_name text
);

-- 4. kona_card_votes (코나카드 크라우드소싱 투표)
create table kona_card_votes (
  id serial primary key,
  restaurant_id int references restaurants(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  vote text not null check (vote in ('available', 'unavailable')),
  created_at timestamptz default now(),
  unique(restaurant_id, user_id)
);

-- 5. reviews (리뷰)
create table reviews (
  id serial primary key,
  restaurant_id int references restaurants(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  rating int not null check (rating >= 1 and rating <= 5),
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. review_images (리뷰 이미지)
create table review_images (
  id serial primary key,
  review_id int references reviews(id) on delete cascade not null,
  url text not null,
  display_order int not null default 0,
  created_at timestamptz default now()
);

-- 7. reactions (좋아요/싫어요)
create table reactions (
  id serial primary key,
  restaurant_id int references restaurants(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  type text not null check (type in ('like', 'dislike')),
  created_at timestamptz default now(),
  unique(restaurant_id, user_id)
);

-- 8. app_config (앱 설정)
create table app_config (
  key text primary key,
  value text not null
);

insert into app_config (key, value) values
  ('kona_vote_threshold', '3');

-- 인덱스
create index idx_restaurants_category on restaurants(category);
create index idx_restaurants_kona_card_status on restaurants(kona_card_status);
create index idx_restaurants_created_by on restaurants(created_by);
create index idx_reviews_restaurant_id on reviews(restaurant_id);
create index idx_reviews_user_id on reviews(user_id);
create index idx_review_images_review_id on review_images(review_id);
create index idx_reactions_restaurant_id on reactions(restaurant_id);
create index idx_kona_card_votes_restaurant_id on kona_card_votes(restaurant_id);
