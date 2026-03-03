-- ============================================
-- 찜하기 (favorites) 테이블
-- ============================================

-- 1. 테이블 생성
create table favorites (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id text not null references places(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, place_id)
);

create index idx_favorites_user_id on favorites(user_id);
create index idx_favorites_place_id on favorites(place_id);

-- 2. RLS
alter table favorites enable row level security;

create policy "favorites: 본인 조회"
  on favorites for select
  using (auth.uid() = user_id);

create policy "favorites: 본인 추가"
  on favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites: 본인 삭제"
  on favorites for delete
  using (auth.uid() = user_id);
